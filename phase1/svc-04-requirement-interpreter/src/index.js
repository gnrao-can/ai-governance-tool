/**
 * AI Governance Tool - SVC-04: Requirement Interpreter (C-07)
 *
 * Phase 1 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Component C-07):
 *   Draft obligations and control mappings from new or changed governance
 *   sources, with clause citations; uses in-tenant LLM (C-19); drafts are
 *   subject to human approval before publish (D-02).
 *
 * Interface (I-05): Governance library API - REST, OSCAL JSON (catalog, profile).
 *
 * Phase 1 demo basis: in-memory draft store (production: OSCAL tooling + in-tenant
 * LLM orchestration per Architecture section 8 and Phase 0 DATA-1).
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8081;

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

const drafts = new Map;

const STATES = ['draft', 'approved', 'rejected'];

function makeDraft(body) {
  const type = body.type || 'obligation';
  const isControlMapping = type === 'controlMapping';
  const e = {
    id: uuidv4(),
    kind: isControlMapping ? 'controlMapping' : 'obligation',
    type: type,
    version: '1.0.0',
    status: 'draft',
    sourceId: body.sourceId || uuidv4(),
    source: body.source || {},
    citations: body.citations || [],
    draft: {
      obligations: body.obligations || [],
      controlMappings: body.controlMappings || [],
      rationale: body.rationale || '',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return e;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'svc-04-requirement-interpreter', component: 'C-07' });
});

app.post('/api/v1/governance/drafts', (req, res) => {
  const d = makeDraft(req.body || {});
  drafts.set(d.id, d);
  res.status(201).json(d);
});

app.get('/api/v1/governance/drafts', (req, res) => {
  res.json({ items: Array.from(drafts.values()) });
});

app.get('/api/v1/governance/drafts/:id', (req, res) => {
  const d = drafts.get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not Found' });
  res.json(d);
});

app.put('/api/v1/governance/drafts/:id', (req, res) => {
  const d = drafts.get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not Found' });
  Object.assign(d, req.body || {});
  d.updatedAt = new Date().toISOString();
  res.json(d);
});

app.delete('/api/v1/governance/drafts/:id', (req, res) => {
  if (!drafts.delete(req.params.id)) return res.status(404).json({ error: 'Not Found' });
  res.status(204).end();
});

app.post('/api/v1/governance/drafts/:id/approve', (req, res) => {
  const d = drafts.get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not Found' });
  if (d.status !== 'draft') return res.status(409).json({ error: 'Only draft items can be approved' });
  d.status = 'approved';
  d.updatedAt = new Date().toISOString();
  res.json(d);
});

app.post('/api/v1/governance/drafts/:id/reject', (req, res) => {
  const d = drafts.get(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not Found' });
  if (d.status !== 'draft') return res.status(409).json({ error: 'Only draft items can be rejected' });
  d.status = 'rejected';
  d.updatedAt = new Date().toISOString();
  res.json(d);
});

app.get('/api/v1/governance', (req, res) => {
  res.json({ ok: true, interfaces: ['I-05'], components: ['C-06', 'C-07'] });
});

app.listen(PORT, () => {
  console.log('SVC-04 Requirement Interpreter (C-07) listening on :' + PORT);
});
