"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createDocument } from "@/app/actions/documents"

export function NewDocumentButtons({ compact }: { compact?: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  function make(kind: "RESUME" | "CV") {
    start(async () => {
      const res = await createDocument(kind)
      if (res.ok && res.data) router.push(`/dashboard/resume/${res.data.id}`)
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => make("RESUME")} disabled={pending} size={compact ? "sm" : "md"}>
        <Plus size={16} aria-hidden /> New resume
      </Button>
      <Button
        variant="secondary"
        onClick={() => make("CV")}
        disabled={pending}
        size={compact ? "sm" : "md"}
      >
        New CV
      </Button>
    </div>
  )
}
