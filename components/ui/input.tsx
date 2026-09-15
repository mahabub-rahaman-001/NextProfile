import * as React from "react"
import { cn } from "@/lib/utils"

const base =
  "w-full rounded-sm border border-[--line] bg-[--surface] px-3 py-2 text-base text-ink placeholder:text-[--ink-faint] disabled:opacity-60 min-h-[44px]"

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(base, className)} {...props} />
  ),
)
Input.displayName = "Input"

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(base, "min-h-[96px] leading-relaxed", className)} {...props} />
))
Textarea.displayName = "Textarea"

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(base, "appearance-none pr-8", className)} {...props} />
))
Select.displayName = "Select"
