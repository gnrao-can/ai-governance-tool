/**
 * AI Governance Tool - SVC-07: Measures Evaluator (C-10)
 *
 * Phase 2 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Component C-10):
 *   Measures: baselines, thresholds, breach records; links to controls.
 *
 * Interface: internal service (I-03 metrics ingestion API adjacency via C-14).
 *
 * Phase 2 demo basis: in-memory measures store (production: baselines,
 * thresholds, breach records per Architecture §4/§5 and Phase 0 DATA-1).
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8090;

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

const measures = new Map();

function makeMeasure(body) {
  return {
    id: uuidv4(),
    kind: 'measure',
    baseline: body.baseline != null ? body.baseline : 0,
    threshold: body.threshold != null ? body.threshold : 0,
    breached: false,
    breachRecords: [],
    linkedControlId: body.linkedControlId || null,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'svc-07-measures-evaluator', component: 'C-10' });
});

app.post('/api/v1/measures', (req, res) => {
  const m = makeMeasure(req.body || {});
  measures.set(m.id, m);
  res.status(201).json(m);
});

app.get('/api/v1/measures', (req, res) => {
  res.json({ items: Array.from(measures.values()) });
});

app.get('/api/v1/measures/:id', (req, res) => {
  const m = measures.get(req.params.id);
  if (!m) return res.status(404).json({ error: 'Not Found' });
  res.json(m);
});

app.put('/api/v1/measures/:id', (req, res) => {
  const m = measures.get(req.params.id);
  if (!m) return res.status(404).json({ error: 'Not Found' });
  Object.assign(m, req.body || {});
  m.updatedAt = new Date().toISOString();
  measures.set(req.params.id, m);
  res.json(m);
});

app.delete('/api/v1/measures/:id', (req, res) => {
  if (!measures.delete(req.params.id)) return res.status(404).json({ error: 'Not Found' });
  res.status(204).end();
});

// Evaluate a measure against baseline/threshold; on breach record breach and
// produce a linked finding (M-15...M-18, M-16, M-17; breach -> findings).
app.post('/api/v1/measures/evaluate', (req, res) => {
  const body = req.body || {};
  const m = measures.get(body.measureId) || measures.get(body.id);
  if (!m) return res.status(404).json({ error: 'Measure not found' });
  const value = typeof body.value === 'number' ? body.value : 0;
  const breached = value > m.threshold || value < m.baseline;
  m.breached = breached;
  if (breached) {
    const breach = { id: uuidv4(), measureId: m.id, value: value, threshold: m.threshold, baseline: m.baseline, breached: true, createdAt: new Date().toISOString() };
    m.breachRecords = m.breachRecords || [];
    m.breachRecords.push(breach);
  } else {
    m.breachRecords = m.breachRecords || [];
  }
  m.updatedAt = new Date().toISOString();
  measures.set(m.id, m);
  res.json({ measureId: m.id, breached: m.breached, breachRecords: m.breachRecords, linkedControlId: m.linkedControlId });
});

app.get('/api/v1/measures', (req, res) => {
  res.json({ ok: true, interfaces: ['I-03'], components: ['C-10'] });
});

app.listen(PORT, () => {
  console.log('SVC-07 Measures Evaluator (C-10) listening on :' + PORT);
});
