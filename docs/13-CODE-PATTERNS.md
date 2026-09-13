# NextProfile — Code Patterns

**Version 1.0 · September 2026**

Eight shapes that recur throughout the codebase. Write each one well, once, then reuse it. Every task in [11-IMPLEMENTATION-PLAN](11-IMPLEMENTATION-PLAN.md) that says *"use the pattern"* means one of these.

*Code here is illustrative — adjust to your final library choices. The structure is the part that matters.*

---

## 1. The section CRUD factory

Twelve record types share one shape. Write one handler, configure it twelve times.

```ts
// lib/sections/registry.ts
import { z } from "zod"
import * as S from "@/lib/validation"

export const SECTIONS = {
  education:      { model: "education",     schema: S.educationSchema },
  experience:     { model: "experience",    schema: S.experienceSchema },
  skills:         { model: "skill",         schema: S.skillSchema },
  projects:       { model: "project",       schema: S.projectSchema },
  certifications: { model: "certification", schema: S.certificationSchema },
  achievements:   { model: "achievement",   schema: S.achievementSchema },
  publications:   { model: "publication",   schema: S.publicationSchema },
  research:       { model: "research",      schema: S.researchSchema },
  conferences:    { model: "conference",    schema: S.conferenceSchema },
  services:       { model: "service",       schema: S.serviceSchema },
  "case-studies": { model: "caseStudy",     schema: S.caseStudySchema },
  testimonials:   { model: "testimonial",   schema: S.testimonialSchema },
} as const

export type SectionKey = keyof typeof SECTIONS
```

```ts
// app/api/profile/[section]/route.ts
import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { SECTIONS, type SectionKey } from "@/lib/sections/registry"
import { nextSortOrder } from "@/lib/sort-order"
import { recomputeCompleteness } from "@/lib/completeness"

export async function GET(_: Request, { params }: { params: { section: string } }) {
  const user = await requireUser()
  const cfg = SECTIONS[params.section as SectionKey]
  if (!cfg) return Response.json({ error: { code: "NOT_FOUND" } }, { status: 404 })

  const rows = await (db as any)[cfg.model].findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { sortOrder: "asc" },
  })
  return Response.json(rows)
}

export async function POST(req: Request, { params }: { params: { section: string } }) {
  const user = await requireUser()
  const cfg = SECTIONS[params.section as SectionKey]
  if (!cfg) return Response.json({ error: { code: "NOT_FOUND" } }, { status: 404 })

  const parsed = cfg.schema.safeParse(await req.json())
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    return Response.json(
      { error: { code: "VALIDATION", message: issue.message, field: issue.path.join(".") } },
      { status: 400 },
    )
  }

  const row = await (db as any)[cfg.model].create({
    data: { ...parsed.data, userId: user.id, sortOrder: await nextSortOrder(cfg.model, user.id) },
  })
  await recomputeCompleteness(user.id)
  return Response.json(row, { status: 201 })
}
```

**Adding a thirteenth section later = one registry line + one Zod schema + one row renderer.** Nothing else.

---

## 2. The ownership check

The single most important security pattern in the product.

```ts
// ❌ NEVER — any logged-in user can edit anyone's row
await db.project.update({ where: { id }, data })

// ✅ ALWAYS — compound where; fails if the row is not theirs
await db.project.update({
  where: { id, userId: user.id },
  data,
})
```

Wrap it so it cannot be forgotten:

```ts
// lib/db-helpers.ts
export async function updateOwned<M extends string>(
  model: M, id: string, userId: string, data: unknown,
) {
  try {
    return await (db as any)[model].update({ where: { id, userId }, data })
  } catch {
    throw new AppError("NOT_FOUND", "That item no longer exists.")   // never "FORBIDDEN"
  }
}

export async function softDeleteOwned(model: string, id: string, userId: string) {
  return (db as any)[model].update({
    where: { id, userId },
    data: { deletedAt: new Date() },
  })
}
```

**Return `NOT_FOUND`, never `FORBIDDEN`** — a "forbidden" response confirms the row exists and belongs to someone else.

