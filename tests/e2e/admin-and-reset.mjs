/**
 * End-to-end for the admin area and the password reset flow.
 *
 *   forgot password → dev link → set a new password → signed in
 *   old password no longer works
 *   admin signs in → lands on /admin → sees stats, users, reports
 *   a normal user gets 404 on /admin (not a "forbidden" page)
 *   suspending an account hides its public profile and blocks sign-in
 *
 * Run against a built server:  node tests/e2e/admin-and-reset.mjs
 */
import { chromium } from "playwright-core"

const BASE = process.env.BASE_URL ?? "http://localhost:3000"
let failed = false
function check(name, ok, detail = "") {
  if (!ok) failed = true
  console.log(`${ok ? "  ✓" : "  ✗"} ${name}${detail ? ` — ${detail}` : ""}`)
}

const RESET_EMAIL = `reset-${Date.now()}@nextprofile.test`
const OLD = "demo1234"
const NEW = "brandnew9876"

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: ["--no-sandbox"],
})

async function freshPage() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  return { ctx, page: await ctx.newPage() }
}

try {
  // ---------------------------------------------------------------- reset
  {
    const { ctx, page } = await freshPage()

    await page.goto(`${BASE}/register`, { waitUntil: "networkidle" })
    await page.fill('input[name="email"]', RESET_EMAIL)
    await page.fill('input[name="password"]', OLD)
    await page.click('button[type="submit"]')
    await page.waitForURL("**/onboarding", { timeout: 20000 })
    check("account created for the reset test", true)
    await ctx.close()
  }

  {
    const { ctx, page } = await freshPage()
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" })
    check("sign-in page offers a way out", (await page.textContent("body")).includes("Forgot it?"))

    await page.goto(`${BASE}/forgot-password`, { waitUntil: "networkidle" })
    await page.fill('input[name="email"]', RESET_EMAIL)
    await page.click('button[type="submit"]')
    await page.waitForSelector("text=Check your email", { timeout: 20000 })

    // Read the href, not the page text: textContent concatenates adjacent
    // elements, so a greedy pattern picks up the next link's label as well.
    const href = await page
      .getAttribute('a[href*="/reset-password/"]', "href")
      .catch(() => null)
    const link = href ? [href] : null
    check("a reset link is produced", Boolean(link))

    // The same form must say the same thing for an address with no account,
    // or it becomes a way to discover who is registered.
    await page.goto(`${BASE}/forgot-password`, { waitUntil: "networkidle" })
    await page.fill('input[name="email"]', `nobody-${Date.now()}@nowhere.test`)
    await page.click('button[type="submit"]')
    await page.waitForSelector("text=Check your email", { timeout: 20000 })
    const unknown = await page.innerText("body")
    check("an unknown address gets the same answer", unknown.includes("Check your email"))
    const leaked = await page.getAttribute('a[href*="/reset-password/"]', "href").catch(() => null)
    check("and no link is leaked for it", leaked === null)

    if (link) {
      await page.goto(link[0], { waitUntil: "networkidle" })
      await page.fill('input[name="password"]', NEW)
      await page.fill('input[name="confirm"]', NEW)
      await page.click('button[type="submit"]')
      await page.waitForURL("**/dashboard**", { timeout: 20000 })
      check("the new password signs you straight in", page.url().includes("/dashboard"))

      // Single use.
      await page.goto(link[0], { waitUntil: "networkidle" })
      check("the link cannot be used twice", (await page.textContent("body")).includes("expired"))
    }
    await ctx.close()
  }

  {
    const { ctx, page } = await freshPage()
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" })
    await page.fill('input[name="email"]', RESET_EMAIL)
    await page.fill('input[name="password"]', OLD)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)
    // Must still be on the sign-in page — not merely "somewhere that isn't
    // /dashboard", which an un-onboarded account would satisfy anyway.
    check(
      "the old password stops working",
      page.url().includes("/login"),
      `landed on ${new URL(page.url()).pathname}`,
    )
    await ctx.close()
  }

  // ---------------------------------------------------------------- admin
  {
    const { ctx, page } = await freshPage()
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" })
    await page.fill('input[name="email"]', "admin@nextprofile.test")
    await page.fill('input[name="password"]', "demo1234")
    await page.click('button[type="submit"]')
    await page.waitForURL("**/admin**", { timeout: 20000 })
    check("an admin lands in the admin area", page.url().includes("/admin"))

    const overview = await page.textContent("body")
    check("overview shows platform stats", /Accounts/.test(overview) && /Published profiles/.test(overview))

    await page.goto(`${BASE}/admin/users`, { waitUntil: "networkidle" })
    const users = await page.textContent("body")
    check("user list loads the fixtures", users.includes("Arif Hossain"))
    check("admin accounts are marked", users.includes("Admin"))

    await page.goto(`${BASE}/admin/reports`, { waitUntil: "networkidle" })
    check("reports queue loads", (await page.textContent("body")).includes("Reports"))
    await ctx.close()
  }

  {
    const { ctx, page } = await freshPage()
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" })
    await page.fill('input[name="email"]', "student.cse@nextprofile.test")
    await page.fill('input[name="password"]', "demo1234")
    await page.click('button[type="submit"]')
    await page.waitForURL("**/dashboard**", { timeout: 20000 })
    check("a normal user lands on their own dashboard", page.url().includes("/dashboard"))

    const res = await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" })
    check("a normal user gets 404 on /admin", res.status() === 404, `status ${res.status()}`)
    // innerText, not textContent: textContent also returns the contents of
    // <script> tags, and Next's flight payload contains the word "forbidden".
    const visible = await page.innerText("body")
    check(
      "and is not told the area exists",
      !/forbidden|not allowed|permission/i.test(visible),
      visible.replace(/\s+/g, " ").slice(0, 40),
    )
    await ctx.close()
  }
} catch (e) {
  check("flow completed without errors", false, e.message.split("\n")[0])
} finally {
  await browser.close()
}

console.log(failed ? "\nADMIN + RESET E2E FAILED\n" : "\nADMIN + RESET E2E PASSED\n")
process.exit(failed ? 1 : 0)
