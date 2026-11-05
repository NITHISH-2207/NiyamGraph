# NiyamGraph — Shared Database Schema Specification

Target Database: **Neon PostgreSQL** (with development fallback)  
Connection Driver: `psycopg` (v3) / `psycopg2`  
ORM: SQLAlchemy 2.0  

## Complete Logical Entities:

1. `users`: Official statutory and institutional accounts.
2. `roles`: Platform-wide roles (`INSTITUTION`, `REGIONAL_OFFICER`, `SCRUTINY_OFFICER`, `EVC_COORDINATOR`, `EVC_MEMBER`, `COMPETENT_AUTHORITY`, `COMPLIANCE_OFFICER`, `SYSTEM_ADMIN`).
3. `user_roles`: Multi-role mapping with timestamps.
4. `regional_offices`: AICTE Regional Jurisdictions (e.g. `RO-SOUTH`, `RO-WEST`, `RO-NORTH`).
5. `institutions`: Verified educational institutes, permanent IDs, and physical addresses.
6. `applications`: Common root application record shared by all developer modules (`APP-2026-ENG-8492`).
7. `application_assignments`: Assignment of applications by Regional Officers to Scrutiny Officers.
8. `application_documents`: Statutory uploads with SHA-256 checksums, extraction status, and metadata.
9. `document_versions`: Version history tracking for resubmission comparison.
10. `regulatory_rules`: Configurable AICTE criteria (e.g. Land Contiguity, Safety NOC, Cadre Ratio).
11. `regulatory_rule_versions`: Versioning of regulatory guidelines across handbook updates.
12. `rule_applicability`: Scheme-based applicability mapping per application.
13. `scrutiny_runs`: Immutable record of automated scrutiny evaluations.
14. `scrutiny_findings`: AI observations linked with source document page citations.
15. `scrutiny_reviews`: Human officer verification decisions and remarks.
16. `deficiency_notices`: Official deficiency notices with unique statutory reference numbers.
17. `deficiency_items`: Granular defect lines linked to regulatory clauses.
18. `deficiency_responses`: Institutional replies and rectified documents.
19. `resubmission_batches`: Tracking batches of document corrections.
20. `workflow_events`: Lifecycle stage transitions and actors.
21. `notifications`: In-app statutory alerts and reminders.
22. `audit_logs`: Centralized immutable compliance audit ledger.
23. `ai_processing_logs`: Provider, model, token usage, latency, and failover diagnostics.

