import { Link } from 'react-router-dom'
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
}: AnnouncementCardProps) => {
  const safeTitle = typeof title === 'string' ? title.trim() : ''
  if (!safeTitle) {
    return null
  }

  const safeSummary = typeof summary === 'string' ? summary.trim() : ''
  const safeContent = typeof content === 'string' ? content.trim() : ''
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

  const titleId = `announcement-title-${id}`
  const showMeta = Boolean(safeType || formattedDate || urgent)

  const cardClassName = [
    'announcements-section__card',
    urgent ? 'announcements-section__card--urgent' : '',
    safeImageUrl ? 'announcements-section__card--with-media' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const imageAlt = `Ilustración del comunicado: ${safeTitle}`

  return (
    <article
      className={cardClassName}
      data-announcement-id={id}
      aria-labelledby={titleId}
    >
      <div className="announcements-section__card-accent" aria-hidden="true" />

      {safeImageUrl ? (
        <div className="announcements-section__media">
          <a
            className="announcements-section__media-link"
            href={safeImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver imagen ampliada: ${safeTitle}`}
          >
            <img
              className="announcements-section__image"
              src={safeImageUrl}
              alt={imageAlt}
              loading="lazy"
              decoding="async"
            />
          </a>
        </div>
      ) : null}

      <div className="announcements-section__card-body">
        {showMeta ? (
          <p className="announcements-section__meta">
            {safeType ? <span>{safeType}</span> : null}
            {formattedDate ? (
              <time dateTime={safePublishedAt}>{formattedDate}</time>
            ) : null}
            {urgent ? (
              <span className="announcements-section__meta-urgent">
                Prioridad alta
              </span>
            ) : null}
          </p>
        ) : null}

        <h3 className="announcements-section__title" id={titleId}>
          {safeTitle}
        </h3>

        <p className="announcements-section__summary">{bodyText}</p>

        <footer className="announcements-section__card-actions">
          {safeImageUrl ? (
            <a
              className="announcements-section__more"
              href={safeImageUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver imagen
            </a>
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
              className="announcements-section__file"
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

const CardAction = ({ label, href, onClick }: CardActionProps) => {
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
