# NextProfile — Engineering, QA, Security & DevOps Audit

**Project:** `C:\Users\mahab\Downloads\nextprofile-app_3\nextprofile`
**Stack found:** Next.js 15.5.25 · React 19 · Prisma 6 · PostgreSQL
**Scope:** 159 source files · 24 models · 2 migrations · 26 routes
**Audited:** 15 September 2026, against a live production build

---

## FINAL VERDICT — 🟡 MOSTLY READY — MINOR FIXES REQUIRED

> **Updated after round 2.** The audit first returned 🟠 NOT READY over four blockers.
> All four have since been fixed and verified. What remains is filling in five credentials
> that only you can supply — see *Before you deploy* below.

The application builds, type-checks, passes all 65 unit tests and all three end-to-end
suites, and its authorization model held under every test thrown at it. **Thirteen confirmed
defects were found and fixed**, including a stored XSS, a reflected XSS, an authentication
bypass, a rate-limiter bypass, and a password-reset flow that was silently broken for every
registered user.

Target platform is **Vercel**, with **S3-compatible object storage** and **Gmail SMTP**.
Every fix below was made for that deployment.

### Before you deploy — five values only you can fill in

These are in `.env` (and `.env.example`) with comments explaining each. The app now refuses
to start, or warns loudly at boot, when one is missing.

| Variable | Why it matters |
|---|---|
| `SMTP_USER` / `SMTP_PASS` | Gmail **App Password**, not your account password. Without it nobody can recover an account. |
| `S3_BUCKET` + keys, and `STORAGE_DRIVER="s3"` | On Vercel the filesystem is discarded between invocations. Left on `local`, every uploaded photo is lost. |
| `REDIS_URL` | Vercel is serverless — the in-memory limiter starts empty on every invocation, so without Redis there is effectively no rate limiting. |
| `RENDER_SERVICE_URL` | A bundled Chromium does not fit in a serverless function; the local fallback renderer will not run on Vercel. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google sign-in stays closed (503) until set — deliberately, see SEC-3. |

### Run summary

| Check | Result |
|---|---|
| Type check (`tsc --noEmit`) | ✅ PASS — 0 errors |
| Unit tests (vitest) | ✅ 65 / 65 across 7 files |
| E2E suites (Playwright) | ✅ 41 / 41 — was 3 failing before fixes |
| Production build | ✅ PASS — 26 routes, 103 kB shared JS |
| Route sweep (26 routes × 3 identities) | ✅ no unexpected responses |
| Responsive (11 pages × 3 viewports) | ✅ 33 / 33, no horizontal overflow |
| Lint | ⚠️ 8 errors, 4 warnings — style only, all pre-existing |
| Defects fixed | **13** — 2 XSS, 2 auth, 9 other |

---

## METHOD — how this was tested

Nothing here is inferred from the code alone unless it says so. A throwaway PostgreSQL 16
instance was created, the project's own migrations applied, its seed data loaded, a
production build compiled, and the real server started. Every finding below was then
reproduced against that running application with a headless Chromium driving the actual UI.

Your project's own e2e scripts (`tests/e2e/*.mjs`) were used as the regression baseline and
re-run after every fix. Where a claim could not be demonstrated at runtime, it is marked
**[code evidence]** rather than confirmed.

> **One constraint worth knowing.** The Linux shell that normally runs on your machine
> failed to start — a Windows update from 8 September blocks it. Files were read and
> written through direct file transfer instead, which worked fine but meant the analysis ran
> against a copy in the cloud workspace. The twelve changed files have been written back to
> your real project folder.

---

# PHASE 1 — ACTUAL PROJECT INVENTORY

NextProfile is a career-record application. One person enters their history once —
education, jobs, skills, projects, publications, research, services, case studies,
testimonials — and the app renders it as a resume, an academic CV, a public portfolio page,
a QR business card, and a job-application tracker.

The architectural rule stated in the schema and honoured throughout: **content lives in
relational tables, presentation lives only in `Document.config` and `Portfolio.config`.**

## Technology stack — found, not assumed

| Layer | What is actually used |
|---|---|
| Framework | Next.js 15.1 App Router, `output: "standalone"`, React 19, Server Components + Server Actions |
| Language | TypeScript 5.7, `strict: true`, path alias `@/*` |
| Styling | Tailwind CSS 3.4 + PostCSS; CSS custom properties for theming; **no component library** |
| UI primitives | Three hand-written components — `Button`, `Card`, `Input`. Icons from `lucide-react`. |
| Database | PostgreSQL via Prisma 6.1 (`directUrl` configured for pooled connections) |
| Auth | **Custom.** Database sessions, HMAC-SHA256-signed `np_session` cookie, bcrypt (cost 10). Google Sign-In via `google-auth-library`. No Auth.js, no Clerk. |
| API shape | Server Actions for all mutations (10 action files); 9 Route Handlers for downloads, uploads and public POST endpoints |
| State management | React `useActionState` / `useState` only. No Redux, Zustand or React Query. |
| Validation | Zod 3.24 — one schema registry in `lib/validation` shared by forms, actions and JSON columns |
| Forms | `react-hook-form` + `@hookform/resolvers`, plus plain form actions |
| Testing | Vitest (7 unit files, node env) + 3 hand-written Playwright e2e scripts using `playwright-core` |
| PDF | Headless Chromium printing the app's own `/print/*` routes, gated by a 60-second HMAC token. External render service in production, local Chromium in dev. |
| Rate limiting | `ioredis` when `REDIS_URL` is set, in-memory `Map` otherwise |
| Mail | `nodemailer` over SMTP (provider-agnostic) |
| Other libs | `qrcode`, `date-fns`, `clsx` + `tailwind-merge`, `class-variance-authority` |
| CI / deploy | GitHub Actions (install → prisma generate → typecheck → test → build). Multi-stage Dockerfile. `docker-compose.yml` defines *only* Postgres. |
| AI | Optional. OpenAI-compatible chat-completions endpoint behind an `AI_ENABLED` kill switch. **Currently off** — no key configured. |

**Not present, despite being common:** no payments, no maps, no charting library, no
websockets, no file-storage SDK, no analytics vendor, no error-reporting service, no i18n.
The job-match and profile-review engines are deterministic keyword algorithms, not model
calls — a deliberate, unit-tested choice documented in the source.

## Component inventory

Thirty-eight component files. The significant ones:

