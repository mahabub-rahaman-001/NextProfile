# NextProfile — Risks & Open Decisions

**Version 1.0 · September 2026**

---

## 1. Risk register

Ordered by how many weeks each one can cost.

### 🔴 High impact

| Risk | Why it bites | Mitigation | Owner check |
|---|---|---|---|
| **Scope sprawl** | This plan contains four versions of features. The MVP quietly absorbs them and never ships. | The MVP list in [07-ROADMAP §2](07-ROADMAP.md#2-mvp-scope--this-is-a-contract) is a contract. Anything not on it goes to a v2 list without discussion. | Weekly |
| **PDF fidelity** | Preview and PDF drift apart; page breaks land badly; users stop trusting the output — and the PDF *is* the product for most of them. | One stylesheet for both. Dedicated render service. Visual snapshot tests per template against five fixtures. | Week 7, 10 |
| **PDF infrastructure** | Chromium does not fit in a serverless function; the workarounds break on runtime upgrades. | Separate always-on container, stood up as hello-world in **week 3** so week 10 is only integration. | Week 3 |
| **Solo bandwidth** | Twelve weeks assumes uninterrupted focus; life does not. | Weeks 7 and 10 are buffer-critical. Cut the third template or theme before cutting the publish flow. | Weekly |

### 🟠 Medium impact

| Risk | Why it bites | Mitigation |
|---|---|---|
| **Empty-profile problem** | A new user with nothing entered sees nothing useful and leaves in the first two minutes. | Pre-fill from onboarding and OAuth; show sample content in preview; make the first AI action available *before* the profile is complete. |
| **Template rigidity** | Templates hardcode section assumptions; a researcher's CV cannot render. | Every template must render any section set, including empty. Test against all five profile-type fixtures. |
| **AI cost blow-up** | One abusive or looping user burns a month of budget. | Quotas, per-user and per-IP rate limits, envelope trimming, caching, model routing, daily spend alert, kill switch. |
| **AI invents facts** | A user sends a resume claiming an internship they never had. Reputational damage to *them*, fatal to trust in the product. | Explicit system-prompt rule + an adversarial test set asserting no new proper noun, number or date appears in output. |
| **Generic output** | Every profile looks identical; the footer credit becomes a liability instead of marketing. | Themes that differ structurally, not in colour. User-selectable accent and typography. |
| **One-and-done usage** | People build a resume and never return; the "platform" is a document generator. | The public link and its analytics are the return mechanism. Track week-4 return from day one. |

### 🟡 Watch

| Risk | Mitigation |
|---|---|
| **Data trust** | A privacy incident with career data is fatal. Ownership checks audited in week 11; private by default; per-field contact opt-in; hashed visitor analytics with rotating salt. |
| **Username squatting** | Reserve system words; require email verification before claiming; 30-day change lock. |
| **Prompt injection via job descriptions** | Pasted JDs are untrusted input. Never place them in the instruction section; validate output against the schema regardless. |
| **Vendor lock-in (auth, AI)** | Wrap both behind `lib/auth` and `lib/ai`. No feature imports a vendor SDK directly. |
| **Uploaded file abuse** | Signed uploads, MIME + magic-byte validation, server-side re-encode, never served from the app origin. |
| **Low willingness to pay in the first market** | Regional and student pricing designed into the subscription model from the start. |

---

## 2. Decide before week 1

Four decisions that are cheap now and expensive later.

### Decision 1 — Auth: managed or your own?

| | **Managed (Clerk)** | **Own it (Auth.js)** |
|---|---|---|
| Time to working auth | ~half a day | ~3–4 days |
| Cost | Per monthly active user, grows with success | Effectively free |
| Email verification, reset, OAuth | Included | You build and maintain it |
| Lock-in | Real; migrating later means re-authenticating every user | None |

**Recommendation:** managed for the MVP *if* the 12-week timeline is firm, wrapped behind `lib/auth` so features never import the vendor. Own it if the timeline has slack — the cost line matters at student-market pricing.

**Decide by:** week 1. **Locked by:** week 3.

---

### Decision 2 — Domain and username namespace

`nextprofile.com` is parked and for sale (paid). `.app` and `.io` appear available.

The public URL shape appears in **every PDF, QR code and share link** ever generated. Changing it later invalidates printed business cards and QR codes users have already handed out.

Also decide now:

- `nextprofile.app/u/username` or `nextprofile.app/username`?
  *(the `/u/` prefix keeps the top-level namespace free for product routes — recommended)*
- Reserved word list, checked against every route you plan to add

**Decide by:** week 1, before anything is published.

---

### Decision 3 — Where PDFs render

| Option | Cost | Setup | Risk |
|---|---|---|---|
| Separate always-on container | Small fixed monthly | Few hours | Low — full control |
| Hosted rendering API | Per render | Minutes | Vendor cost at scale, less control over fonts |
| Inside the serverless app | "Free" | Hours of fighting limits | **High** — size limits, cold starts, timeouts, breaks on runtime upgrades |

**Recommendation:** separate container from day one. Stand it up in week 3.

**Decide by:** week 1. **Stood up by:** week 3.

---

### Decision 4 — First audience

Name the **campus, department and placement season** the beta is for.

"Students and professionals everywhere" is the product's long-term scope, not a launch plan. The beta needs twenty people who can be reached, helped in person, and asked why they did not finish.

Write it down as a sentence:

> *The NextProfile beta is for final-year [department] students at [university], during the [month–month] placement season.*

**Decide by:** week 1. **Contacted by:** week 10, so they are ready when the beta opens in week 12.

---

## 3. Decision log

Record every significant decision here with its date and the reason, so week-9 you knows why week-2 you chose something.

| Date | Decision | Chosen | Because | Revisit when |
|---|---|---|---|---|
| | Auth provider | | | |
| | Domain | | | |
| | URL shape | | | |
| | PDF rendering | | | |
| | First audience | | | |
| | Database host | | | |
| | LLM provider | | | |
| | Payment provider (v4) | | | |
