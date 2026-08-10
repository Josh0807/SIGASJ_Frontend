import type { GalleryCardProps } from '../Props/GallerySectionProps'

/**
 * Tarjeta reutilizable de una fotografía pública.
 * Solo presenta datos recibidos por props; no consulta API ni administra la galería.
 */
const GalleryCard = ({
  id,
  imageUrl,
  altText,
  title,
  description,
}: GalleryCardProps) => {
  const safeImageUrl = asPublicAssetUrl(imageUrl)
  const safeAltText = asNonEmptyString(altText) ?? 'Fotografía de la galería'
  const safeTitle = asNonEmptyString(title)
  const safeDescription = asNonEmptyString(description)

  if (!safeImageUrl) {
    return null
  }

  const titleId = `gallery-photo-title-${id}`

  return (
    <article
      className="gallery-section__card"
      aria-labelledby={safeTitle ? titleId : undefined}
    >
      <div className="gallery-section__media">
        <img
          className="gallery-section__image"
          src={safeImageUrl}
          alt={safeAltText}
          loading="lazy"
          decoding="async"
        />
      </div>

      {(safeTitle || safeDescription) && (
        <div className="gallery-section__caption">
          {safeTitle ? (
            <h3 className="gallery-section__title" id={titleId}>
              {safeTitle}
            </h3>
          ) : null}
          {safeDescription ? (
            <p className="gallery-section__description">{safeDescription}</p>
          ) : null}
        </div>
      )}
    </article>
  )
}

const asNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed || undefined
}

const asPublicAssetUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
    return undefined
  }

  return trimmed
}

export default GalleryCard
