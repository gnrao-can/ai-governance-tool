# AI Governance Tool — Requirements Traceability Matrix (TRL 5)

**Status:** Updated master traceability matrix (as of the master document deliverable)  
**Sources:** AI Governance Tool — Solution Architecture (TRL 5).docx; SOW — Problem statement.docx; AI_Governance_Tool_Master_Document.md

## 1. Requirement → design element traceability

| Requirement ID | Requirement (short) | Design Component(s) | Interface(s) | Test Scenario(s) | Design Decision(s) | Business Process(es) | Status |
|---|---|---|---|---|---|---|---|
| **M-01** | Continuous alignment of registered AI systems; affected-system identification; reassessment indication. | C-04, C-08, C-13 | I-07 | S-02, S-03 | ADR-05, ADR-02 | BP-02, BP-03 | Planned |
| **M-02** | Interoperate with enterprise systems, AI/ML platforms, governance solutions, minimal customization. | C-02, C-03 | I-07, I-09, I-10, I-12 | S-01, S-05 | ADR-06, ADR-03 | BP-01, BP-05 | Planned |
| **M-03** | Standards-based exchange of governance information (metadata, ownership, intent, deployment, funding, client, objectives, risks, AIA, controls, findings, evidence, monitoring, approvals, decisions). | C-03, C-12 | I-01, I-06, I-08 | S-01, S-07 | ADR-01, ADR-03 | BP-01, BP-07 | Planned |
| **M-04** | Collect, aggregate, maintain governance info across multiple systems. | C-03, C-12 | I-01, I-07 | S-01 | ADR-03 | BP-01 | Planned |
| **M-05** | Open standards and documented interfaces reduce proprietary dependency. | C-02, C-06, C-17 | I-05, I-06, I-13 | S-06, S-07 | ADR-01, ADR-06 | — | Planned |
| **M-06** | Restrict, monitor and control administrative/support/data access. | C-02, C-20, C-16 | I-14, I-15 | S-08 | ADR-03, ADR-08 | BP-07 | Planned |
| **M-07** | Tenant-managed residency, retention, access, deletion. | C-21 | I-13 | S-08 | ADR-07, ADR-08 | BP-07 | Planned |
| **M-08** | Assess/reassess when requirements change; translate to traceable controls; assess satisfaction; identify non-conformities. | C-06, C-07, C-08, C-09 | I-05 | S-02 | ADR-01, ADR-02, ADR-05 | BP-02, BP-03 | Planned |
| **M-09** | Authorised users add/modify/version/replace/retire requirements/frameworks. | C-06, C-15 | I-05, I-08 | S-01, S-02 | ADR-05, ADR-07 | BP-02 | Planned |
| **M-10** | Manage controls/criteria same way; criteria by intended use/risk/governance need; extensible to NIST/ISO/EU AI Act. | C-06, C-09 | I-05 | S-06 | ADR-01, ADR-02 | BP-02 | Planned |
| **M-11** | Human-readable explanations: applicable requirement, evidence, result, confidence. | C-09 | I-06 | S-02, S-05 | ADR-02, ADR-04 | BP-05 | Planned |
| **M-12** | Collect, link, retain assurance artefacts; identify authorised-providing individual. | C-16, C-20 | I-02 | S-05, S-07 | ADR-08, ADR-03 | BP-05, BP-07 | Planned |
| **M-13** | Measurable results: Met / Partially met / Not met / Not applicable / Unable to determine. | C-09 | I-06 | S-02, S-04 | ADR-02, ADR-04 | BP-04, BP-05 | Planned |
| **M-14** | Reviewers validate/reject/modify/annotate findings; retained audit history. | C-15, C-16 | — | S-05 | ADR-08, ADR-07 | BP-05, BP-06 | Planned |
| **M-15** | Assess/reassess risks from data, models, AI outputs; feed into governance. | C-10, C-09 | I-03 | S-04 | ADR-06, ADR-05 | BP-04, BP-06 | Planned |
| **M-16** | Data risks and quality with baselines, thresholds, traceable issues. | C-10, C-14 | I-03 | S-04 | ADR-06, ADR-07 | BP-04 | Planned |
| **M-17** | Configurable risk/performance/quality measures per system. | C-10 | I-03 | S-04 | ADR-06, ADR-07 | BP-04 | Planned |
| **M-18** | Evaluate/monitor AI outputs (accuracy, quality, fairness, consistency, safety, alignment). | C-10, C-14 | I-03 | S-04 | ADR-06, ADR-04 | BP-04 | Planned |
| **A-01** | Deploy on-prem/private/Canadian cloud without significant change. | All (Helm/operators) | — | S-08 | ADR-03, ADR-07 | — | Planned |
| **A-02** | Bilingual UI/docs/reporting/workflows EN/FR. | C-01, C-17, C-18 | I-11 | S-07, S-08 | ADR-04, ADR-07 | BP-05, BP-07 | Planned |
| **A-03** | Multi-tenant shared platform, independent policies. | C-21, C-20 | — | S-06, S-08 | ADR-07, ADR-03 | BP-01, BP-07 | Planned |
| **A-04** | Reports, alerts, notifications; collaboration/ticketing integration. | C-17, C-18 | I-09, I-10, I-11 | S-04, S-05 | ADR-06, ADR-05 | BP-06 | Planned |
| **D-01** | Demonstrate TRL 5 in Protected B. | Deployment (§10) | — | All | ADR-03, ADR-06 | — | Planned |
| **D-02** | AI-drafted content subject to human approval. | C-07, C-11, C-15 | — | S-02, S-05 | ADR-02, ADR-05 | BP-02, BP-05, BP-06 | Planned |
| **D-03** | Meet WCAG 2.1 AA. | C-01, C-17 | — | S-08 | ADR-04, ADR-06 | BP-07 | Planned |
| **D-04** | Register and assess platform itself against own GC content pack. | C-12, C-09 | — | S-07 | ADR-01, ADR-04 | BP-07 | Planned |
| **D-05** | Keep LLM and all data in-tenant, no external calls. | C-19 | — | S-08 | ADR-04, ADR-03 | — | Planned |
| **D-06** | Deliver solely by HustleBench, open-source components/standards. | All | — | — | ADR-01, ADR-03, ADR-06, ADR-07, ADR-08 | — | Planned |
| **D-07** | Support legal/access-to-information holds. | C-21, C-16 | — | S-08 | ADR-07, ADR-08 | BP-07 | Planned |
| **D-08** | Visibility into decision-making: decision maps/records/output traceability. | C-05, C-12 | I-04 | S-05, S-07 | ADR-05, ADR-03 | BP-05, BP-07 | Planned |

