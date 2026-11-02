# AI Governance Tool — Specification (TRL 5)

**Sources:**
1. *AI Governance Tool — Solution Architecture (TRL 5).docx* (HustleBench Advisory Services Inc. / ISC challenge)
2. *SOW — Problem statement.docx* (GoC SSC / ISC challenge)

**Status:** Draft specification generated for internal review before implementation. Companion to the Solution Architecture document.

---

## 1. Purpose and scope

### 1.1 Purpose
The specification defines what the AI Governance Tool must do (requirements), how it is designed to do it (architecture/design), and how it will be built and verified (tasks and acceptance criteria), for the GoC (SSC) ISC challenge on AI decision-making visibility, traceability and compliance governance.

### 1.2 Scope
- **In scope (TRL 5 prototype):** all **18 mandatory outcomes** (M-01 … M-18), all **4 additional outcomes** (A-01 … A-04), and the **derived outcomes** (D-01 … D-08) of the challenge.
- **Out of scope:** production operations, formal authorisation to operate, and the full ISO/IEC 42001 and EU AI Act content packs (per Solution Architecture §1).

### 1.3 Source traceability
Every requirement below traces to the original challenge clause IDs (M/A/D), the architecture component and interface IDs (C-x / I-x), the runtime views and business processes (RV-x / BP-x), and the test scenarios (S-x) defined in the Solution Architecture §12.

---

## 2. Requirements specification and acceptance criteria

Each requirement is stated, followed by **detailed acceptance criteria** in Given/When/Then form, where applicable.

### 2.1 Governance content management — M-08, M-09, M-10, D-02

| ID | Requirement (summary) | Acceptance criteria |
|---|---|---|
| **M-08** | Continuously assess and reassess systems when requirements/frameworks change; translate requirements into traceable controls; assess satisfaction; identify non-conformities. | - **AC-M-08-1:** Given a governance source is uploaded in EN and FR, **When** the requirement interpreter processes it, **Then** clause-by-clause obligations, controls and mappings with citations are produced. <br> - **AC-M-08-2:** Given a new/changed requirement version is published, **When** impact analysis runs, **Then** affected systems/findings are identified and a response tier is set. <br> - **AC-M-08-3:** Given an assessment framework changes, **When** criteria change, **Then** affected findings are re-assessed, escalating to full reassessment if AIA impact may shift. <br> - **AC-M-08-4:** Given an assessment outcome, **When** computed, **Then** the result is one of Met / Partially met / Not met / Not applicable / Unable to determine. |
| **M-09** | Authorised users add/modify/version/replace/retire requirements and frameworks; demonstrate compliance against Policy on Service and Digital, DADM, AIA, AI Strategy and AI ethics guidance. | - **AC-M-09-1:** Given an authorised governance author, **When** they retire a requirement version, **Then** dependents are flagged and findings carry forward. <br> - **AC-M-09-2:** Given a requirement is published, **When** author approval workflow completes, **Then** a new version is immutable and published. <br> - **AC-M-09-3:** Given an AI-drafted obligation/control, **When** reviewed, **Then** human approval is mandatory before publish (D-02). |
| **M-10** | Manage controls and assessment criteria the same way; apply criteria by intended use, risk profile or governance need; extensible to NIST, ISO and EU AI Act. | - **AC-M-10-1:** Given multiple assessment criteria, **When** a system is registered, **Then** a profile selects applicable criteria. <br> - **AC-M-10-2:** Given a new framework is added, **When** a crosswalk is registered, **Then** mappings are created without core code changes. |
| **D-02** | All AI-drafted content subject to human approval. | - **AC-D-02-1:** Given an LLM draft (obligation, control, remediation), **When** generated, **Then** it is a draft and cannot be final without authorised author approval. |

### 2.2 AI system registry and inventory — M-03, M-04, D-08

