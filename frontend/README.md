# NiyamGraph – Public Entry Experience (`frontend/public-site`)

This is the public-facing entry application for **NiyamGraph – Rule-driven Approvals & Compliance Intelligence (Smart India Hackathon 2026)**.

It provides a unified, highly polished statutory gateway consisting of:
1. **Session-aware Splash Screen** (restrained SVG emblem, gold accent, session-gated)
2. **Public Landing Page** (Hero, About, Dual-Portal Workspace Selection, Platform Capabilities, How It Works, 5-column Footer)
3. **Institution Portal Login** (`/institution/login`) with SVG workflow visual, PID validation, and representative email binding
4. **AICTE Administration Login** (`/admin/login`) with official User ID validation, TOTP MFA simulation screen, and scrutiny metrics visual
5. **Credential Recovery** (`/forgot-password`)
6. **Statutory Governance Pages** (Draft Terms of Use `/terms`, Privacy Policy & Data Handling `/privacy`, Accessibility Statement `/accessibility`, Helpdesk & Guidance `/support`)
7. **Institutional 404 Experience** (`*`)

---

## 🚀 Running Locally

```bash
cd frontend/public-site

# Install dependencies (Node v20+ recommended)
npm install

# Start Vite local development server (runs on http://localhost:5173)
npm run dev

# Run TypeScript type safety validation
npm run typecheck

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🎨 Design Tokens & Theme Configuration

All styling references central CSS variables defined in `src/styles/tokens.css` and mapped into Tailwind via `tailwind.config.js`:

- **Primary Navy:** `#183B5D` (`var(--color-brand-navy)`)
- **Institutional Blue:** `#245B82` (`var(--color-brand-blue)`)
- **Muted Gold:** `#C5A45E` (`var(--color-brand-gold)`)
- **Main Background:** `#F4F6F9` (`var(--color-brand-bg)`)
- **White Surface:** `#FFFFFF` (`var(--color-brand-surface)`)
- **Secondary Text:** `#718096` (`var(--color-brand-secondary)`)
- **Deep Navy (Auth/Splash panels):** `#102A45` (`var(--color-brand-navy-dark)`)
- **Success:** `#16A34A`
- **Warning / Deficiency:** `#D97706`
- **Error / Statutory:** `#DC2626`

---

## 🔄 SPA Fallback for Deployment

Since React Router handles client-side routing, direct visits or browser refreshes on routes like `/institution/login` or `/admin/login` require web server URL rewrites to `/index.html`:

- **Vite Dev & Preview:** Configured automatically.
- **Nginx:**
  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```
- **Netlify (`public/_redirects`):**
  ```
  /*    /index.html   200
  ```
- **Vercel (`vercel.json`):**
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

## 🔌 Future Backend Integration Points

The codebase is prepared for future FastAPI and Supabase integration:
- `src/services/authService.ts`: Exports a typed `AuthService` interface with `PrototypeAuthAdapter`. To connect live auth, replace with a `SupabaseAuthAdapter` or `FastApiAuthAdapter` consuming `import.meta.env.VITE_API_BASE_URL`.
- `src/config/identifierConfig.ts`: Centralizes Institute ID validation patterns and label rules.
- `src/config/authConfig.ts`: Contains whitelist validation for portal redirect targets to prevent open-redirect vulnerabilities.

