import datetime
import enum
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    Enum,
    Float,
    JSON,
    Index,
)
from sqlalchemy.orm import relationship, declarative_base
Base = declarative_base()

# --- ENUMS ---

class SystemRoleEnum(str, enum.Enum):
    INSTITUTION = "INSTITUTION"
    REGIONAL_OFFICER = "REGIONAL_OFFICER"
    SCRUTINY_OFFICER = "SCRUTINY_OFFICER"
    EVC_COORDINATOR = "EVC_COORDINATOR"
    EVC_MEMBER = "EVC_MEMBER"
    COMPETENT_AUTHORITY = "COMPETENT_AUTHORITY"
    COMPLIANCE_OFFICER = "COMPLIANCE_OFFICER"
    SYSTEM_ADMIN = "SYSTEM_ADMIN"

class ApplicationStatusEnum(str, enum.Enum):
    SUBMITTED = "SUBMITTED"
    RECEIVED_BY_REGION = "RECEIVED_BY_REGION"
    ASSIGNED_TO_SCRUTINY = "ASSIGNED_TO_SCRUTINY"
    SCRUTINY_IN_PROGRESS = "SCRUTINY_IN_PROGRESS"
    DEFICIENCY_DRAFT = "DEFICIENCY_DRAFT"
    DEFICIENCY_ISSUED = "DEFICIENCY_ISSUED"
    RESUBMISSION_RECEIVED = "RESUBMISSION_RECEIVED"
    SCRUTINY_COMPLETED = "SCRUTINY_COMPLETED"
    FORWARDED_TO_EVC = "FORWARDED_TO_EVC"
    FORWARDED_TO_AUTHORITY = "FORWARDED_TO_AUTHORITY"

class DeficiencyStatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    ISSUED = "ISSUED"
    RESPONSE_RECEIVED = "RESPONSE_RECEIVED"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"
    UNRESOLVED = "UNRESOLVED"

class FindingCategoryEnum(str, enum.Enum):
    EVIDENCE_FOUND = "EVIDENCE_FOUND"
    POTENTIALLY_SATISFIED = "POTENTIAL_SATISFIED"
    POTENTIAL_DEFICIENCY = "POTENTIAL_DEFICIENCY"
    MISSING_EVIDENCE = "MISSING_EVIDENCE"
    MANUAL_REVIEW_REQUIRED = "MANUAL_REVIEW_REQUIRED"
    NOT_APPLICABLE = "NOT_APPLICABLE"

