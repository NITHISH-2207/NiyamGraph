import datetime
import difflib
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.models.entities import (
    Application,
    ApplicationAssignment,
    ApplicationDocument,
    DocumentVersion,
    RegulatoryRule,
    ScrutinyRun,
    ScrutinyFinding,
    ScrutinyReview,
    DeficiencyNotice,
    DeficiencyItem,
    DeficiencyResponse,
    WorkflowEvent,
    AuditLog,
    ApplicationStatusEnum,
    DeficiencyStatusEnum,
    FindingCategoryEnum,
    OfficerDecisionEnum,
)
from app.modules.ai.router.provider_manager import ai_provider_manager

router = APIRouter(tags=["Scrutiny Officer Portal"])

# --- SCHEMAS ---

class ReviewFindingPayload(BaseModel):
    decision: str  # VERIFIED_COMPLIANT, DEFICIENCY_CONFIRMED, FINDING_MODIFIED, NOT_APPLICABLE_CONFIRMED, MANUALLY_VERIFIED
    remarks: Optional[str] = None
    reviewer_user_id: Optional[str] = "USR-SCRUTINY-01"

class DraftNoticeItemPayload(BaseModel):
    rule_id: str
    requirement_summary: str
    observed_deficiency: str
    source_document: Optional[str] = None
    source_page: Optional[str] = None
    required_correction: str
    finding_id: Optional[str] = None

class DraftNoticePayload(BaseModel):
    general_remarks: Optional[str] = None
    cure_period_days: int = 15
    items: List[DraftNoticeItemPayload]

class IssueNoticePayload(BaseModel):
    officer_remarks: Optional[str] = None

class HandoverPayload(BaseModel):
    next_stage: str  # e.g. FORWARDED_TO_EVC or FORWARDED_TO_AUTHORITY
    officer_remarks: Optional[str] = None

# --- 1. DASHBOARD ---

@router.get("/scrutiny/dashboard")
def get_scrutiny_dashboard(db: Session = Depends(get_db)):
    assigned_apps = db.query(Application).all()
    total_assigned = len(assigned_apps)
    awaiting_scrutiny = len([a for a in assigned_apps if a.status == ApplicationStatusEnum.ASSIGNED_TO_SCRUTINY.value])
    under_examination = len([a for a in assigned_apps if a.status == ApplicationStatusEnum.SCRUTINY_IN_PROGRESS.value])
    deficiencies_pending = len([a for a in assigned_apps if a.status in [ApplicationStatusEnum.DEFICIENCY_DRAFT.value, ApplicationStatusEnum.DEFICIENCY_ISSUED.value]])
    resubmissions_review = len([a for a in assigned_apps if a.status == ApplicationStatusEnum.RESUBMISSION_RECEIVED.value])
    completed_reports = len([a for a in assigned_apps if a.status in [ApplicationStatusEnum.SCRUTINY_COMPLETED.value, ApplicationStatusEnum.FORWARDED_TO_EVC.value, ApplicationStatusEnum.FORWARDED_TO_AUTHORITY.value]])

    # Count overdue tasks (deadline past today and not completed)
    now = datetime.datetime.now(datetime.UTC).replace(tzinfo=None)
    overdue_count = len([
        a for a in assigned_apps
        if a.target_scrutiny_deadline and a.target_scrutiny_deadline < now and a.status not in [ApplicationStatusEnum.SCRUTINY_COMPLETED.value, ApplicationStatusEnum.FORWARDED_TO_EVC.value]
    ])

    # Recent Audit Log Activities
    recent_logs = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(8).all()
    recent_activities = [
        {
            "id": log.id,
            "actor_name": log.actor_name or "System",
            "actor_role": log.actor_role,
            "action": log.action,
            "application_id": log.application_id,
            "remarks": log.remarks,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        }
        for log in recent_logs
    ]

    # Pending Action items
    pending_actions = []
    for a in assigned_apps:
        if a.status == ApplicationStatusEnum.RESUBMISSION_RECEIVED.value:
            pending_actions.append({
                "type": "RESUBMISSION_REVIEW",
                "title": f"Review Resubmitted Documents: {a.id}",
                "institution": a.institution.name if a.institution else "Institution",
                "application_id": a.id,
                "urgency": "HIGH",
                "action_url": f"/scrutiny/applications/{a.id}?tab=resubmission",
            })
        elif a.status == ApplicationStatusEnum.SCRUTINY_IN_PROGRESS.value:
            pending_actions.append({
                "type": "FINDINGS_VERIFICATION",
                "title": f"Verify Findings & Deficiencies: {a.id}",
                "institution": a.institution.name if a.institution else "Institution",
                "application_id": a.id,
                "urgency": "NORMAL",
                "action_url": f"/scrutiny/applications/{a.id}?tab=findings",
            })
        elif a.status == ApplicationStatusEnum.ASSIGNED_TO_SCRUTINY.value:
            pending_actions.append({
                "type": "START_SCRUTINY",
                "title": f"Initiate Document Scrutiny: {a.id}",
                "institution": a.institution.name if a.institution else "Institution",
                "application_id": a.id,
                "urgency": "NORMAL",
                "action_url": f"/scrutiny/applications/{a.id}",
            })

    return {
        "metrics": {
            "total_assigned": total_assigned,
            "awaiting_scrutiny": awaiting_scrutiny,
            "under_examination": under_examination,
            "deficiencies_pending": deficiencies_pending,
            "resubmissions_awaiting_review": resubmissions_review,
            "completed_scrutiny_reports": completed_reports,
            "overdue_tasks": overdue_count,
        },
        "recent_activities": recent_activities,
        "pending_actions": pending_actions,
    }

