import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import {
  IconChevronLeft,
  IconChevronRight,
  IconGripVertical,
  IconX,
} from '@tabler/icons-react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import { Button } from '../../../shared/ui'
import {
  deleteProyectoImagen,
  removeProyectoImagenPrincipal,
  reorderProyectoImagenes,
  uploadProyectoImagenPrincipal,
  uploadProyectoImagenes,
} from '../services/proyectosApi'
import { resolveBackendAssetUrl } from '../../../services/http/assetUrl'
import { type AdminProyectoDetalle, type AdminProyectoImagen } from './types'
import { validateProyectoImagenFile } from './validateProyectoForm'

const sortImagenes = (imagenes: AdminProyectoImagen[]) =>
  [...imagenes].sort((a, b) => a.orden - b.orden || a.id - b.id)

const buildOrdenPayload = (imagenes: AdminProyectoImagen[]) =>
  imagenes.map((img, index) => ({ id: img.id, orden: index + 1 }))

type ProyectoImagenesGaleriaProps = {
  proyecto: AdminProyectoDetalle
  onProyectoUpdated: (updatedProyecto: AdminProyectoDetalle) => void
  /** Cuando false, oculta la sección de portada (el formulario ya la gestiona). */
  showCoverSection?: boolean
}

type ConfirmState =
  | { type: 'cover' }
  | { type: 'gallery'; image: AdminProyectoImagen }
  | null

