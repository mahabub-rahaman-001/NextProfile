# NextProfile — Business

**Version 1.0 · September 2026**

---

## 1. Plans

| | **Free** | **Pro** | **Premium** |
|---|---|---|---|
| Profiles | 1 | 1 | 1 |
| Resume / CV documents | 2 | Unlimited | Unlimited |
| Resume templates | 3 | All | All + premium |
| Portfolio themes | 3 | All | All + premium |
| Portfolio versions | 1 | 1 | Multiple |
| Projects | 10 | Unlimited | Unlimited |
| AI actions / month | 15 | 300 | 1,000 |
| PDF download | ✓ (footer credit) | ✓ no branding | ✓ no branding |
| Public profile | ✓ (footer credit) | ✓ no branding | ✓ no branding |
| QR code | ✓ | ✓ | ✓ |
| Analytics | Basic counts | Full dashboard | Advanced |
| Job matching | — | ✓ | ✓ |
| Skill gap analysis | — | ✓ | ✓ |
| Custom domain | — | ✓ | ✓ |
| Recruiter view | — | — | ✓ |
| Priority features | — | — | ✓ |

### What people actually pay for

Not "more templates." The two real conversion triggers are:

1. **Removing the platform credit** — the moment someone sends their link to an employer, the footer becomes personal.
2. **Job matching** — it is the only feature that changes the outcome of an application rather than its appearance.

Everything else is packaging.

---

## 2. Pricing

**Do not set numbers before the beta.** Price from what beta users say they would pay, and from what they actually do when a paywall appears.

Two things to design for now, because they are painful to retrofit:

### Regional pricing

A plan priced for the US is out of reach for the student market this product starts with. Purchasing power differs by an order of magnitude across the markets NextProfile serves. Build the subscription model with a `region` or `pricingTier` from the start, even if every region has the same price on day one.

### Student pricing

The core user is a student. A cheap student tier — verified by academic email or simply by profile type — converts better than a discount code and is the natural on-ramp to the professional plan three years later, when the same person is job-hunting with money.

### Billing shape

- Monthly and annual, annual discounted
- **A short Pro trial at the moment of publishing**, not at signup — that is when the value is obvious
- No credit card for the free tier, ever
- Cancellation keeps the profile alive and public; it reverts to free limits and restores the footer credit. Never hold a person's career record hostage.

---

## 3. Unit economics

Three things cost real money per user.

### AI — the dominant cost

| Task | Relative cost |
|---|---|
| Grammar fix | 1× |
| About Me generation | 3× |
| Project description | 4× |
| Job match against a full JD | 15–30× |

Controls, in order of impact:

1. **Model routing** — cheap model for grammar and shortening; strong model only for generation and matching
2. **Envelope trimming** — send only the fact sections the task needs
3. **Caching** — identical envelope within 24h returns free
4. **Quotas** — 15/month free, 300 Pro
5. **Daily spend alert** from week 10

An unquoted free tier is how products in this category die. Set quotas generously enough that a normal user finishing a profile never notices one.

### PDF rendering

A fixed monthly container cost until volume is real, then it scales with CPU seconds. **Cache generated PDFs by content hash** — most users download the same unchanged resume repeatedly, and a cache hit is free.

### Storage and bandwidth

Small if uploads are re-encoded, capped in dimension, and served through a CDN. Cap images at 10 per project and re-encode everything server-side.

### Fixed costs at beta scale

Database, hosting, render container, email, error tracking — modest and roughly flat until a few thousand active profiles. Managed auth adds a per-monthly-active-user cost that grows with success; that is the trade in the auth decision.

### The number to track from day one

**Cost per active user**, queried from the `AIRequest` log plus fixed costs divided by monthly actives. You cannot set a price without it, and it is the input to every later decision about free-tier limits.

---

## 4. Going to market

A universal product still needs a **specific** first audience.

### The beachhead

**Final-year university students in one country, in one placement season.**

Why this group:

- **Urgent deadline** — placement season is a hard date, not a someday
- **Dense network** — one department shares tools aggressively within days
- **The output is the advertisement** — every published profile carries a link back
- **Forgiving of rough edges** — they need the resume more than they need polish
- **They graduate into the next segment** — today's student is next year's professional user

### The sequence

| Step | Action | Success looks like |
|---|---|---|
| **1** | One campus, one department, one season | 20 students publish and get interviews |
| **2** | Career offices and club leaders | A workshop where everyone leaves with a finished resume and a live link |
| **3** | The footer does the work | "Built with NextProfile" on every free profile |
| **4** | Adjacent expansion | Other departments → other campuses → early-career professionals → researchers and freelancers |

Twenty students who publish and get interviews are worth more than a thousand signups. The adaptive profile types are already built for the later segments; **marketing follows the product, not ahead of it.**

### Channels that fit this product

| Channel | Why it works here |
|---|---|
| University career offices | They need exactly this and have no budget objection to a free tier |
| Student clubs and societies | Leaders are natural multipliers |
| Workshops ("bring your laptop") | The product is a 20-minute demo that ends with a real artifact |
| The shared link itself | The most credible ad is a classmate's actual profile |
| Content on writing resumes | Genuinely useful, and ranks — but only after the product works |

### Channels that do not

Paid acquisition before retention is proven. Cold outreach to recruiters (they are not the user yet). Broad social ads for an "AI career platform" — indistinguishable from a hundred others.

---

## 5. Competitive position

| Category | What they do | Where NextProfile differs |
|---|---|---|
| Resume builders | One document, template-first, export and leave | Holds the record; the document is an output, not the product |
| Portfolio templates | Developer-focused, needs code or a site builder | No code, and not developer-shaped |
| LinkedIn | The professional network | Not a network — the user owns the record and the presentation, and can print it |
| AI resume writers | Generate text from a prompt | Generates from the user's **stored facts**, and never invents |

**The defensible position is the record.** A person who has entered three years of career history into NextProfile does not export it to a resume builder for a nicer template. That is why the data model comes before the templates.

---

## 6. Honest risks to the business

| Risk | Reality |
|---|---|
| Low willingness to pay in the beachhead market | Real. Student pricing and regional pricing are not optional |
| One-and-done usage | The biggest threat. Profiles must be worth *updating*, which is why analytics and the public link matter more than they look |
| AI costs outrunning revenue | Controlled by quotas and routing, but watch cost-per-active-user monthly |
| Commodity perception | "Another AI resume tool." Countered by output quality and by owning the record, not by marketing |
| Solo founder bandwidth | The 12-week plan assumes focus. Build the gates in the roadmap and respect them |