# --- 2. SCRUTINY QUEUE ---

@router.get("/scrutiny/queue")
def get_scrutiny_queue(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    application_type: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("priority"),  # priority, submission_date, deadline
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Application)

    if search:
        search_filter = f"%{search}%"
        query = query.join(Application.institution).filter(
            (Application.id.ilike(search_filter)) |
            (Application.institution.has(name=search_filter))
        )

    if status and status != "ALL":
        query = query.filter(Application.status == status)

    if application_type and application_type != "ALL":
        query = query.filter(Application.application_type == application_type)

    applications = query.all()

    now = datetime.datetime.now(datetime.UTC).replace(tzinfo=None)

    # Transform with operational transparent metrics
    results = []
    for app in applications:
        # Calculate pending duration
        elapsed_days = (now - app.submission_date).days if app.submission_date else 0
        days_to_deadline = (app.target_scrutiny_deadline - now).days if app.target_scrutiny_deadline else None

        # Priority calculation based on transparent operational criteria
        priority_label = app.priority_level or "NORMAL"
        priority_reason = app.priority_reason or f"Application submitted {elapsed_days} days ago."
        if days_to_deadline is not None and days_to_deadline <= 2:
            priority_label = "HIGH"
            priority_reason = f"Statutory processing deadline is within {days_to_deadline} days."

        assignment = app.assignments[0] if app.assignments else None

        results.append({
            "application_id": app.id,
            "institution_id": app.institution_id,
            "institution_name": app.institution.name if app.institution else "Unknown Institution",
            "institution_category": app.institution.category if app.institution else "",
            "application_type": app.application_type,
            "academic_year": app.academic_year,
            "regional_office": app.regional_office.name if app.regional_office else "Regional Office",
            "assigned_by": assignment.assigned_by.full_name if assignment and assignment.assigned_by else "Regional Director",
            "assigned_date": assignment.assigned_at.isoformat() if assignment and assignment.assigned_at else app.created_at.isoformat(),
            "submission_date": app.submission_date.isoformat() if app.submission_date else None,
            "target_scrutiny_deadline": app.target_scrutiny_deadline.isoformat() if app.target_scrutiny_deadline else None,
            "processing_stage": "Stage 4: Document Scrutiny",
            "current_status": app.status,
            "pending_duration_days": elapsed_days,
            "days_to_deadline": days_to_deadline,
            "priority_level": priority_label,
            "priority_reason": priority_reason,
            "documents_count": len(app.documents),
            "findings_count": sum(len(run.findings) for run in app.scrutiny_runs),
        })

    # Sort
    if sort_by == "priority":
        p_weights = {"ESCALATED": 0, "HIGH": 1, "NORMAL": 2}
        results.sort(key=lambda x: (p_weights.get(x["priority_level"], 3), x["pending_duration_days"] * -1))
    elif sort_by == "submission_date":
        results.sort(key=lambda x: x["submission_date"] or "", reverse=True)
    elif sort_by == "deadline":
        results.sort(key=lambda x: x["days_to_deadline"] if x["days_to_deadline"] is not None else 999)

    total_count = len(results)
    start_idx = (page - 1) * page_size
    paged_items = results[start_idx : start_idx + page_size]

    return {
        "items": paged_items,
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if page_size else 1,
    }