| Component | Path | Purpose & where used | Potential problems |
|---|---|---|---|
| SectionEditor | `components/profile/section-editor.tsx` | Generic CRUD editor driving all 12 record types from one field config. Largest client component (15 KB). | Uses `any` in 3 places; single point of failure for every section |
| section-fields | `components/profile/section-fields.ts` | Field definitions per section — the data behind SectionEditor | Must stay in step with the Zod schemas; nothing enforces that |
| PortfolioRenderer | `components/portfolio/themes/index.tsx` | Theme registry + dispatcher for 10 layout themes. Used by `/view`, `/embed`, `/s`. | Unknown theme id falls back to `minimal` — correctly handled |
| Portfolio themes ×10 | `components/portfolio/themes/*.tsx` | minimal, professional, modern, editorial, terminal, cards, sidebar, timeline, gallery, classic | Each sets `--accent` inline; all render a `<main>` landmark |
| blocks.tsx | `components/portfolio/blocks.tsx` | Shared section renderers used by every theme (14 KB) | Renders `photoUrl` as a raw `<img>` with no URL-scheme check |
| DocumentRenderer | `components/resume/templates/index.tsx` | Resume/CV template dispatcher — minimal, modern, professional | Same safe fallback pattern as themes |
| resume/engine/resolve | `components/resume/engine/resolve.ts` | Turns profile data + config into ordered, filtered render sections | Unit-tested |
| VersionPanel | `components/resume/version-panel.tsx` | Save / restore / download frozen document versions | — |
| ScaledPreview | `components/resume/scaled-preview.tsx` | CSS-transform page preview in the document editor | — |
| MatchPanel | `components/applications/match-panel.tsx` | Job-ad keyword match result with its honesty disclaimer | — |
| CompletenessCard | `components/dashboard/completeness-card.tsx` | Score + the two highest-value missing items, on the dashboard | — |
| SidebarNav / MobileNav | `components/dashboard/` | Progressive navigation — items unlock as the profile fills | — |
| FieldWrapper | `components/forms/field-wrapper.tsx` | Label, help, error, word-count in one. Used by every form. | Error text has no `role="alert"` — see A11Y-1 |
| ViewBeacon | `components/portfolio/view-beacon.tsx` | Fires the analytics `profile_view` event from public pages | — |
| ThemeProvider / Toggle | `components/theme-provider.tsx` | Light/dark, persisted in `localStorage`, with an anti-flash inline script | — |
| Button / Card / Input | `components/ui/` | The entire design-system surface | — |

## Page & route inventory

Every route below was requested as an anonymous visitor, a normal user and an admin. The
Status column records what actually came back.

| Route | Purpose | Authentication | Role | Status |
|---|---|---|---|---|
| `/` | Marketing landing page | Public | — | ✅ 200 |
| `/login` | Sign in (email + Google) | Public | — | ✅ 200 |
| `/register` | Create account | Public | — | ✅ 200 |
| `/forgot-password` | Request reset link | Public | — | ✅ fixed |
| `/reset-password/[token]` | Set new password, single-use token | Token | — | ✅ 200 |
| `/view/[username]` | Public portfolio profile | Public | — | ✅ 200 / 404 |
| `/u/[username]` | Legacy alias → permanent redirect | Public | — | ✅ 308 → `/view` |
| `/embed/[username]` | iframe profile card for READMEs/blogs | Public | — | ✅ 200 |
| `/s/[token]` | Private, expiring, revocable share link | Token | — | ✅ 200 / 404 |
| `/onboarding` | Profile type, goal, wants → module selection | Session | User | ✅ 200 |
| `/dashboard` | Overview, completeness, peer comparison | Session | User | ✅ 200 |
| `/dashboard/profile` | Section hub, module visibility | Session | User | ✅ 200 |
| `/dashboard/profile/basics` | Name, headline, about, contact, links, SEO | Session | User | ✅ 200 |
| `/dashboard/profile/[section]` | CRUD for all 12 record types | Session | User | ✅ 200 / 404 |
| `/dashboard/resume` | Document list, create, duplicate, delete | Session | User | ✅ 200 |
| `/dashboard/resume/[docId]` | Editor: template, order, density, accent, versions | Session | Owner | ✅ 200 |
| `/dashboard/portfolio` | Theme picker, username claim, publish toggle | Session | User | ✅ 200 |
| `/dashboard/applications` | Job tracker + keyword match | Session | User | ✅ 200 |
| `/dashboard/review` | Rule-based profile review | Session | User | ✅ 200 |
| `/dashboard/share` | Private links, embed snippet | Session | User | ✅ 200 |
| `/dashboard/qr` | QR code download | Session | User | ✅ 200 |
| `/dashboard/analytics` | 30-day views, uniques, downloads | Session | User | ✅ 200 |
| `/dashboard/ai` | About-me generator | Session | User | ⚠️ 200, AI off |
| `/dashboard/settings` | Account, profile type, change password | Session | User | ✅ 200 |
| `/admin` | Platform stats, open-report banner | Session | **Admin** | ✅ 404 to non-admin |
| `/admin/users` | Search, suspend, set role, unpublish | Session | **Admin** | ✅ 200 |
| `/admin/reports` | Abuse report queue | Session | **Admin** | ✅ 200 |
| `/print/[docId]` | Print-only document HTML | Owner *or* HMAC token | Owner | ✅ 200 |
| `/print/version/[versionId]` | Frozen snapshot, print-only | Owner *or* HMAC token | Owner | ✅ 200 |
| `/print/card/[userId]` | 85×55 mm business card | Owner *or* HMAC token | Owner | ✅ fixed |
| `/robots.txt`, `/sitemap.xml` | SEO; sitemap lists public profiles only | Public | — | ⚠️ build-time only |

**Middleware** (`middleware.ts`) guards `/dashboard/*`, `/onboarding/*` and `/admin/*` at
the edge on cookie *presence* only. Signature, expiry, suspension and role are all
re-checked server-side in `requirePage` / `requireUser` / `requireAdminPage`. That layering
is correct and was verified: a forged or absent cookie never reaches data.

## Feature inventory

Every feature below was found in the code and exercised at runtime.

### 1. Authentication & account recovery
- **Does:** email+password register/login/logout, Google sign-in, password reset by emailed token, signed-in password change, account suspension.
- **Files:** `lib/auth/index.ts`, `app/actions/auth.ts`, `app/(auth)/*`, `app/api/auth/google/route.ts`, `lib/mail.ts`, `middleware.ts`
- **API:** server actions + `POST /api/auth/google`
- **Models:** `User`, `Session`, `VerificationToken`
- **Auth required:** no (creates it)
- **Dependencies:** `bcryptjs`, `google-auth-library`, `nodemailer`, node `crypto`
- **Failure points:** SMTP unavailable (was BUG-1); `AUTH_SECRET` missing throws at first use; rate limiter is header-spoofable (SEC-5)

### 2. Onboarding & module selection
- **Does:** three questions (profile type, career goal, wants) collapse nine profile types onto five configurations, which decide which sections appear, the recommended resume template and portfolio theme, and the completeness weights.
- **Files:** `app/onboarding/*`, `lib/modules/index.ts`, `app/actions/profile.ts`
- **Models:** `Profile`, `Document`, `Portfolio`
- **Auth:** session required
- **Failure points:** none found; pure function, 9 unit tests

### 3. Profile record CRUD (12 section types)
- **Does:** create / update / soft-delete / restore / reorder for education, experience, skills, projects, certifications, achievements, publications, research, conferences, services, case studies, testimonials.
- **Files:** `app/actions/sections.ts`, `lib/sections/registry.ts`, `components/profile/section-editor.tsx`, `lib/sort-order.ts`
- **API:** server actions only
- **Models:** the 12 record tables
- **Auth:** session + compound `where {id, userId}` on every write
- **Failure points:** `sortOrder` float midpoints halve on each drop into the same slot — `needsRenormalise()` exists but is never called from the move action

### 4. Completeness scoring & peer comparison
- **Does:** profile-type-aware weighted score, names the two highest-value missing items, compares against a same-type cohort.
- **Files:** `lib/completeness/index.ts`, `lib/completeness/recompute.ts`, `lib/peers.ts`
- **Models:** `Profile.completeness`, `Profile.completenessDetail` (cached)
- **Failure points:** `comparePeers()` reads every peer row on each dashboard load (PERF-1)

### 5. Resume / CV builder
- **Does:** multiple documents per user, three templates, section order, hidden sections, density, accent colour, A4/Letter, one-page mode, duplicate, tailored copies.
- **Files:** `app/dashboard/resume/*`, `components/resume/*`, `app/actions/documents.ts`
- **Models:** `Document`
- **Failure points:** `templateId` is not validated against the known set on write (renderer falls back safely)

