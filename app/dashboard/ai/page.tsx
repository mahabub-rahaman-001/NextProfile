import { requirePage } from "@/lib/auth"
import { db } from "@/lib/db"
import { aiEnabled, checkQuota } from "@/lib/ai"
import { PageHeader, Section } from "@/components/dashboard/page-header"
import { Card } from "@/components/ui/card"
import { AboutGenerator } from "./about-generator"

export default async function AiPage() {
  const user = await requirePage()
  const [profile, quota] = await Promise.all([
    db.profile.findUnique({ where: { userId: user.id } }),
    checkQuota(user.id),
  ])

  return (
    <>
      <PageHeader
        title="AI assistant"
        blurb="It rewrites what you wrote, using only the facts in your profile. Nothing is saved until you accept it."
      />
      <Section>
        <div className="max-w-3xl space-y-4">
          {!aiEnabled() ? (
            <Card className="border-l-2 border-l-[--warning]">
              <h2 className="font-medium">Not connected yet</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Add <code className="rounded-sm bg-[--surface-2] px-1">LLM_API_KEY</code> to your
                environment and set{" "}
                <code className="rounded-sm bg-[--surface-2] px-1">AI_ENABLED=true</code>. Everything
                else in NextProfile works without it — that is deliberate.
              </p>
            </Card>
          ) : (
            <p className="text-sm text-ink-faint" data-tabular>
              {quota.remaining} of {quota.limit} AI actions left this month.
            </p>
          )}

          <AboutGenerator current={profile?.about ?? ""} enabled={aiEnabled()} />
        </div>
      </Section>
    </>
  )
}
