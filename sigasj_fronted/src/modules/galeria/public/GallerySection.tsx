import { useState } from 'react'
import GalleryCard from './GalleryCard'
import GalleryLightbox from './GalleryLightbox'
import type { GallerySectionProps } from './GallerySectionProps'
import { GALLERY_SECTION_ID } from '../../landing/config/landingAnchors'
import { usePublicGallery } from './usePublicGallery'

const SKELETON_COUNT = 3

/**
 * Sección pública de la galería fotográfica.
 * Sin `photos` en props usa la colección de ejemplo.
 * Con `photos` (modo controlado) muestra exactamente esos datos.
 */
const GallerySection = ({
  id = GALLERY_SECTION_ID,
  title = 'Galería',
  description =
    'Aquí encontrará imágenes de la ASADA San Juan de Santa Cruz.',
  photos: photosProp,
  emptyMessage = 'Próximamente publicaremos fotografías de la comunidad.',
  errorMessage = 'No fue posible cargar la galería. Intenta de nuevo más tarde.',
}: GallerySectionProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const useDefaultItems = photosProp === undefined
  const { status, photos: fetched, retry } = usePublicGallery(useDefaultItems)

  const photos = photosProp ?? fetched
  const hasPhotos = photos.length > 0
  const showLoading = useDefaultItems && status === 'loading'
  const showError = useDefaultItems && status === 'error'

  return (
    <section
      className="landing-section gallery-section"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="gallery-section__content">
        <header className="gallery-section__heading landing-section__heading">
          <div className="gallery-section__heading-copy">
            <p className="landing-eyebrow">Nuestra comunidad</p>
            <h2 id={`${id}-title`}>{title}</h2>
            <p className="landing-section__lead">{description}</p>
          </div>

          {hasPhotos ? (
            <p className="gallery-section__count" aria-live="polite">
              <span className="gallery-section__count-value">{photos.length}</span>
              {photos.length === 1 ? ' fotografía' : ' fotografías'}
            </p>
          ) : null}
        </header>

        {showLoading ? (
          <div
            className="gallery-section__grid gallery-section__grid--loading"
            role="status"
            aria-busy="true"
            aria-label="Cargando galería"
          >
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div
                className="gallery-section__skeleton"
                key={`gallery-skeleton-${index}`}
                aria-hidden="true"
              >
                <div className="gallery-section__skeleton-media" />
                <div className="gallery-section__skeleton-line gallery-section__skeleton-line--short" />
                <div className="gallery-section__skeleton-line" />
              </div>
            ))}
            <p className="gallery-section__loading-text">Cargando galería…</p>
          </div>
        ) : showError ? (
          <div className="gallery-section__empty gallery-section__empty--error" role="alert">
            <span className="gallery-section__empty-icon" aria-hidden="true">
              !
            </span>
            <p>{errorMessage}</p>
            <button type="button" onClick={retry}>
              Reintentar
            </button>
          </div>
        ) : hasPhotos ? (
          <div className="gallery-section__grid">
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
        ) : (
          <div className="gallery-section__empty" role="status">
            <span className="gallery-section__empty-icon" aria-hidden="true">
              🖼
            </span>
            <p>{emptyMessage}</p>
          </div>
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
