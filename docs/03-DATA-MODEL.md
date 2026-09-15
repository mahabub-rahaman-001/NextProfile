# NextProfile — Data Model

**Version 1.0 · September 2026**

---

## 1. The rule that governs everything

> **User data never knows which template or theme it will be rendered in.**

A `Project` row stores a title, a description, dates, links and tags. It does **not** store a font size, a column position, or a card style. Presentation lives in exactly two places: `Resume.config` and `Portfolio.config`.

Consequences:

- A ninth resume template ships without a migration
- Changing a job title once updates every document that shows it
- Changing profile type re-runs module visibility without touching stored rows
- A user's data survives every redesign of the product

---

## 2. Entity relationships

```
User ──1:1── Profile
  │
  ├──1:N── Education
  ├──1:N── Experience
  ├──1:N── Skill
  ├──1:N── Project
  ├──1:N── Certification
  ├──1:N── Achievement
  ├──1:N── Publication
  ├──1:N── Research
  ├──1:N── Conference
  ├──1:N── Service
  ├──1:N── CaseStudy
  ├──1:N── Testimonial
  │
  ├──1:N── Document      (RESUME | CV)   → templateId + config
  ├──1:1── Portfolio                     → themeId   + config
  │
  ├──1:N── AIRequest
  ├──1:N── AnalyticsEvent
  ├──1:1── Subscription
  └──1:N── CustomDomain
```

Every content table is a **child of User**, carries a `sortOrder`, and is soft-deletable.

---

## 3. Prisma schema

