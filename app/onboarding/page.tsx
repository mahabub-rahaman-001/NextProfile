import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { requirePage } from "@/lib/auth"
import { db } from "@/lib/db"
import { OnboardingFlow } from "./onboarding-flow"

export const metadata: Metadata = { title: "Let's set you up" }

export default async function OnboardingPage() {
  const user = await requirePage()
  const profile = await db.profile.findUnique({ where: { userId: user.id } })
  if (profile?.onboardedAt) redirect("/dashboard")

  return <OnboardingFlow initialName={profile?.fullName ?? ""} />
}
