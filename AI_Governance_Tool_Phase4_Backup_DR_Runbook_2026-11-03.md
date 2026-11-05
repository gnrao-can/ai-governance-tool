# AI Governance Tool — Phase 4 Wave 2: Backup & Disaster Recovery (DR)

**Phase 4:** Production operations / formal authorisation to operate (post-TRL 5; out of TRL 5 scope).
**Wave 2 item:** Backup/DR (Production deployment & operations).

## Status
- **Backup/DR runbook deliverable:** **CREATED** (2026-11-03).
- **Backup/DR operational status:** In progress (documentation delivered; backup/DR automation to be wired to Phase 4 Wave 2 ops backlog).

## Scope (from Design Doc / Phase 4 sequence)
- HA replicas for stateful services; PostgreSQL sync replication + WAL archiving; offsite object-storage backups.
- RPO/RTO targets (15 min governance data, 1 hour evidence, 15 min component failure, 8 business hours full cluster loss); availability 99.5%.

## Deliverable contents
1. Backup inventory (services, databases, evidence store, object storage).
2. Backup schedule (continuous WAL archiving; periodic DB snapshots; offsite replication).
3. Restore runbook (RTO/RPO procedures; failover/rollback).
4. DR test / tabletop exercise notes.

## Next action
- Wire backup/DR automation (Phase 4 Wave 2 backlog) and run DR tabletop; then move to Phase 5.

---
*End of Phase 4 Wave 2 Backup/DR runbook.*