class OfficerDecisionEnum(str, enum.Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    VERIFIED_COMPLIANT = "VERIFIED_COMPLIANT"
    DEFICIENCY_CONFIRMED = "DEFICIENCY_CONFIRMED"
    FINDING_MODIFIED = "FINDING_MODIFIED"
    NOT_APPLICABLE_CONFIRMED = "NOT_APPLICABLE_CONFIRMED"
    MANUALLY_VERIFIED = "MANUALLY_VERIFIED"

class DocumentExtractionStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    EXTRACTED = "EXTRACTED"
    OCR_PROCESSED = "OCR_PROCESSED"
    FAILED = "FAILED"

# --- 1. USERS & ROLES ---

class Role(Base):
    __tablename__ = "roles"

    id = Column(String(50), primary_key=True)  # e.g., SCRUTINY_OFFICER
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)  # e.g. USR-001 or UUID
    official_id = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    designation = Column(String(255), nullable=True)
    regional_office_id = Column(String(50), ForeignKey("regional_offices.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    regional_office = relationship("RegionalOffice", back_populates="officers")

class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    role_id = Column(String(50), ForeignKey("roles.id"), nullable=False)
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="roles")
    role = relationship("Role")

# --- 2. REGIONAL OFFICES & INSTITUTIONS ---

class RegionalOffice(Base):
    __tablename__ = "regional_offices"

    id = Column(String(50), primary_key=True)  # e.g. RO-SOUTH, RO-NORTH
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    jurisdiction_states = Column(JSON, nullable=True)  # List of state names
    address = Column(Text, nullable=True)
    email = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    officers = relationship("User", back_populates="regional_office")
    institutions = relationship("Institution", back_populates="regional_office")
    applications = relationship("Application", back_populates="regional_office")

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(String(64), primary_key=True)  # e.g. INST-1-10293847
    permanent_id = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False)  # e.g. Technical Institute, University Dept
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    pincode = Column(String(10), nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(20), nullable=True)
    regional_office_id = Column(String(50), ForeignKey("regional_offices.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    regional_office = relationship("RegionalOffice", back_populates="institutions")
    applications = relationship("Application", back_populates="institution")

# --- 3. APPLICATIONS & ASSIGNMENTS ---

class Application(Base):
    __tablename__ = "applications"

    id = Column(String(64), primary_key=True)  # e.g. APP-2026-ENG-8492
    institution_id = Column(String(64), ForeignKey("institutions.id"), nullable=False, index=True)
    regional_office_id = Column(String(50), ForeignKey("regional_offices.id"), nullable=False, index=True)
    application_type = Column(String(100), nullable=False)  # e.g. Extension of Approval (EoA), New Institute
    academic_year = Column(String(20), nullable=False, default="2026-2027")
    status = Column(String(50), nullable=False, default=ApplicationStatusEnum.SUBMITTED.value, index=True)
    submission_date = Column(DateTime, default=datetime.datetime.utcnow)
    target_scrutiny_deadline = Column(DateTime, nullable=True)
    priority_level = Column(String(20), default="NORMAL")  # HIGH, NORMAL, ESCALATED
    priority_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    institution = relationship("Institution", back_populates="applications")
    regional_office = relationship("RegionalOffice", back_populates="applications")
    assignments = relationship("ApplicationAssignment", back_populates="application", cascade="all, delete-orphan")
    documents = relationship("ApplicationDocument", back_populates="application", cascade="all, delete-orphan")
    scrutiny_runs = relationship("ScrutinyRun", back_populates="application", cascade="all, delete-orphan")
    deficiency_notices = relationship("DeficiencyNotice", back_populates="application", cascade="all, delete-orphan")
    workflow_events = relationship("WorkflowEvent", back_populates="application", cascade="all, delete-orphan")

class ApplicationAssignment(Base):
    __tablename__ = "application_assignments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(String(64), ForeignKey("applications.id"), nullable=False, index=True)
    assigned_by_user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    assigned_to_user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    assignment_role = Column(String(50), nullable=False, default="SCRUTINY_OFFICER")
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)
    remarks = Column(Text, nullable=True)

    application = relationship("Application", back_populates="assignments")
    assigned_by = relationship("User", foreign_keys=[assigned_by_user_id])
    assigned_to = relationship("User", foreign_keys=[assigned_to_user_id])

# --- 4. DOCUMENTS & VERSIONS ---

class ApplicationDocument(Base):
    __tablename__ = "application_documents"

    id = Column(String(64), primary_key=True)  # e.g. DOC-APP-001
    application_id = Column(String(64), ForeignKey("applications.id"), nullable=False, index=True)
    document_category = Column(String(100), nullable=False)  # e.g. LAND_TITLE, OCCUPANCY_CERT, FACULTY_CADRE
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    file_mime_type = Column(String(100), nullable=False)
    sha256_checksum = Column(String(64), nullable=False, index=True)
    current_version = Column(Integer, default=1)
    extraction_status = Column(String(50), default=DocumentExtractionStatusEnum.PENDING.value)
    extracted_text = Column(Text, nullable=True)
    extraction_metadata = Column(JSON, nullable=True)  # Page count, OCR confidence, etc.
    upload_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    uploaded_by_user_id = Column(String(64), ForeignKey("users.id"), nullable=True)

    application = relationship("Application", back_populates="documents")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")

class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(String(64), ForeignKey("application_documents.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    sha256_checksum = Column(String(64), nullable=False)
    extracted_text = Column(Text, nullable=True)
    change_summary = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("ApplicationDocument", back_populates="versions")

# --- 5. REGULATORY RULES & VERSIONS ---

class RegulatoryRule(Base):
    __tablename__ = "regulatory_rules"

    id = Column(String(64), primary_key=True)  # e.g. RULE-APH-2026-LAND-01
    regulation_name = Column(String(255), nullable=False)  # AICTE Approval Process Handbook (APH)
    clause_reference = Column(String(100), nullable=False)  # e.g. Clause 4.1.2
    title = Column(String(255), nullable=False)
    requirement_description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)  # MANDATORY_DOCUMENT, NUMERICAL_THRESHOLD, etc.
    application_type = Column(String(100), default="ALL")
    institution_category = Column(String(100), default="ALL")
    applicability_conditions = Column(JSON, nullable=True)
    source_document = Column(String(255), nullable=False)
    source_page = Column(String(50), nullable=True)
    effective_date = Column(DateTime, default=datetime.datetime.utcnow)
    expiry_date = Column(DateTime, nullable=True)
    current_version = Column(String(20), default="1.0")
    is_active = Column(Boolean, default=True)
    is_demonstration_data = Column(Boolean, default=True)  # Clearly labels synthetic rules

    versions = relationship("RegulatoryRuleVersion", back_populates="rule", cascade="all, delete-orphan")

class RegulatoryRuleVersion(Base):
    __tablename__ = "regulatory_rule_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    rule_id = Column(String(64), ForeignKey("regulatory_rules.id"), nullable=False, index=True)
    version_tag = Column(String(20), nullable=False)
    requirement_description = Column(Text, nullable=False)
    source_document = Column(String(255), nullable=False)
    effective_date = Column(DateTime, default=datetime.datetime.utcnow)

    rule = relationship("RegulatoryRule", back_populates="versions")

class RuleApplicability(Base):
    __tablename__ = "rule_applicability"

    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(String(64), ForeignKey("applications.id"), nullable=False, index=True)
    rule_id = Column(String(64), ForeignKey("regulatory_rules.id"), nullable=False)
    is_applicable = Column(Boolean, default=True)
    evaluation_reason = Column(Text, nullable=True)

# --- 6. SCRUTINY RUNS, FINDINGS & REVIEWS ---

class ScrutinyRun(Base):
    __tablename__ = "scrutiny_runs"

    id = Column(String(64), primary_key=True)  # e.g. RUN-2026-001
    application_id = Column(String(64), ForeignKey("applications.id"), nullable=False, index=True)
    triggered_by_user_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    run_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="COMPLETED")
    ai_provider_used = Column(String(50), default="gemini")
    ai_model_used = Column(String(100), default="gemini-1.5-flash")
    rules_evaluated_count = Column(Integer, default=0)
    findings_count = Column(Integer, default=0)
    summary_notes = Column(Text, nullable=True)

    application = relationship("Application", back_populates="scrutiny_runs")
    findings = relationship("ScrutinyFinding", back_populates="scrutiny_run", cascade="all, delete-orphan")

class ScrutinyFinding(Base):
    __tablename__ = "scrutiny_findings"

    id = Column(String(64), primary_key=True)  # e.g. FINDING-001
    scrutiny_run_id = Column(String(64), ForeignKey("scrutiny_runs.id"), nullable=False, index=True)
    application_id = Column(String(64), ForeignKey("applications.id"), nullable=False, index=True)
    regulatory_rule_id = Column(String(64), ForeignKey("regulatory_rules.id"), nullable=False)
    rule_clause = Column(String(100), nullable=False)
    rule_title = Column(String(255), nullable=False)
    ai_category = Column(String(50), nullable=False)  # EVIDENCE_FOUND, POTENTIAL_DEFICIENCY, etc.
    ai_confidence = Column(Float, default=0.9)
    observation_text = Column(Text, nullable=False)
    source_document_id = Column(String(64), ForeignKey("application_documents.id"), nullable=True)
    source_document_name = Column(String(255), nullable=True)
    source_page_number = Column(String(50), nullable=True)
    extracted_snippet = Column(Text, nullable=True)
    
    # Separation of AI finding and Officer Verification
    officer_decision = Column(String(50), default=OfficerDecisionEnum.PENDING_REVIEW.value, index=True)
    officer_remarks = Column(Text, nullable=True)
    verified_by_user_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)

    scrutiny_run = relationship("ScrutinyRun", back_populates="findings")
    reviews = relationship("ScrutinyReview", back_populates="finding", cascade="all, delete-orphan")

