/**
 * AI Governance Tool - SVC-05: Impact Analyser (C-08)
 *
 * Phase 1 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Component C-08):
 *   Traverse the traceability graph (C-13) from a changed node and set the
 *   response tier per affected system.
 *
 * Interface: internal service (I-05 governance library API adjacency via C-06/C-13).
 *
 * Phase 1 demo basis: in-memory impact index / graph (production backing: PostgreSQL
 * + Apache AGE graph per Architecture section 4 and Phase 0 DATA-1).
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8082;

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
const graph = new Map();

const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:8092';
const DEMO_BEARER_FALLBACK = process.env.DEMO_BEARER_TOKEN || 'phase1-demo-token';

async function fetchRegistrySystem(id, authHeader) {
  try {
    const res = await fetch(REGISTRY_URL + '/api/v1/systems/' + id, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        authorization: authHeader || ('Bearer ' + DEMO_BEARER_FALLBACK),
      },
    });
    const text = await res.text();
    if (!res.ok) return null;
    if (!text) return null;
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function makeSystem(id) {
  return { id: id, responseTier: 'standard', findings: [], createdAt: new Date().toISOString() };
}

function getOrCreateSystem(id) {
  if (!systems.has(id)) systems.set(id, makeSystem(id));
  return systems.get(id);
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'svc-05-impact-analyser', component: 'C-08' });
});

app.post('/api/v1/impact/analyse', (req, res) => {
  const body = req.body || {};
  const changedNodeId = body.changedNodeId;
  const changedNodeType = body.changedNodeType;
  const tenantId = body.tenantId;
  const start = Date.now();
  const impacted = new Set();
  const visited = new Set();
  const stack = [changedNodeId];
  while (stack.length > 0) {
    const nodeId = stack.pop();
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    const node = graph.get(nodeId);
    if (node) {
      const edges = node.edges || [];
      for (let i = 0; i < edges.length; i++) stack.push(edges[i]);
    }
    if (systems.has(nodeId)) impacted.add(nodeId);
  }
  const impactedSystems = Array.from(impacted).map((id) => {
    const sys = getOrCreateSystem(id);
    return { systemId: id, responseTier: sys.responseTier, findings: sys.findings };
  });
  impactedSystems.forEach((s) => {
    const sys = systems.get(s.systemId);
    if (sys) sys.responseTier = 'targeted';
  });
  const elapsedMs = Date.now() - start;
  res.json({ changedNodeId: changedNodeId, changedNodeType: changedNodeType, tenantId: tenantId, impactedSystems: impactedSystems, analysisId: uuidv4(), elapsedMs: elapsedMs });
});

app.get('/api/v1/impact/systems/:systemId', async (req, res) => {
  const sys = systems.get(req.params.systemId);
  if (sys) return res.json(sys);
  // Fall back to the AI system registry (SVC-09) so impact lookups align with
  // registry-created systems (integration fix for SVC-05 <-> SVC-09).
  const authHeader = (req.headers && req.headers.authorization) || ('Bearer ' + DEMO_BEARER_FALLBACK);
  const reg = await fetchRegistrySystem(req.params.systemId, authHeader);
  if (!reg) return res.status(404).json({ error: 'Not Found' });
  const system = Object.assign({}, reg, { id: reg.id, responseTier: reg.responseTier || 'standard', findings: reg.findings || [] });
  return res.json(system);
});

app.get('/api/v1/impact', (req, res) => {
  res.json({ ok: true, interfaces: [], components: ['C-08'] });
});

app.listen(PORT, () => {
  console.log('SVC-05 Impact Analyser (C-08) listening on :' + PORT);
});
