# NiyamGraph — Canonical Workflow Status Contract

To ensure interoperability across all 4 developer modules (Institution Portal, Scrutiny Desk, EVC Inspection, and Regional Officer Desks), every developer MUST adhere to these exact lifecycle statuses:

## 1. Application Workflow States (`applications.status`)
1. `SUBMITTED`: Initial application submission by the Institution.
2. `RECEIVED_BY_REGION`: Acknowledged by the AICTE Regional Office.
3. `ASSIGNED_TO_SCRUTINY`: Assigned by Regional Officer to a Scrutiny Officer.
4. `SCRUTINY_IN_PROGRESS`: Scrutiny Officer is examining documents and rules.
5. `DEFICIENCY_DRAFT`: Scrutiny Officer has drafted findings requiring rectification.
6. `DEFICIENCY_ISSUED`: Formal notice communicated with a 15-day cure window.
7. `RESUBMISSION_RECEIVED`: Institution has uploaded corrected document versions.
8. `SCRUTINY_COMPLETED`: Scrutiny findings validated and report compiled.
9. `FORWARDED_TO_EVC`: Dispatched for Expert Visit Committee inspection.
10. `FORWARDED_TO_AUTHORITY`: Forwarded to Competent Statutory Authority for approval seal.

## 2. Deficiency Item States (`deficiency_notices.status` & `deficiency_items.status`)
- `DRAFT`: Prepared but not yet communicated.
- `ISSUED`: Officially dispatched to institution.
- `RESPONSE_RECEIVED`: Institution submitted explanation or document.
- `UNDER_REVIEW`: Scrutiny Officer reviewing resubmission diff.
- `RESOLVED`: Satisfactorily corrected and compliant.
- `UNRESOLVED`: Persisting deficiency requiring escalation.

## 3. Scrutiny Finding Categories (`scrutiny_findings.ai_category`)
- `EVIDENCE_FOUND`: Document satisfies statutory threshold.
- `POTENTIALLY_SATISFIED`: Evidence matches, minor confirmation needed.
- `POTENTIAL_DEFICIENCY`: Non-compliance, shortfall, or expired certificate.
- `MISSING_EVIDENCE`: Mandatory required document not furnished.
- `MANUAL_REVIEW_REQUIRED`: Ambiguous evidence requiring physical scrutiny.
- `NOT_APPLICABLE`: Criteria does not apply to this category/scheme.

## 4. Officer Verification Decisions (`scrutiny_findings.officer_decision`)
- `PENDING_REVIEW`
- `VERIFIED_COMPLIANT`
- `DEFICIENCY_CONFIRMED`
- `FINDING_MODIFIED`
- `NOT_APPLICABLE_CONFIRMED`
- `MANUALLY_VERIFIED`

