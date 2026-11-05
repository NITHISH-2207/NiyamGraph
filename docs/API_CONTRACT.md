# NiyamGraph — API Contract Specification

All endpoints are served under the versioned base prefix: `/api/v1`

## 1. Authentication & Identity
- `POST /api/v1/auth/login`: Authenticate statutory official using official ID and password.
- `GET /api/v1/auth/me`: Get profile of the current active session.

## 2. Scrutiny Operations
- `GET /api/v1/scrutiny/dashboard`: Operational counts, recent audit events, and pending action items.
- `GET /api/v1/scrutiny/queue`: Application queue with `search`, `status`, `application_type`, `sort_by`, `page`, and `page_size`.
- `GET /api/v1/applications/{application_id}`: Single application dossier metadata and institutional details.
- `GET /api/v1/applications/{application_id}/documents`: List documents, version histories, and extraction text.
- `GET /api/v1/applications/{application_id}/applicable-rules`: Regulatory rules applicable to the application scheme.
- `POST /api/v1/applications/{application_id}/scrutiny-runs`: Trigger automated scrutiny evaluation (AI + deterministic).
- `GET /api/v1/scrutiny-runs/{run_id}/findings`: Retrieve AI observations and officer verification states.
- `PATCH /api/v1/scrutiny-findings/{finding_id}/review`: Record officer decision (`VERIFIED_COMPLIANT`, `DEFICIENCY_CONFIRMED`, `MANUALLY_VERIFIED`, etc.) and remarks.

## 3. Deficiency & Resubmission
- `POST /api/v1/applications/{application_id}/deficiency-notices/draft`: Draft formal deficiency notice with cure window.
- `POST /api/v1/deficiency-notices/{notice_id}/issue`: Confirm and issue deficiency notice.
- `GET /api/v1/applications/{application_id}/deficiency-history`: Full audit trail of issued notices and institution responses.
- `GET /api/v1/applications/{application_id}/resubmission-diff`: Side-by-side textual diff of resubmitted document versions.

## 4. Reporting & Workflow Handover
- `GET /api/v1/applications/{application_id}/scrutiny-report`: Consolidated statutory scrutiny report.
- `POST /api/v1/applications/{application_id}/scrutiny-complete`: Finalize scrutiny stage.
- `POST /api/v1/applications/{application_id}/workflow/handover`: Dispatch application to `FORWARDED_TO_EVC` or `FORWARDED_TO_AUTHORITY`.

