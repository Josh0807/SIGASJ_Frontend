import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import TransparenciaAdminForm from './TransparenciaAdminForm'
import { adminTransparenciaMocks } from './adminTransparenciaMocks'
import {
  emptyTransparenciaFormValues,
  isTransparenciaImageType,
  type AdminTransparenciaPublication,
  type TransparenciaFormValues,
} from './types'
import { inferTransparenciaFileType } from './validateTransparenciaFile'

const formatFileTypeLabel = (
  tipoArchivo: AdminTransparenciaPublication['tipoArchivo'],
) => tipoArchivo.toUpperCase()

const TransparenciaAdminPage = () => {
  const nextIdRef = useRef(
    Math.max(0, ...adminTransparenciaMocks.map((item) => item.id)) + 1,
  )

  const [publications, setPublications] = useState<AdminTransparenciaPublication[]>(
    adminTransparenciaMocks,
  )
  const [searchName, setSearchName] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  )
  const [formMode, setFormMode] = useState<'hidden' | 'create' | 'edit'>('hidden')
  const [editingPublication, setEditingPublication] =
    useState<AdminTransparenciaPublication | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

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

        const nextPublication: AdminTransparenciaPublication = {
          id: nextIdRef.current,
          nombre: values.nombre,
          descripcionBreve: values.descripcionBreve,
          archivoUrl: URL.createObjectURL(file),
          tipoArchivo: inferTransparenciaFileType(file),
          ordenVisualizacion: values.ordenVisualizacion,
          activo: values.activo,
        }
        nextIdRef.current += 1
        setPublications((current) => [...current, nextPublication])
        showSuccess('Publicación registrada correctamente.')
      } else if (editingPublication) {
        setPublications((current) =>
          current.map((publication) =>
            publication.id === editingPublication.id
              ? {
                  ...publication,
                  nombre: values.nombre,
                  descripcionBreve: values.descripcionBreve,
                  archivoUrl: file
                    ? URL.createObjectURL(file)
                    : publication.archivoUrl,
                  tipoArchivo: file
                    ? inferTransparenciaFileType(file)
                    : publication.tipoArchivo,
                }
              : publication,
          ),
        )
        showSuccess('Publicación actualizada correctamente.')
      }

      closeForm()
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleEstado = (publication: AdminTransparenciaPublication) => {
    setPublications((current) =>
      current.map((item) =>
        item.id === publication.id ? { ...item, activo: !item.activo } : item,
      ),
    )
    showSuccess('Estado de la publicación actualizado.')
  }

  const handleDelete = (publication: AdminTransparenciaPublication) => {
    const confirmed = window.confirm(
      `¿Eliminar la publicación «${publication.nombre}»? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) {
      return
    }

    setPublications((current) =>
      current.filter((item) => item.id !== publication.id),
    )
    showSuccess('Publicación eliminada correctamente.')
  }

  const movePublication = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= visiblePublications.length) {
      return
    }

    const reordered = [...visiblePublications]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(targetIndex, 0, moved)
    const orderById = new Map(
      reordered.map((publication, orderIndex) => [publication.id, orderIndex]),
    )

    setPublications((current) =>
      current
        .map((publication) =>
          orderById.has(publication.id)
            ? {
                ...publication,
                ordenVisualizacion: orderById.get(publication.id)!,
              }
            : publication,
        )
        .sort((left, right) => left.ordenVisualizacion - right.ordenVisualizacion),
    )
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

        {visiblePublications.length === 0 ? (
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
                    onClick={() => handleToggleEstado(publication)}
                  >
                    {publication.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => movePublication(index, -1)}
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    disabled={index === visiblePublications.length - 1}
                    onClick={() => movePublication(index, 1)}
                  >
                    Bajar
                  </button>
                  <button
                    type="button"
                    className="gallery-admin__danger"
                    onClick={() => handleDelete(publication)}
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
