# AI Governance Tool — Demo ReadMe

**Purpose:** Instructions for launching, seeding, and stopping the demo orchestrators for the AI Governance Tool (Phase 1 core demo + Phase 3 full verification pass).

## Services required (must be running)

| Component | Port | Command |
|---|---|---|
| Gateway (SVC-01 API Gateway + Bilingual Web UI) | 8084 | `phase1/svc-01-api-gateway-ui` |
| SVC-02 Connector Framework | 8085 | `phase1/svc-02-connector-framework` |
| SVC-03 Requirement Library | 8080 | `phase1/svc-03-requirement-library` |
| SVC-04 Requirement Interpreter | 8081 | `phase1/svc-04-requirement-interpreter` |
| SVC-05 Impact Analyser | 8082 | `phase1/svc-05-impact-analyser` |
| SVC-06 Assessment Engine | 8083 | `phase1/svc-06-assessment-engine` |
| SVC-07 Measures Evaluator | 8090 | `phase1/svc-07-measures-evaluator` |
| SVC-08 Remediation Recommender | 8091 | `phase1/svc-08-remediation-recommender` |
| SVC-09 AI System Registry | 8092 | `phase1/svc-09-ai-system-registry` |
| SVC-10 Traceability Graph | 8093 | `phase1/svc-10-traceability-graph` |
| SVC-11 Review Approval Workflow | 8094 | `phase1/svc-11-review-approval-workflow` |
| SVC-12 Evidence Audit Store | 8095 | `phase1/svc-12-evidence-audit-store` |
| SVC-13 Notifications | 8096 | `phase1/svc-13-notifications` |
| SVC-14 LLM Serving / AI QA | 8097 | `phase1/svc-14-llm-serving-ai-qa` |

Gateway health: `curl http://localhost:8084/health`

## Start the demo

```bash
cd "/Users/gnrao/Google Drive/My Drive/HB/SSC-Attesta/SolutionArchitecture"

# Phase 3 full verification pass (S-01...S-08) — default
./phase1/demo/run-demo.sh phase3

# Phase 1 core governance workflow demo
./phase1/demo/run-demo.sh phase1

# Both
./phase1/demo/run-demo.sh both

# Or run orchestrators directly
node phase1/demo/orchestrator-phase3.js   # Phase 3 S-01...S-08
node phase1/demo/orchestrator.js        # Phase 1 core workflow
```

## Seed the demo

The orchestrators seed demo data internally as part of their runs (create sources, drafts, obligations, findings, workflows, remediations, reports, etc.).

## Stop the demo

- Stop the orchestrator process (Ctrl+C / kill) once it prints its completion marker.
- Stop services if needed:
  ```bash
  # Gateway
  GWPID=$(lsof -ti :8084); kill $GWPID
  # Phase 1 services
  for p in 8080 8081 8082 8083 8085; do G=$(lsof -ti :$p); [ -n "$G" ] && kill $G; done
  # Phase 2 services
  for p in 8090 8091 8092 8093 8094 8095 8096 8097; do G=$(lsof -ti :$p); [ -n "$G" ] && kill $G; done
  ```

## Expected outputs

- Phase 1: `PHASE 1 DEMO WORKFLOW COMPLETED` (RV-01/BP-02, RV-03/BP-03, RV-04/BP-04)
- Phase 3: `PHASE 3 TEST/VERIFICATION ORCHESTRATOR COMPLETED` (S-01...S-08)

## UI launch

```bash
./phase1/demo/run-demo.sh ui   # opens http://localhost:8084/ (Bilingual Web UI)
```

---

*End of Phase 3 / Phase 1 Demo ReadMe.*