class ScrutinyReview(Base):
    __tablename__ = "scrutiny_reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    finding_id = Column(String(64), ForeignKey("scrutiny_findings.id"), nullable=False, index=True)
    reviewer_user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    decision = Column(String(50), nullable=False)
    remarks = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.datetime.utcnow)

    finding = relationship("ScrutinyFinding", back_populates="reviews")

# --- 7. DEFICIENCY NOTICES & RESPONSES ---

class DeficiencyNotice(Base):
    __tablename__ = "deficiency_notices"

    id = Column(String(64), primary_key=True)  # e.g. DEF-2026-001
    application_id = Column(String(64), ForeignKey("applications.id"), nullable=False, index=True)
    notice_reference_number = Column(String(100), unique=True, nullable=False)
    status = Column(String(50), default=DeficiencyStatusEnum.DRAFT.value, index=True)
    issued_by_user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    issue_date = Column(DateTime, nullable=True)
    cure_period_days = Column(Integer, default=15)
    due_date = Column(DateTime, nullable=True)
    general_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    application = relationship("Application", back_populates="deficiency_notices")
    items = relationship("DeficiencyItem", back_populates="notice", cascade="all, delete-orphan")

class DeficiencyItem(Base):
    __tablename__ = "deficiency_items"

    id = Column(String(64), primary_key=True)  # e.g. DEF-ITEM-001
    notice_id = Column(String(64), ForeignKey("deficiency_notices.id"), nullable=False, index=True)
    finding_id = Column(String(64), ForeignKey("scrutiny_findings.id"), nullable=True)
    regulatory_rule_id = Column(String(64), ForeignKey("regulatory_rules.id"), nullable=False)
    requirement_summary = Column(Text, nullable=False)
    observed_deficiency = Column(Text, nullable=False)
    source_document = Column(String(255), nullable=True)
    source_page = Column(String(50), nullable=True)
    required_correction = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING_RECTIFICATION")

    notice = relationship("DeficiencyNotice", back_populates="items")
    responses = relationship("DeficiencyResponse", back_populates="item", cascade="all, delete-orphan")

