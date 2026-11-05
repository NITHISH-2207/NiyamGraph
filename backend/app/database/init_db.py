import datetime
import hashlib
from app.database.session import engine, Base, SessionLocal
from app.models.entities import (
    Role,
    User,
    UserRole,
    RegionalOffice,
    Institution,
    Application,
    ApplicationAssignment,
    ApplicationDocument,
    DocumentVersion,
    RegulatoryRule,
    ScrutinyRun,
    ScrutinyFinding,
    DeficiencyNotice,
    DeficiencyItem,
    DeficiencyResponse,
    WorkflowEvent,
    AuditLog,
    SystemRoleEnum,
    ApplicationStatusEnum,
    DeficiencyStatusEnum,
    FindingCategoryEnum,
    OfficerDecisionEnum,
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Role).first():
            print("Database already contains data. Skipping initial seed.")
            return

        print("Seeding initial demonstration data...")

        # 1. ROLES
        roles_data = [
            ("INSTITUTION", "Applicant Technical Institution"),
            ("REGIONAL_OFFICER", "AICTE Regional Officer"),
            ("SCRUTINY_OFFICER", "AICTE Scrutiny Officer"),
            ("EVC_COORDINATOR", "Expert Visit Committee Coordinator"),
            ("EVC_MEMBER", "Expert Visit Committee Member"),
            ("COMPETENT_AUTHORITY", "Statutory Competent Authority / Council"),
            ("COMPLIANCE_OFFICER", "Post-Approval Compliance Officer"),
            ("SYSTEM_ADMIN", "Central System Administrator"),
        ]
        for r_id, r_name in roles_data:
            db.add(Role(id=r_id, name=r_name, description=f"Statutory platform role: {r_name}"))
        db.commit()

        # 2. REGIONAL OFFICES
        ro_south = RegionalOffice(
            id="RO-SOUTH",
            code="SRO-CHN",
            name="Southern Regional Office (Chennai)",
            jurisdiction_states=["Tamil Nadu", "Puducherry"],
            address="Shastri Bhavan, 26 Haddows Road, Nungambakkam, Chennai - 600006",
            email="sro@aicte.gov.in"
        )
        ro_west = RegionalOffice(
            id="RO-WEST",
            code="WRO-MUM",
            name="Western Regional Office (Mumbai)",
            jurisdiction_states=["Maharashtra", "Goa"],
            address="Industrial Assurance Building, Veer Nariman Road, Churchgate, Mumbai - 400020",
            email="wro@aicte.gov.in"
        )
        ro_north = RegionalOffice(
            id="RO-NORTH",
            code="NRO-KNP",
            name="Northern Regional Office (Kanpur)",
            jurisdiction_states=["Uttar Pradesh", "Uttarakhand"],
            address="Govt. Polytechnic Campus, Vikas Nagar, Kanpur - 208002",
            email="nro@aicte.gov.in"
        )
        db.add_all([ro_south, ro_west, ro_north])
        db.commit()

        # 3. USERS
        # Scrutiny Officer (Demo User)
        scrutiny_user = User(
            id="USR-SCRUTINY-01",
            official_id="SO-2026-CH01",
            email="scrutiny.officer@aicte.gov.in",
            hashed_password="pbkdf2_demo_hash_scrutiny2026",
            full_name="Dr. Rajeshwar Sharma",
            designation="Senior Scrutiny Officer & Technical Evaluator",
            regional_office_id="RO-SOUTH"
        )
        ro_user = User(
            id="USR-RO-01",
            official_id="RO-2026-DIR01",
            email="regional.officer@aicte.gov.in",
            hashed_password="pbkdf2_demo_hash_ro2026",
            full_name="Smt. Meenakshi Sundaram",
            designation="Regional Director (Southern Region)",
            regional_office_id="RO-SOUTH"
        )
        db.add_all([scrutiny_user, ro_user])
        db.commit()

        db.add(UserRole(user_id=scrutiny_user.id, role_id="SCRUTINY_OFFICER"))
        db.add(UserRole(user_id=ro_user.id, role_id="REGIONAL_OFFICER"))
        db.commit()

        # 4. INSTITUTIONS
        inst_1 = Institution(
            id="INST-TN-ENG-042",
            permanent_id="1-48291048",
            name="National Institute of Science & Advanced Technology",
            category="Technical Institution (Engineering & Technology)",
            state="Tamil Nadu",
            district="Chennai",
            address="Plot No. 42, Rajiv Gandhi IT Expressway, Sholinganallur, Chennai",
            pincode="600119",
            contact_email="principal@nisat-tech.edu.in",
            contact_phone="+91-44-24901844",
            regional_office_id="RO-SOUTH"
        )
        inst_2 = Institution(
            id="INST-TN-ARCH-018",
            permanent_id="1-39102847",
            name="Apex School of Architecture & Urban Planning",
            category="Technical Institution (Architecture)",
            state="Tamil Nadu",
            district="Coimbatore",
            address="NH-47, Avinashi Road, Neelambur, Coimbatore",
            pincode="641062",
            contact_email="director@apexarch.edu.in",
            contact_phone="+91-422-2627800",
            regional_office_id="RO-SOUTH"
        )
        inst_3 = Institution(
            id="INST-TN-POLY-005",
            permanent_id="1-29184711",
            name="Government Aided Polytechnic College",
            category="Diploma Technical Institute",
            state="Tamil Nadu",
            district="Madurai",
            address="University Road, Alagar Kovil Main Rd, Madurai",
            pincode="625002",
            contact_email="admin@maduraipoly.ac.in",
            contact_phone="+91-452-2531000",
            regional_office_id="RO-SOUTH"
        )
        db.add_all([inst_1, inst_2, inst_3])
        db.commit()

        # 5. DEMONSTRATION REGULATORY RULES (APH 2026-27 Norms)
        rules_data = [
            RegulatoryRule(
                id="RULE-DEMO-LAND-01",
                regulation_name="AICTE Approval Process Handbook (APH 2026-27)",
                clause_reference="Clause 4.1.2 - Land Title & Contiguity",
                title="Continuous Land Ownership & Registered Title Deed",
                requirement_description="[DEMONSTRATION DATA] The applicant institution must possess clear, undisputed registered title deed in the name of the Trust/Society for a minimum contiguous land area of 2.5 Acres (Mega/Metro) or 4.0 Acres (Other Areas).",
                category="MANDATORY_DOCUMENT",
                application_type="ALL",
                institution_category="ALL",
                source_document="AICTE APH 2026-27 Chapter IV",
                source_page="Page 48",
                is_demonstration_data=True
            ),
            RegulatoryRule(
                id="RULE-DEMO-SAFETY-02",
                regulation_name="AICTE Approval Process Handbook (APH 2026-27)",
                clause_reference="Clause 4.3.1 - Structural Safety & Occupancy",
                title="Building Safety & Municipal Occupancy Certificate",
                requirement_description="[DEMONSTRATION DATA] Submission of valid Structural Stability Certificate from a Govt. Chartered Structural Engineer and Fire & Safety No-Objection Certificate (NOC) issued by the Competent Fire Authority.",
                category="DATE_VALIDITY",
                application_type="ALL",
                institution_category="ALL",
                source_document="AICTE APH 2026-27 Chapter IV",
                source_page="Page 52",
                is_demonstration_data=True
            ),
            RegulatoryRule(
                id="RULE-DEMO-CADRE-03",
                regulation_name="AICTE Approval Process Handbook (APH 2026-27)",
                clause_reference="Clause 5.2.4 - Faculty Cadre Ratio",
                title="Faculty Cadre Ratio (1:2:6) and Student-Faculty Ratio (1:20)",
                requirement_description="[DEMONSTRATION DATA] For Under Graduate Engineering Programs, the Student-Teacher ratio must not exceed 1:20 with cadre ratio of 1 Professor : 2 Associate Professors : 6 Assistant Professors.",
                category="NUMERICAL_THRESHOLD",
                application_type="Extension of Approval (EoA)",
                institution_category="Technical Institution (Engineering & Technology)",
                source_document="AICTE APH 2026-27 Chapter V",
                source_page="Page 68",
                is_demonstration_data=True
            ),
            RegulatoryRule(
                id="RULE-DEMO-CORPUS-04",
                regulation_name="AICTE Approval Process Handbook (APH 2026-27)",
                clause_reference="Clause 6.1.1 - Joint Fixed Deposit / Corpus Fund",
                title="Joint FDR Corpus with AICTE Regional Office",
                requirement_description="[DEMONSTRATION DATA] FDR in joint name of the Society/Trust and the Regional Officer AICTE for ₹15.00 Lakhs for a minimum tenure of 8 years.",
                category="NUMERICAL_THRESHOLD",
                application_type="ALL",
                institution_category="ALL",
                source_document="AICTE APH 2026-27 Chapter VI",
                source_page="Page 84",
                is_demonstration_data=True
            ),
            RegulatoryRule(
                id="RULE-DEMO-CONSIST-05",
                regulation_name="AICTE Approval Process Handbook (APH 2026-27)",
                clause_reference="Clause 3.1.5 - Cross-Document Institutional Consistency",
                title="Identity, Address & Trust Consistency Across Certificates",
                requirement_description="[DEMONSTRATION DATA] The legal name of the institution, address, and sponsoring trust on Land Records, Tax receipts, Society Registration, and Bank accounts must match identically.",
                category="CROSS_DOCUMENT_CONSISTENCY",
                application_type="ALL",
                institution_category="ALL",
                source_document="AICTE APH 2026-27 Chapter III",
                source_page="Page 36",
                is_demonstration_data=True
            ),
        ]
        db.add_all(rules_data)
        db.commit()

        # 6. APPLICATIONS
        app_1 = Application(
            id="APP-2026-ENG-8492",
            institution_id=inst_1.id,
            regional_office_id=ro_south.id,
            application_type="Extension of Approval (EoA)",
            academic_year="2026-2027",
            status=ApplicationStatusEnum.SCRUTINY_IN_PROGRESS.value,
            submission_date=datetime.datetime.utcnow() - datetime.timedelta(days=4),
            target_scrutiny_deadline=datetime.datetime.utcnow() + datetime.timedelta(days=6),
            priority_level="HIGH",
            priority_reason="Deadline approaching (4 days pending; intake expansion requested for B.Tech CSE)"
        )
        app_2 = Application(
            id="APP-2026-ARCH-3011",
            institution_id=inst_2.id,
            regional_office_id=ro_south.id,
            application_type="Extension of Approval (EoA)",
            academic_year="2026-2027",
            status=ApplicationStatusEnum.RESUBMISSION_RECEIVED.value,
            submission_date=datetime.datetime.utcnow() - datetime.timedelta(days=12),
            target_scrutiny_deadline=datetime.datetime.utcnow() + datetime.timedelta(days=2),
            priority_level="ESCALATED",
            priority_reason="Institution submitted corrected Building Safety Certificate in response to Notice DEF-2026-001"
        )
        app_3 = Application(
            id="APP-2026-POLY-1104",
            institution_id=inst_3.id,
            regional_office_id=ro_south.id,
            application_type="New Program / Course Addition",
            academic_year="2026-2027",
            status=ApplicationStatusEnum.ASSIGNED_TO_SCRUTINY.value,
            submission_date=datetime.datetime.utcnow() - datetime.timedelta(days=2),
            target_scrutiny_deadline=datetime.datetime.utcnow() + datetime.timedelta(days=10),
            priority_level="NORMAL",
            priority_reason="Assigned by Regional Office on Nov 03, 2026. Pending initial scrutiny."
        )
        db.add_all([app_1, app_2, app_3])
        db.commit()

        # Application Assignments
        db.add(ApplicationAssignment(
            application_id=app_1.id,
            assigned_by_user_id=ro_user.id,
            assigned_to_user_id=scrutiny_user.id,
            assignment_role="SCRUTINY_OFFICER",
            remarks="Assigned for thorough scrutiny of expanded intake and faculty cadre verification."
        ))
        db.add(ApplicationAssignment(
            application_id=app_2.id,
            assigned_by_user_id=ro_user.id,
            assigned_to_user_id=scrutiny_user.id,
            assignment_role="SCRUTINY_OFFICER",
            remarks="Resubmission review following fire NOC deficiency clarification."
        ))
        db.add(ApplicationAssignment(
            application_id=app_3.id,
            assigned_by_user_id=ro_user.id,
            assigned_to_user_id=scrutiny_user.id,
            assignment_role="SCRUTINY_OFFICER",
            remarks="Initial scrutiny assigned for diploma electrical branch introduction."
        ))
        db.commit()

        # 7. DOCUMENTS FOR APP-1 (National Institute of Science & Advanced Technology)
        doc_land = ApplicationDocument(
            id="DOC-8492-LAND-01",
            application_id=app_1.id,
            document_category="LAND_TITLE",
            file_name="Registered_Sale_Deed_Sholinganallur_4Acres.pdf",
            file_path="uploads/demo/Registered_Sale_Deed_Sholinganallur_4Acres.pdf",
            file_size_bytes=2485720,
            file_mime_type="application/pdf",
            sha256_checksum=hashlib.sha256(b"Registered_Sale_Deed_NISAT_2026").hexdigest(),
            current_version=1,
            extraction_status="EXTRACTED",
            extracted_text="""SUB-REGISTRAR OFFICE, CHENNAI SOUTH
REGISTERED SALE DEED NO: 4892/2012
This Deed of Conveyance made on 14th day of June 2012 between Tamil Nadu Industrial Dev Corp and National Science Educational Trust.
Schedule of Property:
Survey Nos: 142/1, 142/2, 143/4 at Sholinganallur Village, Tambaram Taluk, Chengalpattu District.
Total Extent: 4.25 Acres (Four Acres and Twenty Five Cents) contiguous land.
Absolute, undisputed freehold title in peaceful possession of the purchaser for educational institutional purposes.""",
            extraction_metadata={"pages": 8, "ocr_used": False, "confidence": 0.98}
        )

        doc_safety = ApplicationDocument(
            id="DOC-8492-SAFE-02",
            application_id=app_1.id,
            document_category="OCCUPANCY_AND_FIRE_SAFETY",
            file_name="Fire_NOC_Building_Stability_Cert_2026.pdf",
            file_path="uploads/demo/Fire_NOC_Building_Stability_Cert_2026.pdf",
            file_size_bytes=1849200,
            file_mime_type="application/pdf",
            sha256_checksum=hashlib.sha256(b"Fire_NOC_Building_Stability_NISAT_2026").hexdigest(),
            current_version=1,
            extraction_status="EXTRACTED",
            extracted_text="""GOVERNMENT OF TAMIL NADU
FIRE AND RESCUE SERVICES DEPARTMENT
NOC No: D.Dis. 4182/C1/2025 Dated: 10.08.2025
NO OBJECTION CERTIFICATE
Certified that the multi-storied institutional building occupied by National Institute of Science & Advanced Technology at Sholinganallur, Chennai was inspected on 02.08.2025.
Validity: This No Objection Certificate is valid for a period of ONE YEAR from the date of issue (Valid up to 09.08.2026).
Compliance: All fire-fighting apparatus, wet risers, and escape stairwells comply with National Building Code 2016 Part IV.""",
            extraction_metadata={"pages": 4, "ocr_used": False, "confidence": 0.96}
        )

        doc_faculty = ApplicationDocument(
            id="DOC-8492-FAC-03",
            application_id=app_1.id,
            document_category="FACULTY_CADRE_LIST",
            file_name="AICTE_Faculty_Cadre_PayScale_Summary.pdf",
            file_path="uploads/demo/AICTE_Faculty_Cadre_PayScale_Summary.pdf",
            file_size_bytes=984120,
            file_mime_type="application/pdf",
            sha256_checksum=hashlib.sha256(b"Faculty_Cadre_Summary_NISAT_2026").hexdigest(),
            current_version=1,
            extraction_status="EXTRACTED",
            extracted_text="""NATIONAL INSTITUTE OF SCIENCE & ADVANCED TECHNOLOGY
FACULTY CADRE & ROSTER RETURN FOR ACADEMIC YEAR 2026-27
Department: Computer Science & Engineering (Sanctioned Intake: 180 Students)
Total Enrolled UG Students: 540 Students across 2nd, 3rd and 4th Years.
Required Faculty (1:20 Ratio): 27 Faculty members.
Current On-Roll Faculty:
- Professors: 2 (Shortfall of 1 against 1:2:6 cadre ratio requirement of 3 Professors)
- Associate Professors: 4 (Shortfall of 2 against norm of 6)
- Assistant Professors: 21
Total Faculty Count: 27 Faculty Members. Overall Student-Teacher Ratio is 1:20.
Cadre ratio shows deficit in Professor & Associate Professor cadre bands.""",
            extraction_metadata={"pages": 6, "ocr_used": False, "confidence": 0.94}
        )

        db.add_all([doc_land, doc_safety, doc_faculty])
        db.commit()

        # 8. SCRUTINY RUN & FINDINGS FOR APP-1
        run_1 = ScrutinyRun(
            id="RUN-8492-001",
            application_id=app_1.id,
            triggered_by_user_id=scrutiny_user.id,
            status="COMPLETED",
            ai_provider_used="gemini",
            ai_model_used="gemini-1.5-flash",
            rules_evaluated_count=5,
            findings_count=3,
            summary_notes="Preliminary scrutiny executed. Land and Fire Safety criteria satisfied. Faculty cadre ratio indicates a deficit in Senior Cadre (Professors and Associate Professors)."
        )
        db.add(run_1)
        db.commit()

        f1 = ScrutinyFinding(
            id="FIND-8492-01",
            scrutiny_run_id=run_1.id,
            application_id=app_1.id,
            regulatory_rule_id="RULE-DEMO-LAND-01",
            rule_clause="Clause 4.1.2 - Land Title & Contiguity",
            rule_title="Continuous Land Ownership & Registered Title Deed",
            ai_category=FindingCategoryEnum.EVIDENCE_FOUND.value,
            ai_confidence=0.98,
            observation_text="Clear registered sale deed #4892/2012 shows 4.25 Acres contiguous land in Sholinganallur. Minimum requirement of 2.5 Acres for Metro area is fully satisfied.",
            source_document_id=doc_land.id,
            source_document_name=doc_land.file_name,
            source_page_number="Page 2",
            extracted_snippet="Total Extent: 4.25 Acres (Four Acres and Twenty Five Cents) contiguous land. Freehold title in peaceful possession.",
            officer_decision=OfficerDecisionEnum.VERIFIED_COMPLIANT.value,
            officer_remarks="Verified against land revenue records and encumbrance certificate. Compliant.",
            verified_by_user_id=scrutiny_user.id,
            verified_at=datetime.datetime.utcnow() - datetime.timedelta(hours=5)
        )

        f2 = ScrutinyFinding(
            id="FIND-8492-02",
            scrutiny_run_id=run_1.id,
            application_id=app_1.id,
            regulatory_rule_id="RULE-DEMO-SAFETY-02",
            rule_clause="Clause 4.3.1 - Structural Safety & Occupancy",
            rule_title="Building Safety & Municipal Occupancy Certificate",
            ai_category=FindingCategoryEnum.EVIDENCE_FOUND.value,
            ai_confidence=0.95,
            observation_text="Fire and Rescue Services Department NOC #4182/C1/2025 is valid up to 09.08.2026. Meets current academic year requirements.",
            source_document_id=doc_safety.id,
            source_document_name=doc_safety.file_name,
            source_page_number="Page 1",
            extracted_snippet="Validity: This No Objection Certificate is valid for a period of ONE YEAR from the date of issue (Valid up to 09.08.2026).",
            officer_decision=OfficerDecisionEnum.PENDING_REVIEW.value,
            officer_remarks=None,
        )

        f3 = ScrutinyFinding(
            id="FIND-8492-03",
            scrutiny_run_id=run_1.id,
            application_id=app_1.id,
            regulatory_rule_id="RULE-DEMO-CADRE-03",
            rule_clause="Clause 5.2.4 - Faculty Cadre Ratio",
            rule_title="Faculty Cadre Ratio (1:2:6) and Student-Faculty Ratio (1:20)",
            ai_category=FindingCategoryEnum.POTENTIAL_DEFICIENCY.value,
            ai_confidence=0.92,
            observation_text="While overall Student-Faculty Ratio of 1:20 is met (27 teachers for 540 students), the cadre distribution (2 Professors, 4 Associate Professors, 21 Assistant Professors) fails the mandatory 1:2:6 cadre proportion. Deficit of 1 Professor and 2 Associate Professors.",
            source_document_id=doc_faculty.id,
            source_document_name=doc_faculty.file_name,
            source_page_number="Page 3",
            extracted_snippet="Current On-Roll Faculty: Professors: 2 (Shortfall of 1), Associate Professors: 4 (Shortfall of 2), Assistant Professors: 21.",
            officer_decision=OfficerDecisionEnum.PENDING_REVIEW.value,
            officer_remarks=None,
        )

        db.add_all([f1, f2, f3])
        db.commit()

        # 9. APP-2 RESUBMISSION SCENARIO (Apex School of Architecture)
        doc_arch_v1 = ApplicationDocument(
            id="DOC-3011-FIRE-01",
            application_id=app_2.id,
            document_category="FIRE_SAFETY_NOC",
            file_name="Fire_NOC_Expired_2025.pdf",
            file_path="uploads/demo/Fire_NOC_Expired_2025.pdf",
            file_size_bytes=1200340,
            file_mime_type="application/pdf",
            sha256_checksum=hashlib.sha256(b"Old_Fire_NOC_Apex").hexdigest(),
            current_version=2,
            extraction_status="EXTRACTED",
            extracted_text="Fire Safety NOC expired on 30th June 2025. Inspection renewal pending with District Fire Officer.",
            extraction_metadata={"pages": 2}
        )
        db.add(doc_arch_v1)
        db.commit()

        # Version 1 history
        db.add(DocumentVersion(
            document_id=doc_arch_v1.id,
            version_number=1,
            file_name="Fire_NOC_Expired_2025.pdf",
            file_path="uploads/demo/Fire_NOC_Expired_2025.pdf",
            sha256_checksum=hashlib.sha256(b"Old_Fire_NOC_Apex").hexdigest(),
            extracted_text="Fire Safety NOC expired on 30th June 2025. Renewal fee paid.",
            change_summary="Original submission contained expired NOC."
        ))

        # Version 2 corrected upload
        db.add(DocumentVersion(
            document_id=doc_arch_v1.id,
            version_number=2,
            file_name="Fire_NOC_Renewed_Valid_2027.pdf",
            file_path="uploads/demo/Fire_NOC_Renewed_Valid_2027.pdf",
            sha256_checksum=hashlib.sha256(b"Renewed_Fire_NOC_Apex_2027").hexdigest(),
            extracted_text="""TAMIL NADU FIRE AND RESCUE SERVICES
RENEWAL CERTIFICATE NO: R-8891/2026
Date of Issue: 25.10.2026
Certified that Apex School of Architecture premises at Neelambur, Coimbatore has been re-inspected.
VALIDITY: This Certificate of Fire Clearance is valid up to 24.10.2027.""",
            change_summary="Renewed Fire NOC valid through Oct 2027 submitted by institution."
        ))

        # Deficiency notice issued for App-2
        def_notice = DeficiencyNotice(
            id="DEF-2026-001",
            application_id=app_2.id,
            notice_reference_number="AICTE/SRO/DEF/2026/0014",
            status=DeficiencyStatusEnum.RESPONSE_RECEIVED.value,
            issued_by_user_id=scrutiny_user.id,
            issue_date=datetime.datetime.utcnow() - datetime.timedelta(days=7),
            cure_period_days=15,
            due_date=datetime.datetime.utcnow() + datetime.timedelta(days=8),
            general_remarks="Deficiency communicated regarding expired statutory Fire Clearance certificate."
        )
        db.add(def_notice)
        db.commit()

        def_item = DeficiencyItem(
            id="DEF-ITEM-001",
            notice_id=def_notice.id,
            finding_id=None,
            regulatory_rule_id="RULE-DEMO-SAFETY-02",
            requirement_summary="Mandatory valid Fire Safety NOC for educational occupancy",
            observed_deficiency="Submitted NOC expired on 30.06.2025. Current valid clearance not furnished.",
            source_document="Fire_NOC_Expired_2025.pdf",
            source_page="Page 1",
            required_correction="Furnish renewed NOC issued by Competent Fire Authority valid for 2026-27.",
            status="RESPONSE_SUBMITTED"
        )
        db.add(def_item)
        db.commit()

        def_resp = DeficiencyResponse(
            deficiency_item_id=def_item.id,
            response_text="The institution has renewed the Fire NOC from the District Fire Officer. The renewed certificate valid till 24.10.2027 is uploaded as Version 2.",
            submitted_document_id=doc_arch_v1.id,
            submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
            officer_resolution_status="UNDER_REVIEW",
            resolution_remarks="Awaiting Scrutiny Officer verification of renewed document."
        )
        db.add(def_resp)
        db.commit()

        # Audit Logs
        db.add(AuditLog(
            actor_user_id=ro_user.id,
            actor_name=ro_user.full_name,
            actor_role="REGIONAL_OFFICER",
            action="APPLICATION_ASSIGNED",
            application_id=app_1.id,
            entity_type="APPLICATION",
            entity_id=app_1.id,
            new_state={"assigned_to": scrutiny_user.id, "status": "ASSIGNED_TO_SCRUTINY"},
            remarks="Application assigned for statutory document scrutiny."
        ))
        db.add(AuditLog(
            actor_user_id=scrutiny_user.id,
            actor_name=scrutiny_user.full_name,
            actor_role="SCRUTINY_OFFICER",
            action="SCRUTINY_RUN_EXECUTED",
            application_id=app_1.id,
            entity_type="SCRUTINY_RUN",
            entity_id=run_1.id,
            new_state={"rules_evaluated": 5, "findings_generated": 3},
            remarks="Automated AI and deterministic scrutiny engine run completed."
        ))

        db.commit()
        print("Initial demonstration database seeding completed successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

