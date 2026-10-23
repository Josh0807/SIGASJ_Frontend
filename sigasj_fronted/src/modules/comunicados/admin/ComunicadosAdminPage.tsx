import { useCallback, useEffect, useMemo, useState } from 'react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import { Link } from 'react-router-dom'
import ComunicadosAdminForm from './ComunicadosAdminForm'
import { emptyComunicadoFormValues, type ComunicadoFormValues } from './types'
import {
  createComunicado,
  deleteComunicado,
  getAdminComunicados,
  updateComunicado,
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

  const closeForm = () => {
    setFormMode('hidden')
    setEditingItem(null)
    setActionError(null)
  }

  const openCreateForm = () => {
    setActionError(null)
    setEditingItem(null)
    setFormMode('create')
  }

  const openEditForm = (item: AdminComunicado) => {
    setActionError(null)
    setEditingItem(item)
    setFormMode('edit')
  }

  const handleSave = async (values: ComunicadoFormValues, file: File | null) => {
    setSubmitting(true)

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
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEstado = async (item: AdminComunicado) => {
    await updateComunicado(
      item.id,
      {
        titulo: item.titulo,
        descripcion: item.descripcion,
        contenido: item.contenido ?? '',
        tipo: item.tipo,
        prioridad: item.prioridad,
        estado: item.estado === 'Activo' ? 'Inactivo' : 'Activo',
        esPublico: item.esPublico,
        fechaPublicacion: item.fechaPublicacion,
        fechaExpiracion: item.fechaExpiracion ?? '',
      },
      null,
    )
    await loadItems()
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

  const isFormView = formMode !== 'hidden'

  return (
    <main className="gallery-admin admin-content-modern">
      <div className="gallery-admin__shell sigasj-stack">
        {isFormView ? (
          <>
            <header className="gallery-admin__header">
              <div>
                <p className="gallery-admin__eyebrow">Panel administrativo</p>
                <h1>
                  {formMode === 'create' ? 'Nuevo comunicado' : 'Editar comunicado'}
                </h1>
                <p>
                  {formMode === 'create'
                    ? 'Complete el formulario y guarde para publicarlo en el listado.'
                    : 'Actualice los datos del aviso y guarde para volver al listado.'}
                </p>
              </div>
              <div className="gallery-admin__header-actions">
                <button
                  type="button"
                  className="gallery-admin__button"
                  onClick={closeForm}
                >
                  Volver al listado
                </button>
              </div>
            </header>

            <ComunicadosAdminForm
              mode={formMode}
              initialValues={formInitialValues}
              currentImageUrl={editingItem?.imagenUrl}
              submitting={submitting}
              onSubmit={handleSave}
              onCancel={closeForm}
            />
          </>
        ) : (
          <>
            <header className="gallery-admin__header">
              <div>
                <p className="gallery-admin__eyebrow">Panel administrativo</p>
                <h1>Gestión de Comunicados</h1>
                <p>Cree, edite y active los avisos visibles en la landing pública.</p>
              </div>
              <div className="gallery-admin__header-actions">
                <Link className="gallery-admin__link admin-modern-home-link" to="/admin/dashboard">
                  Volver inicio
                </Link>
                <button
                  type="button"
                  className="gallery-admin__button gallery-admin__button--primary"
                  onClick={openCreateForm}
                >
                  Nuevo comunicado
                </button>
              </div>
            </header>

            <section className="gallery-admin__filters w-full" aria-label="Filtros">
              <label className="gallery-admin__field">
                <span>Buscar por título</span>
                <input
                  type="search"
                  value={searchTitle}
                  onChange={(event) => setSearchTitle(event.target.value)}
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
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </label>
            </section>

            {actionError ? (
              <p className="gallery-admin__banner gallery-admin__banner--error" role="alert">
                {actionError}
              </p>
            ) : null}

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
                  <article className="gallery-admin__item gallery-admin__item--text" key={item.id}>
                    <div className="gallery-admin__meta">
                      <h2>{item.titulo}</h2>
                      <p>{item.descripcion || 'Sin descripción'}</p>
                      <ul className="gallery-admin__badges">
                        <li className={item.estado === 'Activo' ? 'is-active' : 'is-inactive'}>
                          {item.estado}
                        </li>
                        <li className="is-type">{item.tipo}</li>
                        <li className={item.esPublico ? 'is-public' : 'is-private'}>
                          {item.esPublico ? 'Público' : 'No público'}
                        </li>
                      </ul>
                    </div>
                    <div className="gallery-admin__actions">
                      <button
                        type="button"
                        className="gallery-admin__button gallery-admin__button--primary"
                        onClick={() => openEditForm(item)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="gallery-admin__button"
                        onClick={() => void handleToggleEstado(item)}
                      >
                        {item.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        className="gallery-admin__button gallery-admin__danger"
                        onClick={() => void handleDelete(item)}
                      >
                        Eliminar
                      </button>
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

export default ComunicadosAdminPage
