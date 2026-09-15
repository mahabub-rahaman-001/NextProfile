import { notFound } from "next/navigation"
import { requirePage } from "@/lib/auth"
import { delegate, isSectionSlug } from "@/lib/sections/registry"
import { SECTION_UI } from "@/components/profile/section-fields"
import { SectionEditor } from "@/components/profile/section-editor"
import { PageHeader, Section } from "@/components/dashboard/page-header"

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  if (!isSectionSlug(section)) notFound()

  const user = await requirePage()
  const ui = SECTION_UI[section]

  const items = await delegate(section).findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <>
      <PageHeader
        title={ui.title}
        blurb={ui.blurb}
        back={{ href: "/dashboard/profile", label: "Profile" }}
      />
      <Section>
        <div className="max-w-3xl">
          <SectionEditor slug={section} items={JSON.parse(JSON.stringify(items))} />
        </div>
      </Section>
    </>
  )
}
