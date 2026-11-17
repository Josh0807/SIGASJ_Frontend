import { cn } from './cn'

export const adminFilterControlClassName =
  'min-h-11 w-full min-w-0 rounded-[10px] border border-sigasj-border bg-white px-3 text-sm text-sigasj-ink outline-none transition-[border-color,box-shadow] focus-visible:border-sigasj-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sigasj-primary/30'

export const adminFilterSelectClassName = cn(
  adminFilterControlClassName,
  'cursor-pointer appearance-none bg-[length:1rem] bg-[position:right_0.85rem_center] bg-no-repeat pr-10',
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235b7390' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")]",
)
