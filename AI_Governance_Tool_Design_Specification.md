# AI Governance Tool — Design Specification (Standalone)

**Sources:**
1. *AI Governance Tool — Solution Architecture (TRL 5).docx*
2. *SOW — Problem statement.docx*

**Status:** Design specification companion to the AI Governance Tool Specification. All IDs below (M-/A-/D-, C-x, I-x, RV-x, BP-x, S-x, ADR-x, R-x) refer to the source documents.

---

## 1. Design overview

The AI Governance Tool is designed as an **event-driven governance platform** that:

1. Maintains a **versioned governance content library** (sources, obligations, controls, playbooks, crosswalks).
2. Maintains a **versioned registry of AI systems** in a **traceability graph**.
3. Uses an **event bus** to trigger **least-change reassessment**.
4. Runs an **assessment engine** that produces deterministic findings with human-readable explanations and confidence.
5. Uses an **in-tenant LLM** only for drafting/flagging, never for final decisions.
6. Routes findings through a **workflow** (review/approval/remediation) with **separation of duties**.
7. Stores evidence and maintains a **tamper-evident hash-chained audit log**.
8. Provides **bilingual (EN/FR), WCAG 2.1 AA** interfaces and multi-tenant administration.

### 1.1 Design principles
- **P-01 Humans decide** — AI drafts and flags; nothing final without authorised approval.
- **P-02 Deterministic where it matters** — applicability, impact and response tier from versioned rules; AI for reading/drafting only.
- **P-03 Open by default** — OSCAL/JSON Schema, OpenAPI/AsyncAPI/CloudEvents, open-source core.
- **P-04 Integrate, don't replace** — departmental systems remain system of record.
- **P-05 Traceable end to end** — findings link to clause, control version, evidence, submitter, reviewer, decision.
- **P-06 Sovereign and secure** — all data/model/processing in GC Protected B environment.
- **P-07 Tenant-owned configuration** — thresholds, profiles, retention, residency, reviewers are tenant config.
- **P-08 Bilingual and accessible from the start** — EN/FR and WCAG 2.1 AA built in.
- **P-09 Least change, most assurance** — targeted reassessment; unaffected findings carry forward.

## 2. Information design

- **Entities (versioned, tenant-scoped, bilingual where text-bearing, OSCAL-mapped):**
  Governance source, Obligation, Control, Playbook (profile), Crosswalk, AI system, AIA record, Measure, Evidence, Decision record, Finding, Action.
- **Traceability graph:** nodes = entities; edges = derived-from, implements, applies-to, evidences, assesses, resolves. Impact analysis = graph traversal from changed node.
- **Data lifecycle:** create → version → supersede → retain → delete. Deletion blocked by active legal/access-to-information hold (D-07).
- **Data stores:** PostgreSQL + Apache AGE (relational + graph); S3-compatible object storage (artefacts); append-only hash-chained audit log; OpenSearch (full-text/bilingual); AES-256 at rest with per-tenant keys (OpenBao).

## 3. Application design

### 3.1 Components
21 components in six layers. Reasoning layer (C-07–C-11) is HustleBench core IP; others open-source or thin HustleBench services.

