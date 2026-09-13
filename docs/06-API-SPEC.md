# NextProfile — API Specification

**Version 1.0 · September 2026**

Most mutations run through **Server Actions**. API routes exist where an external caller, a webhook, or a non-form client is involved. Both paths share the same Zod schemas from `lib/validation`.

---

## 1. Conventions

| | |
|---|---|
| **Auth** | Session cookie. Every handler calls `requireUser()` and scopes queries by `userId`. |
| **Validation** | Zod on every input. Unknown keys rejected. |
| **Errors** | `{ error: { code, message, field? } }` with a real HTTP status. Messages are user-readable. |
| **Ownership** | Compound `where: { id, userId }` on every mutation. Never `where: { id }`. |
| **Rate limits** | Auth 10/min/IP · AI 20/min/user · upload-sign 30/min/user · analytics 60/min/IP |
| **Dates** | ISO 8601 strings in, `Date` in the database, month precision in the UI |

**Error codes:** `UNAUTHENTICATED` · `FORBIDDEN` · `NOT_FOUND` · `VALIDATION` · `RATE_LIMITED` · `QUOTA_EXCEEDED` · `PROVIDER_ERROR` · `CONFLICT`

---

## 2. Profile

| Method | Route | Body / params | Returns |
|---|---|---|---|
| `GET` | `/api/profile` | — | Full profile + all record sections |
| `PATCH` | `/api/profile` | Any subset of profile fields | Updated profile + new completeness score |
| `PATCH` | `/api/profile/onboarding` | `{ profileType, discipline?, careerGoal, wants[] }` | Profile + the module set now visible |
| `GET` | `/api/profile/completeness` | — | `{ score, missing: [{ key, label, weight }] }` |
| `GET` | `/api/profile/modules` | — | `{ visible[], available[], hidden[] }` for the current profile type |

### Record sections

One uniform CRUD shape for: `education` · `experience` · `skills` · `projects` · `certifications` · `achievements` · `publications` · `research` · `conferences` · `services` · `case-studies` · `testimonials`

| Method | Route | Body | Returns |
|---|---|---|---|
| `GET` | `/api/profile/{section}` | — | `Item[]` ordered by `sortOrder` |
| `POST` | `/api/profile/{section}` | Item fields | Created item |
| `PATCH` | `/api/profile/{section}/{id}` | Partial item | Updated item |
| `DELETE` | `/api/profile/{section}/{id}` | — | `{ ok: true, restoreUntil }` *(soft delete)* |
| `POST` | `/api/profile/{section}/{id}/restore` | — | Restored item |
| `POST` | `/api/profile/{section}/reorder` | `{ id, afterId \| beforeId }` | `{ id, sortOrder }` — writes one row |

---

## 3. Documents (resume & CV)

| Method | Route | Body | Returns |
|---|---|---|---|
| `GET` | `/api/documents` | — | `Document[]` |
| `POST` | `/api/documents` | `{ kind, name?, templateId? }` | Created document with default config |
| `GET` | `/api/documents/{id}` | — | Document + resolved render data |
| `PATCH` | `/api/documents/{id}` | `{ name?, templateId?, config? }` | Updated document |
| `DELETE` | `/api/documents/{id}` | — | `{ ok: true }` |
| `POST` | `/api/documents/{id}/duplicate` | — | New document with copied config |
| `POST` | `/api/documents/{id}/pdf` | `{ format: "A4" \| "LETTER" }` | `{ url, expiresAt }` — cached by content hash |

**Config shape** (validated by Zod, stored as JSON):

```json
{
  "sectionOrder": ["summary","education","experience","projects","skills"],
  "hidden": ["achievements"],
  "density": "regular",
  "accent": "#0E5C4A",
  "paper": "A4",
  "onePage": false
}
```

---

## 4. Portfolio & publishing

| Method | Route | Body | Returns |
|---|---|---|---|
| `GET` | `/api/portfolio` | — | Portfolio config |
| `PATCH` | `/api/portfolio` | `{ themeId?, config? }` | Updated portfolio |
| `POST` | `/api/portfolio/publish` | `{ username? }` | `{ url, publishedAt }` — revalidates the public page |
| `POST` | `/api/portfolio/unpublish` | — | `{ ok: true }` — public URL 404s |
| `GET` | `/api/username/check?u=` | — | `{ available, reason? }` |
| `POST` | `/api/username/claim` | `{ username }` | `{ username, lockedUntil }` — 30-day lock |
| `GET` | `/api/qr?format=png\|svg&size=` | — | Image bytes, cached by URL |

