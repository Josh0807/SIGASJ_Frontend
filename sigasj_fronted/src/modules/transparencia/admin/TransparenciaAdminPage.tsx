import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TransparenciaAdminForm from './TransparenciaAdminForm'
import {
  emptyTransparenciaFormValues,
  isTransparenciaImageType,
  type AdminTransparenciaPublication,
  type TransparenciaFormValues,
} from './types'
import {
  createTransparencia,
  deleteTransparencia,
  getAdminTransparencia,
  setTransparenciaActiva,
  updateTransparencia,
} from '../services/transparenciaApi'

const formatFileTypeLabel = (
  tipoArchivo: AdminTransparenciaPublication['tipoArchivo'],
) => tipoArchivo.toUpperCase()

const TransparenciaAdminPage = () => {
  const [publications, setPublications] = useState<AdminTransparenciaPublication[]>(
    [],
  )
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

  const loadPublications = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      setPublications(await getAdminTransparencia())
    } catch {
      setError('No fue posible cargar las publicaciones de transparencia.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPublications()
  }, [loadPublications])

  const showSuccess = (message: string) => {
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

  const handleSave = async (
    values: TransparenciaFormValues,
    file: File | null,
  ) => {
    setSubmitting(true)

    try {
      if (formMode === 'create') {
        if (!file) {
          return
        }

        await createTransparencia(values, file)
        showSuccess('Publicación registrada correctamente.')
      } else if (editingPublication) {
        await updateTransparencia(editingPublication.id, values, file)
        await setTransparenciaActiva(editingPublication.id, values.activo)
        showSuccess('Publicación actualizada correctamente.')
      }

      closeForm()
      await loadPublications()
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEstado = async (publication: AdminTransparenciaPublication) => {
    setError(null)

    try {
      const updated = await setTransparenciaActiva(
        publication.id,
        !publication.activo,
      )
      setPublications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      showSuccess('Estado de la publicación actualizado.')
    } catch {
      setError('No fue posible cambiar el estado de la publicación.')
    }
  }

  const handleDelete = async (publication: AdminTransparenciaPublication) => {
    const confirmed = window.confirm(
      `¿Eliminar la publicación «${publication.nombre}»? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) {
      return
    }

    await deleteTransparencia(publication.id)
    await loadPublications()
    showSuccess('Publicación eliminada correctamente.')
  }

  const movePublication = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= visiblePublications.length) {
      return
    }

    const reordered = [...visiblePublications]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)

    await Promise.all(
      reordered.map((publication, orderIndex) =>
        updateTransparencia(
          publication.id,
          {
            nombre: publication.nombre,
            descripcionBreve: publication.descripcionBreve,
            ordenVisualizacion: orderIndex,
            activo: publication.activo,
          },
          null,
        ),
      ),
    )
    await loadPublications()
    showSuccess('Orden de publicaciones actualizado.')
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

        {error ? (
          <p className="gallery-admin__empty" role="alert">
            {error}
          </p>
        ) : null}

        {formMode !== 'hidden' ? (
          <TransparenciaAdminForm
            key={`${formMode}-${editingPublication?.id ?? 'nueva'}`}
            mode={formMode}
            initialValues={formInitialValues}
            currentFileUrl={editingPublication?.archivoUrl}
            currentFileType={editingPublication?.tipoArchivo}
            submitting={submitting}
            onSubmit={handleSave}
            onCancel={closeForm}
          />
        ) : null}

        {loading ? (
          <p className="gallery-admin__empty" role="status">
            Cargando publicaciones…
          </p>
        ) : visiblePublications.length === 0 ? (
          <p className="gallery-admin__empty" role="status">
            No hay publicaciones registradas con los filtros actuales.
          </p>
        ) : (
          <div className="gallery-admin__list">
            {visiblePublications.map((publication, index) => (
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
                    disabled={index === visiblePublications.length - 1}
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
