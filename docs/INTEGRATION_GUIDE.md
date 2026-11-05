# NiyamGraph — 4-Developer Team Integration Guide

## 1. Team Allocation
- **Developer 1 (This Module):** Scrutiny Officer Portal and Regional Officer Foundation.
- **Developer 2:** EVC (Expert Visit Committee) Portal.
- **Developer 3:** Landing page, public pages and login.
- **Developer 4:** Institution Portal.

## 2. Shared Neon PostgreSQL Database
- Every team member must use the centralized Neon PostgreSQL connection string configured in `.env`.
- Database URL template: `DATABASE_URL=postgresql+psycopg://username:password@host/niyamgraph?sslmode=require`.
- Do NOT drop, truncate, or reset existing tables.
- All portals reference the exact same `applications.id` (e.g. `APP-2026-ENG-8492`) and `institutions.id`.
- Foreign keys and stage transitions are synchronized across portals.

## 3. Launching the Services

### Backend (FastAPI):
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation is live at: `http://127.0.0.1:8000/docs`

### Frontend (React + Vite):
```bash
cd frontend
npm run dev
```
Accessible at: `http://localhost:5173/`

### Direct Access Routes:
- Public Landing Site: `http://localhost:5173/`
- AICTE Official Sign In: `http://localhost:5173/auth/admin/login`
- Scrutiny Dashboard: `http://localhost:5173/scrutiny/dashboard`
- Scrutiny Queue: `http://localhost:5173/scrutiny/queue`
- Scrutiny Workspace: `http://localhost:5173/scrutiny/applications/APP-2026-ENG-8492`
- Regulatory Criteria: `http://localhost:5173/scrutiny/rules`
- Deficiency Registry: `http://localhost:5173/scrutiny/deficiencies`

