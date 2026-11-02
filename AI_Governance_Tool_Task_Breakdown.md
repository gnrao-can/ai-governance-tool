# AI Governance Tool — Implementation Task Breakdown (TRL 5)

**Sources:** AI Governance Tool Specification (same folder), AI Governance Tool Design Specification (same folder), Solution Architecture (TRL 5).docx, SOW Problem statement.docx.

**Note:** Effort estimates below are **indicative** (person-days / weeks) for a HustleBench delivery team, sized for the TRL 5 demonstration. Actuals to be confirmed during phase planning.

---

## 1. Infrastructure tasks

| Task ID | Task | Effort (pd) | Owner(s) | Depends on | Source |
|---|---|---|---|---|---|
| INFRA-1 | Provision OpenShift cluster, ODF, GPU pool, Protected B networking, Keycloak, OpenBao | 10 | DevOps / Security Eng. | — | D-01, D-05, M-06 |
| INFRA-2 | GitOps delivery pipeline, Helm charts/Operators, hardened images, signing, scanning, SBOM | 8 | DevOps | — | D-06, A-01, D-01 |
| INFRA-3 | Resilience config: HA replicas, PG sync replication, WAL archiving, offsite backups, RPO/RTO | 5 | DevOps / Backend | INFRA-1 | §3.8 |

## 2. Data layer tasks

| Task ID | Task | Effort (pd) | Owner(s) | Depends on | Source |
|---|---|---|---|---|---|
| DATA-1 | PostgreSQL+AGE, Kafka, OpenSearch, S3 object store, hash-chained audit log schema | 8 | Backend / Data Eng. | INFRA-1 | §3.2 |

## 3. Service implementation tasks (phase 1)

| Task ID | Task | Effort (pd) | Owner(s) | Depends on | Source |
|---|---|---|---|---|---|
| SVC-01 | API gateway + Bilingual web UI (i18n, WCAG 2.1 AA) | 12 | Backend / Frontend | INFRA-1, DATA-1 | M-02, M-03, A-02, D-03 |
| SVC-02 | Connector framework/SDK, evidence upload API (SHA-256 provenance) | 10 | Backend / Integration | INFRA-1, DATA-1 | M-02, M-04, M-12 |
| SVC-03 | Requirement library service (versioning, OSCAL, crosswalks) | 12 | Backend / Knowledge Eng. | DATA-1 | M-08, M-09, M-10 |
| SVC-04 | Requirement interpreter (LLM draft w/ citations, author approval) | 14 | AI/ML Eng. / Backend | SVC-03, INFRA-1 | M-08, D-02 |
| SVC-05 | Impact analyser (graph traversal, response tiering) | 10 | Backend | SVC-03, DATA-1 | M-01, M-08 |
| SVC-06 | Assessment engine (deterministic rules, Open Policy Agent, five-state, explanations, confidence, LLM evidence review) | 16 | Backend / AI/ML Eng. | SVC-03, SVC-05, DATA-1 | M-08, M-11, M-13, M-15…18 |
| SVC-07 | Measures evaluator (baselines, thresholds, breach → findings) | 8 | Backend / Data Eng. | DATA-1 | M-15…18, M-16, M-17 |
| SVC-08 | Remediation recommender (LLM draft actions, reviewer accept → ticket) | 8 | AI/ML Eng. / Backend | SVC-06, SVC-11 | M-14, D-02, A-04 |
| SVC-09 | AI system registry (reconciliation, AIA import, decision linking) | 10 | Backend | DATA-1 | M-03, M-04, D-08 |
| SVC-10 | Traceability graph service (PostgreSQL + AGE queries) | 6 | Backend | DATA-1 | M-01, M-12, D-08 |
| SVC-11 | Review/approval workflow (BPMN, SoD, attestations, exceptions) | 10 | Backend / Security Eng. | SVC-06, DATA-1 | M-14, D-02, A-04 |
| SVC-12 | Reporting/export (dashboards, bilingual reports, OSCAL, bulk) | 8 | Backend / Frontend | SVC-03, SVC-06 | A-04, M-05, A-02 |
| SVC-13 | Notifications/alerts (Teams, email) | 4 | Backend | SVC-06, SVC-11 | A-04 |
| SVC-14 | LLM serving & AI QA (vLLM, answer key, prompt governance) | 12 | AI/ML Eng. / DevOps | INFRA-1, SVC-04, SVC-06, SVC-08 | D-05, D-04, R-01, R-02 |

