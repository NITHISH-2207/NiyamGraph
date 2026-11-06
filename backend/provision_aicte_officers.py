"""
NiyamGraph AICTE Administration Officer Provisioning Script
===========================================================
Idempotent script to provision the four distinct AICTE administration roles:
- AICTE Scrutiny Officer
- AICTE EVC Officer
- AICTE Regional Officer
- AICTE Complaints Officer

And configure the four official demonstration accounts:
1. Scrutiny:   test.official@aicte.gov.in   -> AICTE Scrutiny Officer
2. EVC:        test.evc@aicte.gov.in        -> AICTE EVC Officer
3. Regional:   test.regional@aicte.gov.in   -> AICTE Regional Officer
4. Complaints: test.complaints@aicte.gov.in -> AICTE Complaints Officer

Common Demonstration Password:
Sourced from DEV_SEED_PASSWORD environment variable (default: YourTestPassword123!)

SAFETY:
- DRY-RUN by default. Pass --apply to execute modifications.
- Preserves existing password hashes where accounts already exist.
- Does NOT touch or modify Institution Admin or Staff accounts.
"""

import os
import sys
import uuid
import argparse
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse
from datetime import datetime, timezone

# Ensure backend root is on path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from sqlalchemy import func
from app.database.session import SessionLocal, Base, engine
from app.models.user import User, Role, UserRole
from app.core.security import hash_password
from app.core.config import settings

OFFICER_ROLES = [
    {
        "name": "AICTE Scrutiny Officer",
        "description": "Scrutiny Officer with institutional application evaluation and deficiency notice authority",
    },
    {
        "name": "AICTE EVC Officer",
        "description": "Expert Visit Committee Officer with inspection panel coordination and report verification authority",
    },
    {
        "name": "AICTE Regional Officer",
        "description": "Regional Officer with jurisdiction application management and escalation oversight",
    },
    {
        "name": "AICTE Complaints Officer",
        "description": "Grievance and Compliance Officer with institutional complaint investigation and resolution authority",
    },
]

