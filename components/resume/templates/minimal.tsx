import { SectionBody } from "../engine/parts"
import { contactLine, linkLine, type TemplateProps } from "./types"

/**
 * MINIMAL — the ATS-safe template.
 *
 * Rules that make it parser-friendly, and which must not be "improved":
 *   · one column, so text order in the DOM is reading order
 *   · semantic headings, no icons used as labels
 *   · no text inside images, no columns, no tables for layout
 *   · plain contact line, each item separated by a bullet character
 */
export function MinimalTemplate({ profile, sections, config }: TemplateProps) {
  const contact = contactLine(profile)
  const links = linkLine(profile)

  return (
    <article className="doc doc--minimal" data-density={config.density}>
      <div className="doc__page" data-paper={config.paper}>
        <header style={{ marginBottom: "1.4em" }}>
          <h1 style={{ margin: 0, fontSize: "1.9em", fontWeight: 600, letterSpacing: "-0.01em" }}>
            {profile.fullName}
          </h1>
          {profile.headline ? (
            <p style={{ margin: "0.15em 0 0", fontSize: "1.05em" }}>{profile.headline}</p>
          ) : null}
          {contact.length ? (
            <p style={{ margin: "0.5em 0 0", opacity: 0.85 }}>{contact.join(" · ")}</p>
          ) : null}
          {links.length ? (
            <p style={{ margin: "0.15em 0 0", opacity: 0.85 }}>{links.join(" · ")}</p>
          ) : null}
        </header>

        {sections.map((s) => (
          <section key={s.key} className="doc__section" style={{ marginBottom: "1.15em" }}>
            <h2
              style={{
                margin: "0 0 0.4em",
                fontSize: "0.82em",
                fontWeight: 700,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                borderBottom: "0.5pt solid var(--doc-line)",
                paddingBottom: "0.25em",
              }}
            >
              {s.title}
            </h2>
            <SectionBody section={s} />
          </section>
        ))}
      </div>
    </article>
  )
}