## 4. Test and verification tasks (scenarios S-01 … S-08)

| Task ID | Scenario | Focus | Effort (pd) | Owner(s) | Depends on |
|---|---|---|---|---|---|
| TEST-S1 | S-01 Onboard | Registry, library, workflow, AIA import | 6 | QA / Backend | SVC-02…SVC-09, SVC-11 |
| TEST-S2 | S-02 Requirement change | Interpreter, impact, assessment, approval | 8 | QA / AI/ML Eng. | SVC-03…SVC-08, SVC-11 |
| TEST-S3 | S-03 System change | Registry update, re-assessment, impact | 6 | QA / Backend | SVC-02, SVC-06, SVC-09, SVC-05 |
| TEST-S4 | S-04 Measure breach | Measures, assessment, alerts, reporting | 5 | QA / Backend | SVC-07, SVC-06, SVC-13 |
| TEST-S5 | S-05 Review and respond | Workflow, remediation, tickets, export | 6 | QA / Backend / Security | SVC-08, SVC-11, SVC-12, SVC-13 |
| TEST-S6 | S-06 Extensibility and crosswalk | Crosswalk, new framework/connector, multi-tenant | 6 | QA / Backend | SVC-03, SVC-06, SVC-12 |
| TEST-S7 | S-07 Audit and export | Audit chain, export, bilingual reports | 5 | QA / Security | SVC-12, SVC-16, SVC-11 |
| TEST-S8 | S-08 Platform controls | Tenancy, access, residency, retention, holds, accessibility, bilingualism, AI in-tenant | 8 | QA / Security / AI/ML Eng. | INFRA-1, SVC-01, SVC-16, SVC-21, SVC-14 |

## 2. Phase plan summary

| Phase | Focus | Tasks | Est. duration |
|---|---|---|---|
| Phase 0 | Foundations | INFRA-1, INFRA-2, DATA-1, INFRA-3 | 2–3 wks |
| Phase 1 | Core services (gateway/UI, connectors, library, interpreter, impact, assessment) | SVC-01…SVC-06 | 6–8 wks |
| Phase 2 | Assurance, measures, registry, workflow, reporting, LLM/AI QA | SVC-07…SVC-14 | 6–8 wks |
| Phase 3 | Verification & demo freeze (S-01…S-08) | TEST-S1…TEST-S8, remediation | 3–4 wks |

**Total indicative estimate:** ~40–48 person-days for the TRL 5 prototype build (excluding Phase 0 security assessment/authorisation work performed by SSC).

---

## 5. Suggested team ownership (HustleBench delivery team)

| Role | Responsibility |
|---|---|
| Solution Architect | Overall design, ADRs, integration strategy, phase gating |
| Delivery Lead / PM | Task breakdown, phase planning, demo readiness |
| Backend / Integration Engineers | C-02…C-06, C-12…C-13, workflow, reporting |
| AI/ML Engineer | C-07, C-09, C-11, C-14, C-19, AI QA, self-governance |
| Frontend Engineer | C-01 (i18n, WCAG) |
| Security Engineer | C-16, C-20, C-21, security design, audit, holds |
| DevOps / Platform Engineer | INFRA-*, GitOps, deployment, resilience |
| QA / Test Engineer | S-01…S-08 scenarios, regression, accessibility testing |

## 6. Dependencies and critical path
- **Critical path:** INFRA-1 → DATA-1 → SVC-03/04/06 → SVC-11/SVC-08 → TEST-S2/S-05/S-08. LLM serving (SVC-14) and AI QA gate the reasoning components.
- **External dependencies:** SSC identity provider, ServiceNow/Jira test instances, GC Protected B environment, GPU hardware, OpenShift/ODF subscriptions.

## 7. Exit criteria for TRL 5 demonstration
- All mandatory outcomes M-01…M-18 demonstrably satisfied in prototype per acceptance criteria.
- All four additional outcomes A-01…A-04 and derived D-01…D-08 designed and evidenced.
- Test scenarios S-01…S-08 executed with results recorded.
- Security evidence (design, mapping, tests) produced for SSC authorisation to operate.
