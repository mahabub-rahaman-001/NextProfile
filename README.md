# NextProfile

> **Your profile, resume, portfolio, and next opportunity — in one place.**

NextProfile is a full-stack **career identity platform** for students, professionals, researchers, freelancers, and job seekers.

Create your career information once and turn it into a **resume, CV, portfolio website, public profile, PDF, QR business card, private share link, and job-specific application version**.

### One profile in → everything you need out.

**Profile → Resume → CV → Portfolio → Public Profile → PDF → QR**

---

## ✨ Why NextProfile?

People often maintain the same career information across multiple resumes, CVs, portfolios, websites, and job applications.

NextProfile brings that information into one structured profile.

With NextProfile, users can:

* Build and maintain one reusable career profile
* Create multiple resume and CV versions
* Build a personal portfolio website
* Publish a professional public profile
* Export resumes and profiles as PDF
* Generate QR-enabled business cards
* Create private, expiring share links
* Track public profile activity
* Compare a profile against job descriptions
* Review common profile-quality issues
* Track job applications
* Preserve previously submitted resume versions
* Export their stored account data

---

# 🚀 Core Workflow

```text
Create Account
      ↓
Complete Profile
      ↓
Choose Resume / Portfolio
      ↓
Customize
      ↓
Preview
      ↓
Publish / Export
      ↓
Share
      ↓
Track & Improve
```

The user's career information remains independent from the presentation layer, allowing the same data to power multiple resumes, CVs, portfolio themes, and public profiles.

---

# 🎯 Who Is It For?

NextProfile is designed for more than developers or CSE students.

| User Type                  | Example Use                                   |
| -------------------------- | --------------------------------------------- |
| 🎓 Students                | Education, projects, activities, achievements |
| 💼 Professionals           | Experience, skills, achievements              |
| 🔬 Researchers             | Publications, research, conferences           |
| 🎨 Freelancers             | Services, projects, case studies              |
| 🧑‍💻 Developers           | Technical skills, GitHub, projects            |
| 📊 Business Students       | Competitions, clubs, activities               |
| 📣 Marketing Professionals | Campaigns, experience, achievements           |
| 🌐 Job Seekers             | Tailored profiles and application resumes     |

The platform adapts to the user's background instead of forcing every user into the same profile structure.

---

# ⭐ Features

## 👤 Profile Builder

Create one structured source of career information.

### Profile Sections

* Personal information
* Education
* Experience
* Projects
* Skills
* Achievements
* Certifications
* Publications
* Research
* Conferences
* Services
* Case studies
* Testimonials
* Additional career information

### Profile Management

* Create and edit records
* Reorder sections
* Autosave
* Soft delete
* Undo
* Adaptive modules
* Profile completeness tracking

---

## 📄 Resume & CV Builder

Turn profile data into professional career documents.

### Customization

* Multiple templates
* Section ordering
* Section visibility
* Content density
* Accent customization
* A4 / Letter paper sizes
* Live preview

### Current Templates

* Minimal
* Professional
* Modern

The **Minimal** template is structured with ATS-friendly document formatting in mind.

---

## 🌐 Portfolio Builder

Create a personal portfolio without building a website manually.

NextProfile currently includes **10 structurally different portfolio themes**:

1. Minimal
2. Professional
3. Modern
4. Editorial
5. Terminal
6. Cards
7. Sidebar
8. Timeline
9. Gallery
10. Classic

Users can control:

* Theme
* Section order
* Section visibility
* Public information
* Contact visibility

---

## 🌍 Public Career Profile

Publish a professional profile using a username-based URL.

```text
/view/yourusername
```

Public profiles support:

* Server-rendered content
* SEO metadata
* Sitemap integration
* Robots configuration
* Contact visibility controls
* Last-updated information
* Abuse reporting

Profiles are **private by default** and only become public when the user publishes them.

---

## 🔗 Private Share Links

Share a profile privately without publishing it publicly.

Private links support:

* Tokenized access
* Expiration
* Revocation
* View counting
* No search indexing

This is useful for sharing profiles with recruiters, clients, interviewers, collaborators, or other specific recipients.

---

## 📊 Analytics

Understand how public profiles are being viewed.

Analytics currently support:

* Profile visits
* Visitor activity
* Daily activity
* Share-link views

The visitor system uses a **daily-rotating visitor hash** rather than storing raw IP addresses.

---

## 🤖 AI Career Infrastructure

NextProfile includes an AI-ready architecture for future and optional AI-powered career features.

The current AI layer includes:

