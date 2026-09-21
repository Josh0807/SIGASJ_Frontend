import AnnouncementsCarousel from './AnnouncementsCarousel'
import { AlertIcon, EmptyInboxIcon } from './announcementIcons'
import type { AnnouncementsSectionProps } from '../types/AnnouncementsSectionProps'
import { ANNOUNCEMENTS_SECTION_ID } from '../../landing/config/landingAnchors'
import { usePublicAnnouncements } from '../hooks/usePublicAnnouncements'
import { useState } from 'react'
import GalleryLightbox from '../../galeria/public/GalleryLightbox'

const AnnouncementsSkeleton = () => (
  <div className="mt-8" aria-hidden="true">
    <div className="overflow-hidden">
      <div className="grid grid-cols-2 gap-5 max-[640px]:grid-cols-1">
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={`announcement-skeleton-${index}`}
            className="min-w-0"
          >
            <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
              <div
                className="mb-4 aspect-[16/7] animate-pulse rounded-xl bg-sky-100"
                aria-hidden="true"
              />
              <div className="mb-3 h-5 w-2/3 animate-pulse rounded bg-sky-100" />
              <div className="mb-2 h-3 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
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
      className="relative isolate min-h-0 overflow-hidden bg-[linear-gradient(135deg,#f9fdff_0%,#edf8ff_55%,#e4f5ff_100%)] px-6 py-14 max-[640px]:px-4 max-[640px]:py-10"
      id={id}
      aria-labelledby={titleId}
    >
      <div className="pointer-events-none absolute -left-48 top-20 -z-10 h-[430px] w-[390px] rotate-[-18deg] rounded-[45%] bg-sky-200/35" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-44 top-16 -z-10 h-52 w-[520px] -rotate-[18deg] rounded-[50%] border-[44px] border-sky-300/20" aria-hidden="true" />

      <div className="mx-auto w-full max-w-[1180px]">
        <header className="max-w-[760px]">
          <p className="mb-2 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.28em] text-[#1476cf] before:h-0.5 before:w-9 before:bg-[#1476cf]">Información oficial</p>

          <h2 id={titleId} className="m-0 text-[clamp(2.2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.04em] text-[#092e67]">{title}</h2>
          <p className="mb-0 mt-4 max-w-[720px] text-base leading-7 text-[#526d8c]">{description}</p>
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
      {imageIndex !== null && imageIndex >= 0 ? <GalleryLightbox photos={announcementImages} activeIndex={imageIndex} onClose={() => setImageIndex(null)} onNavigate={setImageIndex} /> : null}
    </section>
  )
}

export default AnnouncementsSection