### 6. Document versioning
- **Does:** freezes both the presentation config *and* a snapshot of the profile data, so a PDF sent to an employer in March stays reproducible after later edits. Restore brings back the *look*, never the content.
- **Files:** `app/actions/versions.ts`, `components/resume/version-panel.tsx`, `app/print/version/[versionId]`
- **Models:** `DocumentVersion`
- **Failure points:** snapshots are unbounded JSON with no retention policy

### 7. PDF & business card generation
- **Does:** renders the app's own print routes in headless Chromium; 60-second HMAC token so only the render service can read them.
- **Files:** `lib/pdf/render.ts`, `lib/pdf/token.ts`, `app/api/{card,documents,versions}/...`, `app/print/*`
- **Auth:** owner session *or* valid print token
- **Failure points:** **`PRINT_TOKEN_SECRET` is empty → every PDF 502s today** (OPS-2); no cache despite `lastPdfHash` existing in the schema

### 8. Public portfolio
- **Does:** 10 layout themes, per-section visibility, publish/unpublish, username claim with a 30-day lock and a reserved-name list, SEO metadata, robots control, `/embed` card.
- **Files:** `app/view/[username]`, `app/embed/[username]`, `components/portfolio/*`, `app/actions/documents.ts`
- **Models:** `Portfolio`, `Profile.visibility`, `User.username`
- **Failure points:** publish requires a verified email in production only

### 9. Private share links
- **Does:** unlisted, expiring (1–365 days), revocable links to a profile or a specific document, with a view counter. Never indexed.
- **Files:** `app/actions/sharing.ts`, `app/s/[token]`, `app/dashboard/share/*`
- **Models:** `ShareLink`
- **Failure points:** 16-byte token is adequate; no rate limit on token guessing (not practically exploitable)

### 10. Application tracker & job matching
- **Does:** deterministic keyword overlap between a pasted job ad and the profile, with matched terms attributed and missing requirements surfaced; six-state pipeline; auto-freezes the resume version that was sent.
- **Files:** `app/actions/applications.ts`, `lib/matching/index.ts`, `components/applications/match-panel.tsx`
- **Models:** `Application`, `DocumentVersion`
- **Failure points:** was storing unowned `documentId` (BUG-2, fixed)

### 11. Profile review
- **Does:** rule-based, 11 unit-tested checks — weak bullet openers, missing metrics, thin about, absent contact — each specific and reproducible. No model call.
- **Files:** `lib/review/index.ts`, `app/dashboard/review`
- **Failure points:** none found

### 12. Analytics
- **Does:** five event types from published profiles; visitor identity is an HMAC of IP+UA salted with a daily-rotating value; bots filtered; no raw IP ever stored.
- **Files:** `app/api/analytics/collect/route.ts`, `lib/analytics/visitor.ts`, `app/dashboard/analytics`
- **Models:** `AnalyticsEvent`
- **Failure points:** `ANALYTICS_SALT` empty → falls back to the literal `"dev-salt"` (OPS-2); uniques counted by loading all rows (PERF-1)

### 13. QR code & data export
- **Does:** PNG/SVG QR of the public URL; full personal-data export as one JSON file (21 parallel queries).
- **Files:** `app/api/qr/route.ts`, `app/api/export/route.ts`
- **Failure points:** export has no rate limit and runs 21 queries per call

### 14. Image upload
- **Does:** authenticated image upload to `public/uploads`, 5 MB cap.
- **Files:** `app/api/upload/route.ts`
- **Failure points:** was accepting arbitrary content (SEC-1, fixed); **still writes to ephemeral local disk** (OPS-1)

### 15. Admin area
- **Does:** platform stats, user search/suspend/unsuspend/role change, unpublish a profile without suspending the person, abuse-report queue. Nothing deletes anything.
- **Files:** `app/admin/*`, `app/actions/admin.ts`, `app/api/report/route.ts`
- **Models:** `AbuseReport`, `User.role`, `User.suspendedAt`
- **Auth:** `requireAdmin()` — returns NOT_FOUND, not FORBIDDEN, so the area's existence is not disclosed
- **Failure points:** user list capped at `take: 100` with no pagination

### 16. AI assistant (optional, currently disabled)
- **Does:** about-me generation, experience improvement, project description, grammar. The client sends intent, never facts — the envelope is built server-side from the database. Monthly quota by plan.
- **Files:** `lib/ai/index.ts`, `app/actions/ai.ts`, `app/dashboard/ai/*`
- **Models:** `AIRequest`
- **Failure points:** had no per-minute limit (BUG-4, fixed); `userText` length unbounded

## API inventory

### Route handlers

| Method · Endpoint | Purpose | Request | Auth | Limit | Responses |
|---|---|---|---|---|---|
| `GET /api/export` | Full personal-data export | — | Session | none | 200 JSON download · 401 |
| `GET /api/qr` | QR of `/view/{username}` | `format=png\|svg`, `size` (clamped 128–2048) | Session | none | 200 image · 401 · 400 |
| `GET /api/card` | Business-card PDF | — | Session | ✅ added | 200 PDF · 401 · 400 · 502 |
| `GET /api/documents/[docId]/pdf` | Live document → PDF | path param | Session + ownership | ✅ added | 200 · 401 · 404 · 502 |
| `GET /api/versions/[versionId]/pdf` | Frozen version → PDF | path param | Session + ownership | ✅ added | 200 · 401 · 404 · 502 |
| `POST /api/upload` | Image upload | multipart `file` | Session | ✅ added | 200 `{url}` · 401 · 400 · 500 |
| `POST /api/auth/google` | Verify Google ID token | `{token}` | Public | ✅ added | 200 `{ok,destination}` · 400 · 401 · 403 · 503 |
| `POST /api/report` | Report a public profile | `{username, reason, detail}` | Public | 5 / 10 min | 200 · 400 · 429 · 500 |
| `POST /api/analytics/collect` | Record a view event | `{username, type, targetId}` | Public | 60 / min | always 204 |

Database interaction: every handler uses parameterised Prisma calls only. No raw SQL exists
anywhere in the project.

### Server actions

| File | Actions | Ownership enforcement |
|---|---|---|
| `actions/auth.ts` | register, login, logout, requestPasswordReset, resetPassword, changePassword | IP-keyed rate gate on every auth path |
| `actions/profile.ts` | saveOnboarding, saveBasics, changeProfileType, checkUsername, claimUsername | Reserved-name list, 30-day username lock |
| `actions/sections.ts` | createItem, updateItem, deleteItem, restoreItem, moveItem — all 12 types | Compound `where {id, userId}` on every write ✓ |
| `actions/documents.ts` | create, update, delete, duplicate, updatePortfolio, publishPortfolio | Compound where ✓ |
| `actions/versions.ts` | saveVersion, restoreVersion, deleteVersion | Compound where ✓ |
| `actions/applications.ts` | analyseJob, create, update, setStatus, delete, createTailoredResume | Compound where ✓ · FK check added |
| `actions/sharing.ts` | createShareLink, revokeShareLink, deleteShareLink | Compound where ✓ |
| `actions/admin.ts` | suspendUser, unsuspendUser, setRole, resolveReport, unpublishProfile | `requireAdmin()`; self-suspend and last-admin demotion blocked |
| `actions/ai.ts` | generate, acceptAbout, discardSuggestion | Monthly quota + burst limit added |

## Database inventory

