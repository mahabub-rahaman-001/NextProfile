# NextProfile — Design System

**Version 1.0 · September 2026**

The design system covers three surfaces that must feel like one product: the **dashboard**, the **builder**, and the **published output** (portfolio pages and PDFs).

---

## 1. Brand

| | |
|---|---|
| **Name** | NextProfile |
| **Tagline** | Your Profile. Your Next Opportunity. |
| **One-liner** | An AI-powered platform that helps students and professionals build, manage, and showcase their complete professional identity through resumes, CVs, portfolios, and career profiles. |
| **Voice** | Plain, warm, competent. Never corporate, never cute. Talks like a good career counsellor: specific, encouraging, honest. |
| **What it never sounds like** | "Supercharge your career with AI-powered synergy." |

### Voice rules

| Instead of | Write |
|---|---|
| "Optimize your professional presence" | "Make your resume easier to read" |
| "Invalid input" | "A start date is needed before an end date" |
| "Sync your repositories" | "Bring in your GitHub projects" |
| "Profile incomplete" | "Add one project (+20%)" |
| "Export" | "Download PDF" |

Buttons say what happens: **Publish** → toast **Published**. Never "Submit".

---

## 2. Color

The app UI is deliberately quiet — the user's own content and their chosen template are what should carry colour.

```css
:root {
  /* neutrals — slight green bias so they read as chosen, not default */
  --paper:      #F1F3EE;   /* app background */
  --surface:    #FBFCF9;   /* cards, inputs */
  --surface-2:  #E9ECE4;   /* subtle fills, table headers */
  --line:       #D6DBD0;   /* borders */
  --ink:        #151A18;   /* primary text */
  --ink-soft:   #4E5A54;   /* secondary text */
  --ink-faint:  #7C877F;   /* labels, captions */

  /* brand */
  --accent:      #0E5C4A;  /* primary actions, links, focus */
  --accent-soft: #D9E8E0;  /* accent backgrounds */

  /* semantic — separate from the accent */
  --success: #1F7A4D;
  --warning: #9A6414;
  --danger:  #B3452A;
  --info:    #2A5F8F;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper:      #0D110F;
    --surface:    #141917;
    --surface-2:  #1B211E;
    --line:       #28302C;
    --ink:        #E6EAE4;
    --ink-soft:   #A3AEA6;
    --ink-faint:  #78837B;
    --accent:      #5FBFA1;
    --accent-soft: #17302A;
    --success: #4FB07C; --warning: #D2A04A;
    --danger:  #E0805F; --info:    #6FA8D8;
  }
}
```

**Rules**

- Semantic colour (success / warning / danger) is never the accent, and never the only signal — pair it with an icon or a word
- Contrast ≥ 4.5:1 for body text in both themes
- Published portfolio themes have their **own** palettes; they must pass the same contrast check
- The user picks an accent for their documents and portfolio — the app's accent never leaks into their output

---

## 3. Typography

| Role | Face | Used for |
|---|---|---|
| **UI / body** | Inter, system sans fallback | Everything in the app |
| **Numerals** | `font-variant-numeric: tabular-nums` | Analytics, dates, completeness |
| **Mono** | IBM Plex Mono / ui-monospace | Labels, counts, code-adjacent |
| **Document templates** | Each template picks its own | See §7 — the resume's typeface is a template decision, not an app decision |

### Scale

```
xs    12px / 1.5     labels, captions, helper text
sm    13px / 1.55    secondary text, table cells
base  15px / 1.6     body
lg    17px / 1.5     section intros
xl    20px / 1.35    card titles
2xl   24px / 1.25    page titles
3xl   32px / 1.15    dashboard greeting, marketing
```

- Running text stays near **65 characters** wide
- Headings get `text-wrap: balance`
- Uppercase labels get `letter-spacing: 0.08em` and never exceed 11px

---

## 4. Spacing & layout

