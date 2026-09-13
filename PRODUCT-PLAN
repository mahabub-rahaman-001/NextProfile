# NextProfile — Product Plan

**Version 1.0 · September 2026**
*A rewrite of the Universal Career Identity Platform concept, under the NextProfile name.*

> **Your Profile. Your Next Opportunity.**

---

## Table of contents

1. [What is broken today](#1-what-is-broken-today)
2. [Positioning](#2-positioning)
3. [Who it is for](#3-who-it-is-for)
4. [Product principles](#4-product-principles)
5. [Definition of success](#5-definition-of-success)
6. [The user journey](#6-the-user-journey)
7. [Three-question onboarding](#7-three-question-onboarding)
8. [Adaptive profile builder](#8-adaptive-profile-builder)
9. [Completeness scoring](#9-completeness-scoring)
10. [Guided writing](#10-guided-writing)
11. [Navigation](#11-navigation)
12. [The universal data model](#12-the-universal-data-model)
13. [Resume & CV engine](#13-resume--cv-engine)
14. [Portfolio engine](#14-portfolio-engine)
15. [PDF and QR](#15-pdf-and-qr)
16. [Public profile and privacy](#16-public-profile-and-privacy)
17. [Analytics and SEO](#17-analytics-and-seo)
18. [AI layer](#18-ai-layer)
19. [Technology](#19-technology)
20. [Delivery](#20-delivery)
21. [Business](#21-business)
22. [Risks](#22-risks)
23. [Ten design rules](#23-ten-design-rules)

---

## 1. What is broken today

A final-year student applying for an internship writes their background out four times: once in a Word resume, once in a Google Form, once on LinkedIn, once in an email. A researcher applying abroad keeps a CV that has drifted out of sync with their publication list. A freelancer sends a Drive folder full of screenshots.

The **information** is the same every time. Only the **presentation** changes.

Existing tools solve one presentation each — resume builders make resumes, portfolio templates make portfolios — and none of them hold the underlying career record. The rewriting is the real problem.

> **Tell us about yourself once. We keep it, improve it, and render it wherever you need it.**

---

## 2. Positioning

NextProfile is **not** marketed as:

- a CV builder
- a resume builder
- a portfolio builder
- a developer portfolio

Each of those is a *feature* inside NextProfile, and each is a crowded, low-price category on its own.

NextProfile is a **career identity platform**: the place a person's professional record lives, improves over time, and gets published from.

```
          Profile Builder
                +
        Resume / CV Builder
                +
         Portfolio Builder
                +
        AI Career Assistant
                +
          Job Optimization
                +
      Public Career Profile
                =
        CAREER IDENTITY PLATFORM
```

| It… | Which means |
|---|---|
| **Holds the record** | Education, experience, skills, projects, research, services, achievements — structured, versioned, owned by the user |
| **Improves the writing** | AI that rewrites what the user wrote, using only their own facts |
| **Renders the outputs** | Resume, CV, portfolio site, public profile, PDF, QR — all from one record |
| **Targets the opportunity** | A job description in → a tailored resume and a gap analysis out |

### A note on the name

"Profile" alone can read as *social network*. The marketing copy must name the three concrete outputs — **resume, CV, portfolio** — within the first screen, every time. The tagline carries the rest: *Your Profile. Your Next Opportunity.*

---

## 3. Who it is for

Deliberately **not** CSE/IT only. Five primary profile types cover the realistic user base.

| Profile type | Typical goal | Primary output | What "good" means to them |
|---|---|---|---|
| **Student** *(any discipline)* | Internship, first job, higher study | Resume + public profile | Looks credible despite thin experience |
| **Working professional** | Next role, promotion, visibility | Resume + portfolio | Achievements read as impact, not duties |
| **Researcher / academic** | PhD, postdoc, faculty, grants | Academic CV | Publications and conferences formatted correctly |
| **Freelancer / consultant** | Clients, contracts | Portfolio + services | Case studies and testimonials up front |
| **Creative** *(design, media, arts)* | Studio work, commissions | Visual portfolio | Work shown large, text out of the way |

**Everyone else maps in.** Teachers, doctors, lawyers, marketers, accountants, managers, journalists, architects, government professionals and entrepreneurs all enter through *Working professional* and adjust from there. Students of business, engineering, medicine, law, humanities, social science, science and arts all enter through *Student*.

### Why this matters technically

These five types are not marketing segments. They are the **switch** that drives:

- which form modules appear,
- which template and theme are recommended,
- which tone the AI writes in,
- how the completeness score is weighted.

Everything downstream reads the profile type set during onboarding.

---

## 4. Product principles

Ten rules that settle arguments during the build. When a decision is close, the **earlier** principle wins.

| # | Principle | In practice |
|---|---|---|
| 1 | **Universal** | A lawyer and a CSE student both finish onboarding without seeing a field that makes no sense to them |
| 2 | **No technical knowledge** | No markdown, no JSON, no "slug", no "repository". Plain words everywhere |
| 3 | **Adaptive** | Modules, templates, prompts and recommendations all read profile type + career goal |
| 4 | **AI assists, never overwrites** | Every generated string lands in an editable field with the original one undo away |
| 5 | **Output is real-world ready** | A recruiter or admissions officer should not be able to tell it came from a builder |
| 6 | **Fast to first result** | A usable resume within 10 minutes of signup, from an empty account |
| 7 | **Mobile-first** | Building, previewing and sharing all work on a phone |
| 8 | **Privacy by default** | Nothing is public until published; phone and email are opt-in per profile |
| 9 | **Scalable** | New templates and themes ship without a migration |
| 10 | **Maintainable** | One design system across dashboard, builder and public pages |

---

## 5. Definition of success

### Qualitative bar

The MVP succeeds when a completely non-technical person can, unaided:

1. Create an account
2. Say what kind of user they are
3. Select their career goal
4. Enter their information without confusion
5. Get AI help where they get stuck
6. Build a professional resume or CV
7. Build a professional portfolio
8. Choose a suitable theme
9. Preview the result live
10. Publish the profile
11. Get a shareable URL
12. Download a PDF
13. Generate a QR code
14. Share it with employers, universities, clients or contacts

### The six numbers that confirm it

| Metric | What it tells you | Beta target |
|---|---|---|
| Signup → published profile | The core funnel works end to end | ≥ 35% |
| Time to first PDF | Onboarding and builder friction | < 15 min |
| Profile completeness at publish | Whether guidance actually guides | ≥ 70% |
| AI suggestions kept (not reverted) | Whether the writing is good enough to use | ≥ 60% |
| Week-4 return rate | Whether it's a *record* or a one-off tool | ≥ 25% |
| Shares per published profile | Organic distribution | ≥ 1.5 |

Instrument these six from week 1 of the beta. Everything else in analytics is secondary.

---

## 6. The user journey

```
Landing page
      ↓
Create account
      ↓
Three questions  (profile type · career goal · what to build)
      ↓
Basic information
      ↓
Education / Experience / Skills
      ↓
Projects / Achievements / Certifications
      ↓
AI improves the content
      ↓
Choose template / theme
      ↓
Live preview
      ↓
Publish
      ↓
PDF + QR
      ↓
Share
      ↓
Track views
```

| Step | Done means |
|---|---|
| 1. Land and sign up | Value stated in one line; account created with email or Google |
| 2. Answer three questions | Profile type, career goal, desired output. Nothing else |
| 3. Fill the basics | Name, headline, location, contact — pre-filled from OAuth where possible |
| 4. Add the record | Only the modules that match the profile type |
| 5. Let the AI tidy it | About Me generated from the record; descriptions rewritten on request |
| 6. Pick a look | Template and theme, both recommended by profile type |
| 7. Preview live | Editor left, real output right, updating as they type |
| 8. Publish | Username claimed, profile live at a real URL |
| 9. Take it away | PDF downloaded, QR generated, link shared |
| 10. Come back | Views and downloads reported; profile updated as their career moves |

Steps 1–9 must be completable **in one sitting on a phone**. Step 10 is what turns the product from a builder into a platform.

---

## 7. Three-question onboarding

Onboarding asks three things and **uses all three**. Anything not used to configure the experience does not belong here.

### Q1 — Who are you right now?

`Student` · `Job Seeker` · `Working Professional` · `Freelancer` · `Researcher` · `Teacher` · `Creative Professional` · `Entrepreneur` · `Other`

### Q2 — What are you trying to do?

`Find an internship` · `Find a job` · `Apply for higher study` · `Find freelance clients` · `Build a portfolio` · `Build professional presence` · `Promote services` · `Build a personal brand`

### Q3 — What should we build first?

`Resume` · `CV` · `Portfolio` · `Public profile` — multi-select, one marked primary.

### What each answer changes

| Answer | Drives |
|---|---|
| **Profile type** | Which form modules are shown, collapsed, or hidden; recommended template and theme; AI tone |
| **Career goal** | Completeness weighting; which section the dashboard nudges next; AI emphasis (an internship summary reads differently from a PhD statement) |
| **Desired output** | Where the user lands after onboarding; which builder is primary in navigation |

### Reversible by design

Store these as ordinary profile fields, **not** as a one-time wizard result. A student becomes a job seeker; a freelancer takes a full-time role. Changing the profile type re-runs module selection **without touching any stored data** — which is only possible because of the data model in §12.

---

## 8. Adaptive profile builder

Every user shares a universal core. Beyond that, modules are shown, offered, or hidden per profile type. **The same database tables back all of it** — only visibility changes.

### Universal (everyone)

Full name · Profile photo · Professional headline · Location · Email · Phone · About / bio · Languages · Social links · Website

### Module matrix

`●` shown by default  ·  `○` available under "Add a section"  ·  `–` hidden unless the user goes looking

| Module | Student | Professional | Researcher | Freelancer | Creative |
|---|:---:|:---:|:---:|:---:|:---:|
| Basics, headline, about, links | ● | ● | ● | ● | ● |
| Education | ● | ● | ● | ○ | ○ |
| Work experience | ○ | ● | ● | ○ | ○ |
| Skills | ● | ● | ● | ● | ● |
| Projects | ● | ● | ○ | ● | ● |
| Certifications | ● | ● | ○ | ○ | – |
| Achievements & awards | ● | ● | ● | ○ | ○ |
| Activities, clubs, volunteering | ● | ○ | ○ | – | – |
| Publications | ○ | ○ | ● | – | – |
| Research & thesis | ○ | – | ● | – | – |
| Conferences & talks | – | ○ | ● | ○ | ○ |
| Services & rates | – | – | – | ● | ● |
| Case studies | – | ○ | – | ● | ● |
| Testimonials | – | ○ | – | ● | ● |
| Gallery / work samples | ○ | – | – | ● | ● |

**No module is ever deleted from the data model — only from the view.**

### Narrowing by discipline

Within a type, the field set narrows further:

| A… | sees |
|---|---|
| CSE student | Projects · GitHub · Technical skills · Certifications |
| Business student | Business projects · Leadership · Case studies · Marketing skills |
| Researcher | Research · Publications · Thesis · Conferences |
| Designer | Portfolio · Case studies · Gallery · Behance |

This is **one application with a configuration table**, never five applications.

---

## 9. Completeness scoring

The percentage on the dashboard is the single most effective nudge in the product, so it has to be honest and profile-aware. A researcher at 100% with no publications would be a lie.

```ts
// weights sum to 100 per profile type
const WEIGHTS = {
  student:      { basics:15, education:20, skills:15, projects:20,
                  experience:10, achievements:10, certifications:10 },
  professional: { basics:15, experience:30, skills:20, projects:15,
                  education:10, achievements:10 },
  researcher:   { basics:15, education:20, publications:25, research:20,
                  experience:10, conferences:10 },
  freelancer:   { basics:15, services:25, caseStudies:25, skills:15,
                  testimonials:10, projects:10 },
  creative:     { basics:15, projects:25, gallery:20, services:15,
                  caseStudies:15, testimonials:10 },
}

// a module scores partially: 1 entry = 60%, 2 = 85%, 3+ = 100%
// text fields score on length bands, not mere presence
```

**Display rule:** show the score with the two highest-value missing items *named*.

> ✅ "Add one project (+20%)"
> ❌ "Your profile is incomplete"

Example dashboard block:

```
Your Profile — 86% complete

✓ Basic Information      ✓ Education      ✓ Skills      ✓ Projects
○ Experience (+10%)      ○ Certifications (+10%)

[ Add experience ]
```

---

## 10. Guided writing

An empty textarea labelled "About" is where most users abandon. **Forms must never feel like empty forms.** Every meaningful text field carries four supports:

1. **A real placeholder**, written for that profile type —
   *"Example: I am a final-year business student interested in marketing, analytics and digital strategy."*
2. **One line of why** — what this field is used for and where it appears.
3. **Length guidance** as a soft counter — *"40–60 words reads best on a resume."*
4. **AI actions on the field itself** — `Write for me` · `Improve` · `Make professional` · `Shorten` · `Fix grammar`

### Rules that make assistance trustworthy

- Output appears as a diff or side-by-side comparison
- The original is always one click away
- Nothing is saved until the user accepts
- A field the user edited by hand is never regenerated without an explicit request

---

## 11. Navigation

| Mobile (tab bar) | Desktop (sidebar) |
|---|---|
| Home | Overview |
| Build | Profile · Resume · CV · Portfolio |
| Preview | Templates |
| AI | AI Assistant |
| Profile | Analytics · QR · Settings · Subscription |

**New accounts see a reduced sidebar** — Overview, Profile, and the one output they chose in onboarding. The rest unlocks as the profile fills, so a first session never shows twelve destinations.

### Dashboard

Simple and action-oriented. Not a metrics console.

```
Good afternoon 👋
Your profile is 86% complete.

Quick actions
[ Create Resume ]  [ Build Portfolio ]  [ Improve with AI ]  [ Share Profile ]

Your Profile        86% complete
Your Portfolio      Published
Analytics           1,284 views · 83 resume downloads
```

---

## 12. The universal data model

**The single most important rule in the system:**

> User data never knows which template or theme it will be rendered in.

A project row stores a title, a description, dates, links and tags. It does **not** store a font size, a column, or a card style.

```
Universal profile data (PostgreSQL)
        │
        ├──────────────→ Resume / CV engine ──→ Template + section config ──→ A4 PDF
        │                    (same rows)            (order · visibility)      + print view
        │
        └──────────────→ Portfolio engine ────→ Theme + section config ────→ /u/username
                             (same rows)          (layout · type · color)     + QR · OG tags
```

Adding a ninth resume template or a fourth portfolio theme touches **only the config layer**. No user row changes, and no existing document breaks.

In practice a `Resume` row stores:

```json
{
  "templateId": "minimal",
  "config": {
    "sectionOrder": ["summary","education","experience","projects","skills"],
    "hidden": ["achievements"],
    "density": "regular",
    "accent": "#0E5C4A",
    "paper": "A4"
  }
}
```

— pointers and preferences, nothing else. Content is fetched from the profile tables **at render time**, so editing a job title once updates every document that shows it.

Full schema: [03-DATA-MODEL.md](03-DATA-MODEL.md)

---

## 13. Resume & CV engine

One renderer, many templates. The renderer takes profile data + document config and produces HTML styled for **both screen preview and print, from the same stylesheet**.

### Engine capabilities

- Section visibility and drag-to-reorder
- Template switching without data loss
- Typography scale and density controls (three steps, not a free slider)
- Page-break control, orphan and widow avoidance
- A4 and US Letter, correct margins, real print CSS
- One-page mode that **reports what it dropped** rather than silently truncating

### Launch templates

Ship three, genuinely different — not three colour variants.

| Template | Shape | Best for |
|---|---|---|
| **Minimal** | Single column, generous leading | Online applications, ATS-safe |
| **Professional** | Two-column with sidebar for skills and contact | Corporate roles |
| **Modern** | Accent rules, tighter density | Design-adjacent and startup roles |

Later: Academic · Executive · Creative · Elegant · Classic.

### ⚠️ ATS constraint — decide this now

Many employers parse resumes automatically. Those parsers read text order badly from multi-column layouts, ignore text inside images, and mangle icon glyphs used as labels.

- Keep **at least one template strictly single-column**, semantic and icon-free
- Mark it in the UI as *the safe choice for online applications*
- **Never** place critical information (name, contact, job titles) inside a graphic — in any template

### CV ≠ long resume

The CV leads with education and publications, has no one-page constraint, and orders sections by academic convention. Treat it as a **distinct document type sharing the same engine**.

---

## 14. Portfolio engine

A real website without writing anything.

### Sections

Hero · About · Education · Experience · Skills · Projects · Research · Publications · Services · Case studies · Testimonials · Certifications · Achievements · Gallery · Contact · Social links

Every section is **addable, removable, reorderable, editable, hideable** — the same section model as the document engine, rendered by a theme instead of a template.

### Themes change more than colour

A theme defines layout, typographic scale, navigation style, how a project is presented (card / row / full-bleed image), section hierarchy and spacing.

**Categories:** Minimal · Professional · Modern · Creative · Academic · Elegant · Executive

Each profile type gets a recommended theme, pre-selected but changeable.

### Live preview

```
┌──────────────────┬──────────────────────────┐
│     Editor       │      Live Preview        │
│                  │                          │
│ Profile          │      Portfolio           │
│ Education        │      Website             │
│ Experience       │                          │
│ Skills           │                          │
│ Projects         │                          │
└──────────────────┴──────────────────────────┘
```

On mobile this becomes a **Build / Preview toggle**, never a shrunken split view.

Preview renders the **actual public component tree** — never a separate approximation that can drift from what gets published.

---

## 15. PDF and QR

PDF quality is what makes the product feel professional, and it is the piece most likely to be underestimated.

Headless Chromium printing the same HTML the user previewed gives near-perfect fidelity — but **it does not fit comfortably inside a standard serverless function**.

```
  Next.js app                    Render service                 Object storage
   (Vercel)                 (Chromium · Fly.io/Railway)            (R2 / S3)
      │                                │                               │
      │ ── POST /render {docId, token} →│                               │
      │ ←─ GET /print/[docId] → HTML ───│                               │
      │                                │ ──────── PDF upload ─────────→ │
      │ ←──────────── signed URL, 5-minute expiry ─────────────────────│
```

### ⚠️ Why not Puppeteer inside the app

- A bundled Chromium is far larger than a typical serverless function size limit
- Cold starts are slow
- A busy render can exceed the execution timeout on a hobby plan
- Minimal-Chromium workarounds are fragile and break on runtime upgrades

**Budget a separate render service from day one.** It is a few hours of setup and removes an entire class of production incidents. A hosted rendering API is an acceptable stand-in for the beta if speed matters more than cost.

### PDF requirements

A4 support · correct page breaks · high-quality typography · consistent margins · print-friendly design · selectable text (never an image of a page)

### QR codes

Generate from the public profile URL server-side, cache by URL, offer:

- **PNG** for screens and print
- **SVG** for scaling
- A print-ready version with quiet-zone margins

Uses: resume header, business card, event badge, email signature, social media, printed materials.

---

## 16. Public profile and privacy

Every user can claim `nextprofile.app/u/username`.

Usernames are unique, immutable for 30 days after a change, and checked against a reserved list (`admin`, `api`, `u`, `login`, `settings`, `about`, `pricing`, and every top-level route).

### Visibility states

| State | Who can see it | Ships in |
|---|---|---|
| **Private** | The owner only. **Default for every new account** | MVP |
| **Public** | Anyone with the link; indexed if the user allows it | MVP |
| **Unlisted** | Anyone with the link; excluded from sitemap and robots | v2 |
| **Recruiter view** | Link holders who enter an email; contact revealed on request | v4 |

### Contact rules

Contact fields are **individually toggled and default to hidden**. Phone numbers and street-level location are never published without an explicit, per-field opt-in. The publish dialog states plainly what will become visible **before** the button is pressed.

---

## 17. Analytics and SEO

Analytics exist to answer one question for the user: **is this working?** Report career-meaningful numbers, not web-developer metrics.

| Event | Surfaced as |
|---|---|
| `profile_view` | Portfolio views · unique visitors · 30-day trend |
| `project_view` | Which of your projects gets the most attention |
| `resume_download` | Resume downloads |
| `contact_click` | Contact clicks |
| `link_click` | GitHub / LinkedIn / Behance clicks, where present |

```
Portfolio Views       1,284
Unique Visitors         742
Resume Downloads         83
Project Views           391
Contact Clicks           42
```

**Privacy posture:** store a hashed visitor identifier with a **rotating daily salt**, no raw IP addresses, coarse country only. Collect what the feature needs and nothing more. This is career data — the privacy posture is part of the product's credibility.

### SEO

- Server-render every public profile
- Per-profile title and description generated from headline + about
- Open Graph image rendered from the profile (name, headline, photo)
- Canonical URLs, sitemap containing **public profiles only**, robots configuration
- `Person` structured data
- **Editable meta title and description** — several users will want to rank for their own name

---

## 18. AI layer

The AI has one job: **turn what the user can say into what an employer expects to read — without inventing anything they did not say.**

### Build order

| # | Feature | Input | Ships |
|---|---|---|---|
| 1 | About Me generator | Profile type, goal, education, skills | **MVP** |
| 2 | Project description generator | One rough sentence + tags | v2 |
| 3 | Experience improver | The user's own bullet text | v2 |
| 4 | Grammar & tone fixer | Any text field | v2 |
| 5 | Resume optimiser | Whole document + target role | v3 |
| 6 | Job match score | Profile + pasted job description | v3 |
| 7 | Skill gap analysis | Profile + role or job description | v3 |
| 8 | Career suggestions | Whole profile | v4 |

### Context envelope

Every call assembles the same envelope, so quality improvements apply everywhere at once:

```
Profile type + Discipline + Career goal
      + Education + Experience + Skills + Projects
      + The specific text being improved
      + Constraints (length, tone, person)
```

### Example — About Me generator

**Input**
```
Profile type: Student
Field:        Business
Goal:         Internship
Skills:       Marketing, Excel
```
**Output:** a professional, role-appropriate summary in 40–60 words, first person, no invented employers or metrics.

The same system must produce **different writing styles for different professions**. A researcher's summary and a creative's summary should not read the same.

### Example — Job matching

```
User profile + Job description
        ↓
   AI analysis
        ↓
Match score · Strengths · Missing skills · Recommendations
```

```
Job Match: 87%

Strong areas          Needs improvement       Recommendations
✓ Communication       • Data analysis         • Highlight leadership experience
✓ Leadership          • Excel                 • Add a relevant project
✓ Project management                          • Improve the resume summary
```

Always framed as **guidance**. Never state or imply a hiring probability. Say plainly that the score reflects overlap with the posted text, not a decision by any employer.

### Non-negotiable rules

- **No invented facts.** The model may rephrase, reorder and emphasise. It may **not** add an employer, technology, metric or date the user did not provide.
- **Structured output.** Parse JSON, validate with a schema, fail to a friendly message rather than rendering broken text.
- **Never silently overwrite.** Suggestions land in a review state; the user accepts or discards.
- **Log every request** (task, tokens, latency, accepted/discarded) — that log is both the cost control and the quality dataset.
- **The builder stays usable when the AI is down.**

Full specification: [04-AI-SPEC.md](04-AI-SPEC.md)

---

## 19. Technology

| Layer | Choice | Why this one |
|---|---|---|
| Framework | **Next.js** (App Router) | SSR for public profiles and SEO; API routes remove the need for a separate backend at this scale |
| Language | **TypeScript** | The data model *is* the product; types keep the engines honest |
| UI | **Tailwind + shadcn/ui + Lucide** | Owned components, no runtime vendor dependency |
| Animation | **Motion** | Used sparingly, for feedback not decoration |
| Forms | **React Hook Form + Zod** | One schema validates the form *and* the API route |
| Database | **PostgreSQL** (Neon / Supabase) | Relational, with JSON where it earns its place |
| ORM | **Prisma** | Migrations and typed queries; pooled connection string in serverless |
| Auth | **Clerk** (MVP) or Auth.js | Managed saves a week now; Auth.js is cheaper forever. **Decide before week 3** |
| AI | Hosted LLM API behind one `lib/ai` module | Never call the provider from a component |
| Storage | **Cloudflare R2 / S3** + image CDN | Signed uploads only |
| PDF | **Headless Chromium on a small always-on container** | See §15 |
| Email | Resend / Postmark | Verification, reset, and later "your profile got 20 views" |
| Charts | Recharts | Analytics dashboard |
| QR | Any server-side QR library | Cache by URL |
| Hosting | Vercel + one container host | Preview deployments per branch |
| Errors | Sentry | You will not be watching logs at 2am during beta |
| Version control | Git + GitHub, `main` / `develop` / `feature/*` / `bugfix/*` | |

For the first production version, Next.js handles the application layer, API routes and server-side operations **without** a separate Express or FastAPI service. The one exception is PDF rendering (§15).

Full detail: [02-ARCHITECTURE.md](02-ARCHITECTURE.md)

---

## 20. Delivery

### MVP scope — the contract

**In:**
Auth · three-question onboarding · universal profile (education, experience, skills, projects, certifications, achievements) · 3 resume templates · 3 portfolio themes · live preview · public profile at `/u/username` · public/private toggle · PDF download · QR code · AI About Me generator · completeness score

**Deliberately out:**
Job matching · ATS checker · skill gap analysis · analytics dashboard · GitHub and LinkedIn import · custom domains · payments · multiple portfolio versions · recruiter view · theme marketplace · university accounts

The MVP's whole purpose is to prove **one** thing: that a non-technical person can get from nothing to a link they are proud to send. Every feature that does not serve that proof waits.

### Build priority

| Priority | Scope |
|---|---|
| **P0 — Core** | Auth · onboarding · universal profile · database · resume engine · portfolio engine · publishing |
| **P1 — Experience** | Live preview · themes · PDF · QR · completeness |
| **P2 — Intelligence** | AI writing · resume optimisation · job matching · skill gap |
| **P3 — Growth** | Analytics · SEO · integrations · custom domains |
| **P4 — Money** | Subscriptions · payments · premium themes · advanced features |

### Twelve weeks to beta

| Week | Focus | Done means |
|---|---|---|
| 1 | Requirements, flows, ERD, decisions | Schema drafted; the four open decisions closed |
| 2 | Design system and key screens | Components built; onboarding, builder, dashboard designed mobile-first |
| 3 | Setup, database, auth | Register, verify, log in, protected routes, deployed preview |
| 4 | Onboarding + profile basics | Three questions stored and driving module visibility |
| 5 | Education, experience, skills | Full CRUD with reordering, on mobile |
| 6 | Projects, certifications, achievements | Image upload working; completeness score live |
| 7 | Resume / CV engine | Three templates rendering real data; section config working |
| 8 | Portfolio engine + themes | Three themes; sections add / remove / reorder / hide |
| 9 | Live preview, publish, public URL | `/u/username` live, SEO tags, privacy toggle |
| 10 | PDF service, QR, AI About Me | Render service deployed; PDF matches preview; quotas enforced |
| 11 | Security, a11y, performance, tests | E2E green; ownership checks audited; Lighthouse pass |
| 12 | Polish, seed content, beta launch | 20–50 real users onboarded, six metrics instrumented |

**Weeks 7 and 10 are the most likely to overrun** — document rendering and PDF infrastructure both hide detail. Protect them by keeping weeks 5 and 6 strictly CRUD.

### After the MVP

| Version | Theme | Adds |
|---|---|---|
| **v2** | Make the writing great | Project generator · experience improver · grammar fixer · GitHub import · analytics · SEO tools · more templates and themes |
| **v3** | Make it targeted | Job matching · ATS checker · job-specific resumes and portfolios · skill gap analysis · multiple portfolio versions · career recommendations |
| **v4** | Make it a business | Custom domains · subscriptions · payments · premium themes · advanced analytics · recruiter view · theme marketplace |

---

## 21. Business

### Plans

| Plan | Includes | What people actually pay for |
|---|---|---|
| **Free** | One profile, 3 templates, 3 themes, PDF with a small footer credit, QR, 15 AI actions/month | — |
| **Pro** | All templates and themes, unlimited projects, 300 AI actions/month, analytics, job matching, no branding, custom domain | Branding removal + job matching |
| **Premium** | Multiple portfolio versions, premium themes, advanced career intelligence, priority features | Freelancers whose portfolio *is* their storefront |

**Do not fix prices in this document.** Price after the beta, from what beta users say they would pay — and expect the answer to differ sharply by region. A plan priced for the US is out of reach for the student market this product starts with. **Plan for regional pricing early**; retrofitting it into a payment integration is painful.

### What each user costs

1. **AI dominates.** A generated About Me is a small call; a job match against a full job description is many times larger. Route cheap tasks to a cheap model, cache aggressively, and quota the free tier — an unquoted free tier is how this category of product dies.
2. **PDF rendering** is a fixed monthly container cost until volume is real. Cache generated PDFs by document hash; most users download the same unchanged resume repeatedly.
3. **Storage and bandwidth** stay small if uploads are re-encoded and served through a CDN. Cap image dimensions on upload.

Track cost per active user in the AI request log **from day one**. You cannot set a price without it.

### First thousand users

A universal product still needs a **specific** first audience. The strongest beachhead: **final-year university students in one country** — urgent deadline (placement season), aggressive peer sharing, and an output that is itself the advertisement.

1. **One campus, one department, one placement season.** Twenty students who publish and get interviews are worth more than a thousand signups.
2. **Work through career offices and club leaders.** Run a workshop: everyone leaves the room with a finished resume and a live link.
3. **Let the footer do the work.** Free profiles carry a small "Built with NextProfile" credit. Every shared link is a channel.
4. **Expand by adjacency, not ambition.** Same campus → other departments → other campuses → early-career professionals → researchers and freelancers. The adaptive profile types are already built for them; marketing follows the product, not ahead of it.

---

## 22. Risks

| Risk | Why it bites | Mitigation |
|---|---|---|
| **Scope sprawl** | Four versions of features exist in this plan; the MVP quietly absorbs them and never ships | The MVP list is a contract. Anything not on it goes to a v2 list without discussion |
| **PDF fidelity** | Preview and PDF drift apart; page breaks land badly; users stop trusting the output | One stylesheet for both; dedicated render service; visual snapshot tests per template |
| **Empty-profile problem** | A new user with nothing entered sees nothing useful and leaves | Pre-fill from onboarding; sample content in preview; first AI action available before the profile is complete |
| **AI cost blow-up** | One abusive or looping user burns a month of budget | Quotas, rate limits, caching, model routing, daily spend alert from week 10 |
| **Template rigidity** | Templates hardcode section assumptions; a researcher's CV cannot render | Templates must render any section set, including empty ones. Test each against all five profile-type fixtures |
| **Generic output** | Every profile looks identical; the credit footer becomes a liability instead of marketing | Themes that differ structurally, not just in colour; accent and type choices exposed to the user |
| **Data trust** | A privacy incident with career data is fatal for a product built on trust | Ownership checks audited in week 11; default private; contact opt-in; hashed analytics |
| **Solo bandwidth** | Twelve weeks assumes uninterrupted focus; life does not | Weeks 7 and 10 are buffer-critical. Cut the third template or theme before cutting the publish flow |

### Decide before week 1

1. **Auth — managed or your own?** Managed costs money per monthly active user but saves a week now. Owning it is cheaper forever and slower today. Either is fine; switching later is not.
2. **Domain and username namespace.** `nextprofile.com` is parked and paid; `.app` and `.io` look open. Pick before publishing anything — the URL shape appears in every PDF, QR code and share link.
3. **Where PDFs render.** Separate container from day one, or a hosted rendering API for the beta. This changes week 10 completely.
4. **First audience.** Name the campus, department and placement season the beta is for. "Everyone" is not a launch plan, even for a universal product.

---

## 23. Ten design rules

These guide every screen.

| # | Rule |
|---|---|
| 1 | Never show unnecessary fields |
| 2 | Never require technical knowledge |
| 3 | Use plain language instead of developer terminology |
| 4 | Give examples for difficult fields |
| 5 | Provide AI help exactly where users need it |
| 6 | Show live previews |
| 7 | Keep optional information optional |
| 8 | Use smart defaults |
| 9 | Make the next action obvious |
| 10 | Never overwhelm new users with advanced features |

---

## The long-term direction

```
Phase 1   Build my profile
   ↓
Phase 2   Build my resume + portfolio
   ↓
Phase 3   Improve my career materials with AI
   ↓
Phase 4   Optimize my profile for jobs
   ↓
Phase 5   Build my professional online identity
```

> **A universal AI-powered career identity platform that helps anyone — regardless of profession, academic background, or technical skill — build, manage, improve and share their professional identity.**

Three ideas make it work: **one universal profile**, **a dynamic experience**, and **a reusable output engine**.
