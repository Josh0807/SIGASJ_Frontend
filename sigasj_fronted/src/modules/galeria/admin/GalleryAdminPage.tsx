import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  IconArrowLeft,
  IconPhotoPlus,
  IconPlayerPlay,
  IconPlayerPause,
  IconPencil,
  IconPhoto,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
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
  updateGaleriaEstado,
  updateGaleriaPhoto,
} from '../services/galeriaApi'

const displayTitle = (titulo: string | null | undefined) => {
  const raw = titulo?.trim() || 'Sin título'
  return raw.replace(/\s+\d{10,}\s*$/, '').trim() || raw
}

const GalleryAdminPage = () => {
  const [photos, setPhotos] = useState<AdminGalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [searchTitle, setSearchTitle] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  )
  const [formMode, setFormMode] = useState<'hidden' | 'create' | 'edit'>('hidden')
  const [editingPhoto, setEditingPhoto] = useState<AdminGalleryPhoto | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const formSectionRef = useRef<HTMLElement | null>(null)

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

  useEffect(() => runAfterEffect(() => {
    void loadPhotos()
  }), [loadPhotos])

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

  const focusFormSection = () => {
    window.requestAnimationFrame(() => {
      const node = formSectionRef.current
      if (node && typeof node.scrollIntoView === 'function') {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  const openCreateForm = () => {
    setActionError(null)
    setEditingPhoto(null)
    setFormMode('create')
    focusFormSection()
  }

  const openEditForm = (photo: AdminGalleryPhoto) => {
    setActionError(null)
    setEditingPhoto(photo)
    setFormMode('edit')
    focusFormSection()
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
          return
        }
        await createGaleriaPhoto(values, file)
      } else if (editingPhoto) {
        await updateGaleriaPhoto(editingPhoto.id, values, file)
      }

      closeForm()
      await loadPhotos()
    } catch {
      setActionError(
        formMode === 'edit'
          ? 'No fue posible guardar los cambios de la fotografía.'
          : 'No fue posible crear la fotografía.',
      )
      throw new Error('gallery-save-failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEstado = async (photo: AdminGalleryPhoto) => {
    setActionError(null)
    try {
      const updated = await updateGaleriaEstado(photo.id, !photo.activo)
      setPhotos((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
    } catch {
      setActionError('No fue posible actualizar el estado de la fotografía.')
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
      await deleteGaleriaPhoto(photo.id)
      if (editingPhoto?.id === photo.id) {
        closeForm()
      }
      await loadPhotos()
    } catch {
      setActionError('No fue posible eliminar la fotografía. Intente nuevamente.')
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

  const formOpen = formMode !== 'hidden'
  const editingTitle = editingPhoto
    ? displayTitle(editingPhoto.titulo)
    : null
  const headerEyebrow = formOpen
    ? formMode === 'edit'
      ? 'Galería · Edición'
      : 'Galería · Alta'
    : 'Panel administrativo'
  const headerTitle = formOpen
    ? formMode === 'edit'
      ? 'Editar fotografía'
      : 'Nueva fotografía'
    : 'Galería de fotografías'
  const headerLead = formOpen
    ? formMode === 'edit'
      ? editingTitle
        ? `Editando «${editingTitle}». Actualice datos, visibilidad u orden, o reemplace la imagen.`
        : 'Actualice título, descripción, visibilidad u orden. Puede reemplazar la imagen si lo necesita.'
      : 'Complete los datos y suba la imagen para publicarla en la galería.'
    : 'Administra las imágenes visibles en la landing pública.'

  return (
    <main className="gallery-admin admin-content-modern">
      <div className="gallery-admin__shell sigasj-stack">
        <header
          className={`gallery-admin__header${formOpen ? ' gallery-admin__header--editor' : ''}`}
        >
          <div className="gallery-admin__header-copy">
            <span
              className={`gallery-admin__header-icon${
                formMode === 'edit' ? ' gallery-admin__header-icon--edit' : ''
              }${formMode === 'create' ? ' gallery-admin__header-icon--create' : ''}`}
              aria-hidden="true"
            >
              {formMode === 'edit' ? (
                <IconPencil size={22} stroke={2.1} />
              ) : formMode === 'create' ? (
                <IconPhotoPlus size={22} stroke={2.1} />
              ) : (
                <IconPhoto size={22} stroke={2.1} />
              )}
            </span>
            <div>
              <p className="gallery-admin__eyebrow">{headerEyebrow}</p>
              <h1 id={formOpen ? 'gallery-editor-title' : undefined}>{headerTitle}</h1>
              <p>{headerLead}</p>
            </div>
          </div>
          <div className="gallery-admin__header-actions">
            {formOpen ? (
              <button
                type="button"
                className="gallery-admin__link admin-modern-home-link gallery-admin__back-btn"
                onClick={closeForm}
              >
                <IconArrowLeft size={17} aria-hidden="true" />
                Volver al listado
              </button>
            ) : (
              <Link className="gallery-admin__link admin-modern-home-link" to="/admin/dashboard">
                Volver inicio
              </Link>
            )}
            {!formOpen ? (
              <button
                type="button"
                className="gallery-admin__button gallery-admin__button--primary"
                onClick={openCreateForm}
              >
                <IconPhotoPlus size={18} aria-hidden="true" />
                Nueva fotografía
              </button>
            ) : null}
          </div>
        </header>

        {actionError ? (
          <p className="gallery-admin__banner gallery-admin__banner--error" role="alert">
            {actionError}
          </p>
        ) : null}

        {formOpen ? (
          <section
            ref={formSectionRef}
            className="gallery-admin__editor"
            aria-labelledby="gallery-editor-title"
          >
            <GalleryAdminForm
              mode={formMode}
              initialValues={formInitialValues}
              currentImageUrl={editingPhoto?.imagenUrl}
              submitting={submitting}
              onSubmit={handleSave}
              onCancel={closeForm}
            />
          </section>
        ) : (
          <>
            <section className="gallery-admin__filters gallery-admin__filters--gallery" aria-label="Filtros">
              <label className="gallery-admin__field gallery-admin__field--search">
                <span>Buscar por título</span>
                <span className="gallery-admin__search-control">
                  <IconSearch size={17} aria-hidden="true" />
                  <input
                    type="search"
                    value={searchTitle}
                    onChange={(event) => setSearchTitle(event.target.value)}
                    placeholder="Ej. asamblea, obra…"
                  />
                </span>
              </label>

              <label className="gallery-admin__field gallery-admin__field--status">
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

              <div className="gallery-admin__filter-summary" aria-live="polite">
                <strong>{loading ? '…' : visiblePhotos.length}</strong>
                <span>
                  {visiblePhotos.length === 1 ? 'fotografía' : 'fotografías'}
                </span>
              </div>
            </section>

            {loading ? (
              <p className="gallery-admin__empty" role="status">
                Cargando fotografías…
              </p>
            ) : error ? (
              <p className="gallery-admin__empty" role="alert">
                {error}
              </p>
            ) : visiblePhotos.length === 0 ? (
              <p className="gallery-admin__empty" role="status">
                No hay fotografías registradas con los filtros actuales.
              </p>
            ) : (
              <div className="gallery-admin__list">
                {visiblePhotos.map((photo) => (
                  <article
                    className="gallery-admin__item gallery-admin__item--photo"
                    key={photo.id}
                  >
                    <div className="gallery-admin__thumb">
                      <img src={photo.imagenUrl} alt={photo.textoAlternativo} />
                    </div>

                    <div className="gallery-admin__meta">
                      <h2>{displayTitle(photo.titulo)}</h2>
                      <p>{photo.descripcion?.trim() || 'Sin descripción'}</p>
                      <ul className="gallery-admin__badges">
                        <li className={photo.activo ? 'is-active' : 'is-inactive'}>
                          {photo.activo ? 'Activa' : 'Inactiva'}
                        </li>
                        <li>Orden {photo.ordenVisualizacion + 1}</li>
                      </ul>
                    </div>

                    <div className="gallery-admin__side">
                      <div className="gallery-admin__actions">
                        <button type="button" onClick={() => openEditForm(photo)}>
                          <IconPencil size={16} aria-hidden="true" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleToggleEstado(photo)}
                        >
                          {photo.activo ? (
                            <IconPlayerPause size={16} aria-hidden="true" />
                          ) : (
                            <IconPlayerPlay size={16} aria-hidden="true" />
                          )}
                          {photo.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          className="gallery-admin__danger"
                          onClick={() => void handleDelete(photo)}
                        >
                          <IconTrash size={16} aria-hidden="true" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default GalleryAdminPage