OFFICER_ACCOUNTS = [
    {
        "email": "test.official@aicte.gov.in",
        "full_name": "Dr. K. N. Rao",
        "role_name": "AICTE Scrutiny Officer",
        "legacy_emails": ["official@niyamgraph.example", "test.official@aicte.gov.in"],
        "workspace_route": "/scrutiny/dashboard",
    },
    {
        "email": "test.evc@aicte.gov.in",
        "full_name": "Prof. M. S. Sundaram",
        "role_name": "AICTE EVC Officer",
        "legacy_emails": [],
        "workspace_route": "/aicte/evc/dashboard",
    },
    {
        "email": "test.regional@aicte.gov.in",
        "full_name": "Dr. S. K. Verma",
        "role_name": "AICTE Regional Officer",
        "legacy_emails": [],
        "workspace_route": "/aicte/regional/dashboard",
    },
    {
        "email": "test.complaints@aicte.gov.in",
        "full_name": "Smt. Radha Iyer",
        "role_name": "AICTE Complaints Officer",
        "legacy_emails": [],
        "workspace_route": "/aicte/complaints/dashboard",
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


def provision(apply_changes: bool = False):
    seed_password = (
        os.getenv("DEV_SEED_PASSWORD")
        or settings.DEV_SEED_PASSWORD
        or "YourTestPassword123!"
    )

    print("================================================================================")
    print(" NIYAMGRAPH AICTE ADMINISTRATION OFFICER PROVISIONING")
    print(f" Mode: {'[APPLY CHANGES - DATABASE WRITE]' if apply_changes else '[DRY RUN - READ ONLY]'}")
    print(f" Target Database: {mask_url(settings.DATABASE_URL)}")
    print("================================================================================\n")

    # Ensure tables exist on local SQLite if running in local sandbox fallback mode
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Provision Distinct Roles
        print("1. Verifying AICTE Officer Roles...")
        roles_cache: Dict[str, Role] = {}
        for r_cfg in OFFICER_ROLES:
            role = db.query(Role).filter(Role.name == r_cfg["name"]).first()
            if not role:
                print(f"  [CREATE ROLE] '{r_cfg['name']}' - {r_cfg['description']}")
                if apply_changes:
                    role = Role(
                        id=uuid.uuid4(),
                        name=r_cfg["name"],
                        description=r_cfg["description"],
                    )
                    db.add(role)
                    db.flush()
            else:
                print(f"  [ROLE EXISTS] '{role.name}' (PK={role.id})")
            roles_cache[r_cfg["name"]] = role

        # 2. Provision / Update Officer Accounts
        print("\n2. Processing Officer Demonstration Accounts...")
        for u_cfg in OFFICER_ACCOUNTS:
            target_email = u_cfg["email"].strip().lower()
            target_role_name = u_cfg["role_name"]

            # Lookup by target email or legacy emails
            user = (
                db.query(User)
                .filter(
                    (func.lower(User.email) == target_email)
                    | (User.email.in_(u_cfg["legacy_emails"]))
                )
                .first()
            )

            if user:
                print(f"  [ACCOUNT EXISTS] User '{user.email}' (PK={user.id}):")
                changes = []

                # Ensure canonical email
                if user.email != target_email:
                    changes.append(f"email: '{user.email}' -> '{target_email}'")
                    if apply_changes:
                        user.email = target_email

                # Ensure canonical full name
                if user.full_name != u_cfg["full_name"]:
                    changes.append(f"full_name: '{user.full_name}' -> '{u_cfg['full_name']}'")
                    if apply_changes:
                        user.full_name = u_cfg["full_name"]

                # Ensure account is active & unlocked
                if not user.is_active:
                    changes.append("is_active: False -> True")
                    if apply_changes:
                        user.is_active = True

                if user.failed_login_attempts > 0 or user.locked_until is not None:
                    changes.append("lockout: cleared failed attempts & unlocked")
                    if apply_changes:
                        user.failed_login_attempts = 0
                        user.locked_until = None

                # Check role assignment
                existing_roles = (
                    db.query(Role.name)
                    .join(UserRole, UserRole.role_id == Role.id)
                    .filter(UserRole.user_id == user.id)
                    .all()
                )
                existing_role_names = [r[0] for r in existing_roles]

                if target_role_name not in existing_role_names:
                    changes.append(f"role assignment: added '{target_role_name}'")
                    if apply_changes:
                        target_role = roles_cache.get(target_role_name) or db.query(Role).filter(Role.name == target_role_name).first()
                        db.add(UserRole(id=uuid.uuid4(), user_id=user.id, role_id=target_role.id))

                if changes:
                    for ch in changes:
                        print(f"    • {ch}")
                else:
                    print(f"    • Already configured with role '{target_role_name}' (Password hash preserved).")
            else:
                print(f"  [CREATE ACCOUNT] User: '{target_email}' ({u_cfg['full_name']})")
                print(f"    • Role: {target_role_name}")
                print(f"    • Workspace Route: {u_cfg['workspace_route']}")
                print(f"    • Initial Password: [Argon2 hash of DEV_SEED_PASSWORD]")

                if apply_changes:
                    new_user = User(
                        id=uuid.uuid4(),
                        email=target_email,
                        full_name=u_cfg["full_name"],
                        password_hash=hash_password(seed_password),
                        is_active=True,
                    )
                    db.add(new_user)
                    db.flush()

                    target_role = roles_cache.get(target_role_name) or db.query(Role).filter(Role.name == target_role_name).first()
                    db.add(UserRole(id=uuid.uuid4(), user_id=new_user.id, role_id=target_role.id))
                    db.flush()

        print("\n================================================================================")
        if apply_changes:
            db.commit()
            print(" [SUCCESS] AICTE officer roles and demonstration accounts successfully committed.")
        else:
            db.rollback()
            print(" [DRY RUN COMPLETED] Zero database rows modified.")
            print(" To apply changes to the database, run:")
            print("   python backend/provision_aicte_officers.py --apply")
        print("================================================================================")

    except Exception as exc:
        db.rollback()
        print(f"\n[ERROR] Provisioning failed, transaction rolled back: {exc}")
        sys.exit(1)
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="NiyamGraph AICTE Officer Provisioning")
    parser.add_argument("--apply", action="store_true", help="Execute database writes in atomic transaction")
    args = parser.parse_args()
    provision(apply_changes=args.apply)


if __name__ == "__main__":
    main()
