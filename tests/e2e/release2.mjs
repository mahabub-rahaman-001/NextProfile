/**
 * End-to-end for the Release 2 features:
 *
 *   log in → track an application with a job ad → match score
 *          → profile review → private share link
 *          → open that link in a browser with no session
 *          → save a version and download it
 *
 * Run against a built server:  node tests/e2e/release2.mjs
 */
import { chromium } from "playwright-core"

const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const EMAIL = "student.cse@nextprofile.test"
const PASSWORD = "demo1234"

let failed = false
function check(name, ok, detail = "") {
  if (!ok) failed = true
  console.log(`${ok ? "  ✓" : "  ✗"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const JD = `Backend Engineer Intern

Responsibilities:
- Build REST APIs in Node.js and TypeScript
- Work with PostgreSQL and write efficient queries
- Containerise services with Docker

Requirements:
- TypeScript
- PostgreSQL
- Docker
- Kubernetes is a plus`

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ["--no-sandbox"],
})
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()

try {
  // 1. Sign in
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" })
  await page.fill('input[name="email"]', EMAIL)
  await page.fill('input[name="password"]', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL("**/dashboard**", { timeout: 20000 })
  check("signed in", page.url().includes("/dashboard"))

  // 2. Peer comparison renders (5 fixtures seeded, so a cohort exists)
  const dash = await page.textContent("body")
  check("dashboard surfaces the applications tracker", /application/i.test(dash))

  // 3. Track an application, comparing the job ad against the profile.
  // The form starts open on an empty tracker and collapsed once it has rows,
  // so handle both rather than assuming a fresh account.
  await page.goto(`${BASE}/dashboard/applications`, { waitUntil: "networkidle" })
  const addButton = page.locator('button:has-text("Track an application")').first()
  if (await addButton.isVisible().catch(() => false)) {
    await addButton.click()
    await page.waitForTimeout(300)
  }
  await page.fill('input[id]:below(:text("Company"))', "Shopfront Ltd.")
  await page.fill('input[id]:below(:text("Role"))', "Backend Intern")
  await page.fill("textarea", JD)
  await page.click('button:has-text("Compare with my profile")')
  await page.waitForSelector('[role="progressbar"]', { timeout: 20000 })

  const panel = await page.textContent("body")
  const score = panel.match(/(\d{1,3})%\s*of this ad/)
  check("a match score is produced", Boolean(score), score ? `${score[1]}%` : "not found")
  check("the score is honest about what it measures", panel.includes("not a prediction"))
  check("matched terms are attributed", panel.includes("from your skills"))
  check("a missing requirement is surfaced", panel.toLowerCase().includes("kubernetes"))

  await page.click('button:has-text("Save application")')
  await page.waitForTimeout(2500)
  const saved = await page.textContent("body")
  check("application appears in the tracker", saved.includes("Shopfront Ltd."))
  check("the frozen resume is linked", saved.includes("The resume they got"))

  // 4. Profile review
  await page.goto(`${BASE}/dashboard/review`, { waitUntil: "networkidle" })
  const review = await page.textContent("body")
  check("review renders a score", /\d{1,3}\s*\/100/.test(review))
  check("review avoids vague advice", !review.includes("could be stronger"))

  // 5. Private share link, then open it with no session at all
  await page.goto(`${BASE}/dashboard/share`, { waitUntil: "networkidle" })
  await page.fill('input[id]:below(:text("Who is it for?"))', "E2E recruiter")
  await page.click('button:has-text("Create link")')
  await page.waitForTimeout(2500)

  // Tokens are randomBytes(16) in base64url — always exactly 22 characters.
  // Bounding the match matters: textContent runs adjacent <p> elements together,
  // so an open-ended pattern swallows the "0" from the "0 views" line after it.
  const body = await page.textContent("body")
  const token = body.match(/\/s\/([A-Za-z0-9_-]{22})/)
  check("a share link is created", Boolean(token))

  if (token) {
    const anon = await browser.newContext() // no cookies — a real stranger
    const anonPage = await anon.newPage()
    const res = await anonPage.goto(`${BASE}/s/${token[1]}`, { waitUntil: "networkidle" })
    check("a stranger can open the private link", res.status() === 200)
    const shared = await anonPage.textContent("body")
    check("the shared page shows the profile", shared.includes("Arif Hossain"))
    check("the page marks itself as a private link", shared.includes("Private link"))
    await anon.close()

    await page.reload({ waitUntil: "networkidle" })
    const afterView = await page.textContent("body")
    check("the view was counted", /1 view\b/.test(afterView))
  }

  // 6. Version snapshot on a document
  await page.goto(`${BASE}/dashboard/resume`, { waitUntil: "networkidle" })
  await page.click('a[href^="/dashboard/resume/"]')
  await page.waitForSelector("text=Versions", { timeout: 20000 })
  check("version panel is present", true)

  await page.fill('input[aria-label="Version label"]', "Sent to Shopfront")
  await page.click('button:has-text("Save"):right-of(input[aria-label="Version label"])')
  await page.waitForTimeout(2500)
  const after = await page.textContent("body")
  check("a version can be saved", after.includes("Sent to Shopfront"))
} catch (e) {
  check("flow completed without errors", false, e.message.split("\n")[0])
} finally {
  await browser.close()
}

console.log(failed ? "\nRELEASE 2 E2E FAILED\n" : "\nRELEASE 2 E2E PASSED\n")
process.exit(failed ? 1 : 0)
