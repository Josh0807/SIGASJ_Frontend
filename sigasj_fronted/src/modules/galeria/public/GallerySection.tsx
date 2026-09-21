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
    'Aquí encontrara imágenes de la ASADA San Juan de Santa Cruz.',
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

  useEffect(() => {
    setCarouselIndex((index) => Math.min(index, maxCarouselIndex))
  }, [maxCarouselIndex])

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
      className="relative isolate min-h-0 overflow-hidden bg-[linear-gradient(135deg,#fbfdff_0%,#edf8ff_55%,#e4f5ff_100%)] px-6 py-12 max-[640px]:px-4 max-[640px]:py-9"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="pointer-events-none absolute -right-36 top-10 -z-10 h-48 w-[680px] -rotate-12 rounded-[50%] border-[42px] border-sky-300/20" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -left-28 -z-10 h-60 w-[920px] rotate-[8deg] rounded-[50%] bg-sky-200/35" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 right-[-10%] -z-10 h-64 w-[1050px] -rotate-6 rounded-[50%] border-[52px] border-sky-300/20" aria-hidden="true" />

      <div className="mx-auto w-full max-w-[1040px]">
        <header className="max-w-[780px]">
          <p className="mb-2 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.28em] text-[#1476cf] before:h-0.5 before:w-9 before:rounded-full before:bg-[#1476cf]">Nuestra comunidad</p>
          <h2 id={`${id}-title`} className="m-0 text-[clamp(2.2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.04em] text-[#092e67]">{title}</h2>
          <p className="mb-0 mt-3 text-base leading-7 text-[#526d8c]">{description}</p>
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
          <div className="mt-9 outline-none" role="region" aria-roledescription="carrusel" aria-label="Fotografías de la comunidad" tabIndex={canMove ? 0 : -1} onKeyDown={onCarouselKeyDown} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false) }}>
            {canMove ? <div className="mb-4 flex items-center justify-between"><p className="gallery-section__status m-0 text-xs font-bold tracking-[0.12em] text-[#526d8c]" aria-live="polite">{statusLabel}</p><div className="flex gap-2" aria-label="Controles de la galería"><button className="grid size-[38px] cursor-pointer place-items-center rounded-xl border border-sky-100 bg-white text-[#0872d3] shadow-[0_8px_20px_rgba(39,112,166,0.13)] transition hover:-translate-y-1 hover:bg-[#0872d3] hover:text-white" type="button" onClick={() => goToCarouselIndex(carouselIndex - 1, true)} aria-label="Ver fotografías anteriores"><IconChevronLeft size={20} aria-hidden="true" /></button><button className="grid size-[38px] cursor-pointer place-items-center rounded-xl border border-[#0872d3] bg-[#0872d3] text-white shadow-[0_8px_20px_rgba(8,114,211,0.24)] transition hover:-translate-y-1 hover:bg-[#0764b9]" type="button" onClick={() => goToCarouselIndex(carouselIndex + 1, true)} aria-label="Ver fotografías siguientes"><IconChevronRight size={20} aria-hidden="true" /></button></div></div> : null}
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500 ease-out" style={{ width: `${(photos.length / photosPerView) * 100}%`, transform: `translateX(-${(carouselIndex * 100) / photos.length}%)` }}>
                {photos.map((photo, index) => (
                  <div key={photo.id} className="min-w-0 px-2 [&>.gallery-section__card]:w-full [&>.gallery-section__card]:basis-full" style={{ width: `${100 / photos.length}%` }}>
                    <GalleryCard id={photo.id} imageUrl={photo.imageUrl} altText={photo.altText} title={photo.title} description={photo.description} onExpand={() => setLightboxIndex(index)} />
                  </div>
                ))}
              </div>
            </div>
            {canMove ? <div className="gallery-section__dots mt-6 flex items-center justify-center gap-3" aria-label="Páginas de la galería">{Array.from({ length: totalPages }, (_, index) => <button key={index} type="button" className={`h-1.5 cursor-pointer rounded-full border-0 p-0 transition-all ${index === carouselIndex ? 'is-active w-7 bg-[#0872d3]' : 'w-5 bg-sky-200 hover:bg-sky-300'}`} aria-label={`Ir al grupo ${index + 1}`} aria-current={index === carouselIndex ? 'true' : undefined} onClick={() => goToCarouselIndex(index, true)} />)}</div> : null}
            <p className="gallery-section__swipe-hint sr-only">Deslice horizontalmente para ver más fotografías.</p>
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
