import AnnouncementCard from './AnnouncementCard'
import type { AnnouncementsSectionProps } from '../types/AnnouncementsSectionProps'
import { ANNOUNCEMENTS_SECTION_ID } from '../../landing/config/landingAnchors'
import { usePublicAnnouncements } from '../hooks/usePublicAnnouncements'

/**
 * Sección pública de comunicados.
 * Sin `announcements` en props usa la colección de ejemplo.
 * Con `announcements` (modo controlado) muestra exactamente esos datos.
 */
const AnnouncementsSection = ({
  id = ANNOUNCEMENTS_SECTION_ID,
  title = 'Comunicados',
  description = 'Mantente informado sobre avisos importantes, mantenimientos, cortes de agua y otras comunicaciones de la ASADA San Juan.',
  announcements: announcementsProp,
  emptyMessage = 'Actualmente no hay comunicados públicos disponibles.',
  errorMessage = 'No fue posible cargar los comunicados. Intenta de nuevo más tarde.',
}: AnnouncementsSectionProps) => {
  const useDefaultItems = announcementsProp === undefined
  const { status, announcements: fetched, retry } =
    usePublicAnnouncements(useDefaultItems)

  const announcements = announcementsProp ?? fetched
  const hasAnnouncements = announcements.length > 0
  const showLoading = useDefaultItems && status === 'loading'
  const showError = useDefaultItems && status === 'error'

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

        {showLoading ? (
          <p className="announcements-section__empty" role="status">
            Cargando comunicados…
          </p>
        ) : showError ? (
          <div className="announcements-section__empty" role="alert">
            <p>{errorMessage}</p>
            <button type="button" onClick={retry}>
              Reintentar
            </button>
          </div>
        ) : hasAnnouncements ? (
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
