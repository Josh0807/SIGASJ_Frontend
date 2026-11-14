import { useState } from 'react'
import GalleryCard from './GalleryCard'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useCallback, useEffect, useMemo, type KeyboardEvent } from 'react'
import GalleryLightbox from './GalleryLightbox'
import type { GallerySectionProps } from './GallerySectionProps'
import { GALLERY_SECTION_ID } from '../../landing/config/landingAnchors'
import { usePublicGallery } from './usePublicGallery'

const AUTOPLAY_MS = 7000

/**
 * Sección pública de la galería fotográfica.
 * Sin `photos` en props usa la colección de ejemplo.
 * Con `photos` (modo controlado) muestra exactamente esos datos.
 */
const GallerySection = ({
  id = GALLERY_SECTION_ID,
  title = 'Galería',
  description =
    'Imágenes de la ASADA San Juan de Santa Cruz y de nuestra comunidad.',
  photos: photosProp,
  emptyMessage = 'Próximamente publicaremos fotografías de la comunidad.',
  errorMessage = 'No fue posible cargar la galería. Intenta de nuevo más tarde.',
}: GallerySectionProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [photosPerView, setPhotosPerView] = useState(2)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const [cycleKey, setCycleKey] = useState(0)
  const useDefaultItems = photosProp === undefined
  const { status, photos: fetched, retry } = usePublicGallery(useDefaultItems)

  const photos = photosProp ?? fetched
  const hasPhotos = photos.length > 0
  const showLoading = useDefaultItems && status === 'loading'
  const showError = useDefaultItems && status === 'error'
  const maxCarouselIndex = Math.max(0, photos.length - photosPerView)
  const canMove = maxCarouselIndex > 0
  const totalPages = maxCarouselIndex + 1
  const isAutoplayStopped = paused || reducedMotion || pageHidden
  useEffect(() => {
    const update = () => setPhotosPerView(window.innerWidth < 640 ? 1 : 2)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const sync = () => setPageHidden(document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  if (carouselIndex > maxCarouselIndex) {
    setCarouselIndex(maxCarouselIndex)
  }

  const goToCarouselIndex = useCallback((index: number, fromUser = false) => {
    if (maxCarouselIndex === 0) {
      setCarouselIndex(0)
      return
    }
    const wrapped = ((index % totalPages) + totalPages) % totalPages
    setCarouselIndex(wrapped)
    if (fromUser) setCycleKey((key) => key + 1)
  }, [maxCarouselIndex, totalPages])

  useEffect(() => {
    if (!canMove || isAutoplayStopped) return
    const timer = window.setInterval(() => {
      setCarouselIndex((index) => (index >= maxCarouselIndex ? 0 : index + 1))
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [canMove, cycleKey, isAutoplayStopped, maxCarouselIndex])

  const statusLabel = useMemo(() => {
    const first = carouselIndex + 1
    const last = Math.min(carouselIndex + photosPerView, photos.length)
    return `${first}–${last} / ${photos.length}`
  }, [carouselIndex, photos.length, photosPerView])

  const onCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!canMove) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goToCarouselIndex(carouselIndex - 1, true)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goToCarouselIndex(carouselIndex + 1, true)
    }
  }

  return (
    <section
      className="public-section bg-white"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="public-container">
        <header className="mx-auto max-w-[720px] text-center">
          <p className="mb-2 inline-block text-[13px] font-semibold uppercase tracking-[0.12em] text-sigasj-primary [margin-inline-end:-0.12em]">
            Nuestra comunidad
          </p>
          <h2 id={`${id}-title`} className="public-section-title">
            {title}
          </h2>
          <p className="mx-auto mb-0 mt-4 max-w-[36rem] text-pretty text-base leading-[1.65] text-sigasj-muted">
            {description}
          </p>
        </header>

        {showLoading ? (
          <p className="gallery-section__empty" role="status">
            Cargando galería…
          </p>
        ) : showError ? (
          <div className="gallery-section__empty" role="alert">
            <p>{errorMessage}</p>
            <button type="button" onClick={retry}>
              Reintentar
            </button>
          </div>
        ) : hasPhotos ? (
          <div
            className="gallery-section__carousel-shell relative mt-10 outline-none"
            role="region"
            aria-roledescription="carrusel"
            aria-label="Fotografías de la comunidad"
            tabIndex={canMove ? 0 : -1}
            onKeyDown={onCarouselKeyDown}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
            }}
          >
            <p className="gallery-section__status sr-only" aria-live="polite">
              {statusLabel}
            </p>

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{
                  width: `${(photos.length / photosPerView) * 100}%`,
                  transform: `translateX(-${(carouselIndex * 100) / photos.length}%)`,
                }}
              >
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="min-w-0 px-2 sm:px-3"
                    style={{ width: `${100 / photos.length}%` }}
                  >
                    <GalleryCard
                      id={photo.id}
                      imageUrl={photo.imageUrl}
                      altText={photo.altText}
                      title={photo.title}
                      description={photo.description}
                      onExpand={() => setLightboxIndex(index)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {canMove ? (
              <div className="mt-7 flex flex-col items-center gap-4">
                <div className="gallery-section__controls flex items-center gap-3" aria-label="Controles de la galería">
                  <button
                    className="grid size-11 cursor-pointer place-items-center rounded-full border border-sigasj-border bg-white text-sigasj-ink transition duration-200 hover:-translate-y-0.5 hover:border-sigasj-primary hover:text-sigasj-primary"
                    type="button"
                    onClick={() => goToCarouselIndex(carouselIndex - 1, true)}
                    aria-label="Ver fotografías anteriores"
                  >
                    <IconChevronLeft size={20} aria-hidden="true" />
                  </button>
                  <button
                    className="grid size-11 cursor-pointer place-items-center rounded-full border border-sigasj-border bg-white text-sigasj-ink transition duration-200 hover:-translate-y-0.5 hover:border-sigasj-primary hover:text-sigasj-primary"
                    type="button"
                    onClick={() => goToCarouselIndex(carouselIndex + 1, true)}
                    aria-label="Ver fotografías siguientes"
                  >
                    <IconChevronRight size={20} aria-hidden="true" />
                  </button>
                </div>
                <div className="gallery-section__dots flex items-center justify-center gap-2" aria-label="Páginas de la galería">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`h-1.5 cursor-pointer rounded-full border-0 p-0 transition-all duration-300 ${
                        index === carouselIndex
                          ? 'is-active w-7 bg-sigasj-primary'
                          : 'w-2.5 bg-sigasj-border hover:bg-sigasj-border-strong'
                      }`}
                      aria-label={`Ir al grupo ${index + 1}`}
                      aria-current={index === carouselIndex ? 'true' : undefined}
                      onClick={() => goToCarouselIndex(index, true)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <p className="gallery-section__swipe-hint sr-only">
              Deslice horizontalmente para ver más fotografías.
            </p>
          </div>
        ) : (
          <p className="gallery-section__empty" role="status">
            {emptyMessage}
          </p>
        )}
      </div>

      {lightboxIndex !== null && hasPhotos ? (
        <GalleryLightbox
          photos={photos}
          activeIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </section>
  )
}

export default GallerySection