```prisma
// ---------------------------------------------------------------
// NextProfile — schema.prisma
// ---------------------------------------------------------------

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")        // pooled
  directUrl = env("DIRECT_DATABASE_URL") // migrations
}

// ============================= ACCOUNT =============================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  username      String?   @unique          // claimed at publish time
  plan          Plan      @default(FREE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  profile         Profile?
  educations      Education[]
  experiences     Experience[]
  skills          Skill[]
  projects        Project[]
  certifications  Certification[]
  achievements    Achievement[]
  publications    Publication[]
  researches      Research[]
  conferences     Conference[]
  services        Service[]
  caseStudies     CaseStudy[]
  testimonials    Testimonial[]
  documents       Document[]
  portfolio       Portfolio?
  aiRequests      AIRequest[]
  events          AnalyticsEvent[]
  subscription    Subscription?
  domains         CustomDomain[]

  @@index([username])
}

enum Plan { FREE PRO PREMIUM }

// ============================= PROFILE =============================

model Profile {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // onboarding answers — ordinary fields, editable any time
  profileType ProfileType @default(STUDENT)
  discipline  String?                       // "business", "cse", "law", "design"…
  careerGoal  CareerGoal  @default(FIND_JOB)
  wants       String[]    @default([])      // ["resume","portfolio"]

  // universal fields
  fullName  String
  headline  String?
  about     String?   @db.Text
  photoUrl  String?
  location  String?
  languages String[]  @default([])

  // { email, phone, showEmail, showPhone, showLocation }
  contact Json @default("{}")
  // { website, github, linkedin, behance, dribbble, scholar, x, custom[] }
  links   Json @default("{}")
  // { metaTitle, metaDescription, allowIndexing }
  seo     Json @default("{}")

  visibility Visibility @default(PRIVATE)
  publishedAt DateTime?

  completeness Int      @default(0)   // cached score, recomputed on write
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum ProfileType {
  STUDENT
  JOB_SEEKER
  PROFESSIONAL
  FREELANCER
  RESEARCHER
  TEACHER
  CREATIVE
  ENTREPRENEUR
  OTHER
}

enum CareerGoal {
  INTERNSHIP
  FIND_JOB
  HIGHER_STUDY
  FREELANCE_CLIENTS
  BUILD_PORTFOLIO
  PROFESSIONAL_PRESENCE
  PROMOTE_SERVICES
  PERSONAL_BRAND
}

enum Visibility { PRIVATE PUBLIC UNLISTED RECRUITER }

// ============================= RECORD TABLES =============================

model Education {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  institution String
  degree      String?
  field       String?
  startDate   DateTime?
  endDate     DateTime?
  current     Boolean   @default(false)
  grade       String?             // "3.72 / 4.00" — free text, formats vary worldwide
  details     String?   @db.Text
  sortOrder   Float     @default(0)
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, deletedAt])
}

model Experience {
  id           String    @id @default(cuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  company      String
  role         String
  employment   String?             // full-time, part-time, internship, contract, volunteer
  location     String?
  startDate    DateTime?
  endDate      DateTime?
  current      Boolean   @default(false)
  summary      String?   @db.Text
  bullets      String[]  @default([])
  sortOrder    Float     @default(0)
  deletedAt    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([userId, deletedAt])
}

model Skill {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  category  String?             // "Technical", "Languages", "Tools", "Soft skills"
  level     Int?                // 1–5, optional; never shown on ATS-safe templates
  sortOrder Float     @default(0)
  deletedAt DateTime?

  @@index([userId, deletedAt])
}

model Project {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  summary     String?              // one line, used on the resume
  description String?   @db.Text   // long form, used on the portfolio
  role        String?
  outcome     String?              // impact / result
  tags        String[]  @default([]) // tools, technologies, methods
  links       Json      @default("{}") // { live, repo, caseStudy, video }
  images      Json      @default("[]") // [{ url, alt, width, height }]
  startDate   DateTime?
  endDate     DateTime?
  featured    Boolean   @default(false)
  sortOrder   Float     @default(0)
  deletedAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, deletedAt])
  @@index([userId, featured])
}

model Certification {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name          String
  issuer        String?
  issueDate     DateTime?
  expiryDate    DateTime?
  credentialId  String?
  credentialUrl String?
  sortOrder     Float     @default(0)
  deletedAt     DateTime?

  @@index([userId, deletedAt])
}

model Achievement {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  issuer      String?
  date        DateTime?
  description String?   @db.Text
  kind        String?             // award, competition, scholarship, volunteering, club
  sortOrder   Float     @default(0)
  deletedAt   DateTime?

  @@index([userId, deletedAt])
}

model Publication {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  authors   String[]  @default([])
  venue     String?             // journal or conference
  year      Int?
  type      String?             // journal, conference, preprint, chapter, thesis
  doi       String?
  url       String?
  citation  String?   @db.Text  // user-pasted formatted citation, used verbatim if present
  sortOrder Float     @default(0)
  deletedAt DateTime?

  @@index([userId, deletedAt])
}

model Research {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  supervisor  String?
  institution String?
  abstract    String?   @db.Text
  status      String?             // ongoing, completed, submitted
  startDate   DateTime?
  endDate     DateTime?
  sortOrder   Float     @default(0)
  deletedAt   DateTime?

  @@index([userId, deletedAt])
}

model Conference {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  event     String?
  role      String?             // speaker, poster, attendee, panelist
  location  String?
  date      DateTime?
  url       String?
  sortOrder Float     @default(0)
  deletedAt DateTime?

  @@index([userId, deletedAt])
}

model Service {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  description String?   @db.Text
  priceNote   String?             // "from $300" — free text, never a number field
  deliverable String?
  sortOrder   Float     @default(0)
  deletedAt   DateTime?

  @@index([userId, deletedAt])
}

model CaseStudy {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  client    String?
  problem   String?   @db.Text
  approach  String?   @db.Text
  outcome   String?   @db.Text
  images    Json      @default("[]")
  url       String?
  sortOrder Float     @default(0)
  deletedAt DateTime?

  @@index([userId, deletedAt])
}

model Testimonial {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  quote     String    @db.Text
  author    String
  role      String?
  company   String?
  avatarUrl String?
  sortOrder Float     @default(0)
  deletedAt DateTime?

  @@index([userId, deletedAt])
}

// ============================= PRESENTATION =============================
// The ONLY place presentation is stored.

model Document {
  id         String    @id @default(cuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  kind       DocKind   @default(RESUME)
  name       String    @default("My Resume")
  templateId String    @default("minimal")

  // {
  //   sectionOrder: ["summary","education","experience","projects","skills"],
  //   hidden: ["achievements"],
  //   density: "regular" | "compact" | "spacious",
  //   accent: "#0E5C4A",
  //   paper: "A4" | "LETTER",
  //   onePage: false,
  //   targetRole: null            // set for job-specific variants (v3)
  // }
  config Json @default("{}")

  lastPdfKey  String?
  lastPdfHash String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

enum DocKind { RESUME CV }

model Portfolio {
  id      String @id @default(cuid())
  userId  String @unique
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  themeId String @default("minimal")

  // {
  //   sections: [{ id:"hero", visible:true }, { id:"projects", visible:true }, …],
  //   accent: "#0E5C4A",
  //   font: "sans" | "serif",
  //   heroStyle: "centered" | "split",
  //   showContactForm: false
  // }
  config Json @default("{}")

  published   Boolean   @default(false)
  publishedAt DateTime?
  updatedAt   DateTime  @updatedAt
}

// ============================= OPERATIONS =============================

model AIRequest {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  task      String            // about_me, improve_experience, job_match…
  model     String
  tokensIn  Int      @default(0)
  tokensOut Int      @default(0)
  ms        Int      @default(0)
  cached    Boolean  @default(false)
  accepted  Boolean?          // null = still in review
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
  @@index([createdAt])
}

model AnalyticsEvent {
  id            String   @id @default(cuid())
  userId        String            // the profile OWNER, not the visitor
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type          String            // profile_view, project_view, resume_download…
  targetId      String?           // project id, document id
  visitorHash   String            // hash(ip + ua + daily salt) — never a raw IP
  country       String?           // coarse only
  referrerHost  String?
  createdAt     DateTime @default(now())

  @@index([userId, type, createdAt])
  @@index([userId, createdAt])
}

model Subscription {
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan             Plan     @default(FREE)
  status           String   @default("active")
  provider         String?
  providerRef      String?
  currentPeriodEnd DateTime?
  updatedAt        DateTime @updatedAt
}

model CustomDomain {
  id         String    @id @default(cuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  domain     String    @unique
  verified   Boolean   @default(false)
  verifiedAt DateTime?
  lastCheck  DateTime?
  createdAt  DateTime  @default(now())

  @@index([userId])
}
```

