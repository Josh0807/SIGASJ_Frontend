import { useEffect, useRef } from 'react'
import type { GalleryPhoto } from './GallerySectionProps'

type GalleryLightboxProps = {
  photos: GalleryPhoto[]
  activeIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

const GalleryLightbox = ({
  photos,
  activeIndex,
  onClose,
  onNavigate,
}: GalleryLightboxProps) => {
  const closeRef = useRef<HTMLButtonElement>(null)
  const photo = photos[activeIndex]
  const hasPrev = activeIndex > 0
  const hasNext = activeIndex < photos.length - 1
  const captionId = photo ? `gallery-lightbox-caption-${photo.id}` : undefined

  useEffect(() => {
    closeRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
      if (event.key === 'ArrowLeft' && hasPrev) {
        onNavigate(activeIndex - 1)
      }
      if (event.key === 'ArrowRight' && hasNext) {
        onNavigate(activeIndex + 1)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeIndex, hasNext, hasPrev, onClose, onNavigate])

  if (!photo) {
    return null
  }

  return (
    <div
      className="gallery-lightbox"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="gallery-lightbox__dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Vista ampliada de la galería"
        aria-describedby={captionId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="gallery-lightbox__toolbar">
          {photos.length > 1 ? (
            <p className="gallery-lightbox__counter" aria-live="polite">
              {activeIndex + 1} / {photos.length}
            </p>
          ) : (
            <span />
          )}
          <button
            ref={closeRef}
            type="button"
            className="gallery-lightbox__close"
            onClick={onClose}
            aria-label="Cerrar vista ampliada"
          >
            <span aria-hidden="true">×</span>
            <span className="gallery-lightbox__close-label">Cerrar</span>
          </button>
        </div>

        <div className="gallery-lightbox__stage">
          {hasPrev ? (
            <button
              type="button"
              className="gallery-lightbox__nav gallery-lightbox__nav--prev"
              onClick={() => onNavigate(activeIndex - 1)}
              aria-label="Fotografía anterior"
            >
              ‹
            </button>
          ) : (
            <span className="gallery-lightbox__nav-spacer" aria-hidden="true" />
          )}

          <figure className="gallery-lightbox__figure">
            <div className="gallery-lightbox__image-wrap">
              <img
                className="gallery-lightbox__image"
                src={photo.imageUrl}
                alt={photo.altText}
              />
            </div>
            {photo.title || photo.description ? (
              <figcaption className="gallery-lightbox__caption" id={captionId}>
                {photo.title ? (
                  <strong className="gallery-lightbox__caption-title">
                    {photo.title}
                  </strong>
                ) : null}
                {photo.description ? (
                  <p className="gallery-lightbox__caption-text">
                    {photo.description}
                  </p>
                ) : null}
              </figcaption>
            ) : null}
          </figure>

          {hasNext ? (
            <button
              type="button"
              className="gallery-lightbox__nav gallery-lightbox__nav--next"
              onClick={() => onNavigate(activeIndex + 1)}
              aria-label="Fotografía siguiente"
            >
              ›
            </button>
          ) : (
            <span className="gallery-lightbox__nav-spacer" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  )
}

export default GalleryLightbox
