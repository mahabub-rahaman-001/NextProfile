/**
 * Float sortOrder: reordering writes ONE row (the midpoint between the
 * neighbours it was dropped between) instead of renumbering the whole list.
 */
export const SORT_GAP = 1000

export function midpoint(before?: number | null, after?: number | null): number {
  if (before == null && after == null) return SORT_GAP
  if (before == null) return (after as number) - SORT_GAP
  if (after == null) return (before as number) + SORT_GAP
  return (before + after) / 2
}

/** Gaps shrink by half on every drop into the same slot; renormalise before precision bites. */
export function needsRenormalise(sorted: number[]): boolean {
  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i] - sorted[i - 1]) < 0.001) return true
  }
  return false
}

export function renormalise(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) * SORT_GAP)
}
