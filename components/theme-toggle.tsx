"use client"

import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

const options = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark",  label: "Dark",  icon: Moon },
  { value: "system",label: "System",icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-[--line] bg-[--surface-2] p-0.5">
      {options.map(({ value, label, icon: Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={label}
            aria-label={`Switch to ${label} mode`}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-all ${
              active
                ? "bg-[--surface] text-ink shadow-sm font-medium"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <Icon size={13} aria-hidden strokeWidth={active ? 2.5 : 1.8} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
