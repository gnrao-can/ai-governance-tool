/**
 * AI Governance Tool - Phase 3 Demo/Test Orchestrator
 *
 * Runs the Phase 3 verification scenarios (S-01 ... S-08) against the Phase 2
 * services via the Phase 1 gateway, for the TRL 5 demonstration / demo freeze.
 *
 * Phase 3 scope (from Task Breakdown / Phased Delivery Plan):
 *   Phase 3 - Verification & demo freeze (S-01 ... S-08), remediation.
 *
 * Scenarios exercised here:
 *   S-01 Onboard, S-02 Requirement change, S-03 System change, S-04 Measure
 *   breach, S-05 Review and respond, S-06 Extensibility and crosswalk, S-07
 *   Audit and export, S-08 Platform controls.
 */

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8084';
const BEARER_TOKEN = process.env.BEARER_TOKEN || 'phase1-demo-token';

async function call(method, path, body) {
  const res = await fetch(GATEWAY_URL + path, {
    method: method,
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + BEARER_TOKEN,
    },
    body: method === 'GET' ? undefined : JSON.stringify(body || {}),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(method + ' ' + path + ' -> ' + res.status + ': ' + text);
  }
  if (!text) { return { status: 'ok' }; }
  return JSON.parse(text);
}

async function runS01() {
  console.log('--- S-01 Onboard: Registry, library, workflow, AIA import ---');
  const source = await call('POST', '/api/v1/governance/sources', {
    sourceType: 'regulation',
    language: 'en',
    title: 'Phase 3 Demo - Onboarding Source',
    clauses: [{ clauseId: 'PIP-1', text: 'Personal data processing requires impact assessment.' }],
  });
  const draft = await call('POST', '/api/v1/governance/drafts', {
    sourceId: source.id,
    source: source,
    type: 'obligation',
    citations: [{ citationId: 'PIP-1', text: 'Personal data processing requires impact assessment.' }],
    draft: { obligations: [{ obligationId: 'OBL-1', text: 'Assess impact before processing personal data.' }], controlMappings: [], rationale: 'Demo' },
  });
  const approved = await call('POST', '/api/v1/governance/drafts/' + draft.id + '/approve', {});
  const obligation = await call('POST', '/api/v1/governance/obligations', { title: 'Assess impact before processing personal data', text: 'Assess impact before processing personal data.', requirementRef: 'PIP-1' });
  const publishedObligation = await call('POST', '/api/v1/governance/obligations/' + obligation.id + '/publish', {});
  const impact = await call('POST', '/api/v1/impact/analyse', { changedNodeId: obligation.id, changedNodeType: 'obligation', tenantId: 'demo-tenant' });
  const finding = await call('POST', '/api/v1/assessments/findings', { systemId: 'sys-001', controlId: 'CTRL-001', state: 'Not met', confidence: 0.9, explanation: 'Impact assessment not completed.', evidence: [] });
  const workflow = await call('POST', '/api/v1/workflows', { findingId: finding.id, status: 'pending' });
  const remediation = await call('POST', '/api/v1/remediations', { findingId: finding.id, action: 'Perform impact assessment', status: 'draft' });
  const notify = await call('POST', '/api/v1/notifications', { kind: 'alert', channel: 'teams', severity: 'info', title: 'S-01 onboard', message: 'Onboarding flow complete', target: finding.id });
  const report = await call('POST', '/api/v1/reports', { kind: 'bilingual-report', language: 'en', format: 'markdown', content: 'S-01 report' });
  const oscal = await call('POST', '/api/v1/reports/export/oscal', { kind: 'oscal-export', format: 'oscal' });
  const bulk = await call('POST', '/api/v1/reports/export/bulk', { kind: 'bulk-export', format: 'bulk' });
  const answerKey = await call('POST', '/api/v1/answer-keys', { question: 'q', expected: 'a' });
  const aiqa = await call('POST', '/api/v1/ai-qa/run', { answerKeyId: answerKey.id, score: 0.9 });
  const llmDraft = await call('POST', '/api/v1/llm/drafts', { kind: 'llm-draft', name: 'draft-1', template: 'tpl', version: '1.0.0' });
  const prompt = await call('POST', '/api/v1/prompts', { name: 'prompt-1', template: 'tpl', version: '1.0.0' });
  const graphNode = await call('POST', '/api/v1/graph/nodes', { id: 'node-1', kind: 'obligation' });
  const graphEdge = await call('POST', '/api/v1/graph/edges', { id: 'edge-1', from: 'node-1', to: 'sys-001', type: 'derives' });
  const graphImpact = await call('POST', '/api/v1/graph/impact', { startNodeId: 'node-1', tenantId: 'demo-tenant' });
  const registrySys = await call('POST', '/api/v1/systems', { owner: 'team-1', intent: 'i', objectives: [], client: 'c', fundingState: 'f', deploymentStatus: 'd', aiAPlan: 'a', decisionType: 'dt', agenticAttributes: {}, sourceAttribution: {} });
  const registryReconcile = await call('POST', '/api/v1/systems/reconcile', { systems: [registrySys] });
  const registryAia = await call('POST', '/api/v1/systems/' + registrySys.id + '/aia-import', { aiAPlan: 'a', decisionType: 'dt' });
  const remediationAccept = await call('POST', '/api/v1/remediations/' + remediation.id + '/accept', { ticketRef: 'TKT-1' });
  const workflowApprove = await call('POST', '/api/v1/workflows/' + workflow.id + '/approve', {});
  const workflowReject = await call('POST', '/api/v1/workflows/' + workflow.id + '/reject', {});
  const workflowException = await call('POST', '/api/v1/workflows/' + workflow.id + '/exception', { reason: 'exception' });
  const measure = await call('POST', '/api/v1/measures', { baseline: 0, threshold: 1, linkedControlId: 'CTRL-001' });
  const measureEval = await call('POST', '/api/v1/measures/evaluate', { measureId: measure.id, value: 2 });
  const measurePut = await call('PUT', '/api/v1/measures/' + measure.id, { baseline: 0, threshold: 1 });
  const measureDel = await call('DELETE', '/api/v1/measures/' + measure.id);
  const draftGet = await call('GET', '/api/v1/governance/drafts');
  const draftPut = await call('PUT', '/api/v1/governance/drafts/' + draft.id, { status: 'approved' });
  const draftDel = await call('DELETE', '/api/v1/governance/drafts/' + draft.id);
  const sourceGet = await call('GET', '/api/v1/governance/sources');
  const sourcePut = await call('PUT', '/api/v1/governance/sources/' + source.id, { sourceType: 'regulation' });
  const sourceDel = await call('DELETE', '/api/v1/governance/sources/' + source.id);
  const obligationGet = await call('GET', '/api/v1/governance/obligations');
  const obligationPut = await call('PUT', '/api/v1/governance/obligations/' + obligation.id, { title: 'x' });
  const obligationDel = await call('DELETE', '/api/v1/governance/obligations/' + obligation.id);
  const impactGet = await call('GET', '/api/v1/impact/systems/' + registrySys.id);
  const impactGet2 = await call('GET', '/api/v1/impact');
  const assessGet = await call('GET', '/api/v1/assessments/findings');
  const assessPut = await call('PUT', '/api/v1/assessments/findings/' + finding.id, { state: 'Met' });
  const assessDel = await call('DELETE', '/api/v1/assessments/findings/' + finding.id);

  console.log('S-01 Onboard flow completed');
}

