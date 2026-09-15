import Link from "next/link"
import { ArrowRight, FileText, Globe, QrCode, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Eyebrow } from "@/components/ui/card"
import { getSession } from "@/lib/auth"

export default async function LandingPage() {
  const user = await getSession()

  return (
    <main className="mx-auto max-w-5xl px-5 pb-24">
      <header className="flex items-center justify-between py-6">
        <span className="text-lg font-semibold tracking-tight">NextProfile</span>
        <nav className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard">
              <Button size="sm">Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="border-t border-[--line] pt-14">
        <Eyebrow>Your Profile. Your Next Opportunity.</Eyebrow>
        <h1 className="mt-4 max-w-[16ch] text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05]">
          One profile in. A whole career identity out.
        </h1>
        <p className="mt-5 max-w-measure text-lg text-ink-soft">
          Enter your education, experience, skills and projects once. NextProfile turns them into a{" "}
          <strong className="font-semibold text-ink">resume</strong>, an{" "}
          <strong className="font-semibold text-ink">academic CV</strong>, a{" "}
          <strong className="font-semibold text-ink">portfolio website</strong> and a public career
          profile — each one adapted to who you are and what you&rsquo;re applying for.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href={user ? "/dashboard" : "/register"}>
            <Button size="lg">
              {user ? "Open your profile" : "Build my profile"} <ArrowRight size={16} aria-hidden />
            </Button>
          </Link>
          <Link href="/view/arif-cse">
            <Button variant="secondary" size="lg">
              See an example profile
            </Button>
          </Link>
        </div>
        <p className="mt-3 text-sm text-ink-faint">
          Free to start. Nothing is public until you publish it.
        </p>
      </section>

      <section className="mt-20 grid gap-px border border-[--line] bg-[--line] sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: FileText,
            title: "Resume & CV",
            body: "Three templates, one of them built to survive automated screening. A4 or Letter, real page breaks.",
          },
          {
            icon: Globe,
            title: "Portfolio site",
            body: "Sections you can add, hide and reorder. Themes that change layout, not just colour.",
          },
          {
            icon: Sparkles,
            title: "AI that doesn't invent",
            body: "It rewrites what you wrote, using only the facts you entered. You accept or discard every suggestion.",
          },
          {
            icon: QrCode,
            title: "Share anywhere",
            body: "A public link, a PDF, and a QR code for your business card or CV header.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-[--surface] p-5">
            <Icon size={18} className="text-[--accent]" aria-hidden />
            <h2 className="mt-3 text-base font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">{body}</p>
          </div>
        ))}
      </section>

      <section className="mt-20">
        <Eyebrow>Built for</Eyebrow>
        <p className="mt-3 max-w-measure text-lg">
          Students in any discipline, working professionals, researchers, freelancers and creatives.
          The form you fill in changes with who you are — a researcher gets publications and
          conferences, a freelancer gets services and case studies, and neither has to scroll past
          the other&rsquo;s fields.
        </p>
      </section>

      <footer className="mt-24 border-t border-[--line] pt-6 text-sm text-ink-faint">
        NextProfile — your profile, your next opportunity.
      </footer>
    </main>
  )
}
