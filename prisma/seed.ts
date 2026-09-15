/**
 * Five fixture profiles — one per core profile type.
 *
 * These are the test data for every resume template and portfolio theme.
 * A template that cannot render all five is not finished.
 *
 * Password for every fixture account: demo1234
 */
import { PrismaClient, type Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

const d = (s: string) => new Date(`${s}-01T00:00:00Z`)
const order = (i: number) => (i + 1) * 1000

type Fixture = {
  email: string
  username: string
  profile: Prisma.ProfileCreateWithoutUserInput
  education?: Prisma.EducationCreateWithoutUserInput[]
  experience?: Prisma.ExperienceCreateWithoutUserInput[]
  skills?: Prisma.SkillCreateWithoutUserInput[]
  projects?: Prisma.ProjectCreateWithoutUserInput[]
  certifications?: Prisma.CertificationCreateWithoutUserInput[]
  achievements?: Prisma.AchievementCreateWithoutUserInput[]
  publications?: Prisma.PublicationCreateWithoutUserInput[]
  research?: Prisma.ResearchCreateWithoutUserInput[]
  conferences?: Prisma.ConferenceCreateWithoutUserInput[]
  services?: Prisma.ServiceCreateWithoutUserInput[]
  caseStudies?: Prisma.CaseStudyCreateWithoutUserInput[]
  testimonials?: Prisma.TestimonialCreateWithoutUserInput[]
  templateId: string
  themeId: string
  docKind: "RESUME" | "CV"
  published: boolean
}

const FIXTURES: Fixture[] = [
  // ------------------------------------------------------------------ 1
  {
    email: "student.cse@nextprofile.test",
    username: "arif-cse",
    templateId: "minimal",
    themeId: "minimal",
    docKind: "RESUME",
    published: true,
    profile: {
      profileType: "STUDENT",
      discipline: "cse",
      careerGoal: "INTERNSHIP",
      wants: ["resume", "portfolio"],
      onboardedAt: new Date(),
      fullName: "Arif Hossain",
      headline: "Final-year CSE student · Backend and data",
      about:
        "Final-year Computer Science student who likes building things that people actually use. " +
        "Most of my work sits on the backend — APIs, databases, and the glue between them — and I have " +
        "been teaching myself data engineering through side projects. Looking for a software engineering " +
        "internship where I can ship real features and learn from code review.",
      location: "Dhaka, Bangladesh",
      languages: ["Bangla", "English"],
      contact: { email: "arif.hossain@example.com", phone: "+8801700000000", showEmail: true, showPhone: false, showLocation: true },
      links: { github: "https://github.com/example", linkedin: "https://linkedin.com/in/example" },
      visibility: "PUBLIC",
      publishedAt: new Date(),
    },
    education: [
      {
        institution: "Bangladesh University of Engineering and Technology",
        degree: "BSc",
        field: "Computer Science and Engineering",
        startDate: d("2022-01"),
        endDate: d("2026-06"),
        current: true,
        grade: "3.74 / 4.00",
        details: "Coursework: Distributed Systems, Databases, Machine Learning, Operating Systems.",
        sortOrder: order(0),
      },
    ],
    experience: [
      {
        company: "Shopfront Ltd.",
        role: "Backend Intern",
        employment: "Internship",
        location: "Remote",
        startDate: d("2025-06"),
        endDate: d("2025-08"),
        summary: "Three-month internship on the order management team.",
        bullets: [
          "Built the inventory reconciliation endpoint used by the warehouse dashboard",
          "Cut a nightly sync job from 40 minutes to 9 by batching writes",
          "Wrote the integration tests for the returns flow, now part of the deploy gate",
        ],
        sortOrder: order(0),
      },
    ],
    skills: [
      { name: "TypeScript", category: "Languages", level: 4, sortOrder: order(0) },
      { name: "Python", category: "Languages", level: 4, sortOrder: order(1) },
      { name: "PostgreSQL", category: "Databases", level: 3, sortOrder: order(2) },
      { name: "Node.js", category: "Frameworks", level: 4, sortOrder: order(3) },
      { name: "Docker", category: "Tools", level: 3, sortOrder: order(4) },
      { name: "Git", category: "Tools", level: 4, sortOrder: order(5) },
    ],
    projects: [
      {
        title: "Campus Event Manager",
        summary: "Event registration and attendance system used by six university clubs.",
        description:
          "A web application that replaced the spreadsheet-and-Messenger process clubs were using to run events. " +
          "Members register with their student ID, organisers scan a QR code at the door, and attendance reports " +
          "generate automatically at the end of each event.",
        role: "Built the backend and the QR attendance flow",
        outcome: "Used for 40+ events across six clubs in one semester",
        tags: ["Next.js", "PostgreSQL", "Prisma", "QR"],
        links: { repo: "https://github.com/example/campus-events" },
        featured: true,
        startDate: d("2024-09"),
        endDate: d("2025-02"),
        sortOrder: order(0),
      },
      {
        title: "Bus Route Tracker",
        summary: "Live location sharing for the university shuttle service.",
        description:
          "Drivers share location from a lightweight mobile page; students see the next arrival estimate for their stop. " +
          "Built to answer one question well rather than to be a full transit app.",
        role: "Solo project",
        outcome: "About 300 weekly users during the pilot term",
        tags: ["React Native", "Node.js", "WebSockets"],
        featured: true,
        startDate: d("2025-03"),
        sortOrder: order(1),
      },
      {
        title: "Result Parser",
        summary: "Command-line tool that turns published result PDFs into a queryable table.",
        description: "Parses the university's result PDFs, normalises the layout variations between departments, and outputs CSV.",
        tags: ["Python", "PDF"],
        sortOrder: order(2),
      },
    ],
    certifications: [
      { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", issueDate: d("2025-04"), sortOrder: order(0) },
      { name: "Meta Backend Developer", issuer: "Coursera", issueDate: d("2024-11"), sortOrder: order(1) },
    ],
    achievements: [
      { title: "Runner-up, Inter-University Hackathon", issuer: "NSU ACM", date: d("2025-01"), kind: "competition", description: "Built a flood-alert routing tool in 36 hours, placed second out of 64 teams.", sortOrder: order(0) },
      { title: "Dean's List", issuer: "BUET", date: d("2024-12"), kind: "award", sortOrder: order(1) },
      { title: "Volunteer, Robotics Club", issuer: "BUET Robotics", date: d("2023-08"), kind: "volunteering", description: "Ran the beginner workshop series for first-year students.", sortOrder: order(2) },
    ],
  },

  // ------------------------------------------------------------------ 2
  {
    email: "student.business@nextprofile.test",
    username: "nusrat-bba",
    templateId: "minimal",
    themeId: "minimal",
    docKind: "RESUME",
    published: false,
    profile: {
      profileType: "STUDENT",
      discipline: "business",
      careerGoal: "INTERNSHIP",
      wants: ["resume", "profile"],
      onboardedAt: new Date(),
      fullName: "Nusrat Jahan",
      headline: "Final-year BBA student · Marketing and analytics",
      about:
        "Final-year BBA student majoring in marketing, focused on campaign analytics and consumer research. " +
        "I have led two case competition teams and run the social media for a 400-member student club, which " +
        "taught me more about audience behaviour than any textbook did. Looking for a marketing internship " +
        "where I can work on live campaigns.",
      location: "Dhaka, Bangladesh",
      languages: ["Bangla", "English", "Hindi"],
      contact: { email: "nusrat.jahan@example.com", showEmail: true, showPhone: false, showLocation: true },
      links: { linkedin: "https://linkedin.com/in/example" },
      visibility: "PRIVATE",
    },
    education: [
      {
        institution: "Institute of Business Administration, University of Dhaka",
        degree: "BBA",
        field: "Marketing",
        startDate: d("2022-01"),
        endDate: d("2026-05"),
        current: true,
        grade: "3.68 / 4.00",
        sortOrder: order(0),
      },
    ],
    skills: [
      { name: "Market research", category: "Business", level: 4, sortOrder: order(0) },
      { name: "Campaign analytics", category: "Analytics", level: 3, sortOrder: order(1) },
      { name: "Excel", category: "Tools", level: 4, sortOrder: order(2) },
      { name: "Google Analytics", category: "Tools", level: 3, sortOrder: order(3) },
      { name: "Presentation", category: "Soft skills", level: 5, sortOrder: order(4) },
    ],
    projects: [
      {
        title: "Retail Basket Study",
        summary: "Consumer research on basket composition across three supermarket chains.",
        description:
          "Surveyed 220 shoppers and analysed receipt data to understand which categories drive a return visit. " +
          "The findings became the basis of our national case competition entry.",
        role: "Team lead, research design and analysis",
        outcome: "National finalist, 4th of 120 teams",
        tags: ["Research", "Excel", "Survey design"],
        featured: true,
        startDate: d("2025-02"),
        endDate: d("2025-05"),
        sortOrder: order(0),
      },
      {
        title: "Club Social Media Relaunch",
        summary: "Rebuilt the content calendar and posting strategy for a 400-member student club.",
        description: "Moved from ad-hoc event posts to a weekly calendar with three content pillars, and tracked reach per pillar.",
        outcome: "Engagement up roughly 3× over one semester",
        tags: ["Content", "Analytics", "Community"],
        sortOrder: order(1),
      },
    ],
    achievements: [
      { title: "National Finalist, Brand Challenge", issuer: "Unilever Bangladesh", date: d("2025-05"), kind: "competition", sortOrder: order(0) },
      { title: "General Secretary, Business Club", issuer: "IBA", date: d("2024-09"), kind: "club", description: "Led a committee of 12 and ran a 400-attendee career fair.", sortOrder: order(1) },
    ],
    certifications: [
      { name: "Google Analytics Certification", issuer: "Google", issueDate: d("2025-03"), sortOrder: order(0) },
    ],
  },

  // ------------------------------------------------------------------ 3
  {
    email: "professional@nextprofile.test",
    username: "sadia-marketing",
    templateId: "professional",
    themeId: "professional",
    docKind: "RESUME",
    published: true,
    profile: {
      profileType: "PROFESSIONAL",
      discipline: "marketing",
      careerGoal: "FIND_JOB",
      wants: ["resume", "portfolio"],
      onboardedAt: new Date(),
      fullName: "Sadia Rahman",
      headline: "Senior Marketing Manager · Growth and lifecycle",
      about:
        "Marketing manager with seven years across e-commerce and fintech, most of it spent on lifecycle and " +
        "retention rather than top-of-funnel. I like the part of the job where a spreadsheet turns into a decision. " +
        "Currently leading a team of five and looking for a role with more ownership of the full growth loop.",
      location: "Dhaka, Bangladesh",
      languages: ["Bangla", "English"],
      contact: { email: "sadia.rahman@example.com", phone: "+8801800000000", showEmail: true, showPhone: true, showLocation: true },
      links: { linkedin: "https://linkedin.com/in/example", website: "https://example.com" },
      visibility: "PUBLIC",
      publishedAt: new Date(),
    },
    experience: [
      {
        company: "PayLink",
        role: "Senior Marketing Manager",
        employment: "Full-time",
        location: "Dhaka",
        startDate: d("2022-03"),
        current: true,
        summary: "Lead lifecycle marketing for a payments app with 1.2M registered users.",
        bullets: [
          "Rebuilt onboarding messaging; 30-day activation rose from 34% to 51% over two quarters",
          "Introduced a weekly retention review that cut churn in the first billing cycle by a third",
          "Manage a team of five across content, CRM and paid",
          "Owned a annual budget and reallocated 40% of it from paid acquisition to lifecycle",
        ],
        sortOrder: order(0),
      },
      {
        company: "Bazaar.com.bd",
        role: "Marketing Manager",
        employment: "Full-time",
        location: "Dhaka",
        startDate: d("2019-06"),
        endDate: d("2022-02"),
        bullets: [
          "Ran category campaigns for electronics and home, the two largest revenue lines",
          "Launched the abandoned-cart programme that became the highest-ROI channel that year",
          "Built the first proper attribution reporting the team had",
        ],
        sortOrder: order(1),
      },
      {
        company: "Craft Agency",
        role: "Marketing Executive",
        employment: "Full-time",
        location: "Dhaka",
        startDate: d("2017-08"),
        endDate: d("2019-05"),
        bullets: ["Managed four client accounts across FMCG and retail", "Produced monthly performance reports and campaign post-mortems"],
        sortOrder: order(2),
      },
    ],
    education: [
      { institution: "University of Dhaka", degree: "MBA", field: "Marketing", startDate: d("2015-01"), endDate: d("2017-06"), sortOrder: order(0) },
      { institution: "University of Dhaka", degree: "BBA", field: "Business Administration", startDate: d("2011-01"), endDate: d("2014-12"), sortOrder: order(1) },
    ],
    skills: [
      { name: "Lifecycle marketing", category: "Marketing", level: 5, sortOrder: order(0) },
      { name: "Retention analytics", category: "Analytics", level: 4, sortOrder: order(1) },
      { name: "SQL", category: "Analytics", level: 3, sortOrder: order(2) },
      { name: "Team leadership", category: "Soft skills", level: 4, sortOrder: order(3) },
      { name: "Braze", category: "Tools", level: 4, sortOrder: order(4) },
      { name: "Looker", category: "Tools", level: 3, sortOrder: order(5) },
    ],
    projects: [
      {
        title: "Activation Rebuild",
        summary: "Rewrote the first-30-days messaging programme for a payments app.",
        description:
          "Replaced a five-email drip with a behaviour-triggered sequence keyed to the first transaction. " +
          "The work involved rewriting every message, rebuilding the segmentation, and running a four-week holdout test.",
        role: "Owner",
        outcome: "Activation 34% → 51%; holdout confirmed the lift",
        tags: ["Lifecycle", "CRM", "Experimentation"],
        featured: true,
        startDate: d("2023-01"),
        endDate: d("2023-07"),
        sortOrder: order(0),
      },
    ],
    achievements: [
      { title: "Marketer of the Year (internal)", issuer: "PayLink", date: d("2024-01"), kind: "award", sortOrder: order(0) },
    ],
  },

  // ------------------------------------------------------------------ 4
  {
    email: "researcher@nextprofile.test",
    username: "dr-tanvir",
    templateId: "minimal",
    themeId: "minimal",
    docKind: "CV",
    published: true,
    profile: {
      profileType: "RESEARCHER",
      discipline: "research",
      careerGoal: "HIGHER_STUDY",
      wants: ["cv", "profile"],
      onboardedAt: new Date(),
      fullName: "Dr. Tanvir Ahmed",
      headline: "Molecular biologist · Antimicrobial resistance",
      about:
        "Postdoctoral researcher working on antimicrobial resistance in enteric pathogens, with a focus on " +
        "plasmid-mediated transfer in clinical isolates. My work combines wet-lab microbiology with genomic " +
        "analysis, and I am currently applying for faculty positions and independent fellowships.",
      location: "Dhaka, Bangladesh",
      languages: ["Bangla", "English", "German"],
      contact: { email: "t.ahmed@example.edu", showEmail: true, showPhone: false, showLocation: true },
      links: { scholar: "https://scholar.google.com/citations?user=example", orcid: "https://orcid.org/0000-0000-0000-0000" },
      visibility: "PUBLIC",
      publishedAt: new Date(),
    },
    education: [
      { institution: "University of Cambridge", degree: "PhD", field: "Molecular Microbiology", startDate: d("2017-10"), endDate: d("2021-09"), details: "Thesis: Plasmid dynamics in multi-drug resistant Salmonella.", sortOrder: order(0) },
      { institution: "University of Dhaka", degree: "MSc", field: "Microbiology", startDate: d("2014-01"), endDate: d("2016-12"), grade: "First class", sortOrder: order(1) },
      { institution: "University of Dhaka", degree: "BSc", field: "Microbiology", startDate: d("2010-01"), endDate: d("2013-12"), sortOrder: order(2) },
    ],
    experience: [
      { company: "icddr,b", role: "Postdoctoral Research Fellow", employment: "Full-time", startDate: d("2022-01"), current: true, bullets: ["Lead a three-person team on the AMR surveillance project", "Supervise two MSc students", "Manage the genomic sequencing pipeline for clinical isolates"], sortOrder: order(0) },
      { company: "University of Cambridge", role: "Research Assistant", employment: "Part-time", startDate: d("2018-01"), endDate: d("2021-09"), bullets: ["Supported the departmental teaching lab", "Co-supervised four undergraduate projects"], sortOrder: order(1) },
    ],
    publications: [
      { title: "Plasmid-mediated colistin resistance in clinical Salmonella isolates from Bangladesh", authors: ["Ahmed, T.", "Khatun, R.", "Weber, S.", "Islam, M."], venue: "Journal of Antimicrobial Chemotherapy", year: 2024, type: "journal", doi: "10.0000/jac.2024.0001", sortOrder: order(0) },
      { title: "Genomic surveillance of enteric pathogens in a low-resource urban setting", authors: ["Khatun, R.", "Ahmed, T.", "Rahman, A."], venue: "Lancet Microbe", year: 2023, type: "journal", doi: "10.0000/lanmic.2023.0042", sortOrder: order(1) },
      { title: "Horizontal gene transfer under sub-inhibitory antibiotic pressure", authors: ["Ahmed, T.", "Weber, S."], venue: "Microbial Genomics", year: 2022, type: "journal", sortOrder: order(2) },
      { title: "A cost-effective protocol for plasmid typing in field laboratories", authors: ["Ahmed, T.", "Islam, M.", "Chowdhury, N."], venue: "BMC Research Notes", year: 2021, type: "journal", sortOrder: order(3) },
    ],
    research: [
      { title: "AMR Surveillance in Urban Dhaka", supervisor: "Prof. A. Rahman", institution: "icddr,b", status: "ongoing", abstract: "A three-year surveillance study tracking resistance patterns across four hospital sites, combining phenotypic testing with whole-genome sequencing.", startDate: d("2022-03"), sortOrder: order(0) },
      { title: "PhD Thesis: Plasmid dynamics in multi-drug resistant Salmonella", supervisor: "Prof. S. Weber", institution: "University of Cambridge", status: "completed", startDate: d("2017-10"), endDate: d("2021-09"), sortOrder: order(1) },
    ],
    conferences: [
      { title: "Plasmid transfer under antibiotic pressure: field evidence", event: "ECCMID 2024", role: "Speaker", location: "Barcelona, Spain", date: d("2024-04"), sortOrder: order(0) },
      { title: "Genomic surveillance in low-resource settings", event: "ASM Microbe 2023", role: "Poster", location: "Houston, USA", date: d("2023-06"), sortOrder: order(1) },
      { title: "AMR in South Asia: a regional picture", event: "ICDDR,B Scientific Conference", role: "Panelist", location: "Dhaka", date: d("2023-11"), sortOrder: order(2) },
    ],
    skills: [
      { name: "Whole-genome sequencing", category: "Methods", sortOrder: order(0) },
      { name: "Bioinformatics (Nextflow, Snakemake)", category: "Technical", sortOrder: order(1) },
      { name: "R", category: "Technical", sortOrder: order(2) },
      { name: "Antimicrobial susceptibility testing", category: "Methods", sortOrder: order(3) },
      { name: "Grant writing", category: "Professional", sortOrder: order(4) },
    ],
    achievements: [
      { title: "Commonwealth PhD Scholarship", issuer: "Commonwealth Scholarship Commission", date: d("2017-09"), kind: "scholarship", sortOrder: order(0) },
      { title: "Best Poster, ASM Microbe", issuer: "American Society for Microbiology", date: d("2023-06"), kind: "award", sortOrder: order(1) },
    ],
  },

  // ------------------------------------------------------------------ 5
  {
    email: "freelancer@nextprofile.test",
    username: "rumi-design",
    templateId: "modern",
    themeId: "modern",
    docKind: "RESUME",
    published: true,
    profile: {
      profileType: "FREELANCER",
      discipline: "design",
      careerGoal: "FREELANCE_CLIENTS",
      wants: ["portfolio", "profile"],
      onboardedAt: new Date(),
      fullName: "Rumi Chowdhury",
      headline: "Product designer for early-stage teams",
      about:
        "Independent product designer. I work with small teams that have a working product and no designer — " +
        "usually on the stretch between a rough prototype and something people can actually use. Six years in, " +
        "about thirty projects, mostly fintech and marketplaces. I take two clients at a time.",
      location: "Remote · Dhaka",
      languages: ["Bangla", "English"],
      contact: { email: "hello@rumi.design", showEmail: true, showPhone: false, showLocation: true },
      links: { website: "https://example.com", behance: "https://behance.net/example", dribbble: "https://dribbble.com/example", linkedin: "https://linkedin.com/in/example" },
      visibility: "PUBLIC",
      publishedAt: new Date(),
    },
    services: [
      { title: "Product design sprint", description: "Two weeks, end to end: research, flows, and a clickable prototype your team can test with users.", priceNote: "from $4,000", deliverable: "Figma file + prototype + a short written recommendation", sortOrder: order(0) },
      { title: "Design system setup", description: "Tokens, components and documentation your engineers can build against without asking me questions.", priceNote: "from $6,000", deliverable: "Figma library + handoff docs", sortOrder: order(1) },
      { title: "Ongoing design partner", description: "A standing two days a week with your team, for companies that need design continuously but not full-time.", priceNote: "monthly retainer", sortOrder: order(2) },
    ],
    caseStudies: [
      {
        title: "Rebuilding onboarding for a lending app",
        client: "Fintech startup (Series A)",
        problem: "Sixty percent of applicants dropped out before finishing the application, and nobody knew where.",
        approach: "Instrumented the funnel, watched twelve people attempt it, then rebuilt the flow around the two questions that were causing the abandonment.",
        outcome: "Completion rose from 40% to 68% in six weeks. The team kept the instrumentation.",
        sortOrder: order(0),
      },
      {
        title: "Marketplace search that people actually use",
        client: "Regional B2B marketplace",
        problem: "Buyers used search once, got poor results, and never returned to it.",
        approach: "Reworked the result layout around what buyers actually compare — lead time and minimum order — instead of what the database returned first.",
        outcome: "Search-led orders roughly doubled over a quarter.",
        sortOrder: order(1),
      },
    ],
    projects: [
      { title: "Ledger — expense app", summary: "A small personal finance app, designed and shipped as a side project.", description: "Built to test a simpler take on expense categorisation. About 4,000 downloads.", tags: ["iOS", "Product design"], featured: true, sortOrder: order(0) },
      { title: "Design system: Kite", summary: "An open component library for small teams.", tags: ["Design system", "Figma"], sortOrder: order(1) },
    ],
    testimonials: [
      { quote: "Rumi rebuilt our onboarding in six weeks and the numbers moved immediately. What stood out was that she pushed back on half of what we asked for, and she was right.", author: "A. Karim", role: "Co-founder", company: "Fintech startup", sortOrder: order(0) },
      { quote: "The first designer we have worked with who asked to see the support inbox before opening Figma.", author: "S. Das", role: "Head of Product", company: "B2B marketplace", sortOrder: order(1) },
    ],
    skills: [
      { name: "Product design", category: "Design", level: 5, sortOrder: order(0) },
      { name: "User research", category: "Methods", level: 4, sortOrder: order(1) },
      { name: "Design systems", category: "Design", level: 5, sortOrder: order(2) },
      { name: "Figma", category: "Tools", level: 5, sortOrder: order(3) },
      { name: "Prototyping", category: "Methods", level: 4, sortOrder: order(4) },
    ],
    experience: [
      { company: "Independent", role: "Product Designer", employment: "Freelance", startDate: d("2020-01"), current: true, summary: "Around thirty projects for early-stage teams, mostly fintech and marketplaces.", bullets: [], sortOrder: order(0) },
      { company: "Studio Nine", role: "Senior Designer", employment: "Full-time", startDate: d("2018-02"), endDate: d("2019-12"), bullets: ["Led design on four client products", "Set up the studio's first shared component library"], sortOrder: order(1) },
    ],
    education: [
      { institution: "BRAC University", degree: "BSc", field: "Computer Science", startDate: d("2013-01"), endDate: d("2017-06"), sortOrder: order(0) },
    ],
  },
]

const DEFAULT_DOC_CONFIG = {
  hidden: [],
  density: "regular",
  accent: "#0E5C4A",
  paper: "A4",
  onePage: false,
}

const DEFAULT_PORTFOLIO_CONFIG = {
  accent: "#0E5C4A",
  heroStyle: "split",
  showContactForm: false,
}

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10)

  for (const f of FIXTURES) {
    await db.user.deleteMany({ where: { email: f.email } })

    const user = await db.user.create({
      data: {
        email: f.email,
        username: f.username,
        passwordHash,
        emailVerified: new Date(),
        profile: { create: f.profile },
        educations: f.education ? { create: f.education } : undefined,
        experiences: f.experience ? { create: f.experience } : undefined,
        skills: f.skills ? { create: f.skills } : undefined,
        projects: f.projects ? { create: f.projects } : undefined,
        certifications: f.certifications ? { create: f.certifications } : undefined,
        achievements: f.achievements ? { create: f.achievements } : undefined,
        publications: f.publications ? { create: f.publications } : undefined,
        researches: f.research ? { create: f.research } : undefined,
        conferences: f.conferences ? { create: f.conferences } : undefined,
        services: f.services ? { create: f.services } : undefined,
        caseStudies: f.caseStudies ? { create: f.caseStudies } : undefined,
        testimonials: f.testimonials ? { create: f.testimonials } : undefined,
        documents: {
          create: {
            kind: f.docKind,
            name: f.docKind === "CV" ? "Academic CV" : "My Resume",
            templateId: f.templateId,
            config: DEFAULT_DOC_CONFIG,
          },
        },
        portfolio: {
          create: {
            themeId: f.themeId,
            config: DEFAULT_PORTFOLIO_CONFIG,
            published: f.published,
            publishedAt: f.published ? new Date() : null,
          },
        },
      },
    })

    const { recomputeCompleteness } = await import("../lib/completeness/recompute")
    const result = await recomputeCompleteness(user.id)
    console.log(
      `  ✓ ${f.username.padEnd(18)} ${f.profile.profileType?.toString().padEnd(13)} ${String(result.score).padStart(3)}% complete`,
    )
  }
}

/** One admin account, so the admin area can be opened straight after seeding. */
async function seedAdmin() {
  const passwordHash = await bcrypt.hash("demo1234", 10)
  const email = "admin@nextprofile.test"
  await db.user.deleteMany({ where: { email } })
  await db.user.create({
    data: {
      email,
      passwordHash,
      emailVerified: new Date(),
      role: "ADMIN",
      profile: {
        create: {
          fullName: "Platform Admin",
          profileType: "OTHER",
          careerGoal: "PROFESSIONAL_PRESENCE",
          onboardedAt: new Date(),
        },
      },
      portfolio: { create: {} },
    },
  })
  console.log(`  ✓ ${email.padEnd(28)} ADMIN`)
}

main()
  .then(seedAdmin)
  .then(async () => {
    console.log("\nSeeded 5 fixture profiles + 1 admin. Password for all: demo1234")
    console.log("Admin area: sign in as admin@nextprofile.test and open /admin\n")
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })
