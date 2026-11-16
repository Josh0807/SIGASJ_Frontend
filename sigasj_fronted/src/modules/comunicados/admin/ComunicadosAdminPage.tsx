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
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import { Link } from 'react-router-dom'
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
  // Mediodía de Costa Rica (UTC-6): el día no cambia sea cual sea la zona del navegador.
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
      setError('No fue posible cargar los comunicados.')
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
      setActionError(
        formMode === 'edit'
          ? 'No fue posible guardar los cambios del comunicado.'
          : 'No fue posible crear el comunicado.',
      )
      throw new Error('comunicado-save-failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEstado = async (item: AdminComunicado) => {
    setActionError(null)
    const nextEstado = item.estado === 'Activo' ? 'Inactivo' : 'Activo'
    try {
      const updated = await updateComunicadoEstado(item.id, nextEstado)
      setItems((current) =>
        current.map((row) =>
          row.id === updated.id
            ? {
                ...row,
                ...updated,
                imagenUrl:
                  resolveKeepImage(updated.imagenUrl, row.imagenUrl),
              }
            : row,
        ),
      )
    } catch {
      setActionError('No fue posible actualizar el estado del comunicado.')
    }
  }

  const handleDelete = async (item: AdminComunicado) => {
    const confirmed = window.confirm(
      `¿Eliminar el comunicado «${item.titulo}»? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) {
      return
    }

    setActionError(null)
    try {
      await deleteComunicado(item.id)
      if (editingItem?.id === item.id) {
        closeForm()
      }
      await loadItems()
    } catch {
      setActionError('No fue posible eliminar el comunicado. Intente nuevamente.')
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
                <IconBellPlus size={22} stroke={2.1} />
              ) : (
                <IconBell size={22} stroke={2.1} />
              )}
            </span>
            <div>
              <p className="gallery-admin__eyebrow">{headerEyebrow}</p>
              <h1 id={formOpen ? 'comunicado-editor-title' : undefined}>
                {headerTitle}
              </h1>
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
                <IconBellPlus size={18} aria-hidden="true" />
                Nuevo comunicado
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
            aria-labelledby="comunicado-editor-title"
          >
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
            <section
              className="gallery-admin__filters gallery-admin__filters--gallery"
              aria-label="Filtros"
            >
              <label className="gallery-admin__field gallery-admin__field--search">
                <span>Buscar por título</span>
                <span className="gallery-admin__search-control">
                  <IconSearch size={17} aria-hidden="true" />
                  <input
                    type="search"
                    value={searchTitle}
                    onChange={(event) => setSearchTitle(event.target.value)}
                    placeholder="Ej. asamblea, mantenimiento…"
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
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </label>
              <div className="gallery-admin__filter-summary" aria-live="polite">
                <strong>{loading ? '…' : visibleItems.length}</strong>
                <span>
                  {visibleItems.length === 1 ? 'comunicado' : 'comunicados'}
                </span>
              </div>
            </section>

            {loading ? (
              <p className="gallery-admin__empty" role="status">
                Cargando comunicados…
              </p>
            ) : error ? (
              <p className="gallery-admin__empty" role="alert">
                {error}
              </p>
            ) : visibleItems.length === 0 ? (
              <p className="gallery-admin__empty" role="status">
                No hay comunicados registrados con los filtros actuales.
              </p>
            ) : (
              <div className="gallery-admin__list">
                {visibleItems.map((item) => (
                  <article
                    className="gallery-admin__item gallery-admin__item--text gallery-admin__item--comunicado"
                    key={item.id}
                  >
                    <div className="gallery-admin__meta">
                      <h2>{item.titulo}</h2>
                      <p>{item.descripcion || 'Sin descripción'}</p>
                      <ul className="gallery-admin__badges">
                        <li
                          className={
                            item.estado === 'Activo' ? 'is-active' : 'is-inactive'
                          }
                        >
                          {item.estado}
                        </li>
                        <li className="is-type">{item.tipo}</li>
                        <li className={item.esPublico ? 'is-public' : 'is-private'}>
                          {item.esPublico ? 'Público' : 'No público'}
                        </li>
                      </ul>
                    </div>
                    <div className="gallery-admin__side">
                      <div className="gallery-admin__actions">
                        <button type="button" onClick={() => openEditForm(item)}>
                          <IconPencil size={16} aria-hidden="true" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleToggleEstado(item)}
                        >
                          {item.estado === 'Activo' ? (
                            <IconPlayerPause size={16} aria-hidden="true" />
                          ) : (
                            <IconPlayerPlay size={16} aria-hidden="true" />
                          )}
                          {item.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          className="gallery-admin__danger"
                          onClick={() => void handleDelete(item)}
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

const resolveKeepImage = (
  next: string | null | undefined,
  current: string | null,
) => next || current

export default ComunicadosAdminPage
