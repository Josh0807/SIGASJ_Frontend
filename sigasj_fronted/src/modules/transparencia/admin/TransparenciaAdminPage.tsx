import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  IconArrowLeft,
  IconFilePlus,
  IconFileText,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
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
import TransparenciaAdminForm from './TransparenciaAdminForm'
import {
  emptyTransparenciaFormValues,
  isTransparenciaImageType,
  type AdminTransparenciaPublication,
  type TransparenciaFormValues,
} from './types'
import {
  createTransparenciaPublication,
  deleteTransparenciaPublication,
  getAdminTransparencia,
  updateTransparenciaEstado,
  updateTransparenciaPublication,
} from '../services/transparenciaApi'
import { toTransparenciaSubmitMessage } from './transparenciaSubmitError'

const formatFileTypeLabel = (
  tipoArchivo: AdminTransparenciaPublication['tipoArchivo'],
) => tipoArchivo.toUpperCase()

const transparenciaMediaClassName =
  'h-20 w-20 rounded-[var(--radius-sigasj-card)] object-cover'

const TransparenciaAdminPage = () => {
  const [publications, setPublications] = useState<AdminTransparenciaPublication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchName, setSearchName] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  )
  const [formMode, setFormMode] = useState<'hidden' | 'create' | 'edit'>('hidden')
  const [editingPublication, setEditingPublication] =
    useState<AdminTransparenciaPublication | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const formSectionRef = useRef<HTMLElement | null>(null)

  const loadPublications = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      setPublications(await getAdminTransparencia())
    } catch {
      setError(ADMIN_COPY.loadError('las publicaciones de transparencia'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => runAfterEffect(() => {
    void loadPublications()
  }), [loadPublications])

  const showSuccess = (message: string) => {
    setError(null)
    setActionSuccess(message)
  }

  const visiblePublications = useMemo(() => {
    const query = searchName.trim().toLowerCase()

    return publications.filter((publication) => {
      const matchesName =
        !query || publication.nombre.toLowerCase().includes(query)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? publication.activo : !publication.activo)

      return matchesName && matchesStatus
    })
  }, [publications, searchName, statusFilter])

  const focusFormSection = () => {
    window.requestAnimationFrame(() => {
      const node = formSectionRef.current
      if (node && typeof node.scrollIntoView === 'function') {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  const openCreateForm = () => {
    setEditingPublication(null)
    setFormMode('create')
    setActionSuccess(null)
    setError(null)
    focusFormSection()
  }

  const openEditForm = (publication: AdminTransparenciaPublication) => {
    setEditingPublication(publication)
    setFormMode('edit')
    setActionSuccess(null)
    setError(null)
    focusFormSection()
  }

  const closeForm = () => {
    setFormMode('hidden')
    setEditingPublication(null)
  }

  const handleSave = async (
    values: TransparenciaFormValues,
    file: File | null,
  ) => {
    setSubmitting(true)
    setError(null)

    try {
      if (formMode === 'create') {
        if (!file) {
          return
        }

        await createTransparenciaPublication(values, file)
        showSuccess('Publicación registrada correctamente.')
      } else if (editingPublication) {
        await updateTransparenciaPublication(editingPublication.id, values, file)
        showSuccess('Publicación actualizada correctamente.')
      }

      closeForm()
      await loadPublications()
    } catch (caught) {
      setError(toTransparenciaSubmitMessage(caught))
      throw caught
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEstado = async (publication: AdminTransparenciaPublication) => {
    setError(null)
    try {
      await updateTransparenciaEstado(publication.id, !publication.activo)
      await loadPublications()
      showSuccess('Estado de la publicación actualizado.')
    } catch {
      setError(ADMIN_COPY.actionError('actualizar', 'la publicación'))
    }
  }

  const handleDelete = async (publication: AdminTransparenciaPublication) => {
    const confirmed = window.confirm(ADMIN_COPY.deleteConfirm(publication.nombre))
    if (!confirmed) {
      return
    }

    setError(null)
    try {
      await deleteTransparenciaPublication(publication.id)
      if (editingPublication?.id === publication.id) {
        closeForm()
      }
      await loadPublications()
      showSuccess('Publicación eliminada correctamente.')
    } catch {
      setError(ADMIN_COPY.actionError('eliminar', 'la publicación'))
    }
  }

  const formInitialValues =
    formMode === 'edit' && editingPublication
      ? {
          nombre: editingPublication.nombre,
          descripcionBreve: editingPublication.descripcionBreve,
          ordenVisualizacion: editingPublication.ordenVisualizacion,
          activo: editingPublication.activo,
        }
      : emptyTransparenciaFormValues()

  const formOpen = formMode !== 'hidden'
  const headerTitle = formOpen
    ? formMode === 'edit'
      ? 'Editar publicación'
      : 'Nueva publicación'
    : 'Transparencia'
  const headerLead = formOpen
    ? formMode === 'edit'
      ? editingPublication
        ? `Editando «${editingPublication.nombre}». Actualice datos, archivo o visibilidad.`
        : 'Actualice los datos de la publicación y guarde para volver al listado.'
      : 'Complete los datos y suba el documento o imagen para publicarlo en la landing.'
    : 'Documentos e informes oficiales en el sitio público.'

  const showListErrorBanner = Boolean(
    error && (formOpen || publications.length > 0),
  )

  return (
    <AdminShell aria-labelledby="transparencia-admin-title">
      <PageHeader
        id="transparencia-admin-title"
        title={headerTitle}
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
            <Button
              type="button"
              variant="primary"
              leftIcon={<IconFilePlus size={18} aria-hidden="true" />}
              onClick={openCreateForm}
            >
              Nueva publicación
            </Button>
          )
        }
      />

      {actionSuccess && !formOpen ? (
        <Alert tone="success">{actionSuccess}</Alert>
      ) : null}

      {showListErrorBanner ? (
        <Alert tone="danger">{error}</Alert>
      ) : null}

      {formOpen ? (
        <section
          ref={formSectionRef}
          className="min-w-0"
          aria-labelledby="transparencia-editor-title"
        >
          <h2 id="transparencia-editor-title" className="sr-only">
            {headerTitle}
          </h2>
          <TransparenciaAdminForm
            mode={formMode}
            initialValues={formInitialValues}
            currentFileUrl={editingPublication?.archivoUrl}
            currentFileType={editingPublication?.tipoArchivo}
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
                  {loading ? '…' : visiblePublications.length}
                </strong>
                <span>
                  {visiblePublications.length === 1
                    ? 'publicación'
                    : 'publicaciones'}
                </span>
              </>
            }
          >
            <AdminFilterField label="Buscar por nombre">
              <span className="relative block">
                <IconSearch
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sigasj-muted"
                  size={17}
                  aria-hidden="true"
                />
                <input
                  className={`${adminFilterControlClassName} pl-9`}
                  type="search"
                  value={searchName}
                  onChange={(event) => setSearchName(event.target.value)}
                  placeholder="Ej. informe, calidad…"
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
            <Alert tone="info">{ADMIN_COPY.loading('publicaciones')}</Alert>
          ) : error && publications.length === 0 ? (
            <EmptyState
              title={error}
              actions={
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void loadPublications()}
                >
                  {ADMIN_COPY.retry}
                </Button>
              }
            />
          ) : visiblePublications.length === 0 ? (
            <EmptyState
              icon={<IconFileText size={32} aria-hidden="true" />}
              title={ADMIN_COPY.emptyFiltered('publicaciones')}
              actions={
                <Button
                  type="button"
                  variant="primary"
                  leftIcon={<IconFilePlus size={18} aria-hidden="true" />}
                  onClick={openCreateForm}
                >
                  Nueva publicación
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3">
              {visiblePublications.map((publication) => (
                <AdminListItem
                  key={publication.id}
                  title={publication.nombre}
                  description={publication.descripcionBreve}
                  media={
                    isTransparenciaImageType(publication.tipoArchivo) ? (
                      <img
                        src={publication.archivoUrl}
                        alt={`Vista previa de ${publication.nombre}`}
                        className={transparenciaMediaClassName}
                      />
                    ) : (
                      <div
                        className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-sigasj-card)] border border-sigasj-border bg-sigasj-surface-soft text-xs font-bold text-sigasj-muted"
                        aria-hidden="true"
                      >
                        PDF
                      </div>
                    )
                  }
                  badges={
                    <>
                      <Badge tone={publication.activo ? 'success' : 'neutral'}>
                        {publication.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                      <Badge tone="info">
                        {formatFileTypeLabel(publication.tipoArchivo)}
                      </Badge>
                      <Badge tone="neutral">
                        Orden {publication.ordenVisualizacion}
                      </Badge>
                    </>
                  }
                  actions={
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={<IconPencil size={16} aria-hidden="true" />}
                        onClick={() => openEditForm(publication)}
                      >
                        {ADMIN_COPY.edit}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={
                          publication.activo ? (
                            <IconPlayerPause size={16} aria-hidden="true" />
                          ) : (
                            <IconPlayerPlay size={16} aria-hidden="true" />
                          )
                        }
                        onClick={() => void handleToggleEstado(publication)}
                      >
                        {publication.activo
                          ? ADMIN_COPY.deactivate
                          : ADMIN_COPY.activate}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        leftIcon={<IconTrash size={16} aria-hidden="true" />}
                        onClick={() => void handleDelete(publication)}
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

export default TransparenciaAdminPage