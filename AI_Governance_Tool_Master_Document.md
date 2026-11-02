# AI Governance Tool — Master Document (TRL 5)

**Status:** Draft — for internal review and bid submission support  
**Sources:**
1. *AI Governance Tool — Solution Architecture (TRL 5).docx* — HustleBench Advisory Services Inc. / ISC challenge
2. *SOW — Problem statement.docx* — GoC SSC / ISC challenge

**Related documents** (same folder):
- AI_Governance_Tool_Design_Specification.md
- AI_Governance_Tool_Task_Breakdown.md
- AI_Governance_Tool_Traceability_Matrix.md
- AI_Governance_Tool_Phased_Delivery_Plan.md

---

## 1. Purpose and scope

### 1.1 Purpose
The AI Governance Tool addresses the GoC (SSC) ISC challenge on **AI decision-making process visibility, traceability and compliance governance**. This master document consolidates the specification, design, task breakdown, traceability matrix and phased delivery plan produced from the source documents.

### 1.2 Scope
- **In scope (TRL 5 prototype):** all **18 mandatory outcomes** (M-01 … M-18), all **4 additional outcomes** (A-01 … A-04), and **derived outcomes** (D-01 … D-08).
- **Out of scope:** production operations, formal authorisation to operate, full ISO/IEC 42001 and EU AI Act content packs.

### 1.3 Architecture principles
- **P-01 Humans decide** — AI drafts and flags; no finding/control/version final without authorised approval.
- **P-02 Deterministic where it matters** — applicability, impact and response tier from versioned rules; AI only for reading/drafting.
- **P-03 Open by default** — OSCAL/JSON Schema, OpenAPI/AsyncAPI/CloudEvents, open-source core.
- **P-04 Integrate, don't replace** — departmental systems remain system of record.
- **P-05 Traceable end to end** — findings link to clause, control version, evidence, submitter, reviewer, decision.
- **P-06 Sovereign and secure** — all data/model/processing in GC Protected B environment.
- **P-07 Tenant-owned configuration** — thresholds, profiles, retention, residency, reviewers are tenant config.
- **P-08 Bilingual and accessible from the start** — EN/FR and WCAG 2.1 AA built in.
- **P-09 Least change, most assurance** — targeted reassessment; unaffected findings carry forward.

## 2. Source documents and traceability

| Source | Content |
|---|---|
| AI Governance Tool — Solution Architecture (TRL 5).docx | Requirements register, architecture, components C-01…C-21, interfaces I-01…I-15, runtime views RV-01…RV-05, AI design, security, tech/deployment, ADRs, risks, traceability matrix, test scenarios S-01…S-08 |
| SOW — Problem statement.docx | Problem statement, mandatory outcomes, additional outcomes, desired outcomes |

Every requirement, design element, task and test scenario traces to source clause IDs (M-/A-/D-), components (C-x), interfaces (I-x), runtime views (RV-x), business processes (BP-x), decisions (ADR-x), risks (R-x) and test scenarios (S-x).

## 3. Requirements and acceptance criteria

### 3.1 Mandatory outcomes — M-01 … M-18

