/**
 * Promote an account to admin.
 *
 *   npx tsx scripts/make-admin.mts you@example.com
 *
 * Deliberately a command-line tool rather than a screen: there is no way to
 * grant yourself admin through the app, so an attacker who gets a normal
 * session cannot escalate. The first admin has to come from someone with
 * server access.
 */
import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const email = process.argv[2]?.trim().toLowerCase()

if (!email) {
  console.error("Usage: npx tsx scripts/make-admin.mts <email>")
  process.exit(1)
}

const user = await db.user.findUnique({ where: { email } })
if (!user) {
  console.error(`No account with the email ${email}. Register it first, then run this again.`)
  await db.$disconnect()
  process.exit(1)
}

await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } })
console.log(`${email} is now an admin. Sign out and back in, then open /admin.`)

await db.$disconnect()
