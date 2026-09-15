# NextProfile — Product Requirements Document

**Version 1.0 · September 2026**

Every requirement has an ID, a priority and an acceptance criterion. If it cannot be tested, it is not a requirement — it is an opinion, and it belongs in [00-PRODUCT-PLAN.md](00-PRODUCT-PLAN.md).

**Priorities:** `P0` MVP blocker · `P1` MVP if time allows · `P2` v2 · `P3` v3+

---

## 1. Accounts & authentication

| ID | Requirement | Pri | Acceptance criterion |
|---|---|---|---|
| AUTH-01 | Register with email and password | P0 | Account created, verification email sent within 30s |
| AUTH-02 | Register / log in with Google | P0 | Name and photo pre-filled into the profile from the OAuth claims |
| AUTH-03 | Email verification | P0 | Unverified accounts cannot publish a public profile |
| AUTH-04 | Log in, log out, session persistence | P0 | Session survives a browser restart for 30 days |
| AUTH-05 | Password reset by emailed link | P0 | Link is single-use and expires in 1 hour |
| AUTH-06 | Protected routes | P0 | Any `/dashboard/*` request without a session redirects to login |
| AUTH-07 | Account deletion | P1 | All profile rows and uploads removed within 30 days; public URL 404s immediately |
| AUTH-08 | Change email | P2 | Requires verification of the new address |

---

## 2. Onboarding

| ID | Requirement | Pri | Acceptance criterion |
|---|---|---|---|
| ONB-01 | Ask profile type | P0 | Stored on the profile, editable later in Settings |
| ONB-02 | Ask career goal | P0 | Stored; drives completeness weighting |
| ONB-03 | Ask desired output(s) | P0 | Multi-select with one primary; determines the post-onboarding landing page |
| ONB-04 | Collect basic information | P0 | Name and headline required; everything else optional |
| ONB-05 | Onboarding completable on a 375px-wide screen | P0 | No horizontal scroll, no field cut off |
| ONB-06 | Skippable and resumable | P1 | Leaving mid-way and returning restores the last answered step |
| ONB-07 | Changing profile type later re-runs module selection | P1 | No stored data is deleted or altered by the change |
| ONB-08 | Whole flow completes in under 90 seconds | P0 | Measured on a mid-range phone, excluding typing |

---

## 3. Profile builder

| ID | Requirement | Pri | Acceptance criterion |
|---|---|---|---|
| PRF-01 | Universal fields: name, photo, headline, location, email, phone, about, languages, links, website | P0 | All save independently; no full-form submit required |
| PRF-02 | Education CRUD | P0 | Add, edit, delete, reorder; current-study checkbox disables the end date |
| PRF-03 | Experience CRUD with bullet points | P0 | Bullets are individually editable; reorderable |
| PRF-04 | Skills CRUD with category and optional level | P0 | Grouped by category in output |
| PRF-05 | Projects CRUD with links, tags, images | P0 | At least 3 images per project; featured flag |
| PRF-06 | Certifications CRUD | P0 | Issuer, date, credential URL |
| PRF-07 | Achievements CRUD | P0 | Title, issuer, date, description |
| PRF-08 | Publications CRUD | P1 | Authors, venue, year, DOI/URL; formatted per academic convention in the CV |
| PRF-09 | Research & thesis CRUD | P1 | Title, supervisor, abstract, status |
| PRF-10 | Conferences & talks CRUD | P2 | |
| PRF-11 | Services CRUD | P2 | Title, description, optional price range |
| PRF-12 | Case studies CRUD | P2 | Problem, approach, outcome, media |
| PRF-13 | Testimonials CRUD | P2 | Quote, author, role, organisation |
| PRF-14 | Modules shown / hidden by profile type per the §8 matrix | P0 | A freelancer never sees "Clubs" by default; a student never sees "Rates" |
| PRF-15 | Hidden modules reachable via "Add a section" | P0 | Any user can opt into any module |
| PRF-16 | Drag-to-reorder every repeatable list | P0 | Works with touch; order persists |
| PRF-17 | Soft delete with undo | P1 | Deleted entry restorable for 30 days |
| PRF-18 | Autosave | P0 | No explicit save button on field edits; a visible "Saved" state |
| PRF-19 | Photo upload with crop | P0 | Max 5MB in, re-encoded server-side, square crop, CDN-served |
| PRF-20 | Profile completeness score | P0 | Profile-type-weighted; names the two highest-value missing items |

