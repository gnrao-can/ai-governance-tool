# AI Governance Tool — Stage-Gate / Approval Checklist (TRL 5)

**Status:** Draft — companion to the Phased Delivery Plan  
**Sources:** AI_Governance_Tool_Phased_Delivery_Plan.md; AI_Governance_Tool_Master_Document.md; AI_Governance_Tool_Traceability_Matrix.md; Solution Architecture (TRL 5).docx; SOW — Problem statement.docx

---

## 1. Purpose
This checklist defines the **stage gates** and **approval criteria** required to progress through the phased delivery plan, culminating in **TRL 5 verified and accepted by SSC** during the next phase, and subsequent deploy/integrate within the SSC environment.

## 2. Stage-gate overview

| Stage Gate | From → To | Phase | Decision authority | Timing |
|---|---|---|---|---|
| **Gate 0** | Initiation → Phase 0 | Pre-planning | Sponsor / Delivery Lead | Nov 2026 |
| **Gate 1** | Phase 0 → Phase 1 | Phase 0 | Delivery Lead / Architecture Review Board | Dec 2026 (pre-bid submission) |
| **Gate 2** | Phase 1 → Phase 2 | Phase 1 | Delivery Lead / SSC Technical Rep | Mar 2027 |
| **Gate 3** | Phase 2 → Phase 3 | Phase 2 | Delivery Lead / QA / SSC Technical Rep | Jun 2027 |
| **Gate 4** | Phase 3 → Phase 4 | Phase 3 | **SSC Acceptance Board** (TRL 5 verified & accepted) | Aug 2027 |
| **Gate 5** | Phase 4 → Production authorisation | Phase 4 | SSC Authorisation Board | Post-TRL 5 (out of scope for TRL 5) |

## 3. Gate definitions and approval criteria

### Gate 0 — Initiation → Phase 0
- **Criteria:** Business case, scope (TRL 5), stakeholders, budget, assumptions approved. Phase 0 charter signed.
- **Evidence:** Project charter, approved scope statement, phase 0 plan.
- **Owner:** Delivery Lead.

### Gate 1 — Phase 0 → Phase 1
- **Criteria (Phase 0 completion):**
  - INFRA-1, INFRA-2, DATA-1, INFRA-3 completed per task breakdown.
  - GitOps pipeline, hardened images, signing/scanning/SBOM operational.
  - Data layer schema (PostgreSQL+AGE, Kafka, OpenSearch, S3, hash-chained audit) ready.
  - Architecture decisions (ADRs) reviewed/open for implementation (Architecture §13).
- **Evidence:** Phase 0 completion report, environment validation, pipeline evidence, data schema sign-off.
- **Decision authority:** Delivery Lead (with Architecture Review Board).
- **Gate 2 — Phase 1 → Phase 2
- **Criteria (Phase 1 completion — first-phase implementation):**
  - SVC-01…SVC-06 delivered and demo-ready (gateway/UI, connectors/evidence, requirement library, interpreter, impact analyser, assessment engine).
  - Core TRL 5 workflow demonstrated (RV-01, RV-03, RV-04, BP-02, BP-03, BP-04).
  - Phase 0 gate criteria satisfied.
- **Evidence:** Phase 1 demo output, acceptance criteria verification for M-01, M-03, M-04, M-08, M-11, M-13, D-02, etc.
- **Decision authority:** Delivery Lead / SSC Technical Representative (during evaluation phase).
- **Gate 3 — Phase 2 → Phase 3
- **Criteria (Phase 2 completion):**
  - SVC-07…SVC-14 delivered (measures, workflow, registry, reporting, notifications, LLM/AI QA).
  - All mandatory requirements M-01…M-18, additional A-01…A-04, derived D-01…D-08 covered in design/tasks.
  - Cross-cutting concerns (bilingualism, accessibility, multi-tenancy, security, observability) satisfied.
- **Evidence:** Feature-complete build, test coverage mapping, open-issue register ≤ agreed threshold.
- **Decision authority:** Delivery Lead / QA Lead / SSC Technical Rep.

### Gate 4 — Phase 3 → Phase 4 (TRL 5 acceptance)
- **Criteria (Phase 3 completion / TRL 5 verified & accepted by SSC):**
  - Test scenarios **S-01…S-08** executed and passed (or accepted with documented deviations).
  - **SSC verification/acceptance of TRL 5** obtained during this phase (per Phase 3 window Jul–Aug 2027).
  - Security evidence (control mapping, design, tests) produced for SSC authorisation (D-01).
  - Performance/reliability targets met (RPO/RTO, UI <2s, impact <1min, reassessment <15min, breach→alert <5min, draft obligations <30min).
