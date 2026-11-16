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
        'admin-page-header flex flex-wrap items-end justify-between gap-3 rounded-[13px] border border-sigasj-border bg-white px-4 py-4 shadow-[0_4px_14px_rgba(30,90,156,0.05)] sm:gap-4 sm:px-5 sm:py-5',
        className,
      )}
      {...rest}
    >
      <div className="min-w-0 w-full max-w-[44rem] sm:w-auto">
        {eyebrow ? (
          <p className="public-eyebrow m-0 mb-2 text-left">{eyebrow}</p>
        ) : null}
        <h1 className="m-0 font-['Times_New_Roman',Times,serif] text-[clamp(1.35rem,4.5vw,2.05rem)] font-bold leading-[1.15] tracking-[-0.02em] text-sigasj-text">
          {title}
        </h1>
        {description ? (
          <p className="public-section-intro m-0 mt-2 max-w-[40rem] text-left text-[0.92rem] leading-[1.5] sm:text-[0.95rem]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-col flex-wrap items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center">
          {actions}
        </div>
      ) : null}
    </header>
  )
}

export default PageHeader