---

## 4. Guided input & AI

| ID | Requirement | Pri | Acceptance criterion |
|---|---|---|---|
| AI-01 | Every major text field has a profile-type-specific placeholder | P0 | A business student and a researcher see different examples |
| AI-02 | Length guidance on summary-type fields | P0 | Soft counter, never a hard block |
| AI-03 | AI About Me generator | P0 | Produces 40–60 words using only stored facts |
| AI-04 | AI output shown for review, never auto-saved | P0 | Accept / discard required; original recoverable |
| AI-05 | AI must not invent facts | P0 | Adversarial test set: no output contains an employer, tool, metric or date absent from the input |
| AI-06 | Tone varies by profile type | P0 | Same facts, different profile type → measurably different output |
| AI-07 | Free-tier AI quota enforced server-side | P0 | 15 actions/month; remaining count visible before the limit is reached |
| AI-08 | AI failure degrades gracefully | P0 | Timeout at 20s, one retry, plain message, field untouched |
| AI-09 | Project description generator | P2 | One rough sentence → title, description, features, contribution, tools, outcome |
| AI-10 | Experience improver | P2 | Preserves meaning; active voice; no new facts |
| AI-11 | Grammar & tone fixer | P2 | |
| AI-12 | Resume optimiser against a target role | P3 | |
| AI-13 | Job match score with strengths, gaps, recommendations | P3 | Always labelled as guidance, never as a hiring prediction |
| AI-14 | Skill gap analysis | P3 | Existing strengths, missing skills, suggested learning, portfolio improvements |
| AI-15 | Every AI call logged with tokens, latency, accepted/discarded | P0 | Queryable per user and per day |

---

## 5. Resume & CV

| ID | Requirement | Pri | Acceptance criterion |
|---|---|---|---|
| DOC-01 | Create multiple documents per user | P0 | Each has its own name, template and config |
| DOC-02 | Three launch templates: Minimal, Professional, Modern | P0 | Structurally different, not colour variants |
| DOC-03 | One template is strictly single-column and ATS-safe | P0 | No icons as labels, no text in images, linear DOM order |
| DOC-04 | Switch template without data loss | P0 | Section config preserved where sections exist in both |
| DOC-05 | Section visibility toggles | P0 | Hiding a section never deletes data |
| DOC-06 | Section reordering | P0 | Persists per document |
| DOC-07 | Density / typography scale, 3 steps | P1 | Regular, compact, spacious |
| DOC-08 | A4 and US Letter | P0 | Correct physical dimensions in the PDF |
| DOC-09 | Page-break control, no orphaned headings | P0 | A section heading never sits alone at the bottom of a page |
| DOC-10 | CV document type with academic ordering | P1 | Education and publications lead; no one-page constraint |
| DOC-11 | One-page mode reports what it dropped | P2 | Named list of hidden content, not silent truncation |
| DOC-12 | Templates render any section set, including empty | P0 | All five profile-type fixtures render without layout break |
| DOC-13 | Job-specific resume variants | P3 | |

---

## 6. Portfolio

| ID | Requirement | Pri | Acceptance criterion |
|---|---|---|---|
| PORT-01 | Three launch themes | P0 | Differ in layout, type and project presentation — not only colour |
| PORT-02 | Sections addable, removable, reorderable, editable, hideable | P0 | Persists; reflected in preview immediately |
| PORT-03 | Theme recommended by profile type, changeable | P0 | Pre-selected, never forced |
| PORT-04 | Live preview beside the editor on desktop | P0 | Updates within 500ms of a change |
| PORT-05 | Build / Preview toggle on mobile | P0 | Not a scaled-down split view |
| PORT-06 | Preview renders the real public component tree | P0 | Published output is byte-identical to the preview for the same data |
| PORT-07 | Responsive published portfolio | P0 | No horizontal scroll at 375px |
| PORT-08 | Publish / unpublish | P0 | Unpublishing 404s the public URL within one revalidation cycle |
| PORT-09 | Multiple portfolio versions | P3 | |

