import { SectionBody } from "../engine/parts"
import { contactLine, linkLine, photoOf, type TemplateProps } from "./types"

/**
 * PROFESSIONAL — two columns.
 *
 * Short, scannable sections move to the sidebar; anything with narrative stays
 * in the main column. Not ATS-safe, and the UI says so: automated parsers read
 * column order badly.
 */
const SIDEBAR = new Set(["skills", "certifications", "services"])

export function ProfessionalTemplate({ profile, sections, config }: TemplateProps) {
  const contact = contactLine(profile)
  const links = linkLine(profile)
  const photo = photoOf(profile)
  const side = sections.filter((s) => SIDEBAR.has(s.key))
  const main = sections.filter((s) => !SIDEBAR.has(s.key))
  const languages = profile.languages ?? []

  return (
    <article className="doc doc--professional" data-density={config.density}>
      <div className="doc__page" data-paper={config.paper}>
        <header
          style={{
            borderBottom: `2pt solid ${config.accent}`,
            paddingBottom: "0.6em",
            marginBottom: "1.1em",
            display: "flex",
            alignItems: "center",
            gap: "1em",
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt=""
              style={{ width: "3.4em", height: "3.4em", objectFit: "cover", borderRadius: "50%", flex: "none" }}
            />
          ) : null}
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: "1.85em", fontWeight: 700 }}>{profile.fullName}</h1>
            {profile.headline ? (
              <p style={{ margin: "0.1em 0 0", fontSize: "1.02em", color: config.accent, fontWeight: 500 }}>
                {profile.headline}
              </p>
            ) : null}
          </div>
        </header>

        <div style={{ display: "flex", gap: "1.6em", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            {main.map((s) => (
              <section key={s.key} className="doc__section" style={{ marginBottom: "1.1em" }}>
                <SectionHeading accent={config.accent}>{s.title}</SectionHeading>
                <SectionBody section={s} />
              </section>
            ))}
          </div>

          <aside style={{ flex: "0 0 31%", fontSize: "0.94em" }}>
            {contact.length || links.length ? (
              <section className="doc__section" style={{ marginBottom: "1em" }}>
                <SectionHeading accent={config.accent}>Contact</SectionHeading>
                {contact.map((c) => (
                  <p key={c} style={{ margin: "0 0 0.15em", wordBreak: "break-word" }}>
                    {c}
                  </p>
                ))}
                {links.map((l) => (
                  <p key={l} style={{ margin: "0 0 0.15em", wordBreak: "break-word", opacity: 0.85 }}>
                    {l}
                  </p>
                ))}
              </section>
            ) : null}

            {side.map((s) => (
              <section key={s.key} className="doc__section" style={{ marginBottom: "1em" }}>
                <SectionHeading accent={config.accent}>{s.title}</SectionHeading>
                <SectionBody section={s} />
              </section>
            ))}

            {languages.length ? (
              <section className="doc__section">
                <SectionHeading accent={config.accent}>Languages</SectionHeading>
                <p style={{ margin: 0 }}>{languages.join(", ")}</p>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </article>
  )
}

function SectionHeading({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <h2
      style={{
        margin: "0 0 0.4em",
        fontSize: "0.8em",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: accent,
      }}
    >
      {children}
    </h2>
  )
}
