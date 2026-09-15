import { NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"
import { AppError } from "@/lib/errors"
import { LIMITS, limit, tooMany } from "@/lib/rate-limit"
import { putImage } from "@/lib/storage"

/**
 * Image upload.
 *
 * The declared MIME type and the filename both come from the client, so neither
 * decides anything here. The stored extension is derived from the file's own
 * magic bytes: without that, a caller can upload HTML with `type: "image/png"`
 * and a `.html` name, and the app then serves script from its own origin.
 */
const SIGNATURES: { ext: string; test: (b: Buffer) => boolean }[] = [
  { ext: "png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "gif", test: (b) => b.subarray(0, 6).toString("latin1") === "GIF87a" || b.subarray(0, 6).toString("latin1") === "GIF89a" },
  {
    ext: "webp",
    test: (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP",
  },
]

/** The real format, or null when the bytes are not one of the formats we serve. */
function sniffExtension(buffer: Buffer): string | null {
  if (buffer.length < 12) return null
  return SIGNATURES.find((s) => s.test(buffer))?.ext ?? null
}

export async function POST(req: Request) {
  try {
    // Require authentication to upload files
    const user = await requireUser()

    // Writing files is the most expensive thing an account can do here.
    const gate = await limit(`upload:${user.id}`, LIMITS.upload.max, LIMITS.upload.windowMs)
    if (!gate.ok) return tooMany(gate)

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      throw new AppError("VALIDATION", "No file provided.")
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new AppError("VALIDATION", "Only image files are allowed.")
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new AppError("VALIDATION", "File size must be less than 5MB.")
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // The claim above was the client's. This is the file itself.
    const ext = sniffExtension(buffer)
    if (!ext) {
      throw new AppError("VALIDATION", "That file isn't a PNG, JPEG, GIF or WebP image.")
    }

    // Generate the object name safely. The original filename is never used — it
    // is attacker-controlled and only decides what the file is served as.
    const key = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`

    // Which storage backend this lands in is STORAGE_DRIVER's business, not
    // this route's. Both return a URL the browser can load.
    const url = await putImage(key, buffer, ext)

    return NextResponse.json({ url })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "UNAUTHENTICATED" ? 401 : 400 },
      )
    }
    console.error("Upload failed", error)
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 })
  }
}