* Structured AI envelope
* Prompt contracts
* Input/output validation
* Usage quotas
* Review-before-save workflow

The application can run without an AI API key.

Live AI functionality requires an `LLM_API_KEY`.

---

## 🎯 Job Matching

Paste a job description and compare it with the user's profile.

The current deterministic matching engine can identify:

* Overlapping terms
* Matched terms
* Missing terms
* Relevant profile information
* Suggestions
* Match/overlap score

No AI model is required for the current implementation.

---

## 📝 Profile Review

The profile review system identifies common career-document issues.

Current checks include:

* Bullets without measurable figures
* Duty-style bullet openers
* Undated positions
* Unreachable contact information
* Other rule-based content issues

The purpose is to help users review their profile before using or sharing it.

---

## 📌 Applications Tracker

Track job applications directly from NextProfile.

Application records include:

* Company
* Role
* Application status
* Match score
* Submitted resume

The application can preserve the exact resume version that was submitted.

---

## 🕘 Version History

Career documents change over time.

NextProfile preserves document snapshots so previously submitted versions can be reproduced.

Snapshots can preserve:

* Resume content
* Layout
* Template configuration
* Submission-specific presentation

Restoring a version restores the document's presentation configuration without replacing the user's underlying profile data.

---

## 🔐 Authentication & Security

NextProfile includes application-level authentication and security controls.

### Authentication

* Registration
* Login
* Logout
* Protected routes
* Password hashing
* Signed sessions
* Password reset
* Session invalidation
* Change password

### Security Controls

* User-scoped mutations
* HMAC-protected print access
* Tokenized private links
* Rate limiting
* Abuse reporting
* Admin authorization
* Secure password reset tokens

---

## 👑 Admin Dashboard

The platform includes an admin area for platform-level management.

Administrators can:

* View platform statistics
* Search users
* Suspend users
* Restore users
* Unpublish profiles
* Manage roles
* Review abuse reports

Non-admin users are blocked from admin routes.

---

# 📌 Feature Status

The following status describes the **actual current MVP implementation**, not the future product roadmap.

| Feature                           | Status                               | Current State                                                                              |
| --------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| **Authentication**                | 🟢 Complete                          | Registration, login, logout, protected routes, signed sessions, bcrypt password hashing    |
| **User Onboarding**               | 🟢 Complete                          | Three-question onboarding flow with basic profile setup                                    |
| **Profile Builder**               | 🟢 Complete                          | 12 sections with CRUD, autosave, reordering, soft delete and undo                          |
| **Adaptive Profile Modules**      | 🟢 Complete                          | Profile type controls module visibility; populated sections remain visible                 |
| **Profile Completeness**          | 🟢 Complete                          | Weighted scoring based on profile type with missing-item suggestions                       |
| **Resume Builder**                | 🟢 Complete                          | Section resolver, ordering, visibility, density, accent, paper size and preview            |
| **Resume Templates**              | 🟢 Complete                          | Minimal, Professional and Modern                                                           |
| **CV Generation**                 | 🟢 Complete                          | CV documents generated from structured profile data                                        |
| **PDF Export**                    | 🟢 Complete                          | Chromium-based A4/Letter PDF generation with multi-page support                            |
| **Portfolio Builder**             | 🟢 Complete                          | Theme, section ordering, visibility and preview                                            |
| **Portfolio Themes**              | 🟢 Complete                          | 10 structurally different themes                                                           |
| **Public Profile**                | 🟢 Complete                          | Username-based public profile with server rendering and SEO metadata                       |
| **Profile Publishing**            | 🟢 Complete                          | Username claiming, reserved-word protection and private-by-default publishing              |
| **Field-Level Privacy**           | 🟢 Complete                          | Individual contact-information visibility controls                                         |
| **Private Share Links**           | 🟢 Complete                          | Tokenized, expiring, revocable and view-counted                                            |
| **Profile Analytics**             | 🟢 Complete                          | Event collection with daily-rotating visitor hashes                                        |
| **QR Code**                       | 🟢 Complete                          | PNG and SVG QR codes for public profiles                                                   |
| **Embed Card**                    | 🟢 Complete                          | iframe profile card with copyable embed snippet                                            |
| **Business Card PDF**             | 🟢 Complete                          | 85 × 55 mm PDF with QR-linked profile                                                      |
| **Job Matching**                  | 🟢 Complete                          | Deterministic matching with overlap score, matched terms and missing terms                 |
| **Profile Review**                | 🟢 Complete                          | Rule-based profile-quality checks                                                          |
| **Applications Tracker**          | 🟢 Complete                          | Company, role, status, match score and submitted-resume snapshot                           |
| **Version History**               | 🟢 Complete                          | Snapshots preserving document content and layout                                           |
| **Version Restore**               | 🟢 Complete                          | Restores document presentation configuration                                               |
| **Data Export**                   | 🟢 Complete                          | Account-wide JSON export                                                                   |
| **Peer Comparison**               | 🟢 Complete                          | Aggregate completeness percentile by profile type                                          |
| **Trust Indicators**              | 🟢 Complete                          | Last-updated information and abuse reporting                                               |
| **Password Reset**                | 🟡 Functional / Deployment Required  | Reset flow is implemented; email delivery is not yet connected                             |
| **Change Password**               | 🟢 Complete                          | Authenticated password-change flow                                                         |
| **Admin Dashboard**               | 🟢 Complete                          | Statistics, users, moderation, roles and abuse reports                                     |
| **Admin Access Control**          | 🟢 Complete                          | Admin-only route protection                                                                |
| **Rate Limiting**                 | 🟡 Functional / Deployment Dependent | Implemented for key endpoints; shared storage is recommended for multi-instance deployment |
| **AI Infrastructure**             | 🟡 Functional / Optional             | AI envelope, prompt contract, quota and review workflow are implemented                    |
| **Live AI Generation**            | 🟡 Optional                          | Requires an external LLM provider and `LLM_API_KEY`                                        |
| **Production PDF Render Service** | 🟡 Deployment Required               | Local Chromium works; production should use a dedicated render service                     |
| **Email Delivery**                | 🔴 Not Implemented                   | No production email provider integration                                                   |
| **Image Uploads**                 | 🔴 Not Implemented                   | No production object-storage upload pipeline                                               |
| **Google Sign-In**                | 🔴 Not Implemented                   | Google OAuth is not integrated                                                             |
| **ATS Checker**                   | 🔴 Not Implemented                   | Dedicated ATS analysis is not available                                                    |
| **Skill Gap Analysis**            | 🔴 Not Implemented                   | Dedicated skill-gap engine is not available                                                |
| **Payments / Billing**            | 🔴 Not Implemented                   | No subscription or payment system                                                          |
| **Custom Domains**                | 🔴 Not Implemented                   | Custom domain mapping is not available                                                     |

