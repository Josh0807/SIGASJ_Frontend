import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  actions,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'grid justify-items-center gap-2.5 rounded-[var(--radius-asada)] border border-sigasj-border bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--color-sigasj-mist)_45%,white),transparent_58%),linear-gradient(180deg,#fff_0%,color-mix(in_srgb,var(--color-sigasj-ice)_55%,white)_100%)] px-6 py-9 text-center shadow-[0_4px_14px_rgba(30,90,156,0.05)]',
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span className="mb-1 grid size-[72px] place-items-center rounded-[22px] bg-[color-mix(in_srgb,var(--color-sigasj-primary)_12%,white)] text-sigasj-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-sigasj-primary)_14%,transparent),0_12px_24px_rgba(30,90,156,0.12)]">
          {icon}
        </span>
      ) : null}
      <h2 className="m-0 text-[1.15rem] font-extrabold tracking-[-0.02em] text-sigasj-ink">
        {title}
      </h2>
      {description ? (
        <p className="m-0 max-w-[28rem] text-[0.88rem] leading-[1.45] text-sigasj-muted">
          {description}
        </p>
      ) : null}
      {actions ? (
        <div className="mt-2 flex flex-wrap justify-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

export default EmptyState
