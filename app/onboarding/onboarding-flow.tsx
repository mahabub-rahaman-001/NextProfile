"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldWrapper } from "@/components/forms/field-wrapper"
import { saveOnboarding, saveBasics } from "@/app/actions/profile"
import {
  CAREER_GOAL_LABELS,
  PROFILE_TYPE_LABELS,
  WANT_LABELS,
  type ProfileType,
  type CareerGoal,
  type Wants,
} from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * Three questions and the basics. Every answer is used — profile type drives
 * which modules appear, career goal drives completeness weighting and AI tone,
 * and the chosen output decides where the user lands next.
 */
const TYPES: ProfileType[] = [
  "STUDENT",
  "JOB_SEEKER",
  "PROFESSIONAL",
  "FREELANCER",
  "RESEARCHER",
  "TEACHER",
  "CREATIVE",
  "ENTREPRENEUR",
  "OTHER",
]

const GOALS_BY_TYPE: Record<string, CareerGoal[]> = {
  STUDENT: ["INTERNSHIP", "FIND_JOB", "HIGHER_STUDY", "BUILD_PORTFOLIO"],
  RESEARCHER: ["HIGHER_STUDY", "FIND_JOB", "PROFESSIONAL_PRESENCE", "PERSONAL_BRAND"],
  FREELANCER: ["FREELANCE_CLIENTS", "PROMOTE_SERVICES", "BUILD_PORTFOLIO", "PERSONAL_BRAND"],
  CREATIVE: ["BUILD_PORTFOLIO", "FREELANCE_CLIENTS", "FIND_JOB", "PERSONAL_BRAND"],
  DEFAULT: ["FIND_JOB", "PROFESSIONAL_PRESENCE", "BUILD_PORTFOLIO", "PERSONAL_BRAND"],
}

const WANTS: Wants[] = ["resume", "cv", "portfolio", "profile"]

export function OnboardingFlow({ initialName }: { initialName: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [profileType, setProfileType] = useState<ProfileType | null>(null)
  const [discipline, setDiscipline] = useState("")
  const [careerGoal, setCareerGoal] = useState<CareerGoal | null>(null)
  const [wants, setWants] = useState<Wants[]>(["resume"])
  const [fullName, setFullName] = useState(initialName)
  const [headline, setHeadline] = useState("")
  const [location, setLocation] = useState("")

  const goals = GOALS_BY_TYPE[profileType ?? "DEFAULT"] ?? GOALS_BY_TYPE.DEFAULT

  function finish() {
    setError(null)
    start(async () => {
      const a = await saveOnboarding({ profileType, discipline, careerGoal, wants })
      if (!a.ok) return setError(a.message)
      const b = await saveBasics({ fullName, headline, location })
      if (!b.ok) return setError(b.message)
      router.push(wants.includes("portfolio") ? "/dashboard/portfolio" : "/dashboard/profile")
      router.refresh()
    })
  }

  const steps = ["You", "Goal", "Output", "Basics"]

  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <div className="flex items-center gap-2" aria-label={`Step ${step + 1} of 4`}>
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "h-1 w-full rounded-full",
                i <= step ? "bg-[--accent]" : "bg-[--surface-2]",
              )}
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs uppercase tracking-[0.09em] text-ink-faint">
        Step {step + 1} of 4 · {steps[step]}
      </p>

      {step === 0 ? (
        <Question
          title="Who are you right now?"
          blurb="This decides which fields you'll see. You can change it later without losing anything."
        >
          <Choices
            options={TYPES.map((t) => ({ value: t, label: PROFILE_TYPE_LABELS[t] }))}
            value={profileType}
            onChange={(v) => {
              setProfileType(v as ProfileType)
              setCareerGoal(null)
            }}
          />
          {profileType ? (
            <div className="mt-5">
              <FieldWrapper
                label="Your field"
                help="Optional — it helps us show the right examples. e.g. business, cse, design, law"
              >
                {(p) => (
                  <Input
                    {...p}
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value)}
                    placeholder="e.g. marketing"
                  />
                )}
              </FieldWrapper>
            </div>
          ) : null}
        </Question>
      ) : null}

      {step === 1 ? (
        <Question
          title="What are you trying to do?"
          blurb="We'll prioritise the sections that matter most for this."
        >
          <Choices
            options={goals.map((g) => ({ value: g, label: CAREER_GOAL_LABELS[g] }))}
            value={careerGoal}
            onChange={(v) => setCareerGoal(v as CareerGoal)}
          />
        </Question>
      ) : null}

      {step === 2 ? (
        <Question title="What should we build first?" blurb="Pick as many as you like.">
          <div className="grid gap-2 sm:grid-cols-2">
            {WANTS.map((w) => {
              const on = wants.includes(w)
              return (
                <button
                  key={w}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setWants((prev) => (on ? prev.filter((x) => x !== w) : [...prev, w]))
                  }
                  className={cn(
                    "flex min-h-[52px] items-center justify-between rounded-sm border px-4 text-left text-base",
                    on
                      ? "border-[--accent] bg-[--accent-soft] text-ink"
                      : "border-[--line] bg-[--surface] hover:bg-[--surface-2]",
                  )}
                >
                  {WANT_LABELS[w]}
                  {on ? <Check size={16} className="text-[--accent]" aria-hidden /> : null}
                </button>
              )
            })}
          </div>
        </Question>
      ) : null}

      {step === 3 ? (
        <Question title="The basics" blurb="Only your name is required. Everything else can wait.">
          <div className="space-y-4">
            <FieldWrapper label="Full name" required>
              {(p) => (
                <Input
                  {...p}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Nusrat Jahan"
                  autoFocus
                />
              )}
            </FieldWrapper>
            <FieldWrapper
              label="Headline"
              help="One line describing you. It appears under your name everywhere."
            >
              {(p) => (
                <Input
                  {...p}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Final-year BBA student · Marketing and analytics"
                />
              )}
            </FieldWrapper>
            <FieldWrapper label="Location">
              {(p) => (
                <Input
                  {...p}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Dhaka, Bangladesh"
                />
              )}
            </FieldWrapper>
          </div>
        </Question>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 rounded-sm border border-[--danger] px-3 py-2 text-sm text-[--danger]">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || pending}
        >
          <ArrowLeft size={16} aria-hidden /> Back
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={(step === 0 && !profileType) || (step === 1 && !careerGoal) || pending}
          >
            Continue <ArrowRight size={16} aria-hidden />
          </Button>
        ) : (
          <Button onClick={finish} disabled={pending || fullName.trim().length < 2}>
            {pending ? "Setting up…" : "Start building"} <ArrowRight size={16} aria-hidden />
          </Button>
        )}
      </div>
    </main>
  )
}

function Question({
  title,
  blurb,
  children,
}: {
  title: string
  blurb: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 max-w-measure text-sm text-ink-soft">{blurb}</p>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function Choices({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string | null
  onChange: (v: string) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex min-h-[52px] items-center justify-between rounded-sm border px-4 text-left text-base",
            value === o.value
              ? "border-[--accent] bg-[--accent-soft]"
              : "border-[--line] bg-[--surface] hover:bg-[--surface-2]",
          )}
        >
          {o.label}
          {value === o.value ? <Check size={16} className="text-[--accent]" aria-hidden /> : null}
        </button>
      ))}
    </div>
  )
}
