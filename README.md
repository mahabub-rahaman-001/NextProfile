# NextProfile

> **Your profile, resume, portfolio, and next opportunity in one place.**

NextProfile is a full-stack career profile builder for creating a structured professional profile once and publishing it as a resume, CV, portfolio website, public profile, PDF, and QR-enabled business card. It includes onboarding, profile sections, multiple resume and portfolio themes, sharing controls, analytics, version history, job matching, and review tools.

One profile in → resume, CV, portfolio website, public career profile, PDF and QR out.

This repository is the working MVP described in [`docs/`](docs/). It runs, it has real data, and the whole flow — register → onboarding → profile → template → preview → publish → PDF — works end to end.

---

## Run it

```bash
# 1. Install
pnpm install

# 2. Database (any Postgres 14+)
cp .env.example .env          # then fill DATABASE_URL and AUTH_SECRET
pnpm prisma migrate dev
pnpm db:seed                  # five fixture profiles, password: demo1234

# 3. Go
pnpm dev                      # http://localhost:3000
```

**Minimum environment:** `DATABASE_URL`, `DIRECT_DATABASE_URL`, `AUTH_SECRET` (`openssl rand -base64 32`), `PRINT_TOKEN_SECRET`. Everything else has a working default — the app runs without an AI key, without object storage and without a render service.

### The fixture accounts

| Email | Who | Shows off |
|---|---|---|
| `student.cse@nextprofile.test` | CSE student | Projects, GitHub, thin experience |
| `student.business@nextprofile.test` | Business student | Clubs, competitions, no technical fields |
| `professional@nextprofile.test` | Marketing manager | Long experience, achievement bullets |
| `researcher@nextprofile.test` | Postdoc | Publications, research, conferences, 2-page CV |
| `freelancer@nextprofile.test` | Product designer | Services, case studies, testimonials |

Password for all five: `demo1234`. They exist so every template and theme is tested against five genuinely different shapes of career.

---

## What works today

| Area | State |
|---|---|
| Auth | Register, log in, log out, signed-cookie sessions, protected routes, `Profile` bootstrapped on signup |
| Onboarding | Three questions + basics, completable on a 390px screen |
| Profile builder | 12 record sections, one CRUD implementation, reorder, soft delete + undo, autosave |
| Adaptive modules | Profile type drives which sections appear; a section with data is never hidden |
| Completeness | Weighted per profile type, names the two highest-value missing items |
| Resume & CV | Section resolver, 3 templates (Minimal is ATS-safe), order/visibility/density/accent/paper, live preview |
| PDF | Real Chromium render of the same components, correct A4/Letter margins on every page |
| Portfolio | **10 structurally different themes** (minimal, professional, modern, editorial, terminal, cards, sidebar, timeline, gallery, classic), section order and visibility, live preview |
| Publishing | Username claim with reserved words, private by default, per-field contact visibility |
| Public profile | `/u/[username]`, server-rendered, SEO metadata, sitemap, robots |
| Analytics | Event collection with a daily-rotating visitor hash, no raw IPs |
| QR | PNG and SVG from the public URL |
| AI | Full envelope, prompt contract, quota and review-before-save UI — inert until `LLM_API_KEY` is set |
| **Job matching** | Paste a job ad → overlap score, matched terms with attribution, missing terms, suggestions. Deterministic, no model call, 15 unit tests |
| **Profile review** | Rule-based findings an HR reader would notice — bullets without figures, duty-style openers, undated jobs, unreachable contact. 11 unit tests |
| **Applications tracker** | Company, role, status pipeline, match score, and the frozen resume that was actually sent |
| **Version history** | Snapshots that freeze layout *and* content, so a sent PDF stays reproducible; restore brings back the layout only |
| **Private share links** | Tokenised, expiring, revocable, view-counted, never indexed |
| **Embed card** | `/embed/[username]` iframe card with a copyable snippet |
| **Business card PDF** | 85 × 55 mm with a QR to the public profile |
| **Data export** | One JSON file with everything held about the account |
| **Peer comparison** | Completeness percentile within the same profile type, aggregate only |
| **Trust** | Last-updated stamp and an abuse report form on every public profile |
| **Password reset** | Single-use hour-long token, identical response for unknown addresses, destroys every other session on use. Change-password in Settings |
| **Admin area** | `/admin` — platform stats, user search, suspend/restore, unpublish, role management, abuse report queue. 404s for non-admins |
| **Rate limiting** | Sliding window on sign-in, registration, reset, job analysis, analytics collection and abuse reports |

