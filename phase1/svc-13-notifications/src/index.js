/**
 * AI Governance Tool - SVC-13: Notifications (C-18)
 *
 * Phase 2 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Component C-18):
 *   Notifications/alerts (Teams, email).
 *
 * Interface: internal service (I-11 workflow/alert adjacency via C-18).
 *
 * Phase 2 demo basis: in-memory notification store (production: Teams/email
 * delivery connectors per Architecture §5/§6).
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8096;

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

const notifications = new Map();

function makeNotification(body) {
  return {
    id: uuidv4(),
    kind: body.kind || 'alert',
    channel: body.channel || 'teams',
    severity: body.severity || 'info',
    title: body.title || '',
    message: body.message || '',
    target: body.target || null,
    createdAt: new Date().toISOString(),
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'svc-13-notifications', component: 'C-18' });
});

app.post('/api/v1/notifications', (req, res) => {
  const n = makeNotification(req.body || {});
  notifications.set(n.id, n);
  res.status(201).json(n);
});

app.get('/api/v1/notifications', (req, res) => {
  res.json({ items: Array.from(notifications.values()) });
});

app.get('/api/v1/notifications/:id', (req, res) => {
  const n = notifications.get(req.params.id);
  if (!n) return res.status(404).json({ error: 'Not Found' });
  res.json(n);
});

app.put('/api/v1/notifications/:id', (req, res) => {
  const n = notifications.get(req.params.id);
  if (!n) return res.status(404).json({ error: 'Not Found' });
  Object.assign(n, req.body || {});
  n.updatedAt = new Date().toISOString();
  notifications.set(req.params.id, n);
  res.json(n);
});

app.get('/api/v1/notifications', (req, res) => {
  res.json({ ok: true, interfaces: ['I-11'], components: ['C-18'] });
});

app.listen(PORT, () => {
  console.log('SVC-13 Notifications (C-18) listening on :' + PORT);
});