## 2. Architecture principles traceability

| Principle | ID | Design response | Requirement coverage | Status |
|---|---|---|---|---|
| Humans decide | P-01 | C-07/C-11/C-15 drafts require approval; D-02 | M-08, M-14, D-02 | Planned |
| Deterministic where it matters | P-02 | Versioned rules; AI for reading/drafting; ADR-02 | M-01, M-08, M-13, D-02 | Planned |
| Open by default | P-03 | OSCAL/JSON, OpenAPI/AsyncAPI/CloudEvents, open-source core; ADR-01, ADR-06 | M-05 | Planned |
| Integrate, don't replace | P-04 | Connector framework; ADR-03, ADR-07 | M-02, M-04 | Planned |
| Traceable end to end | P-05 | Graph + hash chain; ADR-05, ADR-08 | M-12, M-14, D-08 | Planned |
| Sovereign and secure | P-06 | Protected B; ADR-04, ADR-03 | D-05, D-01 | Planned |
| Tenant-owned configuration | P-07 | C-21 tenant config; ADR-07 | M-07, A-03 | Planned |
| Bilingual and accessible from start | P-08 | C-01 EN/FR, WCAG 2.1 AA; ADR-04 | A-02, D-03 | Planned |
| Least change, most assurance | P-09 | Targeted reassessment; ADR-05, ADR-06 | M-01, M-08, M-15 | Planned |