# --- 3. APPLICATION DETAILS & DOCUMENTS ---

@router.get("/applications/{application_id}")
def get_application_details(application_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    return {
        "application_id": app.id,
        "application_type": app.application_type,
        "academic_year": app.academic_year,
        "status": app.status,
        "submission_date": app.submission_date.isoformat() if app.submission_date else None,
        "target_scrutiny_deadline": app.target_scrutiny_deadline.isoformat() if app.target_scrutiny_deadline else None,
        "priority_level": app.priority_level,
        "priority_reason": app.priority_reason,
        "institution": {
            "id": app.institution.id,
            "permanent_id": app.institution.permanent_id,
            "name": app.institution.name,
            "category": app.institution.category,
            "state": app.institution.state,
            "district": app.institution.district,
            "address": app.institution.address,
            "pincode": app.institution.pincode,
            "contact_email": app.institution.contact_email,
            "contact_phone": app.institution.contact_phone,
        } if app.institution else None,
        "regional_office": {
            "id": app.regional_office.id,
            "code": app.regional_office.code,
            "name": app.regional_office.name,
            "jurisdiction": app.regional_office.jurisdiction_states,
        } if app.regional_office else None,
    }

@router.get("/applications/{application_id}/documents")
def get_application_documents(application_id: str, db: Session = Depends(get_db)):
    docs = db.query(ApplicationDocument).filter(ApplicationDocument.application_id == application_id).all()
    results = []
    for d in docs:
        versions = [
            {
                "version_number": v.version_number,
                "file_name": v.file_name,
                "sha256_checksum": v.sha256_checksum,
                "change_summary": v.change_summary,
                "uploaded_at": v.uploaded_at.isoformat() if v.uploaded_at else None,
            }
            for v in d.versions
        ]
        results.append({
            "document_id": d.id,
            "application_id": d.application_id,
            "document_category": d.document_category,
            "file_name": d.file_name,
            "file_size_bytes": d.file_size_bytes,
            "file_mime_type": d.file_mime_type,
            "sha256_checksum": d.sha256_checksum,
            "current_version": d.current_version,
            "extraction_status": d.extraction_status,
            "extracted_text": d.extracted_text,
            "extraction_metadata": d.extraction_metadata,
            "upload_timestamp": d.upload_timestamp.isoformat() if d.upload_timestamp else None,
            "versions": versions,
        })
    return results

# --- 4. APPLICABLE RULES ---

@router.get("/applications/{application_id}/applicable-rules")
def get_applicable_rules(application_id: str, db: Session = Depends(get_db)):
    rules = db.query(RegulatoryRule).filter(RegulatoryRule.is_active == True).all()
    return [
        {
            "id": r.id,
            "regulation_name": r.regulation_name,
            "clause_reference": r.clause_reference,
            "title": r.title,
            "requirement_description": r.requirement_description,
            "category": r.category,
            "source_document": r.source_document,
            "source_page": r.source_page,
            "current_version": r.current_version,
            "is_demonstration_data": r.is_demonstration_data,
        }
        for r in rules
    ]

# --- 5. AUTOMATED SCRUTINY EXECUTION ---

@router.post("/applications/{application_id}/scrutiny-runs")
async def execute_scrutiny_run(application_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    docs = db.query(ApplicationDocument).filter(ApplicationDocument.application_id == application_id).all()
    rules = db.query(RegulatoryRule).filter(RegulatoryRule.is_active == True).all()

    app_info = {
        "institution_name": app.institution.name if app.institution else "Institution",
        "category": app.institution.category if app.institution else "Engineering",
        "application_type": app.application_type,
        "academic_year": app.academic_year,
    }

    docs_payload = [
        {
            "id": d.id,
            "file_name": d.file_name,
            "document_category": d.document_category,
            "extracted_text": d.extracted_text or "",
        }
        for d in docs
    ]

    rules_payload = [
        {
            "id": r.id,
            "clause_reference": r.clause_reference,
            "title": r.title,
            "requirement_description": r.requirement_description,
            "category": r.category,
        }
        for r in rules
    ]

    # Run Automated Scrutiny Engine (AI with Failover)
    scrutiny_res = await ai_provider_manager.execute_scrutiny(app_info, docs_payload, rules_payload)

    # Save Scrutiny Run
    run_id = f"RUN-{application_id[-4:]}-{int(datetime.datetime.now().timestamp())}"
    active_providers = ai_provider_manager.get_active_providers()
    provider_name = active_providers[0] if active_providers else "deterministic_engine"

    run = ScrutinyRun(
        id=run_id,
        application_id=app.id,
        triggered_by_user_id="USR-SCRUTINY-01",
        status="COMPLETED",
        ai_provider_used=provider_name,
        ai_model_used="gemini-1.5-flash" if provider_name == "gemini" else "deterministic",
        rules_evaluated_count=len(rules),
        findings_count=len(scrutiny_res.findings),
        summary_notes=scrutiny_res.summary,
    )
    db.add(run)
    db.commit()

    # Clear previous unconfirmed findings for clean run re-execution
    existing_findings = db.query(ScrutinyFinding).filter(
        ScrutinyFinding.application_id == app.id,
        ScrutinyFinding.officer_decision == OfficerDecisionEnum.PENDING_REVIEW.value
    ).all()
    for ef in existing_findings:
        db.delete(ef)
    db.commit()

    # Save findings
    created_findings = []
    for idx, f_item in enumerate(scrutiny_res.findings):
        # find matching doc
        doc_match = next((d for d in docs if d.file_name == f_item.source_document_name), None)

        finding = ScrutinyFinding(
            id=f"FIND-{run_id[-6:]}-{idx+1}",
            scrutiny_run_id=run.id,
            application_id=app.id,
            regulatory_rule_id=f_item.rule_id,
            rule_clause=f_item.rule_clause,
            rule_title=f_item.rule_title,
            ai_category=f_item.finding_category,
            ai_confidence=f_item.confidence,
            observation_text=f_item.observation,
            source_document_id=doc_match.id if doc_match else None,
            source_document_name=f_item.source_document_name,
            source_page_number=f_item.source_page_number or "Page 1",
            extracted_snippet=f_item.extracted_snippet,
            officer_decision=OfficerDecisionEnum.PENDING_REVIEW.value,
        )
        db.add(finding)
        created_findings.append(finding)

    # Update application status
    if app.status == ApplicationStatusEnum.ASSIGNED_TO_SCRUTINY.value:
        app.status = ApplicationStatusEnum.SCRUTINY_IN_PROGRESS.value

    # Audit Log
    db.add(AuditLog(
        actor_user_id="USR-SCRUTINY-01",
        actor_name="Dr. Rajeshwar Sharma",
        actor_role="SCRUTINY_OFFICER",
        action="AUTOMATED_SCRUTINY_EXECUTED",
        application_id=app.id,
        entity_type="SCRUTINY_RUN",
        entity_id=run.id,
        new_state={"findings": len(created_findings), "provider": provider_name},
        remarks="Scrutiny engine completed evaluation against regulatory rules."
    ))

    db.commit()

    return {
        "run_id": run.id,
        "status": "COMPLETED",
        "provider": provider_name,
        "summary": scrutiny_res.summary,
        "findings_count": len(created_findings),
        "cross_document_observations": [c.dict() for c in scrutiny_res.cross_document_observations],
    }

@router.get("/scrutiny-runs/{run_id}")
def get_scrutiny_run(run_id: str, db: Session = Depends(get_db)):
    run = db.query(ScrutinyRun).filter(ScrutinyRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Scrutiny run not found")
    return {
        "id": run.id,
        "application_id": run.application_id,
        "timestamp": run.run_timestamp.isoformat() if run.run_timestamp else None,
        "status": run.status,
        "ai_provider_used": run.ai_provider_used,
        "rules_evaluated_count": run.rules_evaluated_count,
        "findings_count": run.findings_count,
        "summary_notes": run.summary_notes,
    }

@router.get("/scrutiny-runs/{run_id}/findings")
def get_run_findings(run_id: str, db: Session = Depends(get_db)):
    findings = db.query(ScrutinyFinding).filter(ScrutinyFinding.scrutiny_run_id == run_id).all()
    return [
        {
            "id": f.id,
            "application_id": f.application_id,
            "rule_id": f.regulatory_rule_id,
            "rule_clause": f.rule_clause,
            "rule_title": f.rule_title,
            "ai_category": f.ai_category,
            "ai_confidence": f.ai_confidence,
            "observation_text": f.observation_text,
            "source_document_name": f.source_document_name,
            "source_page_number": f.source_page_number,
            "extracted_snippet": f.extracted_snippet,
            "officer_decision": f.officer_decision,
            "officer_remarks": f.officer_remarks,
            "verified_at": f.verified_at.isoformat() if f.verified_at else None,
        }
        for f in findings
    ]

# --- 6. OFFICER VERIFICATION ---

@router.patch("/scrutiny-findings/{finding_id}/review")
def review_scrutiny_finding(finding_id: str, payload: ReviewFindingPayload, db: Session = Depends(get_db)):
    finding = db.query(ScrutinyFinding).filter(ScrutinyFinding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Scrutiny finding not found")

    old_decision = finding.officer_decision
    finding.officer_decision = payload.decision
    finding.officer_remarks = payload.remarks
    finding.verified_by_user_id = payload.reviewer_user_id
    finding.verified_at = datetime.datetime.now(datetime.UTC).replace(tzinfo=None)

    # Record Review entry
    review_record = ScrutinyReview(
        finding_id=finding.id,
        reviewer_user_id=payload.reviewer_user_id or "USR-SCRUTINY-01",
        decision=payload.decision,
        remarks=payload.remarks,
    )
    db.add(review_record)

    # Record Audit Log
    db.add(AuditLog(
        actor_user_id=payload.reviewer_user_id or "USR-SCRUTINY-01",
        actor_name="Dr. Rajeshwar Sharma",
        actor_role="SCRUTINY_OFFICER",
        action="FINDING_VERIFIED",
        application_id=finding.application_id,
        entity_type="SCRUTINY_FINDING",
        entity_id=finding.id,
        previous_state={"decision": old_decision},
        new_state={"decision": payload.decision, "remarks": payload.remarks},
        remarks=f"Officer recorded decision: {payload.decision} on rule {finding.rule_clause}"
    ))

    db.commit()

    return {
        "success": True,
        "finding_id": finding.id,
        "decision": finding.officer_decision,
        "verified_at": finding.verified_at.isoformat(),
    }

# --- 7. DEFICIENCIES MANAGEMENT ---

@router.post("/applications/{application_id}/deficiency-notices/draft")
def draft_deficiency_notice(application_id: str, payload: DraftNoticePayload, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    notice_id = f"DEF-{application_id[-4:]}-{int(datetime.datetime.now().timestamp())}"
    ref_num = f"AICTE/SRO/DEF/{app.academic_year.split('-')[0]}/{notice_id[-4:]}"

    now = datetime.datetime.now(datetime.UTC).replace(tzinfo=None)
    due = now + datetime.timedelta(days=payload.cure_period_days)

    notice = DeficiencyNotice(
        id=notice_id,
        application_id=app.id,
        notice_reference_number=ref_num,
        status=DeficiencyStatusEnum.DRAFT.value,
        issued_by_user_id="USR-SCRUTINY-01",
        cure_period_days=payload.cure_period_days,
        due_date=due,
        general_remarks=payload.general_remarks or "Deficiencies identified during preliminary document scrutiny.",
    )
    db.add(notice)
    db.commit()

    for idx, itm in enumerate(payload.items):
        item_obj = DeficiencyItem(
            id=f"ITEM-{notice_id[-6:]}-{idx+1}",
            notice_id=notice.id,
            finding_id=itm.finding_id,
            regulatory_rule_id=itm.rule_id,
            requirement_summary=itm.requirement_summary,
            observed_deficiency=itm.observed_deficiency,
            source_document=itm.source_document,
            source_page=itm.source_page or "Page 1",
            required_correction=itm.required_correction,
            status="PENDING_RECTIFICATION"
        )
        db.add(item_obj)

    app.status = ApplicationStatusEnum.DEFICIENCY_DRAFT.value
    db.commit()

    return {
        "success": True,
        "notice_id": notice.id,
        "reference_number": notice.notice_reference_number,
        "status": notice.status,
        "items_count": len(payload.items),
    }

@router.post("/deficiency-notices/{notice_id}/issue")
def issue_deficiency_notice(notice_id: str, payload: IssueNoticePayload, db: Session = Depends(get_db)):
    notice = db.query(DeficiencyNotice).filter(DeficiencyNotice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Deficiency notice not found")

    now = datetime.datetime.now(datetime.UTC).replace(tzinfo=None)
    notice.status = DeficiencyStatusEnum.ISSUED.value
    notice.issue_date = now
    notice.due_date = now + datetime.timedelta(days=notice.cure_period_days or 15)
    if payload.officer_remarks:
        notice.general_remarks = (notice.general_remarks or "") + "\nOfficer Remark: " + payload.officer_remarks

    app = notice.application
    app.status = ApplicationStatusEnum.DEFICIENCY_ISSUED.value

    # Audit Log
    db.add(AuditLog(
        actor_user_id="USR-SCRUTINY-01",
        actor_name="Dr. Rajeshwar Sharma",
        actor_role="SCRUTINY_OFFICER",
        action="DEFICIENCY_NOTICE_ISSUED",
        application_id=app.id,
        entity_type="DEFICIENCY_NOTICE",
        entity_id=notice.id,
        new_state={"reference": notice.notice_reference_number, "items_count": len(notice.items)},
        remarks=f"Official Deficiency Notice {notice.notice_reference_number} issued to institution."
    ))

    db.commit()

    return {
        "success": True,
        "notice_id": notice.id,
        "status": notice.status,
        "issue_date": notice.issue_date.isoformat(),
        "due_date": notice.due_date.isoformat(),
    }

@router.get("/applications/{application_id}/deficiency-history")
def get_deficiency_history(application_id: str, db: Session = Depends(get_db)):
    notices = db.query(DeficiencyNotice).filter(DeficiencyNotice.application_id == application_id).all()
    results = []
    for n in notices:
        items = []
        for it in n.items:
            responses = [
                {
                    "response_text": r.response_text,
                    "submitted_document_id": r.submitted_document_id,
                    "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None,
                    "status": r.officer_resolution_status,
                    "remarks": r.resolution_remarks,
                }
                for r in it.responses
            ]
            items.append({
                "item_id": it.id,
                "rule_id": it.regulatory_rule_id,
                "requirement_summary": it.requirement_summary,
                "observed_deficiency": it.observed_deficiency,
                "source_document": it.source_document,
                "source_page": it.source_page,
                "required_correction": it.required_correction,
                "status": it.status,
                "responses": responses,
            })
        results.append({
            "notice_id": n.id,
            "reference_number": n.notice_reference_number,
            "status": n.status,
            "issue_date": n.issue_date.isoformat() if n.issue_date else None,
            "due_date": n.due_date.isoformat() if n.due_date else None,
            "cure_period_days": n.cure_period_days,
            "general_remarks": n.general_remarks,
            "items": items,
        })
    return results

# --- 8. INTELLIGENT RESUBMISSION DIFF ---

@router.get("/applications/{application_id}/resubmission-diff")
def get_resubmission_diff(application_id: str, db: Session = Depends(get_db)):
    docs = db.query(ApplicationDocument).filter(ApplicationDocument.application_id == application_id).all()
    diffs = []

    for d in docs:
        if len(d.versions) >= 2:
            sorted_v = sorted(d.versions, key=lambda x: x.version_number)
            v_old = sorted_v[-2]
            v_new = sorted_v[-1]

            old_text = v_old.extracted_text or ""
            new_text = v_new.extracted_text or ""

            # Compute unified diff lines
            diff_lines = list(difflib.unified_diff(
                old_text.splitlines(keepends=True),
                new_text.splitlines(keepends=True),
                fromfile=f"{v_old.file_name} (v{v_old.version_number})",
                tofile=f"{v_new.file_name} (v{v_new.version_number})",
                n=3
            ))

            diffs.append({
                "document_id": d.id,
                "document_name": d.file_name,
                "category": d.document_category,
                "version_old": v_old.version_number,
                "version_new": v_new.version_number,
                "uploaded_at_old": v_old.uploaded_at.isoformat() if v_old.uploaded_at else None,
                "uploaded_at_new": v_new.uploaded_at.isoformat() if v_new.uploaded_at else None,
                "checksum_old": v_old.sha256_checksum,
                "checksum_new": v_new.sha256_checksum,
                "diff_text": "".join(diff_lines),
                "summary": v_new.change_summary or "Document resubmitted with revisions.",
            })

    return {
        "application_id": application_id,
        "has_resubmissions": len(diffs) > 0,
        "resubmitted_documents": diffs,
    }

# --- 9. SCRUTINY REPORT & HANDOVER ---

@router.get("/applications/{application_id}/scrutiny-report")
def get_scrutiny_report(application_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    findings = db.query(ScrutinyFinding).filter(ScrutinyFinding.application_id == application_id).all()

    compliant = [f for f in findings if f.officer_decision == OfficerDecisionEnum.VERIFIED_COMPLIANT.value]
    deficiencies = [f for f in findings if f.officer_decision == OfficerDecisionEnum.DEFICIENCY_CONFIRMED.value]
    manual_items = [f for f in findings if f.officer_decision in [OfficerDecisionEnum.PENDING_REVIEW.value, OfficerDecisionEnum.MANUALLY_VERIFIED.value]]

    report = {
        "report_id": f"REP-SCRUTINY-{app.id}",
        "generated_at": datetime.datetime.now(datetime.UTC).replace(tzinfo=None).isoformat(),
        "application": {
            "id": app.id,
            "type": app.application_type,
            "academic_year": app.academic_year,
            "status": app.status,
            "submission_date": app.submission_date.isoformat() if app.submission_date else None,
        },
        "institution": {
            "name": app.institution.name if app.institution else "Institution",
            "permanent_id": app.institution.permanent_id if app.institution else "",
            "category": app.institution.category if app.institution else "",
            "address": app.institution.address if app.institution else "",
        },
        "scrutiny_officer": {
            "name": "Dr. Rajeshwar Sharma",
            "designation": "Senior Scrutiny Officer",
            "official_id": "SO-2026-CH01",
            "regional_office": app.regional_office.name if app.regional_office else "Regional Office",
        },
        "summary": {
            "total_rules_scrutinized": len(findings),
            "compliant_count": len(compliant),
            "confirmed_deficiencies_count": len(deficiencies),
            "manual_reviews_count": len(manual_items),
            "recommendation_status": "DEFICIENCIES_DETECTED" if len(deficiencies) > 0 else "SATISFACTORY_SCRUTINY",
        },
        "verified_compliant_findings": [
            {
                "rule_clause": f.rule_clause,
                "rule_title": f.rule_title,
                "observation": f.observation_text,
                "source_doc": f.source_document_name,
                "page": f.source_page_number,
                "officer_remarks": f.officer_remarks,
            }
            for f in compliant
        ],
        "confirmed_deficiencies": [
            {
                "rule_clause": f.rule_clause,
                "rule_title": f.rule_title,
                "deficiency_observation": f.observation_text,
                "source_doc": f.source_document_name,
                "page": f.source_page_number,
                "officer_remarks": f.officer_remarks,
            }
            for f in deficiencies
        ],
        "manual_verification_items": [
            {
                "rule_clause": f.rule_clause,
                "rule_title": f.rule_title,
                "observation": f.observation_text,
                "officer_remarks": f.officer_remarks,
            }
            for f in manual_items
        ],
    }

    return report

@router.post("/applications/{application_id}/scrutiny-complete")
def complete_scrutiny(application_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    app.status = ApplicationStatusEnum.SCRUTINY_COMPLETED.value

    db.add(AuditLog(
        actor_user_id="USR-SCRUTINY-01",
        actor_name="Dr. Rajeshwar Sharma",
        actor_role="SCRUTINY_OFFICER",
        action="SCRUTINY_COMPLETED",
        application_id=app.id,
        entity_type="APPLICATION",
        entity_id=app.id,
        new_state={"status": app.status},
        remarks="Scrutiny findings finalized and consolidated into statutory report."
    ))
    db.commit()

    return {"success": True, "application_id": app.id, "status": app.status}

@router.post("/applications/{application_id}/workflow/handover")
def workflow_handover(application_id: str, payload: HandoverPayload, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    old_status = app.status
    app.status = payload.next_stage

    # Record Workflow Event
    wf_event = WorkflowEvent(
        application_id=app.id,
        event_type="WORKFLOW_HANDOVER",
        from_status=old_status,
        to_status=payload.next_stage,
        actor_user_id="USR-SCRUTINY-01",
        remarks=payload.officer_remarks or f"Scrutiny stage completed. Application dispatched to {payload.next_stage}."
    )
    db.add(wf_event)

    # Audit Log
    db.add(AuditLog(
        actor_user_id="USR-SCRUTINY-01",
        actor_name="Dr. Rajeshwar Sharma",
        actor_role="SCRUTINY_OFFICER",
        action="STAGE_HANDOVER",
        application_id=app.id,
        entity_type="APPLICATION",
        entity_id=app.id,
        previous_state={"status": old_status},
        new_state={"status": payload.next_stage},
        remarks=payload.officer_remarks or f"Handover to {payload.next_stage}"
    ))

    db.commit()

    return {
        "success": True,
        "application_id": app.id,
        "from_status": old_status,
        "to_status": payload.next_stage,
    }

