import GalleryCard from './GalleryCard'
import type { GallerySectionProps } from '../Props/GallerySectionProps'
import { GALLERY_SECTION_ID } from '../config/landingAnchors'
import { usePublicGallery } from '../hooks/usePublicGallery'

/**
 * Sección pública de la galería fotográfica.
 * Sin `photos` en props consulta GET /api/public/galeria.
 * Con `photos` (modo controlado) no llama al API.
 */
const GallerySection = ({
  id = GALLERY_SECTION_ID,
  title = 'Galería',
  description =
    'Conoce imágenes de proyectos, obras y actividades realizadas por la ASADA San Juan de Santa Cruz.',
  photos: photosProp,
  emptyMessage = 'Próximamente publicaremos fotografías de la comunidad.',
  errorMessage = 'No fue posible cargar la galería. Intenta de nuevo más tarde.',
}: GallerySectionProps) => {
  const fetchFromApi = photosProp === undefined
  const { status, photos: fetched, retry } = usePublicGallery(fetchFromApi)

  const photos = photosProp ?? fetched
  const hasPhotos = photos.length > 0
  const showLoading = fetchFromApi && status === 'loading'
  const showError = fetchFromApi && status === 'error'

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
            {photos.map((photo) => (
              <GalleryCard
                key={photo.id}
                id={photo.id}
                imageUrl={photo.imageUrl}
                altText={photo.altText}
                title={photo.title}
                description={photo.description}
              />
            ))}
          </div>
        ) : (
          <p className="gallery-section__empty" role="status">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  )
}

export default GallerySection