| ID | Requirement | Acceptance criteria |
|---|---|---|
| **M-03** | Exchange governance information via standards-based APIs/connectors: system metadata, ownership, intent, deployment, funding, client info, objectives, risk assessments, AIA, control requirements, findings, evidence, monitoring, approvals, decisions. | - **AC-M-03-1:** Given an external system, **When** the Registry API (I-01) or AIA import (I-08) is called, **Then** governance data is ingested with source attribution. <br> - **AC-M-03-2:** Given a decision record is produced, **When** ingested via OTLP (I-04), **Then** it is linked to system and controls for traceability. |
| **M-04** | Collect, aggregate and maintain governance information across multiple systems. | - **AC-M-04-1:** Given multiple systems, **When** connectors sync, **Then** a single reconciled registry record exists with source attribution and conflict handling. |
| **D-08** | Visibility into decision-making: decision maps, decision records, output traceability for registered systems. | - **AC-D-08-1:** Given an AI decision is made, **When** the decision record is created, **Then** inputs/outputs, model version and explanation are retained. <br> - **AC-D-08-2:** Given a finding references a decision, **When** the finding is finalised, **Then** the full chain is traceable (RV-05, S-05/S-07). |

### 2.3 Impact analysis, reassessment and change management — M-01, M-08, M-15

| ID | Requirement | Acceptance criteria |
|---|---|---|
| **M-01** | Continuously align registered AI systems with Canadian regulations; identify affected systems; indicate when reassessment is required. | - **AC-M-01-1:** Given a governance requirement change, **When** published, **Then** impact analysis (C-08 over C-13 graph) finds affected systems and findings within target time (< 1 min for 100 systems). <br> - **AC-M-01-2:** Given an affected system, **When** reassessment is due, **Then** the platform indicates the requirement and triggers reassessment. |
| **M-15** | Assess and reassess risks from data, models and AI-generated outputs; feed into governance assessments. | - **AC-M-15-1:** Given a metrics breach, **When** the measure evaluator (C-10) detects a breach, **Then** linked findings move to Not met / Partially met / Unable to determine and alert is raised (< 5 min). |

### 2.4 Compliance assessment — M-08, M-11, M-13, M-16, M-17, M-18, D-02, D-03

| ID | Requirement | Acceptance criteria |
|---|---|---|
| **M-11** | Generate human-readable explanations: applicable requirement, evidence considered, result, confidence/certainty. | - **AC-M-11-1:** Given a finding, **When** an explanation is generated, **Then** it is in EN/FR, cites evidence and carries confidence. <br> - **AC-M-11-2:** Given low-confidence evidence, **When** confidence falls below the floor, **Then** the result is flagged "Unable to determine" and human review is required. |
| **M-13** | Produce measurable results distinguishing Met, Partially met, Not met, Not applicable, Unable to determine. | - **AC-M-13-1:** Given an assessment run, **When** complete, **Then** the finding state machine yields exactly one of the five states. <br> - **AC-M-13-2:** Given a data-quality or performance issue, **When** baselines/thresholds breached, **Then** findings update accordingly (S-04). |
| **M-16 / M-17 / M-18** | Data risks and quality measures; configurable risk/performance/quality measures; evaluate AI outputs (accuracy, quality, fairness, consistency, safety, alignment). | - **AC-M-16-1:** Given baselines and thresholds, **When** a metric breaches, **Then** a traceable issue record is created. <br> - **AC-M-17-1:** Given a system context, **When** measures are defined, **Then** they are evaluated per system. <br> - **AC-M-18-1:** Given an AI output, **When** evaluation criteria run, **Then** accuracy/quality/fairness/consistency/safety/alignment are measured. |

### 2.5 Assurance, evidence and audit — M-12, M-14, D-07, D-12

| ID | Requirement | Acceptance criteria |
|---|---|---|
| **M-12** | Collect, link and retain assurance artefacts; identify whether each was provided by an authorised individual. | - **AC-M-12-1:** Given evidence submission, **When** SHA-256 and provenance recorded, **Then** artefact is retained and linked to control. <br> - **AC-M-12-2:** Given an approval/exception/attestation, **When** finalised, **Then** an audit history is retained. |
| **M-14** | Authorised reviewers validate/reject/modify/annotate findings with retained audit history. | - **AC-M-14-1:** Given a reviewer, **When** they finalise a finding, **Then** original + change + reason are written to the audit store. <br> - **AC-M-14-2:** Given separation of duties, **When** an evidence submitter finalises, **Then** the action is rejected. |