**Reserved usernames:** `admin` `api` `u` `login` `register` `settings` `dashboard` `pricing` `about` `help` `support` `blog` `terms` `privacy` `print` `static` `assets` `www` — plus every existing top-level route. Re-check the list on every new route added.

---

## 5. AI

| Method | Route | Body | Returns |
|---|---|---|---|
| `POST` | `/api/ai/about-me` | `{}` — envelope assembled server-side | `AIResult` |
| `POST` | `/api/ai/improve` | `{ target: "experience"\|"project"\|"about", id?, text }` | `AIResult` |
| `POST` | `/api/ai/project-description` | `{ projectId, rough }` | `AIResult` *(structured fields)* |
| `POST` | `/api/ai/grammar` | `{ text }` | `AIResult` |
| `POST` | `/api/ai/job-match` | `{ jobDescription }` | `JobMatchResult` |
| `POST` | `/api/ai/skill-gap` | `{ jobDescription? , targetRole? }` | `SkillGapResult` |
| `POST` | `/api/ai/feedback` | `{ requestId, accepted }` | `{ ok: true }` — the quality dataset |
| `GET` | `/api/ai/quota` | — | `{ used, limit, resetsAt }` |

**Important:** the client never sends the facts envelope. It sends the *intent*; the server assembles the envelope from the database. This prevents a client from injecting fake facts and keeps prompt construction in one place.

Failure responses: `QUOTA_EXCEEDED` (402-style, with `resetsAt`) · `RATE_LIMITED` · `PROVIDER_ERROR` (user text untouched).

---

## 6. Uploads

| Method | Route | Body | Returns |
|---|---|---|---|
| `POST` | `/api/upload/sign` | `{ kind: "avatar"\|"project"\|"casestudy", contentType, bytes }` | `{ uploadUrl, key, maxBytes }` |
| `POST` | `/api/upload/complete` | `{ key, kind, targetId?, alt? }` | `{ url, width, height }` |

Server-side on completion: verify MIME **and magic bytes**, re-encode, strip EXIF, generate sizes, store the CDN URL. Reject anything that is not a raster image. Never serve user uploads from the app origin.

Limits: avatar ≤ 5MB · project image ≤ 8MB · max 10 images per project.

---

## 7. Analytics

| Method | Route | Body | Returns |
|---|---|---|---|
| `POST` | `/api/analytics/collect` | `{ username, type, targetId? }` | `204` |
| `GET` | `/api/analytics/overview?range=30d` | — | `{ views, uniques, downloads, series[] }` |
| `GET` | `/api/analytics/projects?range=30d` | — | `{ projectId, title, views }[]` |

`collect` is public (it fires from published profiles), rate-limited per IP, and stores `hash(ip + userAgent + dailySalt)` — **never a raw IP**. Bot user agents are dropped server-side.

---

## 8. Render service (internal)

Called by the app; not exposed to browsers.

```
POST  https://render.internal/render
Headers: X-Render-Secret: <shared secret>
Body:    { docId, token, format: "A4" | "LETTER" }
→        { key, bytes, ms }
```

The service fetches `GET /print/{docId}?token=<hmac>` from the app. The token is an HMAC of `docId + expiry`, valid for 60 seconds, verified by the print route. The print route serves **the same components** as the preview — there is no second renderer.

```
POST  /api/render/callback     # optional async completion hook
Body: { docId, key, ok, error? }
```

---

## 9. Webhooks (v4)

| Route | Source | Purpose |
|---|---|---|
| `POST /api/webhooks/payments` | Payment provider | Subscription created / updated / cancelled |
| `POST /api/webhooks/domains` | Domain provider | Custom domain verification status |

Both verify the provider signature before doing anything, and are idempotent by event id.

---

## 10. Public routes

| Route | Rendering | Notes |
|---|---|---|
| `/u/{username}` | Static + on-demand revalidation | 404 for private/unpublished. Revalidated on publish and on debounced profile save |
| `/u/{username}/opengraph-image` | Generated, cached | Name, headline, photo |
| `/print/{docId}?token=` | Dynamic, token-gated | Render service only |
| `/sitemap.xml` | Generated | Public profiles only — never unlisted or private |
| `/robots.txt` | Static | Disallows `/dashboard`, `/print`, `/api` |
