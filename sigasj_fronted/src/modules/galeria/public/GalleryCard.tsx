import type { GalleryCardProps } from './GallerySectionProps'

import { IconDots, IconPhoto } from '@tabler/icons-react'

/**
 * Tarjeta reutilizable de una fotografía pública.
 * Solo presenta datos recibidos por props.
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

  return (
    <article
      className="gallery-section__card group flex shrink-0 basis-[calc((100%_-_1.25rem)/2)] snap-start flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white p-3.5 shadow-none transition duration-300 hover:-translate-y-2 hover:shadow-none max-[640px]:basis-full"
      aria-labelledby={safeTitle ? titleId : undefined}
    >
      {onExpand ? (
        <button
          type="button"
          className="gallery-section__open block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left"
          onClick={onExpand}
          aria-label={expandLabel}
        >
          <div className="gallery-section__media aspect-[4/3] max-h-[220px] overflow-hidden rounded-xl bg-sky-50">
            <img
              className="gallery-section__image h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
              src={safeImageUrl}
              alt={safeAltText}
              loading="lazy"
              decoding="async"
            />
          </div>
        </button>
      ) : (
        <div className="gallery-section__media aspect-[4/3] max-h-[220px] overflow-hidden rounded-xl bg-sky-50">
          <img
            className="gallery-section__image h-full w-full object-cover"
            src={safeImageUrl}
            alt={safeAltText}
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      {(safeTitle || safeDescription) && (
        <div className="gallery-section__caption flex items-center gap-3 pt-3.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-100 text-[#0872d3]" aria-hidden="true"><IconPhoto size={18} /></span>
          <div className="min-w-0 flex-1">
          {safeTitle ? (
            <h3 className="gallery-section__title m-0 text-[0.94rem] font-extrabold leading-[1.35] text-[#082f6b]" id={titleId}>
              {safeTitle}
            </h3>
          ) : null}
          {safeDescription ? (
            <p className="gallery-section__description mb-0 mt-2 text-sm leading-6 text-[#526d8c]">{safeDescription}</p>
          ) : null}
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sky-50 text-[#0872d3]" aria-hidden="true"><IconDots size={19} /></span>
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