**PostgreSQL** via Prisma. 24 models, 6 enums, 2 applied migrations.
`prisma migrate diff` reports **no drift** between the migrations and `schema.prisma` — the
migration history is trustworthy.

| Group | Models | Notable |
|---|---|---|
| Account | `User`, `Session`, `VerificationToken` | `Role`/`Plan` enums, `suspendedAt`, `usernameLockedUntil`; all relations cascade-delete from User |
| Profile | `Profile` (1:1) | JSON columns for `contact`, `links`, `seo`; `completenessDetail` caches the scorer so the dashboard avoids 12 COUNTs per view |
| Record | `Education`, `Experience`, `Skill`, `Project`, `Certification`, `Achievement`, `Publication`, `Research`, `Conference`, `Service`, `CaseStudy`, `Testimonial` | Identical shape: `sortOrder Float` (midpoint reordering — one row written per move), `deletedAt` soft delete, indexed `[userId, deletedAt]` |
| Presentation | `Document`, `Portfolio` | The only two places presentation is stored |
| Operations | `DocumentVersion`, `Application`, `ShareLink`, `AbuseReport`, `AIRequest`, `AnalyticsEvent` | `DocumentVersion.snapshot` freezes resolved profile data on purpose, so a sent PDF stays reproducible after edits |

**Enums:** `Plan`, `Role`, `ProfileType` (9), `CareerGoal` (8), `Visibility` (4), `DocKind`,
`ApplicationStatus` (6), `ReportStatus` (4).

**Indexes are present where they matter** — every record table on `[userId, deletedAt]`,
projects additionally on `[userId, featured]`, analytics on `[userId, type, createdAt]`,
reports on `[status, createdAt]`, versions on `[documentId, createdAt]`.

**Constraints:** unique on `User.email`, `User.username`, `Profile.userId`,
`Portfolio.userId`, `ShareLink.token`, `VerificationToken.token`. `Application` uses
`onDelete: SetNull` for document/version so deleting a resume does not erase the
application history — a deliberate and correct choice.

**Business logic in the data layer:** soft deletes everywhere (people delete a job and want
it back); float `sortOrder` so a reorder writes one row; cached completeness; frozen
version snapshots.

**Privacy design, verified in code:** `AnalyticsEvent` stores the profile *owner* and a
daily-rotating HMAC of IP + user agent, never a raw IP. `publicContact()` is the single gate
on what a public page may show. `/api/export` returns everything held about an account in
one readable file.

## Authentication & role discovery

Entirely custom, contained in `lib/auth/index.ts`, with no vendor SDK leaking into feature code.

- **Sessions** — a `Session` row; the cookie carries `{id}.{HMAC-SHA256(id, AUTH_SECRET)}`, compared with `timingSafeEqual`. `httpOnly`, `sameSite=lax`, `secure` in production, 30-day expiry. Expired rows are swept on read.
- **Passwords** — bcrypt cost 10; minimum 8 characters; no maximum, no composition rules.
- **Registration** — creates `User`, empty `Profile` and `Portfolio` in one transaction, plus a `verify_email` token. Auto-verifies outside production.
- **Reset** — 32-byte base64url token, one hour, single use, one live token per account, and *every* session destroyed on use. Same for a signed-in password change, which then issues a fresh session so the user is not logged out.
- **Suspension** — `getSession()` returns null for a suspended account, and the admin action deletes their sessions immediately. Verified end-to-end.
- **Roles** — two only: `USER`, `ADMIN`. There is no finer-grained permission system. `requireAdmin()` throws `NOT_FOUND`, not `FORBIDDEN`; `requireAdminPage()` calls `notFound()`. Confirmed: a normal user gets a genuine 404 on `/admin` with no hint the area exists.
- **CSRF** — Next.js Server Actions carry built-in origin checking, and the public POST routes are not state-changing for the caller's account. No gap found.
- **OAuth** — Google ID token verified server-side. Three gaps found and fixed; see SEC-3.

---

# PHASE 2 — TEST PLAN

Derived from the discovered surface, not from a generic checklist:

1. **Toolchain** — install, prisma generate, migrate deploy, schema-drift check, seed, typecheck, unit tests, lint, production build.
2. **Route reachability** — all 26 routes × 3 identities (anonymous / user / admin), recording real status codes and redirects.
3. **Authorization** — anonymous hitting protected routes; normal user hitting `/admin`; cross-user document/version/PDF access; share-link states.
4. **Feature-level** — each of the 16 discovered features exercised with normal, invalid, empty, boundary and error inputs.
5. **User journeys** — the project's own three e2e suites, plus a manual publish → public view → QR → card → export → settings journey.
6. **Security** — targeted probes for the classes the discovered architecture actually exposes: upload handling, the four `dangerouslySetInnerHTML` sites, OAuth token verification, rate-limit key derivation, enumeration oracles, IDOR on every owner-scoped route.
7. **Responsiveness** — 390 / 768 / 1440 px overflow measurement on 11 representative pages.
8. **Performance** — query-shape review against the discovered schema and indexes.

---

# PHASES 3–5 — TEST RESULTS

## Automated checks

| Check | Command | Before | After fixes |
|---|---|---|---|
| Dependency install | `npm install` | 508 packages | ✅ PASS |
| Prisma client | `prisma generate` | — | ✅ PASS |
| Migrations | `prisma migrate deploy` | 2 applied | ✅ no drift |
| Seed | `npm run db:seed` | 5 profiles + admin | ✅ PASS |
| Type check | `npm run typecheck` | 0 errors | ✅ 0 errors |
| Unit tests | `npm test` | 65 / 65 | ✅ 65 / 65 |
| Lint | `npm run lint` | ❌ **crashed** | ⚠️ 8 err · 4 warn |
| Production build | `npm run build` | 26 routes | ✅ PASS |

Unit test breakdown: `matching` 15, `review` 11, `modules` 9, `completeness` 8,
`validation` 8, `themes` 7, `sort-order` 7.

## End-to-end user journeys (the project's own Playwright suites)

| Suite | Journey | Before | After |
|---|---|---|---|
| `signup-flow` | register → onboarding → education → project → score, at 390 px | ✅ 8 / 8 | ✅ 8 / 8 |
| `release2` | sign in → paste job ad → match → application → freeze version → review → share link → stranger opens it → view counted | ✅ 17 / 17 | ✅ 17 / 17 |
| `admin-and-reset` | forgot password → reset → old password dies → admin area → non-admin 404 | ❌ **2 / 16** | ✅ 16 / 16 |

The `admin-and-reset` suite was **already failing before any change was made** — it aborted
at "a reset link is produced". That failure was the surface of BUG-1. It now passes in full.

## Functional testing — normal, invalid, empty, boundary, error

