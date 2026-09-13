# NextProfile — Architecture

**Version 1.0 · September 2026**

---

## 1. System overview

```
                        ┌──────────────────────────────┐
                        │        Browser / PWA         │
                        │  Next.js App Router (React)  │
                        └──────────────┬───────────────┘
                                       │
                        ┌──────────────▼───────────────┐
                        │      Next.js on Vercel       │
                        │  Server Components · Actions │
                        │  API Routes · Middleware     │
                        └───┬───────┬───────┬──────┬───┘
                            │       │       │      │
              ┌─────────────┘       │       │      └──────────────┐
              │                     │       │                     │
      ┌───────▼────────┐   ┌────────▼───┐  ┌▼─────────────┐  ┌───▼──────────┐
      │  PostgreSQL    │   │  LLM API   │  │  R2 / S3     │  │ Render svc   │
      │  (Neon/Supa)   │   │  lib/ai    │  │  + image CDN │  │  Chromium    │
      │  via Prisma    │   │            │  │              │  │  (Fly.io)    │
      └────────────────┘   └────────────┘  └──────────────┘  └──────────────┘
              │                                                      │
              │                                                      │
        Profile data                                            PDF output
        Documents                                               → R2 → signed URL
        Analytics
        Subscriptions
```

**Everything is one Next.js application** except the PDF render service. There is no separate Express or FastAPI backend — it would add deployment surface without buying anything at this scale.

---

## 2. Why each piece

| Layer | Choice | Reasoning |
|---|---|---|
| Framework | Next.js (App Router) | Public profiles must be server-rendered for SEO and speed. Server Actions cover mutations; API routes cover webhooks and the render callback. |
| Language | TypeScript, `strict: true` | The data model *is* the product. Types are the cheapest defence against engine bugs. |
| Styling | Tailwind CSS | Utility classes keep the design system and the print stylesheet in the same vocabulary. |
| Components | shadcn/ui | Copied into the repo, not installed — no upstream breakage, full control over a11y details. |
| Icons | Lucide | Consistent, tree-shaken. **Never used as the only label on a resume template** (ATS). |
| Forms | React Hook Form + Zod | One Zod schema validates client form *and* server route. |
| Database | PostgreSQL (Neon or Supabase) | Relational data with real constraints. Serverless-friendly pooling is non-negotiable with Vercel. |
| ORM | Prisma | Typed queries, first-class migrations. Use the pooled connection string in the app and the direct URL for migrations. |
| Auth | Clerk **or** Auth.js | See the decision in [09](09-RISKS-DECISIONS.md). Wrap whichever in `lib/auth` so features never import the vendor directly. |
| AI | One hosted LLM API behind `lib/ai` | Provider swappable; model routing in one place; every call logged. |
| Storage | Cloudflare R2 or S3 + image CDN | Signed direct uploads, server-side re-encode. |
| PDF | Headless Chromium on a small always-on container | See §5. |
| Email | Resend or Postmark | Verification, reset, weekly view digests later. |
| Errors | Sentry | Source-mapped, with a release per deploy. |
| Analytics | Own events table | Career metrics, not page analytics. No third-party tracker on public profiles. |

---

## 3. Project structure

