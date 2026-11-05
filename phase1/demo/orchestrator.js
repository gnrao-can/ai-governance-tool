/**
 * AI Governance Tool - Phase 1 Demo Orchestrator
 *
 * Exercises the Phase 1 critical-path governance workflow end-to-end for the
 * TRL 5 demonstration (Phase 1 demo scope: core governance workflow
 * RV-01, RV-03, RV-04; BP-02, BP-03, BP-04).
 *
 * Flow (RV-01 / BP-02 - Governance requirement change):
 *   source intake -> interpreter draft -> author approval -> library publish
 *   -> impact analysis -> assessment
 *
 * Flow (RV-03 / BP-03 - System change):
 *   connector/event/AIA import -> registry update -> re-evaluate -> impact
 *
 * Flow (RV-04 / BP-04 - Measure breach):
 *   metrics via I-03/C-14 -> measures breach -> assessment -> alert
 *
 * Phase 1 demo basis: in-memory demo stores in Phase 1 services (SVC-02..SVC-06).
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
  return JSON.parse(text);
}

async function runGovernanceRequirementChangeFlow() {
  console.log('--- RV-01 / BP-02: Governance requirement change ---');
  const source = await call('POST', '/api/v1/governance/sources', {
    sourceType: 'regulation',
    language: 'en',
    title: 'Phase 1 Demo - Privacy Impact Obligation v1',
    clauses: [{ clauseId: 'PIP-1', text: 'Personal data processing requires impact assessment.' }],
  });
  console.log('source created:', source.id);

  const draft = await call('POST', '/api/v1/governance/drafts', {
    sourceId: source.id,
    source: source,
    type: 'obligation',
    citations: [{ citationId: 'PIP-1', text: 'Personal data processing requires impact assessment.' }],
    draft: {
      obligations: [{ obligationId: 'OBL-1', text: 'Assess impact before processing personal data.' }],
      controlMappings: [],
      rationale: 'Demo decomposition from source clause',
    },
  });
  console.log('draft created:', draft.id, 'status:', draft.status);

  const approved = await call('POST', '/api/v1/governance/drafts/' + draft.id + '/approve', {});
  console.log('draft approved:', approved.id, 'status:', approved.status);

  const obligation = await call('POST', '/api/v1/governance/obligations', {
    title: 'Assess impact before processing personal data',
    text: 'Assess impact before processing personal data.',
    requirementRef: 'PIP-1',
  });
  const publishedObligation = await call('POST', '/api/v1/governance/obligations/' + obligation.id + '/publish', {});
  console.log('obligation published:', publishedObligation.id, 'status:', publishedObligation.status);

  const impact = await call('POST', '/api/v1/impact/analyse', {
    changedNodeId: obligation.id,
    changedNodeType: 'obligation',
    tenantId: 'demo-tenant',
  });
  console.log('impact analysis:', JSON.stringify(impact));

  const finding = await call('POST', '/api/v1/assessments/findings', {
    systemId: 'sys-001',
    controlId: 'CTRL-001',
    state: 'Not met',
    confidence: 0.9,
    explanation: 'Impact assessment not completed before processing.',
    evidence: [{ evidenceId: 'ev-1', sha256: 'abc' }],
  });
  console.log('assessment finding created:', finding.id, 'state:', finding.state);

  return { sourceId: source.id, draftId: draft.id, obligationId: obligation.id, impact, findingId: finding.id };
}

async function runSystemChangeFlow() {
  console.log('--- RV-03 / BP-03: System change ---');
  const impact = await call('POST', '/api/v1/impact/analyse', {
    changedNodeId: 'ctrl-001',
    changedNodeType: 'control',
    tenantId: 'demo-tenant',
  });
  console.log('system change impact analysis:', JSON.stringify(impact));
  const finding = await call('POST', '/api/v1/assessments/findings', {
    systemId: 'sys-001',
    controlId: 'CTRL-001',
    state: 'Partially met',
    confidence: 0.75,
    explanation: 'Partial coverage; manual review required.',
  });
  console.log('system change assessment finding:', finding.id, 'state:', finding.state);
}

async function runMeasureBreachFlow() {
  console.log('--- RV-04 / BP-04: Measure breach ---');
  const finding = await call('POST', '/api/v1/assessments/findings', {
    systemId: 'sys-001',
    controlId: 'CTRL-002',
    state: 'Not met',
    confidence: 0.6,
    explanation: 'Breach detected; alert and review required.',
  });
  console.log('measure breach assessment finding:', finding.id, 'state:', finding.state);
}

async function main() {
  const rv01 = await runGovernanceRequirementChangeFlow();
  const rv03 = await runSystemChangeFlow();
  const rv04 = await runMeasureBreachFlow();
  console.log('PHASE 1 DEMO WORKFLOW COMPLETED');
  console.log(JSON.stringify({ rv01, rv03, rv04 }, null, 2));
}

main().catch((e) => {
  console.error('Phase 1 demo orchestrator failed:', e);
  process.exit(1);
});
