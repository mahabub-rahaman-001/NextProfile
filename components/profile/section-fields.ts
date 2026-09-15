/**
 * Field configuration for each record section — client-safe data only, so a
 * server page can hand it to the generic editor without passing functions.
 *
 * Placeholders are written per section and (where it matters) per profile
 * type, because "e.g. Dhaka University" beats an empty box every time.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "month"
  | "checkbox"
  | "number"
  | "tags"
  | "bullets"
  | "select"
  | "images"

export type FieldDef = {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  help?: string
  required?: boolean
  half?: boolean
  options?: { value: string; label: string }[]
  targetWords?: [number, number]
  rows?: number
}

export type SectionUI = {
  title: string
  item: string
  blurb: string
  fields: FieldDef[]
  /** Which keys build the row summary in the list. */
  summary: {
    title: string
    subtitle?: string[]
    range?: { start: string; end: string; current?: string }
    meta?: string
  }
}

const EMPLOYMENT = [
  { value: "", label: "Not specified" },
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Internship", label: "Internship" },
  { value: "Contract", label: "Contract" },
  { value: "Freelance", label: "Freelance" },
  { value: "Volunteer", label: "Volunteer" },
]

export const SECTION_UI: Record<string, SectionUI> = {
  education: {
    title: "Education",
    item: "education entry",
    blurb: "Where you studied. Most recent first — you can reorder any time.",
    fields: [
      { name: "institution", label: "Institution", type: "text", required: true, placeholder: "e.g. University of Dhaka" },
      { name: "degree", label: "Degree", type: "text", half: true, placeholder: "e.g. BSc, BBA, MSc" },
      { name: "field", label: "Subject", type: "text", half: true, placeholder: "e.g. Computer Science" },
      { name: "startDate", label: "Started", type: "month", half: true },
      { name: "endDate", label: "Finished", type: "month", half: true, help: "Leave empty if you're still studying" },
      { name: "current", label: "I'm still studying here", type: "checkbox" },
      { name: "grade", label: "Result", type: "text", half: true, placeholder: "e.g. 3.74 / 4.00 or First class", help: "Optional — write it the way your institution does" },
      { name: "details", label: "Anything worth adding", type: "textarea", rows: 3, placeholder: "e.g. Relevant coursework, thesis title, or an award from this programme" },
    ],
    summary: {
      title: "institution",
      subtitle: ["degree", "field"],
      range: { start: "startDate", end: "endDate", current: "current" },
      meta: "grade",
    },
  },

  experience: {
    title: "Work experience",
    item: "job",
    blurb: "Jobs, internships and volunteering. Describe what you did, then what came of it.",
    fields: [
      { name: "role", label: "Your role", type: "text", required: true, half: true, placeholder: "e.g. Marketing Intern" },
      { name: "company", label: "Organisation", type: "text", required: true, half: true, placeholder: "e.g. Shopfront Ltd." },
      { name: "employment", label: "Type", type: "select", half: true, options: EMPLOYMENT },
      { name: "location", label: "Location", type: "text", half: true, placeholder: "e.g. Dhaka, or Remote" },
      { name: "startDate", label: "Started", type: "month", half: true },
      { name: "endDate", label: "Finished", type: "month", half: true },
      { name: "current", label: "I work here now", type: "checkbox" },
      { name: "summary", label: "One-line summary", type: "text", placeholder: "e.g. Three-month internship on the order management team" },
      {
        name: "bullets",
        label: "What you did",
        type: "bullets",
        rows: 5,
        help: "One point per line. Start with a verb, and add the result where you know it — \"Cut a nightly job from 40 minutes to 9\" beats \"Responsible for jobs\".",
      },
    ],
    summary: {
      title: "role",
      subtitle: ["company", "employment"],
      range: { start: "startDate", end: "endDate", current: "current" },
    },
  },

  skills: {
    title: "Skills",
    item: "skill",
    blurb: "Group them so a reader can scan. Levels are optional and never shown on ATS-safe templates.",
    fields: [
      { name: "name", label: "Skill", type: "text", required: true, half: true, placeholder: "e.g. Excel" },
      { name: "category", label: "Group", type: "text", half: true, placeholder: "e.g. Tools" },
      { name: "level", label: "Level (1–5)", type: "number", half: true, help: "Optional" },
    ],
    summary: { title: "name", subtitle: ["category"] },
  },

  projects: {
    title: "Projects",
    item: "project",
    blurb: "Course work, side projects, client work — anything you made.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, placeholder: "e.g. Campus Event Manager" },
      { name: "summary", label: "One line", type: "text", placeholder: "e.g. Event registration system used by six university clubs", help: "This is what appears on your resume" },
      { name: "description", label: "Full description", type: "textarea", rows: 5, targetWords: [40, 120], help: "This appears on your portfolio. What was it, who was it for, what did you build?" },
      { name: "role", label: "What you did", type: "text", half: true, placeholder: "e.g. Built the backend" },
      { name: "outcome", label: "Result", type: "text", half: true, placeholder: "e.g. Used for 40+ events in one semester" },
      { name: "tags", label: "Tools and methods", type: "tags", placeholder: "Next.js, PostgreSQL, QR" },
      { name: "images", label: "Project images", type: "images", help: "Upload screenshots. First image is the cover." },
      { name: "startDate", label: "Started", type: "month", half: true },
      { name: "endDate", label: "Finished", type: "month", half: true },
      { name: "featured", label: "Feature this on my portfolio", type: "checkbox" },
    ],
    summary: { title: "title", subtitle: ["role"], meta: "outcome", range: { start: "startDate", end: "endDate" } },
  },

  certifications: {
    title: "Certifications",
    item: "certification",
    blurb: "Courses and credentials with an issuer.",
    fields: [
      { name: "name", label: "Certification", type: "text", required: true, placeholder: "e.g. Google Analytics Certification" },
      { name: "issuer", label: "Issued by", type: "text", half: true, placeholder: "e.g. Google" },
      { name: "issueDate", label: "Issued", type: "month", half: true },
      { name: "expiryDate", label: "Expires", type: "month", half: true, help: "Only if it does" },
      { name: "credentialUrl", label: "Credential link", type: "text", half: true, placeholder: "https://…" },
    ],
    summary: { title: "name", subtitle: ["issuer"], range: { start: "issueDate", end: "expiryDate" } },
  },

  achievements: {
    title: "Achievements & activities",
    item: "achievement",
    blurb: "Awards, competitions, scholarships, clubs and volunteering.",
    fields: [
      { name: "title", label: "What was it", type: "text", required: true, placeholder: "e.g. Runner-up, Inter-University Hackathon" },
      { name: "issuer", label: "Awarded by", type: "text", half: true, placeholder: "e.g. NSU ACM" },
      { name: "date", label: "When", type: "month", half: true },
      {
        name: "kind",
        label: "Type",
        type: "select",
        half: true,
        options: [
          { value: "", label: "Not specified" },
          { value: "award", label: "Award" },
          { value: "competition", label: "Competition" },
          { value: "scholarship", label: "Scholarship" },
          { value: "club", label: "Club or society" },
          { value: "volunteering", label: "Volunteering" },
        ],
      },
      { name: "description", label: "Detail", type: "textarea", rows: 3, placeholder: "e.g. Built a flood-alert routing tool in 36 hours, placed second out of 64 teams" },
    ],
    summary: { title: "title", subtitle: ["issuer", "kind"], range: { start: "date", end: "date" } },
  },

  publications: {
    title: "Publications",
    item: "publication",
    blurb: "Journal articles, conference papers, preprints and chapters.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "authors", label: "Authors", type: "tags", placeholder: "Ahmed, T., Khatun, R., Weber, S.", help: "Comma separated, in publication order" },
      { name: "venue", label: "Journal or conference", type: "text", half: true },
      { name: "year", label: "Year", type: "number", half: true },
      {
        name: "type",
        label: "Type",
        type: "select",
        half: true,
        options: [
          { value: "", label: "Not specified" },
          { value: "journal", label: "Journal article" },
          { value: "conference", label: "Conference paper" },
          { value: "preprint", label: "Preprint" },
          { value: "chapter", label: "Book chapter" },
          { value: "thesis", label: "Thesis" },
        ],
      },
      { name: "doi", label: "DOI", type: "text", half: true, placeholder: "10.0000/…" },
      { name: "url", label: "Link", type: "text", placeholder: "https://…" },
      { name: "citation", label: "Formatted citation", type: "textarea", rows: 3, help: "Optional. If you paste one, we print it exactly as written." },
    ],
    summary: { title: "title", subtitle: ["venue"], meta: "year" },
  },

  research: {
    title: "Research & thesis",
    item: "research entry",
    blurb: "Ongoing and completed research, including your thesis.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "supervisor", label: "Supervisor", type: "text", half: true },
      { name: "institution", label: "Institution", type: "text", half: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        half: true,
        options: [
          { value: "", label: "Not specified" },
          { value: "ongoing", label: "Ongoing" },
          { value: "completed", label: "Completed" },
          { value: "submitted", label: "Submitted" },
        ],
      },
      { name: "startDate", label: "Started", type: "month", half: true },
      { name: "endDate", label: "Finished", type: "month", half: true },
      { name: "abstract", label: "Abstract", type: "textarea", rows: 5 },
    ],
    summary: { title: "title", subtitle: ["institution", "status"], range: { start: "startDate", end: "endDate" } },
  },

  conferences: {
    title: "Conferences & talks",
    item: "conference or talk",
    blurb: "Talks, posters and panels.",
    fields: [
      { name: "title", label: "Title of your talk or poster", type: "text", required: true },
      { name: "event", label: "Event", type: "text", half: true, placeholder: "e.g. ECCMID 2024" },
      {
        name: "role",
        label: "Role",
        type: "select",
        half: true,
        options: [
          { value: "", label: "Not specified" },
          { value: "Speaker", label: "Speaker" },
          { value: "Poster", label: "Poster" },
          { value: "Panelist", label: "Panelist" },
          { value: "Attendee", label: "Attendee" },
        ],
      },
      { name: "location", label: "Location", type: "text", half: true },
      { name: "date", label: "When", type: "month", half: true },
      { name: "url", label: "Link", type: "text", placeholder: "https://…" },
    ],
    summary: { title: "title", subtitle: ["event", "role"], range: { start: "date", end: "date" } },
  },

  services: {
    title: "Services",
    item: "service",
    blurb: "What clients can hire you for, and what they get.",
    fields: [
      { name: "title", label: "Service", type: "text", required: true, placeholder: "e.g. Product design sprint" },
      { name: "description", label: "What it involves", type: "textarea", rows: 4, targetWords: [20, 60] },
      { name: "deliverable", label: "What they get", type: "text", half: true, placeholder: "e.g. Figma file + prototype" },
      { name: "priceNote", label: "Price note", type: "text", half: true, placeholder: "e.g. from $4,000", help: "Free text — write it however you quote" },
    ],
    summary: { title: "title", subtitle: ["deliverable"], meta: "priceNote" },
  },

  "case-studies": {
    title: "Case studies",
    item: "case study",
    blurb: "The problem, what you did, and what changed. This is what wins clients.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true, placeholder: "e.g. Rebuilding onboarding for a lending app" },
      { name: "client", label: "Client", type: "text", half: true, placeholder: "e.g. Fintech startup (Series A)", help: "A description is fine if you can't name them" },
      { name: "url", label: "Link", type: "text", half: true, placeholder: "https://…" },
      { name: "problem", label: "The problem", type: "textarea", rows: 3 },
      { name: "approach", label: "What you did", type: "textarea", rows: 3 },
      { name: "outcome", label: "What changed", type: "textarea", rows: 3, help: "Numbers if you have them, an honest description if you don't" },
    ],
    summary: { title: "title", subtitle: ["client"] },
  },

  testimonials: {
    title: "Testimonials",
    item: "testimonial",
    blurb: "What people you've worked with have said.",
    fields: [
      { name: "quote", label: "What they said", type: "textarea", rows: 4, required: true },
      { name: "author", label: "Who said it", type: "text", required: true, half: true },
      { name: "role", label: "Their role", type: "text", half: true },
      { name: "company", label: "Their organisation", type: "text", half: true },
    ],
    summary: { title: "author", subtitle: ["role", "company"], meta: "quote" },
  },
}
