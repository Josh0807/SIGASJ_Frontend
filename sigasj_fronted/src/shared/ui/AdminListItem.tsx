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

/** Fila/tarjeta de listado admin con lift estilo landing. */
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
      lift
      data-admin-stagger
      className={cn(
        'grid gap-4 !p-4 max-[760px]:!grid-cols-1 min-[761px]:grid-cols-[minmax(0,1fr)_auto] min-[761px]:items-center',
        className,
      )}
      {...rest}
    >
      <div className="grid min-w-0 gap-3 max-[760px]:grid-cols-1 min-[761px]:grid-cols-[auto_minmax(0,1fr)] min-[761px]:items-center">
        {media ? <div className="shrink-0">{media}</div> : null}
        <div className="min-w-0">
          <h2 className="public-card-title m-0 text-[1.125rem] font-bold tracking-[-0.02em] text-sigasj-text">
            {title}
          </h2>
          {description ? (
            <p className="public-card-text m-0 mt-1.5 text-[0.875rem] leading-snug text-sigasj-muted">
              {description}
            </p>
          ) : null}
          {badges ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">{badges}</div>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex min-w-0 flex-col items-stretch gap-2 max-[760px]:[&_a]:w-full max-[760px]:[&_button]:w-full min-[761px]:flex-row min-[761px]:flex-wrap min-[761px]:items-center min-[761px]:justify-end">
          {actions}
        </div>
      ) : null}
    </Card>
  )
}

export default AdminListItem
