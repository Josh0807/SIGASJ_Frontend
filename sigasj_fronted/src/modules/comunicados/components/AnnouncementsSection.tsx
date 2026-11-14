import AnnouncementsCarousel from './AnnouncementsCarousel'
import AnnouncementLightbox from './AnnouncementLightbox'
import { AlertIcon, EmptyInboxIcon } from './announcementIcons'
import type { AnnouncementsSectionProps } from '../types/AnnouncementsSectionProps'
import { ANNOUNCEMENTS_SECTION_ID } from '../../landing/config/landingAnchors'
import { usePublicAnnouncements } from '../hooks/usePublicAnnouncements'
import { useState } from 'react'

const AnnouncementsSkeleton = () => (
  <div className="mt-8" aria-hidden="true">
    <div className="overflow-hidden">
      <div className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={`announcement-skeleton-${index}`}
            className="min-w-0"
          >
            <div className="overflow-hidden rounded-2xl border border-sigasj-border bg-sigasj-surface p-4 shadow-sm">
              <div
                className="mb-4 aspect-[16/7] animate-pulse rounded-xl bg-sigasj-surface-soft"
                aria-hidden="true"
              />
              <div className="mb-3 h-5 w-2/3 animate-pulse rounded bg-sigasj-surface-soft" />
              <div className="mb-2 h-3 animate-pulse rounded bg-sigasj-border" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-sigasj-border" />
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
  const [imageIndex, setImageIndex] = useState<number | null>(null)
  const useDefaultItems = announcementsProp === undefined
  const { status, announcements: fetched, retry } =
    usePublicAnnouncements(useDefaultItems)

  const announcements = announcementsProp ?? fetched
  const hasAnnouncements = announcements.length > 0
  const showLoading = useDefaultItems && status === 'loading'
  const showError = useDefaultItems && status === 'error'
  const titleId = `${id}-title`
  const announcementImages = announcements.filter((item) => Boolean(item.imageUrl)).map((item) => ({ id: item.id, imageUrl: item.imageUrl as string, altText: `Ilustración del comunicado: ${item.title}`, title: item.title, description: item.summary || item.content }))

  return (
    <section
      className="relative isolate min-h-0 overflow-hidden bg-white px-6 py-14 max-[640px]:px-4 max-[640px]:py-10"
      id={id}
      aria-labelledby={titleId}
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <header className="mx-auto max-w-[760px] text-center">
          <p className="mb-2 inline-block text-xs font-extrabold uppercase tracking-[0.12em] text-sigasj-primary [margin-inline-end:-0.12em]">Información oficial</p>

          <h2 id={titleId} className="public-section-title">{title}</h2>
          <p className="mx-auto mb-0 mt-4 max-w-[36rem] text-pretty text-base leading-7 text-sigasj-muted">{description}</p>
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
            onImageOpen={(announcement) => setImageIndex(announcementImages.findIndex((item) => item.id === announcement.id))}
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
      {imageIndex !== null && imageIndex >= 0 ? (
        <AnnouncementLightbox
          items={announcementImages}
          activeIndex={imageIndex}
          onClose={() => setImageIndex(null)}
          onNavigate={setImageIndex}
        />
      ) : null}
    </section>
  )
}

export default AnnouncementsSection