### 2.6 Oversight, remediation and response — M-14, A-04, D-02, D-07, D-08

| ID | Requirement | Acceptance criteria |
|---|---|---|
| **A-04** | Reports, alerts, notifications; integrate with collaboration/ticketing systems. | - **AC-A-04-1:** Given a remediation action is accepted, **When** approval completes, **Then** ServiceNow/Jira ticket is opened and status read back. <br> - **AC-A-04-2:** Given a breach or finding, **When** triggered, **Then** alert/notification sent to owner/reviewer via Teams/email. |
| **D-07** | Support legal and access-to-information holds on records. | - **AC-D-07-1:** Given an active hold, **When** deletion is requested, **Then** deletion is blocked and logged. |

### 2.7 Bilingualism, accessibility, multi-tenancy and portability — A-02, A-03, D-03, D-07, D-08

| ID | Requirement | Acceptance criteria |
|---|---|---|
| **A-02** | Bilingual UI, docs, reporting and workflows in EN/FR. | - **AC-A-02-1:** Given a user, **When** they select a language, **Then** UI/workflow/reports render in EN or FR. <br> - **AC-A-02-2:** Given AI-generated French, **When** drafted, **Then** it is flagged for the same review as English. |
| **D-03** | Meet WCAG 2.1 AA. | - **AC-D-03-1:** Given a UI screen/report, **When** tested, **Then** it meets WCAG 2.1 AA. |
| **A-03** | Support multiple organisations on a shared platform with independent policies. | - **AC-A-03-1:** Given two tenants, **When** tenant B registers a system, **Then** its library/profile/thresholds are independent; enterprise content is inherited read-only. |

### 2.8 Derived outcomes — D-01 … D-08

| ID | Derived requirement | Acceptance criteria |
|---|---|---|
| **D-01** | Demonstrate TRL 5 in a Protected B environment. | - **AC-D-01-1:** The deployment demonstrably runs in a Protected B environment with the documented security evidence produced (design, mapping, tests) before authorisation to operate. |
| **D-04** | Register and assess the platform itself against its own GC content pack. | - **AC-D-04-1:** Given the platform, **When** self-registered, **Then** it is assessed and findings are visible to evaluators. |
| **D-05** | Keep the language model and all data in-tenant, no external calls. | - **AC-D-05-1:** Given an LLM call, **When** made, **Then** no prompt/document/output leaves the environment; no egress. |
| **D-06** | Deliver solely by HustleBench using open-source components and standards. | - **AC-D-06-1:** Given the build, **When** verified, **Then** only open-source components and standards are used. |

---

## 3. Design specification

### 3.1 Architecture overview and principles
The solution is an **event-driven governance platform** (Solution Architecture §1).

Key design decisions:
- **P-01 Humans decide:** AI drafts and flags only; no finding/control/version final without authorised approval.
- **P-02 Deterministic where it matters:** applicability, impact and response tier from versioned rules; AI only for reading/drafting.
- **P-03 Open by default:** governance data in OSCAL/JSON Schema; interfaces in OpenAPI/CloudEvents; open-source core.
- **P-04 Integrate, don't replace:** departmental systems remain system of record.
- **P-05 Traceable end to end:** every finding links to clause, control version, evidence, submitter, reviewer, decision.
- **P-06 Sovereign and secure:** all data/model/processing inside GC Protected B environment.
- **P-07 Tenant-owned configuration.**
- **P-08 Bilingual and accessible from the start (EN/FR, WCAG 2.1 AA).**
- **P-09 Least change, most assurance.**

### 3.2 Information architecture
Twelve versioned, tenant-scoped entities (Solution Architecture §4): Governance source, Obligation, Control, Playbook (profile), Crosswalk, AI system, AIA record, Measure, Evidence, Decision record, Finding, Action. Data lifecycle create → version → supersede → retain → delete. Stores: PostgreSQL + Apache AGE, S3-compatible object storage, append-only hash-chained audit log, OpenSearch, encryption at rest with per-tenant keys.

