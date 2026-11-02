# AI Governance Tool — Phased Delivery Plan (TRL 5)

**Status:** Draft — phased plan for TRL 5 submission  
**Sources:** AI_Governance_Tool_Master_Document.md; AI_Governance_Tool_Task_Breakdown.md; AI_Governance_Tool_Traceability_Matrix.md; Solution Architecture (TRL 5).docx; SOW — Problem statement.docx

## 1. Context and schedule constraints

- **Bid submission deadline:** **December 24, 2026**.
- **Evaluation:** to occur **after** bid submission.
- **Post-evaluation action:** **deploy and integrate** the solution within the **SSC environment**.
- **TRL 5 goal:** solution implemented to **TRL 5 level** and **verified and accepted by SSC** during the **next phase** (i.e., the phase following the TRL 5 demonstration/acceptance).

Given the current date context (**November 2026**) and the December 2026 bid deadline, the phased delivery plan is aligned to the critical path:

- **Phase 0 — Foundations** must be substantially complete **before/during bid finalisation** (Nov–Dec 2026).
- **Phase 1 — Core services (first phase implementation)** executes **Jan–Mar 2027**, during the **evaluation phase**, to reach TRL 5 demonstration readiness.
- **Phase 2 — Assurance, measures, registry, workflow, reporting, LLM/AI QA** — Apr–Jun 2027.
- **Phase 3 — Verification, demo, SSC acceptance** — Jul–Aug 2027; **SSC acceptance gate** at end of Phase 3.
- **Post-acceptance:** Phase 4 — production operations / formal authorisation to operate (outside TRL 5 scope, per Architecture §1.2).

## 2. Phase plan summary

| Phase | Focus | Tasks | Effort (pd) | Window (2026–2027) | Gate |
|---|---|---|---|---|---|
| Phase 0 | Foundations & environment | INFRA-1, INFRA-2, DATA-1, INFRA-3 | 23 | Nov 2026 – Dec 2026 | Bid-ready environment baseline |
| Phase 1 | Core services (first phase implementation) | SVC-01…SVC-06 | 52 | Jan 2027 – Mar 2027 | TRL 5 core capability demo |
| Phase 2 | Assurance, measures, registry, workflow, reporting, LLM/AI QA | SVC-07…SVC-14 | 68 | Apr 2027 – Jun 2027 | Full feature set readiness |
| Phase 3 | Verification, demo, SSC acceptance | TEST-S1…S-8, remediation | 38 | Jul 2027 – Aug 2027 | **SSC acceptance at TRL 5** |
| Phase 4 | Production operations / formal authorisation (post-TRL 5) | — | — | Post-Aug 2027 | SSC authorisation to operate |

**Indicative total to TRL 5 acceptance:** ~181 person-days across Phases 0–3 (excluding post-TRL-5 production work).

## 3. First-phase implementation timeline (aligned to bid / evaluation / SSC integration)

### Phase 0 — Foundations (Nov–Dec 2026)
- **Objective:** Bid submission readiness and environment baseline.
- **Key tasks:** INFRA-1 (OpenShift, ODF, GPU, Protected B, Keycloak, OpenBao), INFRA-2 (GitOps, Helm, images, signing/scanning/SBOM), INFRA-3 (resilience).
- **Key tasks:** DATA-1 (PostgreSQL+AGE, Kafka, OpenSearch, S3, hash-chained audit).
- **Deliverables before Dec 24, 2026 bid deadline:** environment baseline, GitOps pipeline, data layer schema.
- **Owner(s):** DevOps / Platform Engineering, Backend / Data Engineering, Security Engineering.

### Phase 1 — Core services: first phase implementation for TRL 5 (Jan–Mar 2027)
- **Objective:** Build and demonstrate core TRL 5 capabilities to support SSC evaluation.
- **Key tasks:** SVC-01 (gateway + UI), SVC-02 (connectors/evidence), SVC-03 (requirement library), SVC-04 (interpreter), SVC-05 (impact analyser), SVC-06 (assessment engine).
- **Critical path:** INFRA-1 → DATA-1 → SVC-03/04/06 → (assessment) → demo.
- **TRL 5 relevance:** core governance content intake, decomposition, impact analysis, assessment produce the TRL 5 demonstrable workflow (RV-01, RV-03, RV-04, BP-02, BP-03, BP-04).
- **Owners:** Backend, AI/ML Engineer, Frontend, Security, DevOps.

### Phase 2 — Full feature build (Apr–Jun 2027)
- **Objective:** Complete remaining services for full TRL 5 feature set (registry, workflow, measures, reporting, notifications, LLM serving/AI QA).
- **Key tasks:** SVC-07…SVC-14.
- **Owners:** Backend, AI/ML, Frontend, Security, DevOps, QA.

### Phase 3 — Verification and SSC acceptance (Jul–Aug 2027)
- **Objective:** Execute test scenarios S-01…S-08, remediate, run TRL 5 demonstration, obtain **SSC acceptance of TRL 5**.
- **Gate:** SSC verification/acceptance during this phase → acceptance to operate at TRL 5 for the **next phase** (production operations / formal authorisation, out of TRL 5 scope).

## 4. Bid → evaluation → deploy/integrate timeline (synthesis)

| Milestone | Date / Window | Activity |
|---|---|---|
| Bid preparation & Phase 0 | Nov–Dec 2026 | Foundations, environment, pipeline, data layer. |
| **Bid submission** | **Dec 24, 2026** | Finalise proposal responses. |
| **Evaluation** | Jan–Mar 2027 | Phase 1 core build (first phase implementation) executes; TRL 5 demo readiness. |
| **Deploy & integrate** | Post-evaluation / post-award (Sep–Dec 2027) | Deploy and integrate within SSC environment. |

## 5. Phase 0 → Phase 1 handoff criteria (first-phase implementation readiness)

For Phase 1 (first phase implementation) to proceed toward TRL 5 acceptance, the following must be satisfied before Phase 1 starts:
- INFRA-1, DATA-1 provisioned and accessible.
- GitOps pipeline (INFRA-2) operational.
- Architecture/design reviewed and approved (ADRs open for review before implementation, Architecture §13).
- Security evidence requirements identified for SSC authorisation (D-01).

## 6. Critical path and risks to TRL 5 acceptance

- **Critical path:** INFRA-1 → DATA-1 → SVC-03/04/06 → SVC-11/SVC-08 → TEST-S2/S-05/S-08 (from task breakdown).
- **TRL 5 risk concentration:** AI correctness (R-01, R-02), GPU capacity (R-03), OSCAL extension (R-04), delivery key-person risk (R-05).
- **Mitigations:** AI answer-key regression, EN/FR test set, early GPU sizing, prototype GC content pack, cross-trained team, conformance suites.

## 7. Out of scope for TRL 5 phase
- Production operations, formal authorisation to operate, full ISO/IEC 42001 and EU AI Act content packs (Architecture §1.2).

---

*End of phased delivery plan.*
