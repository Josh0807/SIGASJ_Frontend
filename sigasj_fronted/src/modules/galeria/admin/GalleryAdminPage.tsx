import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import GalleryAdminForm from './GalleryAdminForm'
import {
  emptyGalleryFormValues,
  type AdminGalleryPhoto,
  type GalleryFormValues,
} from './types'
import {
  createGaleriaPhoto,
  deleteGaleriaPhoto,
  getAdminGaleria,
  setGaleriaActiva,
  updateGaleriaPhoto,
} from '../services/galeriaApi'

const GalleryAdminPage = () => {
  const [photos, setPhotos] = useState<AdminGalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTitle, setSearchTitle] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  )
  const [formMode, setFormMode] = useState<'hidden' | 'create' | 'edit'>('hidden')
  const [editingPhoto, setEditingPhoto] = useState<AdminGalleryPhoto | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadPhotos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      setPhotos(await getAdminGaleria())
    } catch {
      setError('No fue posible cargar la galería.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPhotos()
  }, [loadPhotos])

  const visiblePhotos = useMemo(() => {
    const query = searchTitle.trim().toLowerCase()

    return photos.filter((photo) => {
      const matchesTitle =
        !query || (photo.titulo ?? '').toLowerCase().includes(query)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? photo.activo : !photo.activo)

      return matchesTitle && matchesStatus
    })
  }, [photos, searchTitle, statusFilter])

  const openCreateForm = () => {
    setEditingPhoto(null)
    setFormMode('create')
  }

  const openEditForm = (photo: AdminGalleryPhoto) => {
    setEditingPhoto(photo)
    setFormMode('edit')
  }

  const closeForm = () => {
    setFormMode('hidden')
    setEditingPhoto(null)
  }

  const handleSave = async (values: GalleryFormValues, file: File | null) => {
    setSubmitting(true)

    try {
      if (formMode === 'create') {
        if (!file) {
          return
        }

        await createGaleriaPhoto(values, file)
      } else if (editingPhoto) {
        await updateGaleriaPhoto(editingPhoto.id, values, file)
        await setGaleriaActiva(editingPhoto.id, values.activo)
      }

      closeForm()
      await loadPhotos()
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEstado = async (photo: AdminGalleryPhoto) => {
    setError(null)

    try {
      const updated = await setGaleriaActiva(photo.id, !photo.activo)
      setPhotos((current) =>
        current.map((row) => (row.id === updated.id ? updated : row)),
      )
    } catch {
      setError('No fue posible cambiar el estado de la fotografía.')
    }
  }

  const handleDelete = async (photo: AdminGalleryPhoto) => {
    const confirmed = window.confirm(
      `¿Eliminar la fotografía${photo.titulo ? ` «${photo.titulo}»` : ''}? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) {
      return
    }

    await deleteGaleriaPhoto(photo.id)
    await loadPhotos()
  }

  const movePhoto = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= visiblePhotos.length) {
      return
    }

    const reordered = [...visiblePhotos]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    await Promise.all(
      reordered.map((photo, orderIndex) =>
        updateGaleriaPhoto(
          photo.id,
          {
            titulo: photo.titulo ?? '',
            descripcion: photo.descripcion ?? '',
            textoAlternativo: photo.textoAlternativo,
            ordenVisualizacion: orderIndex,
            activo: photo.activo,
          },
          null,
        ),
      ),
    )
    await loadPhotos()
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
            <Link className="gallery-admin__link" to="/">
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
              Nueva fotografía
            </button>
          </div>
        </header>

        <section className="gallery-admin__filters" aria-label="Filtros">
          <label className="gallery-admin__field">
            <span>Buscar por título</span>
            <input
              type="search"
              value={searchTitle}
              onChange={(event) => setSearchTitle(event.target.value)}
              placeholder="Ej. asamblea, obra…"
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

        {formMode !== 'hidden' ? (
          <GalleryAdminForm
            key={`${formMode}-${editingPhoto?.id ?? 'nueva'}`}
            mode={formMode}
            initialValues={formInitialValues}
            currentImageUrl={editingPhoto?.imagenUrl}
            submitting={submitting}
            onSubmit={handleSave}
            onCancel={closeForm}
          />
        ) : null}

        {error ? (
          <p className="gallery-admin__empty" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <p className="gallery-admin__empty" role="status">
            Cargando fotografías…
          </p>
        ) : visiblePhotos.length === 0 ? (
          <p className="gallery-admin__empty" role="status">
            No hay fotografías registradas con los filtros actuales.
          </p>
        ) : (
          <div className="gallery-admin__list">
            {visiblePhotos.map((photo, index) => (
              <article className="gallery-admin__item" key={photo.id}>
                <div className="gallery-admin__thumb">
                  <img src={photo.imagenUrl} alt={photo.textoAlternativo} />
                </div>

                <div className="gallery-admin__meta">
                  <h2>{photo.titulo?.trim() || 'Sin título'}</h2>
                  <p>{photo.descripcion?.trim() || 'Sin descripción'}</p>
                  <ul className="gallery-admin__badges">
                    <li>{photo.activo ? 'Activa' : 'Inactiva'}</li>
                    <li>Orden {photo.ordenVisualizacion}</li>
                  </ul>
                </div>

                <div className="gallery-admin__actions">
                  <button type="button" onClick={() => openEditForm(photo)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => void handleToggleEstado(photo)}>
                    {photo.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => void movePhoto(index, -1)}
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    disabled={index === visiblePhotos.length - 1}
                    onClick={() => void movePhoto(index, 1)}
                  >
                    Bajar
                  </button>
                  <button
                    type="button"
                    className="gallery-admin__danger"
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
