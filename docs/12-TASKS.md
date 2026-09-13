# NextProfile — Task Checklist

**Version 1.0 · September 2026**

Every task from [11-IMPLEMENTATION-PLAN](11-IMPLEMENTATION-PLAN.md), as boxes to tick. Copy into your issue tracker, or keep it in the repo and commit it as you go.

**Progress:** 0 / 142

---

## Week 1 — Foundations

- [ ] **W1-01** Close the four open decisions; record them in the decision log
- [ ] **W1-01a** Buy the domain
- [ ] **W1-02** Scaffold Next.js (App Router, TypeScript strict)
- [ ] **W1-03** Tailwind + shadcn/ui + Lucide installed
- [ ] **W1-03a** ESLint + Prettier configured; `pnpm lint` and `pnpm typecheck` clean
- [ ] **W1-04** GitHub repo created; `main` protected; `develop` branched
- [ ] **W1-04a** Vercel project linked; preview deploys on PR
- [ ] **W1-05** `prisma/schema.prisma` written from the data model
- [ ] **W1-05a** First migration runs successfully
- [ ] **W1-06** Prisma singleton in `lib/db.ts`
- [ ] **W1-07** Seed script — `student-cse`
- [ ] **W1-07a** Seed — `student-business`
- [ ] **W1-07b** Seed — `professional-marketing`
- [ ] **W1-07c** Seed — `researcher-bio`
- [ ] **W1-07d** Seed — `freelancer-design`
- [ ] **W1-08** Zod schemas for all twelve record types
- [ ] **W1-08a** Zod schemas for `Profile`, `Document.config`, `Portfolio.config`
- [ ] **W1-09** `lib/modules` — profile type → module visibility
- [ ] **W1-10** `lib/completeness` — weighted scorer
- [ ] **W1-11** Unit tests for modules and completeness (all five types)
- [ ] **W1-12** Render service hello-world deployed; `/health` responds

---

## Week 2 — Design system and shells

- [ ] **W2-01** Color tokens, light and dark, contrast verified
- [ ] **W2-02** Type scale, fonts, spacing scale in Tailwind config
- [ ] **W2-03** `FieldWrapper` with all states
- [ ] **W2-04** `RepeatableList` — add / edit / delete
- [ ] **W2-04a** `RepeatableList` — drag-reorder, touch-capable
- [ ] **W2-04b** `RepeatableList` — keyboard move up/down alternative
- [ ] **W2-04c** `RepeatableList` — undo on delete
- [ ] **W2-05** `EmptyState`, `LoadingState`, `ErrorState`
- [ ] **W2-06** Dashboard shell — desktop sidebar
- [ ] **W2-06a** Dashboard shell — mobile tab bar
- [ ] **W2-06b** Reduced navigation for new accounts
- [ ] **W2-07** Marketing shell + minimal landing page
- [ ] **W2-08** Toast system
- [ ] **W2-08a** `useAutosave` hook with visible saved state
- [ ] **W2-09** Print stylesheet base — page boxes, margins, break rules

---

## Week 3 — Auth

- [ ] **W3-01** `lib/auth` wrapper — `getSession`, `requireUser`
- [ ] **W3-02** Register with email + password
- [ ] **W3-03** Google sign-in, pre-filling name and photo
- [ ] **W3-04** Email verification; publishing gated on it
- [ ] **W3-05** Login, logout, 30-day session
- [ ] **W3-06** Password reset — single-use, 1-hour link
- [ ] **W3-07** `middleware.ts` protecting `/dashboard/*`
- [ ] **W3-08** First-login bootstrap creates `User` + `Profile` atomically
- [ ] **W3-09** Rate limit on auth routes
- [ ] **W3-10** Deployed; you have signed up as a real user

---

## Week 4 — Onboarding, basics, uploads

