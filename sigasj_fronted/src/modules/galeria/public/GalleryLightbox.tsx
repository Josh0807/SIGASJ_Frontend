import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import {
  IconChevronLeft,
  IconChevronRight,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
  IconX,
} from '@tabler/icons-react'
import type { GalleryPhoto } from './GallerySectionProps'

type GalleryLightboxProps = {
  photos: GalleryPhoto[]
  activeIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

const ZOOM_MIN = 1
const ZOOM_MAX = 5
const ZOOM_STEP = 0.5

const clampZoom = (value: number) =>
  Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 100) / 100))

const wrapIndex = (index: number, total: number) =>
  total <= 0 ? 0 : ((index % total) + total) % total

/**
 * Vista ampliada de galería: misma estética que comunicados, solo imagen.
 */
const GalleryLightbox = ({
  photos,
  activeIndex,
  onClose,
  onNavigate,
}: GalleryLightboxProps) => {
  const closeRef = useRef<HTMLButtonElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef(ZOOM_MIN)
  const panRef = useRef({ x: 0, y: 0 })
  const activeIndexRef = useRef(activeIndex)
  const photosLengthRef = useRef(photos.length)
  const onCloseRef = useRef(onClose)
  const onNavigateRef = useRef(onNavigate)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  const photo = photos[activeIndex]
  const hasMany = photos.length > 1
  const [zoom, setZoom] = useState(ZOOM_MIN)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const isZoomed = zoom > ZOOM_MIN + 0.01
  const zoomPercent = Math.round(zoom * 100)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const goTo = useCallback(
    (index: number) => {
      if (photos.length <= 1) return
      onNavigate(wrapIndex(index, photos.length))
    },
    [onNavigate, photos.length],
  )

  const resetView = useCallback(() => {
    zoomRef.current = ZOOM_MIN
    panRef.current = { x: 0, y: 0 }
    setZoom(ZOOM_MIN)
    setPan({ x: 0, y: 0 })
    setIsDragging(false)
    dragRef.current = null
  }, [])

  const resetViewRef = useRef(resetView)

  const setZoomLevel = useCallback((nextRaw: number) => {
    const next = clampZoom(nextRaw)
    zoomRef.current = next
    setZoom(next)
    if (next <= ZOOM_MIN) {
      panRef.current = { x: 0, y: 0 }
      setPan({ x: 0, y: 0 })
    }
  }, [])

  const zoomBy = useCallback(
    (delta: number) => {
      setZoomLevel(zoomRef.current + delta)
    },
    [setZoomLevel],
  )

  const zoomByRef = useRef(zoomBy)

  useEffect(() => {
    zoomRef.current = zoom
    panRef.current = pan
    activeIndexRef.current = activeIndex
    photosLengthRef.current = photos.length
    onCloseRef.current = onClose
    onNavigateRef.current = onNavigate
    resetViewRef.current = resetView
    zoomByRef.current = zoomBy
  }, [activeIndex, onClose, onNavigate, pan, photos.length, resetView, zoom, zoomBy])

  const zoomIn = useCallback(() => zoomBy(ZOOM_STEP), [zoomBy])
  const zoomOut = useCallback(() => zoomBy(-ZOOM_STEP), [zoomBy])

  useEffect(() => {
    const frame = window.requestAnimationFrame(resetView)
    return () => window.cancelAnimationFrame(frame)
  }, [activeIndex, resetView])

  useEffect(() => {
    const node = mediaRef.current
    if (!node) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      event.stopPropagation()
      zoomByRef.current(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    const html = document.documentElement
    const { body } = document
    const scrollbar = window.innerWidth - html.clientWidth
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
    }

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    if (scrollbar > 0) {
      body.style.paddingRight = `${scrollbar}px`
    }

    closeRef.current?.focus({ preventScroll: true })

    const blockBackgroundScroll = (event: TouchEvent | WheelEvent) => {
      const target = event.target as Node | null
      const media = mediaRef.current
      if (media && target && media.contains(target)) return
      event.preventDefault()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const index = activeIndexRef.current
      const length = photosLengthRef.current
      if (event.key === 'Escape') {
        if (zoomRef.current > ZOOM_MIN + 0.01) {
          event.preventDefault()
          resetViewRef.current()
          return
        }
        onCloseRef.current()
      }
      if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        zoomByRef.current(ZOOM_STEP)
      }
      if (event.key === '-' || event.key === '_') {
        event.preventDefault()
        zoomByRef.current(-ZOOM_STEP)
      }
      if (event.key === '0') {
        event.preventDefault()
        resetViewRef.current()
      }
      if (zoomRef.current <= ZOOM_MIN + 0.01 && length > 1) {
        if (event.key === 'ArrowLeft') onNavigateRef.current(wrapIndex(index - 1, length))
        if (event.key === 'ArrowRight') onNavigateRef.current(wrapIndex(index + 1, length))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('wheel', blockBackgroundScroll, { passive: false, capture: true })
    window.addEventListener('touchmove', blockBackgroundScroll, { passive: false, capture: true })

    return () => {
      html.style.overflow = previous.htmlOverflow
      body.style.overflow = previous.bodyOverflow
      body.style.paddingRight = previous.bodyPaddingRight
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', blockBackgroundScroll, true)
      window.removeEventListener('touchmove', blockBackgroundScroll, true)
    }
  }, [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isZoomed || event.button !== 0) return
    if ((event.target as HTMLElement | null)?.closest('.announcement-lightbox__zoom')) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: panRef.current.x,
      originY: panRef.current.y,
    }
    setIsDragging(true)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const next = {
      x: drag.originX + (event.clientX - drag.startX),
      y: drag.originY + (event.clientY - drag.startY),
    }
    panRef.current = next
    setPan(next)
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleImageDoubleClick = () => {
    if (isZoomed) {
      resetView()
      return
    }
    setZoomLevel(2.5)
  }

  if (!photo || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="announcement-lightbox announcement-lightbox--media-only"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="announcement-lightbox__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={
          photo.title?.trim()
            ? `Fotografía: ${photo.title.trim()}`
            : 'Vista ampliada de la galería'
        }
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

        <div className="announcement-lightbox__layout">
          <div
            ref={mediaRef}
            className={`announcement-lightbox__media${isZoomed ? ' is-zoomed' : ''}${isDragging ? ' is-dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div
              key={photo.id}
              className={`announcement-lightbox__stage${reducedMotion ? '' : ' announcement-lightbox__stage--enter'}`}
            >
              <img
                src={photo.imageUrl}
                alt={photo.altText}
                className="announcement-lightbox__image"
                decoding="async"
                draggable={false}
                onDoubleClick={handleImageDoubleClick}
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                }}
              />
            </div>

            <div
              className="announcement-lightbox__zoom"
              role="group"
              aria-label="Zoom de la fotografía"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="announcement-lightbox__zoom-btn"
                onClick={(event) => {
                  event.stopPropagation()
                  zoomOut()
                }}
                disabled={zoom <= ZOOM_MIN}
                aria-label="Alejar imagen"
              >
                <IconZoomOut size={18} aria-hidden="true" />
              </button>
              <span className="announcement-lightbox__zoom-label" aria-live="polite">
                {zoomPercent}%
              </span>
              <button
                type="button"
                className="announcement-lightbox__zoom-btn"
                onClick={(event) => {
                  event.stopPropagation()
                  zoomIn()
                }}
                disabled={zoom >= ZOOM_MAX}
                aria-label="Acercar imagen"
              >
                <IconZoomIn size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="announcement-lightbox__zoom-btn"
                onClick={(event) => {
                  event.stopPropagation()
                  resetView()
                }}
                disabled={!isZoomed}
                aria-label="Restablecer zoom"
              >
                <IconZoomReset size={18} aria-hidden="true" />
              </button>
            </div>

            {!isZoomed && hasMany ? (
              <button
                type="button"
                className="announcement-lightbox__nav announcement-lightbox__nav--prev"
                onClick={() => goTo(activeIndex - 1)}
                aria-label="Fotografía anterior"
              >
                <IconChevronLeft size={22} aria-hidden="true" />
              </button>
            ) : null}

            {!isZoomed && hasMany ? (
              <button
                type="button"
                className="announcement-lightbox__nav announcement-lightbox__nav--next"
                onClick={() => goTo(activeIndex + 1)}
                aria-label="Fotografía siguiente"
              >
                <IconChevronRight size={22} aria-hidden="true" />
              </button>
            ) : null}

            {hasMany && !isZoomed ? (
              <p className="sr-only" aria-live="polite">
                {activeIndex + 1} / {photos.length}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default GalleryLightbox
