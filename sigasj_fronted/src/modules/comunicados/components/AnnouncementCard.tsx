import { ZONA_HORARIA_ASADA } from '../../../shared/utils/fechaAsada'
import { Link } from 'react-router-dom'
import { IconArrowRight } from '@tabler/icons-react'
import type { AnnouncementCardProps } from '../types/AnnouncementsSectionProps'

const AnnouncementCard = ({
  id,
  title,
  summary,
  content,
  publishedAt,
  type,
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

  const titleId = `announcement-title-${id}`
  const showMeta = Boolean(safeType || formattedDate || urgent)

  const cardClassName = `flex h-full min-h-[280px] flex-col overflow-hidden rounded-[13px] border bg-white transition-[border-color,box-shadow] duration-150 hover:border-sigasj-primary/40 hover:shadow-[0_4px_14px_rgba(16,43,56,0.06)] ${urgent ? 'border-sigasj-error/40' : 'border-sigasj-border'}`

  const imageAlt = `Ilustración del comunicado: ${safeTitle}`

  return (
    <article
      className={cardClassName}
      data-announcement-id={id}
      aria-labelledby={titleId}
    >
      {safeImageUrl ? (
        <div className="aspect-[2.35/1] overflow-hidden rounded-t-[13px] bg-sigasj-surface-soft">
          <button
            type="button"
            className="block h-full w-full cursor-zoom-in border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sigasj-primary"
            aria-label={`Ver imagen ampliada: ${safeTitle}`}
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
      ) : null}

      <div className="flex flex-1 flex-col px-5 pb-4 pt-3 max-[640px]:px-4">
        {showMeta ? (
          <p className="m-0 mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-sigasj-primary">
            {safeType ? <span>{safeType}</span> : null}
            {formattedDate ? (
              <time dateTime={safePublishedAt}>{formattedDate}</time>
            ) : null}
            {urgent ? (
              <span className="rounded-md bg-[#f8e8e8] px-2 py-1 text-sigasj-error normal-case tracking-normal">
                Prioridad alta
              </span>
            ) : null}
          </p>
        ) : null}

        <h3 className="m-0 font-sigasj-display text-[1.05rem] font-bold leading-tight text-sigasj-text" id={titleId}>
          {safeTitle}
        </h3>

        {bodyText && !safeImageUrl ? (
          <p className="mb-0 mt-3 line-clamp-3 text-sm leading-6 text-sigasj-muted">{bodyText}</p>
        ) : null}

        <footer className="mt-auto flex flex-wrap gap-3 pt-3">
          {safeImageUrl ? (
            <button
              type="button"
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-sigasj-border-strong bg-white px-4 text-xs font-semibold text-sigasj-primary-hover transition-colors duration-150 hover:border-sigasj-primary hover:bg-sigasj-surface-soft"
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