### 3.3 Application architecture — components
Twenty-one components in six layers (Solution Architecture §5); reasoning components C-07 … C-11 are HustleBench core IP; others open-source or thin HustleBench services.

| Component | Layer | Responsibility | Build basis | Source requirements |
|---|---|---|---|---|
| C-01 | Experience | Bilingual web UI (EN/FR, WCAG 2.1 AA) | React + i18n | A-02, D-03 |
| C-02 | Integration | API gateway, auth, rate limiting, tenant routing | Open-source gateway on OpenShift | M-02, M-03, M-05 |
| C-03 | Integration | Connector framework + SDK, pull/push | HustleBench framework on open-source runtime | M-02, M-04 |
| C-04 | Integration | Event bus (change events, CloudEvents) | Apache Kafka (Strimzi) | M-01 |
| C-05 | Integration | Decision trace ingestion/linking | OpenTelemetry collector + HustleBench linker | D-08 |
| C-06 | Knowledge | Requirement/obligation/control library, versioning, crosswalks | HustleBench service on OSCAL tooling | M-08, M-09, M-10 |
| C-07 | Reasoning | Requirement interpreter: draft obligations/controls from changed sources, with citations | HustleBench + in-tenant LLM (C-19) | M-08, D-02 |
| C-08 | Reasoning | Impact analyser: graph traversal, response tiering | HustleBench | M-01, M-08 |
| C-09 | Reasoning | Assessment engine: applicability, control evaluation, five-state results, explanations, confidence | HustleBench + Open Policy Agent; LLM evidence review (flagged) | M-08, M-11, M-13 |
| C-10 | Reasoning | Measures evaluator: baselines, thresholds, breach records | HustleBench | M-15 … M-18 |
| C-11 | Reasoning | Remediation recommender: draft actions for unmet controls | HustleBench + in-tenant LLM | M-14, D-02 |
| C-12 | Knowledge | AI system registry: records, reconciliation, AIA import | HustleBench service on PostgreSQL | M-03, M-04 |
| C-13 | Knowledge | Traceability graph (nodes/edges across entities) | PostgreSQL + Apache AGE | M-01, M-12 |
| C-14 | Reasoning | Packaged evaluation support (Evidently/Fairlearn fallback) | Open-source evaluation libs | M-16, M-18 |
| C-15 | Workflow | Review/approval workflow, exceptions, attestations, separation of duties | Open-source BPMN engine | M-14, D-02 |
| C-16 | Assurance | Evidence and audit store (provenance, hash-chained log, W3C PROV) | S3-compatible object storage | M-12, M-14 |
| C-17 | Assurance | Reporting/export (dashboards, bilingual reports, OSCAL, bulk) | HustleBench | A-04, M-05 |
| C-18 | Workflow | Notifications/alerts (Teams, email) | HustleBench | A-04 |
| C-19 | Platform | In-tenant LLM serving (vLLM on GPU, open-weight model) | vLLM on GPU nodes | D-05 |
| C-20 | Platform | Identity and access (Keycloak federation, OIDC/SAML) | Keycloak | M-06 |
| C-21 | Platform | Tenant administration (residency, retention, holds, keys, roles) | HustleBench | M-07, A-03, D-07 |

### 3.4 Integration architecture — interfaces
Fifteen versioned, tenant-scoped, secured (OAuth 2.0 / OIDC, OpenAPI 3.1 / AsyncAPI / JSON Schema / CloudEvents, OTLP) interfaces I-01 … I-15 (Registry, Evidence, Metrics, Decision record, Governance library, Assessment results, Events, AIA import, ServiceNow, Jira, Notifications, Peer governance sync, Bulk export, Identity, Audit/security log).

Platform event types: `governance.requirement.published`, `governance.requirement.retired`, `governance.criteria.changed`, `system.registered`, `system.changed`, `measure.breached`, `evidence.expired`, `finding.proposed`, `finding.finalised`, `action.approved`, `action.closed`.

