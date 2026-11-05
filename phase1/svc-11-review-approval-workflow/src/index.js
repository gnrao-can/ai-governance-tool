/**
 * AI Governance Tool - SVC-11: Review and Approval Workflow (C-15)
 *
 * Phase 2 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Component C-15):
 *   Review tasks, approvals, exceptions, attestations, separation of duties.
 *
 * Interface: internal service (I-05/I-06 governance library API adjacency via
 * C-06/C-13/C-16).
 *
 * Phase 2 demo basis: in-memory workflow store (production: BPMN workflow
 * engine, exceptions, attestations, separation of duties per Architecture §5/§9
 * and Phase 0 DATA-1).
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8094;

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

const workflows = new Map();

function makeWorkflow(body) {
  return {
    id: uuidv4(),
    kind: 'workflow',
    status: body.status || 'pending', // pending | approved | rejected | exception
    findingId: body.findingId || null,
    actions: body.actions || [],
    exceptions: body.exceptions || [],
    attestations: body.attestations || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'svc-11-review-approval-workflow', component: 'C-15' });
});

app.post('/api/v1/workflows', (req, res) => {
  const w = makeWorkflow(req.body || {});
  workflows.set(w.id, w);
  res.status(201).json(w);
});

app.get('/api/v1/workflows', (req, res) => {
  res.json({ items: Array.from(workflows.values()) });
});

app.get('/api/v1/workflows/:id', (req, res) => {
  const w = workflows.get(req.params.id);
  if (!w) return res.status(404).json({ error: 'Not Found' });
  res.json(w);
});

app.put('/api/v1/workflows/:id', (req, res) => {
  const w = workflows.get(req.params.id);
  if (!w) return res.status(404).json({ error: 'Not Found' });
  Object.assign(w, req.body || {});
  w.updatedAt = new Date().toISOString();
  workflows.set(req.params.id, w);
  res.json(w);
});

// Approve/reject a review task; exceptions path.
app.post('/api/v1/workflows/:id/approve', (req, res) => {
  const w = workflows.get(req.params.id);
  if (!w) return res.status(404).json({ error: 'Not Found' });
  w.status = 'approved';
  w.updatedAt = new Date().toISOString();
  res.json(w);
});

app.post('/api/v1/workflows/:id/reject', (req, res) => {
  const w = workflows.get(req.params.id);
  if (!w) return res.status(404).json({ error: 'Not Found' });
  w.status = 'rejected';
  w.updatedAt = new Date().toISOString();
  res.json(w);
});

app.post('/api/v1/workflows/:id/exception', (req, res) => {
  const w = workflows.get(req.params.id);
  if (!w) return res.status(404).json({ error: 'Not Found' });
  w.status = 'exception';
  w.exceptions = w.exceptions || [];
  w.exceptions.push(req.body || {});
  w.updatedAt = new Date().toISOString();
  res.json(w);
});

app.get('/api/v1/workflows', (req, res) => {
  res.json({ ok: true, interfaces: ['I-05', 'I-06'], components: ['C-15'] });
});

app.listen(PORT, () => {
  console.log('SVC-11 Review and Approval Workflow (C-15) listening on :' + PORT);
});