- [ ] **W4-01** Q1 profile type, stored and editable later
- [ ] **W4-02** Q2 career goal
- [ ] **W4-03** Q3 outputs, multi-select with a primary
- [ ] **W4-04** Basics form (name + headline required)
- [ ] **W4-05** Resume / skip state
- [ ] **W4-06** Module visibility wired to the profile UI
- [ ] **W4-06a** Changing profile type loses no data
- [ ] **W4-07** Signed upload route + server re-encode + EXIF strip
- [ ] **W4-08** Avatar upload with crop
- [ ] **W4-09** Completeness card naming the top two missing items
- [ ] **W4-10** Whole onboarding under 90 seconds on a phone

---

## Week 5 — Education, experience, skills

- [ ] **W5-01** Section CRUD route factory
- [ ] **W5-02** Float `sortOrder` + midpoint reorder endpoint
- [ ] **W5-03** Education module
- [ ] **W5-03a** "Currently studying" disables the end date
- [ ] **W5-04** Experience module
- [ ] **W5-04a** Bullets individually editable and reorderable
- [ ] **W5-05** Skills module with categories
- [ ] **W5-06** Autosave wired to every field
- [ ] **W5-07** Soft delete + 30-day undo
- [ ] **W5-08** Ownership check on every mutation
- [ ] **W5-09** Completeness recomputed on write
- [ ] **W5-10** All three modules usable at 375px including reorder

---

## Week 6 — Projects and remaining modules

- [ ] **W6-01** Projects module (title, summary, description, role, outcome, tags, links, featured)
- [ ] **W6-02** Project image upload, up to 10, alt text prompted
- [ ] **W6-03** Certifications module
- [ ] **W6-04** Achievements module
- [ ] **W6-05** "Add a section" flow for optional modules
- [ ] **W6-06** Publications module
- [ ] **W6-07** Research module
- [ ] **W6-08** Services module
- [ ] **W6-08a** Case studies module
- [ ] **W6-08b** Testimonials module
- [ ] **W6-09** All five fixture profiles entered **by hand through the UI**
- [ ] **W6-10** Completeness verified per type (researcher without publications < 100%)

---

## Week 7 — Document engine ⚠️

- [ ] **W7-01** Section resolver (data + config → ordered populated sections)
- [ ] **W7-02** Document CRUD — create, rename, duplicate, delete
- [ ] **W7-03** Config panel — order, visibility, density, accent, paper
- [ ] **W7-04** Template **Minimal** — screen
- [ ] **W7-04a** Template Minimal — print, ATS-safe verified
- [ ] **W7-05** Template **Professional** — screen
- [ ] **W7-05a** Template Professional — print
- [ ] **W7-06** Template **Modern** — screen
- [ ] **W7-06a** Template Modern — print
- [ ] **W7-07** Page breaks, orphans, A4 and Letter correct
- [ ] **W7-08** Preview frame with real page dimensions and page count
- [ ] **W7-09** Template picker with thumbnails from the user's own data
- [ ] **W7-10** CV document type with academic ordering
- [ ] **W7-11** 15 visual snapshots (3 templates × 5 fixtures) all clean

---

## Week 8 — Portfolio engine

- [ ] **W8-01** Theme contract defined
- [ ] **W8-02** Section system — add / remove / reorder / hide
- [ ] **W8-03** Theme **Minimal**
- [ ] **W8-04** Theme **Professional**
- [ ] **W8-05** Theme **Modern**
- [ ] **W8-06** Theme recommendation by profile type
- [ ] **W8-07** All three themes responsive at 375px
- [ ] **W8-08** All three themes pass the a11y checklist
- [ ] **W8-09** 15 visual snapshots (3 themes × 5 fixtures)

---

## Week 9 — Preview, publish, public URL

- [ ] **W9-01** Desktop split-view live preview, < 500ms updates
- [ ] **W9-02** Mobile Build / Preview toggle
- [ ] **W9-03** Preview renders the real public component tree
- [ ] **W9-04** Username availability check + reserved word list
- [ ] **W9-04a** Username claim with 30-day change lock
- [ ] **W9-05** Publish / unpublish with path revalidation
- [ ] **W9-05a** Profile edits revalidate (debounced)
- [ ] **W9-06** Publish dialog naming exactly what becomes visible
- [ ] **W9-07** Per-field contact visibility, phone hidden by default
- [ ] **W9-08** `/u/[username]` static + on-demand revalidation; 404 when private
- [ ] **W9-09** OG image generation
- [ ] **W9-10** Meta tags, canonical, sitemap (public only), robots
- [ ] **W9-11** Analytics collection with hashed visitor + daily salt
- [ ] **W9-12** Share sheet and copy-link

