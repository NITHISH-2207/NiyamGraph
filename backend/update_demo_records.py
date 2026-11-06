"""
NiyamGraph Safe & Idempotent Database Update Script
===================================================
Updates legacy 'TEST-' demonstration records to clean, professional institutional records:
- Apex Institute of Technology & Management (TEST-PID-1-93821094)
- Bharat Polytechnic & Engineering Academy (NG-BHARAT-0002)
- Associated representative emails & display names

SAFETY GUARANTEES:
1. DRY-RUN BY DEFAULT: Does NOT modify any records unless '--apply' is explicitly supplied.
2. PRIMARY KEY PRESERVATION: Identifies records by stable UUIDs or legacy identifiers and updates in-place.
3. FOREIGN KEY PRESERVATION: All associated applications, deficiencies, and documents remain linked.
4. PASSWORD PRESERVATION: Retains existing password hashes; does not overwrite unless requested.
5. ZERO DATA LOSS: Idempotent. Does not touch or delete any unrelated records.
"""

import os
import sys
import argparse
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse
from datetime import datetime, timezone

# Ensure backend root is on path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy import func
from app.database.session import SessionLocal, engine
from app.models.institution import Institution
from app.models.user import User, InstitutionUser
from app.core.config import settings

# -----------------------------------------------------------------------------
# Target Specifications
# -----------------------------------------------------------------------------
TARGET_INSTITUTIONS = [
    {
        "target_identifier": "TEST-PID-1-93821094",
        "legacy_identifiers": ["TEST-PID-1-93821094", "1-93821094", "TEST-PID-1-93821094"],
        "target_name": "Apex Institute of Technology & Management",
        "legacy_names": ["TEST - Apex Institute of Technology & Management"],
        "target_email": "contact@apex.edu.in",
        "legacy_emails": ["test.contact@apex.edu.in"],
        "institution_type": "Engineering & Technology",
        "state": "Maharashtra",
        "district": "Mumbai Suburban",
        "address": "Sector 14, Knowledge & Innovation Park, Mumbai",
        "contact_number": "+91-22-28490192",
        "regional_office": "Western Regional Office",
    },
    {
        "target_identifier": "NG-BHARAT-0002",
        "legacy_identifiers": ["TEST-PID-2-45891234", "2-45891234", "NG-BHARAT-0002"],
        "target_name": "Bharat Polytechnic & Engineering Academy",
        "legacy_names": ["TEST - Bharat Polytechnic & Engineering Academy"],
        "target_email": "contact@bharat.edu.in",
        "legacy_emails": ["test.contact@bharat.edu.in"],
        "institution_type": "Engineering & Technology",
        "state": "Karnataka",
        "district": "Bengaluru Urban",
        "address": "Plot 88, Electronic City Phase 1, Bengaluru",
        "contact_number": "+91-80-26789012",
        "regional_office": "South-Western Regional Office",
    },
]

TARGET_USERS = [
    {
        "target_email": "test.admin@apex.edu.in",
        "legacy_emails": ["test.test.admin@apex.edu.in", "test.admin@apex.edu.in"],
        "target_full_name": "Prof. Ananya Sen",
        "legacy_full_names": ["TEST Prof. Ananya Sen", "Prof. Ananya Sen"],
        "institution_identifier": "TEST-PID-1-93821094",
    },
    {
        "target_email": "staff@apex.edu.in",
        "legacy_emails": ["test.staff@apex.edu.in", "staff@apex.edu.in"],
        "target_full_name": "Dr. Rajesh Verma",
        "legacy_full_names": ["TEST Dr. Rajesh Verma", "Dr. Rajesh Verma"],
        "institution_identifier": "TEST-PID-1-93821094",
    },
    {
        "target_email": "admin@bharat.edu.in",
        "legacy_emails": ["test.admin@bharat.edu.in", "admin@bharat.edu.in"],
        "target_full_name": "Prof. Vikram Rao",
        "legacy_full_names": ["TEST Prof. Vikram Rao", "Prof. Vikram Rao"],
        "institution_identifier": "NG-BHARAT-0002",
    },
    {
        "target_email": "official@niyamgraph.example",
        "legacy_emails": ["test.official@aicte.gov.in", "official@niyamgraph.example"],
        "target_full_name": "Dr. K. N. Rao",
        "legacy_full_names": ["TEST Dr. K. N. Rao", "Dr. K. N. Rao"],
        "institution_identifier": None,
    },
]


def mask_url(url: str) -> str:
    """Mask credentials and host details for safe logging."""
    try:
        parsed = urlparse(url)
        host = parsed.hostname or "unknown"
        if len(host) > 8:
            masked_host = f"{host[:4]}...{host[-6:]}"
        else:
            masked_host = host
        return f"{parsed.scheme}://***:***@{masked_host}{parsed.path}"
    except Exception:
        return "postgresql://***:***@masked"


