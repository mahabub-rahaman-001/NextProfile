"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Briefcase, FileText, Globe, Home, QrCode, Settings, Share2, Sparkles, Stethoscope, User, type LucideIcon } from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Home, User, FileText, Globe, Briefcase, Stethoscope, Share2, Sparkles, QrCode, BarChart3, Settings,
}

type NavItem = {
  href: string
  label: string
  iconKey: string
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <nav className="mt-8 space-y-0.5">
      {items.map(({ href, label, iconKey }) => {
        const active = isActive(href)
        const Icon = ICON_MAP[iconKey] ?? Home
        return (
          <Link
            key={href}
            href={href}
            suppressHydrationWarning
            className={`flex items-center gap-2.5 rounded-sm px-2 py-2 text-sm transition-colors ${
              active
                ? "bg-[--surface-2] text-ink font-medium"
                : "text-ink-soft hover:bg-[--surface-2] hover:text-ink"
            }`}
          >
            <span className="shrink-0 flex items-center justify-center" suppressHydrationWarning>
              <Icon size={16} aria-hidden strokeWidth={active ? 2.5 : 1.8} />
            </span>
            <span>{label}</span>
            {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-ink" />}
          </Link>
        )
      })}
    </nav>
  )
}
