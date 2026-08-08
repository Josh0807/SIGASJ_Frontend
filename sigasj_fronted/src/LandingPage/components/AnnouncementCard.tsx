import type { AnnouncementCardProps } from '../Props/AnnouncementsSectionProps'

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
  const safeImageUrl = typeof imageUrl === 'string' ? imageUrl.trim() : ''
  const safeFileUrl = typeof fileUrl === 'string' ? fileUrl.trim() : ''
  const safeMoreHref = typeof moreHref === 'string' ? moreHref.trim() : ''
  const safePublishedAt =
    typeof publishedAt === 'string' ? publishedAt.trim() : ''
  const formattedDate = safePublishedAt
    ? formatAnnouncementDate(safePublishedAt)
    : undefined

  const cardClassName = urgent
    ? 'announcements-section__card announcements-section__card--urgent'
    : 'announcements-section__card'

  const hasMeta = Boolean(safeType || urgent || formattedDate)

  return (
    <article className={cardClassName} data-announcement-id={id}>
      {safeImageUrl ? (
        <div className="announcements-section__media">
          <img
            className="announcements-section__image"
            src={safeImageUrl}
            alt={`Imagen del comunicado: ${safeTitle}`}
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}

      {hasMeta ? (
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

      <h3>{safeTitle}</h3>
      <p className="announcements-section__summary">{bodyText}</p>

      {safeMoreHref ? (
        <a className="announcements-section__more" href={safeMoreHref}>
          {moreLabel}
        </a>
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
    </article>
  )
}

const formatAnnouncementDate = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-CR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export default AnnouncementCard