### 3.5 Runtime views and business processes
- **RV-01 Governance requirement change (BP-02):** source intake → C-07 decomposition → C-15 author approval → C-06 publish → C-08 impact analysis → C-09 targeted reassessment → finding.proposed → C-15 review task, C-18 notify. Events: governance.requirement.published.
- **RV-02 Assessment framework change:** as RV-01 from `governance.criteria.changed`.
- **RV-03 System change (BP-03):** connector/event/AIA import → C-12 update → C-09 re-evaluate → C-08 targeted/full reassessment → findings to review.
- **RV-04 Measure breach (BP-04):** metrics via I-03/C-14 → C-10 breach → C-09 reassessment → C-18 alert, C-15 review task.
- **RV-05 Review, remediation and closure (BP-05, BP-06):** reviewer finalisation in C-15 → C-16 audit → C-11 remediation draft → reviewer accept → action.approved → ticket via I-09/I-10 → closure evidence → action.closed → targeted reassessment. Evidence expiry → evidence.expired → Unable to determine → RV-05.

### 3.6 AI design inside the tool
- LLM used in exactly four places, always drafts/flags, never decides applicability, impact or final result:
  - **Requirement decomposition (C-07):** drafts obligations/controls with clause citations; author approval before publish (D-02).
  - **Evidence review (C-09):** proposed result with confidence capped; below floor → Unable to determine, human review required.
  - **Explanation drafting (C-09):** EN/FR plain-language explanations from structured fields; reviewer sees source fields alongside.
  - **Remediation drafting (C-11):** draft actions for unmet controls; reviewer acceptance required before ticket.
- **Model/serving (C-19):** open-weight model, strong EN/FR, vLLM on GPU in OpenShift, no external calls (D-05), model-agnostic serving, EN/FR test set selection in phase 1, AI QA answer key for decompositions/findings, prompt templates version-controlled, evidence treated as untrusted (prompt injection resistance), schema-validated outputs, self-governance D-04.

### 3.7 Security design
- Protected B, medium integrity/availability, ITSG-33 controls; identity-based access, separation of duties, tamper-evident audit trail.
- **Identity (C-20):** SSC IdP federation (OIDC/SAML) with MFA; service accounts OAuth 2.0 client credentials, short-lived tokens; RBAC + attributes enforced at gateway and service level.
- **Separation of duties:** evidence submitter ≠ finding finaliser; remediation author ≠ approver; artefact records submitter identity/role (M-12).
- **Privileged/support access (M-06):** step-up auth, JIT elevation with tenant approval + expiry, session recording, Canada-based cleared support staff.
- **Audit (C-16/I-15):** append-only hash-chained log; every read/change/approval/admin action logged; tamper-evident; streams to departmental SIEM.
- **Data protection:** TLS 1.2+, CCCS-approved algorithms, AES-256 at rest, per-tenant keys via OpenBao; no data/prompt/telemetry egress; PIA for personal data in decision records.
- **Network:** restricted zone; gateway exposed to operations zone; egress denied by default.

### 3.8 Technology and deployment design
- Single Red Hat OpenShift cluster in GC data centre, Protected B restricted zone, GPU worker pool, OpenShift Data Foundation (block + S3).
- Namespaces: `gov-edge`, `gov-core`, `gov-data`, `gov-ai`, `gov-security`, `gov-ops`, optional `tenant-<name>`.
- **Resilience (TRL 5):** single cluster acceptable; stateful services with replicas; PostgreSQL synchronous replication + WAL archiving; object-storage backups outside cluster storage; RPO/RTO targets proposed (15 min / 15 min / 8 business hours; availability 99.5% during demo; UI < 2s p95; impact analysis < 1 min; targeted reassessment < 15 min; breach→alert < 5 min; draft obligations < 30 min).
- **Delivery:** GitOps (OpenShift GitOps/Argo CD), hardened base images, signing, vulnerability scanning, SBOM, Helm charts/Operators as code.
- **Portability (A-01):** same charts deploy to any CNCF-conformant Kubernetes incl. private cloud and Canadian-region public cloud.
- **Sizing (phase 1, to be validated):** 2 tenants, ~a dozen systems, small reviewer group; 3 control-plane, 3 general workers, 2 GPU nodes.

