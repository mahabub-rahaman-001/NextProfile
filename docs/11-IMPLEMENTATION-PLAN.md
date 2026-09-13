# NextProfile — Implementation Plan

**Version 1.0 · September 2026**
*The build guide. What to do, in what order, and how to know each piece is finished.*

The other documents say **what** NextProfile is. This one says **how to build it**, week by week and task by task. Every task has an ID, the files it touches, and an exit criterion.

Companion files:
- [12-TASKS.md](12-TASKS.md) — the same tasks as a flat checklist to tick off
- [13-CODE-PATTERNS.md](13-CODE-PATTERNS.md) — the eight recurring code shapes, written once

---

## 0. How to use this plan

### The rhythm

| | |
|---|---|
| **One task = one commit** | If a task produces more than ~300 lines, split it |
| **One week = one merge to `develop`** | With a working preview URL |
| **Build vertically, not horizontally** | Schema → validation → server action → UI → test, for one feature at a time. Never "all the schemas, then all the forms" |
| **Test the pure functions, click the UI** | Unit tests for logic, E2E for the one critical flow, manual for everything else |
| **Deploy from week 3** | A preview URL that works beats a local branch that does more |

### The order inside every feature

```
1. Prisma model            (if new)
2. Zod schema              lib/validation
3. Server action / route   with an ownership check
4. UI component            mobile width first
5. Wire completeness       if it's a profile module
6. Manual test at 375px    then a unit test if there is logic
```

Skipping step 2 is how you end up with three different shapes for the same data.

### Reconciling with the roadmap

[07-ROADMAP](07-ROADMAP.md) lists week 1 as *"requirements, PRD, flows, architecture"*. **That week is already done** — these documents are its output. So week 1 here becomes **foundations**, and everything shifts one week earlier in effort, which buys back the buffer weeks 7 and 10 will need.

### If you fall behind

Cut in this order. Never improvise a different order under pressure:

1. Third portfolio theme
2. Third resume template
3. CV document type (ship resume only)
4. Certifications and achievements modules
5. Analytics event collection

**Never cut:** auth, onboarding, education/experience/skills/projects, one template, one theme, preview, publish, PDF, privacy defaults.

---

## Week 1 — Foundations

**Goal:** the schema, the pure logic and the repo exist. No UI yet — and the hardest decisions are already tested.