Every read of user-owned data filters the same way, and every list read adds `deletedAt: null`.

---

## 3. Float `sortOrder` reordering

Reordering writes **one** row, not the whole list.

```ts
// lib/sort-order.ts
const GAP = 1000

export async function nextSortOrder(model: string, userId: string) {
  const last = await (db as any)[model].findFirst({
    where: { userId, deletedAt: null },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  })
  return (last?.sortOrder ?? 0) + GAP
}

/** Midpoint between the neighbours the item was dropped between. */
export function midpoint(before?: number, after?: number) {
  if (before == null && after == null) return GAP
  if (before == null) return after! - GAP
  if (after == null) return before + GAP
  return (before + after) / 2
}
```

```ts
// POST /api/profile/[section]/reorder
const { id, beforeId, afterId } = body
const [before, after] = await Promise.all([
  beforeId ? get(beforeId) : null,
  afterId  ? get(afterId)  : null,
])
await updateOwned(model, id, user.id, {
  sortOrder: midpoint(before?.sortOrder, after?.sortOrder),
})
```

**Renormalise** in a background job when the smallest gap in a list drops below `0.001` — after roughly 50 drags into the same slot. Rare, but it will happen to someone.

---

## 4. Module visibility

The switch that makes one application serve five kinds of user.

```ts
// lib/modules/index.ts
export type Visibility = "default" | "available" | "hidden"

const MATRIX: Record<ProfileType, Record<ModuleKey, Visibility>> = {
  STUDENT: {
    basics: "default", education: "default", skills: "default", projects: "default",
    certifications: "default", achievements: "default", activities: "default",
    experience: "available", publications: "available", research: "available",
    gallery: "available",
    conferences: "hidden", services: "hidden", caseStudies: "hidden", testimonials: "hidden",
  },
  RESEARCHER: {
    basics: "default", education: "default", publications: "default", research: "default",
    conferences: "default", experience: "default", achievements: "default", skills: "default",
    projects: "available", certifications: "available", activities: "available",
    services: "hidden", caseStudies: "hidden", testimonials: "hidden", gallery: "hidden",
  },
  // …PROFESSIONAL, FREELANCER, CREATIVE — mirror the §8 matrix exactly
}

// JOB_SEEKER→PROFESSIONAL, TEACHER→PROFESSIONAL, ENTREPRENEUR→PROFESSIONAL,
// CREATIVE→CREATIVE, OTHER→PROFESSIONAL
export function getModules(type: ProfileType, discipline?: string) {
  const base = MATRIX[normalise(type)]
  return {
    visible:   keysWhere(base, "default"),
    available: keysWhere(base, "available"),
    hidden:    keysWhere(base, "hidden"),
    // discipline refinement: CSE → github field; design → behance field
    fields: FIELD_HINTS[discipline ?? ""] ?? {},
  }
}
```

**Rules**

- A module with data is **always shown**, whatever the matrix says — changing profile type must never hide a user's existing content.
- `hidden` means "not offered up front", never "forbidden". `Add a section` reaches everything.
- This is a pure function. Unit-test it against the matrix; it is the backbone of the adaptive experience.

---

## 5. Completeness scoring

```ts
// lib/completeness/index.ts
const WEIGHTS: Record<ProfileType, Partial<Record<ModuleKey, number>>> = {
  STUDENT:      { basics:15, education:20, skills:15, projects:20, experience:10,
                  achievements:10, certifications:10 },
  PROFESSIONAL: { basics:15, experience:30, skills:20, projects:15, education:10,
                  achievements:10 },
  RESEARCHER:   { basics:15, education:20, publications:25, research:20, experience:10,
                  conferences:10 },
  FREELANCER:   { basics:15, services:25, caseStudies:25, skills:15, testimonials:10,
                  projects:10 },
  CREATIVE:     { basics:15, projects:25, gallery:20, services:15, caseStudies:15,
                  testimonials:10 },
}

const fill = (n: number) => (n === 0 ? 0 : n === 1 ? 0.6 : n === 2 ? 0.85 : 1)

export function score(profile: Profile, counts: Record<ModuleKey, number>) {
  const weights = WEIGHTS[normalise(profile.profileType)]
  let total = 0
  const missing: { key: ModuleKey; label: string; weight: number }[] = []

  for (const [key, weight] of Object.entries(weights) as [ModuleKey, number][]) {
    const ratio = key === "basics" ? basicsRatio(profile) : fill(counts[key] ?? 0)
    total += weight * ratio
    if (ratio < 1) missing.push({ key, label: LABELS[key], weight: weight * (1 - ratio) })
  }

  return {
    score: Math.round(total),
    missing: missing.sort((a, b) => b.weight - a.weight).slice(0, 2),   // name the top two
  }
}
```

