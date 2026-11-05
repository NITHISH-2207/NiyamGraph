# NiyamGraph Backend Service

Centralized FastAPI backend for NiyamGraph – Rule-driven Approvals & Compliance Intelligence (Smart India Hackathon 2026).
Shared modular backend engineered to serve both the **Institution Portal** and the upcoming **AICTE Administration Portal** without business logic duplication.

---

## 1. Architecture Overview

- **Framework**: FastAPI (Python 3.10)
- **Database**: Remote Neon PostgreSQL (pooled connection, SSL required)
- **ORM & Migrations**: SQLAlchemy 2.0 (sync Psycopg 3 dialect: `postgresql+psycopg://`) and Alembic
- **Authentication**: Stateless PyJWT tokens with Argon2id password hashing and constant-time dummy verification
- **Validation**: Pydantic v2 schemas (`extra="forbid"` on all input models)
- **Storage**: Pluggable storage interface with local development backend (`filetype` pure-Python magic byte validation)
- **Hosting Target**: Render Web Service

```
backend/
├── alembic.ini                   # Alembic configuration
├── render.yaml                   # Render deployment descriptor
├── requirements.txt              # Pinned dependencies
├── seed.py                       # Development seed script
├── app/
│   ├── main.py                   # FastAPI app entry, middleware, health endpoints
│   ├── api/
│   │   ├── deps.py               # Authentication, token verification, role enforcement
│   │   └── v1/
│   │       ├── router.py         # Consolidated API v1 router
│   │       └── endpoints/        # Domain endpoint routers
│   ├── core/
│   │   ├── config.py             # Settings (Pydantic BaseSettings)
│   │   ├── security.py           # Argon2 hashing & JWT utilities
│   │   └── exceptions.py         # Standardized domain exceptions
│   ├── database/
│   │   ├── session.py            # Engine (pool_pre_ping), SessionLocal, Base, get_db
│   ├── middleware/
│   │   ├── cors.py               # Strict CORS origins
│   │   ├── request_id.py         # X-Request-ID propagation
│   │   └── error_handler.py      # Standardized JSON error responses
│   ├── models/                   # SQLAlchemy declarative domain models (20 tables)
│   ├── schemas/                  # Pydantic v2 schemas
│   └── services/                 # Thick business logic & domain state machine
├── migrations/
│   ├── env.py                    # Alembic migration environment
│   └── versions/                 # Versioned migration revisions
└── tests/                        # Pytest suite with strict safety guards
```

---

## 2. Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure appropriate values:

```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL pooled URL with SSL | `postgresql+psycopg://...` |
| `DEV_DATABASE_URL` | Isolated development DB for migrations | `postgresql+psycopg://...` |
| `TEST_DATABASE_URL` | Isolated test DB for pytest | `postgresql+psycopg://...` |
| `ENVIRONMENT` | `development` or `production` | `development` |
| `JWT_SECRET_KEY` | Signing key (min 32 chars in production) | Secure random key |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:5173,https://niyamgraph.vercel.app` |
| `STORAGE_BACKEND` | Storage adapter (`local`, `s3`, `supabase`) | `local` |
| `MAX_UPLOAD_SIZE_MB` | Maximum file upload size in MB | `10` |
| `DEV_SEED_PASSWORD` | Password for test accounts during seed | `YourTestPassword123!` |

---

## 3. Database Migrations

> **STRICT SAFETY POLICY**: Migrations are never automatically run against the production database.

### Running Migrations on Development / Test Database:
```bash
# Verify pending revisions
python -m alembic -c backend/alembic.ini heads

# Upgrade development database schema to head
python -m alembic -c backend/alembic.ini upgrade head
```

### Production Deployment Instructions (Manual Execution):
When authorized by the Project Owner:
1. Ensure `DATABASE_URL` is set to the production Neon connection pooler.
2. Execute migration upgrade:
   ```bash
   alembic -c backend/alembic.ini upgrade head
   ```

---

## 4. Development Data Seeding

The development seed script (`backend/seed.py`) populates test institutions, users, application types, and statutory compliance requirements. All test entities are prefixed with `TEST`.

```bash
# Requires DEV_SEED_PASSWORD; strictly refuses to run when ENVIRONMENT=production
DEV_SEED_PASSWORD="YourTestPassword123!" python backend/seed.py
```

### Seeded Test Accounts:
- **Institution Admin**: `test.admin@apex.edu.in` (Institution: `TEST-PID-1-93821094`)
- **Institution Staff**: `test.staff@apex.edu.in` (Institution: `TEST-PID-1-93821094`)
- **Isolated Institution Admin**: `test.admin@bharat.edu.in` (Institution: `TEST-PID-2-45891234`)
- **AICTE Official**: `test.official@aicte.gov.in` (Headquarters Scrutiny)

---

## 5. Running Tests

Tests are executed with pytest and enforce strict safety guards:
- Tests abort if `TEST_DATABASE_URL` is identical to `DATABASE_URL` (production Neon).
- Tests abort if `TEST_DATABASE_URL` does not point to an isolated test/dev database.

```bash
# Run unit tests (security, hashing, storage, schemas)
pytest backend/tests/test_unit_security_storage.py -v

# Run full integration suite (requires TEST_DATABASE_URL)
TEST_DATABASE_URL="postgresql+psycopg://postgres:password@localhost:5432/niyamgraph_test" pytest backend/tests/ -v
```

---

## 6. Render Deployment Guide

1. Create a **Web Service** on [Render](https://render.com).
2. Connect your Git repository.
3. Configure the service settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables in Render Dashboard:
   - `DATABASE_URL`: Your Neon pooled connection string with `sslmode=require`
   - `JWT_SECRET_KEY`: High-entropy 64-character secret
   - `ALLOWED_ORIGINS`: `https://niyamgraph.vercel.app`
   - `ENVIRONMENT`: `production`
   - `DOCS_ENABLED`: `false`

