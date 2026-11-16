import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

export type PageHeaderProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  eyebrow?: ReactNode
}

/** Cabecera de módulo alineada al SectionHeader del landing. */
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
        'admin-page-header flex flex-wrap items-end justify-between gap-4 rounded-[13px] border border-sigasj-border bg-white px-5 py-5 shadow-[0_4px_14px_rgba(30,90,156,0.05)]',
        className,
      )}
      {...rest}
    >
      <div className="min-w-0 max-w-[44rem]">
        {eyebrow ? (
          <p className="public-eyebrow m-0 mb-2 text-left">{eyebrow}</p>
        ) : null}
        <h1 className="m-0 font-[family-name:var(--font-display)] text-[clamp(1.55rem,2.6vw,2.05rem)] font-bold leading-[1.15] tracking-[-0.02em] text-sigasj-text">
          {title}
        </h1>
        {description ? (
          <p className="public-section-intro m-0 mt-2 max-w-[40rem] text-left text-[0.95rem] leading-[1.5]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
      ) : null}
    </header>
  )
}

export default PageHeader