Call `recomputeCompleteness(userId)` after every profile write and cache the result on `Profile.completeness`. Never compute it on page load.

**In the UI:** *"Add one project (+20%)"* — never *"Your profile is incomplete."*

---

## 6. The document section resolver

The bridge between stored data and a template. Templates never query the database.

```ts
// components/resume/engine/resolve.ts
export type ResolvedSection =
  | { key: "summary";    data: string }
  | { key: "education";  data: Education[] }
  | { key: "experience"; data: Experience[] }
  | { key: "projects";   data: Project[] }
  | { key: "skills";     data: SkillGroup[] }
  // …

export function resolveSections(profile: FullProfile, config: DocConfig): ResolvedSection[] {
  const order = config.sectionOrder ?? DEFAULT_ORDER[profile.profileType]
  const hidden = new Set(config.hidden ?? [])

  return order
    .filter((key) => !hidden.has(key))
    .map((key) => ({ key, data: SELECTORS[key](profile) }))
    .filter((s) => hasContent(s.data))          // empty sections never reach the template
}
```

```tsx
// every template has this signature — nothing else
export function MinimalTemplate({
  sections, profile, config,
}: { sections: ResolvedSection[]; profile: FullProfile; config: DocConfig }) {
  return (
    <article className="doc doc--minimal" data-density={config.density}>
      <Header profile={profile} />
      {sections.map((s) => <Section key={s.key} {...s} />)}
    </article>
  )
}
```

**The template contract**

- Receives resolved sections; never fetches
- Renders **any** section set, including a set it has never seen
- Never assumes a section exists or comes in a fixed position
- Screen and print styles live in the same stylesheet

---

## 7. Print CSS and the PDF round trip

```css
/* components/resume/engine/print.css — one stylesheet, two media */
@page { size: A4; margin: 18mm 16mm; }
@page :first { margin-top: 16mm; }

.doc[data-paper="LETTER"] { /* @page overridden via a class on <html> at print time */ }

.doc__entry      { break-inside: avoid; }
.doc__section    { break-inside: auto; }
.doc__section h2 { break-after: avoid; }      /* no heading orphaned at a page bottom */
.doc__entry:last-child { margin-bottom: 0; }

@media print {
  .no-print { display: none !important; }
  a { text-decoration: none; color: inherit; }
  .doc__link-url::after { content: " (" attr(href) ")"; font-size: 9pt; }
}
```

```ts
// lib/pdf/token.ts — short-lived HMAC so only the render service can read /print
import { createHmac, timingSafeEqual } from "crypto"

export function signPrintToken(docId: string, ttlSeconds = 60) {
  const exp = Date.now() + ttlSeconds * 1000
  const sig = createHmac("sha256", process.env.PRINT_TOKEN_SECRET!)
    .update(`${docId}.${exp}`).digest("hex")
  return `${exp}.${sig}`
}

export function verifyPrintToken(docId: string, token: string) {
  const [exp, sig] = token.split(".")
  if (!exp || !sig || Number(exp) < Date.now()) return false
  const expected = createHmac("sha256", process.env.PRINT_TOKEN_SECRET!)
    .update(`${docId}.${exp}`).digest("hex")
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
}
```

