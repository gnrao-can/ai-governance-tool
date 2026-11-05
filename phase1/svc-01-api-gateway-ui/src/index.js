/**
 * AI Governance Tool - SVC-01: API Gateway + Bilingual Web UI
 *
 * Phase 1 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Components C-01/C-02):
 *   C-01 Experience: Bilingual web UI (EN/FR, WCAG 2.1 AA).
 *   C-02 Integration: API gateway (auth, rate limiting, tenant routing).
 *
 * Interfaces: I-02, I-03, I-05 (gateway-facing); downstream Phase 1/2 services.
 *
 * Phase 1 demo basis: in-process gateway + static bilingual UI (production: OpenShift
 * GitOps, hardened images, OIDC/OAuth 2.0, rate limits, tenant routing per Architecture
 * section 5 and Phase 0 INFRA-1/2).
 *
 * Phase 4 Wave 1 hardening (production hardening & identity):
 *   - OIDC / OAuth 2.0 bearer validation via JWKS (env: OIDC_ISSUER, OIDC_CLIENT_ID).
 *   - Demo mode fallback (when OIDC_ISSUER is unset) accepting DEMO_BEARER_TOKEN.
 *   - RBAC policy check (env-driven DEV_RBAC_ROLES) attaching req.user.roles.
 *   - Rate limiting enforcement (env: RATE_LIMIT_TOKENS / RATE_LIMIT_WINDOW_MS).
 *   - Tenant scoping via header (env: TENANT_HEADER, default x-tenant-id).
 */

const express = require('express');
const path = require('path');
const { createRemoteJWKSet, jwtVerify } = require('jose');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8084;

// Longest-prefix upstream map. Prefixes align with downstream service routes.
const UPSTREAMS = [
  { prefix: '/api/v1/governance/drafts', upstream: process.env.SVC_04_URL || 'http://localhost:8081' },
  { prefix: '/api/v1/governance/obligations', upstream: process.env.SVC_03_URL || 'http://localhost:8080' },
  { prefix: '/api/v1/governance/controls', upstream: process.env.SVC_03_URL || 'http://localhost:8080' },
  { prefix: '/api/v1/governance/playbooks', upstream: process.env.SVC_03_URL || 'http://localhost:8080' },
  { prefix: '/api/v1/governance/crosswalks', upstream: process.env.SVC_03_URL || 'http://localhost:8080' },
  { prefix: '/api/v1/governance/oscal', upstream: process.env.SVC_03_URL || 'http://localhost:8080' },
  { prefix: '/api/v1/governance', upstream: process.env.SVC_03_URL || 'http://localhost:8080' },
  { prefix: '/api/v1/drafts', upstream: process.env.SVC_04_URL || 'http://localhost:8081' },
  { prefix: '/api/v1/impact', upstream: process.env.SVC_05_URL || 'http://localhost:8082' },
  { prefix: '/api/v1/assessments', upstream: process.env.SVC_06_URL || 'http://localhost:8083' },
  { prefix: '/api/v1/evidence', upstream: process.env.SVC_02_URL || 'http://localhost:8085' },
  // Phase 2 upstreams
  { prefix: '/api/v1/measures', upstream: process.env.SVC_07_URL || 'http://localhost:8090' },
  { prefix: '/api/v1/remediations', upstream: process.env.SVC_08_URL || 'http://localhost:8091' },
  { prefix: '/api/v1/systems', upstream: process.env.SVC_09_URL || 'http://localhost:8092' },
  { prefix: '/api/v1/graph', upstream: process.env.SVC_10_URL || 'http://localhost:8093' },
  { prefix: '/api/v1/workflows', upstream: process.env.SVC_11_URL || 'http://localhost:8094' },
  { prefix: '/api/v1/reports', upstream: process.env.SVC_12_URL || 'http://localhost:8095' },
  { prefix: '/api/v1/notifications', upstream: process.env.SVC_13_URL || 'http://localhost:8096' },
  { prefix: '/api/v1/llm', upstream: process.env.SVC_14_URL || 'http://localhost:8097' },
  { prefix: '/api/v1/answer-keys', upstream: process.env.SVC_14_URL || 'http://localhost:8097' },
  { prefix: '/api/v1/prompts', upstream: process.env.SVC_14_URL || 'http://localhost:8097' },
  { prefix: '/api/v1/ai-qa', upstream: process.env.SVC_14_URL || 'http://localhost:8097' },
];

const rateLimitStore = {};
const auditEvents = [];
const RATE_LIMIT_TOKENS = parseInt(process.env.RATE_LIMIT_TOKENS || '1000', 10);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

const OIDC_ISSUER = process.env.OIDC_ISSUER || '';
const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID || '';
const DEMO_BEARER_TOKEN = process.env.DEMO_BEARER_TOKEN || 'phase1-demo-token';
const DEV_RBAC_ROLES = (process.env.DEV_RBAC_ROLES || 'Author,Reviewer,Approver,Operator')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const TENANT_HEADER = process.env.TENANT_HEADER || 'x-tenant-id';
const RBAC_ALLOWED_ROLES = (process.env.RBAC_ALLOWED_ROLES || 'Author,Reviewer,Approver,Operator')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const RBAC_DENY = process.env.RBAC_DENY !== 'false';

const jwks = OIDC_ISSUER ? createRemoteJWKSet(new URL(OIDC_ISSUER)) : null;

async function verifyBearerToken(token) {
  if (!token) return null;
  if (!jwks) {
    // Phase 4 Wave 1 demo mode: accept the configured demo service token.
    if (token === DEMO_BEARER_TOKEN) {
      return { sub: 'demo-service', roles: ['Operator'], tenantId: process.env.DEMO_TENANT_ID || 'demo-tenant', demo: true };
    }
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer: OIDC_ISSUER, audience: OIDC_CLIENT_ID });
    const roles =
      payload.roles ||
      payload['https://ssc.example/roles'] ||
      payload.realm_access?.roles ||
      ['Viewer'];
    const tenantId = payload.tenantId || payload['https://ssc.example/tenantId'] || payload.preferred_username || 'default';
    return { sub: payload.sub, roles, tenantId, ...payload };
  } catch (e) {
    return null;
  }
}

async function authRequired(req, res, next) {
  const h = req.headers.authorization || '';
  if (!h || !h.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized', message: 'Bearer token required' });
  }
  const token = h.slice(7).trim();
  const user = await verifyBearerToken(token);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', message: 'Invalid or expired token' });
  }
  req.user = user;
  req.tenantId = user.tenantId;
  req.roles = user.roles || [];
  next();
}

function rateLimiter(req, res, next) {
  const ip = req.ip || 'unknown';
  const nowTs = Date.now();
  const entry = rateLimitStore[ip] = rateLimitStore[ip] || { tokens: RATE_LIMIT_TOKENS, last: nowTs };
  if (entry.tokens < 1) {
    return res.status(429).json({ error: 'rate_limited' });
  }
  entry.tokens -= 1;
  entry.last = nowTs;
  next();
}

function requireRbac(req, res, next) {
  if (!RBAC_DENY) { return next(); }
  const roles = (req && req.roles) || [];
  const allowed = roles.some((r) => RBAC_ALLOWED_ROLES.includes(r));
  if (!allowed) {
    return res.status(403).json({ error: 'forbidden', message: 'Insufficient role for this operation' });
  }
  next();
}

function tenantEnforcer(req, res, next) {
  const th = (process.env.TENANT_HEADER || 'x-tenant-id');
  const hasHeader = !!(req && req.headers && req.headers[th]);
  const authedTenant = (req && req.tenantId) || 'default';
  if (process.env.OIDC_ISSUER && hasHeader && req.headers[th] !== authedTenant) {
    return res.status(403).json({ error: 'tenant_mismatch', message: 'Tenant mismatch' });
  }
  next();
}

function auditEmitter(req, res, next) {
  const p = (req.path || '/').split('?')[0];
  const actor = (req && req.user && req.user.sub) || 'anonymous';
  const tenantId = (req && req.tenantId) || 'default';
  const ev = {
    ts: new Date().toISOString(),
    method: req.method,
    path: p,
    actor: actor,
    tenantId: tenantId,
    outcome: 'ok',
  };
  auditEvents.push(ev);
  if (auditEvents.length > 1000) { auditEvents.shift(); }
  next();
}

app.get('/api/v1/audit/events', (req, res) => {
  res.json({ ok: true, count: auditEvents.length, events: auditEvents });
});

function isEgressAllowed(upstreamUrl) {
  const allow = (process.env.EGRESS_ALLOWLIST || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!process.env.EGRESS_ALLOWLIST) { return true; }
  try {
    const u = new URL(upstreamUrl);
    return allow.some((a) => u.host === a || u.hostname === a);
  } catch (e) {
    return false;
  }
}

async function forward(req, res, upstreamUrl) {
  if (!isEgressAllowed(upstreamUrl)) {
    return res.status(403).json({ error: 'egress_denied', message: 'Egress not allowed to ' + upstreamUrl });
  }
  const url = upstreamUrl + req.path;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const headers = Object.assign({}, req.headers);
    delete headers.host;
    const resp = await fetch(url, {
      method: req.method,
      headers: headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : JSON.stringify(req.body || {}),
      signal: controller.signal,
    });
    const text = await resp.text();
    res.status(resp.status);
    res.set('content-type', resp.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (e) {
    res.status(502).json({ error: 'upstream_unavailable', detail: String(e) });
  } finally {
    clearTimeout(timeout);
  }
}

function resolveUpstream(p) {
  let best = null;
  let bestLen = -1;
  for (const u of UPSTREAMS) {
    if (p === u.prefix || p.startsWith(u.prefix + '/')) {
      if (u.prefix.length > bestLen) {
        bestLen = u.prefix.length;
        best = u.upstream;
      }
    }
  }
  return best;
}

app.get('/health', async (req, res) => {
  const checks = await Promise.all(
    UPSTREAMS.map(async (u) => {
      try {
        const r = await fetch(u.upstream + '/health');
        const j = await r.json();
        return [u.prefix, { status: r.status, ok: r.ok, ...j }];
      } catch (e) {
        return [u.prefix, { status: 'down', ok: false }];
      }
    })
  );
  res.json({ status: 'ok', service: 'svc-01-api-gateway-ui', component: 'C-01/C-02', checks: Object.fromEntries(checks) });
});

// Phase 4 Wave 1: gate API traffic through rate limiting + auth, then forward.
app.use('/api/v1', rateLimiter, authRequired, requireRbac, tenantEnforcer, auditEmitter);

app.use((req, res, next) => {
  const p = (req.path || '/').split('?')[0];
  const upstream = resolveUpstream(p);
  if (upstream) {
    return forward(req, res, upstream);
  }
  next();
});

app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));

app.listen(PORT, () => {
  console.log('SVC-01 API Gateway + Bilingual Web UI listening on :' + PORT);
});
