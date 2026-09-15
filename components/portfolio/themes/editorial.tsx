import { Avatar, SectionContent } from "../blocks"
import { PoweredBy, type ThemeProps } from "./types"

/**
 * EDITORIAL — a magazine feature.
 *
 * Oversized serif headline, a standfirst, and section titles set as small
 * numbered rules down the page. Wide screens get a two-column reading measure
 * for prose; everything narrows to one column on a phone.
 */
export function EditorialTheme({ data, sections, accent }: ThemeProps) {
  const p = data.profile!

  return (
    <main
      className="mx-auto max-w-4xl px-5 py-16 sm:py-24"
      style={{ ["--accent" as string]: accent }}
    >
      <header className="border-b-2 border-ink pb-8">
        <p className="font-serif text-sm italic text-ink-soft">Profile</p>
        <h1 className="mt-3 font-serif text-[clamp(2.5rem,9vw,5rem)] font-medium leading-[0.95] tracking-tight">
          {p.fullName}
        </h1>
        {p.headline ? (
          <p className="mt-5 max-w-measure font-serif text-xl leading-snug text-ink-soft sm:text-2xl">
            {p.headline}
          </p>
        ) : null}
        {p.photoUrl ? (
          <div className="mt-8">
            <Avatar profile={p} size={140} rounded="none" />
          </div>
        ) : null}
      </header>

      <div className="mt-16 space-y-16">
        {sections.map((s, i) => (
          <section key={s.key} id={s.key}>
            <div className="mb-5 flex items-baseline gap-4 border-t border-[--line] pt-4">
              <span
                className="font-serif text-2xl italic"
                style={{ color: accent }}
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="font-serif text-2xl font-medium">{s.title}</h2>
            </div>
            <div className="[&_p]:font-serif [&_p]:text-[1.02rem] [&_p]:leading-relaxed">
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

      <PoweredBy />
    </main>
  )
}
