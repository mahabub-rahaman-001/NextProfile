import { z } from "zod"

/**
 * One schema per shape, shared by the form, the API route and the JSON columns.
 * If a value reaches the database without passing through here, that is a bug.
 */

const trimmed = (max: number) => z.string().trim().max(max)
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v))

/** Accepts "2024-06", "2024-06-01" or an ISO datetime; stores a Date. */
export const monthDate = z
  .union([z.string(), z.date(), z.null()])
  .optional()
  .transform((v) => {
    if (v == null || v === "") return null
    if (v instanceof Date) return v
    const s = /^\d{4}-\d{2}$/.test(v) ? `${v}-01` : v
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? null : d
  })

export const urlish = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v))
  .refine((v) => v === undefined || /^https?:\/\/.+/.test(v), {
    message: "Enter a full address starting with http:// or https://",
  })

/**
 * Image locations, which come from two places and so cannot use `urlish`:
 * an absolute https URL when STORAGE_DRIVER is "s3" (bucket or CDN), and a
 * site-relative "/uploads/…" path from the local driver.
 *
 * Everything else is refused. Without this, `photoUrl` and `avatarUrl` were
 * free text while every other link field required http(s) — an inconsistency
 * that let a scheme like `javascript:` or a `data:` document be stored, even
 * though today they only ever reach an <img src>.
 */
const IMAGE_URL = /^(https?:\/\/[^\s]+|\/[^/\\][^\s]*)$/

export const imageUrlish = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v))
  .refine((v) => v === undefined || IMAGE_URL.test(v), {
    message: "Use a full https:// address or an uploaded image.",
  })

/** The same rule where the field is required rather than optional. */
export const imageUrlRequired = z
  .string()
  .trim()
  .max(500)
  .refine((v) => IMAGE_URL.test(v), {
    message: "Use a full https:// address or an uploaded image.",
  })

// ============================= profile =============================

export const profileTypeSchema = z.enum([
  "STUDENT",
  "JOB_SEEKER",
  "PROFESSIONAL",
  "FREELANCER",
  "RESEARCHER",
  "TEACHER",
  "CREATIVE",
  "ENTREPRENEUR",
  "OTHER",
])

export const careerGoalSchema = z.enum([
  "INTERNSHIP",
  "FIND_JOB",
  "HIGHER_STUDY",
  "FREELANCE_CLIENTS",
  "BUILD_PORTFOLIO",
  "PROFESSIONAL_PRESENCE",
  "PROMOTE_SERVICES",
  "PERSONAL_BRAND",
])

export const wantsSchema = z.array(z.enum(["resume", "cv", "portfolio", "profile"])).max(4)

export const onboardingSchema = z.object({
  profileType: profileTypeSchema,
  discipline: optionalText(60),
  careerGoal: careerGoalSchema,
  wants: wantsSchema,
})

export const contactSchema = z.object({
  email: optionalText(200),
  phone: optionalText(40),
  showEmail: z.boolean().default(false),
  showPhone: z.boolean().default(false),
  showLocation: z.boolean().default(true),
})

export const linksSchema = z.object({
  website: urlish,
  github: urlish,
  linkedin: urlish,
  behance: urlish,
  dribbble: urlish,
  scholar: urlish,
  orcid: urlish,
  x: urlish,
})

export const seoSchema = z.object({
  metaTitle: optionalText(70),
  metaDescription: optionalText(160),
  allowIndexing: z.boolean().default(true),
})

export const profileSchema = z.object({
  fullName: trimmed(120).min(2, "Your name is needed — it appears on everything you publish."),
  headline: optionalText(140),
  about: optionalText(2000),
  location: optionalText(120),
  photoUrl: imageUrlish,
  languages: z.array(trimmed(60)).max(20).default([]),
  contact: contactSchema.partial().optional(),
  links: linksSchema.partial().optional(),
  seo: seoSchema.partial().optional(),
})

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Usernames are at least 3 characters.")
  .max(30, "Usernames are at most 30 characters.")
  .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Use letters, numbers and hyphens only.")

// ============================= record sections =============================

export const educationSchema = z.object({
  institution: trimmed(200).min(2, "Which institution?"),
  degree: optionalText(160),
  field: optionalText(160),
  startDate: monthDate,
  endDate: monthDate,
  current: z.boolean().default(false),
  grade: optionalText(40),
  details: optionalText(1200),
})

export const experienceSchema = z.object({
  company: trimmed(200).min(1, "Where did you work?"),
  role: trimmed(200).min(1, "What was your role?"),
  employment: optionalText(40),
  location: optionalText(120),
  startDate: monthDate,
  endDate: monthDate,
  current: z.boolean().default(false),
  summary: optionalText(600),
  bullets: z.array(trimmed(400)).max(12).default([]),
})

