/**
 * AI Governance Tool - SVC-14: LLM Serving & AI QA (C-19)
 *
 * Phase 2 implementation - TRL 5 demonstration build.
 *
 * Responsibility (Solution Architecture, Component C-19):
 *   LLM serving (vLLM, open-weight, in-tenant) and AI QA (answer key, prompt
 *   governance) for reasoning components (interpreter/assessment/remediation).
 *
 * Interfaces: internal service (I-05/I-06/I-11 governance library adjacency via
 * C-07/C-09/C-11 and D-05/D-04/R-01/R-02).
 *
 * Phase 2 demo basis: in-memory LLM/AI QA stores (production: vLLM on GPU, answer
 * key, prompt governance per Architecture §3.6 and Phase 0 DATA-1).
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8097;

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

const answerKeys = new Map();
const prompts = new Map();

function makeAnswerKey(body) {
  return {
    id: uuidv4(),
    kind: 'answerKey',
    question: body.question || '',
    expected: body.expected || '',
    createdAt: new Date().toISOString(),
  };
}

function makePrompt(body) {
  return {
    id: uuidv4(),
    kind: 'prompt',
    name: body.name || '',
    template: body.template || '',
    version: body.version || '1.0.0',
    createdAt: new Date().toISOString(),
  };
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'svc-14-llm-serving-ai-qa', component: 'C-19' });
});

app.post('/api/v1/llm/drafts', (req, res) => {
  const d = makePrompt(Object.assign({}, req.body, { kind: 'llm-draft' }));
  prompts.set(d.id, d);
  res.status(201).json(d);
});

app.post('/api/v1/answer-keys', (req, res) => {
  const a = makeAnswerKey(req.body || {});
  answerKeys.set(a.id, a);
  res.status(201).json(a);
});

app.get('/api/v1/answer-keys', (req, res) => {
  res.json({ items: Array.from(answerKeys.values()) });
});

app.get('/api/v1/answer-keys/:id', (req, res) => {
  const a = answerKeys.get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Not Found' });
  res.json(a);
});

app.post('/api/v1/prompts', (req, res) => {
  const p = makePrompt(req.body || {});
  prompts.set(p.id, p);
  res.status(201).json(p);
});

app.get('/api/v1/prompts', (req, res) => {
  res.json({ items: Array.from(prompts.values()) });
});

app.get('/api/v1/prompts/:id', (req, res) => {
  const p = prompts.get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not Found' });
  res.json(p);
});

app.post('/api/v1/ai-qa/run', (req, res) => {
  const body = req.body || {};
  const answerKey = answerKeys.get(body.answerKeyId);
  if (!answerKey) return res.status(404).json({ error: 'Answer key not found' });
  const result = { runId: uuidv4(), answerKeyId: answerKey.id, status: 'completed', score: body.score || 0 };
  return res.json(result);
});

app.get('/api/v1/ai-qa', (req, res) => {
  res.json({ ok: true, interfaces: ['I-05', 'I-06', 'I-11'], components: ['C-19'] });
});

app.listen(PORT, () => {
  console.log('SVC-14 LLM Serving & AI QA (C-19) listening on :' + PORT);
});
