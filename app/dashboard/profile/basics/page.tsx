import { requirePage } from "@/lib/auth"
import { db } from "@/lib/db"
import { getModules } from "@/lib/modules"
import { contactOf, linksOf } from "@/lib/profile/load"
import { PageHeader, Section } from "@/components/dashboard/page-header"
import { BasicsForm } from "./basics-form"

/** Placeholders are written per profile type — an empty box is where people quit. */
const ABOUT_PLACEHOLDER: Record<string, string> = {
  STUDENT:
    "Example: I'm a final-year business student interested in marketing, analytics and digital strategy. I've led two case competition teams and run social media for a 400-member club.",
  RESEARCHER:
    "Example: Postdoctoral researcher working on antimicrobial resistance, combining wet-lab microbiology with genomic analysis. Currently applying for faculty positions.",
  FREELANCER:
    "Example: Independent product designer. I work with small teams that have a working product and no designer, usually between a rough prototype and something people can actually use.",
  CREATIVE:
    "Example: Illustrator and art director working with publishers and small brands. My work sits somewhere between editorial illustration and identity design.",
  PROFESSIONAL:
    "Example: Marketing manager with seven years across e-commerce and fintech, most of it on lifecycle and retention. Currently leading a team of five.",
}

export default async function BasicsPage() {
  const user = await requirePage()
  const profile = await db.profile.findUnique({ where: { userId: user.id } })
  if (!profile) return null

  const modules = getModules(profile.profileType, profile.discipline)
  const c = contactOf(profile)
  const l = linksOf(profile)

  return (
    <>
      <PageHeader
        title="Basic information"
        blurb="The part of your profile that appears on everything you publish."
        back={{ href: "/dashboard/profile", label: "Profile" }}
      />
      <Section>
        <BasicsForm
          suggestedLinks={modules.hints.links}
          aboutPlaceholder={
            ABOUT_PLACEHOLDER[profile.profileType] ?? ABOUT_PLACEHOLDER.PROFESSIONAL
          }
          initial={{
            fullName: profile.fullName ?? "",
            headline: profile.headline ?? "",
            photoUrl: profile.photoUrl ?? "",
            about: profile.about ?? "",
            location: profile.location ?? "",
            languages: (profile.languages ?? []).join(", "),
            contact: {
              email: c.email ?? "",
              phone: c.phone ?? "",
              showEmail: c.showEmail ?? false,
              showPhone: c.showPhone ?? false,
              showLocation: c.showLocation ?? true,
            },
            links: (l ?? {}) as Record<string, string>,
          }}
        />
      </Section>
    </>
  )
}
