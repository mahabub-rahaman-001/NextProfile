"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, Select } from "@/components/ui/input"
import { Card, CardTitle } from "@/components/ui/card"
import { FieldWrapper } from "@/components/forms/field-wrapper"
import { changeProfileType } from "@/app/actions/profile"
import {
  CAREER_GOAL_LABELS,
  PROFILE_TYPE_LABELS,
  type CareerGoal,
  type ProfileType,
} from "@/lib/types"

export function ProfileTypeForm({
  profileType,
  discipline,
  careerGoal,
  wants,
}: {
  profileType: ProfileType
  discipline: string
  careerGoal: CareerGoal
  wants: string[]
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [v, setV] = useState({ profileType, discipline, careerGoal })

  function save(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await changeProfileType({ ...v, wants })
      if (!res.ok) return setError(res.message)
      setSaved(true)
      router.refresh()
    })
  }

  return (
    <Card>
      <form onSubmit={save} className="space-y-4">
        <CardTitle>Who you are</CardTitle>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldWrapper label="Profile type">
            {(p) => (
              <Select
                {...p}
                value={v.profileType}
                onChange={(e) => {
                  setV({ ...v, profileType: e.target.value as ProfileType })
                  setSaved(false)
                }}
              >
                {Object.entries(PROFILE_TYPE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </FieldWrapper>

          <FieldWrapper label="Career goal">
            {(p) => (
              <Select
                {...p}
                value={v.careerGoal}
                onChange={(e) => {
                  setV({ ...v, careerGoal: e.target.value as CareerGoal })
                  setSaved(false)
                }}
              >
                {Object.entries(CAREER_GOAL_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </Select>
            )}
          </FieldWrapper>

          <FieldWrapper label="Your field" help="e.g. business, cse, design, research">
            {(p) => (
              <Input
                {...p}
                value={v.discipline}
                onChange={(e) => {
                  setV({ ...v, discipline: e.target.value })
                  setSaved(false)
                }}
              />
            )}
          </FieldWrapper>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-[--danger]">
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
          {saved ? (
            <span className="inline-flex items-center gap-1 text-sm text-[--success]">
              <Check size={15} aria-hidden /> Saved
            </span>
          ) : null}
        </div>
      </form>
    </Card>
  )
}
