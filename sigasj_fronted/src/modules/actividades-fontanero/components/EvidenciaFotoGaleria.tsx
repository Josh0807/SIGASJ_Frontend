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
  IconTrash,
  IconX,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from '@tabler/icons-react'
import type { DocumentoActividadRegistrado } from '../types/actividadFontaneroApi'
import {
  esEvidenciaImagen,
  evidenciaActividadPublicUrl,
} from '../utils/evidenciaActividadUrl'
import { crearMiniaturaEvidencia } from '../utils/evidenciaMiniatura'

const ZOOM_MIN = 1
const ZOOM_MAX = 5
const ZOOM_STEP = 0.5

const clampZoom = (value: number) =>
  Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 100) / 100))

const wrapIndex = (index: number, total: number) =>
  total <= 0 ? 0 : ((index % total) + total) % total

const FotoMiniatura = ({
  src,
  disabled,
  onOpen,
}: {
  src: string
  disabled?: boolean
  onOpen: () => void
}) => {
  const [thumb, setThumb] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let created: string | null = null

    crearMiniaturaEvidencia(src)
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url)
          return
        }
        created = url
        setThumb(url)
      })
      .catch(() => {
        if (active) {
          setThumb(src)
        }
      })

    return () => {
      active = false
      if (created) {
        URL.revokeObjectURL(created)
      }
    }
  }, [src])

  return (
    <button
      type="button"
      className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[13px] border-0 bg-sigasj-surface-soft p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sigasj-primary disabled:cursor-default"
      onClick={onOpen}
      disabled={disabled}
    >
      {thumb ? (
        <img
          src={thumb}
          alt=""
          decoding="async"
          className="absolute inset-0 size-full object-cover transition duration-500 ease-out hover:scale-[1.03]"
        />
      ) : (
        <span
          className="absolute inset-0 animate-pulse bg-sigasj-surface-soft motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
    </button>
  )
}

type EvidenciaFotoGaleriaProps = {
  documentos: DocumentoActividadRegistrado[]
  actividadId: number
  canDelete?: boolean
  disabled?: boolean
  emptyLabel?: string
  onDelete?: (documento: DocumentoActividadRegistrado) => void
}

const EvidenciaFotoGaleria = ({
  documentos,
  actividadId,
  canDelete = false,
  disabled = false,
  emptyLabel = 'Sin fotos adjuntas.',
  onDelete,
}: EvidenciaFotoGaleriaProps) => {
  const fotos = documentos.filter(esEvidenciaImagen)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const closeRef = useRef<HTMLButtonElement>(null)
  const mediaRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef(ZOOM_MIN)
  const panRef = useRef({ x: 0, y: 0 })
  const activeIndexRef = useRef(activeIndex)
  const fotosLengthRef = useRef(fotos.length)
  const dragRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  const [zoom, setZoom] = useState(ZOOM_MIN)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const selected = activeIndex !== null ? fotos[activeIndex] ?? null : null
  const hasMany = fotos.length > 1
  const isZoomed = zoom > ZOOM_MIN + 0.01
  const zoomPercent = Math.round(zoom * 100)
  const selectedUrl = selected
    ? evidenciaActividadPublicUrl(
        selected.rutaReferenciaArchivo,
        actividadId || selected.actividadId,
      )
    : ''

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

  const closeViewer = useCallback(() => {
    resetView()
    setActiveIndex(null)
  }, [resetView])

  const closeViewerRef = useRef(closeViewer)

  useEffect(() => {
    zoomRef.current = zoom
    panRef.current = pan
    activeIndexRef.current = activeIndex
    fotosLengthRef.current = fotos.length
    resetViewRef.current = resetView
    zoomByRef.current = zoomBy
    closeViewerRef.current = closeViewer
  }, [activeIndex, closeViewer, fotos.length, pan, resetView, zoom, zoomBy])

  const goTo = (index: number) => {
    if (fotos.length <= 1) return
    setActiveIndex(wrapIndex(index, fotos.length))
  }

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (activeIndex === null) return
    const frame = window.requestAnimationFrame(resetView)
    return () => window.cancelAnimationFrame(frame)
  }, [activeIndex, resetView])

  useEffect(() => {
    if (activeIndex === null) return
    let nextIndex: number | null | undefined
    if (fotos.length === 0) {
      nextIndex = null
    } else if (activeIndex >= fotos.length) {
      nextIndex = fotos.length - 1
    }
    if (nextIndex === undefined) return
    const frame = window.requestAnimationFrame(() => setActiveIndex(nextIndex))
    return () => window.cancelAnimationFrame(frame)
  }, [activeIndex, fotos.length])

  useEffect(() => {
    if (activeIndex === null) return

    const node = mediaRef.current
    if (!node) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      event.stopPropagation()
      zoomByRef.current(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)
    }
    node.addEventListener('wheel', onWheel, { passive: false })
    return () => node.removeEventListener('wheel', onWheel)
  }, [activeIndex])

  useEffect(() => {
    if (activeIndex === null) return

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
      const length = fotosLengthRef.current
      if (index === null) return

      if (event.key === 'Escape') {
        if (zoomRef.current > ZOOM_MIN + 0.01) {
          event.preventDefault()
          resetViewRef.current()
          return
        }
        closeViewerRef.current()
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
        if (event.key === 'ArrowLeft') {
          setActiveIndex(wrapIndex(index - 1, length))
        }
        if (event.key === 'ArrowRight') {
          setActiveIndex(wrapIndex(index + 1, length))
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('wheel', blockBackgroundScroll, {
      passive: false,
      capture: true,
    })
    window.addEventListener('touchmove', blockBackgroundScroll, {
      passive: false,
      capture: true,
    })

    return () => {
      html.style.overflow = previous.htmlOverflow
      body.style.overflow = previous.bodyOverflow
      body.style.paddingRight = previous.bodyPaddingRight
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('wheel', blockBackgroundScroll, true)
      window.removeEventListener('touchmove', blockBackgroundScroll, true)
    }
  }, [activeIndex])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isZoomed || event.button !== 0) return
    if (
      (event.target as HTMLElement | null)?.closest(
        '.announcement-lightbox__zoom, .evidencia-foto-visor__delete',
      )
    ) {
      return
    }
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

  if (!documentos.length) {
    return (
      <p
        className="m-0 rounded-[13px] border border-dashed border-sigasj-border bg-sigasj-surface-soft px-4 py-3.5 text-sm font-semibold text-sigasj-muted"
        role="status"
      >
        {emptyLabel}
      </p>
    )
  }

  return (
    <>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(148px,100%),1fr))] gap-3 p-0 sm:gap-3.5">
        {documentos.map((documento) => {
          const href = evidenciaActividadPublicUrl(
            documento.rutaReferenciaArchivo,
            actividadId || documento.actividadId,
          )

          if (!esEvidenciaImagen(documento)) {
            return (
              <li
                key={documento.id}
                className="col-span-full flex items-center justify-between gap-3 rounded-[13px] border border-sigasj-border bg-sigasj-surface-soft px-4 py-3"
              >
                <div className="min-w-0">
                  <strong className="block truncate text-sm font-extrabold text-sigasj-ink">
                    {documento.nombreOriginal}
                  </strong>
                  <small className="text-xs font-semibold text-sigasj-muted">
                    {Math.max(1, Math.ceil(documento.tamanio / 1024))} KB
                  </small>
                </div>
              </li>
            )
          }

          const photoIndex = fotos.findIndex((foto) => foto.id === documento.id)

          return (
            <li key={documento.id} className="min-w-0">
              <FotoMiniatura
                src={href}
                disabled={disabled}
                onOpen={() => setActiveIndex(photoIndex >= 0 ? photoIndex : 0)}
              />
            </li>
          )
        })}
      </ul>

      {selected && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="announcement-lightbox announcement-lightbox--media-only !z-[10050]"
              role="presentation"
              onClick={closeViewer}
            >
              <div
                className="announcement-lightbox__dialog"
                role="dialog"
                aria-modal="true"
                aria-label={
                  selected.nombreOriginal?.trim()
                    ? `Fotografía: ${selected.nombreOriginal.trim()}`
                    : 'Vista ampliada de la evidencia'
                }
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  ref={closeRef}
                  type="button"
                  className="announcement-lightbox__close"
                  onClick={closeViewer}
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
                      key={selected.id}
                      className={`announcement-lightbox__stage${reducedMotion ? '' : ' announcement-lightbox__stage--enter'}`}
                    >
                      <img
                        src={selectedUrl}
                        alt={selected.nombreOriginal || 'Evidencia fotográfica'}
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
                          zoomBy(-ZOOM_STEP)
                        }}
                        disabled={zoom <= ZOOM_MIN}
                        aria-label="Alejar imagen"
                      >
                        <IconZoomOut size={18} aria-hidden="true" />
                      </button>
                      <span
                        className="announcement-lightbox__zoom-label"
                        aria-live="polite"
                      >
                        {zoomPercent}%
                      </span>
                      <button
                        type="button"
                        className="announcement-lightbox__zoom-btn"
                        onClick={(event) => {
                          event.stopPropagation()
                          zoomBy(ZOOM_STEP)
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
                        onClick={() => goTo((activeIndex ?? 0) - 1)}
                        aria-label="Fotografía anterior"
                      >
                        <IconChevronLeft size={22} aria-hidden="true" />
                      </button>
                    ) : null}

                    {!isZoomed && hasMany ? (
                      <button
                        type="button"
                        className="announcement-lightbox__nav announcement-lightbox__nav--next"
                        onClick={() => goTo((activeIndex ?? 0) + 1)}
                        aria-label="Fotografía siguiente"
                      >
                        <IconChevronRight size={22} aria-hidden="true" />
                      </button>
                    ) : null}

                    {hasMany && !isZoomed && activeIndex !== null ? (
                      <p className="announcement-lightbox__counter" aria-live="polite">
                        {activeIndex + 1} / {fotos.length}
                      </p>
                    ) : null}

                    {canDelete && onDelete && selected ? (
                      <button
                        type="button"
                        className="evidencia-foto-visor__delete"
                        disabled={disabled}
                        onClick={(event) => {
                          event.stopPropagation()
                          onDelete(selected)
                          if (fotos.length <= 1) {
                            closeViewer()
                            return
                          }
                          setActiveIndex((current) => {
                            if (current === null) return null
                            return Math.min(current, fotos.length - 2)
                          })
                        }}
                      >
                        <IconTrash size={18} aria-hidden="true" />
                        Borrar imagen
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

export default EvidenciaFotoGaleria
