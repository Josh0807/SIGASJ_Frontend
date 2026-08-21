import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import GalleryAdminForm from './GalleryAdminForm'
import { adminGalleryMocks } from './adminGalleryMocks'
import {
  emptyGalleryFormValues,
  type AdminGalleryPhoto,
  type GalleryFormValues,
} from './types'

const GalleryAdminPage = () => {
  const nextIdRef = useRef(
    Math.max(0, ...adminGalleryMocks.map((photo) => photo.id)) + 1,
  )

  const [photos, setPhotos] = useState<AdminGalleryPhoto[]>(adminGalleryMocks)
  const [searchTitle, setSearchTitle] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  )
  const [formMode, setFormMode] = useState<'hidden' | 'create' | 'edit'>('hidden')
  const [editingPhoto, setEditingPhoto] = useState<AdminGalleryPhoto | null>(null)
  const [submitting, setSubmitting] = useState(false)

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

        const nextPhoto: AdminGalleryPhoto = {
          id: nextIdRef.current,
          titulo: values.titulo || null,
          descripcion: values.descripcion || null,
          imagenUrl: URL.createObjectURL(file),
          textoAlternativo: values.textoAlternativo,
          ordenVisualizacion: values.ordenVisualizacion,
          activo: values.activo,
        }
        nextIdRef.current += 1
        setPhotos((current) => [...current, nextPhoto])
      } else if (editingPhoto) {
        setPhotos((current) =>
          current.map((photo) =>
            photo.id === editingPhoto.id
              ? {
                  ...photo,
                  titulo: values.titulo || null,
                  descripcion: values.descripcion || null,
                  textoAlternativo: values.textoAlternativo,
                  ordenVisualizacion: values.ordenVisualizacion,
                  activo: values.activo,
                  imagenUrl: file ? URL.createObjectURL(file) : photo.imagenUrl,
                }
              : photo,
          ),
        )
      }

      closeForm()
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEstado = (photo: AdminGalleryPhoto) => {
    setPhotos((current) =>
      current.map((item) =>
        item.id === photo.id ? { ...item, activo: !item.activo } : item,
      ),
    )
  }

  const handleDelete = (photo: AdminGalleryPhoto) => {
    const confirmed = window.confirm(
      `¿Eliminar la fotografía${photo.titulo ? ` «${photo.titulo}»` : ''}? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) {
      return
    }

    setPhotos((current) => current.filter((item) => item.id !== photo.id))
  }

  const movePhoto = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= visiblePhotos.length) {
      return
    }

    const reordered = [...visiblePhotos]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)
    const orderById = new Map(
      reordered.map((photo, orderIndex) => [photo.id, orderIndex]),
    )

    setPhotos((current) =>
      current
        .map((photo) =>
          orderById.has(photo.id)
            ? { ...photo, ordenVisualizacion: orderById.get(photo.id)! }
            : photo,
        )
        .sort((left, right) => left.ordenVisualizacion - right.ordenVisualizacion),
    )
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
            mode={formMode}
            initialValues={formInitialValues}
            currentImageUrl={editingPhoto?.imagenUrl}
            submitting={submitting}
            onSubmit={handleSave}
            onCancel={closeForm}
          />
        ) : null}

        {visiblePhotos.length === 0 ? (
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
                  <button type="button" onClick={() => handleToggleEstado(photo)}>
                    {photo.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => movePhoto(index, -1)}
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    disabled={index === visiblePhotos.length - 1}
                    onClick={() => movePhoto(index, 1)}
                  >
                    Bajar
                  </button>
                  <button
                    type="button"
                    className="gallery-admin__danger"
                    onClick={() => handleDelete(photo)}
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
