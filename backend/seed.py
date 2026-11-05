import os
import sys
import uuid
from datetime import datetime, timezone

# Ensure backend path is available
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.config import settings
from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models import (
    Role,
    User,
    UserRole,
    Institution,
    InstitutionUser,
    ApplicationType,
    ComplianceRequirement,
)


def seed():
    # Strict Production Guard: Refuse to run when ENVIRONMENT=production
    if settings.ENVIRONMENT.lower() == "production":
        print("ERROR: Seed script strictly refuses to run when ENVIRONMENT=production.")
        sys.exit(1)

    seed_password = settings.DEV_SEED_PASSWORD or os.getenv("DEV_SEED_PASSWORD")
    if not seed_password:
        print("ERROR: DEV_SEED_PASSWORD environment variable is required to run the seed script.")
        print("Usage: DEV_SEED_PASSWORD='YourTestPassword123!' python backend/seed.py")
        sys.exit(1)

    db = SessionLocal()
    try:
        print("Starting development data seeding with prefix 'TEST'...")

        # 1. Seed Roles
        role_definitions = [
            ("Institution Admin", "Authorized head or principal with full submission rights"),
            ("Institution Staff", "Faculty or administrative staff assisting with application filing"),
            ("AICTE Official", "Regional or Headquarters regulatory scrutiny officer"),
            ("Super Administrator", "System Administrator with global oversight and archival privileges"),
        ]
        roles = {}
        for role_name, role_desc in role_definitions:
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(
                    id=uuid.uuid4(),
                    name=role_name,
                    description=role_desc,
                )
                db.add(role)
                db.flush()
                print(f"Created role: {role_name}")
            roles[role_name] = role

        # 2. Seed Test Institutions
        inst_1 = db.query(Institution).filter(Institution.identifier == "TEST-PID-1-93821094").first()
        if not inst_1:
            inst_1 = Institution(
                id=uuid.uuid4(),
                identifier="TEST-PID-1-93821094",
                official_name="TEST - Apex Institute of Technology & Management",
                institution_type="Engineering & Technology",
                state="Maharashtra",
                district="Mumbai Suburban",
                address="TEST Sector 14, Regulatory Knowledge Park, Mumbai",
                official_email="test.contact@apex.edu.in",
                contact_number="+91-22-28490192",
                affiliation_or_university="Mumbai University",
                status="Active",
                verification_status="Verified",
                regional_office="Western Regional Office",
            )
            db.add(inst_1)
            db.flush()
            print(f"Created Institution 1: {inst_1.official_name}")

        inst_2 = db.query(Institution).filter(Institution.identifier == "TEST-PID-2-45891234").first()
        if not inst_2:
            inst_2 = Institution(
                id=uuid.uuid4(),
                identifier="TEST-PID-2-45891234",
                official_name="TEST - Bharat Polytechnic & Engineering Academy",
                institution_type="Engineering & Technology",
                state="Karnataka",
                district="Bengaluru Urban",
                address="TEST Plot 88, Electronic City Phase 1, Bengaluru",
                official_email="test.contact@bharat.edu.in",
                contact_number="+91-80-26789012",
                affiliation_or_university="VTU Belagavi",
                status="Active",
                verification_status="Verified",
                regional_office="South-Western Regional Office",
            )
            db.add(inst_2)
            db.flush()
            print(f"Created Institution 2: {inst_2.official_name}")

        hashed_pw = hash_password(seed_password)

        # 3. Seed Users
        user_specs = [
            ("test.admin@apex.edu.in", "TEST Prof. Ananya Sen", "Institution Admin", inst_1),
            ("test.staff@apex.edu.in", "TEST Dr. Rajesh Verma", "Institution Staff", inst_1),
            ("test.admin@bharat.edu.in", "TEST Prof. Vikram Rao", "Institution Admin", inst_2),
            ("test.official@aicte.gov.in", "TEST Dr. K. N. Rao", "AICTE Official", None),
        ]

        for email, full_name, role_name, target_inst in user_specs:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    email=email,
                    full_name=full_name,
                    password_hash=hashed_pw,
                    is_active=True,
                )
                db.add(user)
                db.flush()

                # Add UserRole
                db.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=roles[role_name].id))

                # Add InstitutionUser if applicable
                if target_inst:
                    db.add(InstitutionUser(id=uuid.uuid4(), user_id=user.id, institution_id=target_inst.id))

                print(f"Created User: {email} ({role_name})")

        # 4. Seed Application Types
        app_types = [
            (
                "TEST-EOA",
                "TEST - Extension of Approval (EoA)",
                "Annual regulatory cycle extension of approval for technical programmes.",
                ["principal_name", "total_carpet_area_sqm"],
                ["LAND_DOC", "FIRE_NOC"],
            ),
            (
                "TEST-NEW-INST",
                "TEST - Setting up New Technical Institution",
                "Statutory approval process for establishing a new college.",
                ["society_name", "proposed_intake", "land_area_acres"],
                ["LAND_DOC", "BUILDING_PLAN", "FIRE_NOC"],
            ),
        ]
        for code, name, desc, req_fields, req_docs in app_types:
            at = db.query(ApplicationType).filter(ApplicationType.code == code).first()
            if not at:
                at = ApplicationType(
                    id=uuid.uuid4(),
                    code=code,
                    name=name,
                    description=desc,
                    is_active=True,
                    required_fields_json=req_fields,
                    required_documents_json=req_docs,
                )
                db.add(at)
                print(f"Created Application Type: {code}")

        # 5. Seed Compliance Requirements
        compliances = [
            (
                "TEST-COMP-ANTI-RAGGING",
                "Statutory Anti-Ragging Committee & Mechanism",
                "Constitution of anti-ragging committee and squad per AICTE regulations.",
                True,
                "2026-27",
            ),
            (
                "TEST-COMP-GRIEVANCE",
                "Online Grievance Redressal Mechanism (GRM)",
                "Establishment of institutional portal for student and staff grievances.",
                True,
                "2026-27",
            ),
        ]
        for code, title, desc, mandatory, cycle in compliances:
            cr = db.query(ComplianceRequirement).filter(ComplianceRequirement.code == code).first()
            if not cr:
                cr = ComplianceRequirement(
                    id=uuid.uuid4(),
                    code=code,
                    title=title,
                    description=desc,
                    mandatory=mandatory,
                    applicable_academic_year=cycle,
                )
                db.add(cr)
                print(f"Created Compliance Requirement: {code}")

        db.commit()
        print("Seeding completed successfully!")
    except Exception as exc:
        db.rollback()
        print(f"Error during seeding: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()

