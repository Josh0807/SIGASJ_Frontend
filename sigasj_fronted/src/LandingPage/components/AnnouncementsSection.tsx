import { Link } from 'react-router-dom'
import AnnouncementCard from './AnnouncementCard'
import type { AnnouncementsSectionProps } from '../Props/AnnouncementsSectionProps'
import { ANNOUNCEMENTS_SECTION_ID } from '../config/landingAnchors'
import {
  MORE_ANNOUNCEMENTS_LABEL,
  PUBLIC_ANNOUNCEMENTS_MORE_HREF,
} from '../config/announcementsNavigation'
import { usePublicAnnouncements } from '../hooks/usePublicAnnouncements'

const SKELETON_COUNT = 3

const AnnouncementCardSkeleton = () => (
  <div
    className="announcements-section__card announcements-section__card--skeleton"
    aria-hidden="true"
  >
    <div className="announcements-section__media announcements-section__media--skeleton" />
    <div className="announcements-section__skeleton-line announcements-section__skeleton-line--badge" />
    <div className="announcements-section__skeleton-line announcements-section__skeleton-line--title" />
    <div className="announcements-section__skeleton-line" />
    <div className="announcements-section__skeleton-line" />
    <div className="announcements-section__skeleton-line announcements-section__skeleton-line--short" />
  </div>
)

const isInternalSpaPath = (href: string) => href.startsWith('/') && !href.startsWith('//')

const AnnouncementsSection = ({
  id = ANNOUNCEMENTS_SECTION_ID,
  title = 'Comunicados',
  description = 'Mantente informado sobre avisos importantes, mantenimientos, cortes de agua y otras comunicaciones de la ASADA San Juan.',
  announcements: announcementsProp,
  emptyMessage = 'Actualmente no hay comunicados públicos disponibles.',
  errorMessage = 'No fue posible cargar los comunicados en este momento. Inténtalo nuevamente más tarde.',
  moreAnnouncementsHref,
  hasMoreAnnouncements,
  moreAnnouncementsLabel = MORE_ANNOUNCEMENTS_LABEL,
}: AnnouncementsSectionProps) => {
  const isControlled = announcementsProp !== undefined
  const {
    status,
    announcements: fetchedAnnouncements,
    hasMore: fetchedHasMore,
    retry,
  } = usePublicAnnouncements(!isControlled)

  const announcements = isControlled ? announcementsProp : fetchedAnnouncements
  const queryStatus = isControlled ? 'success' : status
  const hasMore = isControlled
    ? Boolean(hasMoreAnnouncements)
    : hasMoreAnnouncements ?? fetchedHasMore

  const resolvedMoreHref =
    moreAnnouncementsHref === undefined
      ? PUBLIC_ANNOUNCEMENTS_MORE_HREF
      : moreAnnouncementsHref

  /**
   * CTA listo en markup/estilos, pero solo visible cuando:
   * 1) hay indicación real de más registros, y
   * 2) existe destino público definido (hoy: pendiente en config).
   * Sin (2) no se inventa ruta, listado ni paginación.
   */
  const showMoreAnnouncementsCta =
    queryStatus === 'success' &&
    announcements.length > 0 &&
    hasMore &&
    Boolean(resolvedMoreHref)

  return (
    <section
      className="landing-section announcements-section"
      id={id}
      aria-labelledby={`${id}-title`}
      aria-busy={queryStatus === 'loading'}
    >
      <div className="announcements-section__content">
        <header className="announcements-section__heading">
          <p className="announcements-section__eyebrow">Información oficial</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{description}</p>
        </header>

        {queryStatus === 'loading' ? (
          <div
            className="announcements-section__grid"
            role="status"
            aria-live="polite"
            aria-label="Cargando comunicados"
          >
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <AnnouncementCardSkeleton key={`announcement-skeleton-${index}`} />
            ))}
          </div>
        ) : null}

        {queryStatus === 'error' ? (
          <div className="announcements-section__error" role="alert">
            <p className="announcements-section__error-message">{errorMessage}</p>
            <button
              type="button"
              className="announcements-section__retry"
              onClick={retry}
            >
              Reintentar
            </button>
          </div>
        ) : null}

        {queryStatus === 'success' && announcements.length === 0 ? (
          <p className="announcements-section__empty" role="status">
            {emptyMessage}
          </p>
        ) : null}

        {queryStatus === 'success' && announcements.length > 0 ? (
          <>
            <div className="announcements-section__grid">
              {announcements.map((announcement) => (
                <AnnouncementCard key={announcement.id} {...announcement} />
              ))}
            </div>

            {showMoreAnnouncementsCta && resolvedMoreHref ? (
              <div className="announcements-section__more-wrap">
                {isInternalSpaPath(resolvedMoreHref) ? (
                  <Link
                    className="announcements-section__more-list"
                    to={resolvedMoreHref}
                  >
                    {moreAnnouncementsLabel}
                  </Link>
                ) : (
                  <a
                    className="announcements-section__more-list"
                    href={resolvedMoreHref}
                  >
                    {moreAnnouncementsLabel}
                  </a>
                )}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  )
}

export default AnnouncementsSection
