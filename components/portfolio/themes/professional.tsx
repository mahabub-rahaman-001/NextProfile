import { ContactBlock, SectionContent } from "../blocks"
import { PoweredBy, type ThemeProps } from "./types"

/** PROFESSIONAL — sticky contact panel beside the content, projects as cards. */
export function ProfessionalTheme({ data, sections, accent }: ThemeProps) {
  const p = data.profile!
  const body = sections.filter((s) => s.key !== "contact")

  return (
    <main
      className="mx-auto max-w-5xl px-5 py-12 sm:py-16"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="lg:flex lg:gap-14">
        <aside className="lg:sticky lg:top-16 lg:h-fit lg:w-64 lg:shrink-0">
          <h1 className="text-2xl font-semibold tracking-tight">{p.fullName}</h1>
          {p.headline ? <p className="mt-1 text-ink-soft">{p.headline}</p> : null}
          <div className="mt-6 border-t border-[--line] pt-6">
            <ContactBlock data={data} />
          </div>
          {body.length > 3 ? (
            <nav className="mt-6 hidden border-t border-[--line] pt-6 lg:block">
              <ul className="space-y-1">
                {body.map((s) => (
                  <li key={s.key}>
                    <a href={`#${s.key}`} className="text-sm text-ink-soft hover:text-[--accent]">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </aside>

        <div className="mt-12 min-w-0 flex-1 space-y-12 lg:mt-0">
          {body.map((s) => (
            <section key={s.key} id={s.key} className="scroll-mt-8">
              <h2 className="mb-4 border-b border-[--line] pb-2 text-sm font-semibold uppercase tracking-[0.1em] text-[--accent]">
                {s.title}
              </h2>
              <SectionContent
                sectionKey={s.key}
                items={s.items as never[]}
                data={data}
                projectVariant="card"
              />
            </section>
          ))}
          <PoweredBy />
        </div>
      </div>
    </main>
  )
}
