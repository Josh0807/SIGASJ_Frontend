import type { GalleryCardProps } from './GallerySectionProps'

/**
 * Fotografía pública: la imagen manda; caption mínimo bajo la foto.
 */
const GalleryCard = ({
  id,
  imageUrl,
  altText,
  title,
  description,
  onExpand,
}: GalleryCardProps) => {
  const safeImageUrl = asPublicAssetUrl(imageUrl)
  const safeAltText = asNonEmptyString(altText) ?? 'Fotografía de la galería'
  const safeTitle = asNonEmptyString(title)
  const safeDescription = asNonEmptyString(description)

  if (!safeImageUrl) {
    return null
  }

  const titleId = `gallery-photo-title-${id}`
  const expandLabel = safeTitle
    ? `Ver imagen ampliada: ${safeTitle}`
    : `Ver imagen ampliada: ${safeAltText}`

  const media = (
    <div className="gallery-section__media aspect-[4/3] overflow-hidden rounded-2xl bg-sigasj-surface-soft">
      <img
        className="gallery-section__image h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
        src={safeImageUrl}
        alt={safeAltText}
        loading="lazy"
        decoding="async"
      />
    </div>
  )

  return (
    <article
      className="gallery-section__card group flex w-full min-w-0 flex-col"
      aria-labelledby={safeTitle ? titleId : undefined}
    >
      {onExpand ? (
        <button
          type="button"
          className="gallery-section__open block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sigasj-primary"
          onClick={onExpand}
          aria-label={expandLabel}
        >
          {media}
        </button>
      ) : (
        media
      )}

      {(safeTitle || safeDescription) && (
        <div className="gallery-section__caption min-w-0 pt-3">
          {safeTitle ? (
            <h3
              className="gallery-section__title m-0 text-[0.95rem] font-semibold leading-snug text-sigasj-ink"
              id={titleId}
            >
              {safeTitle}
            </h3>
          ) : null}
          {safeDescription ? (
            <p className="gallery-section__description mb-0 mt-1 line-clamp-2 text-sm leading-relaxed text-sigasj-muted">
              {safeDescription}
            </p>
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