| ID | Requirement (summary) | Acceptance criteria |
|---|---|---|
| **M-01** | Continuously align registered AI systems with Canadian regulations; identify affected systems; indicate reassessment required. | AC-M-01-1: Given a governance source is published, When impact analysis runs, Then affected systems/findings are identified (< 1 min for 100 systems). AC-M-01-2: Given affected system, When reassessment due, Then requirement and trigger are indicated. |
| **M-02** | Interoperate with enterprise systems, AI/ML platforms and governance solutions with minimal customization. | AC-M-02-1: Given external system, When Registry API (I-01)/events (I-07) used, Then data exchanged. AC-M-02-2: Given connector needed, When SDK used, Then minimal customization. |
| **M-03** | Exchange governance information via standards-based APIs/connectors: system metadata, ownership, intent, deployment, funding, client info, objectives, risk assessments, AIA, control requirements, findings, evidence, monitoring, approvals, decisions. | AC-M-03-1: Given AIA import (I-08), When ingested, Then linked to system. AC-M-03-2: Given decision record (I-04), When ingested via OTLP, Then linked to system/controls. |
| **M-04** | Collect, aggregate and maintain governance information across multiple systems. | AC-M-04-1: Given multiple systems, When connectors sync, Then single reconciled registry with source attribution. |
| **M-05** | Use open standards and documented interfaces to reduce proprietary dependency. | AC-M-05-1: Given governance data exchange, When via OSCAL/OpenAPI/CloudEvents, Then interoperable with peer tools. |
| **M-06** | Restrict, monitor and control administrative, support and data access per GC requirements. | AC-M-06-1: Given privileged action, When performed, Then audit logged, JIT/step-up controls applied. AC-M-06-2: Given support access, When granted, Then Canada-based cleared staff, time-bound. |
| **M-07** | Let organisations define/manage data residency, retention, access, deletion without vendor intervention. | AC-M-07-1: Given tenant config, When set, Then applied. AC-M-07-2: Given active hold, When deletion requested, Then blocked and logged (D-07). |
| **M-08** | Assess/reassess when requirements/frameworks change; translate requirements into traceable controls; assess satisfaction; identify non-conformities. | AC-M-08-1: Given EN+FR source, When processed, Then clause-level obligations/controls/mappings with citations. AC-M-08-2: Given publish, When impact analysis runs, Then affected findings identified. AC-M-08-3: Given criteria change, When reassessed, Then full reassessment if AIA impact may shift. |
| **M-09** | Authorised users add/modify/version/replace/retire requirements/frameworks; demonstrate compliance against Policy on Service and Digital, DADM, AIA, AI Strategy, AI ethics. | AC-M-09-1: Given author, When retires version, Then dependents flagged. AC-M-09-2: Given publish, When approval completes, Then immutable version published. |
| **M-10** | Manage controls and assessment criteria the same way; apply criteria by intended use/risk/governance need; extensible to NIST, ISO, EU AI Act. | AC-M-10-1: Given criteria, When assigned via profile, Then assessment applies. AC-M-10-2: Given new framework, When crosswalk registered, Then mappings created. |
| **M-11** | Generate human-readable explanations: applicable requirement, evidence, result, confidence/certainty. | AC-M-11-1: Given finding, When explanation generated, Then EN/FR, cites evidence, carries confidence. AC-M-11-2: Given low confidence, When below floor, Then Unable to determine, human review required. |
| **M-12** | Collect, link and retain assurance artefacts; identify whether each was provided by authorised individual. | AC-M-12-1: Given evidence, When SHA-256/provenance recorded, Then retained and linked. AC-M-12-2: Given approval/exception/attestation, When finalised, Then audit history retained. |
| **M-13** | Produce measurable results distinguishing Met, Partially met, Not met, Not applicable, Unable to determine. | AC-M-13-1: Given assessment, When complete, Then exactly one of five states. AC-M-13-2: Given data-quality/performance issue, When breached, Then findings update. |
| **M-14** | Authorised reviewers validate/reject/modify/annotate findings with retained audit history. | AC-M-14-1: Given reviewer, When finalises finding, Then original+change+reason in audit. AC-M-14-2: Given SoD, When submitter finalises, Then rejected. |
| **M-15** | Assess/reassess risks from data, models and AI-generated outputs; feed into governance. | AC-M-15-1: Given metrics breach, When detected, Then findings move and alert < 5 min. |
| **M-16** | Assess data risks and quality, with baselines, thresholds, traceable issues. | AC-M-16-1: Given baselines/thresholds, When breached, Then issue record created. |
| **M-17** | Define/evaluate/reassess configurable risk, performance and quality measures per system. | AC-M-17-1: Given system context, When measures defined, Then evaluated. |
| **M-18** | Evaluate/monitor AI outputs for accuracy, quality, fairness, consistency, safety, alignment. | AC-M-18-1: Given AI output, When evaluation criteria run, Then metrics computed. |

### 3.2 Additional outcomes — A-01 … A-04
- **A-01** Deploy on-prem/private/Canadian cloud without significant change. AC: same charts deploy to CNCF-conformant K8s (A-01 design).
- **A-02** Bilingual UI, docs, reporting, workflows EN/FR. AC: EN/FR strings externalised; AI French flagged for same review (D-02).
- **A-03** Multi-tenant shared platform with independent policies. AC: tenant-scoped records, row-level security, per-tenant keys; enterprise content inherited read-only.
- **A-04** Reports, alerts, notifications; integrate with collaboration/ticketing. AC: remediation accept → ServiceNow/Jira ticket (I-09/I-10); alerts via I-11.