| Component | Layer | Design responsibility | Build basis | Key source requirements |
|---|---|---|---|---|
| C-01 | Experience | Bilingual web UI, EN/FR, WCAG 2.1 AA | React + i18n | A-02, D-03 |
| C-02 | Integration | API gateway: auth, rate limiting, tenant routing | Open-source gateway on OpenShift | M-02, M-03, M-05 |
| C-03 | Integration | Connector framework + SDK (pull/push) | HustleBench on open-source runtime | M-02, M-04 |
| C-04 | Integration | Event bus (change events, CloudEvents) | Apache Kafka (Strimzi) | M-01 |
| C-05 | Integration | Decision trace ingestion/linking | OpenTelemetry collector + HustleBench linker | D-08 |
| C-06 | Knowledge | Requirement/obligation/control library, versioning, crosswalks | HustleBench service on OSCAL tooling | M-08, M-09, M-10 |
| C-07 | Reasoning | Requirement interpreter (LLM draft w/ citations) | HustleBench + in-tenant LLM (C-19) | M-08, D-02 |
| C-08 | Reasoning | Impact analyser (graph traversal, response tiering) | HustleBench | M-01, M-08 |
| C-09 | Reasoning | Assessment engine (applicability, control evaluation, five-state, explanations, confidence) | HustleBench + Open Policy Agent; LLM evidence review (flagged) | M-08, M-11, M-13 |
| C-10 | Reasoning | Measures evaluator (baselines, thresholds, breach) | HustleBench | M-15…M-18 |
| C-11 | Reasoning | Remediation recommender (LLM draft actions) | HustleBench + in-tenant LLM | M-14, D-02 |
| C-12 | Knowledge | AI system registry (reconciliation, AIA import) | HustleBench on PostgreSQL | M-03, M-04 |
| C-13 | Knowledge | Traceability graph (PostgreSQL + Apache AGE) | PostgreSQL + AGE | M-01, M-12 |
| C-14 | Reasoning | Packaged evaluation support (Evidently/Fairlearn fallback) | Open-source evaluation libs | M-16, M-18 |
| C-15 | Workflow | Review/approval workflow, exceptions, attestations, SoD | Open-source BPMN engine | M-14, D-02 |
| C-16 | Assurance | Evidence & audit store (provenance, hash-chained log, W3C PROV) | S3-compatible object storage | M-12, M-14 |
| C-17 | Assurance | Reporting/export (dashboards, bilingual reports, OSCAL, bulk) | HustleBench | A-04, M-05 |
| C-18 | Workflow | Notifications/alerts (Teams, email) | HustleBench | A-04 |
| C-19 | Platform | In-tenant LLM serving (vLLM on GPU, open-weight) | vLLM on GPU nodes | D-05 |
| C-20 | Platform | Identity & access (Keycloak federation, OIDC/SAML) | Keycloak | M-06 |
| C-21 | Platform | Tenant administration (residency, retention, holds, keys, roles) | HustleBench | M-07, A-03, D-07 |

### 3.2 Integration design
- Interfaces I-01 … I-15: versioned, tenant-scoped, OAuth 2.0 / OIDC secured, OpenAPI 3.1 / AsyncAPI / JSON Schema / CloudEvents / OTLP.
- Event types: `governance.requirement.published`, `governance.requirement.retired`, `governance.criteria.changed`, `system.registered`, `system.changed`, `measure.breached`, `evidence.expired`, `finding.proposed`, `finding.finalised`, `action.approved`, `action.closed` (each with tenant, subject ID, version, correlation ID).
- Integration patterns: pull connectors (scheduled) for systems without events; push (webhook/event) where supported; reconciliation with source attribution and conflict escalation to system owner.

### 3.3 Runtime design
- **RV-01 (Governance requirement change / BP-02):** source intake (EN/FR) → C-07 decomposition → C-15 author approval → C-06 publish → C-08 impact analysis → C-09 targeted reassessment → finding.proposed → C-15 review task, C-18 notify.
- **RV-02 (Criteria change):** same as RV-01 via `governance.criteria.changed`; escalate to full reassessment if AIA impact may shift.
- **RV-03 (System change / BP-03):** connector/event/AIA import → C-12 registry update → C-09 re-evaluate → C-08 targeted/full reassessment → findings to review.
- **RV-04 (Measure breach / BP-04):** metrics via I-03/C-14 → C-10 breach → C-09 reassessment → C-18 alert, C-15 review task.
- **RV-05 (Review, remediation, closure / BP-05, BP-06):** reviewer finalisation (C-15, audit via C-16) → C-11 remediation draft → reviewer accept → action.approved → I-09/I-10 ticket → closure evidence → action.closed → targeted reassessment. Evidence expiry → evidence.expired → Unable to determine → RV-05.

## 4. AI design

- **Use cases (LLM always drafts/flags; never decides):**
  1. Requirement decomposition (C-07): draft obligations/controls with clause citations; author approval before publish (D-02).
  2. Evidence review (C-09): proposed result + rationale + cited passages; confidence capped; below floor → Unable to determine, human review required.
  3. Explanation drafting (C-09): EN/FR plain-language explanation from structured fields; reviewer sees source fields alongside.
  4. Remediation drafting (C-11): draft action for unmet controls; reviewer acceptance required before ticket.
- **Model & serving (C-19):** open-weight model with strong EN/FR, vLLM on GPU nodes in OpenShift, no external calls (D-05), model-agnostic serving layer, EN/FR test set for phase 1 selection, AI QA answer key, version-controlled prompt templates, untrusted-evidence isolation, schema-validated outputs, self-governance (D-04).

