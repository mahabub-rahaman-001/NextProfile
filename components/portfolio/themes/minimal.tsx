import { SectionContent } from "../blocks"
import { PoweredBy, type ThemeProps } from "./types"

/** MINIMAL — one column, type-led. Work listed as rows, no hero image. */
export function MinimalTheme({ data, sections, accent }: ThemeProps) {
  const p = data.profile!

  return (
    <main
      className="mx-auto max-w-2xl px-5 py-16 sm:py-24"
      style={{ ["--accent" as string]: accent }}
    >
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{p.fullName}</h1>
        {p.headline ? <p className="mt-1 text-lg text-ink-soft">{p.headline}</p> : null}
      </header>

      <div className="mt-14 space-y-14">
        {sections.map((s) => (
          <section key={s.key} id={s.key}>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
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

      <PoweredBy />
    </main>
  )
}
