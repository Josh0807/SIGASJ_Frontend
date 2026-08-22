import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ComunicadosAdminForm from './ComunicadosAdminForm'
import { emptyComunicadoFormValues, type ComunicadoFormValues } from './types'
import {
  createComunicado,
  deleteComunicado,
  getAdminComunicados,
  setComunicadoEstado,
  updateComunicado,
  type AdminComunicado,
} from '../services/comunicadosApi'

const toDateInput = (value?: string | null) =>
  value ? value.slice(0, 10) : ''

const toIsoDate = (value: string) => {
  if (!value) {
    return ''
  }

  const today = new Date().toISOString().slice(0, 10)
  if (value === today) {
    return new Date().toISOString()
  }

  return new Date(`${value}T12:00:00`).toISOString()
}

const ComunicadosAdminPage = () => {
  const [items, setItems] = useState<AdminComunicado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  useEffect(() => {
    void loadItems()
  }, [loadItems])

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
        await setComunicadoEstado(editingItem.id, payload.estado)
      }

      closeForm()
      await loadItems()
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEstado = async (item: AdminComunicado) => {
    setError(null)

    try {
      const updated = await setComunicadoEstado(
        item.id,
        item.estado === 'Activo' ? 'Inactivo' : 'Activo',
      )
      setItems((current) =>
        current.map((row) => (row.id === updated.id ? updated : row)),
      )
    } catch {
      setError('No fue posible cambiar el estado del comunicado.')
    }
  }

  const handleDelete = async (item: AdminComunicado) => {
    const confirmed = window.confirm(
      `¿Eliminar el comunicado «${item.titulo}»? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) {
      return
    }

    setError(null)

    try {
      await deleteComunicado(item.id)
      setItems((current) => current.filter((row) => row.id !== item.id))
    } catch {
      setError('No fue posible eliminar el comunicado.')
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

  return (
    <main className="gallery-admin">
      <div className="gallery-admin__shell">
        <header className="gallery-admin__header">
          <div>
            <p className="gallery-admin__eyebrow">Panel administrativo</p>
            <h1>Gestión de Comunicados</h1>
            <p>Cree, edite y active los avisos visibles en la landing pública.</p>
          </div>
          <div className="gallery-admin__header-actions">
            <Link className="gallery-admin__link" to="/#comunicados">
              Ver sitio público
            </Link>
            <button
              type="button"
              className="gallery-admin__button gallery-admin__button--primary"
              onClick={() => {
                setEditingItem(null)
                setFormMode('create')
              }}
            >
              Nuevo comunicado
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

        {formMode !== 'hidden' ? (
          <ComunicadosAdminForm
            key={`${formMode}-${editingItem?.id ?? 'nuevo'}`}
            mode={formMode}
            initialValues={formInitialValues}
            currentImageUrl={editingItem?.imagenUrl}
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
            Cargando comunicados…
          </p>
        ) : visibleItems.length === 0 ? (
          <p className="gallery-admin__empty" role="status">
            No hay comunicados registrados con los filtros actuales.
          </p>
        ) : (
          <div className="gallery-admin__list">
            {visibleItems.map((item) => (
              <article className="gallery-admin__item" key={item.id}>
                <div className="gallery-admin__meta">
                  <h2>{item.titulo}</h2>
                  <p>{item.descripcion || 'Sin descripción'}</p>
                  <ul className="gallery-admin__badges">
                    <li>{item.estado}</li>
                    <li>{item.tipo}</li>
                    <li>{item.esPublico ? 'Público' : 'No público'}</li>
                  </ul>
                </div>
                <div className="gallery-admin__actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem(item)
                      setFormMode('edit')
                    }}
                  >
                    Editar
                  </button>
                  <button type="button" onClick={() => void handleToggleEstado(item)}>
                    {item.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    type="button"
                    className="gallery-admin__danger"
                    onClick={() => void handleDelete(item)}
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

export default ComunicadosAdminPage
