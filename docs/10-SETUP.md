# NextProfile — Setup Guide

**Version 1.0 · September 2026**

Everything needed to go from an empty folder to a running development environment, plus the conventions the repo follows.

---

## 1. Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20 LTS or newer |
| pnpm | 9+ (or npm — pick one and commit the lockfile) |
| PostgreSQL | 16+ locally, or a hosted branch database |
| Git | any recent |

---

## 2. Create the project

```bash
pnpm create next-app@latest nextprofile --typescript --tailwind --eslint --app --src-dir=false
cd nextprofile

# UI
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input textarea select checkbox switch \
  dialog sheet tabs dropdown-menu tooltip toast badge avatar progress skeleton
pnpm add lucide-react motion

# data
pnpm add @prisma/client
pnpm add -D prisma
pnpm prisma init

# forms + validation
pnpm add react-hook-form zod @hookform/resolvers

# utilities
pnpm add qrcode date-fns
pnpm add -D @types/qrcode prettier prettier-plugin-tailwindcss

# tests
pnpm add -D vitest @testing-library/react @playwright/test
```

---

## 3. Environment variables

`.env.local` — **never committed**. Keep `.env.example` in the repo with the same keys and empty values.

```bash
# ---------- database ----------
DATABASE_URL="postgresql://...?pgbouncer=true"   # pooled, used by the app
DIRECT_DATABASE_URL="postgresql://..."           # direct, used by migrations

# ---------- auth ----------
AUTH_SECRET=""                 # openssl rand -base64 32
# if using a managed provider:
AUTH_PROVIDER_PUBLIC_KEY=""    # the only auth value that may reach the client
AUTH_PROVIDER_SECRET_KEY=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ---------- AI ----------
LLM_API_KEY=""
LLM_MODEL_FAST="…"             # grammar, shortening
LLM_MODEL_STRONG="…"           # generation, job matching
AI_ENABLED="true"              # kill switch — disables AI without a deploy

# ---------- storage ----------
STORAGE_ENDPOINT=""
STORAGE_BUCKET=""
STORAGE_ACCESS_KEY=""
STORAGE_SECRET_KEY=""
NEXT_PUBLIC_CDN_URL=""         # public by design

# ---------- PDF render service ----------
RENDER_SERVICE_URL=""
RENDER_SERVICE_SECRET=""       # shared secret header
PRINT_TOKEN_SECRET=""          # HMAC key for /print tokens

# ---------- email ----------
EMAIL_API_KEY=""
EMAIL_FROM="hello@nextprofile.app"

# ---------- analytics ----------
ANALYTICS_SALT=""              # rotated daily by a scheduled job

# ---------- app ----------
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SENTRY_DSN=""
```

### The one rule about secrets

**Only `NEXT_PUBLIC_*` variables may reach the browser.** Everything else is server-only. Add a CI step that greps the client bundle for secret key names and fails the build on a hit.

---

## 4. Database

```bash
# after editing prisma/schema.prisma
pnpm prisma migrate dev --name init
pnpm prisma generate

# seed the five fixture profiles used by visual tests
pnpm prisma db seed
```

`prisma/seed.ts` creates: `student-cse` · `student-business` · `professional-marketing` · `researcher-bio` · `freelancer-design`. Every template and theme must render all five.

**Prisma singleton** (`lib/db.ts`) — required, or dev hot-reload opens a new connection on every save:

```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
export const db = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db
```

---

## 5. Commands

```bash
pnpm dev              # http://localhost:3000
pnpm build            # production build
pnpm lint
pnpm typecheck        # tsc --noEmit
pnpm test             # vitest unit + integration
pnpm test:e2e         # playwright
pnpm prisma studio    # inspect the database
```

---

## 6. Git workflow

```
main        production — protected, deploys live
develop     integration — deploys to staging
feature/*   one feature, branched from develop
bugfix/*    one fix
```

**Commits:** `type(scope): message` — `feat(resume): add section reordering`, `fix(pdf): avoid orphaned headings`.

**Pull requests must pass:** lint · typecheck · unit tests · build. Every PR gets a Vercel preview with its own database branch.

**Never edit a migration that has shipped.**

---

## 7. Render service

A separate, minimal repo or folder. Stand it up in **week 3** as hello-world so week 10 is only integration.

```js
// server.js — Node + Express + Puppeteer, deployed as a container
import express from "express"
import puppeteer from "puppeteer"

const app = express()
app.use(express.json())

let browser
const getBrowser = async () =>
  (browser ??= await puppeteer.launch({ args: ["--no-sandbox"] }))

app.get("/health", (_, res) => res.send("ok"))

app.post("/render", async (req, res) => {
  if (req.get("X-Render-Secret") !== process.env.RENDER_SECRET)
    return res.status(401).json({ error: "unauthorized" })

  const { docId, token, format = "A4" } = req.body
  const page = await (await getBrowser()).newPage()
  try {
    await page.goto(`${process.env.APP_URL}/print/${docId}?token=${token}`, {
      waitUntil: "networkidle0", timeout: 25_000,
    })
    const pdf = await page.pdf({ format, printBackground: true })
    // upload to object storage, return the key
    res.json({ key: await upload(pdf, docId) })
  } catch (e) {
    res.status(500).json({ error: "render_failed" })
  } finally {
    await page.close()
  }
})

app.listen(process.env.PORT || 8080)
```

Deploy to Fly.io or Railway. One small always-on instance is enough for the beta. Keep concurrency at 2 per container and scale horizontally.

---

## 8. Deployment checklist

Before the first production deploy:

- [ ] All environment variables set in the hosting dashboard
- [ ] Database backups enabled and **one restore tested**
- [ ] Migrations run in CI before the deploy promotes
- [ ] Render service deployed with its health check monitored
- [ ] Sentry receiving events, tagged with the release
- [ ] `robots.txt` disallows `/dashboard`, `/print`, `/api`
- [ ] Sitemap contains public profiles only
- [ ] Rate limits live on auth, AI and upload routes
- [ ] No secret name appears in any client bundle
- [ ] Ownership checks audited on every mutation
- [ ] E2E flow green against the production build
- [ ] Custom domain on HTTPS with HSTS

---

## 9. First week, concretely

| Day | Do |
|---|---|
| 1 | Close the four decisions in [09-RISKS-DECISIONS](09-RISKS-DECISIONS.md#2-decide-before-week-1). Buy the domain. |
| 2 | Write `schema.prisma` from [03-DATA-MODEL](03-DATA-MODEL.md). Run the first migration. |
| 3 | Write the seed script with all five fixture profiles. |
| 4 | Write the Zod schemas in `lib/validation` — they are the shared contract between forms, routes and the database. |
| 5 | Write `lib/modules` (profile type → visible modules) and `lib/completeness` (the scorer). Unit-test both. They are pure functions and the whole adaptive experience depends on them. |

By the end of week 1, no UI exists — and the hardest parts of the product are already decided and tested.
