import { SectionBody } from "../engine/parts"
import { contactLine, linkLine, type TemplateProps } from "./types"

/**
 * MODERN — single column, tighter, with the accent carried by rules and a
 * hanging section label. Denser than Minimal without becoming a grid.
 */
export function ModernTemplate({ profile, sections, config }: TemplateProps) {
  const contact = [...contactLine(profile), ...linkLine(profile)]

  return (
    <article className="doc doc--modern" data-density={config.density}>
      <div className="doc__page" data-paper={config.paper}>
        <header style={{ marginBottom: "1.5em" }}>
          <div style={{ height: "3pt", width: "3.2em", background: config.accent, marginBottom: "0.7em" }} />
          <h1 style={{ margin: 0, fontSize: "2.1em", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            {profile.fullName}
          </h1>
          {profile.headline ? (
            <p style={{ margin: "0.25em 0 0", fontSize: "1.05em", opacity: 0.9 }}>{profile.headline}</p>
          ) : null}
          {contact.length ? (
            <p style={{ margin: "0.6em 0 0", fontSize: "0.92em", opacity: 0.8 }}>
              {contact.join("  ·  ")}
            </p>
          ) : null}
        </header>

        {sections.map((s) => (
          <section
            key={s.key}
            className="doc__section"
            style={{
              display: "flex",
              gap: "1.2em",
              marginBottom: "1em",
              borderTop: "0.5pt solid var(--doc-line)",
              paddingTop: "0.6em",
            }}
          >
            <h2
              style={{
                flex: "0 0 7em",
                margin: 0,
                fontSize: "0.78em",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: config.accent,
              }}
            >
              {s.title}
            </h2>
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <SectionBody section={s} />
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