async function runS02() {
  console.log('--- S-02 Requirement change ---');
  const source = await call('POST', '/api/v1/governance/sources', { sourceType: 'regulation', language: 'en', title: 'Phase 3 Demo - S-02 Source', clauses: [{ clauseId: 'PIP-1', text: 'Personal data processing requires impact assessment.' }] });
  const draft = await call('POST', '/api/v1/governance/drafts', { sourceId: 'x', type: 'obligation', citations: [], draft: { obligations: [], controlMappings: [], rationale: 'r' } });
  const approved = await call('POST', '/api/v1/governance/drafts/' + draft.id + '/approve', {});
  const obligation = await call('POST', '/api/v1/governance/obligations', { title: 't', text: 'x', requirementRef: 'PIP-1' });
  const published = await call('POST', '/api/v1/governance/obligations/' + obligation.id + '/publish', {});
  const impact = await call('POST', '/api/v1/impact/analyse', { changedNodeId: obligation.id, changedNodeType: 'obligation', tenantId: 'demo-tenant' });
  const finding = await call('POST', '/api/v1/assessments/findings', { systemId: 'sys-001', controlId: 'CTRL-001', state: 'Not met', confidence: 0.9, explanation: 'e', evidence: [] });
  const workflow = await call('POST', '/api/v1/workflows', { findingId: finding.id, status: 'pending' });
  const remediation = await call('POST', '/api/v1/remediations', { findingId: finding.id, action: 'a', status: 'draft' });
  const notify = await call('POST', '/api/v1/notifications', { kind: 'alert', channel: 'teams', severity: 'info', title: 'S-02', message: 'm', target: finding.id });
  const report = await call('POST', '/api/v1/reports', { kind: 'bilingual-report', language: 'en', format: 'markdown', content: 'S-02 report' });
  const oscal = await call('POST', '/api/v1/reports/export/oscal', { kind: 'oscal-export', format: 'oscal' });
  const bulk = await call('POST', '/api/v1/reports/export/bulk', { kind: 'bulk-export', format: 'bulk' });
  const answerKey = await call('POST', '/api/v1/answer-keys', { question: 'q', expected: 'a' });
  const aiqa = await call('POST', '/api/v1/ai-qa/run', { answerKeyId: answerKey.id, score: 0.9 });
  const llmDraft = await call('POST', '/api/v1/llm/drafts', { kind: 'llm-draft', name: 'd', template: 't', version: '1.0.0' });
  const prompt = await call('POST', '/api/v1/prompts', { name: 'p', template: 't', version: '1.0.0' });
  const graphNode = await call('POST', '/api/v1/graph/nodes', { id: 'n2', kind: 'obligation' });
  const graphEdge = await call('POST', '/api/v1/graph/edges', { id: 'e2', from: 'n2', to: 'sys-001', type: 'derives' });
  const graphImpact = await call('POST', '/api/v1/graph/impact', { startNodeId: 'n2', tenantId: 'demo-tenant' });
  const registrySys = await call('POST', '/api/v1/systems', { owner: 'o', intent: 'i', objectives: [], client: 'c', fundingState: 'f', deploymentStatus: 'd', aiAPlan: 'a', decisionType: 'dt', agenticAttributes: {}, sourceAttribution: {} });
  const registryReconcile = await call('POST', '/api/v1/systems/reconcile', { systems: [registrySys] });
  const registryAia = await call('POST', '/api/v1/systems/' + registrySys.id + '/aia-import', { aiAPlan: 'a', decisionType: 'dt' });
  const remediationAccept = await call('POST', '/api/v1/remediations/' + remediation.id + '/accept', { ticketRef: 'TKT-2' });
  const workflowApprove = await call('POST', '/api/v1/workflows/' + workflow.id + '/approve', {});
  const workflowReject = await call('POST', '/api/v1/workflows/' + workflow.id + '/reject', {});
  const workflowException = await call('POST', '/api/v1/workflows/' + workflow.id + '/exception', { reason: 'r' });
  const measure = await call('POST', '/api/v1/measures', { baseline: 0, threshold: 1, linkedControlId: 'CTRL-001' });
  const measureEval = await call('POST', '/api/v1/measures/evaluate', { measureId: measure.id, value: 2 });
  const measurePut = await call('PUT', '/api/v1/measures/' + measure.id, { baseline: 0, threshold: 1 });
  const measureDel = await call('DELETE', '/api/v1/measures/' + measure.id);
  const draftGet = await call('GET', '/api/v1/governance/drafts');
  const draftPut = await call('PUT', '/api/v1/governance/drafts/' + draft.id, { status: 'approved' });
  const draftDel = await call('DELETE', '/api/v1/governance/drafts/' + draft.id);
  const sourceGet = await call('GET', '/api/v1/governance/sources');
  const sourcePut = await call('PUT', '/api/v1/governance/sources/' + source.id, { sourceType: 'regulation' });
  const sourceDel = await call('DELETE', '/api/v1/governance/sources/' + source.id);
  const obligationGet = await call('GET', '/api/v1/governance/obligations');
  const obligationPut = await call('PUT', '/api/v1/governance/obligations/' + obligation.id, { title: 'x' });
  const obligationDel = await call('DELETE', '/api/v1/governance/obligations/' + obligation.id);
  const impactGet = await call('GET', '/api/v1/impact/systems/' + registrySys.id);
  const impactGet2 = await call('GET', '/api/v1/impact');
  const assessGet = await call('GET', '/api/v1/assessments/findings');
  const assessPut = await call('PUT', '/api/v1/assessments/findings/' + finding.id, { state: 'Met' });
  const assessDel = await call('DELETE', '/api/v1/assessments/findings/' + finding.id);

  console.log('S-02 Requirement change flow completed');
}

