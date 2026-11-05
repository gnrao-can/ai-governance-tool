#!/bin/bash
# AI Governance Tool — Demo Launcher
# Runs the Phase 1 core demo orchestrator and/or the Phase 3 full verification orchestrator.
# Usage:
#   ./phase1/demo/run-demo.sh phase1   # Phase 1 core governance workflow demo
#   ./phase1/demo/run-demo.sh phase3   # Phase 3 S-01...S-08 full verification pass
#   ./phase1/demo/run-demo.sh both    # Run Phase 1 then Phase 3

cd "/Users/gnrao/Google Drive/My Drive/HB/SSC-Attesta/SolutionArchitecture"

case "${1:-phase3}" in
  phase1)
    echo "=== Launching Phase 1 Demo Orchestrator ==="
    node phase1/demo/orchestrator.js
    ;;
  phase3)
    echo "=== Launching Phase 3 Demo Orchestrator (S-01...S-08) ==="
    node phase1/demo/orchestrator-phase3.js
    ;;
  both)
    echo "=== Launching Phase 1 Demo Orchestrator ==="
    node phase1/demo/orchestrator.js
    echo "=== Launching Phase 3 Demo Orchestrator (S-01...S-08) ==="
    node phase1/demo/orchestrator-phase3.js
    ;;
  ui)
    echo "=== Launching AI Governance Tool UI at http://localhost:8084/ ==="
    if command -v open >/dev/null 2>&1; then
      open "http://localhost:8084/"
    else
      echo "http://localhost:8084/"
    fi
    ;;
  *)
    echo "Usage: $0 [phase1|phase3|both|ui]"
    exit 1
    ;;
esac

echo "DEMO LAUNCHED COMPLETE"