class DeficiencyResponse(Base):
    __tablename__ = "deficiency_responses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    deficiency_item_id = Column(String(64), ForeignKey("deficiency_items.id"), nullable=False, index=True)
    response_text = Column(Text, nullable=False)
    submitted_document_id = Column(String(64), ForeignKey("application_documents.id"), nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    officer_resolution_status = Column(String(50), default="UNDER_REVIEW")
    resolution_remarks = Column(Text, nullable=True)

    item = relationship("DeficiencyItem", back_populates="responses")

class ResubmissionBatch(Base):
    __tablename__ = "resubmission_batches"

    id = Column(String(64), primary_key=True)  # e.g. RESUB-001
    application_id = Column(String(64), ForeignKey("applications.id"), nullable=False, index=True)
    deficiency_notice_id = Column(String(64), ForeignKey("deficiency_notices.id"), nullable=False)
    submission_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="RECEIVED")
    changes_summary = Column(Text, nullable=True)

# --- 8. WORKFLOW, NOTIFICATIONS, AUDIT & AI LOGS ---

class WorkflowEvent(Base):
    __tablename__ = "workflow_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(String(64), ForeignKey("applications.id"), nullable=False, index=True)
    event_type = Column(String(100), nullable=False)  # STAGE_TRANSITION, SCRUTINY_COMPLETED, HANDOVER
    from_status = Column(String(50), nullable=True)
    to_status = Column(String(50), nullable=False)
    actor_user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    remarks = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    application = relationship("Application", back_populates="workflow_events")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    recipient_user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    application_id = Column(String(64), ForeignKey("applications.id"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="INFO")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    actor_user_id = Column(String(64), nullable=False)
    actor_name = Column(String(255), nullable=True)
    actor_role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)  # DOCUMENT_EXTRACTED, FINDING_REVIEWED, etc.
    application_id = Column(String(64), nullable=True, index=True)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=False)
    previous_state = Column(JSON, nullable=True)
    new_state = Column(JSON, nullable=True)
    remarks = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

class AIProcessingLog(Base):
    __tablename__ = "ai_processing_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(String(64), nullable=True)
    provider = Column(String(50), nullable=False)
    model = Column(String(100), nullable=False)
    operation = Column(String(100), nullable=False)  # DOCUMENT_ANALYSIS, DEFICIENCY_GEN
    input_tokens = Column(Integer, nullable=True)
    output_tokens = Column(Integer, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    status = Column(String(50), nullable=False)  # SUCCESS, FAILOVER, ERROR
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