### 3.9 Cross-cutting concerns
- **Bilingualism (A-02):** externalised EN/FR strings; sources in both languages aligned clause-by-clause; findings/reports/notifications in recipient's language.
- **Accessibility (D-03):** WCAG 2.1 AA, automated checks in pipeline + manual AT testing before demo.
- **Multi-tenancy (A-03):** tenant-scoped records, row-level security, tenant-filtered retrieval, per-tenant keys; enterprise content published once and inherited read-only.
- **Observability:** metrics/logs/traces for every service, correlation IDs across event→closure; operator dashboards.
- **Quality attributes:** reproducibility, auditability, explainability, extensibility, performance, availability, portability (targets in §3.9 table).

### 3.10 Architecture decisions and risks
- **ADRs:** ADR-01 OSCAL as data standard (extended schema); ADR-02 deterministic rules for AI-driven scoping; ADR-03 graph in PostgreSQL via Apache AGE; ADR-04 in-tenant open-weight LLM via vLLM; ADR-05 event-driven reassessment over CloudEvents on Kafka; ADR-06 govern ingested measures, package open-source evaluator as fallback; ADR-07 logical multi-tenancy with row-level security and optional dedicated namespace; ADR-08 append-only hash-chained audit log.
- **Risks:** R-01 LLM misreads requirement (mitigation: citations, confidence caps, mandatory human approval, answer-key regression); R-02 French quality (mitigation: EN/FR test set, flag French for review); R-03 GPU capacity (mitigation: size early, model-agnostic serving); R-04 OSCAL extension heavier than expected (mitigation: prototype GC content pack first); R-05 sole delivery key-person risk (mitigation: docs, ADRs, conformance suites, cross-trained team); R-06 departmental tool variance (mitigation: one ingestion API/SDK, packaged evaluator fallback).

---

## 4. Implementation task list (how the specification will be achieved)

Task list mapped to source requirements, design components and test scenarios. Phase 1 targets TRL 5 demonstration.

### 4.1 Infrastructure and platform tasks
| Task | Title | Source refs | Components | Acceptance criteria |
|---|---|---|---|---|
| INFRA-1 | Provision OpenShift cluster, ODF, GPU pool, networking for Protected B, Keycloak, OpenBao. | D-01, D-05, M-06 | C-20, C-21, C-19, gov-* namespaces | Protected B environment provisioned; no external egress. |
| INFRA-2 | GitOps delivery pipeline, Helm charts/Operators, hardened images, signing, scanning, SBOM. | D-06, A-01, D-01 | All | GitOps deploy verified; images signed/scanned. |
| INFRA-3 | Resilience configuration (HA replicas, PG sync replication, WAL archiving, offsite backups, RPO/RTO). | §3.8 | gov-data, gov-core | RPO/RTO targets met in demo. |

### 4.2 Data layer tasks
| Task | Title | Source refs | Components | Acceptance criteria |
|---|---|---|---|---|
| DATA-1 | PostgreSQL+AGE, Kafka, OpenSearch, S3 object store, hash-chained audit log. | §3.2 | C-13, C-16, C-04, gov-data | Schema for 12 entities validated; audit chain tamper-evident. |

