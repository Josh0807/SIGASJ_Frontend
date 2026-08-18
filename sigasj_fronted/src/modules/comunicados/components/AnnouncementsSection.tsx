import AnnouncementsCarousel from './AnnouncementsCarousel'
import { AlertIcon, EmptyInboxIcon } from './announcementIcons'
import type { AnnouncementsSectionProps } from '../types/AnnouncementsSectionProps'
import { ANNOUNCEMENTS_SECTION_ID } from '../../landing/config/landingAnchors'
import { usePublicAnnouncements } from '../hooks/usePublicAnnouncements'

const AnnouncementsSkeleton = () => (
  <div className="announcements-carousel announcements-carousel--loading" aria-hidden="true">
    <div className="announcements-carousel__viewport">
      <div className="announcements-carousel__track announcements-carousel__track--static">
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={`announcement-skeleton-${index}`}
            className="announcements-carousel__slide"
          >
            <div className="announcements-section__card announcements-section__card--skeleton">
              <div
                className="announcements-section__media announcements-section__media--skeleton"
                aria-hidden="true"
              />
              <div className="announcements-section__skeleton-line announcements-section__skeleton-line--title" />
              <div className="announcements-section__skeleton-line" />
              <div className="announcements-section__skeleton-line announcements-section__skeleton-line--short" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const AnnouncementsSection = ({
  id = ANNOUNCEMENTS_SECTION_ID,
  title = 'Comunicados',
  description =
    'Consulte avisos oficiales sobre mantenimientos, interrupciones del servicio, asambleas y demás comunicaciones institucionales de la ASADA San Juan.',
  announcements: announcementsProp,
  emptyMessage = 'No se registran comunicados públicos disponibles en este momento.',
  errorMessage =
    'No fue posible cargar los comunicados. Por favor, intente nuevamente más tarde.',
}: AnnouncementsSectionProps) => {
  const useDefaultItems = announcementsProp === undefined
  const { status, announcements: fetched, retry } =
    usePublicAnnouncements(useDefaultItems)

  const announcements = announcementsProp ?? fetched
  const hasAnnouncements = announcements.length > 0
  const showLoading = useDefaultItems && status === 'loading'
  const showError = useDefaultItems && status === 'error'
  const titleId = `${id}-title`

  return (
    <section
      className="landing-section announcements-section"
      id={id}
      aria-labelledby={titleId}
    >
      <div className="announcements-section__backdrop" aria-hidden="true" />

      <div className="announcements-section__content">
        <header className="announcements-section__heading">
          <p className="announcements-section__eyebrow">Información oficial</p>

          <h2 id={titleId}>{title}</h2>
          <p className="announcements-section__lead">{description}</p>
        </header>

        {showLoading ? (
          <div role="status" aria-live="polite" aria-busy="true">
            <span className="visually-hidden">Cargando comunicados…</span>
            <AnnouncementsSkeleton />
          </div>
        ) : showError ? (
          <div className="announcements-section__error" role="alert">
            <span className="announcements-section__state-icon">
              <AlertIcon />
            </span>
            <p className="announcements-section__error-message">{errorMessage}</p>
            <button
              type="button"
              className="announcements-section__retry"
              onClick={retry}
            >
              Reintentar consulta
            </button>
          </div>
        ) : hasAnnouncements ? (
          <AnnouncementsCarousel
            announcements={announcements}
            labelledBy={titleId}
          />
        ) : (
          <div className="announcements-section__empty" role="status">
            <span className="announcements-section__state-icon">
              <EmptyInboxIcon />
            </span>
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default AnnouncementsSection