def run_update(apply_changes: bool = False, reset_lockouts: bool = True):
    print("================================================================================")
    print(" NIYAMGRAPH IDEMPOTENT DATABASE CLEANUP & DEMO UPDATE")
    print(f" Mode: {'[APPLY CHANGES - LIVE DATABASE WRITE]' if apply_changes else '[DRY RUN - READ ONLY]'}")
    print(f" Target Database: {mask_url(settings.DATABASE_URL)}")
    print("================================================================================\n")

    db = SessionLocal()
    try:
        # ---------------------------------------------------------------------
        # 1. Update Institutions
        # ---------------------------------------------------------------------
        print("1. Inspecting Institution Records...")
        inst_updated_count = 0
        for inst_spec in TARGET_INSTITUTIONS:
            target_id = inst_spec["target_identifier"]
            # Search by target identifier or legacy identifiers
            inst = (
                db.query(Institution)
                .filter(
                    (Institution.identifier == target_id)
                    | (Institution.identifier.in_(inst_spec["legacy_identifiers"]))
                    | (Institution.official_name.in_(inst_spec["legacy_names"]))
                )
                .first()
            )

            if not inst:
                print(f"  [NOT FOUND] Institution matching '{target_id}' or legacy identifiers.")
                continue

            diffs = []
            if inst.identifier != target_id:
                diffs.append(f"identifier: '{inst.identifier}' -> '{target_id}'")
            if inst.official_name != inst_spec["target_name"]:
                diffs.append(f"official_name: '{inst.official_name}' -> '{inst_spec['target_name']}'")
            if inst.official_email != inst_spec["target_email"]:
                diffs.append(f"official_email: '{inst.official_email}' -> '{inst_spec['target_email']}'")
            if inst.verification_status != "Self-Declared (Demo)":
                diffs.append(f"verification_status: '{inst.verification_status}' -> 'Self-Declared (Demo)'")

            if diffs:
                inst_updated_count += 1
                print(f"  [MODIFICATION REQUIRED] Institution (PK={inst.id}):")
                for d in diffs:
                    print(f"    • {d}")

                if apply_changes:
                    inst.identifier = target_id
                    inst.official_name = inst_spec["target_name"]
                    inst.official_email = inst_spec["target_email"]
                    inst.verification_status = "Self-Declared (Demo)"
                    inst.updated_at = datetime.now(timezone.utc)
            else:
                print(f"  [OK - ALREADY CLEAN] Institution '{inst.official_name}' (ID: {inst.identifier})")

        # ---------------------------------------------------------------------
        # 2. Update Users
        # ---------------------------------------------------------------------
        print("\n2. Inspecting User Accounts...")
        user_updated_count = 0
        for user_spec in TARGET_USERS:
            target_email = user_spec["target_email"]
            # Search by target email or legacy emails
            user = (
                db.query(User)
                .filter(
                    (User.email == target_email)
                    | (User.email.in_(user_spec["legacy_emails"]))
                )
                .first()
            )

            if not user:
                print(f"  [NOT FOUND] User matching '{target_email}' or legacy emails.")
                continue

            diffs = []
            if user.email != target_email:
                diffs.append(f"email: '{user.email}' -> '{target_email}'")
            if user.full_name != user_spec["target_full_name"]:
                diffs.append(f"full_name: '{user.full_name}' -> '{user_spec['target_full_name']}'")

            if reset_lockouts and (user.failed_login_attempts > 0 or user.locked_until is not None):
                diffs.append(f"lockout: reset {user.failed_login_attempts} failed attempts, unlocked")

            if diffs:
                user_updated_count += 1
                print(f"  [MODIFICATION REQUIRED] User (PK={user.id}):")
                for d in diffs:
                    print(f"    • {d}")

                if apply_changes:
                    user.email = target_email
                    user.full_name = user_spec["target_full_name"]
                    if reset_lockouts:
                        user.failed_login_attempts = 0
                        user.locked_until = None
                    user.updated_at = datetime.now(timezone.utc)
            else:
                print(f"  [OK - ALREADY CLEAN] User '{user.full_name}' ({user.email})")

        # ---------------------------------------------------------------------
        # Summary & Commit/Rollback
        # ---------------------------------------------------------------------
        print("\n================================================================================")
        if apply_changes:
            db.commit()
            print(" [SUCCESS] Database updates committed successfully to Neon PostgreSQL.")
            print(f" Institutions updated: {inst_updated_count}")
            print(f" Users updated:        {user_updated_count}")
        else:
            db.rollback()
            print(" [DRY RUN COMPLETED] No database changes were made.")
            print(f" Institutions pending update: {inst_updated_count}")
            print(f" Users pending update:        {user_updated_count}")
            print("\n To apply these changes, run:")
            print("   python backend/update_demo_records.py --apply")
        print("================================================================================")

    except Exception as exc:
        db.rollback()
        print(f"\n[ERROR] Update failed, transaction rolled back: {exc}")
        sys.exit(1)
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(
        description="NiyamGraph Safe Database Cleanup & Demo Update Script"
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Execute database modifications inside an atomic transaction (default is dry-run)",
    )
    parser.add_argument(
        "--no-reset-lockouts",
        action="store_true",
        help="Do not reset failed login attempts or unlock accounts during update",
    )
    args = parser.parse_args()

    run_update(apply_changes=args.apply, reset_lockouts=not args.no_reset_lockouts)


if __name__ == "__main__":
    main()

