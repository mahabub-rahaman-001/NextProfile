export type ErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "RATE_LIMITED"
  | "QUOTA_EXCEEDED"
  | "PROVIDER_ERROR"
  | "CONFLICT"

export class AppError extends Error {
  code: ErrorCode
  field?: string

  constructor(code: ErrorCode, message: string, field?: string) {
    super(message)
    this.code = code
    this.field = field
  }
}

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; code: ErrorCode; message: string; field?: string }

export function fail(e: unknown): ActionResult<never> {
  if (e instanceof AppError) return { ok: false, code: e.code, message: e.message, field: e.field }
  console.error(e)
  return { ok: false, code: "PROVIDER_ERROR", message: "Something went wrong. Please try again." }
}