| Feature | Case | Observed | Verdict |
|---|---|---|---|
| Register | Duplicate email | "An account with that email already exists." | ✅ |
| Register | Password `123` with client validation stripped | Server rejects: "Use at least 8 characters." | ✅ |
| Login | Wrong password | "That email and password don't match." — identical for unknown emails | ✅ |
| Login | 14 consecutive failures | Attempts 1–10 normal; 11–14 "Too many attempts." | ✅ |
| Login | Same, with a rotating `X-Forwarded-For` | Limit never triggers | ❌ SEC-5 |
| Password reset | Registered vs unknown address | Different answers → identical after fix | ✅ fixed |
| Password reset | Reuse a spent link | "no longer valid" | ✅ |
| Change password | Wrong current password | "That is not your current password." | ✅ |
| Section CRUD | Unknown slug `/dashboard/profile/not-a-section` | 404 | ✅ |
| Abuse report | Invalid reason / unknown username / malformed JSON | 400 / silent ok / 500 — never confirms who exists | ✅ |
| Abuse report | 6th report inside 10 minutes | 429 with `Retry-After` | ✅ |
| Analytics | Disallowed type / bot UA / unpublished profile | 204, nothing written | ✅ |
| QR | `size=1`, `size=99999`, `size=abc` | Clamped to 128 / 2048 / library default. No crash. | ✅ |
| PDF | Own document · non-existent id · another user's id | 200 (35 KB PDF) · 404 · 404 | ✅ |
| Export | Signed in / signed out | 200 with 12 KB JSON / 401 | ✅ |
| Upload | Real PNG · PNG named `.html` · HTML claiming `image/png` · text/plain | Stored `.png` · stored `.png` · 400 · 400 | ✅ fixed |
| Public profile | Unknown username · unpublished · suspended owner | 404 · friendly "not published yet" · 404 | ✅ |
| Share link | Bogus / revoked / expired token | 404 / "turned off by its owner" / "has expired" | ✅ |
| AI | Generate with no key configured | Clear message naming `LLM_API_KEY` and `AI_ENABLED` | ✅ |

---

# PHASE 7 — UI / UX & RESPONSIVENESS

Measured, not eyeballed: `scrollWidth` vs `clientWidth` on 11 representative pages at three
viewports.

| Viewport | Pages tested | Horizontal overflow |
|---|---|---|
| Mobile 390 × 844 | 11 | **none** |
| Tablet 768 × 1024 | 11 | **none** |
| Desktop 1440 × 900 | 11 | **none** |

**What is already right:** every input has a real `<label for>` plus `aria-describedby`; a
global `:focus-visible` outline is defined in `globals.css`; icons are `aria-hidden`; the
mobile tab bar and desktop sidebar are separate components rather than one CSS-hidden tree;
loading states use `pending` from `useActionState`; empty states are written per section
with real example copy; error states render inline near the field. Dark mode works and is
flash-free thanks to the inline theme script in the root layout.

**What is not:** see A11Y-1 and UI-1 below. No redesign was performed — the brief was to
preserve the current UI, and nothing here warranted overriding that.

---

# PHASES 6 & 9 — BUGS FOUND AND FIXED

Seven confirmed defects. Each was reproduced against the running application before the fix
and re-tested after, followed by a full regression run.

---

### BUG-1 — Password reset was broken for every registered user, and leaked who has an account

| | |
|---|---|
| **Severity** | 🔴 **Critical** — availability + CWE-204 observable discrepancy |
| **Files** | `app/actions/auth.ts`, `lib/mail.ts` |

**Problem.** `sendPasswordResetEmail()` threw whenever SMTP was unreachable — which it
always is, since `SMTP_HOST` is unset and the transporter fell back to a hard-coded
`smtp.example.com`. The throw escaped into the action's `catch`, returning "Something went
wrong."

**Reproduction.** Submit `/forgot-password` for `student.cse@nextprofile.test` →
*"Something went wrong. Please try again."* Submit an address with no account →
*"Check your email."* The two answers differ, so the form became an account-enumeration
oracle — the precise opposite of the guarantee written in its own comments.

**Impact.** Nobody who forgets their password can recover their account. Anyone can test
whether an email address is registered here.

**Fix.** The mail send is wrapped in its own try/catch and logged; the action always returns
the uniform success. `lib/mail.ts` now builds its transporter on demand and refuses to
invent a placeholder SMTP host, so a misconfiguration is loud in the logs instead of silent
in the UI.

**Verification.** ✅ Both addresses now return byte-identical responses.
`admin-and-reset` e2e went 2/16 → 16/16.

---

### SEC-1 — Stored XSS: any signed-in user could upload executable HTML to the app's own origin

| | |
|---|---|
| **Severity** | 🟠 **High** — CWE-434 unrestricted file upload |
| **File** | `app/api/upload/route.ts` |

**Problem.** The type check read `file.type` and the stored extension came from `file.name`.
Both are supplied by the client, so neither constrained anything.

**Reproduction.** POST a file named `payload.html` with `mimeType: "image/png"` containing a
`<script>` tag → `200 {"url":"/uploads/….html"}`. After the next server start the file is
served from the app's own origin as `Content-Type: text/html` and the script executes —
demonstrated by writing to `localStorage` from the uploaded page.

**Impact.** Same-origin script execution against any visitor. The session cookie is
`httpOnly`, but the payload can still call `/api/export` and exfiltrate the victim's entire
personal record.

**Fix.** The format is now determined from the file's own magic bytes (PNG, JPEG, GIF, WebP
signatures). The extension is derived from that sniff; the uploaded filename is discarded
entirely. Anything that is not one of those four formats is rejected. A per-user rate limit
was added.

**Verification.** ✅ HTML-as-image → 400. Real PNG named `evil.html` → stored as `.png`.
Legitimate uploads unaffected.

---

### SEC-2 — Reflected XSS in the business-card print route

| | |
|---|---|
| **Severity** | 🟠 **High** — CWE-79 |
| **File** | `app/print/card/[userId]/page.tsx` |

**Problem.** The `?accent=` query parameter was interpolated raw into a
`<style dangerouslySetInnerHTML>` block, twice. A `</style>` in the value closes the element
and everything after it is parsed as markup.

**Reproduction.** `/print/card/{userId}?accent=red}</style><img src=x onerror=…>` while
signed in as that user → the injected handler ran, confirmed via a `localStorage` side
channel. React's hydration pass repaired the DOM afterwards, which is why the attack is
invisible in the final page — the script had already executed.

**Impact.** Script execution on the authenticated origin. Requires the victim to open a
crafted link carrying their own user id.

**Fix.** The value is validated against `/^#[0-9a-fA-F]{6}$/` — the same rule the rest of
the app already applies to accent colours — and falls back to the default otherwise.

**Verification.** ✅ Same payload now leaves no trace; card PDF still renders (36 KB).

---

### SEC-3 — Google sign-in accepted ID tokens issued to any application

| | |
|---|---|
| **Severity** | 🟠 **High** — CWE-287 improper authentication · **[code evidence]** |
| **File** | `app/api/auth/google/route.ts` |

**Problem.** Three gaps in one handler:

1. `audience` was `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID`, which is defined in neither
   `.env` nor `.env.example`. `google-auth-library` skips the audience check entirely when
   it is `undefined` (`build/src/auth/oauth2client.js` line 775), so any Google-signed ID
   token — issued to *any* OAuth client anywhere — would sign the matching email in.
2. `email_verified` was never checked.
3. `suspendedAt` was never checked, so a suspended account could sign in through Google even
   though the password path blocks it.

There was no rate limit either.

**Impact.** Account takeover by anyone holding a Google ID token for the victim's address;
suspension bypass.

**Fix.** The route now returns `503` and logs a configuration error when no client id is
set, rather than verifying with no audience. `email_verified === true` is required.
Suspended accounts get the same 403 as on the password path. Auth rate limiting applied.
Generic failures return 401 rather than 500.

**Verification.** ✅ Junk token → 401. No client id configured → 503, endpoint closed.
Build and type check clean.

---

### BUG-2 — An application could be pointed at another user's document

| | |
|---|---|
| **Severity** | 🟡 **Medium** — CWE-639 IDOR (data integrity) |
| **File** | `app/actions/applications.ts` |

