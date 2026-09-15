import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

/**
 * Where uploaded images go.
 *
 * The local driver writes into `public/uploads`, which is fine on one
 * long-lived machine and wrong everywhere else: on Vercel the filesystem is
 * read-only apart from /tmp and is discarded between invocations, and in Docker
 * anything written at runtime lives in a container layer that the next deploy
 * throws away. So `local` is a development convenience and `s3` is what a real
 * deployment uses.
 *
 * Both drivers return a URL the browser can load. Nothing above this module
 * knows which one is in use.
 */

export type StorageDriver = "local" | "s3"

export function storageDriver(): StorageDriver {
  return process.env.STORAGE_DRIVER === "s3" ? "s3" : "local"
}

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
}

export function contentTypeFor(ext: string): string {
  return CONTENT_TYPES[ext] ?? "application/octet-stream"
}

/**
 * Stores one image and returns its public URL.
 * `key` is the object path — already sanitised by the caller.
 */
export async function putImage(key: string, body: Buffer, ext: string): Promise<string> {
  return storageDriver() === "s3" ? putToS3(key, body, ext) : putToDisk(key, body)
}

// ------------------------------------------------------------------ local

async function putToDisk(key: string, body: Buffer): Promise<string> {
  const dir = process.env.UPLOAD_DIR || "./public/uploads"
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, key), body)
  const publicPath = dir.replace(/^\.\/public/, "")
  return `${publicPath}/${key}`
}

// --------------------------------------------------------------------- s3

/**
 * S3-compatible object storage: AWS S3, Cloudflare R2, Backblaze B2, MinIO.
 * R2 and MinIO need S3_ENDPOINT set; AWS does not.
 */
function s3Config() {
  const bucket = process.env.S3_BUCKET
  const region = process.env.S3_REGION ?? "auto"
  const accessKeyId = process.env.S3_ACCESS_KEY_ID
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "STORAGE_DRIVER is \"s3\" but S3_BUCKET, S3_ACCESS_KEY_ID or S3_SECRET_ACCESS_KEY is missing",
    )
  }
  return {
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    endpoint: process.env.S3_ENDPOINT || undefined,
    // R2 and MinIO need path-style addressing; AWS is happy either way.
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
  }
}

/** One client per process, built on first use so the local driver never needs it. */
let client: import("@aws-sdk/client-s3").S3Client | null = null

async function s3Client() {
  const cfg = s3Config()
  if (!client) {
    const { S3Client } = await import("@aws-sdk/client-s3")
    client = new S3Client({
      region: cfg.region,
      endpoint: cfg.endpoint,
      forcePathStyle: cfg.forcePathStyle,
      credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
    })
  }
  return { client, cfg }
}

async function putToS3(key: string, body: Buffer, ext: string): Promise<string> {
  const { client: s3, cfg } = await s3Client()
  const { PutObjectCommand } = await import("@aws-sdk/client-s3")
  const objectKey = `uploads/${key}`

  await s3.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: objectKey,
      Body: body,
      // Declared explicitly so the CDN serves an image rather than a download,
      // and so the value can never come from the uploader.
      ContentType: contentTypeFor(ext),
      CacheControl: "public, max-age=31536000, immutable",
    }),
  )

  const cdn = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "")
  if (cdn) return `${cdn}/${objectKey}`

  // No CDN configured — fall back to the bucket's own endpoint.
  if (cfg.endpoint) return `${cfg.endpoint.replace(/\/$/, "")}/${cfg.bucket}/${objectKey}`
  return `https://${cfg.bucket}.s3.${cfg.region}.amazonaws.com/${objectKey}`
}
