import AnnouncementCard from './AnnouncementCard'
import type { AnnouncementsSectionProps } from '../Props/AnnouncementsSectionProps'
import { ANNOUNCEMENTS_SECTION_ID } from '../config/landingAnchors'
import { announcementMocks } from '../data/announcementMocks'

/**
 * Sección pública de comunicados.
 * Por ahora usa una colección temporal para validar AnnouncementCard.
 * El consumo del API se retoma en la tarea de integración correspondiente.
 */
const AnnouncementsSection = ({
  id = ANNOUNCEMENTS_SECTION_ID,
  title = 'Comunicados',
  description = 'Mantente informado sobre avisos importantes, mantenimientos, cortes de agua y otras comunicaciones de la ASADA San Juan.',
  announcements = announcementMocks,
  emptyMessage = 'Actualmente no hay comunicados públicos disponibles.',
}: AnnouncementsSectionProps) => {
  const hasAnnouncements = announcements.length > 0

  return (
    <section
      className="landing-section announcements-section"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="announcements-section__content">
        <header className="announcements-section__heading">
          <p className="announcements-section__eyebrow">Información oficial</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{description}</p>
        </header>

        {hasAnnouncements ? (
          <div className="announcements-section__grid">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                id={announcement.id}
                title={announcement.title}
                summary={announcement.summary}
                content={announcement.content}
                publishedAt={announcement.publishedAt}
                type={announcement.type}
                urgent={announcement.urgent}
                moreHref={announcement.moreHref}
                moreLabel={announcement.moreLabel}
                imageUrl={announcement.imageUrl}
                fileUrl={announcement.fileUrl}
              />
            ))}
          </div>
        ) : (
          <p className="announcements-section__empty" role="status">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  )
}

export default AnnouncementsSection
