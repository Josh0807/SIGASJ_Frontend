import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/ApiError'
import {
  createAdminTransparenciaPublication,
  deleteAdminTransparenciaPublication,
  listAdminTransparenciaPublications,
  reorderAdminTransparenciaPublications,
  replaceAdminTransparenciaFile,
  updateAdminTransparenciaEstado,
  updateAdminTransparenciaPublication,
} from '../../api/transparencia/adminTransparencia'
import { getAccessToken, clearAccessToken } from '../../auth/authStorage'
import TransparenciaAdminForm from './TransparenciaAdminForm'
import {
  emptyTransparenciaFormValues,
  isTransparenciaImageType,
  type AdminTransparenciaPublication,
  type TransparenciaFormValues,
} from './types'

type LoadStatus = 'loading' | 'success' | 'error'

const formatFileTypeLabel = (tipoArchivo: AdminTransparenciaPublication['tipoArchivo']) =>
  tipoArchivo.toUpperCase()

const resolveActionError = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    return error.message
  }

  return fallback
}

const TransparenciaAdminPage = () => {
  const navigate = useNavigate()
  const token = getAccessToken()

  const [status, setStatus] = useState<LoadStatus>('loading')
  const [publications, setPublications] = useState<AdminTransparenciaPublication[]>(
    [],
  )
  const [searchName, setSearchName] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  )
  const [formMode, setFormMode] = useState<'hidden' | 'create' | 'edit'>('hidden')
  const [editingPublication, setEditingPublication] =
    useState<AdminTransparenciaPublication | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  const showSuccess = (message: string) => {
    setActionSuccess(message)
    setActionError(null)
  }

  const filters = useMemo(
    () => ({
      nombre: searchName.trim() || undefined,
      activo:
        statusFilter === 'all'
          ? undefined
          : statusFilter === 'active',
    }),
    [searchName, statusFilter],
  )

  const loadPublications = useCallback(async () => {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    setStatus('loading')
    setActionError(null)

    try {
      const rows = await listAdminTransparenciaPublications(token, filters)
      setPublications(rows)
      setStatus('success')
    } catch {
      setPublications([])
      setStatus('error')
    }
  }, [filters, navigate, token])

  useEffect(() => {
    void loadPublications()
  }, [loadPublications])

  const openCreateForm = () => {
    setEditingPublication(null)
    setFormMode('create')
    setActionSuccess(null)
  }

  const openEditForm = (publication: AdminTransparenciaPublication) => {
    setEditingPublication(publication)
    setFormMode('edit')
    setActionSuccess(null)
  }

  const closeForm = () => {
    setFormMode('hidden')
    setEditingPublication(null)
  }

  const appendFormFields = (formData: FormData, values: TransparenciaFormValues) => {
    formData.set('nombre', values.nombre)
    formData.set('descripcionBreve', values.descripcionBreve)
    formData.set('ordenVisualizacion', String(values.ordenVisualizacion))
    formData.set('activo', String(values.activo))
  }

  const handleSave = async (values: TransparenciaFormValues, file: File | null) => {
    if (!token) {
      return
    }

    setSubmitting(true)
    setActionError(null)

    try {
      if (formMode === 'create') {
        const formData = new FormData()
        if (file) {
          formData.set('archivo', file)
        }
        appendFormFields(formData, values)
        await createAdminTransparenciaPublication(token, formData)
      } else if (editingPublication) {
        await updateAdminTransparenciaPublication(token, editingPublication.id, {
          nombre: values.nombre,
          descripcionBreve: values.descripcionBreve,
        })

        if (file) {
          const formData = new FormData()
          formData.set('archivo', file)
          await replaceAdminTransparenciaFile(token, editingPublication.id, formData)
        }
      }

      closeForm()
      showSuccess(
        formMode === 'create'
          ? 'Publicación registrada correctamente.'
          : 'Publicación actualizada correctamente.',
      )
      await loadPublications()
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEstado = async (publication: AdminTransparenciaPublication) => {
    if (!token) {
      return
    }

    setActionError(null)

    try {
      await updateAdminTransparenciaEstado(token, publication.id, !publication.activo)
      showSuccess('Estado de la publicación actualizado.')
      await loadPublications()
    } catch (error) {
      setActionError(
        resolveActionError(
          error,
          'No fue posible cambiar el estado de la publicación.',
        ),
      )
    }
  }

  const handleDelete = async (publication: AdminTransparenciaPublication) => {
    if (!token) {
      return
    }

    const confirmed = window.confirm(
      `¿Eliminar la publicación «${publication.nombre}»? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) {
      return
    }

    setActionError(null)

    try {
      await deleteAdminTransparenciaPublication(token, publication.id)
      showSuccess('Publicación eliminada correctamente.')
      await loadPublications()
    } catch (error) {
      setActionError(
        resolveActionError(error, 'No fue posible eliminar la publicación.'),
      )
    }
  }

  const movePublication = async (index: number, direction: -1 | 1) => {
    if (!token) {
      return
    }

    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= publications.length) {
      return
    }

    const reordered = [...publications]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    const payload = reordered.map((publication, orderIndex) => ({
      idPublicacionTransparencia: publication.id,
      ordenVisualizacion: orderIndex,
    }))

    setActionError(null)

    try {
      await reorderAdminTransparenciaPublications(token, payload)
      showSuccess('Orden de publicaciones actualizado.')
      await loadPublications()
    } catch (error) {
      setActionError(
        resolveActionError(error, 'No fue posible reorganizar las publicaciones.'),
      )
    }
  }

  const handleLogout = () => {
    clearAccessToken()
    navigate('/login', { replace: true })
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

  return (
    <main className="gallery-admin">
      <div className="gallery-admin__shell">
        <header className="gallery-admin__header">
          <div>
            <p className="gallery-admin__eyebrow">Panel administrativo</p>
            <h1>Transparencia y calidad del agua</h1>
            <p>Administra documentos e imágenes visibles en la landing pública.</p>
          </div>
          <div className="gallery-admin__header-actions">
            <Link className="gallery-admin__link" to="/#transparencia">
              Ver sección pública
            </Link>
            <Link className="gallery-admin__link" to="/admin/galeria">
              Ir a galería
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
              Nueva publicación
            </button>
          </div>
        </header>

        <section className="gallery-admin__filters" aria-label="Filtros">
          <label className="gallery-admin__field">
            <span>Buscar por nombre</span>
            <input
              type="search"
              value={searchName}
              onChange={(event) => setSearchName(event.target.value)}
              placeholder="Ej. informe, calidad…"
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

        {actionSuccess ? (
          <p
            className="gallery-admin__banner gallery-admin__banner--success"
            role="status"
          >
            {actionSuccess}
          </p>
        ) : null}

        {actionError ? (
          <p className="gallery-admin__banner gallery-admin__banner--error" role="alert">
            {actionError}
          </p>
        ) : null}

        {formMode !== 'hidden' ? (
          <TransparenciaAdminForm
            mode={formMode}
            initialValues={formInitialValues}
            currentFileUrl={editingPublication?.archivoUrl}
            currentFileType={editingPublication?.tipoArchivo}
            submitting={submitting}
            onSubmit={handleSave}
            onCancel={closeForm}
          />
        ) : null}

        {status === 'loading' ? (
          <p className="gallery-admin__empty" role="status">
            Cargando publicaciones…
          </p>
        ) : status === 'error' ? (
          <div className="gallery-admin__empty" role="alert">
            <p>No fue posible cargar las publicaciones administrativas.</p>
            <button type="button" onClick={() => void loadPublications()}>
              Reintentar
            </button>
          </div>
        ) : publications.length === 0 ? (
          <p className="gallery-admin__empty" role="status">
            No hay publicaciones registradas con los filtros actuales.
          </p>
        ) : (
          <div className="gallery-admin__list">
            {publications.map((publication, index) => (
              <article className="gallery-admin__item" key={publication.id}>
                <div className="gallery-admin__thumb">
                  {isTransparenciaImageType(publication.tipoArchivo) ? (
                    <img
                      src={publication.archivoUrl}
                      alt={`Vista previa de ${publication.nombre}`}
                    />
                  ) : (
                    <div className="gallery-admin__doc-thumb" aria-hidden="true">
                      PDF
                    </div>
                  )}
                </div>

                <div className="gallery-admin__meta">
                  <h2>{publication.nombre}</h2>
                  <p>{publication.descripcionBreve}</p>
                  <ul className="gallery-admin__badges">
                    <li>{publication.activo ? 'Activa' : 'Inactiva'}</li>
                    <li>{formatFileTypeLabel(publication.tipoArchivo)}</li>
                    <li>Orden {publication.ordenVisualizacion}</li>
                  </ul>
                </div>

                <div className="gallery-admin__actions">
                  <button type="button" onClick={() => openEditForm(publication)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleToggleEstado(publication)}
                  >
                    {publication.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => void movePublication(index, -1)}
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    disabled={index === publications.length - 1}
                    onClick={() => void movePublication(index, 1)}
                  >
                    Bajar
                  </button>
                  <button
                    type="button"
                    className="gallery-admin__danger"
                    onClick={() => void handleDelete(publication)}
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

export default TransparenciaAdminPage
