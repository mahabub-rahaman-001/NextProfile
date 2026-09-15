import Link from "next/link"
import type { ProfileData } from "@/lib/profile/load"
import type { PortfolioSection } from "../engine/sections"

export type ThemeProps = {
  data: ProfileData
  sections: PortfolioSection[]
  accent: string
}

export function PoweredBy() {
  return (
    <p className="mt-16 border-t border-[--line] pt-6 text-sm text-ink-faint">
      Built with{" "}
      <Link href="/" className="hover:underline">
        NextProfile
      </Link>
    </p>
  )
}
