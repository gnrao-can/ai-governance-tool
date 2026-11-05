/**
 * AI Governance Tool - SVC-08: Remediation Recommender (C-11)
 *
 * Phase 2 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Component C-11):
 *   Draft remediation actions for unmet controls; uses in-tenant LLM (C-19);
 *   reviewer acceptance required before ticket (D-02).
 *
 * Interface: internal service (I-05/I-06 governance library API adjacency via
 * C-06/C-15).
 *
 * Phase 2 demo basis: in-memory remediation store (production: remediation
 * recommender, workflow, and ticketing connectors per Architecture §5/§6/§7 and
 * Phase 0 DATA-1).
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8091;

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

const remediations = new Map();

function makeRemediation(body) {
  const status = body.status || 'draft';
  return {
    id: uuidv4(),
    kind: 'remediation',
    status: status, // draft | accepted | rejected
    findingId: body.findingId || null,
    action: body.action || null,
    evidence: body.evidence || [],
    owner: body.owner || null,
    ticketRef: body.ticketRef || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'svc-08-remediation-recommender', component: 'C-11' });
});

app.post('/api/v1/remediations', (req, res) => {
  const r = makeRemediation(req.body || {});
  remediations.set(r.id, r);
  res.status(201).json(r);
});

app.get('/api/v1/remediations', (req, res) => {
  res.json({ items: Array.from(remediations.values()) });
});

app.get('/api/v1/remediations/:id', (req, res) => {
  const r = remediations.get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not Found' });
  res.json(r);
});

app.put('/api/v1/remediations/:id', (req, res) => {
  const r = remediations.get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not Found' });
  Object.assign(r, req.body || {});
  r.updatedAt = new Date().toISOString();
  remediations.set(req.params.id, r);
  res.json(r);
});

// Reviewer acceptance (D-02): accepted remediation opens ticket via I-09/I-10.
app.post('/api/v1/remediations/:id/accept', (req, res) => {
  const r = remediations.get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not Found' });
  if (r.status !== 'draft') return res.status(409).json({ error: 'Only draft remediations can be accepted' });
  r.status = 'accepted';
  r.ticketRef = (req.body && req.body.ticketRef) || 'TKT-' + uuidv4().slice(0, 8);
  r.updatedAt = new Date().toISOString();
  remediations.set(req.params.id, r);
  res.json(r);
});

app.post('/api/v1/remediations/:id/reject', (req, res) => {
  const r = remediations.get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not Found' });
  if (r.status !== 'draft') return res.status(409).json({ error: 'Only draft remediations can be rejected' });
  r.status = 'rejected';
  r.updatedAt = new Date().toISOString();
  remediations.set(req.params.id, r);
  res.json(r);
});

app.get('/api/v1/remediations', (req, res) => {
  res.json({ ok: true, interfaces: ['I-05', 'I-06'], components: ['C-11'] });
});

app.listen(PORT, () => {
  console.log('SVC-08 Remediation Recommender (C-11) listening on :' + PORT);
});
