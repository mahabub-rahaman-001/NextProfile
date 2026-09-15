import { SectionContent } from "../blocks"
import { PoweredBy, type ThemeProps } from "./types"

/**
 * TIMELINE — a spine down the page with each section as a stop on it.
 *
 * Suits a profile read as a story: what you studied, then where you worked,
 * then what you built. The spine is decorative, so it is hidden from screen
 * readers and the headings carry the structure.
 */
export function TimelineTheme({ data, sections, accent }: ThemeProps) {
  const p = data.profile!

  return (
    <main
      className="mx-auto max-w-3xl px-5 py-16 sm:py-20"
      style={{ ["--accent" as string]: accent }}
    >
      <header className="pb-10">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{p.fullName}</h1>
        {p.headline ? <p className="mt-2 text-lg text-ink-soft">{p.headline}</p> : null}
      </header>

      <div className="relative">
        {/* the spine */}
        <div
          aria-hidden
          className="absolute bottom-2 left-[7px] top-2 w-px sm:left-[9px]"
          style={{ background: "var(--line)" }}
        />

        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.key} id={s.key} className="relative pl-8 sm:pl-10">
              <span
                aria-hidden
                className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-[3px] sm:h-[19px] sm:w-[19px]"
                style={{ borderColor: accent, background: "var(--paper)" }}
              />
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.11em]" style={{ color: accent }}>
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
      </div>

      <PoweredBy />
    </main>
  )
}