### Status Legend

* 🟢 **Complete** — Implemented and usable in the current MVP.
* 🟡 **Functional / Optional / Deployment Required** — Core functionality exists but requires external configuration, a provider, or deployment infrastructure.
* 🔴 **Not Implemented** — Not currently available in the application.

---

# 🏗️ Architecture

NextProfile follows a **data-first architecture**.

### Core principle

> **Career data should not know how it will be presented.**

User profile data is stored independently from resume templates and portfolio themes.

```text
                    ┌────────────────────┐
                    │    User Profile    │
                    │                    │
                    │ Education          │
                    │ Experience         │
                    │ Skills             │
                    │ Projects           │
                    │ Achievements       │
                    │ Publications       │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼────────────────┐
              ↓               ↓                ↓
       ┌────────────┐  ┌────────────┐  ┌──────────────┐
       │   Resume   │  │ Portfolio  │  │    Public    │
       │  Templates │  │   Themes   │  │    Profile   │
       └────────────┘  └────────────┘  └──────────────┘
              │               │                │
              ↓               ↓                ↓
            PDF            Website           Share
```

A new resume template or portfolio theme can therefore be added without changing the underlying profile data model.

---

# 🛠️ Technology Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Backend

* Next.js Server Actions
* Next.js API Routes
* Node.js
* Zod

## Database

* PostgreSQL
* Prisma ORM

## Authentication

* Custom session-based authentication
* bcrypt
* HMAC-signed session cookies

## Document Rendering

* Chromium
* Server-side PDF rendering

## Testing

* TypeScript type checking
* Unit tests
* End-to-end tests

---

# 📁 Project Structure

