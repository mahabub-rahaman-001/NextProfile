import { requirePage } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader, Section } from "@/components/dashboard/page-header"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import { CAREER_GOAL_LABELS, PROFILE_TYPE_LABELS } from "@/lib/types"
import { ProfileTypeForm } from "./profile-type-form"
import { ChangePassword } from "./change-password"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function SettingsPage() {
  const user = await requirePage()
  const profile = await db.profile.findUnique({ where: { userId: user.id } })
  if (!profile) return null

  return (
    <>
      <PageHeader title="Settings" />
      <Section>
        <div className="max-w-3xl space-y-4">
          <Card className="space-y-2">
            <CardTitle>Account</CardTitle>
            <dl className="grid gap-2 text-sm sm:grid-cols-[140px_1fr]">
              <dt className="text-ink-soft">Email</dt>
              <dd>{user.email}</dd>
              <dt className="text-ink-soft">Profile address</dt>
              <dd>{user.username ? `/view/${user.username}` : "Not chosen yet"}</dd>
              <dt className="text-ink-soft">Plan</dt>
              <dd>Free</dd>
            </dl>
          </Card>

          <ProfileTypeForm
            profileType={profile.profileType}
            discipline={profile.discipline ?? ""}
            careerGoal={profile.careerGoal}
            wants={(profile.wants ?? []) as string[]}
          />

          <Card className="space-y-2">
            <CardTitle>What this changes</CardTitle>
            <p className="text-sm text-ink-soft">
              Your profile type decides which sections appear by default and which template and
              theme we recommend. Changing it never deletes anything — a section you have already
              filled in stays visible, whatever type you pick.
            </p>
            <p className="text-sm text-ink-soft">
              Currently: <strong>{PROFILE_TYPE_LABELS[profile.profileType]}</strong>, aiming to{" "}
              <strong>{CAREER_GOAL_LABELS[profile.careerGoal].toLowerCase()}</strong>.
            </p>
          </Card>

          <ChangePassword />

          {/* Appearance — shown only on mobile (desktop has sidebar toggle) */}
          <Card className="space-y-3 lg:hidden">
            <CardTitle>Appearance</CardTitle>
            <p className="text-sm text-ink-soft">Choose how NextProfile looks for you.</p>
            <ThemeToggle />
          </Card>

          <Card className="space-y-2">
            <CardTitle>Your data</CardTitle>
            <p className="text-sm text-ink-soft">
              Download everything NextProfile stores about you, in one file you can read without our
              software. No request, no waiting.
            </p>
            <div>
              <a href="/api/export" download>
                <Button variant="secondary">Download my data</Button>
              </a>
            </div>
          </Card>

          <form action={logoutAction}>
            <Button variant="secondary" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </Section>
    </>
  )
}