```
app/
├── (marketing)/
│   ├── page.tsx                  # landing
│   ├── pricing/
│   └── about/
│
├── (auth)/
│   ├── login/
│   ├── register/
│   ├── verify/
│   └── forgot-password/
│
├── onboarding/
│   ├── page.tsx                  # 3 questions
│   └── basics/
│
├── dashboard/
│   ├── layout.tsx                # sidebar + auth guard
│   ├── overview/
│   ├── profile/
│   │   ├── basics/  education/  experience/  skills/
│   │   ├── projects/  certifications/  achievements/
│   │   └── research/  publications/  services/
│   ├── resume/[docId]/
│   ├── cv/[docId]/
│   ├── portfolio/
│   ├── ai/
│   ├── analytics/
│   ├── qr/
│   ├── templates/
│   ├── settings/
│   └── subscription/
│
├── u/[username]/                 # PUBLIC — server rendered, cached
│   ├── page.tsx
│   └── opengraph-image.tsx
│
├── print/[docId]/                # print-only HTML, token-gated
│   └── page.tsx
│
└── api/
    ├── profile/[...]/route.ts
    ├── documents/[...]/route.ts
    ├── ai/[task]/route.ts
    ├── upload/sign/route.ts
    ├── analytics/collect/route.ts
    ├── render/callback/route.ts
    └── webhooks/payments/route.ts

components/
├── ui/               # shadcn primitives
├── dashboard/        # shell, sidebar, quick actions, completeness
├── forms/            # field wrappers, AI action bar, repeatable list editor
├── profile/          # module editors
├── resume/
│   ├── engine/       # section resolver, page breaker
│   └── templates/    # minimal/ professional/ modern/
├── portfolio/
│   ├── engine/
│   └── themes/       # minimal/ professional/ modern/
├── ai/               # suggestion review UI, diff view
└── analytics/

lib/
├── db.ts             # Prisma singleton
├── auth/             # vendor wrapper: getSession, requireUser
├── ai/               # envelope builder, model router, schemas, logging
├── pdf/              # render service client, caching by doc hash
├── qr/
├── storage/          # signed uploads, re-encode
├── analytics/        # event writer, visitor hashing
├── completeness/     # weights + scorer
├── modules/          # profile-type → module visibility config
└── validation/       # Zod schemas shared by forms and routes

prisma/
├── schema.prisma
└── migrations/

tests/
├── unit/
├── integration/
└── e2e/
```

---

## 4. Rendering strategy

| Route group | Strategy | Why |
|---|---|---|
| `(marketing)` | Static | Never changes per request |
| `(auth)` | Dynamic | Forms and redirects |
| `onboarding`, `dashboard/*` | Dynamic, authenticated | Per-user data, never cached |
| `u/[username]` | **Static with on-demand revalidation** | A viral profile must cost nothing to serve. `revalidatePath` on publish and on profile save |
| `print/[docId]` | Dynamic, token-gated | Only the render service calls it |
| `api/*` | Dynamic | |

**Public profile caching rule:** publish → revalidate. Profile edits by a user with a published profile also revalidate, debounced to at most once a minute.

---

## 5. The PDF render service

The only component outside the Next.js app.

```
Next.js app (Vercel)          Render service (Fly.io/Railway)        R2 / S3
       │                                   │                            │
       │ POST /render {docId, token}       │                            │
       │ ─────────────────────────────────▶│                            │
       │                                   │ GET /print/[docId]?token   │
       │ ◀─────────────────────────────────│                            │
       │ HTML + CSS (same components)      │                            │
       │                                   │ Chromium → page.pdf()      │
       │                                   │ ──────── upload ──────────▶│
       │ ◀──── {key} ──────────────────────│                            │
       │                                                                 │
       │ signed URL (5-minute expiry) ──────────────────────────────────▶ user
```

### Why not inside the app

- A bundled Chromium exceeds typical serverless function size limits
- Cold start latency is unacceptable for a user waiting on a download
- Render can exceed the execution timeout under load
- Minimal-Chromium workarounds break on runtime upgrades

### Service contract

```
POST /render
  body:  { docId: string, token: string, format: "A4" | "Letter" }
  →      { key: string, bytes: number, ms: number }

Auth:    shared secret header + a per-request token the app signs
         (HMAC of docId + expiry, verified by /print)
Timeout: 30s hard
Concurrency: queue of 2 per container; scale horizontally
```

### Caching

Key generated PDFs by `hash(docId + updatedAt + templateId + config)`. Most downloads are the same unchanged resume; a cache hit costs nothing.

---

## 6. Data flow: one profile, many outputs

```
                    ┌─────────────────────┐
                    │  Profile tables     │   education, experience, skills,
                    │  (PostgreSQL)       │   projects, publications, services…
                    └──────────┬──────────┘
                               │ fetched at render time
              ┌────────────────┴────────────────┐
              ▼                                 ▼
   ┌──────────────────────┐          ┌──────────────────────┐
   │  Resume engine       │          │  Portfolio engine    │
   │  + Resume.config     │          │  + Portfolio.config  │
   └──────────┬───────────┘          └──────────┬───────────┘
              ▼                                 ▼
   ┌──────────────────────┐          ┌──────────────────────┐
   │ Template component   │          │ Theme component      │
   │ minimal/professional │          │ minimal/professional │
   │ /modern              │          │ /modern              │
   └──────────┬───────────┘          └──────────┬───────────┘
              ▼                                 ▼
        preview + PDF                     /u/username + OG
```

