import type { HTMLAttributes, ReactNode } from 'react'
import { Card } from './Card'
import { cn } from './cn'

export type AdminListItemProps = HTMLAttributes<HTMLElement> & {
  title: ReactNode
  description?: ReactNode
  badges?: ReactNode
  actions?: ReactNode
  media?: ReactNode
}

/** Fila/tarjeta de listado admin estandarizada. */
export function AdminListItem({
  title,
  description,
  badges,
  actions,
  media,
  className,
  ...rest
}: AdminListItemProps) {
  return (
    <Card
      as="article"
      padded
      className={cn(
        'grid gap-4 !p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start',
        className,
      )}
      {...rest}
    >
      <div className="grid min-w-0 gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
        {media ? <div className="shrink-0">{media}</div> : null}
        <div className="min-w-0">
          <h2 className="m-0 text-[1.05rem] font-extrabold tracking-[-0.02em] text-sigasj-ink">
            {title}
          </h2>
          {description ? (
            <p className="m-0 mt-1 text-sm leading-snug text-sigasj-muted">
              {description}
            </p>
          ) : null}
          {badges ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">{badges}</div>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end">{actions}</div>
      ) : null}
    </Card>
  )
}

export default AdminListItem
