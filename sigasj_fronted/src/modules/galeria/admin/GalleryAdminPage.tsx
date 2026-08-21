import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import GalleryAdminForm from './GalleryAdminForm'
import {
  emptyGalleryFormValues,
  type AdminGalleryPhoto,
  type GalleryFormValues,
} from './types'
import {
  createGalleryPhoto,
  deleteGalleryPhoto,
  fetchAdminGallery,
  setGalleryPhotoActivo,
  updateGalleryPhoto,
  updateGalleryPhotoOrder,
} from '../services/galleryService'

const GalleryAdminPage = () => {
  const [photos, setPhotos] = useState<AdminGalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTitle, setSearchTitle] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  )
  const [formMode, setFormMode] = useState<'hidden' | 'create' | 'edit'>('hidden')
  const [editingPhoto, setEditingPhoto] = useState<AdminGalleryPhoto | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const formAnchorRef = useRef<HTMLDivElement>(null)

  const loadPhotos = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    try {
      const filters =
        statusFilter === 'all'
          ? { titulo: searchTitle.trim() || undefined }
          : {
              titulo: searchTitle.trim() || undefined,
              activo: statusFilter === 'active',
            }

      const items = await fetchAdminGallery(filters)
      setPhotos(items)
    } catch {
      setLoadError('No fue posible cargar la galería. Intenta de nuevo.')
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }, [searchTitle, statusFilter])

  useEffect(() => {
    void loadPhotos()
  }, [loadPhotos])

  const visiblePhotos = useMemo(
    () =>
      [...photos].sort(
        (left, right) =>
          left.ordenVisualizacion - right.ordenVisualizacion ||
          left.id - right.id,
      ),
    [photos],
  )

  const activeCount = useMemo(
    () => visiblePhotos.filter((photo) => photo.activo).length,
    [visiblePhotos],
  )

  const scrollToForm = () => {
    formAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const openCreateForm = () => {
    setActionError(null)
    setEditingPhoto(null)
    setFormMode('create')
    requestAnimationFrame(scrollToForm)
  }

  const openEditForm = (photo: AdminGalleryPhoto) => {
    setActionError(null)
    setEditingPhoto(photo)
    setFormMode('edit')
    requestAnimationFrame(scrollToForm)
  }

  const closeForm = () => {
    setFormMode('hidden')
    setEditingPhoto(null)
  }

  const handleSave = async (values: GalleryFormValues, file: File | null) => {
    setSubmitting(true)
    setActionError(null)

    try {
      if (formMode === 'create') {
        if (!file) {
          setActionError('Debes seleccionar una imagen.')
          return
        }

        await createGalleryPhoto(values, file)
      } else if (editingPhoto) {
        await updateGalleryPhoto(editingPhoto.id, values, file)
      }

      closeForm()
      await loadPhotos()
    } catch {
      setActionError('No fue posible guardar la fotografía.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEstado = async (photo: AdminGalleryPhoto) => {
    setActionError(null)

    try {
      await setGalleryPhotoActivo(photo.id, !photo.activo)
      await loadPhotos()
    } catch {
      setActionError('No fue posible cambiar el estado de la fotografía.')
    }
  }

  const handleDelete = async (photo: AdminGalleryPhoto) => {
    const confirmed = window.confirm(
      `¿Eliminar la fotografía${photo.titulo ? ` «${photo.titulo}»` : ''}? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) {
      return
    }

    setActionError(null)

    try {
      await deleteGalleryPhoto(photo.id)
      await loadPhotos()
    } catch {
      setActionError('No fue posible eliminar la fotografía.')
    }
  }

  const movePhoto = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= visiblePhotos.length) {
      return
    }

    const reordered = [...visiblePhotos]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    setActionError(null)

    try {
      await Promise.all(
        reordered.map((photo, orderIndex) =>
          updateGalleryPhotoOrder(photo.id, orderIndex, photo),
        ),
      )
      await loadPhotos()
    } catch {
      setActionError('No fue posible reordenar la galería.')
    }
  }

  const formInitialValues =
    formMode === 'edit' && editingPhoto
      ? {
          titulo: editingPhoto.titulo ?? '',
          descripcion: editingPhoto.descripcion ?? '',
          textoAlternativo: editingPhoto.textoAlternativo,
          ordenVisualizacion: editingPhoto.ordenVisualizacion,
          activo: editingPhoto.activo,
        }
      : emptyGalleryFormValues()

  return (
    <main className="gallery-admin">
      <div className="gallery-admin__shell">
        <header className="gallery-admin__header">
          <div>
            <p className="gallery-admin__eyebrow">Panel administrativo</p>
            <h1>Galería de fotografías</h1>
            <p>Administra las imágenes visibles en la landing pública.</p>
          </div>
          <div className="gallery-admin__header-actions">
            <Link className="gallery-admin__link" to="/#galeria">
              Ver sitio público
            </Link>
            <Link className="gallery-admin__link" to="/admin/transparencia">
              Ir a transparencia
            </Link>
            <button
              type="button"
              className="gallery-admin__button gallery-admin__button--primary"
              onClick={openCreateForm}
            >
              + Nueva fotografía
            </button>
          </div>
        </header>

        {!loading && !loadError ? (
          <div className="gallery-admin__stats" aria-label="Resumen de la galería">
            <div className="gallery-admin__stat">
              <span className="gallery-admin__stat-value">{visiblePhotos.length}</span>
              <span className="gallery-admin__stat-label">
                {visiblePhotos.length === 1 ? 'fotografía' : 'fotografías'}
              </span>
            </div>
            <div className="gallery-admin__stat">
              <span className="gallery-admin__stat-value">{activeCount}</span>
              <span className="gallery-admin__stat-label">activas en la web</span>
            </div>
            <div className="gallery-admin__stat">
              <span className="gallery-admin__stat-value">
                {visiblePhotos.length - activeCount}
              </span>
              <span className="gallery-admin__stat-label">ocultas</span>
            </div>
          </div>
        ) : null}

        <section
          className="gallery-admin__filters gallery-admin__filters--card"
          aria-label="Filtros"
        >
          <label className="gallery-admin__field">
            <span>Buscar por título</span>
            <input
              type="search"
              value={searchTitle}
              onChange={(event) => setSearchTitle(event.target.value)}
              placeholder="Ej. asamblea, obra, tanque…"
            />
          </label>

          <label className="gallery-admin__field">
            <span>Estado</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')
              }
            >
              <option value="all">Todas</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
            </select>
          </label>
        </section>

        {actionError ? (
          <p className="gallery-admin__banner gallery-admin__banner--error" role="alert">
            {actionError}
          </p>
        ) : null}

        <div ref={formAnchorRef}>
          {formMode !== 'hidden' ? (
            <GalleryAdminForm
              mode={formMode}
              initialValues={formInitialValues}
              currentImageUrl={editingPhoto?.imagenUrl}
              submitting={submitting}
              onSubmit={handleSave}
              onCancel={closeForm}
            />
          ) : null}
        </div>

        {loading ? (
          <div className="gallery-admin__empty gallery-admin__empty--loading" role="status">
            <span className="gallery-admin__empty-icon" aria-hidden="true">
              ◌
            </span>
            <p>Cargando galería…</p>
          </div>
        ) : loadError ? (
          <div className="gallery-admin__empty gallery-admin__empty--error" role="alert">
            <span className="gallery-admin__empty-icon" aria-hidden="true">
              !
            </span>
            <p>{loadError}</p>
            <button type="button" onClick={() => void loadPhotos()}>
              Reintentar
            </button>
          </div>
        ) : visiblePhotos.length === 0 ? (
          <div className="gallery-admin__empty" role="status">
            <span className="gallery-admin__empty-icon" aria-hidden="true">
              🖼
            </span>
            <p>No hay fotografías con los filtros actuales.</p>
            <p className="gallery-admin__empty-sub">
              Sube la primera imagen para mostrarla en la sección pública de la
              ASADA.
            </p>
            <button
              type="button"
              className="gallery-admin__button gallery-admin__button--primary"
              onClick={openCreateForm}
            >
              Subir fotografía
            </button>
          </div>
        ) : (
          <div className="gallery-admin__list">
            {visiblePhotos.map((photo, index) => (
              <article className="gallery-admin__item" key={photo.id}>
                <div className="gallery-admin__thumb">
                  <img src={photo.imagenUrl} alt={photo.textoAlternativo} />
                  <span
                    className={[
                      'gallery-admin__status-pill',
                      photo.activo
                        ? 'gallery-admin__status-pill--active'
                        : 'gallery-admin__status-pill--inactive',
                    ].join(' ')}
                  >
                    {photo.activo ? 'Activa' : 'Oculta'}
                  </span>
                </div>

                <div className="gallery-admin__meta">
                  <h2>{photo.titulo?.trim() || 'Sin título'}</h2>
                  <p>{photo.descripcion?.trim() || 'Sin descripción'}</p>
                  <ul className="gallery-admin__badges">
                    <li>Orden {photo.ordenVisualizacion}</li>
                    <li>ID {photo.id}</li>
                  </ul>
                </div>

                <div className="gallery-admin__actions">
                  <div className="gallery-admin__actions-group">
                    <span className="gallery-admin__actions-label">Gestionar</span>
                    <button type="button" onClick={() => openEditForm(photo)}>
                      Editar
                    </button>
                    <button type="button" onClick={() => void handleToggleEstado(photo)}>
                      {photo.activo ? 'Ocultar' : 'Publicar'}
                    </button>
                  </div>
                  <div className="gallery-admin__actions-group">
                    <span className="gallery-admin__actions-label">Orden</span>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => void movePhoto(index, -1)}
                      aria-label="Subir en el orden"
                    >
                      ↑ Subir
                    </button>
                    <button
                      type="button"
                      disabled={index === visiblePhotos.length - 1}
                      onClick={() => void movePhoto(index, 1)}
                      aria-label="Bajar en el orden"
                    >
                      ↓ Bajar
                    </button>
                  </div>
                  <button
                    type="button"
                    className="gallery-admin__danger gallery-admin__danger--standalone"
                    onClick={() => void handleDelete(photo)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default GalleryAdminPage
