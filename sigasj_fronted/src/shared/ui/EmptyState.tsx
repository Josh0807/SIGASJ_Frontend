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
        'grid justify-items-center gap-2.5 rounded-[13px] border border-sigasj-border bg-white px-6 py-10 text-center shadow-[0_4px_14px_rgba(30,90,156,0.05)]',
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span className="mb-1 grid size-14 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
          {icon}
        </span>
      ) : null}
      <h2 className="m-0 font-[family-name:var(--font-display)] text-[1.25rem] font-bold tracking-[-0.02em] text-sigasj-text">
        {title}
      </h2>
      {description ? (
        <p className="public-section-intro m-0 max-w-[28rem] text-[0.95rem] leading-[1.5]">
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
