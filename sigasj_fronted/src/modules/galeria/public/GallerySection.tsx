import { useState } from 'react'
import GalleryCard from './GalleryCard'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
  type TouchEvent,
} from 'react'
import GalleryLightbox from './GalleryLightbox'
import type { GallerySectionProps } from './GallerySectionProps'
import { GALLERY_SECTION_ID } from '../../landing/config/landingAnchors'
import { usePublicGallery } from './usePublicGallery'

const AUTOPLAY_MS = 7000

const getPhotosPerView = (width: number) => (width < 640 ? 1 : 2)

const wrapIndex = (index: number, total: number) =>
  ((index % total) + total) % total

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
  /** Evita pelear con AOS: la animación de slide solo al navegar, no al montar. */
  const [slideAnim, setSlideAnim] = useState(false)
  const touchStartXRef = useRef<number | null>(null)
  const touchEndXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const touchEndYRef = useRef<number | null>(null)
  const useDefaultItems = photosProp === undefined
  const { status, photos: fetched, retry } = usePublicGallery(useDefaultItems)

  const photos = photosProp ?? fetched
  const hasPhotos = photos.length > 0
  const showLoading = useDefaultItems && status === 'loading'
  const showError = useDefaultItems && status === 'error'
  const total = photos.length
  const visibleCount = Math.min(photosPerView, Math.max(total, 1))
  const canMove = total > visibleCount || total > 1
  const isAutoplayStopped = paused || reducedMotion || pageHidden || !canMove

  useEffect(() => {
    const update = () => setPhotosPerView(getPhotosPerView(window.innerWidth))
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

  useEffect(() => {
    if (total === 0) return
    setCarouselIndex((index) => wrapIndex(index, total))
  }, [total])

  const bumpCycle = useCallback(() => {
    setCycleKey((key) => key + 1)
  }, [])

  const goToCarouselIndex = useCallback(
    (index: number, fromUser = false) => {
      if (total <= 1) {
        setCarouselIndex(0)
        return
      }
      setSlideAnim(true)
      setCarouselIndex(wrapIndex(index, total))
      if (fromUser) bumpCycle()
    },
    [bumpCycle, total],
  )

  const handlePrev = useCallback(() => {
    goToCarouselIndex(carouselIndex - 1, true)
  }, [carouselIndex, goToCarouselIndex])

  const handleNext = useCallback(
    (fromUser = false) => {
      goToCarouselIndex(carouselIndex + 1, fromUser)
    },
    [carouselIndex, goToCarouselIndex],
  )

  useEffect(() => {
    if (isAutoplayStopped) return
    const timer = window.setInterval(() => {
      setSlideAnim(true)
      setCarouselIndex((index) => wrapIndex(index + 1, total))
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [cycleKey, isAutoplayStopped, total])

  const visiblePhotos = useMemo(() => {
    if (total === 0) return []
    return Array.from({ length: visibleCount }, (_, offset) => {
      const index = wrapIndex(carouselIndex + offset, total)
      return { photo: photos[index], index }
    })
  }, [carouselIndex, photos, total, visibleCount])

  const statusLabel = useMemo(() => {
    if (total === 0) return ''
    if (visibleCount === 1) return `${carouselIndex + 1} / ${total}`
    const last = wrapIndex(carouselIndex + visibleCount - 1, total) + 1
    return `${carouselIndex + 1}–${last} / ${total}`
  }, [carouselIndex, total, visibleCount])

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.targetTouches?.[0] || event.touches?.[0]
    if (!touch) return
    touchStartXRef.current = touch.clientX
    touchStartYRef.current = touch.clientY
    touchEndXRef.current = null
    touchEndYRef.current = null
  }

  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.targetTouches?.[0] || event.touches?.[0]
    if (!touch) return
    touchEndXRef.current = touch.clientX
    touchEndYRef.current = touch.clientY
  }

  const handleTouchEnd = () => {
    const startX = touchStartXRef.current
    const endX = touchEndXRef.current
    const startY = touchStartYRef.current
    const endY = touchEndYRef.current
    if (startX === null || endX === null) return

    const diffX = startX - endX
    const diffY = startY !== null && endY !== null ? startY - endY : 0
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      if (diffX > 0) handleNext(true)
      else handlePrev()
    }

    touchStartXRef.current = null
    touchEndXRef.current = null
    touchStartYRef.current = null
    touchEndYRef.current = null
  }

  const onCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!canMove) return
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      handlePrev()
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      handleNext(true)
    }
  }

  return (
    <section
      className="public-section bg-white"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="public-container">
        <header className="mx-auto max-w-[720px] text-center" data-aos="fade-up">
          <p className="public-eyebrow inline-block [margin-inline-end:-0.12em]">
            Nuestra comunidad
          </p>
          <h2 id={`${id}-title`} className="public-section-title">
            {title}
          </h2>
          <p className="public-section-intro mx-auto">{description}</p>
        </header>

        {showLoading ? (
          <p
            className="gallery-section__empty"
            role="status"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            Cargando galería…
          </p>
        ) : showError ? (
          <div
            className="gallery-section__empty"
            role="alert"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            <p>{errorMessage}</p>
            <button type="button" onClick={retry}>
              Reintentar
            </button>
          </div>
        ) : hasPhotos ? (
          <div
            className="gallery-section__carousel-shell relative mt-10 outline-none"
            data-aos="fade-up"
            data-aos-delay="80"
            role="region"
            aria-roledescription="carrusel"
            aria-label="Fotografías de la comunidad"
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

            <div className="flex items-center justify-center gap-2 max-[640px]:gap-1">
              {canMove ? (
                <button
                  className="z-30 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-sigasj-border bg-sigasj-surface text-sigasj-ink transition duration-200 hover:-translate-y-0.5 hover:border-sigasj-primary hover:text-sigasj-primary max-[640px]:size-9"
                  type="button"
                  onClick={handlePrev}
                  aria-label="Ver fotografías anteriores"
                >
                  <IconChevronLeft size={20} aria-hidden="true" />
                </button>
              ) : null}

              <div
                className="relative mx-auto w-full max-w-[58rem] outline-none"
                tabIndex={canMove ? 0 : -1}
                onKeyDown={onCarouselKeyDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  key={carouselIndex}
                  className={`grid gap-4 ${
                    visibleCount > 1
                      ? 'grid-cols-2 max-[640px]:grid-cols-1'
                      : 'grid-cols-1'
                  } ${!reducedMotion && slideAnim ? 'announcements-carousel__pair' : ''}`}
                >
                  {visiblePhotos.map(({ photo, index }) => (
                    <div key={`${photo.id}-${index}`} className="min-w-0">
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
                <button
                  className="z-30 grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-sigasj-border bg-sigasj-surface text-sigasj-ink transition duration-200 hover:-translate-y-0.5 hover:border-sigasj-primary hover:text-sigasj-primary max-[640px]:size-9"
                  type="button"
                  onClick={() => handleNext(true)}
                  aria-label="Ver fotografías siguientes"
                >
                  <IconChevronRight size={20} aria-hidden="true" />
                </button>
              ) : null}
            </div>

            {canMove ? (
              <div
                className="gallery-section__dots mt-6 flex items-center justify-center gap-2"
                aria-label="Páginas de la galería"
              >
                {photos.map((photo, index) => (
                  <button
                    key={`gallery-dot-${photo.id}`}
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
            ) : null}

            <p className="gallery-section__swipe-hint sr-only">
              Deslice horizontalmente para ver más fotografías.
            </p>
          </div>
        ) : (
          <p
            className="gallery-section__empty"
            role="status"
            data-aos="fade-up"
            data-aos-delay="80"
          >
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
