import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export type PageHeaderProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  eyebrow?: ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
  ...rest
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-wrap items-center justify-between gap-3.5 rounded-[var(--radius-asada)] border border-sigasj-border bg-sigasj-surface px-5 py-3.5 shadow-[0_4px_14px_rgba(30,90,156,0.05)]',
        className,
      )}
      {...rest}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="m-0 mb-1 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="m-0 text-[clamp(1.2rem,2vw,1.35rem)] font-extrabold leading-[1.15] tracking-[-0.025em] text-sigasj-ink">
          {title}
        </h1>
        {description ? (
          <p className="m-0 mt-1 max-w-[40rem] text-[0.8rem] leading-[1.35] text-sigasj-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  )
}

export default PageHeader
