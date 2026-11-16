import type { HTMLAttributes, ReactNode } from 'react'
import { Card } from './Card'
import { cn } from './cn'

export type AdminFiltersProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  summary?: ReactNode
}

/** Barra de filtros estándar sobre Card ASADA. */
export function AdminFilters({
  children,
  summary,
  className,
  ...rest
}: AdminFiltersProps) {
  return (
    <Card
      as="section"
      padded
      lift={false}
      className={cn(
        'grid gap-3 !rounded-[13px] !p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end',
        className,
      )}
      {...rest}
    >
      <div className="grid min-w-0 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
        {children}
      </div>
      {summary ? (
        <div className="flex min-w-0 items-center gap-2 text-sm text-sigasj-muted sm:justify-end">
          {summary}
        </div>
      ) : null}
    </Card>
  )
}

export type AdminFilterFieldProps = {
  label: string
  children: ReactNode
  className?: string
}

export function AdminFilterField({
  label,
  children,
  className,
}: AdminFilterFieldProps) {
  return (
    <label className={cn('grid min-w-0 gap-1.5', className)}>
      <span className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted">
        {label}
      </span>
      {children}
    </label>
  )
}

export const adminFilterControlClassName =
  'min-h-11 w-full min-w-0 rounded-[10px] border border-sigasj-border bg-white px-3 text-sm text-sigasj-ink outline-none transition-[border-color,box-shadow] focus-visible:border-sigasj-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sigasj-primary/30'

export default AdminFilters