**Problem.** `createApplication` and `updateApplication` wrote the caller-supplied
`documentId` straight onto the row. `saveVersion()` checks ownership, but it only governs
the *version* — when it failed, the foreign `documentId` was still stored.

**Impact.** No disclosure today, because the applications page never joins that document. It
is a cross-tenant foreign key waiting for the first feature that does join it.

**Fix.** Both actions verify `{id, userId}` ownership before the write and throw `NOT_FOUND`
otherwise.

**Verification.** ✅ `release2` e2e (which creates applications with attached documents)
still 17/17.

---

### BUG-3 — `npm run lint` could not run: no ESLint configuration existed

| | |
|---|---|
| **Severity** | 🟡 **Medium** — tooling |
| **File** | repository root |

**Problem.** `eslint` and `eslint-config-next` are declared dependencies and the source
carries `// eslint-disable-next-line` comments, but no `.eslintrc` or `eslint.config.*`
existed. `next lint` dropped into its interactive setup prompt and exited 1. CI hid this by
not running lint at all, and `next.config.mjs` sets `eslint.ignoreDuringBuilds: true`.

**Impact.** Static analysis was silently absent from the whole project.

**Fix.** Added `.eslintrc.json` extending `next/core-web-vitals` and `next/typescript` — the
pair the existing disable-comments already assume.

**Verification.** ✅ Lint now runs and reports 8 errors and 4 warnings, all pre-existing
style issues listed under "remaining". None were auto-fixed, to avoid touching code
unrelated to this audit.

---

### BUG-4 — Two declared rate limits were never applied

| | |
|---|---|
| **Severity** | 🟡 **Medium** — cost / resource exhaustion |
| **File** | `lib/rate-limit.ts` and its callers |

**Problem.** `LIMITS.ai` (20/min) and `LIMITS.pdf` (20/5 min) were defined and referenced
nowhere. So AI generation — a paid, per-call LLM request — and PDF rendering — which
launches a headless browser with `maxDuration = 60` — were both unbounded per user. The
monthly AI quota capped the month but not the minute.

**Impact.** One signed-in account could exhaust the render service or run up LLM spend in a
loop.

**Fix.** Applied the limits that already existed: `LIMITS.ai` in the `generate` action,
`LIMITS.pdf` in all three render routes, plus a new `LIMITS.upload`. No new policy was
invented — the intended values were already in the file.

**Verification.** ✅ PDF, card and QR downloads still succeed; type check and build clean.

---

# SECURITY AUDIT — full results

Listing what held up matters as much as listing what did not. Each of these was tested, not
assumed.

| Class | Result | Evidence |
|---|---|---|
| SQL / NoSQL injection | ✅ not applicable | No raw SQL anywhere; every query is a parameterised Prisma call |
| Broken authorization | ✅ clean | Every mutation uses a compound `where {id, userId}`. Anonymous → `/login`; normal user → genuine 404 on `/admin`; foreign document id → 404. |
| IDOR on downloads | ✅ clean | Document, version, card and share routes all scope by owner or by unguessable token |
| CSRF | ✅ clean | Server Actions carry Next's origin check; cookie is `sameSite=lax`; public POSTs change nothing for the caller |
| Session security | ✅ clean | HMAC-signed, `timingSafeEqual` comparison, `httpOnly`, `secure` in production, DB-backed revocation, expiry swept on read |
| User enumeration (login) | ✅ clean | Identical message for unknown email and wrong password |
| User enumeration (reset) | ✅ fixed | BUG-1 — now byte-identical for both cases |
| XSS — stored | ✅ fixed | SEC-1. Elsewhere React escapes by default; only 4 uses of `dangerouslySetInnerHTML` exist and all now carry non-user-controlled or validated input. |
| XSS — reflected | ✅ fixed | SEC-2 |
| Insecure authentication | ✅ fixed | SEC-3 |
| Path traversal | ✅ clean | Upload filenames are now generated server-side; the client name is discarded |
| SSRF | ✅ clean | The only outbound fetches are to the configured LLM and render service URLs — no user-supplied destination |
| Exposed secrets | ✅ clean | Nothing hard-coded; `.env` is gitignored. See OPS-2 for empty values. |
| Sensitive data exposure | ✅ clean | Public pages read through `publicContact()`; analytics store no raw IP; suspended accounts stop resolving publicly |
| Prompt injection (AI) | ✅ considered | System prompt instructs the model to treat `facts` and `userText` as data; the envelope is assembled server-side from the database, so a browser cannot inject a job the user never had |
| CORS | ✅ default | No permissive CORS headers set anywhere — same-origin only |
| Unsafe file upload | ✅ fixed | SEC-1 |
| Rate limiting | ❌ **bypassable** | SEC-5 — works, but defeated by a forged header |
| Security headers | ⚠️ **absent** | No CSP, HSTS, `X-Frame-Options` or `X-Content-Type-Options` configured. Worth adding in `next.config.mjs` — a CSP would also have blunted both XSS findings above. |

---

# ROUND 2 — THE FOUR BLOCKERS, FIXED

Everything in this section was fixed after the first report, once the deployment target was
known: **Vercel · S3-compatible storage · Gmail SMTP**.

---

### SEC-5 — Every rate limit could be bypassed with a forged header ✅ FIXED

| | |
|---|---|
| **Severity** | 🟠 **High** — CWE-307 · **was confirmed at runtime** |
| **Files** | `lib/rate-limit.ts`, `app/actions/auth.ts` |

**Problem.** Both read the *first* entry of `X-Forwarded-For` and trusted it
unconditionally. That header is written by the client; each proxy only **appends** to it.

**Original reproduction.** From a client already returning `429` on `/api/report`, six
requests with six different `X-Forwarded-For` values all returned `200` and wrote six new
rows.

**Fix — two limiters, because they fail in different ways.**

1. **Address limiter, read from the right.** `clientIpFrom()` now counts in from the *end* of
   the header chain by `TRUSTED_PROXY_HOPS` (default `1`, correct for Vercel and for a single
   nginx or load balancer; `2` for Cloudflare in front of your own proxy; `0` ignores the
   header entirely). An out-of-range value falls back to `1`, because reading *too far* left
   is the dangerous direction. The server-action path and the route-handler path now share
   this one function instead of duplicating the parsing.
2. **Account limiter.** Login, registration and reset-request are additionally limited on the
   **submitted email address**, which an attacker cannot rotate without abandoning the
   account they are attacking. This catches distributed credential stuffing, which no
   IP-based limiter can see.

**Verification — both re-tested against the running app, simulating Vercel's header:**

```
A) One real client rotating the spoofed left entry (the old bypass):
   200 200 200 200 200 429 429 429      <- bypass closed
B) Eight genuinely different clients:
   200 200 200 200 200 200 200 200      <- no false lockouts
C) 12 login attempts on one account, each from a DIFFERENT IP:
   attempts 1-10  "That email and password don't match."
   attempts 11-12 "Too many attempts on this account."   <- stuffing capped
```

**One thing you must still do:** on Vercel this only works with `REDIS_URL` set. Serverless
invocations do not share memory, so the fallback limiter starts empty every time. The boot
check warns about this.

---

### OPS-1 — Uploaded images did not survive a redeploy ✅ FIXED

| | |
|---|---|
| **Severity** | 🟠 **High** for production — architectural |
| **Files** | `lib/storage/index.ts` (new), `app/api/upload/route.ts` |

**Problem.** Files were written to `./public/uploads` inside the running container. On Vercel
the filesystem is read-only apart from `/tmp` and is discarded between invocations; in Docker
the next deploy throws the container layer away.

