import { notFound } from "next/navigation"
import { requirePage } from "@/lib/auth"
import { db } from "@/lib/db"
import { loadFullProfile } from "@/lib/profile/load"
import { portfolioConfigSchema } from "@/lib/validation"
import { availablePortfolioSections } from "@/components/portfolio/engine/sections"
import { PortfolioEditor } from "./portfolio-editor"

export default async function PortfolioPage() {
  const user = await requirePage()
  const data = await loadFullProfile(user.id)
  if (!data) notFound()

  const portfolio =
    data.portfolio ?? (await db.portfolio.create({ data: { userId: user.id } }))

  const config = portfolioConfigSchema.parse(portfolio.config ?? {})
  const available = availablePortfolioSections(data)

  return (
    <PortfolioEditor
      data={JSON.parse(JSON.stringify(data))}
      initialThemeId={portfolio.themeId}
      initialConfig={config}
      available={available}
      published={portfolio.published}
      username={user.username}
      appUrl={process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}
    />
  )
}
