# NextProfile — Bug Audit & Release 3 Report

**14 September 2026**
Bug audit · fixes · password reset · admin area · ten portfolio themes · tooling recommendations

---

## 1. Summary

| | Before | After |
|---|---|---|
| Portfolio themes | 3 | **10** |
| Password reset | none | **complete flow** |
| Admin area | none | **overview, users, reports** |
| Rate limiting | none | **6 endpoints** |
| Unit tests | 58 | **65** |
| E2E checks | 25 | **41** across 3 suites |
| Known bugs | 4 reported, 0 fixed | **8 found, 8 fixed** |

Everything below was verified by running it, not by reading the code.

---

## 2. Bug audit

I audited the codebase systematically rather than guessing. Two areas came back **clean**, which is worth stating as plainly as the failures:

- **Ownership scoping** — every single mutation across `actions/*.ts` is scoped `{ id, userId }`. No horizontal-access bug exists.
- **Public/private separation** — the public profile, embed card and sitemap all correctly exclude private, unpublished and (now) suspended accounts.

### 🔴 B1 — Resumes went out with no contact details *(critical, fixed)*

**The worst bug in the project.** The show/hide switches for email and phone — which exist to control the *public profile* — were also being applied to the user's **own** resume and CV. Those switches default to **off**.

So every new user who downloaded a resume got a professional-looking PDF that **no employer could reply to**, and nothing on screen suggested anything was wrong.

It was invisible during earlier testing because all five seeded fixtures happen to have `showEmail: true`.

**Proof, before the fix** — a user created with exactly the defaults:

```
resume contains their email?   0
resume contains their phone?   0
resume contains their name?    1
```

**Fix:** documents always carry the contact details the user entered. Sending a resume *is* the act of sharing. The privacy toggles now govern only `/u/username`, where strangers browse.

**Verified after:**
```
RESUME  email: 1  phone: 1   ← on their own document
PUBLIC  email: 0  phone: 0   ← still hidden from strangers
```

### 🔴 B2 — Preview scrolled sideways on phones *(high, fixed)*

The preview applied `scale(var(--preview-scale, 1))`, but **that variable was never defined anywhere in the codebase**. The fallback of `1` meant a 794px A4 page rendered at full size inside a 390px screen.

**Fix:** a `ScaledPreview` component measures the available width with a `ResizeObserver` and scales to fit, never above 1. It also reserves the *scaled* height — a transform doesn't change layout height, so the first version left a long grey gap under the page.

**Verified:**
```
✓ phone    390px — page width 390 vs viewport 390
✓ tablet   768px — page width 768 vs viewport 768
✓ desktop  1440px — page width 1440 vs viewport 1440
```

### 🔴 B3 — Profile photo never displayed *(high, fixed)*

`photoUrl` was stored, and counted for ~2.5% of the completeness score, but **no template and no theme rendered it**. Users could be told to add a photo they would then never see anywhere.

**Fix:** an `Avatar` block with initials fallback, used by the Professional resume template and by the Cards, Sidebar, Gallery and Editorial themes. Minimal stays photo-free deliberately — automated screening handles images badly.

### 🟠 B4 — Twelve COUNT queries on every dashboard load *(medium, fixed)*

The dashboard called `recomputeCompleteness()` on every page view: twelve COUNT queries plus a write, on a page people open constantly. The project's own docs say "never compute on page load".

**Fix:** the full scorer result is cached in `Profile.completenessDetail` on write. The dashboard reads it. `readCompleteness()` recomputes only for accounts that predate the cache.

### 🟠 B5 — Public endpoints had no rate limiting *(medium/high, fixed)*

`/api/analytics/collect` and `/api/report` were public and unlimited. Anyone could inflate a profile's view count, fill the events table, or flood the moderation queue.

**Fix:** `lib/rate-limit.ts`, a sliding-window limiter, applied to six paths — sign-in, registration, reset request, reset, job analysis, analytics collection and abuse reports. It is in-process; the file documents exactly what to swap for Redis when this runs on more than one machine.

### 🟡 B6 — Touch targets below 44px *(low, fixed)*
Section reorder buttons and the application status dropdown were 32–36px, against the project's own 44px rule. Raised.