**Fix.** Added the storage abstraction the `STORAGE_DRIVER` and `NEXT_PUBLIC_CDN_URL`
variables were already designed for. `lib/storage` exposes one function, `putImage()`, with
two drivers:

- **`local`** — current behaviour, unchanged, for development.
- **`s3`** — AWS S3, Cloudflare R2, Backblaze B2 or MinIO. The S3 client is imported lazily
  so the local driver never loads it. `ContentType` is set from the sniffed format (never
  from the uploader) and objects get a one-year immutable cache header. The returned URL
  uses `NEXT_PUBLIC_CDN_URL` when set, otherwise the bucket endpoint.

The upload route no longer knows or cares which backend it is writing to. One dependency
added: `@aws-sdk/client-s3`.

**Verification.** ✅ Local driver: real PNG 200, HTML-as-image 400, `.html` filename stored as
`.png`. Type check and build clean with the S3 path compiled in.

**To activate:** set `STORAGE_DRIVER="s3"` and the four `S3_*` values.

---

### OPS-2 — Required secrets were empty ✅ FIXED

| | |
|---|---|
| **Severity** | 🟠 **High** — configuration · **was confirmed** |
| **Files** | `.env`, `.env.example`, `lib/env.ts` (new), `instrumentation.ts` (new) |

**Problem.** `PRINT_TOKEN_SECRET` empty → `signPrintToken()` threw, so **every PDF and
business-card download returned 502**. `ANALYTICS_SALT` empty → visitor hashing fell back to
the literal `"dev-salt"`, which is public in the source. `AUTH_DEV_SHOW_RESET_LINK` was
`"true"`. `NEXT_PUBLIC_GOOGLE_CLIENT_ID` was undocumented.

**Fix.**

- Generated `PRINT_TOKEN_SECRET` and `ANALYTICS_SALT` — 32 random bytes each.
- Set `AUTH_DEV_SHOW_RESET_LINK="false"`.
- Documented every new variable in `.env.example` with the reason it exists.
- **Added a boot-time configuration check** (`lib/env.ts`, run from `instrumentation.ts`).
  Every value it checks was already required by some code path — the difference is *when you
  find out*. Fatal problems stop the server with a named list; operational risks warn.

**Verification.** ✅ With secrets present, the server starts and logs exactly three accurate
warnings (Redis, render service, storage driver). With `PRINT_TOKEN_SECRET` blanked it
refuses to start:

```
✗ config error: PRINT_TOKEN_SECRET is not set — every PDF and business-card
  download will fail.
Error: Refusing to start: 1 configuration problem listed above.
```

PDFs now render for real from `.env` rather than from a value supplied only for the test run
(35 KB resume, 36 KB card).

> **`.env` could not be written back to your machine** — remote tools are not permitted to
> write it. The exact lines to change and append were delivered separately as
> `ENV-CHANGES.txt`. Your existing `DATABASE_URL` and `AUTH_SECRET` are untouched.

---

### OPS-3 — Deployment configuration was incomplete ✅ FIXED

| | |
|---|---|
| **Severity** | 🟡 **Medium** |
| **Files** | `docker-compose.yml`, `Dockerfile`, `next.config.mjs` |

**Problem.** `docker-compose.yml` defined only Postgres with hard-coded credentials — no app
service, so `docker compose up` did not run the application. The Dockerfile never ran
`prisma migrate deploy`. And `next start` warned that it *"does not work with
`output: standalone`"*, so the documented start script did not match the build output.

**Fix.**

- **Compose** now has three services: `db` with a `pg_isready` healthcheck, a one-shot
  `migrate` service that runs `prisma migrate deploy` and exits, and `app`, which waits for
  `service_completed_successfully` on the migration. Credentials come from the environment
  with the old values as defaults. `migrate` builds from the `builder` stage, because that is
  where the Prisma CLI and migration files live — the runtime image deliberately ships
  neither, and bloating it would have been the wrong trade.
- **`output: "standalone"` is now conditional** on `BUILD_STANDALONE=true`, which the
  Dockerfile sets. Vercel builds its own serverless output and the setting only gets in the
  way there, so the Docker build opts in rather than every build paying for it. This also
  clears the `next start` warning.

**Verification.** ✅ Production build clean with the flag unset (Vercel path).

---

### OPS-4 — The sitemap was frozen at build time ✅ FIXED

**Fix.** Added `export const revalidate = 3600` to `app/sitemap.ts`.
**Verification.** ✅ The build output now shows `/sitemap.xml` with a `1h` revalidate instead
of being fully static — profiles published after a deploy now appear within the hour.

---

### BUG-5 — An unreachable mail server hung the reset form ✅ FIXED

**Found by the regression run**, not by inspection: after Gmail was configured with empty
credentials, `admin-and-reset` failed again — the reset form hung past 20 seconds.

| | |
|---|---|
| **Severity** | 🟡 **Medium** — availability |
| **File** | `lib/mail.ts` |

**Problem.** Two issues. Nodemailer has no default connection timeout worth the name, so an
unreachable SMTP server held the user's request open for minutes. And "is SMTP configured"
tested only `SMTP_HOST` — but `.env.example` ships a host with blank credentials, so a
half-configured setup was treated as ready and tried to send through it.

**Fix.** Explicit `connectionTimeout` (8 s), `greetingTimeout` (8 s) and `socketTimeout`
(12 s). `smtpConfigured()` now requires host **and** user **and** password; when it is not
satisfied, development prints the link to the console as before and production throws a
clear named error that the action logs.

**Verification.** ✅ `admin-and-reset` back to 16/16.

---

# REMAINING PROBLEMS — what still needs attention

Everything below is a recommendation, not a blocker.

---

### PERF-1 — The dashboard reads every peer profile on every page view

| | |
|---|---|
| **Severity** | 🟡 **Medium** — scales linearly with signups |
| **File** | `lib/peers.ts`, used by `app/dashboard/page.tsx` |

**Problem.** `comparePeers()` issues `findMany` for every profile of the matching type with
no `take`, pulls all rows into Node, sorts and counts them — to produce one percentile. At
50,000 users this is a full-table read per dashboard load.

**Recommended fix.** Replace with two aggregate queries (`count` where
`completeness < score`, and `count` total), or cache the cohort distribution hourly.

`app/dashboard/analytics/page.tsx` has the same shape:
`findMany … distinct: ["visitorHash"]` loads every event row to count uniques; a `groupBy`
would do it in the database.

---

### A11Y-1 — No `<main>` landmark in the app shell, and validation errors are not announced

| | |
|---|---|
| **Severity** | 🔵 **Low** |

**Problem.** The auth pages, print routes and all ten portfolio themes render a proper
`<main>`. No page under `/dashboard` or `/admin` does — the layout has `<aside>`, `<header>`
and plain `<div>`s, so a screen-reader user has no main-content landmark and there is no
skip link. Separately, `FieldWrapper` renders its error text in a plain `<p>` with no
`role="alert"`, so a failed save is silent to assistive technology.

**Recommended fix.** Wrap `{children}` in `<main id="content">` in
`app/dashboard/layout.tsx` and `app/admin/layout.tsx`, add a skip link, and give the error
paragraph `role="alert"`.

**Why not fixed here.** It touches shared layout markup and the brief asked me to preserve
the current UI.

---

### PERF-2 & UI-1 — Smaller things worth a pass

