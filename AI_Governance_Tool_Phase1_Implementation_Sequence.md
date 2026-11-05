# AI Governance Tool - Phase 1 Implementation Sequence (TRL 5)

**Status:** Sequence derived from design docs; Phase 1 build in progress. Waves 1-2 completed 2026-11-02; Wave 3 demo executed 2026-11-02; Wave 4 (Gate 2) assessment in progress.
**Sources:** AI_Governance_Tool_Specification.md, AI_Governance_Tool_Design_Specification.md, AI_Governance_Tool_Task_Breakdown.md, AI_Governance_Tool_Phase1_Execution.md, AI_Governance_Tool_Phased_Delivery_Plan.md, AI_Governance_Tool_Stage_Gate_Checklist.md, AI_Governance_Tool_Traceability_Matrix.md, Solution Architecture (TRL 5).docx, SOW - Problem statement.docx.

## 1. Phase windows (Phased Delivery Plan)

| Phase | Focus | Tasks | Window | Gate |
|---|---|---|---|---|
| Phase 0 | Foundations & environment | INFRA-1, INFRA-2, DATA-1, INFRA-3 | Nov-Dec 2026 | Gate 1: Phase 0 -> Phase 1 (Bid-ready baseline) |
| Phase 1 | Core services (first phase implementation) | SVC-01...SVC-06 | Jan-Mar 2027 | Gate 2: Phase 1 -> Phase 2 (TRL 5 core capability demo) |
| Phase 2 | Assurance, measures, registry, workflow, reporting, LLM/AI QA | SVC-07...SVC-14 | Apr-Jun 2027 | Gate 3: Phase 2 -> Phase 3 |
| Phase 3 | Verification, demo, SSC acceptance | TEST-S1...TEST-S8, remediation | Jul-Aug 2027 | Gate 4: SSC acceptance at TRL 5 |
| Phase 4 | Production operations / formal authorisation | - | Post-Aug 2027 | Gate 5: SSC authorisation to operate |

## 2. Phase 1 critical path (Task Breakdown)

Critical path: INFRA-1 -> DATA-1 -> SVC-03/04/06 -> SVC-11/SVC-08 -> TEST-S2/S-05/S-08.

Phase 1 critical-path task: SVC-03 (Requirement Library Service) - status In Progress.

## 3. Phase 1 demo scope

Core governance workflow: RV-01, RV-03, RV-04; BP-02, BP-03, BP-04.

- RV-01 (Governance requirement change / BP-02): source intake (EN/FR) -> C-07 decomposition -> C-15 author approval -> C-06 publish -> C-08 impact analysis -> C-09 targeted reassessment -> finding.proposed -> C-15 review task, C-18 notify.
- RV-03 (System change / BP-03): connector/event/AIA import -> C-12 registry update -> C-09 re-evaluate -> C-08 targeted/full reassessment -> findings to review.
- RV-04 (Measure breach / BP-04): metrics via I-03/C-14 -> C-10 breach -> C-09 reassessment -> C-18 alert, C-15 review task.

## 4. Phase 1 build sequence (implementation order)

### Wave 0: Phase 0 prerequisites (must be substantially complete before Phase 1)
1. INFRA-1 - OpenShift, ODF, GPU pool, Protected B, Keycloak, OpenBao.
2. DATA-1 - PostgreSQL+AGE, Kafka, OpenSearch, S3, hash-chained audit.
3. INFRA-2 - GitOps delivery pipeline, Helm charts/Operators, hardened images, signing, scanning, SBOM.
4. INFRA-3 - Resilience config (HA, PG sync replication, WAL archiving, offsite backups, RPO/RTO).

### Wave 1: Phase 1 core services - critical path (implementation start)
1. SVC-03 - Requirement Library (C-06, I-05) - critical-path task; status In Progress; implementation initiated in phase1/svc-03-requirement-library.
2. SVC-04 - Requirement Interpreter (C-07, I-05) - drafts w/ citations; author approval before publish (D-02).
3. SVC-05 - Impact Analyser (C-08, I-07) - graph traversal, response tiering; impact < 1 min for 100 systems.
4. SVC-06 - Assessment Engine (C-09, I-06, I-03, I-04) - five-state results, confidence cap, explanations, LLM evidence review flagged.

Critical-path execution order per Phase 1 execution notes: SVC-03 -> SVC-04 -> SVC-06, with SVC-05 alongside (impact) and SVC-01/SVC-02 enabling integration.

### Wave 2: Phase 1 enabling services for demo
5. SVC-01 - API gateway + Bilingual web UI (C-01, C-02, I-02, I-03, I-05).
6. SVC-02 - Connector framework/SDK, evidence upload API (C-03, C-05, C-16, I-02).

### Wave 3: Phase 1 demo and Gate 2 exit
7. Integrate core governance workflow (RV-01/RV-03/RV-04, BP-02/BP-03/BP-04) into Phase 1 demo.
8. Phase 1 exit (Gate 2): SVC-01...SVC-06 demo-ready; core TRL 5 workflow demoed; Phase 0 gate satisfied.

## 5. Phase 1 task status refresh (from AI_Governance_Tool_Phase1_Execution.md)

| Task | Status |
|---|---|
| SVC-01 | Planned |
| SVC-02 | Planned |
| SVC-03 | In Progress |
| SVC-04 | Planned |
| SVC-05 | Planned |
| SVC-06 | Planned |

## 6. Next actions

1. Complete Phase 0 prerequisites as blockers clear.
2. ~~Complete Phase 1 critical-path implementation: SVC-03 -> SVC-04 -> SVC-06 (plus SVC-05).~~ **Done** (2026-11-02): SVC-03, SVC-04, SVC-05, SVC-06 implemented and syntax-validated.
3. ~~Complete SVC-01/SVC-02 enabling services.~~ **Done** (2026-11-02): SVC-01 (API gateway + bilingual UI), SVC-02 (connector framework / evidence upload) implemented and syntax-validated.
4. ~~Run Phase 1 demo and reach Gate 2.~~ **Done** (2026-11-02): Phase 1 demo orchestrator executed end-to-end via gateway (source -> draft -> approve -> publish -> impact -> assessment; system change; measure breach).
5. **Wave 4 (current)**: Phase 1 exit / Gate 2 assessment — core TRL 5 workflow demoed; Phase 0 gate pending external completion; Gate 2 (Phase 1 -> Phase 2) decision pending (Delivery Lead / SSC Technical Rep, Mar 2027).