### 🟡 B7 — Expired sessions accumulated forever *(low, fixed)*
Nothing ever deleted expired session rows. `getSession` now sweeps one as it encounters it.

### 🟡 B8 — `robots.txt` missed the new routes *(low, fixed)*
Added `/s`, `/embed` and `/admin` to the disallow list. Share links and the embed card already carried `noindex` meta; this is a second layer.

### Two test bugs worth recording

Both found while verifying — **the application behaved correctly in each case**:

1. `textContent` concatenates adjacent elements, so a greedy token regex swallowed the following element's text (`…srzg` + `0 views` → an invalid token). Now bounded, or read from the `href` attribute.
2. `textContent` also returns `<script>` contents, and Next's flight payload contains the word `"forbidden"` — which made a correct 404 page look like it leaked information. Now asserted against `innerText`.

The lesson generalises: **assert against what a person can see, not the serialised DOM.**

---

## 3. Password reset — now complete

| Step | Behaviour |
|---|---|
| "Forgot it?" on the sign-in page | Links to `/forgot-password` |
| Request | Always answers "Check your email", whether or not the address has an account — otherwise the form becomes a way to discover who is registered |
| Token | 32 random bytes, single-use, expires in **one hour**, and issuing a new one invalidates the previous |
| Link opened | Validity is checked **before** showing the form, so an expired link says so immediately rather than after typing a password twice |
| Reset | Sets the password, **destroys every other session**, and signs this browser in |
| Also added | Change-password in Settings, with the same session-destroying behaviour |

**One important detail:** no email provider is wired yet, so the link can be shown on screen — but **only** when `AUTH_DEV_SHOW_RESET_LINK=true`. I deliberately did *not* key this to `NODE_ENV`, because a built staging server also reports `production`; anyone relying on that would be handing out password resets. It is off by default and documented in `.env.example`.

**Verified end to end:** link produced → new password set → signed in → link rejected on second use → old password rejected → unknown address gets an identical response with no link.

---

## 4. Admin area

**Access:** `npx tsx scripts/make-admin.mts you@example.com`, or sign in as the seeded `admin@nextprofile.test`. There is deliberately **no way to grant yourself admin inside the app** — an attacker with a normal session cannot escalate. The first admin must come from someone with server access.

**Non-admins get a 404, not a "forbidden" page.** A stranger should not learn the area exists. Verified.

### What an admin can manage

| Area | What it shows / does |
|---|---|
| **Overview** | Accounts, new signups (7d), onboarding completion, published profiles with the **signup→publish rate against the 35% beta target**, suspended count, documents, frozen versions, applications tracked, AI calls (30d), analytics volume |
| **Users** | Search by email, username or name. Per account: profile type, completeness, document and application counts, join date, public link |
| — Suspend | Signs them out everywhere, blocks sign-in with a reason they see, and 404s their public profile. **Nothing is deleted.** Requires a written reason |
| — Restore | One click, fully reversible |
| — Unpublish | Takes a profile private without touching the account |
| — Make/remove admin | Guarded: cannot demote yourself, cannot remove the last admin, cannot suspend an admin without demoting them first |
| **Reports** | Queue of abuse reports from public profiles, newest and open first, with the reported account resolved alongside. Actions: dismiss, unpublish, suspend, or "read it, deciding later" — each recorded with the admin's email and a note |

**The principle throughout:** every admin power is narrow, reversible, requires a written reason where it affects someone, and leaves user data intact. Nothing here deletes anything.

### What the admin area still needs

- Audit log of admin actions (currently only the report queue records who did what)
- Impersonate-to-debug, with consent and a loud banner
- Plan and quota overrides once billing exists
- Feature flags, so the AI or a new theme can be switched off without a deploy
- Export of the six product KPIs as CSV

---

## 5. Ten portfolio themes

All ten render every fixture; all were screenshotted and checked side by side.