## 3. Architecture decision traceability

| Decision | ID | Choice | Alternatives considered | Rationale | Requirements served |
|---|---|---|---|---|---|
| Data standard | ADR-01 | OSCAL (extended) | Proprietary | Open tooling, peer exchange (M-05) | M-03, M-05, M-08, M-10 |
| AI scoping rules | ADR-02 | Deterministic rules; AI reading/drafting | Reproducible, explainable | Testable results (P-02) | M-01, M-08, D-02 |
| Graph DB | ADR-03 | PostgreSQL + Apache AGE | Neo4j; separate graph DB | Fewer systems in Protected B (P-06) | M-01, M-12, D-08 |
| LLM serving | ADR-04 | In-tenant open-weight via vLLM | GC-approved external endpoint | D-05; replaceable (P-06) | D-04, D-05 |
| Reassessment | ADR-05 | Event-driven CloudEvents on Kafka | Scheduled batch | Timely reassessment (M-01) | M-01, M-08, D-02 |
| Measures | ADR-06 | Govern ingested measures; package open-source evaluator fallback | Build full monitoring | Innovation focus; monitor any system (M-15…18) | M-15…M-18, M-05 |
| Multi-tenancy | ADR-07 | Logical multi-tenancy + row-level security; optional dedicated namespace | Cluster/DB-per-tenant | Lower cost; stronger isolation optional (A-03, A-01) | A-03, M-07, D-06 |
| Audit log | ADR-08 | Append-only hash-chained log | Standard DB audit tables | Tamper evidence (M-12, M-14) | M-12, M-14 |

## 4. Risk traceability

| Risk | ID | Mitigation | Requirement coverage |
|---|---|---|---|
| LLM misreads requirement/evidence | R-01 | Citations, confidence caps, mandatory human approval, answer-key regression | M-08, M-11, D-02 |
| French quality short of English | R-02 | EN/FR test set; flag French for review | A-02, D-02 |
| GPU capacity unavailable in Protected B | R-03 | Size early; model-agnostic serving | D-05, D-01 |
| OSCAL extension heavier than expected | R-04 | Prototype GC content pack first; document extensions | M-05, M-08 |
| Sole delivery key-person risk | R-05 | Docs, ADRs, conformance suites, cross-trained team | D-06 |
| Departmental tool variance | R-06 | One ingestion API/SDK; packaged evaluator fallback | M-02, M-04, M-15…18 |

## 5. Test scenario traceability (summary)

| Scenario | Focus | Requirements covered |
|---|---|---|
| S-01 Onboard | M-03, M-04, M-09, D-08 | M-03, M-04, M-09, D-08 |
| S-02 Requirement change | M-01, M-08, D-02, M-11 | M-01, M-08, D-02, M-11 |
| S-03 System change | M-01, M-08, D-08 | M-01, M-08, D-08 |
| S-04 Measure breach | M-15…18, M-13, A-04 | M-13, M-15, M-16, M-17, M-18, A-04 |
| S-05 Review and respond | M-12, M-14, D-02, A-04 | M-12, M-14, D-02, A-04 |
| S-06 Extensibility and crosswalk | M-05, M-10, A-03 | M-05, M-10, A-03 |
| S-07 Audit and export | M-12, M-14, D-08, A-02 | M-12, M-14, D-08, A-02 |
| S-08 Platform controls | M-06, M-07, A-03, D-03, D-05, D-07, D-08 | M-06, M-07, A-03, D-03, D-05, D-07, D-08 |

## 6. Traceability update notes

- The master traceability matrix above consolidates and updates the requirement traceability matrix from the Solution Architecture (§12) with design-component and design-decision linkages.
- Every mandatory (M), additional (A) and derived (D) outcome has at least one design component, interface, scenario and design decision linked.
