"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, FileText, Home, Settings, User } from "lucide-react"

const tabs = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/profile", label: "Build", icon: User },
  { href: "/dashboard/resume", label: "Resume", icon: FileText },
  { href: "/dashboard/applications", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/settings", label: "You", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[--line] bg-[--surface] lg:hidden">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            suppressHydrationWarning
            className={`relative flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] transition-colors ${
              active ? "text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {/* Active top indicator bar */}
            {active && (
              <span className="absolute inset-x-3 top-0 h-[2px] rounded-b-full bg-current" />
            )}
            <span
              className={`flex items-center justify-center rounded-md p-1 transition-colors ${
                active ? "bg-[--surface-2]" : ""
              }`}
              suppressHydrationWarning
            >
              <Icon size={18} aria-hidden strokeWidth={active ? 2.5 : 1.8} />
            </span>
            <span className={active ? "font-medium" : ""}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
