import { formatMonth, formatRange } from "@/lib/utils"
import { simpleShape, type ResolvedSection } from "./resolve"

/**
 * Shared building blocks. Each template composes these with its own spacing
 * and typography — but the content, order and semantics stay identical, so a
 * template switch never loses information.
 */

export function SkillGroups({ items }: { items: ResolvedSection["items"] }) {
  const groups = new Map<string, string[]>()
  for (const s of items) {
    const key = s.category?.trim() || "Skills"
    groups.set(key, [...(groups.get(key) ?? []), s.name])
  }
  const entries = [...groups.entries()]

  // One unnamed group reads better as a single line than as a labelled list.
  if (entries.length === 1 && entries[0][0] === "Skills") {
    return <p>{entries[0][1].join(" · ")}</p>
  }

  return (
    <dl className="doc__skills">
      {entries.map(([group, names]) => (
        <div key={group} className="doc__entry" style={{ display: "flex", gap: "0.5em", marginBottom: "0.2em" }}>
          <dt style={{ fontWeight: 600, minWidth: "8em" }}>{group}</dt>
          <dd style={{ margin: 0 }}>{names.join(", ")}</dd>
        </div>
      ))}
    </dl>
  )
}

export function EducationList({ items }: { items: ResolvedSection["items"] }) {
  return (
    <>
      {items.map((e) => (
        <div key={e.id} className="doc__entry" style={{ marginBottom: "0.7em" }}>
          <Line
            left={<strong>{e.institution}</strong>}
            right={formatRange(e.startDate, e.endDate, e.current)}
          />
          <Line
            left={<span>{[e.degree, e.field].filter(Boolean).join(", ")}</span>}
            right={e.grade}
            muted
          />
          {e.details ? <Note>{e.details}</Note> : null}
        </div>
      ))}
    </>
  )
}

export function ExperienceList({ items }: { items: ResolvedSection["items"] }) {
  return (
    <>
      {items.map((x) => (
        <div key={x.id} className="doc__entry" style={{ marginBottom: "0.8em" }}>
          <Line left={<strong>{x.role}</strong>} right={formatRange(x.startDate, x.endDate, x.current)} />
          <Line
            left={<span>{[x.company, x.employment].filter(Boolean).join(" · ")}</span>}
            right={x.location}
            muted
          />
          {x.summary ? <Note>{x.summary}</Note> : null}
          {x.bullets?.length ? (
            <ul style={{ margin: "0.25em 0 0", paddingLeft: "1.1em" }}>
              {x.bullets.map((b: string, i: number) => (
                <li key={i} style={{ marginBottom: "0.12em" }}>
                  {b}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </>
  )
}

export function ProjectList({ items }: { items: ResolvedSection["items"] }) {
  return (
    <>
      {items.map((p) => (
        <div key={p.id} className="doc__entry" style={{ marginBottom: "0.7em" }}>
          <Line left={<strong>{p.title}</strong>} right={formatRange(p.startDate, p.endDate)} />
          {p.summary ? <Note>{p.summary}</Note> : null}
          {p.outcome ? <Note>{p.outcome}</Note> : null}
          {p.tags?.length ? (
            <p style={{ margin: "0.15em 0 0", opacity: 0.75 }}>{p.tags.join(" · ")}</p>
          ) : null}
        </div>
      ))}
    </>
  )
}

export function PublicationList({ items }: { items: ResolvedSection["items"] }) {
  return (
    <ol style={{ margin: 0, paddingLeft: "1.2em" }}>
      {items.map((p) => (
        <li key={p.id} className="doc__entry" style={{ marginBottom: "0.4em" }}>
          {p.citation ? (
            <span>{p.citation}</span>
          ) : (
            <span>
              {p.authors?.length ? `${p.authors.join(", ")}. ` : null}
              <em>{p.title}</em>
              {p.venue ? `. ${p.venue}` : null}
              {p.year ? `, ${p.year}` : null}
              {p.doi ? `. doi:${p.doi}` : null}
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}

export function SimpleList({ sectionKey, items }: { sectionKey: string; items: ResolvedSection["items"] }) {
  return (
    <>
      {items.map((raw) => {
        const it = simpleShape(sectionKey, raw)
        return (
          <div key={raw.id} className="doc__entry" style={{ marginBottom: "0.5em" }}>
            <Line
              left={
                <span>
                  <strong>{it.title}</strong>
                  {it.subtitle ? <span style={{ opacity: 0.8 }}> — {it.subtitle}</span> : null}
                </span>
              }
              right={it.date ? formatMonth(it.date) : undefined}
            />
            {it.note ? <Note>{clamp(it.note, 240)}</Note> : null}
          </div>
        )
      })}
    </>
  )
}

export function QuoteList({ items }: { items: ResolvedSection["items"] }) {
  return (
    <>
      {items.map((t) => (
        <div key={t.id} className="doc__entry" style={{ marginBottom: "0.6em" }}>
          <p style={{ margin: 0, fontStyle: "italic" }}>“{clamp(t.quote, 220)}”</p>
          <p style={{ margin: "0.15em 0 0", opacity: 0.75 }}>
            — {[t.author, t.role, t.company].filter(Boolean).join(", ")}
          </p>
        </div>
      ))}
    </>
  )
}

export function SectionBody({ section }: { section: ResolvedSection }) {
  switch (section.kind) {
    case "text":
      return <p style={{ margin: 0 }}>{section.text}</p>
    case "education":
      return <EducationList items={section.items} />
    case "experience":
      return <ExperienceList items={section.items} />
    case "projects":
      return <ProjectList items={section.items} />
    case "skills":
      return <SkillGroups items={section.items} />
    case "publications":
      return <PublicationList items={section.items} />
    case "quotes":
      return <QuoteList items={section.items} />
    default:
      return <SimpleList sectionKey={section.key} items={section.items} />
  }
}

function Line({
  left,
  right,
  muted,
}: {
  left: React.ReactNode
  right?: React.ReactNode
  muted?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "1em",
        opacity: muted ? 0.8 : 1,
      }}
    >
      <span style={{ minWidth: 0 }}>{left}</span>
      {right ? (
        <span style={{ flex: "none", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
          {right}
        </span>
      ) : null}
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0.15em 0 0" }}>{children}</p>
}

function clamp(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s
}