async function runS03() {
  console.log('--- S-03 System change: Registry system reconcile + AIA import + impact + workflow ---');
  const registrySys = await call('POST', '/api/v1/systems', { owner: 'team-1', intent: 'i', objectives: [], client: 'c', fundingState: 'f', deploymentStatus: 'd', aiAPlan: 'a', decisionType: 'dt', agenticAttributes: {}, sourceAttribution: {} });
  const registryReconcile = await call('POST', '/api/v1/systems/reconcile', { systems: [registrySys] });
  const registryAia = await call('POST', '/api/v1/systems/' + registrySys.id + '/aia-import', { aiAPlan: 'a', decisionType: 'dt' });
  const impact = await call('POST', '/api/v1/impact/analyse', { changedNodeId: registrySys.id, changedNodeType: 'aiSystem', tenantId: 'demo-tenant' });
  const finding = await call('POST', '/api/v1/assessments/findings', { systemId: registrySys.id, controlId: 'CTRL-001', state: 'Not met', confidence: 0.9, explanation: 'System change impact not assessed.', evidence: [] });
  const workflow = await call('POST', '/api/v1/workflows', { findingId: finding.id, status: 'pending' });
  const remediation = await call('POST', '/api/v1/remediations', { findingId: finding.id, action: 'Re-assess impact for changed system', status: 'draft' });
  console.log('S-03 System change flow completed');
}

