# AI Governance Tool - Phase 4 Implementation Sequence (TRL 5)

**Status:** Proposed. Sequence derived from design docs. Phase 4 build not started (post-TRL 5; outside TRL 5 scope).
**Sources:** AI_Governance_Tool_Specification.md, AI_Governance_Tool_Design_Specification.md, AI_Governance_Tool_Task_Breakdown.md, AI_Governance_Tool_Phased_Delivery_Plan.md, AI_Governance_Tool_Stage_Gate_Checklist.md, AI_Governance_Tool_Master_Document.md, AI_Governance_Tool_Traceability_Matrix.md, Solution Architecture (TRL 5).docx, SOW - Problem statement.docx.

## 1. Phase windows (Phased Delivery Plan)

| Phase | Focus | Tasks | Window | Gate |
|---|---|---|---|---|
| Phase 4 | Production operations / formal authorisation | - | Post-Aug 2027 | Gate 5: SSC authorisation to operate (Phase 4 -> Production authorisation) |

**Context:** Phase 3 (Jul-Aug 2027) closes with **Gate 4 — SSC Acceptance Board (TRL 5 verified & accepted)**. Following acceptance, the **next phase** (Phase 4) is **production operations / formal authorisation to operate** — explicitly **out of TRL 5 scope** (Architecture §1.2, Master Doc).

**TRL 5 acceptance status:** Pending (Phase 3 window Jul-Aug 2027; SSC acceptance board decision pending).

## 2. Phase 4 scope (out of TRL 5 scope, per Architecture §1.2 / Master Doc)

- **Production operations** of the AI Governance Tool in the SSC environment.
- **Formal authorisation to operate** obtained from the **SSC Authorisation Board** (Gate 5, post-TRL 5; out of scope for TRL 5).
- **Full ISO/IEC 42001** and **EU AI Act** content packs (Architecture §1.2).
- Cross-cutting production hardening and compliance items (from Design Doc):
  - **C-20** Identity & access: Keycloak federation (OIDC/SAML) with MFA; service accounts as OAuth 2.0 client credentials with short-lived tokens; RBAC + attributes at gateway and service level.
  - **Interfaces I-01…I-15**: versioned, tenant-scoped, OAuth 2.0 / OIDC secured; OpenAPI 3.1 / AsyncAPI / JSON Schema / CloudEvents / OTLP.
  - **Network:** restricted zone; gateway exposed to operations zone; egress denied by default.
  - **Resilience:** HA replicas for stateful services; PostgreSQL sync replication + WAL archiving; offsite object-storage backups; RPO/RTO targets (15 min governance data, 1 hour evidence, 15 min component failure, 8 business hours full cluster loss); availability 99.5%.
  - **Delivery:** GitOps (OpenShift GitOps / Argo CD); hardened base images, signing, scanning, SBOM; Helm charts/Operators as code.
  - **Observability:** OTLP, OpenSearch, alerting.
  - **Security evidence:** design, mapping, tests produced for SSC authorisation (D-01); authorisation to operate remains with SSC.

## 3. Phase 4 critical path / task sequence (proposed build order)

### Wave 1 — Production hardening & identity (C-20 / gateway + services)
1. Gateway authentication: replace demo bearer token with **OIDC/OAuth 2.0** validation (Keycloak federation), MFA-ready, service-account client credentials, short-lived tokens, RBAC + attributes enforcement at gateway (I-01…I-15, tenant scoping).
2. Service-level auth: OAuth 2.0 client credentials / JWT validation in each Phase 1–2 service (stub → full enforcement).
3. RBAC/attributes enforcement (roles for Author/Reviewer/Approver/Reviewer-of-record/Operator; SoD).
4. Rate limiting, audit chain integration, security hardening.

### Wave 2 — Production deployment & operations
1. GitOps/Helm charts/Operators as code; hardened base images, signing, scanning, SBOM; OpenShift GitOps/Argo CD.
2. Backup/DR, offsite backups, RPO/RTO, HA; incident response runbook; cost/perf observability (OTLP/OpenSearch).

### Wave 3 — Content packs & formal authorisation
1. Full ISO/IEC 42001 and EU AI Act content packs.
2. **Formal SSC authorisation to operate** (Gate 5) — SSC Authorisation Board decision, post-TRL 5.

## 4. Phase 4 task status

| Task / deliverable | Status |
|---|---|
| Phase 4 build sequence | Proposed (derived) |
| Wave 1 hardening/auth | **Done** (2026-11-03): gateway OIDC/JWKS + rate limit + RBAC + audit emitter + tenant enforcer + egress allowlist verified; service-level auth added to svc-02…svc-14, verified |
| Wave 2 deploy/ops | In progress — gateway egress allowlist added (env-gated); GitOps/Helm, backup/DR, incident response, cost/perf observability remaining |
| Wave 3 content packs / SSC authorisation | Proposed — not started (post-TRL 5) |

## 5. Next actions

1. ~~**Review Phase 4 proposal** (above) and confirm scope/waves before implementation.~~ **Approved** (2026-11-03) — proceeding with Phase 4 build.
2. ~~Begin Phase 4 **Wave 1** (production hardening & identity) if approved.~~ **Done** (2026-11-03): gateway OIDC/JWKS + rate limit + RBAC verified; service-level auth added to svc-02…svc-14 and verified via orchestrator.
3. **Begin Phase 4 Wave 2** — production deployment & operations (GitOps/Helm, hardened images, backup/DR, incident response, cost/perf observability).
4. **Wave 3** — full ISO/IEC 42001 and EU AI Act content packs; **Gate 5** formal SSC authorisation to operate (post-TRL 5, SSC Authorisation Board).

**Phase 4 status (2026-11-03):** Wave 1 hardening/auth **complete** (gateway OIDC/JWKS + rate limit + RBAC + audit emitter + tenant enforcer + egress allowlist verified; service-level auth added to svc-02…svc-14, verified; Phase 1 orchestrator re-confirmed green). Wave 2 (deploy/ops) in progress (gateway egress allowlist added; GitOps/Helm, backup/DR, incident response, cost/perf observability remaining). Wave 3 (content packs/authorisation) pending.

---

*End of Phase 4 implementation sequence.*
