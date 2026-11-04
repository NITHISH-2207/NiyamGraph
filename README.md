# NiyamGraph

**Rule-driven Approvals & Compliance Intelligence**  
*Smart India Hackathon 2026*

---

## 📌 Project Overview
**NiyamGraph** is an intelligent, rule-driven governance and compliance platform designed to streamline, validate, and accelerate the regulatory approval workflows for educational institutions under the purview of AICTE (All India Council for Technical Education). By leveraging automated rule evaluation, transparent verification stages, and audit trails, NiyamGraph eliminates procedural bottlenecks and ensures rigorous compliance adherence.

---

## 🛠 Technology Stack

### Frontend
- **Framework & Tooling:** React.js, Vite
- **Language:** JavaScript
- **Styling:** Tailwind CSS *(to be configured)*

### Backend
- **Framework:** FastAPI
- **Language:** Python

### Database
- **Platform:** Supabase PostgreSQL

---

## 🏗 System Architecture

NiyamGraph is architected around a dual-portal interface backed by a unified processing engine:

1. **Institution Portal (`frontend/institution-portal`):**
   - Independent React application tailored for applicant institutions.
   - Handles institutional onboarding, document submissions, deficiency rectifications, and real-time tracking of application lifecycles.

2. **AICTE Portal (`frontend/aicte-portal`):**
   - Independent React application designed for regulatory officials, scrutiny experts, EVC (Expert Visit Committee) inspectors, and committee chairs.
   - Manages scrutiny evaluations, virtual/physical inspection logs, committee reviews, escalation handling, and approval decisions.

3. **Shared FastAPI Backend (`backend/app`):**
   - A single, centralized, modular FastAPI service serving both portals through versioned, role-protected RESTful APIs.
   - Encapsulates business logic, rule graph execution, verification pipelines, and notification dispatches across isolated domain modules.

4. **Shared Database (`Supabase PostgreSQL`):**
   - A single centralized PostgreSQL database instance hosting relational schemas, row-level security (RLS), and audit logs for both applications.

```
┌─────────────────────────────────┐       ┌───────────────────────────────┐
│       Institution Portal        │       │         AICTE Portal          │
│   (React / Vite Application)    │       │  (React / Vite Application)   │
└────────────────┬────────────────┘       └───────────────┬───────────────┘
                 │                                        │
                 └───────────────────┬────────────────────┘
                                     │ (REST APIs)
                                     ▼
                      ┌─────────────────────────────┐
                      │    Shared FastAPI Backend   │
                      │        (Python/app)         │
                      └──────────────┬──────────────┘
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │  Shared Supabase Database   │
                      │        (PostgreSQL)         │
                      └─────────────────────────────┘
```

---

## 📂 Repository Structure

```
NiyamGraph/
├── frontend/
│   ├── institution-portal/
│   │   ├── public/
│   │   └── src/
│   │       ├── assets/
│   │       ├── components/
│   │       ├── layouts/
│   │       ├── pages/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── hooks/
│   │       ├── context/
│   │       ├── utils/
│   │       └── styles/
│   └── aicte-portal/
│       ├── public/
│       └── src/
│           ├── assets/
│           ├── components/
│           ├── layouts/
│           ├── pages/
│           ├── routes/
│           ├── services/
│           ├── hooks/
│           ├── context/
│           ├── utils/
│           └── styles/
├── backend/
│   └── app/
│       ├── api/
│       ├── core/
│       ├── database/
│       ├── models/
│       ├── schemas/
│       ├── services/
│       ├── middleware/
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── institutions/
│       │   ├── applications/
│       │   ├── workflows/
│       │   ├── scrutiny/
│       │   ├── evc/
│       │   ├── committees/
│       │   ├── decisions/
│       │   ├── compliance/
│       │   ├── documents/
│       │   ├── notifications/
│       │   ├── escalation/
│       │   ├── analytics/
│       │   └── audit/
│       ├── utils/
│       └── main.py
├── .gitignore
└── README.md
```

---

## 👥 Team Workflow

To ensure seamless coordination across our five-member engineering team:

- **Branching Strategy:** Direct commits to `main` are restricted. All development must occur on dedicated feature/bugfix branches named by module and purpose (e.g., `feat/auth-service`, `feat/institution-onboarding`, `fix/scrutiny-rules`).
- **Pull Requests (PRs):** Contributors submit pull requests against `main`. Each PR requires peer review, clean lint/build status, and clear descriptions of changes.
- **Integration & Governance:** Final reviews, merge conflicts resolution, and integration into `main` are handled exclusively by the repository owner to maintain architectural consistency and release stability.