---

## 4. Conventions that matter

| Convention | Why |
|---|---|
| **`sortOrder` is a `Float`** | Reordering writes **one** row (midpoint between neighbours) instead of renumbering the whole list. Renormalise in a background job when gaps get small. |
| **Soft delete (`deletedAt`)** | People delete a job and want it back. Every read filters `deletedAt: null`. Purge after 30 days. |
| **`userId` indexed everywhere** | Every query is scoped by user. This is both the performance rule and the security rule. |
| **`grade` and `priceNote` are strings** | GPA scales and currencies differ worldwide. A numeric field forces a wrong assumption. |
| **JSON only for genuinely shapeless data** | `links`, `images`, `config`, `contact`. Everything queryable stays a column. |
| **Every JSON field has a Zod schema** | JSON in the database is not an excuse for unvalidated shapes. Validate at the application boundary, both directions. |
| **`completeness` is cached** | Recomputed on every profile write, not on every dashboard load. |
| **`Document` replaces `Resume`** | One table, `kind: RESUME | CV`. They share an engine; separating them would duplicate every query. |

---

## 5. Key queries

**Public profile page** — one round trip, only visible sections:

```ts
const data = await db.user.findUnique({
  where: { username },
  select: {
    profile: true,
    portfolio: true,
    educations:   { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
    experiences:  { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
    skills:       { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
    projects:     { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } },
    // …only the section types the portfolio config marks visible
  },
})
if (!data?.profile || data.profile.visibility === "PRIVATE") notFound()
```

**Ownership check** — the pattern every mutation uses:

```ts
// ❌ never: where: { id }
// ✅ always:
await db.project.update({
  where: { id, userId: session.userId },   // compound — fails if not the owner
  data,
})
```

**AI quota** — counted from the log, not a counter field:

```ts
const used = await db.aIRequest.count({
  where: { userId, cached: false, createdAt: { gte: startOfMonth } },
})
```

---

## 6. Seed fixtures

Ship five seed profiles — one per profile type — and use them for visual snapshot tests of **every** template and theme:

| Fixture | Exercises |
|---|---|
| `student-cse` | Thin experience, many projects, GitHub links, certifications |
| `student-business` | Clubs, competitions, leadership, no technical tags |
| `professional-marketing` | Long experience, achievement bullets, no education detail |
| `researcher-bio` | Publications, thesis, conferences, long CV, multi-page |
| `freelancer-design` | Services, case studies, testimonials, image-heavy gallery |

A template that cannot render all five is not finished.

---

## 7. Migration discipline

- Never edit a migration that has shipped
- Additive first: add a column, backfill, then switch reads, then drop the old one
- Every migration runs in CI against a branch database before production promotion
- Back up before any destructive migration, and test the restore once before beta