### 3.3 Derived outcomes — D-01 … D-08
- **D-01** Demonstrate TRL 5 in Protected B. AC: security evidence produced for SSC authorisation.
- **D-02** AI-drafted content subject to human approval. AC: drafts only; author approval before publish.
- **D-03** Meet WCAG 2.1 AA. AC: WCAG 2.1 AA for UI and reports.
- **D-04** Register and assess platform itself against own GC content pack. AC: self-registered, self-assessed, findings visible to evaluators.
- **D-05** Keep LLM and all data in-tenant, no external calls. AC: no egress; vLLM in-cluster (C-19).
- **D-06** Deliver solely by HustleBench using open-source components/standards. AC: open-source only.
- **D-07** Support legal/access-to-information holds. AC: deletion blocked while hold active.
- **D-08** Visibility into decision-making: decision maps/records/output traceability. AC: decision records via I-04, findings link decisions (RV-05, S-05/S-07).

## 4. Design specification (consolidated)

- Architecture: event-driven governance platform (Solution Architecture §1–2).
- Information architecture: 12 versioned, tenant-scoped entities; traceability graph; data lifecycle; stores (PostgreSQL+AGE, S3, hash-chained audit, OpenSearch, per-tenant keys).
- Application design: C-01…C-21 (layers, responsibilities, build basis, source requirements).
- Integration design: I-01…I-15 (versioned, tenant-scoped, OAuth 2.0/OIDC, OpenAPI/AsyncAPI/CloudEvents/OTLP); event types; integration patterns.
- Runtime design: RV-01…RV-05, BP-01…BP-07.
- AI design: C-07, C-09, C-11, C-19, retrieval, QA, security (four LLM uses; drafts/flags; human approval).
- Security design: Protected B, ITSG-33, identity (C-20), SoD, privileged access, audit (C-16/I-15), data protection, network.
- Tech/deployment design: OpenShift cluster, namespaces gov-edge/gov-core/gov-data/gov-ai/gov-security/gov-ops, resilience, delivery pipeline, portability, sizing.
- ADRs: ADR-01…ADR-08. Risks: R-01…R-06. Cross-cutting: bilingualism, accessibility, multi-tenancy, observability, quality attributes.

## 5. Task breakdown (consolidated)

- INFRA-1…3, DATA-1, SVC-01…SVC-14, TEST-S1…S-8 (as detailed in AI_Governance_Tool_Task_Breakdown.md).

## 6. Requirements traceability matrix

See **AI_Governance_Tool_Traceability_Matrix.md** (standalone, updated).

## 7. Phased delivery plan

See **AI_Governance_Tool_Phased_Delivery_Plan.md** (standalone).

## 8. Capability assessment

See **AI_Governance_Tool_Specification.md** (§ capability assessment).

## 9. Stage-Gate / Approval Checklist

See **AI_Governance_Tool_Stage_Gate_Checklist.md** (standalone companion document).

Integrated stage-gate summary:

| Stage Gate | Transition | Phase | Decision authority | Timing | Key approval criteria |
|---|---|---|---|---|---|
| Gate 0 | Initiation → Phase 0 | Pre-planning | Delivery Lead | Nov 2026 | Charter & scope approved |
| Gate 1 | Phase 0 → Phase 1 | Phase 0 | Delivery Lead / Architecture Review Board | Dec 2026 (pre-bid) | INFRA-1/2/3, DATA-1 complete; ADRs reviewed |
| Gate 2 | Phase 1 → Phase 2 | Phase 1 | Delivery Lead / SSC Technical Rep | Mar 2027 | SVC-01…SVC-06 demo-ready; core TRL 5 workflow demoed |
| Gate 3 | Phase 2 → Phase 3 | Phase 2 | Delivery Lead / QA / SSC Rep | Jun 2027 | SVC-07…SVC-14 complete; cross-cutting verified |
| Gate 4 | Phase 3 → Phase 4 | Phase 3 | **SSC Acceptance Board** | Aug 2027 | **TRL 5 verified & accepted by SSC** |
| Gate 5 | Phase 4 → Production authorisation | Phase 4 | SSC Authorisation Board | Post-TRL 5 | Formal authorisation to operate |

Full checklist items, approval record template and gate risks: **AI_Governance_Tool_Stage_Gate_Checklist.md**.

---

*End of master document (updated to include Stage-Gate / Approval Checklist, Section 9).*