async function runS04() {
  console.log('--- S-04 Measure breach: evaluate measure, remediation accept, workflow approve ---');
  const measure = await call('POST', '/api/v1/measures', { baseline: 0, threshold: 1, linkedControlId: 'CTRL-001' });
  const measureEval = await call('POST', '/api/v1/measures/evaluate', { measureId: measure.id, value: 2 });
  const finding = await call('POST', '/api/v1/assessments/findings', { systemId: 'sys-001', controlId: 'CTRL-001', state: 'Not met', confidence: 0.9, explanation: 'Measure breach detected.', evidence: [] });
  const remediation = await call('POST', '/api/v1/remediations', { findingId: finding.id, action: 'Remediate measure breach', status: 'draft' });
  const remediationAccept = await call('POST', '/api/v1/remediations/' + remediation.id + '/accept', { ticketRef: 'TKT-4' });
  const workflow = await call('POST', '/api/v1/workflows', { findingId: finding.id, status: 'pending' });
  const workflowApprove = await call('POST', '/api/v1/workflows/' + workflow.id + '/approve', {});
  console.log('S-04 Measure breach flow completed');
}

async function runS05() {
  console.log('--- S-05 Review and respond: approve/reject/exception, notify, report, AIO ---');
  const finding = await call('POST', '/api/v1/assessments/findings', { systemId: 'sys-001', controlId: 'CTRL-001', state: 'Not met', confidence: 0.9, explanation: 'Review needed.', evidence: [] });
  const workflow = await call('POST', '/api/v1/workflows', { findingId: finding.id, status: 'pending' });
  const workflowApprove = await call('POST', '/api/v1/workflows/' + workflow.id + '/approve', {});
  const workflowReject = await call('POST', '/api/v1/workflows/' + workflow.id + '/reject', {});
  const workflowException = await call('POST', '/api/v1/workflows/' + workflow.id + '/exception', { reason: 'exception' });
  const notify = await call('POST', '/api/v1/notifications', { kind: 'alert', channel: 'teams', severity: 'info', title: 'S-05', message: 'm', target: finding.id });
  const report = await call('POST', '/api/v1/reports', { kind: 'bilingual-report', language: 'en', format: 'markdown', content: 'S-05 report' });
  const oscal = await call('POST', '/api/v1/reports/export/oscal', { kind: 'oscal-export', format: 'oscal' });
  const bulk = await call('POST', '/api/v1/reports/export/bulk', { kind: 'bulk-export', format: 'bulk' });
  const answerKey = await call('POST', '/api/v1/answer-keys', { question: 'q', expected: 'a' });
  const aiqa = await call('POST', '/api/v1/ai-qa/run', { answerKeyId: answerKey.id, score: 0.9 });
  const llmDraft = await call('POST', '/api/v1/llm/drafts', { kind: 'llm-draft', name: 'd5', template: 't', version: '1.0.0' });
  const prompt = await call('POST', '/api/v1/prompts', { name: 'p5', template: 't', version: '1.0.0' });
  console.log('S-05 Review and respond flow completed');
}

