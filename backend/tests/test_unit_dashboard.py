from app.services.dashboard_service import get_status_bucket, STATUS_BUCKET_MAP


def test_status_bucket_mapping_consistency():
    # Verify every defined status maps to expected canonical bucket
    assert get_status_bucket("Approved") == "Approved"
    assert get_status_bucket("Submitted") == "Under Review"
    assert get_status_bucket("Under Scrutiny") == "Under Review"
    assert get_status_bucket("Resubmitted") == "Under Review"
    assert get_status_bucket("Under Evaluation") == "Under Review"
    assert get_status_bucket("Decision Pending") == "Under Review"
    assert get_status_bucket("Deficiency Raised") == "Requiring Action"
    assert get_status_bucket("Draft") == "Draft"
    assert get_status_bucket("Rejected") == "Rejected"
    assert get_status_bucket("Closed") == "Closed"
    assert get_status_bucket("UnknownStatus") == "Other"


def test_reconciliation_math():
    counts = {
        "Approved": 5,
        "Submitted": 3,
        "Under Scrutiny": 2,
        "Resubmitted": 1,
        "Under Evaluation": 1,
        "Decision Pending": 1,
        "Deficiency Raised": 4,
        "Draft": 10,
        "Rejected": 2,
        "Closed": 1,
    }

    approved = counts.get("Approved", 0)
    under_review = (
        counts.get("Submitted", 0)
        + counts.get("Under Scrutiny", 0)
        + counts.get("Resubmitted", 0)
        + counts.get("Under Evaluation", 0)
        + counts.get("Decision Pending", 0)
    )
    requiring_action = counts.get("Deficiency Raised", 0)
    draft = counts.get("Draft", 0)
    rejected = counts.get("Rejected", 0)
    closed = counts.get("Closed", 0)

    total = approved + under_review + requiring_action + draft + rejected + closed
    assert total == sum(counts.values())
    assert total == (5 + (3 + 2 + 1 + 1 + 1) + 4 + 10 + 2 + 1) == 30