export const skillSchema = z.object({
  name: trimmed(80).min(1, "Name the skill."),
  category: optionalText(60),
  level: z.coerce.number().int().min(1).max(5).optional().nullable(),
})

export const projectSchema = z.object({
  title: trimmed(200).min(1, "Give the project a title."),
  summary: optionalText(300),
  description: optionalText(4000),
  role: optionalText(160),
  outcome: optionalText(600),
  tags: z.array(trimmed(40)).max(30).default([]),
  links: z
    .object({ live: urlish, repo: urlish, caseStudy: urlish, video: urlish })
    .partial()
    .optional(),
  images: z
    .array(
      z.object({
        url: imageUrlRequired,
        alt: z.string().max(200).default(""),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
    )
    .max(10)
    .default([]),
  startDate: monthDate,
  endDate: monthDate,
  featured: z.boolean().default(false),
})

export const certificationSchema = z.object({
  name: trimmed(200).min(1, "Name the certification."),
  issuer: optionalText(160),
  issueDate: monthDate,
  expiryDate: monthDate,
  credentialId: optionalText(120),
  credentialUrl: urlish,
})

export const achievementSchema = z.object({
  title: trimmed(200).min(1, "What did you achieve?"),
  issuer: optionalText(160),
  date: monthDate,
  description: optionalText(1000),
  kind: optionalText(40), // award | competition | scholarship | volunteering | club
})

export const publicationSchema = z.object({
  title: trimmed(300).min(1, "Title of the publication."),
  authors: z.array(trimmed(120)).max(40).default([]),
  venue: optionalText(200),
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  type: optionalText(40),
  doi: optionalText(120),
  url: urlish,
  citation: optionalText(1000),
})

export const researchSchema = z.object({
  title: trimmed(300).min(1, "Title of the research."),
  supervisor: optionalText(160),
  institution: optionalText(200),
  abstract: optionalText(3000),
  status: optionalText(40),
  startDate: monthDate,
  endDate: monthDate,
})

export const conferenceSchema = z.object({
  title: trimmed(300).min(1, "Title of the talk or poster."),
  event: optionalText(200),
  role: optionalText(60),
  location: optionalText(120),
  date: monthDate,
  url: urlish,
})

export const serviceSchema = z.object({
  title: trimmed(160).min(1, "Name the service."),
  description: optionalText(1200),
  priceNote: optionalText(80),
  deliverable: optionalText(200),
})

export const caseStudySchema = z.object({
  title: trimmed(200).min(1, "Give the case study a title."),
  client: optionalText(160),
  problem: optionalText(2000),
  approach: optionalText(2000),
  outcome: optionalText(2000),
  images: z
    .array(z.object({ url: imageUrlRequired, alt: z.string().max(200).default("") }))
    .max(10)
    .default([]),
  url: urlish,
})

export const testimonialSchema = z.object({
  quote: trimmed(1000).min(1, "What did they say?"),
  author: trimmed(160).min(1, "Who said it?"),
  role: optionalText(160),
  company: optionalText(160),
  avatarUrl: imageUrlish,
})

// ============================= presentation configs =============================

export const docConfigSchema = z.object({
  sectionOrder: z.array(z.string().max(40)).max(30).optional(),
  hidden: z.array(z.string().max(40)).max(30).default([]),
  density: z.enum(["compact", "regular", "spacious"]).default("regular"),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#0E5C4A"),
  paper: z.enum(["A4", "LETTER"]).default("A4"),
  onePage: z.boolean().default(false),
})
export type DocConfig = z.infer<typeof docConfigSchema>

export const portfolioConfigSchema = z.object({
  sections: z
    .array(z.object({ id: z.string().max(40), visible: z.boolean().default(true) }))
    .max(30)
    .optional(),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#0E5C4A"),
  heroStyle: z.enum(["centered", "split"]).default("split"),
  showContactForm: z.boolean().default(false),
})
export type PortfolioConfig = z.infer<typeof portfolioConfigSchema>

// ============================= auth =============================

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("That doesn't look like an email address."),
  password: z.string().min(8, "Use at least 8 characters."),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("That doesn't look like an email address."),
  password: z.string().min(1, "Enter your password."),
})

// ============================= registry =============================

export const SECTION_SCHEMAS = {
  education: educationSchema,
  experience: experienceSchema,
  skills: skillSchema,
  projects: projectSchema,
  certifications: certificationSchema,
  achievements: achievementSchema,
  publications: publicationSchema,
  research: researchSchema,
  conferences: conferenceSchema,
  services: serviceSchema,
  caseStudies: caseStudySchema,
  testimonials: testimonialSchema,
} as const