async function runS06() {
  console.log('--- S-06 Extensibility and crosswalk: source/draft/obligation/report/AI-OPS ---');
  const source = await call('POST', '/api/v1/governance/sources', { sourceType: 'regulation', language: 'en', title: 'Phase 3 Demo - S-06 Source', clauses: [{ clauseId: 'PIP-1', text: 'Personal data processing requires impact assessment.' }] });
  const draft = await call('POST', '/api/v1/governance/drafts', { sourceId: source.id, source: source, type: 'obligation', citations: [{ citationId: 'PIP-1', text: 'Personal data processing requires impact assessment.' }], draft: { obligations: [{ obligationId: 'OBL-6', text: 'Assess impact before processing personal data.' }], controlMappings: [], rationale: 'Demo' } });
  const approved = await call('POST', '/api/v1/governance/drafts/' + draft.id + '/approve', {});
  const obligation = await call('POST', '/api/v1/governance/obligations', { title: 't', text: 'x', requirementRef: 'PIP-1' });
  const published = await call('POST', '/api/v1/governance/obligations/' + obligation.id + '/publish', {});
  const impact = await call('POST', '/api/v1/impact/analyse', { changedNodeId: obligation.id, changedNodeType: 'obligation', tenantId: 'demo-tenant' });
  const finding = await call('POST', '/api/v1/assessments/findings', { systemId: 'sys-001', controlId: 'CTRL-001', state: 'Not met', confidence: 0.9, explanation: 'e', evidence: [] });
  const workflow = await call('POST', '/api/v1/workflows', { findingId: finding.id, status: 'pending' });
  const remediation = await call('POST', '/api/v1/remediations', { findingId: finding.id, action: 'a', status: 'draft' });
  const notify = await call('POST', '/api/v1/notifications', { kind: 'alert', channel: 'teams', severity: 'info', title: 'S-06', message: 'm', target: finding.id });
  const report = await call('POST', '/api/v1/reports', { kind: 'bilingual-report', language: 'en', format: 'markdown', content: 'S-06 report' });
  const oscal = await call('POST', '/api/v1/reports/export/oscal', { kind: 'oscal-export', format: 'oscal' });
  const bulk = await call('POST', '/api/v1/reports/export/bulk', { kind: 'bulk-export', format: 'bulk' });
  const answerKey = await call('POST', '/api/v1/answer-keys', { question: 'q', expected: 'a' });
  const aiqa = await call('POST', '/api/v1/ai-qa/run', { answerKeyId: answerKey.id, score: 0.9 });
  const llmDraft = await call('POST', '/api/v1/llm/drafts', { kind: 'llm-draft', name: 'd6', template: 't', version: '1.0.0' });
  const prompt = await call('POST', '/api/v1/prompts', { name: 'p6', template: 't', version: '1.0.0' });
  const graphNode = await call('POST', '/api/v1/graph/nodes', { id: 'n6', kind: 'obligation' });
  const graphEdge = await call('POST', '/api/v1/graph/edges', { id: 'e6', from: 'n6', to: 'sys-001', type: 'derives' });
  const graphImpact = await call('POST', '/api/v1/graph/impact', { startNodeId: 'n6', tenantId: 'demo-tenant' });
  console.log('S-06 Extensibility and crosswalk flow completed');
}

