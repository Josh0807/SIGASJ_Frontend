import GalleryCard from './GalleryCard'
import type { GallerySectionProps } from '../Props/GallerySectionProps'
import { GALLERY_SECTION_ID } from '../config/landingAnchors'
import { galleryMocks } from '../data/galleryMocks'

/**
 * Sección pública de la galería fotográfica.
 * Por ahora usa una colección temporal para validar GalleryCard.
 * El consumo del API se retoma en la tarea de integración correspondiente.
 */
const GallerySection = ({
  id = GALLERY_SECTION_ID,
  title = 'Galería',
  description =
    'Conoce imágenes de proyectos, obras y actividades realizadas por la ASADA San Juan de Santa Cruz.',
  photos = galleryMocks,
  emptyMessage = 'Próximamente publicaremos fotografías de la comunidad.',
}: GallerySectionProps) => {
  const hasPhotos = photos.length > 0

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

        {hasPhotos ? (
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
