import { Avatar, ContactBlock, SectionContent } from "../blocks"
import { PoweredBy, type ThemeProps } from "./types"

/**
 * SIDEBAR — identity pinned on the left, work scrolling on the right.
 *
 * The one theme where the photo, name and contact details stay on screen the
 * whole way down. On a phone the rail becomes an ordinary header.
 */
export function SidebarTheme({ data, sections, accent }: ThemeProps) {
  const p = data.profile!
  const body = sections.filter((s) => s.key !== "contact")

  return (
    <main className="lg:flex" style={{ ["--accent" as string]: accent }}>
      <aside className="border-b border-[--line] bg-[--surface] px-6 py-10 lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:py-14">
        <Avatar profile={p} size={104} rounded="full" />
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">{p.fullName}</h1>
        {p.headline ? <p className="mt-1 text-ink-soft">{p.headline}</p> : null}

        <div className="mt-6 border-t border-[--line] pt-6 text-sm">
          <ContactBlock data={data} />
        </div>

        {body.length > 2 ? (
          <nav className="mt-6 hidden border-t border-[--line] pt-6 lg:block">
            <ul className="space-y-1.5">
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

      <div className="min-w-0 flex-1 px-5 py-12 sm:px-10 lg:py-16">
        <div className="max-w-2xl space-y-14">
          {body.map((s) => (
            <section key={s.key} id={s.key} className="scroll-mt-8">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
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
          <PoweredBy />
        </div>
      </div>
    </main>
  )
}