```text
nextprofile/
│
├── app/
│   ├── (marketing)/        # Landing and marketing pages
│   ├── (auth)/             # Authentication pages
│   ├── onboarding/         # User onboarding
│   ├── dashboard/          # Main application
│   ├── u/[username]/       # Public profiles
│   ├── print/[docId]/      # Print/PDF rendering
│   ├── api/                # API endpoints
│   └── actions/            # Server actions
│
├── components/
│   ├── ui/                 # UI primitives
│   ├── forms/              # Shared form components
│   ├── profile/            # Profile builder
│   ├── resume/             # Resume engine and templates
│   └── portfolio/          # Portfolio engine and themes
│
├── lib/
│   ├── modules/            # Adaptive profile modules
│   ├── completeness/       # Completeness scoring
│   ├── validation/         # Shared validation schemas
│   ├── sections/           # Profile section registry
│   ├── ai/                 # AI infrastructure
│   ├── pdf/                # PDF rendering
│   ├── analytics/          # Analytics and visitor hashing
│   └── auth/               # Authentication layer
│
├── prisma/
│   └── schema.prisma       # Database schema
│
├── tests/                  # Automated tests
├── public/                 # Static assets
├── .env.example            # Environment template
├── package.json
└── README.md
```

---

# ⚙️ Getting Started

## Requirements

Install the following before running the project:

* Node.js
* pnpm
* PostgreSQL 14+
* Git
* Chromium or Google Chrome for local PDF rendering

---

## 1. Clone the repository

```bash
git clone https://github.com/mahabub-rahaman-001/NextProfile.git
cd NextProfile
```

## 2. Install dependencies

```bash
pnpm install
```

## 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Minimum required configuration:

```env
DATABASE_URL=
DIRECT_DATABASE_URL=
AUTH_SECRET=
PRINT_TOKEN_SECRET=
```

Generate a secure authentication secret:

```bash
openssl rand -base64 32
```

---

## 4. Set up the database

Run Prisma migrations:

```bash
pnpm prisma migrate dev
```

Seed the database:

```bash
pnpm db:seed
```

---

## 5. Start the application

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Demo Accounts

The seed command creates five different career profiles for testing.

| Email                               | Profile Type           |
| ----------------------------------- | ---------------------- |
| `student.cse@nextprofile.test`      | CSE Student            |
| `student.business@nextprofile.test` | Business Student       |
| `professional@nextprofile.test`     | Marketing Professional |
| `researcher@nextprofile.test`       | Researcher             |
| `freelancer@nextprofile.test`       | Product Designer       |

**Password for all demo accounts:**

```text
demo1234
```

The profiles intentionally contain different career-data structures so the adaptive modules, resume templates, portfolio themes, and document generation can be tested across different user types.

---

# 📜 Available Commands

```bash
# Development
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Type checking
pnpm typecheck

# Unit tests
pnpm test

# Seed demo data
pnpm db:seed

# Open Prisma Studio
pnpm db:studio
```

### End-to-End Tests

A running server and Chromium installation are required.

```bash
CHROMIUM_PATH=/path/to/chrome node tests/e2e/signup-flow.mjs

CHROMIUM_PATH=/path/to/chrome node tests/e2e/release2.mjs

CHROMIUM_PATH=/path/to/chrome node tests/e2e/admin-and-reset.mjs
```

---

# 🔒 Production Checklist

Before deploying NextProfile:

* [ ] Configure production PostgreSQL
* [ ] Set a strong `AUTH_SECRET`
* [ ] Set a strong `PRINT_TOKEN_SECRET`
* [ ] Set `ANALYTICS_SALT`
* [ ] Keep development reset-link display disabled
* [ ] Configure real email delivery
* [ ] Configure a production PDF render service
* [ ] Use shared rate-limit storage for multiple application instances
* [ ] Create the first admin account securely
* [ ] Verify all production environment variables
* [ ] Run the full test suite
* [ ] Verify public-profile visibility controls
* [ ] Verify HTTPS and secure cookies
* [ ] Review authentication and authorization behavior before launch

---

# 🧭 Product Philosophy

NextProfile is built around a simple principle:

> **Your career information should belong to you — not to a particular resume template.**

Instead of creating a completely new document every time an opportunity appears, users maintain one structured career identity and generate the presentation they need.

```text
ONE PROFILE
     │
     ├── Resume
     ├── CV
     ├── Portfolio
     ├── Public Profile
     ├── PDF
     ├── QR Business Card
     ├── Private Share Link
     └── Job Application Version
```

The long-term vision is to make NextProfile a flexible **career identity layer** that can adapt to different professions, opportunities, and stages of a person's career.

---

# 🤝 Contributing

Contributions are welcome.

To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking and tests
5. Commit your changes
6. Open a pull request

When adding features, keep the separation between **career data** and **presentation** intact.

---

# 📄 License

This project is currently maintained as a working MVP.

A project-specific open-source or proprietary license should be added before public distribution.

---

<div align="center">

### NextProfile

**One profile. Every professional format. One place to grow your career.**

</div>
