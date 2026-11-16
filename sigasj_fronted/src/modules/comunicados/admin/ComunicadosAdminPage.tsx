import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  IconArrowLeft,
  IconBell,
  IconBellPlus,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
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
import ComunicadosAdminForm from './ComunicadosAdminForm'
import { emptyComunicadoFormValues, type ComunicadoFormValues } from './types'
import {
  createComunicado,
  deleteComunicado,
  getAdminComunicados,
  updateComunicado,
  updateComunicadoEstado,
  type AdminComunicado,
} from '../services/comunicadosApi'

const toDateInput = (value?: string | null) =>
  value ? value.slice(0, 10) : ''

const toIsoDate = (value: string) =>
  value ? new Date(`${value}T12:00:00-06:00`).toISOString() : ''

const ComunicadosAdminPage = () => {
  const [items, setItems] = useState<AdminComunicado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [searchTitle, setSearchTitle] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  )
  const [formMode, setFormMode] = useState<'hidden' | 'create' | 'edit'>('hidden')
  const [editingItem, setEditingItem] = useState<AdminComunicado | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const formSectionRef = useRef<HTMLElement | null>(null)

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      setItems(await getAdminComunicados())
    } catch {
      setError(ADMIN_COPY.loadError('los comunicados'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => runAfterEffect(() => {
    void loadItems()
  }), [loadItems])

  const visibleItems = useMemo(() => {
    const query = searchTitle.trim().toLowerCase()

    return items.filter((item) => {
      const matchesTitle = !query || item.titulo.toLowerCase().includes(query)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active'
          ? item.estado === 'Activo'
          : item.estado === 'Inactivo')

      return matchesTitle && matchesStatus
    })
  }, [items, searchTitle, statusFilter])

  const focusFormSection = () => {
    window.requestAnimationFrame(() => {
      const node = formSectionRef.current
      if (node && typeof node.scrollIntoView === 'function') {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  const closeForm = () => {
    setFormMode('hidden')
    setEditingItem(null)
    setActionError(null)
  }

  const openCreateForm = () => {
    setActionError(null)
    setEditingItem(null)
    setFormMode('create')
    focusFormSection()
  }

  const openEditForm = (item: AdminComunicado) => {
    setActionError(null)
    setEditingItem(item)
    setFormMode('edit')
    focusFormSection()
  }

  const handleSave = async (values: ComunicadoFormValues, file: File | null) => {
    setSubmitting(true)
    setActionError(null)

    try {
      const payload = {
        ...values,
        fechaPublicacion: toIsoDate(values.fechaPublicacion),
        fechaExpiracion: toIsoDate(values.fechaExpiracion),
      }

      if (formMode === 'create') {
        await createComunicado(payload, file)
      } else if (editingItem) {
        await updateComunicado(editingItem.id, payload, file)
      }

      closeForm()
      await loadItems()
    } catch {
      setActionError(ADMIN_COPY.actionError('guardar', 'el comunicado'))
      throw new Error('comunicado-save-failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEstado = async (item: AdminComunicado) => {
    setActionError(null)
    try {
      await updateComunicadoEstado(
        item.id,
        item.estado === 'Activo' ? 'Inactivo' : 'Activo',
      )
      await loadItems()
    } catch {
      setActionError(ADMIN_COPY.actionError('actualizar', 'el comunicado'))
    }
  }

  const handleDelete = async (item: AdminComunicado) => {
    const confirmed = window.confirm(ADMIN_COPY.deleteConfirm(item.titulo))
    if (!confirmed) return

    setActionError(null)
    try {
      await deleteComunicado(item.id)
      if (editingItem?.id === item.id) closeForm()
      await loadItems()
    } catch {
      setActionError(ADMIN_COPY.actionError('eliminar', 'el comunicado'))
    }
  }

  const formInitialValues: ComunicadoFormValues =
    formMode === 'edit' && editingItem
      ? {
          titulo: editingItem.titulo,
          descripcion: editingItem.descripcion ?? '',
          contenido: editingItem.contenido ?? '',
          tipo: editingItem.tipo,
          prioridad:
            editingItem.prioridad === 'Alta' || editingItem.prioridad === 'Baja'
              ? editingItem.prioridad
              : 'Media',
          estado: editingItem.estado,
          esPublico: editingItem.esPublico,
          fechaPublicacion: toDateInput(editingItem.fechaPublicacion),
          fechaExpiracion: toDateInput(editingItem.fechaExpiracion),
        }
      : emptyComunicadoFormValues()

  const formOpen = formMode !== 'hidden'
  const headerEyebrow = formOpen
    ? formMode === 'edit'
      ? 'Comunicados · Edición'
      : 'Comunicados · Alta'
    : 'Panel administrativo'
  const headerTitle = formOpen
    ? formMode === 'edit'
      ? 'Editar comunicado'
      : 'Nuevo comunicado'
    : 'Gestión de Comunicados'
  const headerLead = formOpen
    ? formMode === 'edit'
      ? editingItem
        ? `Editando «${editingItem.titulo}». Actualice el contenido, estado o imagen del aviso.`
        : 'Actualice los datos del aviso y guarde para volver al listado.'
      : 'Complete el formulario y guarde para publicarlo en el listado.'
    : 'Cree, edite y active los avisos visibles en la landing pública.'

  return (
    <AdminShell aria-labelledby="comunicados-admin-title">
      <PageHeader
        id="comunicados-admin-title"
        eyebrow={headerEyebrow}
        title={
          <span className="inline-flex items-center gap-2">
            {formMode === 'edit' ? (
              <IconPencil size={22} aria-hidden="true" />
            ) : formMode === 'create' ? (
              <IconBellPlus size={22} aria-hidden="true" />
            ) : (
              <IconBell size={22} aria-hidden="true" />
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
                leftIcon={<IconBellPlus size={18} aria-hidden="true" />}
                onClick={openCreateForm}
              >
                Nuevo comunicado
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
          aria-labelledby="comunicado-editor-title"
        >
          <h2 id="comunicado-editor-title" className="sr-only">
            {headerTitle}
          </h2>
          <ComunicadosAdminForm
            mode={formMode}
            initialValues={formInitialValues}
            currentImageUrl={editingItem?.imagenUrl}
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
                  {loading ? '…' : visibleItems.length}
                </strong>
                <span>
                  {visibleItems.length === 1 ? 'comunicado' : 'comunicados'}
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
                  placeholder="Ej. asamblea, mantenimiento…"
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
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </AdminFilterField>
          </AdminFilters>

          {loading ? (
            <Alert tone="info">{ADMIN_COPY.loading('comunicados')}</Alert>
          ) : error ? (
            <EmptyState
              title={error}
              actions={
                <Button type="button" variant="secondary" onClick={() => void loadItems()}>
                  {ADMIN_COPY.retry}
                </Button>
              }
            />
          ) : visibleItems.length === 0 ? (
            <EmptyState
              icon={<IconBell size={32} aria-hidden="true" />}
              title={ADMIN_COPY.emptyFiltered('comunicados')}
              actions={
                <Button
                  type="button"
                  variant="primary"
                  leftIcon={<IconBellPlus size={18} aria-hidden="true" />}
                  onClick={openCreateForm}
                >
                  Nuevo comunicado
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3">
              {visibleItems.map((item) => (
                <AdminListItem
                  key={item.id}
                  title={item.titulo}
                  description={item.descripcion || 'Sin descripción'}
                  badges={
                    <>
                      <Badge tone={item.estado === 'Activo' ? 'success' : 'neutral'}>
                        {item.estado}
                      </Badge>
                      <Badge tone="info">{item.tipo}</Badge>
                      <Badge tone={item.esPublico ? 'solid' : 'neutral'}>
                        {item.esPublico ? 'Público' : 'No público'}
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
                        onClick={() => openEditForm(item)}
                      >
                        {ADMIN_COPY.edit}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        leftIcon={
                          item.estado === 'Activo' ? (
                            <IconPlayerPause size={16} aria-hidden="true" />
                          ) : (
                            <IconPlayerPlay size={16} aria-hidden="true" />
                          )
                        }
                        onClick={() => void handleToggleEstado(item)}
                      >
                        {item.estado === 'Activo'
                          ? ADMIN_COPY.deactivate
                          : ADMIN_COPY.activate}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        leftIcon={<IconTrash size={16} aria-hidden="true" />}
                        onClick={() => void handleDelete(item)}
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

export default ComunicadosAdminPage
