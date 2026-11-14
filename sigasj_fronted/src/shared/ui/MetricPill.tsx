import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export type MetricPillProps = HTMLAttributes<HTMLDivElement> & {
  label: ReactNode
  value: ReactNode
  unit?: ReactNode
  tone?: 'primary' | 'danger' | 'quiet'
}

export function MetricPill({
  label,
  value,
  unit,
  tone = 'primary',
  className,
  ...rest
}: MetricPillProps) {
  return (
    <div
      className={cn(
        'inline-flex min-w-24 flex-col items-start justify-center gap-1 rounded-2xl px-4 py-3',
        tone === 'primary' &&
          'bg-linear-to-br from-sigasj-primary to-sigasj-ink text-white shadow-[0_10px_20px_rgba(30,90,156,0.22)]',
        tone === 'danger' &&
          'bg-linear-to-br from-[#9a3b3d] to-[#7a2c2e] text-white shadow-[0_10px_20px_rgba(185,54,56,0.2)]',
        tone === 'quiet' &&
          'border border-sigasj-border bg-[color-mix(in_srgb,var(--color-sigasj-primary)_10%,white)] text-sigasj-ink',
        className,
      )}
      {...rest}
    >
      <span
        className={cn(
          'text-[0.64rem] font-bold uppercase tracking-[0.06em] leading-none',
          tone === 'quiet' ? 'text-sigasj-muted' : 'text-white/72',
        )}
      >
        {label}
      </span>
      <strong className="inline-flex items-baseline gap-1.5 text-[1.4rem] font-extrabold leading-none tracking-[-0.03em] tabular-nums">
        {value}
        {unit ? (
          <em
            className={cn(
              'text-[0.78rem] font-semibold not-italic leading-none',
              tone === 'quiet' ? 'text-sigasj-muted' : 'text-white/86',
            )}
          >
            {unit}
          </em>
        ) : null}
      </strong>
    </div>
  )
}

export default MetricPill
