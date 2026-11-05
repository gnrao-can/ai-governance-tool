/**
 * AI Governance Tool - SVC-02: Connector Framework / Evidence Upload API
 *
 * Phase 1 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Components C-03/C-05/C-16):
 *   Connector framework/SDK (pull/push); evidence upload API with SHA-256
 *   provenance; decision trace ingestion/linking (C-05); evidence & audit store
 *   (C-16).
 *
 * Interfaces: I-02 (Evidence), I-04 (Decision record).
 *
 * Phase 1 demo basis: in-memory stores (production: Kafka/OpenTelemetry/PostgreSQL
 * per Architecture section 4 and Phase 0 DATA-1).
 */

const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8085;

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

const connectors = new Map();
const evidence = new Map();
const auditLog = new Map();
let prevHash = 'GENESIS';

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function makeAuditRecord(body) {
  const nowTs = new Date().toISOString();
  const payload = JSON.stringify({ action: body.action || 'evidence.upload', actor: body.actor || 'connector', target: body.target || 'unknown', timestamp: nowTs });
  const hash = sha256(prevHash + ':' + payload);
  const rec = { id: uuidv4(), action: body.action || 'evidence.upload', actor: body.actor || 'connector', target: body.target || 'unknown', timestamp: nowTs, hash: hash, prevHash: prevHash };
  prevHash = hash;
  auditLog.set(rec.id, rec);
  return rec;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'svc-02-connector-framework', component: 'C-03' });
});

app.post('/api/v1/connectors', (req, res) => {
  const c = { id: uuidv4(), status: 'registered', createdAt: new Date().toISOString(), ...(req.body || {}) };
  connectors.set(c.id, c);
  res.status(201).json(c);
});

app.get('/api/v1/connectors', (req, res) => {
  res.json({ items: Array.from(connectors.values()) });
});

app.get('/api/v1/connectors/:id', (req, res) => {
  const c = connectors.get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not Found' });
  res.json(c);
});

app.post('/api/v1/evidence/upload', (req, res) => {
  const body = req.body || {};
  const sha256hex = body.sha256 || (body.artefactBase64 ? crypto.createHash('sha256').update(body.artefactBase64, 'base64').digest('hex') : sha256(JSON.stringify(body)));
  const ev = { id: uuidv4(), artefactUri: body.artefactUri || '', sha256: sha256hex, provenance: body.provenance || {}, createdAt: new Date().toISOString() };
  evidence.set(ev.id, ev);
  makeAuditRecord({ action: 'evidence.upload', actor: body.actor || 'connector', target: ev.artefactUri || ev.id });
  res.status(201).json(ev);
});

app.get('/api/v1/evidence', (req, res) => {
  res.json({ items: Array.from(evidence.values()) });
});

app.post('/api/v1/audit', (req, res) => {
  const rec = makeAuditRecord(req.body || {});
  res.status(201).json(rec);
});

app.get('/api/v1/audit', (req, res) => {
  res.json({ items: Array.from(auditLog.values()) });
});

app.get('/api/v1', (req, res) => {
  res.json({ ok: true, interfaces: ['I-02'], components: ['C-03', 'C-16'] });
});

app.listen(PORT, () => {
  console.log('SVC-02 Connector Framework / Evidence Upload listening on :' + PORT);
});
