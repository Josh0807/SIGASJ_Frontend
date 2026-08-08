import type { AnnouncementCardProps } from '../Props/AnnouncementsSectionProps'

const AnnouncementCard = ({
  id,
  title,
  summary,
  publishedAt,
  type,
  urgent = false,
  moreHref,
  moreLabel = 'Ver más',
}: AnnouncementCardProps) => {
  const cardClassName = urgent
    ? 'announcements-section__card announcements-section__card--urgent'
    : 'announcements-section__card'

  return (
    <article className={cardClassName} data-announcement-id={id}>
      <header className="announcements-section__card-header">
        <div className="announcements-section__badges">
          {type ? <p className="announcements-section__type">{type}</p> : null}
          {urgent ? (
            <p className="announcements-section__urgent" role="status">
              <span className="announcements-section__urgent-mark" aria-hidden="true">!</span>
              Urgente
            </p>
          ) : null}
        </div>
        <time className="announcements-section__date" dateTime={publishedAt}>
          {formatAnnouncementDate(publishedAt)}
        </time>
      </header>

      <h3>{title}</h3>
      <p className="announcements-section__summary">{summary}</p>

      {moreHref ? (
        <a className="announcements-section__more" href={moreHref}>
          {moreLabel}
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
