import Link from "next/link"
import { Flag, LayoutDashboard, Users } from "lucide-react"
import { requireAdminPage } from "@/lib/auth"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/card"

/**
 * The admin area 404s for everyone else rather than showing a "forbidden"
 * page — a stranger should not learn that it exists. It is also excluded from
 * robots.txt and never linked from the signed-out site.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage()
  const openReports = await db.abuseReport.count({ where: { status: "OPEN" } })

  const nav = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: Flag, count: openReports },
  ]

  return (
    <div className="min-h-screen lg:flex">
      <a href="#content" className="skip-link">
        Skip to main content
      </a>

      <aside className="border-b border-[--line] px-4 py-4 lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r lg:py-6">
        <div className="flex items-center justify-between gap-2 lg:block">
          <div>
            <Link href="/admin" className="text-base font-semibold tracking-tight">
              NextProfile
            </Link>
            <Badge tone="warning" className="ml-2 align-middle">
              Admin
            </Badge>
          </div>
          <Link href="/dashboard" className="text-sm text-ink-soft hover:text-ink lg:hidden">
            My profile
          </Link>
        </div>

        <nav className="mt-4 flex gap-1 overflow-x-auto lg:mt-8 lg:block lg:space-y-0.5 lg:overflow-visible">
          {nav.map(({ href, label, icon: Icon, count }) => (
            <Link
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-sm px-2 py-2 text-sm text-ink-soft hover:bg-[--surface-2] hover:text-ink"
            >
              <Icon size={16} aria-hidden /> {label}
              {count ? (
                <span className="ml-auto rounded-full bg-[--danger] px-1.5 text-xs text-white">
                  {count}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="mt-8 hidden lg:block">
          <p className="px-2 text-xs text-ink-faint">Signed in as</p>
          <p className="break-all px-2 text-sm">{admin.email}</p>
          <Link
            href="/dashboard"
            className="mt-3 block px-2 text-sm text-[--accent] hover:underline"
          >
            Back to my profile
          </Link>
        </div>
      </aside>

      <main id="content" tabIndex={-1} className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  )
}