- **Evidence:** Test reports, demo recordings, SSC acceptance letter/confirmation, security assessment evidence.
- **Decision authority:** **SSC Acceptance Board** — **TRL 5 verified & accepted** (this is the critical go/no-go for TRL 5 submission).
- **Gate 5 — Phase 4 → Production authorisation (post-TRL 5)
- **Criteria:** Formal authorisation to operate obtained from SSC (out of TRL 5 scope; Architecture §1.2).
- **Decision authority:** SSC Authorisation Board.

## 4. Gate checklist items (actionable)

For each gate, the following checklist items apply:

| Gate | Checklist item | Status | Owner | Evidence |
|---|---|---|---|---|
| Initiation → Phase 0 | Project charter approved | ☐ | Delivery Lead | Charter |
| Initiation → Phase 0 | Scope (TRL 5) approved | ☐ | Sponsor | Scope doc |
| Phase 0 → Phase 1 | INFRA-1 complete | ☐ | DevOps | Infra report |
| Phase 0 → Phase 1 | DATA-1 complete | ☐ | Backend/Data | Schema report |
| Phase 0 → Phase 1 | INFRA-2 (GitOps) operational | ☐ | DevOps | Pipeline evidence |
| Phase 0 → Phase 1 | INFRA-3 (resilience) configured | ☐ | DevOps | Config |
| Phase 1 → Phase 2 | SVC-01…SVC-06 demo-ready | ☐ | Delivery Lead | Demo report |
| Phase 1 → Phase 2 | Core TRL 5 workflow demoed | ☐ | Delivery Lead / SSC Rep | Demo recording |
| Phase 2 → Phase 3 | SVC-07…SVC-14 complete | ☐ | Delivery Lead | Build report |
| Phase 2 → Phase 3 | Cross-cutting concerns verified | ☐ | Security/Access | Test reports |
| Phase 3 → Phase 4 | S-01…S-08 executed | ☐ | QA | Test reports |
| Phase 3 → Phase 4 | SSC TRL 5 acceptance obtained | ☐ | **SSC Acceptance Board** | Acceptance evidence |
| Phase 3 → Phase 4 | Performance/reliability verified | ☐ | Delivery Lead / QA | Test reports |

## 5. TRL 5 acceptance gate (Gate 4) — critical criteria

To satisfy the requirement that the solution be **verified and accepted by SSC during the next phase**:

1. **Functional acceptance:** All mandatory outcomes M-01…M-18 and derived D-01…D-08 verified against acceptance criteria (Master Doc §3).
2. **Technical acceptance:** Architecture, design, security evidence, performance/reliability targets met (Design Doc §3, §6).
3. **Process acceptance:** Business processes BP-01…BP-07 and runtime views RV-01…RV-05 exercised via S-01…S-08.
4. **AI acceptance:** AI design constraints honoured (D-02, D-05, ADR-02, ADR-04) and AI QA (answer key, R-01, R-02) passed.
5. **Security acceptance:** Protected B controls, audit chain, SoD, access controls validated (Design Doc §5).
6. **SSC authorisation:** Formal authorisation to operate follows TRL 5 acceptance (Architecture §1.2, out of TRL 5 scope).

## 6. Approval record template

| Gate | Date | Approver(s) | Decision (Go / No-Go / Conditional) | Conditions / Notes |
|---|---|---|---|---|
| Gate 0 | | | | |
| Gate 1 | | | | |
| Gate 2 | | | | |
| Gate 3 | | | | |
| Gate 4 — TRL 5 Acceptance | | **SSC** | | |
| Gate 5 — Production Authorisation | | **SSC** | | |

## 7. Risks to stage gates

- **Bid timeline pressure (Dec 24, 2026):** Phase 0 must be bid-ready before submission.
- **SSC evaluation (Jan–Mar 2027):** Phase 1 demo must be complete and accepted to proceed.
- **TRL 5 acceptance (Gate 4, Aug 2027):** Single point of failure if S-01…S-08 or SSC acceptance is delayed.
- **Post-TRL 5 deploy/integrate:** SSC environment provisioning and integration (I-09/I-10/I-11 live systems).

---

*End of stage-gate / approval checklist.*
