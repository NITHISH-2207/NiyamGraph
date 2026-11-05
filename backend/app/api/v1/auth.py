from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import User, UserRole, Role, SystemRoleEnum

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    official_id: str
    password: str

class SignupRequest(BaseModel):
    full_name: str
    email: str
    official_id: str
    password: str
    designation: str = "Scrutiny Officer"
    regional_office_id: str = "RO-SOUTH"

class LoginResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    user_id: str
    official_id: str
    full_name: str
    designation: str
    regional_office_id: str
    roles: list[str]

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    identifier = payload.official_id.strip()

    # Look up user by email or official_id
    user = db.query(User).filter(
        (User.email.ilike(identifier)) | (User.official_id.ilike(identifier))
    ).first()

    # Specific support for user requested: scrutiny@gmail.com / Scrutiny@123
    if not user:
        if "scrutiny" in identifier.lower():
            user = db.query(User).filter(User.id == "USR-SCRUTINY-01").first()
            if not user:
                # Create demo scrutiny user if absent
                user = User(
                    id="USR-SCRUTINY-01",
                    official_id="SO-2026-CH01",
                    email="scrutiny@gmail.com",
                    hashed_password="pbkdf2_demo_hash_scrutiny2026",
                    full_name="Dr. Rajeshwar Sharma",
                    designation="Senior Scrutiny Officer & Technical Evaluator",
                    regional_office_id="RO-SOUTH"
                )
                db.add(user)
                db.flush()
                db.add(UserRole(user_id=user.id, role_id="SCRUTINY_OFFICER"))
                db.commit()
        elif "regional" in identifier.lower():
            user = db.query(User).filter(User.id == "USR-RO-01").first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid statutory credentials. Please check your official email/ID and password."
        )

    roles = [ur.role_id for ur in user.roles]
    if not roles:
        roles = ["SCRUTINY_OFFICER"]

    token = f"jwt-token-niyamgraph-{user.id}"

    return LoginResponse(
        token=token,
        user_id=user.id,
        official_id=user.official_id,
        full_name=user.full_name,
        designation=user.designation or "Scrutiny Officer",
        regional_office_id=user.regional_office_id or "RO-SOUTH",
        roles=roles,
    )

@router.post("/signup", response_model=LoginResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    existing = db.query(User).filter((User.email == email) | (User.official_id == payload.official_id.strip())).first()
    if existing:
        # If exists, treat as logged in
        roles = [ur.role_id for ur in existing.roles] or ["SCRUTINY_OFFICER"]
        return LoginResponse(
            token=f"jwt-token-niyamgraph-{existing.id}",
            user_id=existing.id,
            official_id=existing.official_id,
            full_name=existing.full_name,
            designation=existing.designation or "Scrutiny Officer",
            regional_office_id=existing.regional_office_id or "RO-SOUTH",
            roles=roles,
        )

    import uuid
    new_user = User(
        id=f"USR-SO-{uuid.uuid4().hex[:6].upper()}",
        official_id=payload.official_id.strip(),
        email=email,
        hashed_password=f"hash_{payload.password}",
        full_name=payload.full_name.strip(),
        designation=payload.designation.strip(),
        regional_office_id=payload.regional_office_id.strip() or "RO-SOUTH",
    )
    db.add(new_user)
    db.flush()
    db.add(UserRole(user_id=new_user.id, role_id="SCRUTINY_OFFICER"))
    db.commit()

    return LoginResponse(
        token=f"jwt-token-niyamgraph-{new_user.id}",
        user_id=new_user.id,
        official_id=new_user.official_id,
        full_name=new_user.full_name,
        designation=new_user.designation,
        regional_office_id=new_user.regional_office_id,
        roles=["SCRUTINY_OFFICER"],
    )

@router.get("/me")
def get_current_user_profile(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == "USR-SCRUTINY-01").first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": user.id,
        "official_id": user.official_id,
        "full_name": user.full_name,
        "designation": user.designation,
        "regional_office_id": user.regional_office_id,
        "roles": [ur.role_id for ur in user.roles]
    }
