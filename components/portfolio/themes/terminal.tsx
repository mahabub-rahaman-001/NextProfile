import { SectionContent } from "../blocks"
import { PoweredBy, type ThemeProps } from "./types"

/**
 * TERMINAL — monospace, dark, developer.
 *
 * Commits to one look rather than following the viewer's theme: a terminal
 * that turns white in light mode is not a terminal. Every colour is painted
 * explicitly so it holds on either host background.
 */
export function TerminalTheme({ data, sections, accent }: ThemeProps) {
  const p = data.profile!

  return (
    <main
      className="min-h-screen font-mono"
      style={{ background: "#0b0f0d", color: "#cfd8d3", ["--accent" as string]: accent }}
    >
      <div className="mx-auto max-w-3xl px-5 py-14">
        <div className="flex items-center gap-2 border-b border-[#1e2a25] pb-3 text-xs">
          <span style={{ color: "#3f5a50" }}>●●●</span>
          <span style={{ color: "#6b7f76" }}>
            {p.fullName.toLowerCase().replace(/\s+/g, "-")} — profile
          </span>
        </div>

        <header className="mt-8">
          <p className="text-sm" style={{ color: "#6b7f76" }}>
            <span style={{ color: accent }}>$</span> whoami
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight" style={{ color: "#eef4f1" }}>
            {p.fullName}
          </h1>
          {p.headline ? (
            <p className="mt-1 text-sm" style={{ color: "#9fb3aa" }}>
              {p.headline}
            </p>
          ) : null}
        </header>

        <div className="mt-12 space-y-12">
          {sections.map((s) => (
            <section key={s.key} id={s.key}>
              <h2 className="text-sm" style={{ color: "#6b7f76" }}>
                <span style={{ color: accent }}>$</span> cat{" "}
                <span style={{ color: "#eef4f1" }}>
                  {s.key.replace(/([A-Z])/g, "-$1").toLowerCase()}.md
                </span>
              </h2>
              <div
                className="mt-3 border-l-2 pl-4 text-sm leading-relaxed"
                style={{ borderColor: "#1e2a25" }}
              >
                <div className="[&_*]:!text-inherit [&_a]:!underline">
                  <SectionContent
                    sectionKey={s.key}
                    items={s.items as never[]}
                    data={data}
                    projectVariant="row"
                  />
                </div>
              </div>
            </section>
          ))}
        </div>

        <p className="mt-16 border-t pt-5 text-xs" style={{ borderColor: "#1e2a25", color: "#4c6058" }}>
          <span style={{ color: accent }}>$</span> built with NextProfile
        </p>
        <div className="hidden">
          <PoweredBy />
        </div>
      </div>
    </main>
  )
}
