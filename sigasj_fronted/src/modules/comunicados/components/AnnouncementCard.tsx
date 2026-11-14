import { ZONA_HORARIA_ASADA } from '../../../shared/utils/fechaAsada'
import { Link } from 'react-router-dom'
import { IconArrowRight } from '@tabler/icons-react'
import type {
  AnnouncementCardProps,
  AnnouncementPrioridad,
} from '../types/AnnouncementsSectionProps'

const PRIORIDAD_BADGE: Record<
  AnnouncementPrioridad,
  { label: string; className: string }
> = {
  Alta: {
    label: 'Prioridad alta',
    className: 'bg-sigasj-error text-white',
  },
  Media: {
    label: 'Prioridad media',
    className: 'bg-[#f5d000] text-[#1f1a00]',
  },
  Baja: {
    label: 'Prioridad baja',
    className: 'bg-sigasj-success text-white',
  },
}

const resolvePrioridad = (
  prioridad: AnnouncementCardProps['prioridad'],
  urgent?: boolean,
): AnnouncementPrioridad | null => {
  const raw = typeof prioridad === 'string' ? prioridad.trim() : ''
  if (raw === 'Alta' || raw === 'Media' || raw === 'Baja') return raw
  if (urgent) return 'Alta'
  return null
}

const AnnouncementCard = ({
  id,
  title,
  summary,
  content,
  publishedAt,
  type,
  prioridad,
  urgent = false,
  moreHref,
  moreLabel = 'Consultar detalle',
  onMoreClick,
  imageUrl,
  fileUrl,
  onImageClick,
}: AnnouncementCardProps) => {
  const safeTitle = typeof title === 'string' ? title.trim() : ''
  if (!safeTitle) {
    return null
  }

  const safeSummary = typeof summary === 'string' ? summary.trim() : ''
  const safeContent = typeof content === 'string' ? content.trim() : ''
  const bodyText = safeSummary || safeContent

  const safeType = typeof type === 'string' ? type.trim() : ''
  const safeImageUrl = asPublicAssetUrl(imageUrl)
  const safeFileUrl = asPublicAssetUrl(fileUrl)
  const safeMoreHref = asPublicAssetUrl(moreHref)
  const safePublishedAt =
    typeof publishedAt === 'string' ? publishedAt.trim() : ''
  const formattedDate = safePublishedAt
    ? formatAnnouncementDate(safePublishedAt)
    : undefined
  const resolvedPrioridad = resolvePrioridad(prioridad, urgent)
  const prioridadBadge = resolvedPrioridad
    ? PRIORIDAD_BADGE[resolvedPrioridad]
    : null

  const titleId = `announcement-title-${id}`
  const showMeta = Boolean(safeType || formattedDate)
  const isHighPriority = resolvedPrioridad === 'Alta'

  const cardClassName = `announcement-motion-card transparency-motion-card flex h-full min-h-[320px] flex-col overflow-hidden rounded-[13px] border bg-white shadow-[0_4px_14px_rgba(16,43,56,0.05)] ${isHighPriority ? 'border-sigasj-error/40' : 'border-sigasj-border'}`

  const imageAlt = `Ilustración del comunicado: ${safeTitle}`

  const prioridadBadgeNode = prioridadBadge ? (
    <span
      className={`public-meta announcement-card__prioridad absolute right-2.5 top-2.5 z-[1] inline-flex items-center rounded-md px-2.5 py-1 !normal-case !tracking-normal shadow-sm ${prioridadBadge.className}`}
    >
      {prioridadBadge.label}
    </span>
  ) : null

  return (
    <article
      className={cardClassName}
      data-announcement-id={id}
      aria-labelledby={titleId}
    >
      {safeImageUrl ? (
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-[13px] bg-sigasj-surface-soft">
          {prioridadBadgeNode}
          <button
            type="button"
            className="block h-full w-full cursor-zoom-in border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sigasj-primary"
            aria-label={`Ver comunicado: ${safeTitle}`}
            onClick={onImageClick}
          >
            <img
              className="h-full w-full object-cover"
              src={safeImageUrl}
              alt={imageAlt}
              loading="lazy"
              decoding="async"
            />
          </button>
        </div>
      ) : prioridadBadgeNode ? (
        <div className="relative min-h-10 bg-sigasj-surface-soft px-5 pt-3">
          {prioridadBadgeNode}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col px-5 pb-4 pt-3 max-[640px]:px-4">
        {showMeta ? (
          <p className="public-meta mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 !tracking-[0.08em]">
            {safeType ? <span>{safeType}</span> : null}
            {formattedDate ? (
              <time dateTime={safePublishedAt}>{formattedDate}</time>
            ) : null}
          </p>
        ) : null}

        <h3 className="public-card-title" id={titleId}>
          {safeTitle}
        </h3>

        {bodyText ? (
          <p className="mb-0 mt-3 line-clamp-3 text-sm leading-6 text-sigasj-muted">{bodyText}</p>
        ) : null}

        <footer className="mt-auto flex flex-wrap gap-3 pt-3">
          {safeImageUrl ? (
            <button
              type="button"
              className="transparency-motion-button inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-sigasj-border-strong bg-white px-4 text-xs font-semibold text-sigasj-primary-hover"
              onClick={onImageClick}
            >
              Ver imagen <IconArrowRight size={18} aria-hidden="true" />
            </button>
          ) : null}

          {!safeImageUrl && (safeMoreHref || typeof onMoreClick === 'function') ? (
            <CardAction
              label={moreLabel}
              href={safeMoreHref}
              onClick={onMoreClick}
            />
          ) : null}

          {safeFileUrl ? (
            <a
              className="inline-flex min-h-11 items-center rounded-[10px] border border-sigasj-border-strong px-4 text-sm font-semibold text-sigasj-primary-hover no-underline transition-colors duration-150 hover:border-sigasj-primary hover:bg-sigasj-surface-soft"
              href={safeFileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver documento
            </a>
          ) : null}
        </footer>
      </div>
    </article>
  )
}

type CardActionProps = {
  label: string
  href?: string
  onClick?: () => void
}

const isInternalSpaPath = (href: string) =>
  href.startsWith('/') && !href.startsWith('//')

const cardActionClassName = 'inline-flex min-h-11 items-center rounded-[10px] border border-sigasj-border-strong bg-white px-4 text-sm font-semibold text-sigasj-primary-hover no-underline transition-colors duration-150 hover:border-sigasj-primary hover:bg-sigasj-surface-soft'

const CardAction = ({ label, href, onClick }: CardActionProps) => {
  if (href) {
    if (isInternalSpaPath(href)) {
      return (
        <Link className={cardActionClassName} to={href}>
          {label}
        </Link>
      )
    }

    return (
      <a className={cardActionClassName} href={href}>
        {label}
      </a>
    )
  }

  if (typeof onClick === 'function') {
    return (
      <button
        type="button"
        className={cardActionClassName}
        onClick={onClick}
      >
        {label}
      </button>
    )
  }

  return null
}

const asPublicAssetUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return undefined
  }

  return trimmed
}

const formatAnnouncementDate = (value: string): string | undefined => {
  const trimmed = value.trim()
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)

  // Fecha de calendario: se formatea en UTC para no correr el día. Instante: hora de Costa Rica.
  const date = dateOnly
    ? new Date(Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])))
    : new Date(trimmed)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return new Intl.DateTimeFormat('es-CR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: dateOnly ? 'UTC' : ZONA_HORARIA_ASADA,
  }).format(date)
}

export default AnnouncementCard
