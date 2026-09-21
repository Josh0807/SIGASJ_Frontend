import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { IconMinus, IconPlus, IconRefresh } from '@tabler/icons-react'
import type { GalleryPhoto } from './GallerySectionProps'

type GalleryLightboxProps = {
  photos: GalleryPhoto[]
  activeIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

const GalleryLightbox = ({ photos, activeIndex, onClose, onNavigate }: GalleryLightboxProps) => {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ x: 0, y: 0, panX: 0, panY: 0, active: false })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const photo = photos[activeIndex]
  const hasPrev = activeIndex > 0
  const hasNext = activeIndex < photos.length - 1

  const changePhoto = useCallback((index: number) => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    onNavigate(index)
  }, [onNavigate])

  const zoomOut = useCallback(() => {
    setPan({ x: 0, y: 0 })
    setZoom((value) => Math.max(1, value - 0.25))
  }, [])
  const zoomIn = useCallback(() => setZoom((value) => Math.min(3, value + 0.25)), [])
  const resetZoom = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const startDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = panRef.current
    if (!viewport || zoom === 1) return

    viewport.setPointerCapture(event.pointerId)
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      panX: pan.x,
      panY: pan.y,
      active: true,
    }
    setIsDragging(true)
  }

  const dragImage = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = panRef.current
    if (!viewport || !dragRef.current.active) return

    event.preventDefault()
    const maxX = ((zoom - 1) * viewport.clientWidth) / 2
    const maxY = ((zoom - 1) * viewport.clientHeight) / 2
    const nextX = dragRef.current.panX + (event.clientX - dragRef.current.x)
    const nextY = dragRef.current.panY + (event.clientY - dragRef.current.y)
    setPan({
      x: Math.max(-maxX, Math.min(maxX, nextX)),
      y: Math.max(-maxY, Math.min(maxY, nextY)),
    })
  }

  const stopDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current.active = false
    if (panRef.current?.hasPointerCapture(event.pointerId)) {
      panRef.current.releasePointerCapture(event.pointerId)
    }
    setIsDragging(false)
  }

  useEffect(() => {
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && hasPrev) changePhoto(activeIndex - 1)
      if (event.key === 'ArrowRight' && hasNext) changePhoto(activeIndex + 1)
      if (event.key === '+' || event.key === '=') zoomIn()
      if (event.key === '-') zoomOut()
      if (event.key === '0') resetZoom()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeIndex, changePhoto, hasNext, hasPrev, onClose, resetZoom, zoomIn, zoomOut])

  if (!photo) return null

  return (
    <div className="gallery-lightbox" role="presentation" onClick={onClose}>
      <div className="gallery-lightbox__dialog" role="dialog" aria-modal="true" aria-label="Vista ampliada de la galería" onClick={(event) => event.stopPropagation()}>
        <button ref={closeRef} type="button" className="gallery-lightbox__close" onClick={onClose} aria-label="Cerrar vista ampliada">×</button>

        {photos.length > 1 ? <p className="gallery-lightbox__counter" aria-live="polite">{activeIndex + 1} de {photos.length}</p> : null}

        {hasPrev ? <button type="button" className="gallery-lightbox__nav gallery-lightbox__nav--prev" onClick={() => changePhoto(activeIndex - 1)} aria-label="Fotografía anterior">‹</button> : null}

        <figure className="gallery-lightbox__figure">
          <div className="flex items-center justify-center gap-2" role="group" aria-label="Controles de ampliación">
            <button type="button" className="grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40" onClick={zoomOut} disabled={zoom === 1} aria-label="Alejar imagen">
              <IconMinus size={20} aria-hidden="true" />
            </button>
            <span className="min-w-14 text-center text-sm font-bold text-white" aria-live="polite">{Math.round(zoom * 100)}%</span>
            <button type="button" className="grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40" onClick={zoomIn} disabled={zoom === 3} aria-label="Acercar imagen">
              <IconPlus size={20} aria-hidden="true" />
            </button>
            <button type="button" className="ml-1 grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-white/15 text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-40" onClick={resetZoom} disabled={zoom === 1} aria-label="Restablecer tamaño">
              <IconRefresh size={18} aria-hidden="true" />
            </button>
          </div>

          <div
            ref={panRef}
            className={`h-[58vh] w-full min-w-0 max-w-full overflow-hidden rounded-[14px] bg-white/5 select-none ${zoom > 1 ? (isDragging ? 'cursor-grabbing touch-none' : 'cursor-grab touch-none') : 'cursor-default'}`}
            style={{
              position: 'relative',
              width: '100%',
              height: '58vh',
              maxHeight: '600px',
              overflow: 'hidden',
              touchAction: zoom > 1 ? 'none' : 'auto',
            }}
            onPointerDown={startDragging}
            onPointerMove={dragImage}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            aria-label={zoom > 1 ? 'Imagen ampliada. Arrastre para recorrerla.' : undefined}
          >
            <img
              className="gallery-lightbox__image"
              src={photo.imageUrl}
              alt={photo.altText}
              draggable={false}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                maxWidth: 'none',
                maxHeight: 'none',
                objectFit: 'contain',
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                transformOrigin: 'center',
                transition: isDragging ? 'none' : 'transform 160ms ease-out',
                willChange: 'transform',
              }}
            />
          </div>

          {photo.title || photo.description ? (
            <figcaption className="gallery-lightbox__caption">
              {photo.title ? <strong className="gallery-lightbox__caption-title">{photo.title}</strong> : null}
              {photo.description ? <p className="gallery-lightbox__caption-text">{photo.description}</p> : null}
            </figcaption>
          ) : null}
        </figure>

        {hasNext ? <button type="button" className="gallery-lightbox__nav gallery-lightbox__nav--next" onClick={() => changePhoto(activeIndex + 1)} aria-label="Fotografía siguiente">›</button> : null}
      </div>
    </div>
  )
}

export default GalleryLightbox