const ProyectoImagenesGaleria = ({
  proyecto,
  onProyectoUpdated,
  showCoverSection = true,
}: ProyectoImagenesGaleriaProps) => {
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmState, setConfirmState] = useState<ConfirmState>(null)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [imagenesOrdenadas, setImagenesOrdenadas] = useState(() =>
    sortImagenes(proyecto.imagenes || []),
  )
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dropTargetId, setDropTargetId] = useState<number | null>(null)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const dragImageIdRef = useRef<number | null>(null)

  const imagenesFirma = useMemo(
    () =>
      (proyecto.imagenes || [])
        .map((img) => `${img.id}:${img.orden}`)
        .sort()
        .join('|'),
    [proyecto.imagenes],
  )

  useEffect(() => {
    setImagenesOrdenadas(sortImagenes(proyecto.imagenes || []))
  }, [proyecto.id, imagenesFirma, proyecto.imagenes])

  useEffect(() => {
    if (viewerIndex === null) return
    if (imagenesOrdenadas.length === 0) {
      setViewerIndex(null)
      return
    }
    if (viewerIndex >= imagenesOrdenadas.length) {
      setViewerIndex(imagenesOrdenadas.length - 1)
    }
  }, [viewerIndex, imagenesOrdenadas.length])

  const viewerImage =
    viewerIndex !== null ? imagenesOrdenadas[viewerIndex] ?? null : null
  const hasPrevViewer = viewerIndex !== null && viewerIndex > 0
  const hasNextViewer =
    viewerIndex !== null && viewerIndex < imagenesOrdenadas.length - 1

  useEffect(() => {
    if (viewerIndex === null) return undefined
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setViewerIndex(null)
      if (event.key === 'ArrowLeft' && viewerIndex > 0) {
        setViewerIndex((value) => (value === null ? value : value - 1))
      }
      if (
        event.key === 'ArrowRight' &&
        viewerIndex < imagenesOrdenadas.length - 1
      ) {
        setViewerIndex((value) => (value === null ? value : value + 1))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [viewerIndex, imagenesOrdenadas.length])

  const persistOrden = async (next: AdminProyectoImagen[]) => {
    const previous = imagenesOrdenadas
    setImagenesOrdenadas(next)
    setError(null)
    setLoading(true)
    setLoadingMessage('Guardando orden…')
    try {
      const updated = await reorderProyectoImagenes(
        proyecto.id,
        buildOrdenPayload(next),
      )
      onProyectoUpdated(updated)
    } catch (err) {
      setImagenesOrdenadas(previous)
      const msg =
        err instanceof Error
          ? err.message
          : 'No fue posible actualizar el orden de las fotografías.'
      setError(msg)
    } finally {
      setLoading(false)
      setLoadingMessage(null)
    }
  }

  const moveImage = (fromId: number, toId: number) => {
    if (fromId === toId || loading) return
    const fromIndex = imagenesOrdenadas.findIndex((img) => img.id === fromId)
    const toIndex = imagenesOrdenadas.findIndex((img) => img.id === toId)
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
    const next = [...imagenesOrdenadas]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    void persistOrden(next)
  }

  const handleDragStart = (
    event: DragEvent<HTMLElement>,
    imageId: number,
  ) => {
    const target = event.target as HTMLElement | null
    if (
      loading ||
      target?.closest('button') ||
      target?.closest('.proyecto-imagenes-galeria__item-controls')
    ) {
      event.preventDefault()
      return
    }
    dragImageIdRef.current = imageId
    setDraggingId(imageId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(imageId))
  }

  const handleDragOver = (
    event: DragEvent<HTMLElement>,
    imageId: number,
  ) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (dropTargetId !== imageId) setDropTargetId(imageId)
  }

  const handleDrop = (event: DragEvent<HTMLElement>, targetId: number) => {
    event.preventDefault()
    const raw =
      event.dataTransfer.getData('text/plain') ||
      String(dragImageIdRef.current ?? '')
    const sourceId = Number(raw)
    setDraggingId(null)
    setDropTargetId(null)
    dragImageIdRef.current = null
    if (!Number.isInteger(sourceId) || sourceId <= 0) return
    moveImage(sourceId, targetId)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
    setDropTargetId(null)
    dragImageIdRef.current = null
  }

  // --- IMAGEN PRINCIPAL (PORTADA) ---
  const handleCoverChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const validationErr = validateProyectoImagenFile(file)
    if (validationErr) {
      setError(validationErr)
      if (coverInputRef.current) coverInputRef.current.value = ''
      return
    }

    setError(null)
    setLoading(true)
    setLoadingMessage('Actualizando portada…')

    try {
      const updated = await uploadProyectoImagenPrincipal(proyecto.id, file)
      onProyectoUpdated(updated)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No fue posible actualizar la imagen principal.'
      setError(msg)
    } finally {
      setLoading(false)
      setLoadingMessage(null)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  const handleConfirmRemoveCover = async () => {
    setConfirmState(null)
    setError(null)
    setLoading(true)
    setLoadingMessage('Quitando portada…')

    try {
      const updated = await removeProyectoImagenPrincipal(proyecto.id)
      onProyectoUpdated(updated)
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No fue posible eliminar la imagen principal.'
      setError(msg)
    } finally {
      setLoading(false)
      setLoadingMessage(null)
    }
  }

  // --- GALERÍA DE FOTOS ---
  const handleAddGalleryPhotos = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const fileList = Array.from(files)
    for (const file of fileList) {
      const validationErr = validateProyectoImagenFile(file)
      if (validationErr) {
        setError(`Archivo «${file.name}»: ${validationErr}`)
        if (galleryInputRef.current) galleryInputRef.current.value = ''
        return
      }
    }

    setError(null)
    setLoading(true)
    setLoadingMessage('Agregando fotografías…')

    try {
      const updated = await uploadProyectoImagenes(proyecto.id, fileList)
      onProyectoUpdated(updated)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'No fue posible agregar las fotografías.'
      setError(msg)
    } finally {
      setLoading(false)
      setLoadingMessage(null)
      if (galleryInputRef.current) galleryInputRef.current.value = ''
    }
  }

  const handleConfirmRemoveGalleryImage = async (image: AdminProyectoImagen) => {
    setConfirmState(null)
    setError(null)
    setLoading(true)
    setLoadingMessage('Retirando fotografía…')

    try {
      const updated = await deleteProyectoImagen(proyecto.id, image.id)
      onProyectoUpdated(updated)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'No fue posible retirar la fotografía.'
      setError(msg)
    } finally {
      setLoading(false)
      setLoadingMessage(null)
    }
  }

  return (
    <div className="proyecto-imagenes-galeria">
      {error ? (
        <div className="proyecto-imagenes-galeria__error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setError(null)}>
            Entendido
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="proyecto-imagenes-galeria__loading" role="status">
          <span className="proyecto-imagenes-galeria__spinner" aria-hidden="true" />
          <p>{loadingMessage || 'Procesando…'}</p>
        </div>
      ) : null}

      {showCoverSection ? (
        <section className="proyecto-imagenes-galeria__section">
          <header className="proyecto-imagenes-galeria__section-header">
            <h3>IMAGEN PRINCIPAL</h3>
            <p className="proyecto-imagenes-galeria__hint">
              Fotografía destacada del proyecto
            </p>
          </header>

          <div className="proyecto-imagenes-galeria__cover-box">
            {proyecto.imagenPrincipal ? (
              <div className="proyecto-imagenes-galeria__cover-preview">
                <img
                  src={
                    resolveBackendAssetUrl(proyecto.imagenPrincipal) ??
                    proyecto.imagenPrincipal
                  }
                  alt={`Portada principal del proyecto ${proyecto.nombre}`}
                />
              </div>
            ) : (
              <div className="proyecto-imagenes-galeria__cover-empty">
                <svg
                  aria-hidden="true"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p>Sin fotografía principal asignada</p>
              </div>
            )}

            <div className="proyecto-imagenes-galeria__actions">
              <input
                ref={coverInputRef}
                id="proyecto-cover-file-input"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleCoverChange}
                style={{ display: 'none' }}
              />
              <Button
                type="button"
                variant="primary"
                disabled={loading}
                onClick={() => coverInputRef.current?.click()}
              >
                {proyecto.imagenPrincipal ? 'Cambiar imagen' : 'Asignar imagen'}
              </Button>

              {proyecto.imagenPrincipal ? (
                <button
                  type="button"
                  className="gallery-admin__button gallery-admin__button--danger"
                  disabled={loading}
                  onClick={() => setConfirmState({ type: 'cover' })}
                >
                  Quitar portada
                </button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="proyecto-imagenes-galeria__section">
        <header className="proyecto-imagenes-galeria__section-header">
          <div>
            <h3>GALERÍA</h3>
            <p className="proyecto-imagenes-galeria__hint">
              Fotografías secundarias e imágenes del avance de la obra.
              Arrastre las tarjetas para cambiar el orden.
            </p>
          </div>
          <div className="proyecto-imagenes-galeria__upload-wrapper">
            <input
              ref={galleryInputRef}
              id="proyecto-gallery-file-input"
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleAddGalleryPhotos}
              style={{ display: 'none' }}
            />
            <Button
              type="button"
              variant="primary"
              disabled={loading}
              onClick={() => galleryInputRef.current?.click()}
            >
              + Agregar fotografías
            </Button>
          </div>
        </header>

        {imagenesOrdenadas.length === 0 ? (
          <div className="proyecto-imagenes-galeria__empty-gallery">
            <p>No se han agregado fotografías a la galería de este proyecto.</p>
          </div>
        ) : (
          <div
            className="proyecto-imagenes-galeria__grid"
            role="list"
            aria-label="Fotografías de la galería. Arrastre para reordenar."
          >
            {imagenesOrdenadas.map((img, index) => {
              const isDragging = draggingId === img.id
              const isDropTarget =
                dropTargetId === img.id && draggingId !== img.id
              return (
                <article
                  key={img.id}
                  role="listitem"
                  className={[
                    'proyecto-imagenes-galeria__item-card',
                    isDragging
                      ? 'proyecto-imagenes-galeria__item-card--dragging'
                      : '',
                    isDropTarget
                      ? 'proyecto-imagenes-galeria__item-card--drop-target'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  draggable={!loading}
                  onDragStart={(event) => handleDragStart(event, img.id)}
                  onDragOver={(event) => handleDragOver(event, img.id)}
                  onDrop={(event) => handleDrop(event, img.id)}
                  onDragEnd={handleDragEnd}
                  aria-grabbed={isDragging}
                >
                  <span
                    className="proyecto-imagenes-galeria__drag-handle"
                    aria-hidden="true"
                  >
                    <IconGripVertical size={18} />
                  </span>

                  <div
                    className="proyecto-imagenes-galeria__item-thumb !cursor-zoom-in"
                    role="button"
                    tabIndex={0}
                    onClick={() => setViewerIndex(index)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setViewerIndex(index)
                      }
                    }}
                    aria-label={`Ver fotografía ${index + 1} en tamaño completo`}
                  >
                    <img
                      src={resolveBackendAssetUrl(img.url) ?? img.url}
                      alt={
                        img.descripcion ||
                        `Fotografía ${index + 1} de la galería`
                      }
                      draggable={false}
                    />
                    <span className="proyecto-imagenes-galeria__badge">
                      Orden #{index + 1}
                    </span>
                  </div>

                  <div className="proyecto-imagenes-galeria__item-controls">
                    <button
                      type="button"
                      className="gallery-admin__button gallery-admin__button--danger !w-full"
                      disabled={loading}
                      draggable={false}
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={() =>
                        setConfirmState({ type: 'gallery', image: img })
                      }
                    >
                      Retirar
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {viewerImage && viewerIndex !== null && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="proyecto-imagenes-galeria__viewer"
              role="dialog"
              aria-modal="true"
              aria-label="Vista ampliada de la fotografía"
              onMouseDown={(event) => {
                if (event.currentTarget === event.target) setViewerIndex(null)
              }}
            >
              <div className="proyecto-imagenes-galeria__viewer-dialog">
                <header className="proyecto-imagenes-galeria__viewer-toolbar">
                  <div className="proyecto-imagenes-galeria__viewer-meta">
                    <p
                      className="proyecto-imagenes-galeria__viewer-counter"
                      aria-live="polite"
                    >
                      {viewerIndex + 1} de {imagenesOrdenadas.length}
                    </p>
                    <p className="proyecto-imagenes-galeria__viewer-title">
                      {proyecto.nombre}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="proyecto-imagenes-galeria__viewer-close"
                    onClick={() => setViewerIndex(null)}
                    aria-label="Cerrar fotografía"
                  >
                    <IconX size={20} aria-hidden="true" />
                  </button>
                </header>

                <div className="proyecto-imagenes-galeria__viewer-stage">
                  <button
                    type="button"
                    className="proyecto-imagenes-galeria__viewer-nav proyecto-imagenes-galeria__viewer-nav--prev"
                    onClick={() => setViewerIndex(viewerIndex - 1)}
                    disabled={!hasPrevViewer}
                    aria-label="Fotografía anterior"
                  >
                    <IconChevronLeft size={28} aria-hidden="true" />
                  </button>

                  <figure className="proyecto-imagenes-galeria__viewer-figure">
                    <div className="proyecto-imagenes-galeria__viewer-frame">
                      <img
                        key={viewerImage.id}
                        src={
                          resolveBackendAssetUrl(viewerImage.url) ??
                          viewerImage.url
                        }
                        alt={
                          viewerImage.descripcion ||
                          `Fotografía ${viewerIndex + 1} del proyecto`
                        }
                        draggable={false}
                      />
                    </div>
                    <figcaption className="proyecto-imagenes-galeria__viewer-caption">
                      <span className="proyecto-imagenes-galeria__viewer-orden">
                        Orden #{viewerIndex + 1}
                      </span>
                      <span className="proyecto-imagenes-galeria__viewer-desc">
                        {viewerImage.descripcion?.trim() ||
                          `Fotografía ${viewerIndex + 1} de la galería`}
                      </span>
                    </figcaption>
                  </figure>

                  <button
                    type="button"
                    className="proyecto-imagenes-galeria__viewer-nav proyecto-imagenes-galeria__viewer-nav--next"
                    onClick={() => setViewerIndex(viewerIndex + 1)}
                    disabled={!hasNextViewer}
                    aria-label="Fotografía siguiente"
                  >
                    <IconChevronRight size={28} aria-hidden="true" />
                  </button>
                </div>

                {imagenesOrdenadas.length > 1 ? (
                  <div
                    className="proyecto-imagenes-galeria__viewer-strip"
                    role="list"
                    aria-label="Miniaturas de la galería"
                  >
                    {imagenesOrdenadas.map((img, index) => {
                      const active = index === viewerIndex
                      return (
                        <button
                          key={img.id}
                          type="button"
                          role="listitem"
                          className={[
                            'proyecto-imagenes-galeria__viewer-thumb',
                            active
                              ? 'proyecto-imagenes-galeria__viewer-thumb--active'
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => setViewerIndex(index)}
                          aria-label={`Ir a fotografía ${index + 1}`}
                          aria-current={active ? 'true' : undefined}
                        >
                          <img
                            src={resolveBackendAssetUrl(img.url) ?? img.url}
                            alt=""
                            draggable={false}
                          />
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}

      {/* --- CONFIRMATION DIALOGS --- */}
      <ConfirmDialog
        isOpen={confirmState !== null}
        title={
          confirmState?.type === 'cover'
            ? 'Quitar imagen principal'
            : 'Retirar fotografía'
        }
        message={
          confirmState?.type === 'cover'
            ? '¿Está seguro de que desea retirar la imagen de portada del proyecto? Podrá asignar otra en cualquier momento.'
            : '¿Está seguro de que desea retirar esta fotografía de la galería del proyecto?'
        }
        confirmLabel="Confirmar retiro"
        cancelLabel="Cancelar"
        confirmDanger
        onCancel={() => setConfirmState(null)}
        onConfirm={() => {
          if (confirmState?.type === 'cover') {
            void handleConfirmRemoveCover()
          } else if (confirmState?.type === 'gallery') {
            void handleConfirmRemoveGalleryImage(confirmState.image)
          }
        }}
      />
    </div>
  )
}

export default ProyectoImagenesGaleria
