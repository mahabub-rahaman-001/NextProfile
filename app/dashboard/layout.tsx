import Link from "next/link"
import { redirect } from "next/navigation"
import { requirePage } from "@/lib/auth"
import { db } from "@/lib/db"
import { logoutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"

/**
 * New accounts see a reduced sidebar — Overview, Profile and the one output
 * they chose. The rest unlocks as the profile fills, so a first session never
 * shows twelve destinations.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePage()
  const profile = await db.profile.findUnique({ where: { userId: user.id } })
  if (!profile?.onboardedAt) redirect("/onboarding")

  const full = profile.completeness >= 40
  const wants = (profile.wants ?? []) as string[]

  const nav = [
    { href: "/dashboard", label: "Overview", iconKey: "Home", show: true },
    { href: "/dashboard/profile", label: "Profile", iconKey: "User", show: true },
    {
      href: "/dashboard/resume",
      label: "Resume & CV",
      iconKey: "FileText",
      show: full || wants.includes("resume") || wants.includes("cv"),
    },
    {
      href: "/dashboard/portfolio",
      label: "Portfolio",
      iconKey: "Globe",
      show: full || wants.includes("portfolio") || wants.includes("profile"),
    },
    { href: "/dashboard/applications", label: "Applications", iconKey: "Briefcase", show: full },
    { href: "/dashboard/review", label: "Profile review", iconKey: "Stethoscope", show: full },
    { href: "/dashboard/share", label: "Sharing", iconKey: "Share2", show: full },
    { href: "/dashboard/ai", label: "AI assistant", iconKey: "Sparkles", show: full },
    { href: "/dashboard/qr", label: "QR code", iconKey: "QrCode", show: full },
    { href: "/dashboard/analytics", label: "Analytics", iconKey: "BarChart3", show: full },
    { href: "/dashboard/settings", label: "Settings", iconKey: "Settings", show: true },
  ].filter((n) => n.show)

  return (
    <div className="min-h-screen md:flex" suppressHydrationWarning>
      {/* First thing in the tab order: lets keyboard and screen-reader users
          jump past the sidebar and the mobile tab bar straight to the page. */}
      <a href="#content" className="skip-link">
        Skip to main content
      </a>

      {/* Desktop/Tablet sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-[--line] px-4 py-6 md:flex md:flex-col">
        <Link href="/" className="px-2 text-base font-semibold tracking-tight">
          NextProfile
        </Link>

        <SidebarNav items={nav} />

        {/* Push to bottom */}
        <div className="mt-auto pt-6 px-2 space-y-3">
          <ThemeToggle />
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit" className="px-0 text-ink-faint">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <main id="content" tabIndex={-1} className="min-w-0 flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile tab bar */}
      <MobileNav />
    </div>
  )
}

