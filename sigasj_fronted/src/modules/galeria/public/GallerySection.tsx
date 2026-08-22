import { useState } from 'react'
import GalleryCard from './GalleryCard'
import GalleryLightbox from './GalleryLightbox'
import type { GallerySectionProps } from './GallerySectionProps'
import { GALLERY_SECTION_ID } from '../../landing/config/landingAnchors'
import { usePublicGallery } from './usePublicGallery'

/**
 * Sección pública de la galería fotográfica.
 * Sin `photos` en props consulta el API público (solo activas).
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