### 4.3 Service implementation tasks
| Task | Title | Source refs | Components | Acceptance criteria |
|---|---|---|---|---|
| SVC-01 | API gateway, web UI (i18n, WCAG). | M-02, M-03, A-02, D-03 | C-01, C-02 | UI EN/FR, WCAG 2.1 AA pass; gateway tenant routing. |
| SVC-02 | Connector framework/SDK, evidence upload API. | M-02, M-04, M-12 | C-03, C-05, C-16, I-02 | SDK template + harness; SHA-256 evidence provenance. |
| SVC-03 | Requirement library service. | M-08, M-09, M-10 | C-06, I-05 | Versioned library, OSCAL mapping, crosswalks. |
| SVC-04 | Requirement interpreter. | M-08, D-02 | C-07, C-19, I-05 | Drafts w/ citations; author approval before publish. |
| SVC-05 | Impact analyser. | M-01, M-08 | C-08, C-13, I-07 | Impact analysis < 1 min for 100 systems. |
| SVC-06 | Assessment engine. | M-08, M-11, M-13, M-15..18 | C-09, I-06, I-03, I-04 | Five-state results; confidence cap; explanations. |
| SVC-07 | Measures evaluator. | M-15..M-18, M-16, M-17 | C-10, C-14, I-03 | Baselines/thresholds; breach → alert. |
| SVC-08 | Remediation recommender. | M-14, D-02, A-04 | C-11, C-15, I-09, I-10 | Draft actions; reviewer accept → ticket. |
| SVC-09 | AI system registry. | M-03, M-04, D-08 | C-12, I-08 | Registry reconcile; AIA import; decision links. |
| SVC-10 | Traceability graph. | M-01, M-12, D-08 | C-13, I-04 | Graph queries for impact. |
| SVC-11 | Review/approval workflow. | M-14, D-02, A-04 | C-15, C-16, I-11 | Separation of duties enforced; audit trail. |
| SVC-12 | Reporting/export. | A-04, M-05, A-02 | C-17, I-06, I-13 | Bilingual reports, OSCAL export. |
| SVC-13 | Notifications. | A-04 | C-18, I-11 | Alerts to Teams/email. |
| SVC-14 | LLM serving & AI QA. | D-05, D-04, R-01, R-02 | C-19, C-07, C-09, C-11 | In-tenant only; answer-key QA. |

### 4.4 Test and verification task list (scenarios S-01 … S-08)
| Scenario | Focus | Tasks |
|---|---|---|
| S-01 Onboard | M-03, M-04, M-09, D-08 | SVC-02, SVC-03, SVC-09, SVC-11 |
| S-02 Requirement change | M-01, M-08, D-02, M-11 | SVC-03, SVC-04, SVC-05, SVC-06, SVC-11 |
| S-03 System change | M-01, M-08, D-08 | SVC-02, SVC-09, SVC-06, SVC-05 |
| S-04 Measure breach | M-15..18, M-13, A-04 | SVC-07, SVC-06, SVC-13 |
| S-05 Review and respond | M-12, M-14, D-02, A-04 | SVC-11, SVC-08, SVC-12, SVC-13 |
| S-06 Extensibility and crosswalk | M-05, M-10, A-03 | SVC-03, SVC-06, SVC-12 |
| S-07 Audit and export | M-12, M-14, D-08, A-02 | SVC-12, SVC-16 |
| S-08 Platform controls | M-06, M-07, A-03, D-03, D-05, D-07, D-08 | INFRA-1, SVC-01, SVC-16, SVC-21, SVC-14 |

### 4.5 Task sequencing (high level)
1. INFRA-1, INFRA-2, DATA-1 (foundation).
2. SVC-01 … SVC-03 (gateway, UI, library, connectors).
3. SVC-04 … SVC-06 (reasoning pipeline: interpreter, impact, assessment).
4. SVC-07 … SVC-11 (measures, remediation, registry, workflow, evidence).
5. SVC-12 … SVC-14 (reporting, notifications, LLM serving, AI QA, self-governance).
6. S-01 … S-08 verification, remediation, demo freeze.

---

## 5. Capability assessment — where I am not capable (and where the team must be)

I can perform and deliver, within this environment:
- **Capability:** reading source documents (via pandoc conversion), analysing requirements/architecture, authoring this specification, design description, and implementation task plan.

I **cannot**, within the current environment, perform:
- **Deployment** of the solution to the GC Protected B environment (OpenShift, ODF, GPU hardware, licences).
- **Execution** of LLM inference, GPU serving, or running the TRL 5 demonstration.
- **Integration** with live ServiceNow/Jira/Teams/IdP instances and production departmental systems.
- **Security assessment** or authorisation to operate (SSC's responsibility).
- **Full implementation** coding/testing of the platform here.

**Advice:** the specification and task plan above are complete for the TRL 5 prototype deliverable. Implementation must be executed by the HustleBench delivery team in the Protected B environment, with SSC supplying or procuring OpenShift/ODF/GPU resources and test instances of ServiceNow/Jira.

---

*Generated from the source documents listed above. All requirement IDs (M-/A-/D-), component IDs (C-x), interface IDs (I-x), runtime views (RV-x), business processes (BP-x) and test scenarios (S-x) should be cross-checked against the source documents during review.*
