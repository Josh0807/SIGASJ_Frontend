import { useState } from 'react'
import GalleryCard from './GalleryCard'
import { useRef } from 'react'
import { useEffect } from 'react'
import GalleryLightbox from './GalleryLightbox'
import type { GallerySectionProps } from './GallerySectionProps'
import { GALLERY_SECTION_ID } from '../../landing/config/landingAnchors'
import { usePublicGallery } from './usePublicGallery'

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
  const carouselRef = useRef<HTMLDivElement>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [photosPerView, setPhotosPerView] = useState(2)
  const useDefaultItems = photosProp === undefined
  const { status, photos: fetched, retry } = usePublicGallery(useDefaultItems)

  const photos = photosProp ?? fetched
  const hasPhotos = photos.length > 0
  const showLoading = useDefaultItems && status === 'loading'
  const showError = useDefaultItems && status === 'error'
  const maxCarouselIndex = Math.max(0, photos.length - photosPerView)
  const canMove = maxCarouselIndex > 0
  useEffect(() => {
    const update = () => setPhotosPerView(window.innerWidth < 640 ? 1 : 2)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  const moveCarousel = (direction: -1 | 1) => {
    const carousel = carouselRef.current
    if (!carousel) return
    carousel.scrollBy({ left: direction * carousel.clientWidth * 0.85, behavior: 'smooth' })
  }
  const goToCarouselIndex = (index: number) => {
    const carousel = carouselRef.current
    if (!carousel) return
    const next = Math.max(0, Math.min(maxCarouselIndex, index))
    const maxScroll = carousel.scrollWidth - carousel.clientWidth
    carousel.scrollTo({ left: maxCarouselIndex ? maxScroll * next / maxCarouselIndex : 0, behavior: 'smooth' })
  }
  const syncCarouselIndex = () => {
    const carousel = carouselRef.current
    if (!carousel || !maxCarouselIndex) { setCarouselIndex(0); return }
    setCarouselIndex(Math.round((carousel.scrollLeft / (carousel.scrollWidth - carousel.clientWidth)) * maxCarouselIndex))
  }

  return (
    <section
      className="landing-section gallery-section"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="gallery-section__content">
        <header className="gallery-section__heading">
          <p className="gallery-section__eyebrow">Nuestra comunidad</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{description}</p>
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
          <div className="gallery-section__carousel-shell">
            {canMove ? <div className="gallery-section__toolbar"><p className="gallery-section__status" aria-live="polite">{carouselIndex + 1}–{Math.min(carouselIndex + photosPerView, photos.length)} / {photos.length}</p><div className="gallery-section__controls" aria-label="Controles de la galería"><button type="button" onClick={() => moveCarousel(-1)} aria-label="Ver fotografías anteriores">‹</button><button type="button" onClick={() => moveCarousel(1)} aria-label="Ver fotografías siguientes">›</button></div></div> : null}
            <div className="gallery-section__grid" ref={carouselRef} role="region" aria-label="Fotografías de la comunidad" tabIndex={0} onScroll={syncCarouselIndex}>
            {photos.map((photo, index) => (
              <GalleryCard
                key={photo.id}
                id={photo.id}
                imageUrl={photo.imageUrl}
                altText={photo.altText}
                title={photo.title}
                description={photo.description}
                onExpand={() => setLightboxIndex(index)}
              />
            ))}
            </div>
            {canMove ? <div className="gallery-section__dots" aria-label="Páginas de la galería">{Array.from({ length: maxCarouselIndex + 1 }, (_, index) => <button key={index} type="button" className={index === carouselIndex ? 'is-active' : ''} aria-label={`Ir al grupo ${index + 1}`} aria-current={index === carouselIndex ? 'true' : undefined} onClick={() => goToCarouselIndex(index)} />)}</div> : null}
            <p className="gallery-section__swipe-hint">Deslice horizontalmente para ver más fotografías.</p>
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