```ts
// lib/pdf/client.ts — cache by content hash; most downloads are repeats
export async function getPdfUrl(doc: Document, format: "A4" | "LETTER") {
  const hash = sha256([doc.id, doc.updatedAt.toISOString(), doc.templateId,
                       JSON.stringify(doc.config), format].join("|"))

  if (doc.lastPdfHash === hash && doc.lastPdfKey) return signedUrl(doc.lastPdfKey, 300)

  const res = await fetch(`${process.env.RENDER_SERVICE_URL}/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json",
               "X-Render-Secret": process.env.RENDER_SERVICE_SECRET! },
    body: JSON.stringify({ docId: doc.id, token: signPrintToken(doc.id), format }),
  })
  if (!res.ok) throw new AppError("PROVIDER_ERROR", "Couldn't build the PDF just now.")

  const { key } = await res.json()
  await db.document.update({ where: { id: doc.id, userId: doc.userId },
                             data: { lastPdfKey: key, lastPdfHash: hash } })
  return signedUrl(key, 300)
}
```

**Container check:** install the template fonts in the render service image. A missing font falls back silently and the PDF looks subtly wrong — verify the first PDF of every template by eye.

---

## 8. The AI call

```ts
// lib/ai/envelope.ts — built SERVER-SIDE from the database, never sent by the client
export async function buildEnvelope(userId: string, task: AITask, input?: AIInput) {
  const profile = await loadProfile(userId)
  return {
    task,
    profileType: profile.profileType,
    discipline:  profile.discipline ?? undefined,
    careerGoal:  profile.careerGoal,
    locale: "en",
    facts: trimFacts(profile, task),          // only the sections this task needs
    userText: input?.text,
    jobDescription: input?.jobDescription,    // UNTRUSTED — data section only
    constraints: CONSTRAINTS[task],
  }
}
```

```ts
// app/api/ai/[task]/route.ts
export async function POST(req: Request, { params }: { params: { task: AITask } }) {
  const user = await requireUser()

  await rateLimit(`ai:${user.id}`, 20, "1m")
  const quota = await checkQuota(user.id)
  if (!quota.ok) {
    return Response.json(
      { error: { code: "QUOTA_EXCEEDED", message: `You've used your ${quota.limit} AI actions this month.`, resetsAt: quota.resetsAt } },
      { status: 429 },
    )
  }

  const envelope = await buildEnvelope(user.id, params.task, await req.json())

  const cached = await getCached(envelope)
  if (cached) return Response.json(cached)

  const started = Date.now()
  try {
    const raw = await callModel(routeModel(params.task), envelope)   // max_tokens capped
    const result = RESULT_SCHEMAS[params.task].parse(JSON.parse(raw.text))

    await logAI({ userId: user.id, task: params.task, model: raw.model,
                  tokensIn: raw.in, tokensOut: raw.out, ms: Date.now() - started })
    await setCached(envelope, result)
    return Response.json(result)
  } catch {
    return Response.json(
      { error: { code: "PROVIDER_ERROR", message: "Couldn't generate that just now — your text is unchanged." } },
      { status: 502 },
    )
  }
}
```

**Four rules this pattern enforces**

1. The client sends **intent**, never facts — no injected fake history
2. Output is parsed and schema-validated before it reaches the UI
3. Every call is logged — that log is the quota, the cost control and the quality dataset
4. Failure leaves the user's text untouched and says so plainly

**Prompt injection:** `jobDescription` and `userText` come from job boards and strangers. Put them in a clearly delimited data section of the prompt, never in the instruction section, and validate the output schema regardless of what comes back.

---

## Bonus: visitor hashing

Used by `/api/analytics/collect`. No raw IP is ever stored.

```ts
// lib/analytics/visitor.ts
export function visitorHash(ip: string, ua: string) {
  return createHmac("sha256", dailySalt())      // rotated daily by a scheduled job
    .update(`${ip}|${ua}`)
    .digest("hex")
    .slice(0, 32)
}
```

A rotating salt means yesterday's hashes cannot be linked to today's — unique-visitor counts stay accurate within a day, and nobody can be tracked across weeks. That is the trade, and it is the right one for career data.
