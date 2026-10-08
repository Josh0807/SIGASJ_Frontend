import { type ChangeEvent, useRef, useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import {
  deleteProyectoImagen,
  removeProyectoImagenPrincipal,
  uploadProyectoImagenPrincipal,
  uploadProyectoImagenes,
} from '../services/proyectosApi'
import { type AdminProyectoDetalle, type AdminProyectoImagen } from './types'
import { validateProyectoImagenFile } from './validateProyectoForm'

type ProyectoImagenesGaleriaProps = {
  proyecto: AdminProyectoDetalle
  onProyectoUpdated: (updatedProyecto: AdminProyectoDetalle) => void
}

type ConfirmState =
  | { type: 'cover' }
  | { type: 'gallery'; image: AdminProyectoImagen }
  | null

const ProyectoImagenesGaleria = ({
  proyecto,
  onProyectoUpdated,
}: ProyectoImagenesGaleriaProps) => {
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmState, setConfirmState] = useState<ConfirmState>(null)
  const [viewerImage, setViewerImage] = useState<AdminProyectoImagen | null>(null)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const imagenesSorted = [...(proyecto.imagenes || [])].sort(
    (a, b) => a.orden - b.orden,
  )

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

      {/* --- SECCIÓN 1: IMAGEN PRINCIPAL (PORTADA) --- */}
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
                src={proyecto.imagenPrincipal}
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
            <button
              type="button"
              className="gallery-admin__button gallery-admin__button--primary"
              disabled={loading}
              onClick={() => coverInputRef.current?.click()}
            >
              {proyecto.imagenPrincipal ? 'Cambiar imagen' : 'Asignar imagen'}
            </button>

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

      {/* --- SECCIÓN 2: GALERÍA DE FOTOS --- */}
      <section className="proyecto-imagenes-galeria__section">
        <header className="proyecto-imagenes-galeria__section-header">
          <div>
            <h3>GALERÍA</h3>
            <p className="proyecto-imagenes-galeria__hint">
              Fotografías secundarias e imágenes del avance de la obra
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
            <button
              type="button"
              className="gallery-admin__button gallery-admin__button--primary"
              disabled={loading}
              onClick={() => galleryInputRef.current?.click()}
            >
              + Agregar fotografías
            </button>
          </div>
        </header>

        {imagenesSorted.length === 0 ? (
          <div className="proyecto-imagenes-galeria__empty-gallery">
            <p>No se han agregado fotografías a la galería de este proyecto.</p>
          </div>
        ) : (
          <div className="proyecto-imagenes-galeria__grid">
            {imagenesSorted.map((img, index) => (
              <article
                key={img.id}
                className="proyecto-imagenes-galeria__item-card"
              >
                <button
                  type="button"
                  className="proyecto-imagenes-galeria__item-thumb !block !w-full !cursor-zoom-in !border-0 !p-0"
                  onClick={() => setViewerImage(img)}
                  aria-label={`Ver fotografía ${index + 1} en tamaño completo`}
                >
                  <img
                    src={img.url}
                    alt={img.descripcion || `Fotografía ${index + 1} de la galería`}
                  />
                  <span className="proyecto-imagenes-galeria__badge">
                    Orden #{index + 1}
                  </span>
                </button>

                <div className="proyecto-imagenes-galeria__item-controls">
                  <button
                    type="button"
                    className="gallery-admin__button gallery-admin__button--danger !w-full"
                    disabled={loading}
                    onClick={() =>
                      setConfirmState({ type: 'gallery', image: img })
                    }
                  >
                    Retirar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {viewerImage ? (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada de la fotografía"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setViewerImage(null)
          }}
        >
          <div className="relative max-h-[92vh] max-w-6xl overflow-hidden rounded-3xl bg-white p-2 shadow-2xl">
            <button
              type="button"
              className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-slate-950/80 text-2xl font-bold text-white shadow-lg transition hover:bg-slate-950"
              onClick={() => setViewerImage(null)}
              aria-label="Cerrar fotografía"
            >
              ×
            </button>
            <img
              src={viewerImage.url}
              alt={viewerImage.descripcion || 'Fotografía ampliada del proyecto'}
              className="max-h-[88vh] w-auto max-w-full rounded-[1.25rem] object-contain"
            />
          </div>
        </div>
      ) : null}

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
