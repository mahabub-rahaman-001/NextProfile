import { SectionContent } from "../blocks"
import { PoweredBy, type ThemeProps } from "./types"

/**
 * CLASSIC — centred, formal, serif.
 *
 * The academic register: a ruled masthead, small-caps section headings, and a
 * narrow measure. Deliberately undesigned-looking, which is exactly right for
 * a CV going to a faculty committee.
 */
export function ClassicTheme({ data, sections, accent }: ThemeProps) {
  const p = data.profile!
  const contact = (p.contact ?? {}) as {
    email?: string
    phone?: string
    showEmail?: boolean
    showPhone?: boolean
    showLocation?: boolean
  }

  const line = [
    contact.showLocation !== false ? p.location : null,
    contact.showEmail ? contact.email : null,
    contact.showPhone ? contact.phone : null,
  ].filter(Boolean)

  return (
    <main
      className="mx-auto max-w-2xl px-5 py-16 font-serif sm:py-20"
      style={{ ["--accent" as string]: accent }}
    >
      <header className="border-b border-t border-ink py-8 text-center">
        <h1 className="text-3xl font-medium tracking-wide sm:text-4xl">{p.fullName}</h1>
        {p.headline ? <p className="mt-2 italic text-ink-soft">{p.headline}</p> : null}
        {line.length ? (
          <p className="mt-3 text-sm text-ink-soft">{line.join("  ·  ")}</p>
        ) : null}
      </header>

      <div className="mt-12 space-y-11">
        {sections
          .filter((s) => s.key !== "contact")
          .map((s) => (
            <section key={s.key} id={s.key}>
              <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.28em] text-ink-soft">
                {s.title}
              </h2>
              <div
                aria-hidden
                className="mx-auto mb-5 h-px w-16"
                style={{ background: accent }}
              />
              <div className="[&_p]:leading-relaxed">
                <SectionContent
                  sectionKey={s.key}
                  items={s.items as never[]}
                  data={data}
                  projectVariant="row"
                />
              </div>
            </section>
          ))}
      </div>

      <div className="text-center">
        <PoweredBy />
      </div>
    </main>
  )
}