4px base scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64`

- Lay out sibling groups with flex/grid + `gap` — never per-element margins
- Minimum 16px side gutter at every width
- Breakpoints: `sm 640 · md 768 · lg 1024 · xl 1280`
- **Mobile-first.** Every builder screen is designed at 375px first, then widened

### Radius & elevation

| Token | Value | Used for |
|---|---|---|
| `radius-sm` | 4px | Inputs, buttons, badges |
| `radius-md` | 8px | Cards, modals |
| `shadow-sm` | subtle | Raised cards only |
| `shadow-md` | modal | Dialogs and popovers only |

**Not everything is a card.** Border, fill, radius and shadow each say "separate object". Spend them by role. A list of education entries is a list, not six floating cards.

---

## 5. Components

Built on shadcn/ui, copied into the repo.

### Primitives
Button (primary / secondary / ghost / destructive) · Input · Textarea · Select · Combobox · Checkbox · Radio · Switch · Slider · Date picker (month-year precision) · Tabs · Accordion · Dialog · Sheet (mobile) · Dropdown · Tooltip · Toast · Badge · Avatar · Progress · Skeleton

### Product components

| Component | Behaviour |
|---|---|
| **FieldWrapper** | Label, helper line, error, character guidance, and the AI action bar in one place |
| **AIActionBar** | `Write for me · Improve · Make professional · Shorten · Fix grammar` + remaining-quota count |
| **SuggestionReview** | Side-by-side original vs suggestion, Use this / Discard, warnings |
| **RepeatableList** | Add / edit / delete / drag-reorder, touch-friendly, optimistic, with undo |
| **ModuleSection** | A profile module with its visibility state; collapsed modules show a one-line "Add" affordance |
| **CompletenessCard** | Percentage + the two highest-value missing items, each a direct link |
| **TemplatePicker** | Live thumbnail per template, rendered from the user's real data |
| **PreviewPane** | Desktop split view; mobile Build/Preview toggle. Renders the real public component tree |
| **PublishDialog** | Names exactly which fields become visible before publishing |
| **EmptyState** | Illustration-free, one line of why, one primary action |
| **QuotaNotice** | Appears at 80% of the AI quota, not at 100% |

### Every component needs

Default · hover · focus-visible · active · disabled · loading · error · empty. A component without an empty and a loading state is unfinished.

---

## 6. UX rules

The ten rules from the plan, as build-time checks:

| # | Rule | How to check it |
|---|---|---|
| 1 | Never show unnecessary fields | Open the screen as all five profile types |
| 2 | Never require technical knowledge | Read every label aloud to a non-developer |
| 3 | Plain language, not developer terms | Search the codebase for "slug", "repo", "payload", "sync" in user-facing strings |
| 4 | Give examples for difficult fields | Every textarea has a profile-type placeholder |
| 5 | AI help where users need it | AI actions sit on the field, not in a separate "AI" page |
| 6 | Show live previews | Any change to a document or portfolio is visible without navigating |
| 7 | Keep optional things optional | Only name and headline are ever required |
| 8 | Smart defaults | Template, theme and section order all pre-selected by profile type |
| 9 | Make the next action obvious | One primary button per screen |
| 10 | Never overwhelm new users | New accounts see a reduced sidebar |

---

## 7. Output design (templates & themes)

The app's design system stops at the preview frame. Beyond it, **templates and themes have their own design languages** — that is the point of the separation.

### Resume templates

| Template | Type | Structure | Notes |
|---|---|---|---|
| **Minimal** | One serif or one grotesque, single family | Single column, generous leading | **ATS-safe.** No icons as labels, no text in images, linear DOM order |
| **Professional** | Sans body, small-caps headings | Two columns: sidebar for skills/contact | Marked "best for email and print, not online forms" |
| **Modern** | Sans with a distinct display weight | Single column with accent rules, tighter density | Accent colour user-selectable |

**Every template must render every section set**, including empty ones, for all five profile-type fixtures.

### Portfolio themes

A theme changes **layout, typographic scale, navigation, project presentation, section hierarchy and spacing** — not just colour.

| Theme | Character |
|---|---|
| **Minimal** | Type-led, single column, no hero image, work listed as rows |
| **Professional** | Structured, sidebar navigation, card grid for projects |
| **Modern** | Full-bleed hero, large project imagery, generous whitespace |

Later: Creative · Academic · Elegant · Executive.

### Print rules (shared by every template)

- A4 (210×297mm) and US Letter, 15–20mm margins
- Selectable text, never a rasterised page
- `break-inside: avoid` on entries; no heading orphaned at a page bottom
- Links printed as text where the URL matters
- Page numbers on multi-page CVs, never on a one-page resume
- The same stylesheet drives preview and PDF — **no second implementation**

---

## 8. Accessibility checklist

- [ ] Every control reachable by keyboard, in a logical order
- [ ] Visible focus state on every interactive element (never `outline: none` without a replacement)
- [ ] Real `<label>` for every input; errors linked with `aria-describedby`
- [ ] Contrast ≥ 4.5:1 body, ≥ 3:1 large text — both themes, both app and published themes
- [ ] Touch targets ≥ 44px
- [ ] Drag-reorder has a keyboard alternative (move up / move down)
- [ ] `prefers-reduced-motion` respected everywhere
- [ ] Published portfolios use semantic headings in order
- [ ] Images have alt text; the user is prompted for it on upload
- [ ] Live preview updates are not announced on every keystroke