**Prerequisite:** the four decisions in [09-RISKS-DECISIONS §2](09-RISKS-DECISIONS.md#2-decide-before-week-1) are closed and written into the decision log.

| ID | Task | Files | Exit criterion |
|---|---|---|---|
| **W1-01** | Close the four decisions; buy the domain | `09-RISKS-DECISIONS.md` decision log | Auth provider, domain, URL shape, PDF approach and first audience all written down |
| **W1-02** | Scaffold the Next.js app | repo root | `pnpm dev` serves a page; TypeScript strict on |
| **W1-03** | Install and configure Tailwind, shadcn/ui, Prettier, ESLint | `tailwind.config.ts`, `components/ui/` | `pnpm lint` and `pnpm typecheck` pass clean |
| **W1-04** | GitHub repo, branch protection, Vercel project | — | `main` protected; preview deploys on PR |
| **W1-05** | Write `prisma/schema.prisma` | from [03-DATA-MODEL](03-DATA-MODEL.md) | `pnpm prisma migrate dev --name init` succeeds |
| **W1-06** | Prisma singleton | `lib/db.ts` | No connection warnings on hot reload |
| **W1-07** | Seed script with all five fixture profiles | `prisma/seed.ts` | `pnpm prisma db seed` creates student-cse, student-business, professional-marketing, researcher-bio, freelancer-design |
| **W1-08** | Zod schemas for every model and every JSON config | `lib/validation/*.ts` | Each schema exported and unit-tested against one valid and one invalid object |
| **W1-09** | Module visibility config | `lib/modules/index.ts` | `getModules("RESEARCHER")` returns publications as visible, services as hidden — matches the §8 matrix exactly |
| **W1-10** | Completeness scorer | `lib/completeness/index.ts` | Weights per profile type; returns score + the two highest-value missing items |
| **W1-11** | Unit tests for W1-09 and W1-10 | `tests/unit/` | Five profile types × the matrix, all asserted |
| **W1-12** | Render service hello-world deployed | separate service repo | `GET /health` returns ok from a public URL |

> **W1-12 is the one that saves week 10.** Deploy an empty container with Chromium installed now, while there is no pressure. Week 10 then becomes integration, not infrastructure.

**Pitfalls**
- Using a non-pooled `DATABASE_URL` with Vercel — connections exhaust within a day of real use. Pooled for the app, direct for migrations.
- Writing the completeness scorer against the UI instead of as a pure function. It must take data in and return a number, with no database access.

**Exit:** `pnpm test` green, schema migrated, seeds loaded, render service responding. Zero UI.

---

## Week 2 — Design system and shells

**Goal:** every screen you build afterwards is assembly, not design.

| ID | Task | Files | Exit criterion |
|---|---|---|---|
| **W2-01** | Color tokens, both themes | `app/globals.css` | Both themes defined at `:root`; contrast checked ≥ 4.5:1 |
| **W2-02** | Type scale, fonts, spacing scale | `tailwind.config.ts` | Scale matches [05-DESIGN-SYSTEM](05-DESIGN-SYSTEM.md); no ad-hoc font sizes afterwards |
| **W2-03** | `FieldWrapper` — label, helper, error, counter, AI slot | `components/forms/field-wrapper.tsx` | Renders all states: default, error, disabled, with-helper, with-counter |
| **W2-04** | `RepeatableList` — add / edit / delete / drag-reorder / undo | `components/forms/repeatable-list.tsx` | Works with touch at 375px; keyboard move-up/move-down alternative |
| **W2-05** | `EmptyState`, `LoadingState`, `ErrorState` | `components/ui/` | Each takes a title, one line, one action |
| **W2-06** | Dashboard shell — sidebar (desktop) + tab bar (mobile) | `app/dashboard/layout.tsx` | Reduced nav for new accounts; full nav once the profile is filled |
| **W2-07** | Marketing shell + a minimal landing page | `app/(marketing)/` | Tagline, three outputs named, one CTA. Polished in week 12 |
| **W2-08** | Toast system and a `useAutosave` hook | `components/ui/toast`, `lib/hooks/` | Debounced save with a visible "Saved" state |
| **W2-09** | Print stylesheet base | `components/resume/engine/print.css` | A4 and Letter page boxes, margins, `break-inside: avoid` |

> **W2-04 is the highest-leverage component in the product.** Education, experience, skills, projects, certifications, achievements, publications, research, services, case studies and testimonials are all the same list with different fields. Build it once, properly, with reordering and undo, and weeks 5 and 6 become configuration.

**Pitfalls**
- Designing at desktop width and "making it responsive later." Start at 375px.
- Building `RepeatableList` around one specific entity. It takes a schema, a row renderer and an editor — nothing about education.

**Exit:** a dashboard shell you can navigate on a phone, with real components and no content.

---

## Week 3 — Auth and the user bootstrap

**Goal:** a real account, protected routes, and the profile row that everything hangs off.

| ID | Task | Files | Exit criterion |
|---|---|---|---|
| **W3-01** | Auth wrapper — `getSession`, `requireUser` | `lib/auth/index.ts` | No feature file ever imports the auth vendor directly |
| **W3-02** | Register with email + password | `app/(auth)/register/` | Account created, verification email sent within 30s |
| **W3-03** | Google sign-in | `app/(auth)/` | Name and photo pre-fill the profile from OAuth claims |
| **W3-04** | Email verification | `app/(auth)/verify/` | Unverified accounts cannot publish |
| **W3-05** | Login, logout, session persistence | `app/(auth)/login/` | Session survives a browser restart |
| **W3-06** | Password reset | `app/(auth)/forgot-password/` | Single-use link, 1-hour expiry |
| **W3-07** | Route protection | `middleware.ts` | `/dashboard/*` without a session redirects to login |
| **W3-08** | First-login bootstrap | `lib/auth/bootstrap.ts` | `User` + empty `Profile` created atomically; redirect to `/onboarding` |
| **W3-09** | Rate limit auth routes | `lib/rate-limit.ts` | 10 attempts/min/IP |
| **W3-10** | Deploy to preview and sign up as a real user | — | You have a real account on a real URL |

**Pitfalls**
- Creating the `Profile` lazily "when needed." Create it at bootstrap — half the app can then assume it exists.
- Verification that blocks *login* rather than *publishing*. Let people build; gate the public URL.

**Exit:** you can register on a deployed URL, land on onboarding, and reach a protected dashboard.

---

## Week 4 — Onboarding, basics, uploads

**Goal:** the three answers exist and visibly change the app.

| ID | Task | Files | Exit criterion |
|---|---|---|---|
| **W4-01** | Question 1 — profile type | `app/onboarding/page.tsx` | Stored on `Profile`, editable later in Settings |
| **W4-02** | Question 2 — career goal | same | Drives completeness weighting |
| **W4-03** | Question 3 — what to build | same | Multi-select, one primary; sets the post-onboarding landing route |
| **W4-04** | Basics form | `app/onboarding/basics/` | Name and headline required; everything else optional |
| **W4-05** | Resume/skip state | `lib/onboarding/` | Leaving mid-way and returning restores the last step |
| **W4-06** | Wire module visibility to the UI | `app/dashboard/profile/` | Changing profile type changes which modules appear — **with zero data loss** |
| **W4-07** | Signed upload pipeline | `lib/storage/`, `app/api/upload/` | Signed URL → direct upload → server re-encode, EXIF stripped, CDN URL returned |
| **W4-08** | Avatar upload with crop | `components/profile/avatar-upload.tsx` | ≤ 5MB in, square crop, served from the CDN |
| **W4-09** | Completeness card on the dashboard | `components/dashboard/completeness-card.tsx` | Shows the score and names the two highest-value missing items as links |
| **W4-10** | Onboarding timing check | — | Whole flow under 90 seconds on a phone, excluding typing |

> **Build uploads here, not in week 6.** The avatar needs the same pipeline project images need. Build it once now and week 6 is free.

**Pitfalls**
- Storing onboarding answers in a separate `Onboarding` table. They are profile fields — a student becomes a job seeker.
- Accepting SVG or HTML uploads. Raster only, re-encoded, never served from the app origin.

**Exit:** a new account can complete onboarding on a phone, and the dashboard shows a real completeness score.

---

## Week 5 — Education, experience, skills

**Goal:** the first three record modules, built on the `RepeatableList` pattern.

| ID | Task | Files | Exit criterion |
|---|---|---|---|
| **W5-01** | Generic section CRUD route factory | `app/api/profile/[section]/` | One handler shape serves all twelve sections ([13-CODE-PATTERNS §1](13-CODE-PATTERNS.md)) |
| **W5-02** | `sortOrder` midpoint reorder | `lib/sort-order.ts` | Reordering writes **one** row; renormalise job when gaps shrink |
| **W5-03** | Education module | `components/profile/education/` | Full CRUD + reorder; "currently studying" disables the end date |
| **W5-04** | Experience module with editable bullets | `components/profile/experience/` | Bullets individually editable and reorderable |
| **W5-05** | Skills module with categories | `components/profile/skills/` | Grouped by category in output; level optional |
| **W5-06** | Autosave on every field | via `useAutosave` | No save button on field edits; visible "Saved" state |
| **W5-07** | Soft delete with undo | `lib/db-helpers.ts` | Deleted entry restorable for 30 days; all reads filter `deletedAt: null` |
| **W5-08** | Ownership check on every mutation | [13-CODE-PATTERNS §2](13-CODE-PATTERNS.md) | Compound `where: { id, userId }` everywhere — no exceptions |
| **W5-09** | Completeness recomputed on write | `lib/completeness/` | Cached on `Profile`, not computed per page load |
| **W5-10** | Mobile pass | — | All three modules usable at 375px, including drag-reorder |

**Pitfalls**
- Writing three separate CRUD implementations. If education, experience and skills do not share a route handler and a list component, stop and refactor before week 6 multiplies the problem.
- Integer `sortOrder` — renumbering the whole list on every drag is slow and race-prone.

**Exit:** a real profile with real education, experience and skills, entered from a phone.

---

## Week 6 — Projects and the remaining modules

**Goal:** every record module exists; the profile is complete enough to render.

| ID | Task | Files | Exit criterion |
|---|---|---|---|
| **W6-01** | Projects module | `components/profile/projects/` | Title, summary, description, role, outcome, tags, links, featured |
| **W6-02** | Project image upload (reuses W4-07) | same | Up to 10 images, alt text prompted on upload |
| **W6-03** | Certifications module | `components/profile/certifications/` | Issuer, dates, credential URL |
| **W6-04** | Achievements module | `components/profile/achievements/` | Title, issuer, date, kind |
| **W6-05** | "Add a section" flow for optional modules | `components/profile/add-section.tsx` | Any user can opt into any module the matrix marks `○` or `–` |
| **W6-06** | Publications module | `components/profile/publications/` | Authors, venue, year, DOI; user-pasted citation used verbatim if present |
| **W6-07** | Research module | `components/profile/research/` | Title, supervisor, abstract, status |
| **W6-08** | Services, case studies, testimonials | `components/profile/` | The freelancer and creative paths are complete |
| **W6-09** | Fill all five fixture profiles by hand through the UI | — | Every module used at least once; this is your template test data |
| **W6-10** | Completeness weights verified per type | `tests/unit/` | A researcher without publications cannot reach 100% |

**Pitfalls**
- Skipping W6-09. Templates built against invented data break on real data. Enter all five profiles yourself — you will also find ten UX bugs doing it.

**Exit:** five complete, real profiles in the database, entered through the product.

---

## Week 7 — Document engine ⚠️ high risk

**Goal:** three resume templates rendering real profiles, on screen and on paper.

| ID | Task | Files | Exit criterion |
|---|---|---|---|
| **W7-01** | Section resolver | `components/resume/engine/resolve.ts` | Takes profile data + config → an ordered array of populated sections; empty sections dropped |
| **W7-02** | Document CRUD | `app/api/documents/` | Create, rename, duplicate, delete; `kind: RESUME \| CV` |
| **W7-03** | Config editor — order, visibility, density, accent, paper | `components/resume/config-panel.tsx` | Drag-reorder sections; hiding never deletes data |
| **W7-04** | Template: **Minimal** (ATS-safe) | `components/resume/templates/minimal/` | Single column, semantic, no icons as labels, linear DOM order |
| **W7-05** | Template: **Professional** | `.../professional/` | Two-column with sidebar; marked "not for online application forms" |
| **W7-06** | Template: **Modern** | `.../modern/` | Accent rules, tighter density, user-selectable accent |
| **W7-07** | Print CSS: page breaks, orphans, margins | `engine/print.css` | No heading alone at a page bottom; A4 and Letter correct |
| **W7-08** | Preview frame | `components/resume/preview.tsx` | Real page dimensions, zoom, page count |
| **W7-09** | Template picker with live thumbnails | `components/resume/template-picker.tsx` | Thumbnails rendered from the **user's own data**, not stock images |
| **W7-10** | CV document type | `components/resume/templates/*/cv.tsx` | Education and publications lead; no one-page constraint |
| **W7-11** | Render all five fixtures × all three templates | `tests/visual/` | 15 snapshots, none broken, none with overlapping text |

> **This is the week that overruns.** Symptoms: a template hardcoding "experience always comes second", or CSS that looks right on screen and breaks across a page boundary. Build Minimal completely — including print — before starting Professional.

**Pitfalls**
- Two renderers, one for screen and one for print. One component tree, one stylesheet, a print media query. If you split them they will drift, and the PDF is what the user sends.
- Templates that assume a section exists. Every template must render the researcher fixture *and* the freelancer fixture.

**Exit:** you can open any of the five fixtures, switch between three templates, reorder sections, and print to PDF from the browser with correct pages.

---

## Week 8 — Portfolio engine

**Goal:** three themes, section control, and a public component tree.

| ID | Task | Files | Exit criterion |
|---|---|---|---|
| **W8-01** | Theme contract | `components/portfolio/engine/types.ts` | A theme is a component set + defaults; adding one touches no other file |
| **W8-02** | Section system | `engine/sections.ts` | Add, remove, reorder, hide; stored in `Portfolio.config` |
| **W8-03** | Theme: **Minimal** | `themes/minimal/` | Type-led, single column, work as rows |
| **W8-04** | Theme: **Professional** | `themes/professional/` | Sidebar nav, project card grid |
| **W8-05** | Theme: **Modern** | `themes/modern/` | Full-bleed hero, large project imagery |
| **W8-06** | Theme recommendation by profile type | `lib/modules/` | Pre-selected, always changeable |
| **W8-07** | Responsive pass on all three | — | No horizontal scroll at 375px in any theme |
| **W8-08** | Accessibility pass on all three | — | Semantic heading order, contrast, alt text, keyboard nav |
| **W8-09** | Render all five fixtures × all three themes | `tests/visual/` | 15 snapshots |

**Pitfalls**
- Themes that differ only in colour. If a user cannot tell two themes apart in a thumbnail, you have one theme.
- Client-side rendering the public tree. These components must work server-rendered — week 9 depends on it.

**Exit:** three visually distinct portfolios rendering any fixture, server-rendered, responsive.

---

## Week 9 — Preview, publish, public URL

**Goal:** a real, shareable link.

| ID | Task | Files | Exit criterion |
|---|---|---|---|
| **W9-01** | Live preview — desktop split view | `components/portfolio/preview-pane.tsx` | Updates within 500ms of a keystroke pause |
| **W9-02** | Mobile Build/Preview toggle | same | Not a scaled-down split view |
| **W9-03** | Preview uses the real public tree | — | Published output identical to preview for the same data |
| **W9-04** | Username availability + claim | `app/api/username/` | Reserved words blocked; live availability check; 30-day change lock |
| **W9-05** | Publish / unpublish | `app/api/portfolio/publish/` | Revalidates the public path; unpublish 404s immediately |
| **W9-06** | Publish dialog | `components/portfolio/publish-dialog.tsx` | Names **exactly** which contact fields become visible, before the button |
| **W9-07** | Per-field contact visibility | `components/profile/contact-visibility.tsx` | Phone hidden by default even when email is shown |
| **W9-08** | Public route `/u/[username]` | `app/u/[username]/page.tsx` | Static + on-demand revalidation; 404 for private |
| **W9-09** | OG image generation | `app/u/[username]/opengraph-image.tsx` | Name, headline, photo |
| **W9-10** | SEO: meta, canonical, sitemap, robots | `app/sitemap.ts`, `app/robots.ts` | Sitemap contains public profiles only |
| **W9-11** | Analytics event collection | `app/api/analytics/collect/` | Hashed visitor with daily salt, no raw IP, bots dropped |
| **W9-12** | Share sheet and copy-link | `components/portfolio/share.tsx` | |

**Pitfalls**
- Forgetting to revalidate on profile edits. A user fixes a typo, sees the old page, and concludes it is broken.
- Publishing before verification. Gate publish on a verified email or you will host spam.

**Exit:** send your own link to someone. It loads fast, looks right on their phone, and shows nothing you did not intend to share.

---

## Week 10 — PDF, QR, AI ⚠️ high risk

**Goal:** the three things people take away with them.

| ID | Task | Files | Exit criterion |
|---|---|---|---|
| **W10-01** | Print route with HMAC token | `app/print/[docId]/page.tsx` | 60-second token; renders the same components as preview |
| **W10-02** | Render service integration | `lib/pdf/client.ts` | `POST /render` → PDF in storage → signed 5-minute URL |
| **W10-03** | PDF caching by content hash | `lib/pdf/cache.ts` | Unchanged document = free download |
| **W10-04** | Download UX | `components/resume/download-button.tsx` | Progress state; p95 under 10s; text selectable in the output |
| **W10-05** | PDF vs preview visual diff | `tests/visual/pdf/` | All three templates within the agreed threshold |
| **W10-06** | QR generation, PNG + SVG | `app/api/qr/`, `lib/qr/` | Scans at 2cm printed; cached by URL |
| **W10-07** | AI envelope builder | `lib/ai/envelope.ts` | Assembled **server-side** from the database — the client never sends facts |
| **W10-08** | Model router + provider wrapper | `lib/ai/index.ts` | Fast model for grammar, strong model for generation |
| **W10-09** | About Me route | `app/api/ai/about-me/` | Structured output, Zod-validated, one retry, graceful failure |
| **W10-10** | Suggestion review UI | `components/ai/suggestion-review.tsx` | Side-by-side, Use this / Discard, nothing auto-saves |
| **W10-11** | Quota + rate limiting | `lib/ai/quota.ts` | 15/month free, counted from `AIRequest`; notice at 80% |
| **W10-12** | AI request logging + daily spend alert | `lib/ai/log.ts` | Task, model, tokens, latency, accepted |
| **W10-13** | Adversarial no-invented-facts test | `tests/unit/ai/` | 20 fixtures; no proper noun, number or date appears that was not in the input |
| **W10-14** | AI kill switch | env `AI_ENABLED` | Disabling it leaves the builder fully usable |

**Pitfalls**
- Letting the client send the facts envelope. It invites fake facts and scatters prompt construction. Send the *intent*; build the envelope on the server.
- Fonts missing in the render container — the PDF silently falls back and looks wrong. Install the template fonts in the container image and check the first PDF visually.

**Exit:** download a PDF that matches the preview exactly, scan a QR that opens your profile, and generate an About Me that uses only facts you entered.

---

## Week 11 — Hardening

**Goal:** nothing embarrassing, nothing dangerous.

| ID | Task | Exit criterion |
|---|---|---|
| **W11-01** | **Ownership audit** | Every mutation and every read of a user-owned row scoped by `userId`. Go file by file — this is the most likely serious bug in the product |
| **W11-02** | Rate limits live | Auth, AI, upload-sign, analytics |
| **W11-03** | Upload hardening | MIME + magic bytes, size cap, re-encode, EXIF stripped, never served from the app origin |
| **W11-04** | Secret scan in CI | Build fails if a secret name appears in a client chunk |
| **W11-05** | Security headers | HSTS, CSP, `X-Content-Type-Options`, `X-Frame-Options: DENY` on dashboard |
| **W11-06** | Accessibility pass | Keyboard-only run of the whole flow; focus states; labels; contrast both themes; 44px targets |
| **W11-07** | Performance pass | Public profile LCP < 2.0s on a mid-range phone over 4G |
| **W11-08** | E2E test, green on every deploy | register → onboarding → records → AI → template → preview → publish → open in a clean session → PDF → QR |
| **W11-09** | Visual snapshots wired to CI | 3 templates + 3 themes × 5 fixtures |
| **W11-10** | Error handling sweep | Every failure states what happened and what to do next; no raw error strings |
| **W11-11** | Sentry with release tagging | Errors arriving, source-mapped |
| **W11-12** | Backup + **tested restore** | Restore into a scratch database once, successfully |

> **W11-01 and W11-12 are the two that matter most.** An ownership bug leaks career data; an untested backup is not a backup.

**Exit:** you would be comfortable if a stranger tried to break it.

---

## Week 12 — Beta

**Goal:** 20–50 real users, and the six numbers that tell you whether this works.

| ID | Task | Exit criterion |
|---|---|---|
| **W12-01** | Landing page finished | Tagline, the three outputs named, one CTA, a real example profile |
| **W12-02** | A real example profile, public | Yours — the most persuasive demo available |
| **W12-03** | Instrument the six metrics | Signup→publish · time to first PDF · completeness at publish · AI acceptance · week-4 return · shares per profile |
| **W12-04** | Onboarding email sequence | Welcome, "finish your profile", "your profile got N views" |
| **W12-05** | Feedback channel in-app | One button, goes to an inbox you actually read |
| **W12-06** | Beta invites to the named audience | The campus/department/season from decision 4 |
| **W12-07** | Run one in-person workshop | Everyone leaves with a finished resume and a live link |
| **W12-08** | Watch five people onboard without helping | Write down every place they hesitate. This is worth more than the analytics |
| **W12-09** | Triage and fix the top 5 blockers | Ship fixes within the beta week |

**Exit:** real people with published profiles, and a list — written by watching — of what to build next.

---

## Milestone checkpoints

Four points where you stop and decide whether to continue or change course.

| After | Checkpoint | If it fails |
|---|---|---|
| **Week 3** | Register on a live URL, land on a protected dashboard | Do not proceed. Everything depends on auth being solid |
| **Week 6** | Five complete profiles entered through the UI, on a phone | The builder is the product. Fix it before rendering anything |
| **Week 9** | A shareable link you are proud to send | If you hesitate to send it, the themes are not done |
| **Week 11** | E2E green, ownership audited, restore tested | Do not open a beta with career data unprotected |

---

## Working with an AI coding assistant

Most of this is buildable with an assistant, if you feed it the right context.

**Per task, give it:**
1. The relevant section of [03-DATA-MODEL](03-DATA-MODEL.md) (the models involved)
2. The matching pattern from [13-CODE-PATTERNS](13-CODE-PATTERNS.md)
3. The task's exit criterion from this document
4. An existing file that already follows the house style

**Ask for one task at a time.** "Build the profile builder" produces something generic; "add the education module using the RepeatableList component in `components/forms/repeatable-list.tsx` and the section route factory in `app/api/profile/[section]/route.ts`" produces something that fits.

**Always review:** the ownership check on every mutation, the Zod schema on every input, and anything touching print CSS or the AI prompt. Those three are where a plausible-looking generated answer costs you a week.

---

## The one-page summary

```
W1   Foundations       schema · seeds · pure logic · render service hello-world
W2   Design system     tokens · FieldWrapper · RepeatableList · shells
W3   Auth              register · verify · login · protect · bootstrap
W4   Onboarding        3 questions · basics · uploads · completeness
W5   Records I         education · experience · skills
W6   Records II        projects · certifications · achievements · the rest
W7   Documents ⚠️      resolver · 3 templates · print CSS · preview
W8   Portfolio         theme contract · 3 themes · sections
W9   Publish           preview · username · /u/[username] · SEO · events
W10  Takeaways ⚠️      PDF service · QR · AI About Me · quotas
W11  Hardening         ownership audit · a11y · perf · E2E · backups
W12  Beta              landing · metrics · 20–50 users · watch them
```

Two rules carry the whole plan:

1. **Build vertically.** One feature end to end beats five features half-built.
2. **Protect weeks 7 and 10.** Everything else has slack; those two do not.
