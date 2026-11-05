/**
 * AI Governance Tool - SVC-06: Assessment Engine (C-09)
 *
 * Phase 1 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Component C-09):
 *   Applicability, control evaluation, five-state results (Met / Partially met /
 *   Not met / Not applicable / Unable to determine), explanations, confidence,
 *   LLM evidence review (flagged), and finding links.
 *
 * Interface: internal service (I-05 governance library API adjacency via C-06/C-13).
 *
 * Phase 1 demo basis: in-memory findings store (production: assessment engine,
 * Open Policy Agent, LLM evidence review, finding store per Architecture section 5/8
 * and Phase 0 DATA-1).
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8083;

const DEMO_BEARER_TOKEN = process.env.DEMO_BEARER_TOKEN || 'phase1-demo-token';

const authRequired = async (req, res, next) => {
  const h = req.headers.authorization || '';
  if (!h || !h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized', message: 'Bearer token required' });
  }
  const token = h.slice(7).trim();
  if (!process.env.OIDC_ISSUER) {
    if (token === DEMO_BEARER_TOKEN) { return next(); }
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid token' });
  }
  try {
    const { createRemoteJWKSet, jwtVerify } = require('jose');
    const jwks = createRemoteJWKSet(new URL(process.env.OIDC_ISSUER));
    const { payload } = await jwtVerify(token, jwks, { issuer: process.env.OIDC_ISSUER, audience: process.env.OIDC_CLIENT_ID });
    req.user = payload;
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid or expired token' });
  }
  next();
};

const RBAC_ALLOWED_ROLES = (process.env.RBAC_ALLOWED_ROLES || 'Author,Reviewer,Approver,Operator').split(',').map((s) => s.trim()).filter(Boolean);

function requireRbac(req, res, next) {
  if (!process.env.OIDC_ISSUER) { return next(); }
  const roles = (req && req.user && req.user.roles) || [];
  const allowed = roles.some((r) => RBAC_ALLOWED_ROLES.includes(r));
  if (!allowed) { return res.status(403).json({ error: 'forbidden', message: 'Insufficient role for this operation' }); }
  next();
}

app.use('/api/v1', authRequired, requireRbac);

const findings = new Map();

const STATES = ['Met', 'Partially met', 'Not met', 'Not applicable', 'Unable to determine'];
const CONFIDENCE_FLOOR = 0.7;
const MAX_CONFIDENCE = 0.95;

function makeFinding(body) {
  const b = body || {};
  const state = STATES.indexOf(b.state) >= 0 ? b.state : 'Unable to determine';
  let confidence = typeof b.confidence === 'number' ? Math.min(b.confidence, MAX_CONFIDENCE) : 0;
  const llmEvidenceReview = { flagged: false, reason: 'ok', reviewed: false };
  let finalState = state;
  if (confidence < CONFIDENCE_FLOOR) {
    finalState = 'Unable to determine';
    llmEvidenceReview.flagged = true;
    llmEvidenceReview.reason = 'confidence below floor; human review required';
  }
  return {
    id: uuidv4(),
    kind: 'finding',
    state: finalState,
    confidence: confidence,
    systemId: b.systemId || null,
    controlId: b.controlId || null,
    requirement: b.requirement || null,
    evidence: b.evidence || [],
    explanation: b.explanation || null,
    llmEvidenceReview: llmEvidenceReview,
    createdAt: new Date().toISOString(),
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'svc-06-assessment-engine', component: 'C-09' });
});

app.post('/api/v1/assessments/findings', (req, res) => {
  const f = makeFinding(req.body || {});
  findings.set(f.id, f);
  res.status(201).json(f);
});

app.get('/api/v1/assessments/findings', (req, res) => {
  res.json({ items: Array.from(findings.values()) });
});

app.get('/api/v1/assessments/findings/:id', (req, res) => {
  const f = findings.get(req.params.id);
  if (!f) return res.status(404).json({ error: 'Not Found' });
  res.json(f);
});

app.put('/api/v1/assessments/findings/:id', (req, res) => {
  const f = findings.get(req.params.id);
  if (!f) return res.status(404).json({ error: 'Not Found' });
  Object.assign(f, req.body || {});
  f.updatedAt = new Date().toISOString();
  res.json(f);
});

app.delete('/api/v1/assessments/findings/:id', (req, res) => {
  if (!findings.delete(req.params.id)) return res.status(404).json({ error: 'Not Found' });
  res.status(204).end();
});

app.get('/api/v1/assessments', (req, res) => {
  res.json({ ok: true, interfaces: [], components: ['C-09'] });
});

app.listen(PORT, () => {
  console.log('SVC-06 Assessment Engine (C-09) listening on :' + PORT);
});
