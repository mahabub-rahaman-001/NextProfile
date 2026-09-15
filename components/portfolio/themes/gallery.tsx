import { Avatar, SectionContent } from "../blocks"
import { PoweredBy, type ThemeProps } from "./types"

/**
 * GALLERY — work first, words second.
 *
 * Built for designers, illustrators and photographers: project images run
 * edge to edge, and the written sections are deliberately quiet underneath.
 */
export function GalleryTheme({ data, sections, accent }: ThemeProps) {
  const p = data.profile!
  const VISUAL = new Set(["projects", "caseStudies"])
  const visual = sections.filter((s) => VISUAL.has(s.key))
  const rest = sections.filter((s) => !VISUAL.has(s.key))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images: { url: string; alt: string }[] = (data.projects as any[])
    .flatMap((pr) => (Array.isArray(pr.images) ? pr.images : []))
    .slice(0, 6)

  return (
    <main style={{ ["--accent" as string]: accent }}>
      <header className="px-5 pb-10 pt-16 sm:pt-24">
        <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-[clamp(2rem,7vw,4rem)] font-semibold leading-none tracking-tight">
              {p.fullName}
            </h1>
            {p.headline ? <p className="mt-3 text-lg text-ink-soft">{p.headline}</p> : null}
          </div>
          <Avatar profile={p} size={72} rounded="full" />
        </div>
      </header>

      {images.length ? (
        <div className="mx-auto grid max-w-6xl gap-1 px-1 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={img.url}
              alt={img.alt || ""}
              className="aspect-[4/3] w-full max-w-full object-cover"
            />
          ))}
        </div>
      ) : null}

      <div className="mx-auto max-w-4xl space-y-16 px-5 py-16">
        {visual.map((s) => (
          <section key={s.key} id={s.key}>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.12em]" style={{ color: accent }}>
              {s.title}
            </h2>
            <SectionContent
              sectionKey={s.key}
              items={s.items as never[]}
              data={data}
              projectVariant="block"
            />
          </section>
        ))}

        {rest.length ? (
          <div className="grid gap-12 border-t border-[--line] pt-12 sm:grid-cols-2">
            {rest.map((s) => (
              <section key={s.key} id={s.key}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
                  {s.title}
                </h2>
                <SectionContent
                  sectionKey={s.key}
                  items={s.items as never[]}
                  data={data}
                  projectVariant="row"
                />
              </section>
            ))}
          </div>
        ) : null}

        <PoweredBy />
      </div>
    </main>
  )
}
