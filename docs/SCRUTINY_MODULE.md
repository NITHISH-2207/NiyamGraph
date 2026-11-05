# NiyamGraph — Scrutiny Officer Portal Module

## 1. Overview
The **Scrutiny Officer Portal** is the first operational governance module implemented within NiyamGraph. It allows authorized AICTE regulatory officials and scrutiny experts to examine institutional applications, verify documents, evaluate compliance against the Approval Process Handbook (APH 2026-27), issue deficiency notices, compare resubmitted versions, and compile official scrutiny reports.

## 2. Core Modules
1. **Scrutiny Dashboard (`/scrutiny/dashboard`):** Real-time operational metrics, pending actions, and live audit event log.
2. **My Scrutiny Queue (`/scrutiny/queue`):** Comprehensive queue with search, scheme filters, status filters, and transparent priority sorting.
3. **Application Workspace (`/scrutiny/applications/:id`):**
   - **Profile:** Legal entity info, jurisdiction, permanent ID, and deadlines.
   - **Document Intelligence:** File SHA-256 integrity, page extraction markers `[Page X]`, multi-format parsing.
   - **Regulatory Criteria:** Configurable criteria matrix marked as demonstration data.
   - **Scrutiny Engine:** AI observations (Gemini/Groq/OpenRouter) separated from human officer decisions.
   - **Deficiency Management:** 15-day statutory rectification window drafting and issuance.
   - **Resubmission Diff:** Automated textual diff highlighting corrections across document versions.
   - **Statutory Report & Handover:** Exportable PDF summary and dispatch to EVC Inspection or Competent Authority.

## 3. Technology Alignment
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Mobile Responsive.
- **Backend:** FastAPI, SQLAlchemy 2.0, Pydantic 2, PyMuPDF, python-docx.
- **Database:** Neon PostgreSQL with fallback to SQLite for zero-friction local development.