### Not built yet

Email sending (so password reset cannot deliver — see `AUTH_DEV_SHOW_RESET_LINK`), image uploads, Google sign-in, ATS checker, skill gap analysis, payments, custom domains. See [`docs/15-BUG-AUDIT-RELEASE-3.md`](docs/15-BUG-AUDIT-RELEASE-3.md) for the current gap list.

---

## Architecture in one screen

```
app/
├── (marketing)/        landing
├── (auth)/             login · register
├── onboarding/         three questions + basics
├── dashboard/          overview · profile/* · resume/* · portfolio · ai · qr · analytics · settings
├── u/[username]/       PUBLIC profile — cached, revalidated on publish
├── print/[docId]/      print-only HTML, HMAC-token gated
├── api/                qr · analytics/collect · documents/[id]/pdf
└── actions/            server actions: auth · profile · sections · documents · ai

components/
├── ui/                 button · input · card primitives
├── forms/              FieldWrapper
├── profile/            SectionEditor (one list, twelve sections) + field configs
├── resume/             engine/ (resolve, parts) + templates/ (minimal, professional, modern)
└── portfolio/          engine/ + themes/ (minimal, professional, modern) + blocks

lib/
├── modules/            profile type → module visibility (the adaptive switch)
├── completeness/       weighted scorer + recompute
├── validation/         every Zod schema, shared by forms and actions
├── sections/           the CRUD registry
├── ai/                 envelope, prompt contract, quota
├── pdf/                render client + HMAC print token
├── analytics/          visitor hashing
└── auth/               sessions, password hashing — the only place a vendor would go
```

**The rule that governs everything:** user data never knows which template or theme will render it. Presentation lives only in `Document.config` and `Portfolio.config`. A new template is a new file, not a migration.

---

## Commands

```bash
pnpm dev            # development server
pnpm build          # production build
pnpm test           # 65 unit tests: modules, completeness, sortOrder, validation, matching, review, themes
pnpm typecheck      # tsc --noEmit
pnpm db:seed        # reset the five fixture profiles
pnpm db:studio      # inspect the database

# End-to-end (needs a running server and a Chromium path)
CHROMIUM_PATH=/path/to/chrome node tests/e2e/signup-flow.mjs   # 8 checks
CHROMIUM_PATH=/path/to/chrome node tests/e2e/release2.mjs      # 17 checks
CHROMIUM_PATH=/path/to/chrome node tests/e2e/admin-and-reset.mjs   # 16 checks

# Admin
pnpm admin:create you@example.com    # promote an existing account
```

---

## Two decisions worth knowing

**Auth is hand-rolled, behind `lib/auth`.** Register, log in, bcrypt hashes, HMAC-signed session cookies in the database. No feature file imports it directly, so swapping in Clerk or Auth.js later is a change in one folder. See [`docs/09-RISKS-DECISIONS.md`](docs/09-RISKS-DECISIONS.md).

**PDFs render in Chromium, not in the app.** In production, point `RENDER_SERVICE_URL` at a small always-on container; with it empty, `lib/pdf/render.ts` drives a local Chromium so the flow works on one machine. A bundled Chromium does not fit comfortably in a serverless function — [`docs/00-PRODUCT-PLAN.md §15`](docs/00-PRODUCT-PLAN.md) explains why this is its own service.

---

## Before you deploy

1. Set every secret properly — `AUTH_SECRET`, `PRINT_TOKEN_SECRET`, `ANALYTICS_SALT`
2. **Leave `AUTH_DEV_SHOW_RESET_LINK` unset.** On, it prints password reset links on screen
3. Wire real email — password reset is built and tested but cannot deliver without it
4. Stand up the render service and set `RENDER_SERVICE_URL`
5. Move the rate limiter to Redis if you run more than one instance (`lib/rate-limit.ts` says how)
6. Create the first admin with `pnpm admin:create` — there is deliberately no way to do it from inside the app
7. Every mutation is scoped by `userId` and was audited on 14 Sep 2026. Keep it that way
