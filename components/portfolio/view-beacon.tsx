"use client"

import { useEffect } from "react"

/**
 * One fire-and-forget request per view, so the page itself can stay static.
 * No third-party tracker runs on a user's public profile.
 */
export function ViewBeacon({ username }: { username: string }) {
  useEffect(() => {
    const key = `np:v:${username}`
    try {
      // Don't re-count a refresh within the same session.
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, "1")
    } catch {
      // Private mode or blocked storage — counting once more is fine.
    }

    fetch("/api/analytics/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, type: "profile_view" }),
      keepalive: true,
    }).catch(() => {})
  }, [username])

  return null
}
