/**
 * AI Governance Tool - SVC-10: Traceability Graph (C-13)
 *
 * Phase 2 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Component C-13):
 *   Nodes and edges across all governance entities; impact queries.
 *
 * Interface: internal service (I-05 governance library API adjacency via C-06/C-13).
 *
 * Phase 2 demo basis: in-memory traceability graph (production: PostgreSQL +
 * Apache AGE graph per Architecture §4/§5 and Phase 0 DATA-1).
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8093;

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

const nodes = new Map();
const edges = new Map;

function addNode(id, kind) {
  if (!nodes.has(id)) nodes.set(id, { id: id, kind: kind, createdAt: new Date().toISOString() });
  return nodes.get(id);
}

function addEdge(id, from, to, type) {
  if (!edges.has(id)) edges.set(id, { id: id, from: from, to: to, type: type });
  return edges.get(id);
}

function impactQuery(startNodeId, tenantId) {
  const impacted = new Set();
  const visited = new Set();
  const stack = [startNodeId];
  while (stack.length > 0) {
    const n = stack.pop();
    if (visited.has(n)) continue;
    visited.add(n);
    for (const e of edges.values()) {
      if (e.from === n && !visited.has(e.to)) stack.push(e.to);
    }
    if (nodes.has(n) && nodes.get(n).kind === 'aiSystem') impacted.add(n);
  }
  const impactedSystems = Array.from(impacted).map((id) => nodes.get(id)).filter(Boolean);
  return { startNodeId: startNodeId, tenantId: tenantId, impactedSystems: impactedSystems, visited: Array.from(visited) };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'svc-10-traceability-graph', component: 'C-13' });
});

app.post('/api/v1/graph/nodes', (req, res) => {
  const n = addNode(req.body.id, req.body.kind);
  res.status(201).json(n);
});

app.post('/api/v1/graph/edges', (req, res) => {
  const e = addEdge(req.body.id, req.body.from, req.body.to, req.body.type);
  res.status(201).json(e);
});

app.get('/api/v1/graph/nodes', (req, res) => {
  res.json({ items: Array.from(nodes.values()) });
});

app.get('/api/v1/graph/edges', (req, res) => {
  res.json({ items: Array.from(edges.values()) });
});

app.post('/api/v1/graph/impact', (req, res) => {
  const body = req.body || {};
  const result = impactQuery(body.startNodeId, body.tenantId);
  res.json(result);
});

app.get('/api/v1/graph', (req, res) => {
  res.json({ ok: true, interfaces: ['I-05'], components: ['C-13'] });
});

app.listen(PORT, () => {
  console.log('SVC-10 Traceability Graph (C-13) listening on :' + PORT);
});