## 5. Security design

- Protected B, medium integrity/availability, ITSG-33 controls; identity-based access, separation of duties, tamper-evident audit trail.
- Identity (C-20): SSC IdP federation (OIDC/SAML) with MFA; service accounts OAuth 2.0 client credentials, short-lived tokens; RBAC + attributes at gateway and service level.
- SoD: evidence submitter ≠ finding finaliser; remediation author ≠ approver; artefact records submitter identity/role (M-12).
- Privileged/support access (M-06): step-up auth, JIT elevation with tenant approval + expiry, session recording, cleared Canada-based support staff.
- Audit (C-16/I-15): append-only hash-chained log; reads/changes/approvals/admin actions logged; streams to departmental SIEM.
- Data protection: TLS 1.2+, CCCS-approved algorithms, AES-256 at rest, per-tenant keys (OpenBao), no data/prompt/telemetry egress, PIA for personal data in decision records.
- Network: restricted zone; gateway exposed to operations zone; egress denied by default.

## 6. Technology and deployment design

- Single Red Hat OpenShift cluster in GC data centre, Protected B restricted zone, GPU worker pool, OpenShift Data Foundation (block + S3).
- Namespaces: `gov-edge`, `gov-core`, `gov-data`, `gov-ai`, `gov-security`, `gov-ops`, optional `tenant-<name>`.
- **Resilience (TRL 5):** single cluster acceptable; HA replicas for stateful services; PostgreSQL sync replication + WAL archiving; offsite object-storage backups; RPO/RTO targets (15 min governance data, 1 hour evidence, 15 min component failure, 8 business hours full cluster loss); availability 99.5% during demo; UI < 2s p95; impact analysis < 1 min (100 systems); targeted reassessment < 15 min; breach→alert < 5 min; draft obligations < 30 min.
- **Delivery:** GitOps (OpenShift GitOps/Argo CD); hardened base images, signing, scanning, SBOM; Helm charts/Operators as code.
- **Portability (A-01):** Kubernetes-only dependencies; same build on-premises, private cloud, Canadian-region public cloud.
- **Sizing (phase 1, validated in phase 1):** 2 tenants, ~a dozen systems, small reviewer group; 3 control-plane, 3 general workers, 2 GPU nodes.

## 7. Design decisions (ADRs) and cross-cutting design

- **ADR-01:** OSCAL as governance data standard (extended schema) — makes GC instruments and peer tools exchange natively (M-05).
- **ADR-02:** Deterministic rules for AI-driven applicability/impact/tiering; AI only for reading/drafting — reproducible, auditable results (P-02).
- **ADR-03:** Graph inside PostgreSQL via Apache AGE — fewer systems to secure in Protected B (P-06).
- **ADR-04:** In-tenant open-weight LLM via vLLM — meets D-05; no egress; replaceable (P-06).
- **ADR-05:** Event-driven reassessment over CloudEvents on Kafka; batch retained for scheduled reviews (M-01).
- **ADR-06:** Govern ingested measures; package open-source evaluator (Evidently/Fairlearn) as fallback — ensures every system can be monitored (M-15…M-18).
- **ADR-07:** Logical multi-tenancy with row-level security and per-tenant keys; optional dedicated namespace (A-03, A-01).
- **ADR-08:** Append-only, hash-chained audit log (M-12, M-14).

Cross-cutting design: bilingualism, accessibility (WCAG 2.1 AA), multi-tenancy, observability, quality attributes (reproducibility, auditability, explainability, extensibility, performance, availability, portability).

## 8. Design readiness and open design items

- Design readiness (D-01): HustleBench produces security assessment evidence (control mapping, design, tests) for SSC authorisation; authorisation to operate remains with SSC.
- **Open design items** (for review before implementation, per Solution Architecture §13):
  - ServiceNow AI Control Tower sync vs. IBM watsonx.governance vs. compliance-trestle for peer governance (I-12).
  - Final model selection for phase 1 EN/FR test set.
  - Phase 1 testing of sizing, RPO/RTO, and performance targets.

## 9. Design traceability

Design decisions, components, interfaces and runtime views map back to requirements (M/A/D), architecture principles (P-01…P-09), and quality attributes. Full requirement-to-design mapping is maintained in the AI Governance Tool Specification (§4 traceability matrix).