---

## 7. Publishing, PDF, QR

| ID | Requirement | Pri | Acceptance criterion |
|---|---|---|---|
| PUB-01 | Claim a unique username | P0 | Reserved words blocked; availability checked live |
| PUB-02 | Public profile at `/u/username` | P0 | Server-rendered, cached, revalidated on publish |
| PUB-03 | Private by default | P0 | A brand-new account's URL 404s until the user publishes |
| PUB-04 | Publish dialog lists exactly what becomes visible | P0 | Contact fields named individually |
| PUB-05 | Per-field contact visibility | P0 | Phone hidden by default even when email is shown |
| PUB-06 | PDF download matching the preview | P0 | Same stylesheet; visual diff under an agreed threshold |
| PUB-07 | PDF text is selectable | P0 | Not a rasterised page |
| PUB-08 | PDF generation completes in under 10s | P0 | 95th percentile |
| PUB-09 | QR code from the public URL, PNG and SVG | P0 | Scans correctly at 2cm printed size |
| PUB-10 | Share buttons and copy-link | P1 | |
| PUB-11 | Open Graph image per profile | P1 | Name, headline, photo |
| PUB-12 | Custom domain | P3 | Verification, DNS guidance, HTTPS, status monitoring |

---

## 8. Analytics & SEO

| ID | Requirement | Pri | Acceptance criterion |
|---|---|---|---|
| ANA-01 | Track `profile_view`, `project_view`, `resume_download`, `contact_click`, `link_click` | P1 | Recorded within 2s of the action |
| ANA-02 | Visitor identity hashed with a daily-rotating salt | P1 | No raw IP stored anywhere |
| ANA-03 | Overview dashboard: views, unique visitors, downloads, 30-day trend | P2 | |
| ANA-04 | Per-project engagement | P2 | |
| SEO-01 | Dynamic meta title and description per profile | P1 | Generated from headline and about |
| SEO-02 | Canonical URL, sitemap of public profiles, robots config | P1 | Private and unlisted profiles excluded |
| SEO-03 | `Person` structured data | P2 | Validates against schema.org |
| SEO-04 | User-editable meta title and description | P2 | |

---

## 9. Cross-cutting requirements

| ID | Requirement | Pri | Acceptance criterion |
|---|---|---|---|
| SEC-01 | Every query scoped to the session user | P0 | Ownership checked on the row, not just the route; audited in week 11 |
| SEC-02 | Zod validation on every input | P0 | Invalid payloads rejected with a field-level message |
| SEC-03 | Rate limits on auth, AI and upload routes | P0 | |
| SEC-04 | Signed uploads, type and size validated, images re-encoded | P0 | An uploaded `.svg` or `.html` can never be served from the profile origin |
| SEC-05 | No secret reachable from the client bundle | P0 | Build-time check for key names in client chunks |
| SEC-06 | HTTPS everywhere, secure cookies | P0 | |
| A11Y-01 | Full keyboard operation with visible focus | P0 | Every interactive element reachable and operable |
| A11Y-02 | Labels on every field; errors tied to inputs | P0 | |
| A11Y-03 | Contrast passes in both themes, including published themes | P0 | 4.5:1 for body text |
| A11Y-04 | Touch targets ≥ 44px | P0 | |
| PERF-01 | Public profile LCP < 2.0s on a mid-range phone over 4G | P1 | |
| PERF-02 | Images optimised, modern formats, explicit dimensions | P0 | |
| PERF-03 | Public pages ship minimal client JavaScript | P1 | Most themes need none |
| PERF-04 | Database indexed and paginated | P0 | `username` and every `userId` indexed |

---

## 10. Out of scope for v1

Stated explicitly so it does not creep in:

- Job board, job applications, or employer accounts
- Messaging between users
- Team, university or institution accounts
- Resume import / parsing from an existing PDF
- LinkedIn scraping
- Multi-language interface (the *content* can be any language; the UI is English at launch)
- Native mobile apps
- Theme marketplace or third-party templates
- Payments