---

## Week 10 — PDF, QR, AI ⚠️

- [ ] **W10-01** `/print/[docId]` route with HMAC token verification
- [ ] **W10-02** Render service integration end to end
- [ ] **W10-02a** Template fonts installed in the container image
- [ ] **W10-03** PDF caching by content hash
- [ ] **W10-04** Download UX with progress; p95 < 10s; text selectable
- [ ] **W10-05** PDF vs preview visual diff for all three templates
- [ ] **W10-06** QR generation PNG + SVG, cached, scans at 2cm
- [ ] **W10-07** AI envelope builder (server-side only)
- [ ] **W10-08** Model router + provider wrapper
- [ ] **W10-09** About Me route with schema validation and one retry
- [ ] **W10-10** Suggestion review UI — side-by-side, nothing auto-saves
- [ ] **W10-11** Quota (15/month free) + rate limits + 80% notice
- [ ] **W10-12** AI request logging + daily spend alert
- [ ] **W10-13** Adversarial no-invented-facts test over 20 fixtures
- [ ] **W10-14** `AI_ENABLED` kill switch; builder fully usable without AI

---

## Week 11 — Hardening

- [ ] **W11-01** Ownership audit — every mutation, file by file
- [ ] **W11-01a** Ownership audit — every read of user-owned data
- [ ] **W11-02** Rate limits live on auth, AI, upload, analytics
- [ ] **W11-03** Upload hardening — MIME + magic bytes, size, re-encode, origin
- [ ] **W11-04** CI secret scan of client bundles
- [ ] **W11-05** Security headers (HSTS, CSP, nosniff, frame-deny)
- [ ] **W11-06** Keyboard-only run of the entire flow
- [ ] **W11-06a** Contrast + focus states verified in both themes
- [ ] **W11-06b** Touch targets ≥ 44px
- [ ] **W11-07** Public profile LCP < 2.0s on a mid-range phone
- [ ] **W11-08** E2E flow green, running on every deploy
- [ ] **W11-09** Visual snapshots wired into CI
- [ ] **W11-10** Error message sweep — no raw errors, every failure actionable
- [ ] **W11-11** Sentry receiving source-mapped errors with release tags
- [ ] **W11-12** Backup restored into a scratch database, successfully

---

## Week 12 — Beta

- [ ] **W12-01** Landing page finished
- [ ] **W12-02** Your own profile published as the example
- [ ] **W12-03** Metric: signup → published profile
- [ ] **W12-03a** Metric: time to first PDF
- [ ] **W12-03b** Metric: completeness at publish
- [ ] **W12-03c** Metric: AI suggestions kept
- [ ] **W12-03d** Metric: week-4 return rate
- [ ] **W12-03e** Metric: shares per published profile
- [ ] **W12-04** Onboarding email sequence
- [ ] **W12-05** In-app feedback button
- [ ] **W12-06** Beta invites sent to the named audience
- [ ] **W12-07** One in-person workshop run
- [ ] **W12-08** Five people watched onboarding without help; notes written
- [ ] **W12-09** Top five blockers fixed and shipped

---

## Milestone gates

Do not pass a gate that has not cleared.

- [ ] **Gate 1 (end of W3)** — Register on a live URL and land on a protected dashboard
- [ ] **Gate 2 (end of W6)** — Five complete profiles entered through the UI, on a phone
- [ ] **Gate 3 (end of W9)** — A shareable link you are proud to send
- [ ] **Gate 4 (end of W11)** — E2E green, ownership audited, restore tested

---

## Every-week checklist

Repeat at the end of each week:

- [ ] Merged to `develop`, preview URL working
- [ ] Everything new works at 375px
- [ ] Everything new is keyboard-operable with visible focus
- [ ] Every new mutation has an ownership check
- [ ] Every new input has a Zod schema
- [ ] No secret name in any client bundle
- [ ] A test exists for whatever broke this week
