import { Link } from 'react-router-dom'
import type { AnnouncementCardProps } from './AnnouncementsSectionProps'

/**
 * Tarjeta reutilizable de un comunicado público.
 * Solo presenta datos recibidos por props.
 */
const AnnouncementCard = ({
  id,
  title,
  summary,
  content,
  publishedAt,
  type,
  urgent = false,
  moreHref,
  moreLabel = 'Ver más',
  onMoreClick,
  imageUrl,
  fileUrl,
}: AnnouncementCardProps) => {
  const safeTitle = typeof title === 'string' ? title.trim() : ''
  if (!safeTitle) {
    return null
  }

  const safeSummary = typeof summary === 'string' ? summary.trim() : ''
  const safeContent = typeof content === 'string' ? content.trim() : ''
  // Descripción breve prioritaria; el contenido completo solo como respaldo visual.
  const bodyText = safeSummary || safeContent

  if (!bodyText) {
    return null
  }

  const safeType = typeof type === 'string' ? type.trim() : ''
  const safeImageUrl = asPublicAssetUrl(imageUrl)
  const safeFileUrl = asPublicAssetUrl(fileUrl)
  const safeMoreHref = asPublicAssetUrl(moreHref)
  const safePublishedAt =
    typeof publishedAt === 'string' ? publishedAt.trim() : ''
  const formattedDate = safePublishedAt
    ? formatAnnouncementDate(safePublishedAt)
    : undefined

  const hasFullContent = Boolean(safeContent)
  const hasMoreThanBrief =
    hasFullContent && (!safeSummary || safeContent !== safeSummary)

  const hasMoreTarget =
    Boolean(safeMoreHref) || typeof onMoreClick === 'function'
  // Solo si hay destino/callback real. Contenido adicional solo no inventa UI.
  const showMoreAction = hasMoreTarget

  const titleId = `announcement-title-${id}`
  const showHeader = Boolean(safeType || urgent || formattedDate)
  const showActions = Boolean(showMoreAction || safeFileUrl)
  const imageAlt = buildImageAlt(safeTitle, safeType)

  const cardClassName = urgent
    ? 'announcements-section__card announcements-section__card--urgent'
    : 'announcements-section__card'

  return (
    <article
      className={cardClassName}
      data-announcement-id={id}
      data-has-full-content={hasFullContent ? 'true' : 'false'}
      data-has-more-than-brief={hasMoreThanBrief ? 'true' : 'false'}
      aria-labelledby={titleId}
    >
      {safeImageUrl ? (
        <div className="announcements-section__media">
          <img
            className="announcements-section__image"
            src={safeImageUrl}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}

      {showHeader ? (
        <header className="announcements-section__card-header">
          <div className="announcements-section__badges">
            {safeType ? (
              <p className="announcements-section__type">{safeType}</p>
            ) : null}
            {urgent ? (
              <p className="announcements-section__urgent" role="status">
                <span
                  className="announcements-section__urgent-mark"
                  aria-hidden="true"
                >
                  !
                </span>
                Urgente
              </p>
            ) : null}
          </div>
          {formattedDate ? (
            <time
              className="announcements-section__date"
              dateTime={safePublishedAt}
            >
              {formattedDate}
            </time>
          ) : null}
        </header>
      ) : null}

      <h3 className="announcements-section__title" id={titleId}>
        {safeTitle}
      </h3>

      <p className="announcements-section__summary">{bodyText}</p>

      {showActions ? (
        <footer className="announcements-section__card-actions">
          {showMoreAction ? (
            <MoreAction
              label={moreLabel}
              href={safeMoreHref}
              onClick={onMoreClick}
            />
          ) : null}
          {safeFileUrl ? (
            <a
              className="announcements-section__file"
              href={safeFileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver archivo
            </a>
          ) : null}
        </footer>
      ) : null}
    </article>
  )
}

type MoreActionProps = {
  label: string
  href?: string
  onClick?: () => void
}

const isInternalSpaPath = (href: string) =>
  href.startsWith('/') && !href.startsWith('//')

/** Enlace para navegación; botón para acción (p. ej. modal futuro). */
const MoreAction = ({ label, href, onClick }: MoreActionProps) => {
  if (href) {
    if (isInternalSpaPath(href)) {
      return (
        <Link className="announcements-section__more" to={href}>
          {label}
        </Link>
      )
    }

    return (
      <a className="announcements-section__more" href={href}>
        {label}
      </a>
    )
  }

  if (typeof onClick === 'function') {
    return (
      <button
        type="button"
        className="announcements-section__more"
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

const buildImageAlt = (title: string, type?: string) => {
  if (type) {
    return `Imagen del comunicado «${title}» (${type})`
  }

  return `Imagen del comunicado «${title}»`
}

/**
 * Formato de fecha del proyecto: ej. "8 de agosto de 2026" (es-CR).
 * Devuelve undefined si el valor no es una fecha válida (evita Invalid Date).
 * Las fechas solo-día (YYYY-MM-DD) se interpretan en calendario local para
 * evitar que el offset UTC reste un día.
 */
const formatAnnouncementDate = (value: string): string | undefined => {
  const trimmed = value.trim()
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)

  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(trimmed)

  if (Number.isNaN(date.getTime())) {
    return undefined
  }

  return new Intl.DateTimeFormat('es-CR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export default AnnouncementCard
