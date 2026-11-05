/**
 * AI Governance Tool - SVC-12: Reporting and Export (C-17)
 *
 * Phase 2 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Component C-17):
 *   Reporting/export (dashboards, bilingual reports, OSCAL, bulk).
 *
 * Interface: internal service (I-06 assessment results API adjacency via C-17/I-13).
 *
 * Phase 2 demo basis: in-memory report/export store (production: dashboards,
 * bilingual reports, OSCAL export, bulk export per Architecture §5/§6).
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8095;

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

const reports = new Map();

function makeReport(body) {
  return {
    id: uuidv4(),
    kind: body.kind || 'bilingual-report',
    language: body.language || 'en',
    format: body.format || 'markdown',
    content: body.content || '',
    oscalExport: body.oscalExport || null,
    bulkExport: body.bulkExport || null,
    createdAt: new Date().toISOString(),
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'svc-12-evidence-audit-store', component: 'C-17' });
});

app.post('/api/v1/reports', (req, res) => {
  const r = makeReport(req.body || {});
  reports.set(r.id, r);
  res.status(201).json(r);
});

app.get('/api/v1/reports', (req, res) => {
  res.json({ items: Array.from(reports.values()) });
});

app.get('/api/v1/reports/:id', (req, res) => {
  const r = reports.get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not Found' });
  res.json(r);
});

app.put('/api/v1/reports/:id', (req, res) => {
  const r = reports.get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Not Found' });
  Object.assign(r, req.body || {});
  r.updatedAt = new Date().toISOString();
  reports.set(req.params.id, r);
  res.json(r);
});

app.post('/api/v1/reports/export/oscal', (req, res) => {
  const r = makeReport(Object.assign({}, req.body, { kind: 'oscal-export', format: 'oscal' }));
  reports.set(r.id, r);
  r.oscalExport = { catalog: { uuid: uuidv4(), metadata: { title: 'AI Governance Tool - OSCAL Export' }, groups: [] } };
  res.status(201).json(r);
});

app.post('/api/v1/reports/export/bulk', (req, res) => {
  const r = makeReport(Object.assign({}, req.body, { kind: 'bulk-export', format: 'bulk' }));
  reports.set(r.id, r);
  r.bulkExport = { exportedAt: new Date().toISOString(), items: Object.keys(r).length };
  res.status(201).json(r);
});

app.get('/api/v1/reports', (req, res) => {
  res.json({ ok: true, interfaces: ['I-06', 'I-13'], components: ['C-17'] });
});

app.listen(PORT, () => {
  console.log('SVC-12 Evidence and Audit Store (C-16) listening on :' + PORT);
});
