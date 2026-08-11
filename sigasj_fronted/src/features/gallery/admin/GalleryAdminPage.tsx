import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createAdminGalleryPhoto,
  deleteAdminGalleryPhoto,
  listAdminGalleryPhotos,
  reorderAdminGalleryPhotos,
  replaceAdminGalleryImage,
  updateAdminGalleryEstado,
  updateAdminGalleryPhoto,
} from '../api/adminGallery'
import { getAccessToken, clearAccessToken } from '../../auth/authStorage'
import GalleryAdminForm from './GalleryAdminForm'
import {
  emptyGalleryFormValues,
  type AdminGalleryPhoto,
  type GalleryFormValues,
} from './types'

type LoadStatus = 'loading' | 'success' | 'error'

const GalleryAdminPage = () => {
  const navigate = useNavigate()
  const token = getAccessToken()

  const [status, setStatus] = useState<LoadStatus>('loading')
  const [photos, setPhotos] = useState<AdminGalleryPhoto[]>([])
  const [searchTitle, setSearchTitle] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  )
  const [formMode, setFormMode] = useState<'hidden' | 'create' | 'edit'>('hidden')
  const [editingPhoto, setEditingPhoto] = useState<AdminGalleryPhoto | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const filters = useMemo(
    () => ({
      titulo: searchTitle.trim() || undefined,
      activo:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active',
    }),
    [searchTitle, statusFilter],
  )

  const loadPhotos = useCallback(async () => {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    setStatus('loading')
    setActionError(null)

    try {
      const rows = await listAdminGalleryPhotos(token, filters)
      setPhotos(rows)
      setStatus('success')
    } catch {
      setPhotos([])
      setStatus('error')
    }
  }, [filters, navigate, token])

  useEffect(() => {
    void loadPhotos()
  }, [loadPhotos])

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

  const appendFormFields = (formData: FormData, values: GalleryFormValues) => {
    formData.set('textoAlternativo', values.textoAlternativo)
    formData.set('ordenVisualizacion', String(values.ordenVisualizacion))
    formData.set('activo', String(values.activo))

    if (values.titulo) {
      formData.set('titulo', values.titulo)
    }

    if (values.descripcion) {
      formData.set('descripcion', values.descripcion)
    }
  }

  const handleSave = async (values: GalleryFormValues, file: File | null) => {
    if (!token) {
      return
    }

    setSubmitting(true)
    setActionError(null)

    try {
      if (formMode === 'create') {
        const formData = new FormData()
        if (file) {
          formData.set('imagen', file)
        }
        appendFormFields(formData, values)
        await createAdminGalleryPhoto(token, formData)
      } else if (editingPhoto) {
        await updateAdminGalleryPhoto(token, editingPhoto.id, {
          titulo: values.titulo || null,
          descripcion: values.descripcion || null,
          textoAlternativo: values.textoAlternativo,
          ordenVisualizacion: values.ordenVisualizacion,
          activo: values.activo,
        })

        if (file) {
          const formData = new FormData()
          formData.set('imagen', file)
          await replaceAdminGalleryImage(token, editingPhoto.id, formData)
        }
      }

      closeForm()
      await loadPhotos()
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEstado = async (photo: AdminGalleryPhoto) => {
    if (!token) {
      return
    }

    setActionError(null)

    try {
      await updateAdminGalleryEstado(token, photo.id, !photo.activo)
      await loadPhotos()
    } catch {
      setActionError('No fue posible cambiar el estado de la fotografía.')
    }
  }

  const handleDelete = async (photo: AdminGalleryPhoto) => {
    if (!token) {
      return
    }

    const confirmed = window.confirm(
      `¿Eliminar la fotografía${photo.titulo ? ` «${photo.titulo}»` : ''}? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) {
      return
    }

    setActionError(null)

    try {
      await deleteAdminGalleryPhoto(token, photo.id)
      await loadPhotos()
    } catch {
      setActionError('No fue posible eliminar la fotografía.')
    }
  }

  const movePhoto = async (index: number, direction: -1 | 1) => {
    if (!token) {
      return
    }

    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= photos.length) {
      return
    }

    const reordered = [...photos]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    const payload = reordered.map((photo, orderIndex) => ({
      idFotografiaGaleria: photo.id,
      ordenVisualizacion: orderIndex,
    }))

    setActionError(null)

    try {
      await reorderAdminGalleryPhotos(token, payload)
      await loadPhotos()
    } catch {
      setActionError('No fue posible reorganizar la galería.')
    }
  }

  const handleLogout = () => {
    clearAccessToken()
    navigate('/login', { replace: true })
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
              className="gallery-admin__button"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
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

        {actionError ? (
          <p className="gallery-admin__banner gallery-admin__banner--error" role="alert">
            {actionError}
          </p>
        ) : null}

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

        {status === 'loading' ? (
          <p className="gallery-admin__empty" role="status">
            Cargando fotografías…
          </p>
        ) : status === 'error' ? (
          <div className="gallery-admin__empty" role="alert">
            <p>No fue posible cargar la galería administrativa.</p>
            <button type="button" onClick={() => void loadPhotos()}>
              Reintentar
            </button>
          </div>
        ) : photos.length === 0 ? (
          <p className="gallery-admin__empty" role="status">
            No hay fotografías registradas con los filtros actuales.
          </p>
        ) : (
          <div className="gallery-admin__list">
            {photos.map((photo, index) => (
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
                    disabled={index === photos.length - 1}
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
