import { NextResponse } from "next/server"
import { OAuth2Client } from "google-auth-library"
import { db } from "@/lib/db"
import { createSession } from "@/lib/auth"
import { LIMITS, clientIp, limit, tooMany } from "@/lib/rate-limit"

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

const client = new OAuth2Client(CLIENT_ID)

export async function POST(req: Request) {
  // Without a client id, verifyIdToken performs no audience check and accepts
  // any Google-signed token, whichever application it was issued to. That is a
  // sign-in bypass, so the endpoint stays closed until it is configured.
  if (!CLIENT_ID) {
    console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set; Google sign-in is disabled")
    return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 })
  }

  const gate = await limit(`google:${clientIp(req)}`, LIMITS.auth.max, LIMITS.auth.windowMs)
  if (!gate.ok) return tooMany(gate)

  try {
    const { token } = await req.json()
    if (!token) return NextResponse.json({ error: "No token provided" }, { status: 400 })

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 400 })
    }

    // An unverified Google address proves nothing about who owns it, and this
    // route signs people into an existing account by email alone.
    if (payload.email_verified !== true) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 400 })
    }

    const email = payload.email

    let user = await db.user.findUnique({ where: { email } })

    if (!user) {
      // Register the user automatically
      user = await db.user.create({
        data: {
          email,
          emailVerified: new Date(), // Trusted from Google
          profile: { create: { fullName: payload.name || "" } },
          portfolio: { create: {} },
        },
      })
    }

    // Same rule as password sign-in: a suspended account cannot get a session.
    if (user.suspendedAt) {
      return NextResponse.json(
        {
          error: user.suspendedReason
            ? `This account is suspended: ${user.suspendedReason}`
            : "This account is suspended. Contact support if you think that is a mistake.",
        },
        { status: 403 },
      )
    }

    // Sign them in
    await createSession(user.id)

    const destination = user.role === "ADMIN" ? "/admin" : "/dashboard"
    return NextResponse.json({ ok: true, destination })
  } catch (error) {
    console.error("Google Auth Error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }
}
