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
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import {
  Alert,
  AdminFilterField,
  AdminFilters,
  AdminListItem,
  AdminShell,
  Badge,
  Button,
  EmptyState,
  PageHeader,
  adminFilterControlClassName,
} from '../../../shared/ui'
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

const galleryMediaClassName =
  'h-20 w-20 rounded-[var(--radius-sigasj-card)] object-cover'

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
      setError(ADMIN_COPY.loadError('la galería'))
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
    setActionError(null)
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
      setActionError(ADMIN_COPY.actionError('guardar', 'la fotografía'))
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
      setActionError(ADMIN_COPY.actionError('actualizar', 'la fotografía'))
    }
  }

  const handleDelete = async (photo: AdminGalleryPhoto) => {
    const label = displayTitle(photo.titulo)
    const confirmed = window.confirm(ADMIN_COPY.deleteConfirm(label))
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
      setActionError(ADMIN_COPY.actionError('eliminar', 'la fotografía'))
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
    : 'Curaduría de fotografías de la comunidad y de la ASADA en el sitio público.'

  return (
    <AdminShell aria-labelledby="gallery-admin-title">
      <PageHeader
        id="gallery-admin-title"
        eyebrow={headerEyebrow}
        title={
          <span className="inline-flex items-center gap-2">
            {formMode === 'edit' ? (
              <IconPencil size={22} aria-hidden="true" />
            ) : formMode === 'create' ? (
              <IconPhotoPlus size={22} aria-hidden="true" />
            ) : (
              <IconPhoto size={22} aria-hidden="true" />
            )}
            {headerTitle}
          </span>
        }
        description={headerLead}
        actions={
          formOpen ? (
            <Button
              type="button"
              variant="secondary"
              leftIcon={<IconArrowLeft size={17} aria-hidden="true" />}
              onClick={closeForm}
            >
              {ADMIN_COPY.backToList}
            </Button>
          ) : (
            <>
              <Button to="/admin/dashboard" variant="ghost">
                {ADMIN_COPY.backHome}
              </Button>
              <Button
                type="button"
                variant="primary"
                leftIcon={<IconPhotoPlus size={18} aria-hidden="true" />}
                onClick={openCreateForm}
              >
                Nueva fotografía
              </Button>
            </>
          )
        }
      />

      {actionError ? (
        <Alert tone="danger">{actionError}</Alert>
      ) : null}

      {formOpen ? (
        <section
          ref={formSectionRef}
          className="min-w-0"
          aria-labelledby="gallery-editor-title"
        >
          <h2 id="gallery-editor-title" className="sr-only">
            {headerTitle}
          </h2>
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
          <AdminFilters
            aria-label="Filtros"
            summary={
              <>
                <strong className="text-sigasj-ink">
                  {loading ? '…' : visiblePhotos.length}
                </strong>
                <span>
                  {visiblePhotos.length === 1 ? 'fotografía' : 'fotografías'}
                </span>
              </>
            }
          >
            <AdminFilterField label="Buscar por título">
              <span className="relative block">
                <IconSearch
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sigasj-muted"
                  size={17}
                  aria-hidden="true"
                />
                <input
                  className={`${adminFilterControlClassName} pl-9`}
                  type="search"
                  value={searchTitle}
                  onChange={(event) => setSearchTitle(event.target.value)}
                  placeholder="Ej. asamblea, obra…"
                />
              </span>
            </AdminFilterField>
            <AdminFilterField label="Estado">
              <select
                className={adminFilterControlClassName}
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')
                }
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </AdminFilterField>
          </AdminFilters>

          {loading ? (
            <Alert tone="info">{ADMIN_COPY.loading('fotografías')}</Alert>
          ) : error ? (
            <EmptyState
              title={error}
              actions={
                <Button type="button" variant="secondary" onClick={() => void loadPhotos()}>
                  {ADMIN_COPY.retry}
                </Button>
              }
            />
          ) : visiblePhotos.length === 0 ? (
            <EmptyState
              icon={<IconPhoto size={32} aria-hidden="true" />}
              title={ADMIN_COPY.emptyFiltered('fotografías')}
              actions={
                <Button
                  type="button"
                  variant="primary"
                  leftIcon={<IconPhotoPlus size={18} aria-hidden="true" />}
                  onClick={openCreateForm}
                >
                  Nueva fotografía
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3">
              {visiblePhotos.map((photo) => (
                <AdminListItem
                  key={photo.id}
                  title={displayTitle(photo.titulo)}
                  description={photo.descripcion?.trim() || 'Sin descripción'}
                  media={
                    <img
                      src={photo.imagenUrl}
                      alt={photo.textoAlternativo}
                      className={galleryMediaClassName}
                    />
                  }
                  badges={
                    <>
                      <Badge tone={photo.activo ? 'success' : 'neutral'}>
                        {photo.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                      <Badge tone="info">Orden {photo.ordenVisualizacion + 1}</Badge>
                    </>
                  }
                  actions={
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={<IconPencil size={16} aria-hidden="true" />}
                        onClick={() => openEditForm(photo)}
                      >
                        {ADMIN_COPY.edit}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={
                          photo.activo ? (
                            <IconPlayerPause size={16} aria-hidden="true" />
                          ) : (
                            <IconPlayerPlay size={16} aria-hidden="true" />
                          )
                        }
                        onClick={() => void handleToggleEstado(photo)}
                      >
                        {photo.activo ? ADMIN_COPY.deactivate : ADMIN_COPY.activate}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        leftIcon={<IconTrash size={16} aria-hidden="true" />}
                        onClick={() => void handleDelete(photo)}
                      >
                        {ADMIN_COPY.delete}
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </AdminShell>
  )
}

export default GalleryAdminPage