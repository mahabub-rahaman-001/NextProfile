"use client"

import { useEffect, useRef, useState } from "react"

/**
 * An A4 page is 794px wide. A phone is 390px.
 *
 * The preview used to render at full size inside whatever space was available,
 * so on a phone the page scrolled sideways — the one screen people judge the
 * product by, broken on the device most of them hold. This measures the
 * available width and scales the page down to fit, never up past 1.
 */
const PAGE_WIDTH = { A4: 794, LETTER: 816 } as const

export function ScaledPreview({
  paper = "A4",
  children,
}: {
  paper?: "A4" | "LETTER"
  children: React.ReactNode
}) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState<number | undefined>()

  useEffect(() => {
    const el = outer.current
    if (!el) return

    const measure = () => {
      const available = el.clientWidth
      const next = Math.min(1, available / PAGE_WIDTH[paper])
      setScale(next)
      // A transform does not change layout height, so the wrapper would still
      // reserve the full unscaled height and leave a long grey gap under the
      // page. offsetHeight is the untransformed height; scale it ourselves.
      const natural = inner.current?.offsetHeight
      if (natural) setHeight(natural * next)
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (inner.current) ro.observe(inner.current)
    return () => ro.disconnect()
  }, [paper, children])

  return (
    <div ref={outer} className="w-full">
      <div style={{ height }}>
        <div
          ref={inner}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: PAGE_WIDTH[paper],
          }}
          className="shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