| # | Theme | What is structurally different |
|---|---|---|
| 1 | **Minimal** | Type-led single column, work as rows, no photo |
| 2 | **Professional** | Sticky contact panel beside the content, projects as cards |
| 3 | **Modern** | Full-bleed hero, projects as large blocks |
| 4 | **Editorial** | Magazine: oversized serif headline, numbered section rules, serif body |
| 5 | **Terminal** | Monospace, dark, framed as shell output. Single-theme by choice — a terminal that turns white is not a terminal |
| 6 | **Cards** | Every section a panel on a tinted ground; narrow sections pair up two-across |
| 7 | **Sidebar** | Photo, name and contact pinned left while the work scrolls |
| 8 | **Timeline** | A spine down the page, each section a stop on it |
| 9 | **Gallery** | Project images edge to edge first, words quiet underneath |
| 10 | **Classic** | Centred, serif, ruled masthead, small-caps headings — the academic register |

A unit test now asserts there are ten, that no two share a component, and that every profile type has at least one recommended theme. The picker became a two-column grid with a "suits you" marker, since a ten-item list would run off the panel.

**Note:** Gallery falls back gracefully when a profile has no project images — which every fixture currently is, because image upload is still not built (see §7).

---

## 6. Tools worth adding

Concrete recommendations, ordered by value against effort.

### Before a beta — these are the gaps that block real users

| Tool | Why | Notes for this market |
|---|---|---|
| **Email provider** — Resend or Postmark | Password reset works but cannot deliver. This is now the single biggest blocker | Resend is simplest; check deliverability to local inboxes before committing |
| **Object storage** — Cloudflare R2 | Image upload is still missing; R2 has no egress fees, which matters for image-heavy portfolios | Pair with `sharp` for server-side re-encode and EXIF stripping |
| **Sentry** | You cannot support a beta blind | Free tier is enough at this scale |
| **GitHub Actions CI** | Lint, typecheck, 65 unit tests and a build on every PR | Half a day, prevents the first regression reaching users |
| **Upstash Redis** | The rate limiter is in-process and resets on deploy | Swap behind the existing `limit()` signature — no other file changes |

### Soon after

| Tool | Why |
|---|---|
| **Playwright in CI** | The three E2E suites already exist; run them on every deploy |
| **`@axe-core/playwright`** | Automated accessibility assertions in the E2E run |
| **Visual snapshot testing** | 10 themes × 3 templates × 5 fixtures — template regressions are invisible in code review and obvious to a user |
| **`next-intl`** | Bangla UI. Extracting strings later costs several times more than wrapping them now |
| **Noto Sans Bengali in the render container** | Bengali text currently renders as empty boxes in PDFs. **Test this before any local launch** |
| **`pdf-parse` or `unpdf`** | Resume import — the single biggest onboarding accelerant |
| **Zod → OpenAPI** | If a mobile app or partner integration ever happens |

### Deliberately not recommended

- **A component library beyond what exists** — the design system is small and owned; adding Material or Chakra now would fight it
- **An ORM change** — Prisma is fine at this scale
- **React Native** — nothing in this product needs native performance; a PWA then Capacitor is the right path
- **A third-party analytics SDK on public profiles** — the current hashed, IP-free approach is a credibility feature; keep it

---

## 7. What is still missing

Unchanged from the last report, and now the whole of the remaining P0 list:

| Gap | Effort |
|---|---|
| **Image upload** (avatar + project images) | 1–2 days — and Gallery and the photo work are waiting on it |
| **Email sending** | Half a day once a provider is chosen |
| **Google sign-in** | Half a day |
| **AI connected to a real key** | 2 hours; all the plumbing, quota and review UI exist |
| **CI pipeline** | 3 hours |
| **Tablet-specific layout** | 1 day — it no longer overflows, but 768–1023px still uses the phone layout |
| **PWA manifest** | Half a day, biggest reach-per-hour available |

After those, the beta is honest. Everything else — job matching AI, bilingual profiles, the career-office dashboard — is a product decision rather than a blocker.

---

## 8. Verification

```
Unit          65 tests   7 files    all passing
E2E signup     8 checks             all passing
E2E release2  17 checks             all passing
E2E admin      16 checks            all passing
Build         clean, 40 routes
Typecheck     clean, strict mode
Themes        10 rendered, screenshotted, content verified
Overflow      no horizontal scroll at 390 / 768 / 1440
```

---

## 9. The one thing to do next

Wire an email provider. Password reset is built, tested and working — and completely undeliverable until a provider exists. Right now the only way a user can complete a reset is a development flag that must never be enabled in production.

It is half a day of work, and it is the difference between a beta you can open and one where the first person who forgets their password is stuck forever.
