import { useCallback, useEffect, useRef } from 'react'
import { IconChevronLeft, IconChevronRight, IconX } from '@tabler/icons-react'

export type AnnouncementLightboxItem = {
  id: string
  imageUrl: string
  altText: string
  title?: string
  description?: string
}

type AnnouncementLightboxProps = {
  items: AnnouncementLightboxItem[]
  activeIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

const AnnouncementLightbox = ({
  items,
  activeIndex,
  onClose,
  onNavigate,
}: AnnouncementLightboxProps) => {
  const closeRef = useRef<HTMLButtonElement>(null)
  const item = items[activeIndex]
  const hasPrev = activeIndex > 0
  const hasNext = activeIndex < items.length - 1
  const hasMany = items.length > 1

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= items.length) return
      onNavigate(index)
    },
    [items.length, onNavigate],
  )

  useEffect(() => {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    const previousOverflow = document.body.style.overflow
    const previousPadding = document.body.style.paddingRight

    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`
    }

    closeRef.current?.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && hasPrev) goTo(activeIndex - 1)
      if (event.key === 'ArrowRight' && hasNext) goTo(activeIndex + 1)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPadding
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeIndex, goTo, hasNext, hasPrev, onClose])

  if (!item) return null

  return (
    <div className="announcement-lightbox" role="presentation" onClick={onClose}>
      <div
        className="announcement-lightbox__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={item.title ? 'announcement-lightbox-title' : undefined}
        aria-label={item.title ? undefined : 'Vista del comunicado'}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="announcement-lightbox__close"
          onClick={onClose}
          aria-label="Cerrar vista ampliada"
        >
          <IconX size={20} stroke={1.9} aria-hidden="true" />
        </button>

        <div className="announcement-lightbox__media">
          <img
            key={item.id}
            src={item.imageUrl}
            alt={item.altText}
            className="announcement-lightbox__image"
            decoding="async"
          />

          {hasPrev ? (
            <button
              type="button"
              className="announcement-lightbox__nav announcement-lightbox__nav--prev"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Comunicado anterior"
            >
              <IconChevronLeft size={22} aria-hidden="true" />
            </button>
          ) : null}

          {hasNext ? (
            <button
              type="button"
              className="announcement-lightbox__nav announcement-lightbox__nav--next"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Comunicado siguiente"
            >
              <IconChevronRight size={22} aria-hidden="true" />
            </button>
          ) : null}

          {hasMany ? (
            <p className="announcement-lightbox__counter" aria-live="polite">
              {activeIndex + 1} / {items.length}
            </p>
          ) : null}
        </div>

        {item.title || item.description ? (
          <div className="announcement-lightbox__caption">
            {item.title ? (
              <h2 id="announcement-lightbox-title" className="announcement-lightbox__title">
                {item.title}
              </h2>
            ) : null}
            {item.description ? (
              <p className="announcement-lightbox__text">{item.description}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default AnnouncementLightbox
