import { NextResponse, type NextRequest } from "next/server"

/**
 * First gate only — presence of a signed session cookie. The real check
 * (signature, expiry, ownership) happens in requirePage/requireUser, which run
 * on the server with database access. Middleware runs on the edge and must not
 * import Prisma.
 */
export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get("np_session")?.value)
  if (!hasSession) {
    const url = new URL("/login", req.url)
    url.searchParams.set("next", req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  // /admin is included so a signed-out visitor is bounced at the edge. The
  // role check itself happens in requireAdminPage, which has database access.
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/admin/:path*"],
}