**Invariant:** no profile table stores presentation. No template stores content. New templates and themes are pure additions.

---

## 7. Security

| Area | Requirement |
|---|---|
| **Authorization** | Every query filtered by session user id. Check ownership on the **row**, not just the route. This is the most likely serious bug in the product — audit it explicitly in week 11. |
| **Input validation** | Zod on every route and server action. Reject unknown keys. |
| **Rate limiting** | Auth routes (per IP), AI routes (per user *and* per IP), upload signing, analytics collection. |
| **File uploads** | Signed direct-to-storage uploads. Validate MIME and magic bytes, cap size, re-encode images server-side, strip EXIF. Never serve user files from the app origin. |
| **XSS** | React escapes by default. If rich text is ever added, sanitise on write **and** on render. |
| **CSRF** | Server Actions carry built-in protection; any cookie-authenticated API route needs an explicit check. |
| **Secrets** | Server-side only — LLM key, database URL, auth secret, payment secret, storage credentials, render service secret. Add a CI check that fails the build if a secret name appears in a client chunk. |
| **Headers** | HSTS, `X-Content-Type-Options`, a Content-Security-Policy, and `X-Frame-Options: DENY` on dashboard routes. |
| **Data** | Encryption at rest (managed by the database provider), TLS in transit, least-privilege database role, automated backups with a tested restore. |
| **Privacy** | Private by default. Contact fields opt-in per field. Hashed visitor analytics with a rotating salt. Account deletion removes rows and uploads. |

---

## 8. Accessibility

- Every control keyboard-reachable with a visible focus state
- Real `<label>` for every input; errors linked with `aria-describedby` and announced
- Contrast ≥ 4.5:1 for body text in **both** themes, including generated portfolio themes
- Touch targets ≥ 44px
- Semantic headings in published portfolios — this is the user's reputation, not just ours
- `prefers-reduced-motion` respected in every animation

---

## 9. Performance

| Target | Value |
|---|---|
| Public profile LCP | < 2.0s on a mid-range phone over 4G |
| Dashboard first interaction | < 3.0s |
| PDF generation (p95) | < 10s |
| Live preview update | < 500ms after a keystroke pause |

**Techniques:** static public pages with on-demand revalidation · `next/image` with explicit dimensions and modern formats · subset, preloaded fonts · minimal client JS on public pages (most themes need none) · indexed and paginated queries · debounced autosave · optimistic UI on list reordering.

---

## 10. Testing

| Level | Covers |
|---|---|
| **Unit** | Zod schemas · completeness scoring · section ordering · template config resolution · AI response parsing · date formatting |
| **Integration** | Auth flows · **ownership checks** · document create + render · AI route with a mocked provider · upload pipeline · publish + revalidate |
| **E2E** (every deploy) | register → onboarding → education + experience + project → AI About Me → template → preview → publish → open `/u/username` in a clean session → download PDF → generate QR |
| **Visual** | Snapshot each resume template and portfolio theme against five profile-type fixtures. Template regressions are invisible in code review and obvious to a user. |

---

## 11. Environments & deployment

| Environment | Where | Database | Notes |
|---|---|---|---|
| Local | `next dev` | Local Postgres or a Neon branch | Seed script with five fixture profiles |
| Preview | Vercel per branch | Neon branch per PR | Real render service, sandbox keys |
| Production | Vercel | Neon/Supabase primary | Backups on, Sentry release tagging |

**Branching:** `main` (production) ← `develop` (integration) ← `feature/*`, `bugfix/*`.
Migrations run in CI before the deploy promotes. Never edit a shipped migration.

---

## 12. Observability

- **Sentry** for errors, with release tags per deploy
- **Structured logs** on AI calls: task, model, tokens in/out, latency, accepted
- **Daily spend alert** on AI usage from week 10
- **Uptime check** on `/u/` of a known public profile and on the render service health endpoint
- **The six product metrics** from the plan, queried from the events table — not a third-party product analytics tool on public pages
