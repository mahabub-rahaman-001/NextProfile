# NextProfile — Roadmap

**Version 1.0 · September 2026**

---

## 1. Build priority

```
P0 — Core product
     Authentication · Onboarding · Universal profile · Database
     Resume engine · Portfolio engine · Publishing

P1 — User experience
     Live preview · Themes · PDF · QR · Profile completion

P2 — Intelligence
     AI writing · AI optimization · Job matching · Skill gap analysis

P3 — Growth
     Analytics · SEO · Integrations · Custom domains

P4 — Monetization
     Subscriptions · Payments · Premium themes · Advanced features
```

Nothing from P2 ships before P0 and P1 are stable — except the single AI About Me generator, which is in the MVP because it is the feature that gets a blank profile unstuck.

---

## 2. MVP scope — this is a contract

### Ships

| Area | Included |
|---|---|
| Accounts | Email + Google sign-in, verification, password reset |
| Onboarding | Three questions + basics, mobile-complete in 90 seconds |
| Profile | Education · Experience · Skills · Projects · Certifications · Achievements |
| Adaptivity | Module visibility by profile type; recommended template and theme |
| Documents | 3 resume templates (one ATS-safe), section order + visibility, A4/Letter |
| Portfolio | 3 themes, section add/remove/reorder/hide, live preview |
| Publishing | `/u/username`, private by default, per-field contact visibility |
| Output | PDF download, QR code (PNG + SVG) |
| AI | About Me generator with quota, review-before-save |
| Guidance | Profile completeness score with named next steps |

### Deliberately excluded

Job matching · ATS checker · skill gap analysis · analytics dashboard · GitHub and LinkedIn import · custom domains · payments · multiple portfolio versions · recruiter view · theme marketplace · university accounts · resume import from PDF · multi-language UI

**The MVP proves one thing:** a non-technical person can get from nothing to a link they are proud to send. Anything that does not serve that proof waits.

---

## 3. Twelve weeks to beta

| Week | Focus | Done means | Risk |
|---|---|---|---|
| **1** | Requirements, flows, ERD, decisions | Schema drafted; the four open decisions closed; Figma sitemap | Low |
| **2** | Design system + key screens | Components built; onboarding, builder, dashboard designed at 375px first | Low |
| **3** | Setup, database, auth | Register → verify → log in → protected route, deployed preview | Medium |
| **4** | Onboarding + profile basics | Three questions stored and driving module visibility | Low |
| **5** | Education, experience, skills | Full CRUD with drag-reorder, working on a phone | Medium |
| **6** | Projects, certifications, achievements | Image upload pipeline live; completeness score live | Medium |
| **7** | Resume / CV engine | 3 templates rendering real data; section config; print CSS | **High** |
| **8** | Portfolio engine + themes | 3 themes; sections add/remove/reorder/hide | High |
| **9** | Live preview, publish, public URL | `/u/username` live, SEO tags, privacy toggle, revalidation | Medium |
| **10** | PDF service, QR, AI About Me | Render service deployed; PDF matches preview; quotas enforced | **High** |
| **11** | Security, a11y, performance, tests | E2E green; ownership audit; Lighthouse pass; visual snapshots | Medium |
| **12** | Polish, seed, beta launch | 20–50 real users onboarded; six metrics instrumented | Medium |

### Protecting the two high-risk weeks

Weeks **7** (document rendering) and **10** (PDF infrastructure) both hide detail that only appears once real data meets real page breaks.

- Keep weeks 5 and 6 strictly CRUD — no "while I'm here" refactors
- Stand the render service up in week 3 as a hello-world, so week 10 is only the integration
- If a week slips: **cut the third template or the third theme, never the publish flow**

---

## 4. Weekly definition of done

Every week ends with:

- [ ] Merged to `develop` and deployed to a preview URL
- [ ] Works at 375px width
- [ ] Keyboard-operable, with focus states
- [ ] Ownership check on every new mutation
- [ ] No secret in the client bundle
- [ ] A test for whatever broke that week

---

## 5. After the MVP

### Version 2 — make the writing great

```
✓ AI project description generator
✓ AI experience improver
✓ Grammar & tone fixer
✓ GitHub integration (import repos as projects)
✓ Analytics dashboard
✓ SEO controls
✓ More resume templates (Academic, Executive)
✓ More portfolio themes (Creative, Academic)
✓ Unlisted visibility
✓ Weekly "your profile got N views" email
```

### Version 3 — make it targeted

```
✓ Job matching (paste a job description → score, strengths, gaps)
✓ ATS-friendliness checker
✓ Job-specific resume variants
✓ Job-specific portfolio views
✓ Skill gap analysis
✓ Multiple portfolio versions
✓ Career recommendations
```

### Version 4 — make it a business

```
✓ Subscriptions and payments (with regional pricing)
✓ Custom domains
✓ Premium themes
✓ Advanced analytics
✓ Recruiter view
✓ Advanced career AI
✓ Theme marketplace
```

---

## 6. Product evolution

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

The MVP delivers phases 1 and 2 and the first taste of 3. Phases 4 and 5 are what make it a platform rather than a builder — and they are only worth building once phase 1 has real users with real records in it.

---

## 7. Gate before each version

Do not start the next version until the previous one clears its gate.

| Gate | Requires |
|---|---|
| **MVP → v2** | ≥ 35% signup-to-publish, ≥ 25% week-4 return, and 10 users who say they would be upset if it disappeared |
| **v2 → v3** | AI acceptance ≥ 60%, and profile updates (not just creations) happening weekly |
| **v3 → v4** | A clear signal on what people would pay for — from usage, not from surveys |

Shipping v4 into a product nobody returns to is the most expensive mistake available here.
