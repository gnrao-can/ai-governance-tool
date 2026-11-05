/**
 * AI Governance Tool - SVC-09: AI System Registry (C-12)
 *
 * Phase 2 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Component C-12):
 *   AI system registry: system records, source attribution, reconciliation,
 *   AIA import (I-08).
 *
 * Interface: internal service (I-01 Registry API adjacency via C-06/C-13).
 *
 * Phase 2 demo basis: in-memory registry store (production: registry service
 * on PostgreSQL per Architecture §4/§5 and Phase 0 DATA-1).
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8092;

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

const systems = new Map();

function makeSystem(body) {
  return {
    id: uuidv4(),
    kind: 'aiSystem',
    owner: body.owner || null,
    intent: body.intent || null,
    objectives: body.objectives || [],
    client: body.client || null,
    fundingState: body.fundingState || null,
    deploymentStatus: body.deploymentStatus || null,
    aiAPlan: body.aiAPlan || null,
    decisionType: body.decisionType || null,
    agenticAttributes: body.agenticAttributes || {},
    sourceAttribution: body.sourceAttribution || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'svc-09-ai-system-registry', component: 'C-12' });
});

app.post('/api/v1/systems', (req, res) => {
  const s = makeSystem(req.body || {});
  systems.set(s.id, s);
  res.status(201).json(s);
});

app.get('/api/v1/systems', (req, res) => {
  res.json({ items: Array.from(systems.values()) });
});

app.get('/api/v1/systems/:id', (req, res) => {
  const s = systems.get(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not Found' });
  res.json(s);
});

app.put('/api/v1/systems/:id', (req, res) => {
  const s = systems.get(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not Found' });
  Object.assign(s, req.body || {});
  s.updatedAt = new Date().toISOString();
  systems.set(req.params.id, s);
  res.json(s);
});

app.delete('/api/v1/systems/:id', (req, res) => {
  if (!systems.delete(req.params.id)) return res.status(404).json({ error: 'Not Found' });
  res.status(204).end();
});

// Reconciliation: merge inbound system records with source attribution.
app.post('/api/v1/systems/reconcile', (req, res) => {
  const body = req.body || {};
  const incoming = body.systems || [body];
  const merged = Array.from(systems.values());
  incoming.forEach((inc) => {
    const key = inc.id || inc.systemId;
    if (!key) return;
    const existing = systems.get(key);
    if (existing) {
      Object.assign(existing, inc, { sourceAttribution: Object.assign({}, existing.sourceAttribution, inc.sourceAttribution || {}) });
      existing.updatedAt = new Date().toISOString();
    } else {
      systems.set(key, makeSystem(Object.assign({}, inc, { id: key })));
    }
  });
  res.json({ reconciled: incoming.length, systems: Array.from(systems.values()) });
});

// AIA import (I-08): ingest an AIA record linked to a system and decisions.
app.post('/api/v1/systems/:id/aia-import', (req, res) => {
  const s = systems.get(req.params.id);
  if (!s) return res.status(404).json({ error: 'Not Found' });
  const aia = req.body || {};
  s.aiAPlan = aia.aiAPlan || s.aiAPlan;
  s.decisionType = aia.decisionType || s.decisionType;
  s.updatedAt = new Date().toISOString();
  systems.set(req.params.id, s);
  res.json(s);
});

app.get('/api/v1/systems', (req, res) => {
  res.json({ ok: true, interfaces: ['I-01'], components: ['C-12'] });
});

app.listen(PORT, () => {
  console.log('SVC-09 AI System Registry (C-12) listening on :' + PORT);
});