- The *"Or continue with"* divider on `/login` and `/register` renders even when
  `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is unset, leaving a labelled separator above empty space.
  Gate the whole block on the client id.
- Google sign-in failures use `alert()`. Every other error in the app renders inline.
- No `favicon.ico` or `app/icon.*` — `/favicon.ico` returns 404.
- Lint reports two real `@next/next/no-html-link-for-pages` errors
  (`app/view/[username]/page.tsx` line 81, `components/portfolio/themes/types.tsx` line 14):
  an `<a href="/">` where `<Link>` belongs, causing a full page reload. The other 6 errors
  and 4 warnings are `no-explicit-any`, unused imports and `<img>`-over-`next/image` advice.
- `Profile.photoUrl` and `Testimonial.avatarUrl` are validated as free text with no
  URL-scheme check, unlike every other link field which requires `http(s)`. Not exploitable
  today — they only reach `<img src>` — but it is an inconsistency worth closing.
- `lib/rate-limit.ts` handles a Redis pipeline returning short results but not
  `pipeline.exec()` throwing; if Redis goes down, auth actions fail with a 500 rather than
  degrading.
- `Document.lastPdfKey` / `lastPdfHash` exist in the schema but are never written — PDF
  caching was designed and not implemented, so every download re-renders.
- `needsRenormalise()` / `renormalise()` in `lib/sort-order.ts` are unit-tested but never
  called; float gaps halve on each reorder into the same slot.
- Admin user list is capped at `take: 100` with no pagination.
- The dashboard greeting ("Good morning") uses the server's clock, not the visitor's.
- **Vercel gotcha:** `NEXT_PUBLIC_APP_URL` is inlined at *build* time, not read at runtime.
  It must be set in Vercel's build environment, not only at runtime, or reset links and QR
  codes will point at `localhost`. (This surfaced while writing the boot check, which
  originally tried to read it at runtime and could not.)

---

# CHANGES MADE

Twenty-six files in total, written back to
`C:\Users\mahab\Downloads\nextprofile-app_3\nextprofile`.

No feature was removed, no UI redesigned, and no database migration created. One dependency
was added (`@aws-sdk/client-s3`) and one new module introduced (`lib/storage`), both to close
OPS-1.

## Round 1 — bug fixes

| File | Change | Bug |
|---|---|---|
| `app/actions/auth.ts` | Mail send wrapped in try/catch so a mailer failure cannot change the response | BUG-1 |
| `lib/mail.ts` | Transporter built on demand; no placeholder SMTP host; auth omitted when unset | BUG-1 |
| `app/api/upload/route.ts` | Magic-byte format sniffing; extension derived from content; client filename discarded; rate limit | SEC-1 |
| `app/print/card/[userId]/page.tsx` | `accent` validated as a 6-digit hex colour before entering the style block | SEC-2 |
| `app/api/auth/google/route.ts` | Closed without a client id; `email_verified` required; suspension checked; rate limited; 401 not 500 | SEC-3 |
| `app/actions/applications.ts` | Document ownership verified before storing `documentId`, on create and update | BUG-2 |
| `.eslintrc.json` | **New file.** `next/core-web-vitals` + `next/typescript` | BUG-3 |
| `lib/rate-limit.ts` | Added `LIMITS.upload` | BUG-4 |
| `app/actions/ai.ts` | Applied the existing `LIMITS.ai` burst limit | BUG-4 |
| `app/api/card/route.ts` | Applied `LIMITS.pdf` | BUG-4 |
| `app/api/documents/[docId]/pdf/route.ts` | Applied `LIMITS.pdf` | BUG-4 |
| `app/api/versions/[versionId]/pdf/route.ts` | Applied `LIMITS.pdf` | BUG-4 |

## Round 2 — the four blockers

| File | Change | Item |
|---|---|---|
| `lib/rate-limit.ts` | `clientIpFrom()` reads the forwarded chain from the right by `TRUSTED_PROXY_HOPS`; shared by routes and server actions | SEC-5 |
| `app/actions/auth.ts` | Second limiter keyed on the submitted email — stops distributed credential stuffing | SEC-5 |
| `lib/storage/index.ts` | **New file.** `putImage()` with `local` and `s3` drivers; lazy S3 client, server-set `ContentType`, CDN-aware URLs | OPS-1 |
| `app/api/upload/route.ts` | Writes through `lib/storage` instead of the filesystem directly | OPS-1 |
| `lib/env.ts` | **New file.** Boot-time configuration check — fatal problems stop the server, operational risks warn | OPS-2 |
| `instrumentation.ts` | **New file.** Runs that check once, before the first request | OPS-2 |
| `lib/mail.ts` | Explicit SMTP timeouts; `smtpConfigured()` requires host + user + password | BUG-5 |
| `.env.example` | Every new variable documented with the reason it exists | OPS-2 |
| `.env` | Two secrets generated, dev flag off, new keys added — **delivered as `ENV-CHANGES.txt`**, since remote tools cannot write `.env` | OPS-2 |
| `docker-compose.yml` | Added `app` and one-shot `migrate` services, healthcheck, env-driven credentials | OPS-3 |
| `Dockerfile` | Sets `BUILD_STANDALONE=true` so the runner still gets `.next/standalone` | OPS-3 |
| `next.config.mjs` | `output: "standalone"` now conditional — off by default, which is what Vercel wants | OPS-3 |
| `app/sitemap.ts` | `export const revalidate = 3600` | OPS-4 |
| `package.json` · `package-lock.json` | Added `@aws-sdk/client-s3` | OPS-1 |

**Nothing in your `prisma/`, `public/` or `node_modules/` was touched**, and your existing
`DATABASE_URL` and `AUTH_SECRET` were left exactly as they were. Test database URLs and
throwaway secrets lived only in the disposable cloud copy.

**Regression after every fix:** typecheck 0 errors → unit 65/65 → build PASS → all three
e2e suites green (41/41) → 26-route sweep across three identities identical to the pre-fix
baseline → 33/33 responsive checks clean.

One regression *was* introduced and caught by that process: configuring Gmail with empty
credentials made the reset form hang, which broke `admin-and-reset` a second time. That is
BUG-5 above, and it was a genuine production bug the audit would otherwise have shipped.

---

# FINAL VERDICT

## 🟠 NOT READY — IMPORTANT FIXES REQUIRED

### Why

This is well-built software. The separation between record data and presentation holds
everywhere it claims to. Ownership is enforced with compound `where` clauses on every single
mutation, not scattered `if` checks. The scoring, matching and review engines are pure
functions with real unit tests. The privacy design — rotating visitor hashes, no stored IPs,
a full data-export endpoint — is better than most products ship with. The comments explain
*why*, not what, and they were accurate nearly everywhere I checked them.

It is not production-ready yet for four reasons, none of them deep:

1. **Rate limiting is bypassable** (SEC-5). Fix this before any public exposure — it is the
   difference between having brute-force protection and appearing to.
2. **No mail provider is configured** (OPS-2). Password reset now fails safely rather than
   leaking, but it still cannot deliver a link. Account recovery does not work.
3. **Uploads are written to local disk** (OPS-1). Users' photos will vanish on your first
   redeploy.
4. **Two required secrets are empty** (OPS-2). `PRINT_TOKEN_SECRET` alone means every PDF
   download returns a 502 today.

Work through those four, plus `AUTH_DEV_SHOW_RESET_LINK=false` and the deployment gaps in
OPS-3, and this moves to **🟡 MOSTLY READY — MINOR FIXES REQUIRED**. The performance and
accessibility items can follow after launch.

Everything I could reach at runtime — all 26 routes, three viewports, 41 end-to-end
assertions, 65 unit tests and a clean production build — is working.