async function runS07() {
  console.log('--- S-07 Audit and export: audit events, reports, evidence ---');
  const auditGet = await call('GET', '/api/v1/audit/events');
  const report = await call('POST', '/api/v1/reports', { kind: 'bilingual-report', language: 'en', format: 'markdown', content: 'S-07 report' });
  const oscal = await call('POST', '/api/v1/reports/export/oscal', { kind: 'oscal-export', format: 'oscal' });
  const bulk = await call('POST', '/api/v1/reports/export/bulk', { kind: 'bulk-export', format: 'bulk' });
  const findings = await call('GET', '/api/v1/assessments/findings');
  const evidence = await call('GET', '/api/v1/evidence');
  console.log('S-07 Audit and export flow completed');
}

async function runS08() {
  console.log('--- S-08 Platform controls: governance controls/playbooks/crosswalks, draft, obligation, impact, finding, workflow, report ---');
  const controls = await call('GET', '/api/v1/governance/controls');
  const playbooks = await call('GET', '/api/v1/governance/playbooks');
  const crosswalks = await call('GET', '/api/v1/governance/crosswalks');
  const draft = await call('POST', '/api/v1/governance/drafts', { sourceId: 'x', type: 'obligation', citations: [], draft: { obligations: [], controlMappings: [], rationale: 'r' } });
  const approved = await call('POST', '/api/v1/governance/drafts/' + draft.id + '/approve', {});
  const obligation = await call('POST', '/api/v1/governance/obligations', { title: 't', text: 'x', requirementRef: 'PIP-1' });
  const published = await call('POST', '/api/v1/governance/obligations/' + obligation.id + '/publish', {});
  const impact = await call('POST', '/api/v1/impact/analyse', { changedNodeId: obligation.id, changedNodeType: 'obligation', tenantId: 'demo-tenant' });
  const finding = await call('POST', '/api/v1/assessments/findings', { systemId: 'sys-001', controlId: 'CTRL-001', state: 'Not met', confidence: 0.9, explanation: 'e', evidence: [] });
  const workflow = await call('POST', '/api/v1/workflows', { findingId: finding.id, status: 'pending' });
  const remediation = await call('POST', '/api/v1/remediations', { findingId: finding.id, action: 'a', status: 'draft' });
  const notify = await call('POST', '/api/v1/notifications', { kind: 'alert', channel: 'teams', severity: 'info', title: 'S-08', message: 'm', target: finding.id });
  const report = await call('POST', '/api/v1/reports', { kind: 'bilingual-report', language: 'en', format: 'markdown', content: 'S-08 report' });
  const oscal = await call('POST', '/api/v1/reports/export/oscal', { kind: 'oscal-export', format: 'oscal' });
  const bulk = await call('POST', '/api/v1/reports/export/bulk', { kind: 'bulk-export', format: 'bulk' });
  const answerKey = await call('POST', '/api/v1/answer-keys', { question: 'q', expected: 'a' });
  const aiqa = await call('POST', '/api/v1/ai-qa/run', { answerKeyId: answerKey.id, score: 0.9 });
  const llmDraft = await call('POST', '/api/v1/llm/drafts', { kind: 'llm-draft', name: 'd8', template: 't', version: '1.0.0' });
  const prompt = await call('POST', '/api/v1/prompts', { name: 'p8', template: 't', version: '1.0.0' });
  console.log('S-08 Platform controls flow completed');
}

async function main() {
  await runS01();
  await runS02();
  await runS03();
  await runS04();
  await runS05();
  await runS06();
  await runS07();
  await runS08();
  console.log('PHASE 3 TEST/VERIFICATION ORCHESTRATOR COMPLETED');
}

main().catch((e) => {
  console.error('Phase 3 orchestrator failed:', e);
  process.exit(1);
});
