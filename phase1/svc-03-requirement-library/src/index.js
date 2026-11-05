/**
 * AI Governance Tool - SVC-03: Requirement Library Service (C-06)
 *
 * Phase 1 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Component C-06):
 *   Governance information sources, obligations, controls, playbooks (profiles),
 *   crosswalks; versioning; OSCAL mapping.
 *
 * Interface (I-05): Governance library API - REST, OSCAL JSON (catalog, profile).
 *
 * Phase 1 demo basis: in-memory stores (production backing: PostgreSQL+Apache AGE,
 * S3 object store, OSCAL tooling per Architecture section 4 and Phase 0 DATA-1).
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;

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

const sources = new Map();
const obligations = new Map();
const controls = new Map();
const playbooks = new Map();
const crosswalks = new Map;

const STATES = ['draft', 'published', 'deprecated'];
const now = () => new Date().toISOString();

function baseEntity(kind, status) {
  return { id: uuidv4(), kind: kind, version: '1.0.0', status: status, createdAt: now(), updatedAt: now() };
}

function makeSource(body) {
  const e = baseEntity('governanceSource', 'published');
  return Object.assign(e, {
    sourceType: body.sourceType || 'regulation',
    language: body.language || 'en',
    title: body.title || '',
    clauses: body.clauses || [],
  });
}

function makeObligation(body) {
  const e = baseEntity('obligation', 'draft');
  return Object.assign(e, {
    title: body.title || '',
    text: body.text || '',
    requirementRef: body.requirementRef || '',
    language: body.language || 'en',
  });
}

function makeControl(body) {
  const e = baseEntity('control', 'draft');
  return Object.assign(e, {
    title: body.title || '',
    controlId: body.controlId || '',
    framework: body.framework || '',
    language: body.language || 'en',
  });
}

function makePlaybook(body) {
  const e = baseEntity('playbook', 'draft');
  return Object.assign(e, {
    title: body.title || '',
    description: body.description || '',
    framework: body.framework || '',
    language: body.language || 'en',
  });
}

function makeCrosswalk(body) {
  const e = baseEntity('crosswalk', 'draft');
  return Object.assign(e, {
    sourceFramework: body.sourceFramework || '',
    targetFramework: body.targetFramework || '',
    mapping: body.mapping || {},
    language: body.language || 'en',
  });
}

const cloneEntity = (e) => {
  const c = Object.assign({}, e);
  if (c.mapping) c.mapping = Object.assign({}, c.mapping);
  return c;
};

function publishEntity(collection, e) {
  e.status = 'published';
  e.updatedAt = now();
  collection.set(e.id, e);
  return e;
}

function retireEntity(collection, e) {
  e.status = 'deprecated';
  e.updatedAt = now();
  collection.set(e.id, e);
  return e;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'svc-03-requirement-library', component: 'C-06' });
});

app.post('/api/v1/governance/sources', (req, res) => {
  const src = makeSource(req.body || {});
  sources.set(src.id, src);
  res.status(201).json(src);
});

app.get('/api/v1/governance/sources', (req, res) => {
  res.json({ items: Array.from(sources.values()).map(cloneEntity) });
});

app.get('/api/v1/governance/sources/:id', (req, res) => {
  const src = sources.get(req.params.id);
  if (!src) return res.status(404).json({ error: 'Not Found' });
  res.json(cloneEntity(src));
});

app.put('/api/v1/governance/sources/:id', (req, res) => {
  const src = sources.get(req.params.id);
  if (!src) return res.status(404).json({ error: 'Not Found' });
  Object.assign(src, req.body || {});
  src.version = req.body.version || src.version;
  src.status = req.body.status || src.status;
  src.updatedAt = now();
  sources.set(src.id, src);
  res.json(cloneEntity(src));
});

app.delete('/api/v1/governance/sources/:id', (req, res) => {
  if (!sources.delete(req.params.id)) return res.status(404).json({ error: 'Not Found' });
  res.status(204).end();
});

app.post('/api/v1/governance/sources/:id/publish', (req, res) => {
  const src = sources.get(req.params.id);
  if (!src) return res.status(404).json({ error: 'Not Found' });
  return res.json(publishEntity(sources, src));
});

app.post('/api/v1/governance/sources/:id/retire', (req, res) => {
  const src = sources.get(req.params.id);
  if (!src) return res.status(404).json({ error: 'Not Found' });
  return res.json(retireEntity(sources, src));
});

app.post('/api/v1/governance/obligations', (req, res) => {
  const o = makeObligation(req.body || {});
  obligations.set(o.id, o);
  res.status(201).json(o);
});

app.get('/api/v1/governance/obligations', (req, res) => {
  res.json({ items: Array.from(obligations.values()).map(cloneEntity) });
});

app.get('/api/v1/governance/obligations/:id', (req, res) => {
  const o = obligations.get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not Found' });
  res.json(cloneEntity(o));
});

app.put('/api/v1/governance/obligations/:id', (req, res) => {
  const o = obligations.get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not Found' });
  Object.assign(o, req.body || {});
  o.version = req.body.version || o.version;
  o.status = req.body.status || o.status;
  o.updatedAt = now();
  obligations.set(o.id, o);
  res.json(cloneEntity(o));
});

app.delete('/api/v1/governance/obligations/:id', (req, res) => {
  if (!obligations.delete(req.params.id)) return res.status(404).json({ error: 'Not Found' });
  res.status(204).end();
});

app.post('/api/v1/governance/obligations/:id/publish', (req, res) => {
  const o = obligations.get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not Found' });
  return res.json(publishEntity(obligations, o));
});

app.post('/api/v1/governance/obligations/:id/retire', (req, res) => {
  const o = obligations.get(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not Found' });
  return res.json(retireEntity(obligations, o));
});

app.post('/api/v1/governance/controls', (req, res) => {
  const c = makeControl(req.body || {});
  controls.set(c.id, c);
  res.status(201).json(c);
});

app.get('/api/v1/governance/controls', (req, res) => {
  res.json({ items: Array.from(controls.values()).map(cloneEntity) });
});

app.get('/api/v1/governance/controls/:id', (req, res) => {
  const c = controls.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not Found' });
  res.json(cloneEntity(c));
});

app.put('/api/v1/governance/controls/:id', (req, res) => {
  const c = controls.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not Found' });
  Object.assign(c, req.body || {});
  c.version = req.body.version || c.version;
  c.status = req.body.status || c.status;
  c.updatedAt = now();
  controls.set(c.id, c);
  res.json(cloneEntity(c));
});

app.delete('/api/v1/governance/controls/:id', (req, res) => {
  if (!controls.delete(req.params.id)) return res.status(404).json({ error: 'Not Found' });
  res.status(204).end();
});

app.post('/api/v1/governance/controls/:id/publish', (req, res) => {
  const c = controls.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not Found' });
  return res.json(publishEntity(controls, c));
});

app.post('/api/v1/governance/controls/:id/retire', (req, res) => {
  const c = controls.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not Found' });
  return res.json(retireEntity(controls, c));
});

app.post('/api/v1/governance/playbooks', (req, res) => {
  const p = makePlaybook(req.body || {});
  playbooks.set(p.id, p);
  res.status(201).json(p);
});

app.get('/api/v1/governance/playbooks', (req, res) => {
  res.json({ items: Array.from(playbooks.values()).map(cloneEntity) });
});

app.get('/api/v1/governance/playbooks/:id', (req, res) => {
  const p = playbooks.get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not Found' });
  res.json(cloneEntity(p));
});

app.put('/api/v1/governance/playbooks/:id', (req, res) => {
  const p = playbooks.get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not Found' });
  Object.assign(p, req.body || {});
  p.version = req.body.version || p.version;
  p.status = req.body.status || p.status;
  p.updatedAt = now();
  playbooks.set(p.id, p);
  res.json(cloneEntity(p));
});

app.delete('/api/v1/governance/playbooks/:id', (req, res) => {
  if (!playbooks.delete(req.params.id)) return res.status(404).json({ error: 'Not Found' });
  res.status(204).end();
});

app.post('/api/v1/governance/playbooks/:id/publish', (req, res) => {
  const p = playbooks.get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not Found' });
  return res.json(publishEntity(playbooks, p));
});

app.post('/api/v1/governance/playbooks/:id/retire', (req, res) => {
  const p = playbooks.get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not Found' });
  return res.json(retireEntity(playbooks, p));
});

app.post('/api/v1/governance/crosswalks', (req, res) => {
  const c = makeCrosswalk(req.body || {});
  crosswalks.set(c.id, c);
  res.status(201).json(c);
});

app.get('/api/v1/governance/crosswalks', (req, res) => {
  res.json({ items: Array.from(crosswalks.values()).map(cloneEntity) });
});

app.get('/api/v1/governance/crosswalks/:id', (req, res) => {
  const c = crosswalks.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not Found' });
  res.json(cloneEntity(c));
});

app.put('/api/v1/governance/crosswalks/:id', (req, res) => {
  const c = crosswalks.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not Found' });
  Object.assign(c, req.body || {});
  c.version = req.body.version || c.version;
  c.status = req.body.status || c.status;
  c.updatedAt = now();
  crosswalks.set(c.id, c);
  res.json(cloneEntity(c));
});

app.delete('/api/v1/governance/crosswalks/:id', (req, res) => {
  if (!crosswalks.delete(req.params.id)) return res.status(404).json({ error: 'Not Found' });
  res.status(204).end();
});

app.post('/api/v1/governance/crosswalks/:id/publish', (req, res) => {
  const c = crosswalks.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not Found' });
  return res.json(publishEntity(crosswalks, c));
});

app.post('/api/v1/governance/crosswalks/:id/retire', (req, res) => {
  const c = crosswalks.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not Found' });
  return res.json(retireEntity(crosswalks, c));
});

app.get('/api/v1/governance', (req, res) => {
  res.json({ ok: true, interfaces: ['I-05'], components: ['C-06'] });
});

app.get('/api/v1/governance/oscal/catalog', (req, res) => {
  const publishedControls = Array.from(controls.values()).filter((c) => c.status === 'published');
  const groupsByFramework = new Map();
  publishedControls.forEach((c) => {
    const key = c.framework || 'default';
    if (!groupsByFramework.has(key)) groupsByFramework.set(key, []);
    groupsByFramework.get(key).push(c);
  });
  const groups = Array.from(groupsByFramework.entries()).map(([framework, ctrls]) => ({
    id: framework.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    class: 'family',
    title: framework,
    controls: ctrls.map((c) => ({ id: c.controlId, title: c.title })),
  }));
  res.json({
    catalog: {
      uuid: uuidv4(),
      metadata: { title: 'AI Governance Tool - OSCAL Catalog (Phase 1 demo)', lastModified: now(), version: '1.0.0' },
      groups: groups,
    },
  });
});

app.get('/api/v1/governance/oscal/profiles/:id', (req, res) => {
  const pb = playbooks.get(req.params.id);
  if (!pb) return res.status(404).json({ error: 'Not Found' });
  res.json({ profile: { uuid: pb.id, metadata: { title: pb.title, status: pb.status }, ...pb } });
});

app.listen(PORT, () => {
  console.log('SVC-03 Requirement Library Service (C-06) listening on :' + PORT);
});
