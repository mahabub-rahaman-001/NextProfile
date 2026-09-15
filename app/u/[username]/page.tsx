import { permanentRedirect } from "next/navigation"

/**
 * Legacy route — permanently redirected to /view/[username].
 * Keeps old links working (QR codes, bookmarks, search engine cache).
 */
export default async function LegacyProfileRedirect({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  permanentRedirect(`/view/${username}`)
}
