/**
 * End-to-end: the flow the MVP exists to prove.
 *
 *   register → onboarding → add education → add a project → dashboard score
 *
 * Run against a built server:  node tests/e2e/signup-flow.mjs
 */
import { chromium } from "playwright-core"

const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const email = `e2e-${Date.now()}@nextprofile.test`
const steps = []
let failed = false

function check(name, ok, detail = "") {
  steps.push({ name, ok, detail })
  if (!ok) failed = true
  console.log(`${ok ? "  ✓" : "  ✗"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ["--no-sandbox"],
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 } }) // phone first

try {
  // 1. Register
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle" })
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', "demo1234")
  await page.click('button[type="submit"]')
  await page.waitForURL("**/onboarding", { timeout: 15000 })
  check("register lands on onboarding", page.url().includes("/onboarding"))

  // 2. Onboarding — three questions, then basics
  await page.click('button:has-text("Student")')
  await page.click('button:has-text("Continue")')
  await page.click('button:has-text("Find an internship")')
  await page.click('button:has-text("Continue")')
  await page.click('button:has-text("Continue")') // outputs: resume preselected
  await page.fill('input[id]:above(:text("Headline"))', "Ayesha Karim")
  await page.click('button:has-text("Start building")')
  await page.waitForURL("**/dashboard/**", { timeout: 15000 })
  check("onboarding completes on a 390px screen", page.url().includes("/dashboard"))

  // 3. Module visibility follows profile type
  await page.goto(`${BASE}/dashboard/profile`, { waitUntil: "networkidle" })
  const body = await page.textContent("body")
  check("student sees Education by default", body.includes("Education"))
  check("student is not shown Services by default", !body.includes("Services & rates"))

  // 4. Add an education entry
  await page.goto(`${BASE}/dashboard/profile/education`, { waitUntil: "networkidle" })
  await page.fill('input[id]:below(:text("Institution"))', "University of Dhaka")
  await page.click('button:has-text("Save")')
  await page.waitForTimeout(1200)
  const eduBody = await page.textContent("body")
  check("education entry saved and listed", eduBody.includes("University of Dhaka"))

  // 5. Completeness reflects it
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" })
  const score = await page.textContent("body")
  const m = score.match(/(\d{1,3})%/)
  check("completeness score computed", Boolean(m), m ? `${m[1]}%` : "no score found")
  check("score is above zero after adding data", m && Number(m[1]) > 0)

  // 6. A resume exists and renders
  await page.goto(`${BASE}/dashboard/resume`, { waitUntil: "networkidle" })
  const resumeList = await page.textContent("body")
  check("a resume was created during onboarding", resumeList.includes("My Resume"))
} catch (e) {
  check("flow completed without errors", false, e.message.split("\n")[0])
} finally {
  await browser.close()
}

console.log(failed ? "\nE2E FAILED\n" : "\nE2E PASSED\n")
process.exit(failed ? 1 : 0)
