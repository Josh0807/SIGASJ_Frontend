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
import { Link } from 'react-router-dom'
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
      setError('No fue posible cargar las publicaciones de transparencia.')
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
      setError('No fue posible actualizar el estado de la publicación.')
    }
  }

  const handleDelete = async (publication: AdminTransparenciaPublication) => {
    const confirmed = window.confirm(
      `¿Eliminar la publicación «${publication.nombre}»? Esta acción no se puede deshacer.`,
    )

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
      setError('No fue posible eliminar la publicación. Intente nuevamente.')
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
  const headerEyebrow = formOpen
    ? formMode === 'edit'
      ? 'Transparencia · Edición'
      : 'Transparencia · Alta'
    : 'Panel administrativo'
  const headerTitle = formOpen
    ? formMode === 'edit'
      ? 'Editar publicación'
      : 'Nueva publicación'
    : 'Transparencia y calidad del agua'
  const headerLead = formOpen
    ? formMode === 'edit'
      ? editingPublication
        ? `Editando «${editingPublication.nombre}». Actualice datos, archivo o visibilidad.`
        : 'Actualice los datos de la publicación y guarde para volver al listado.'
      : 'Complete los datos y suba el documento o imagen para publicarlo en la landing.'
    : 'Administra documentos e imágenes visibles en la landing pública.'

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
                <IconFilePlus size={22} stroke={2.1} />
              ) : (
                <IconFileText size={22} stroke={2.1} />
              )}
            </span>
            <div>
              <p className="gallery-admin__eyebrow">{headerEyebrow}</p>
              <h1 id={formOpen ? 'transparencia-editor-title' : undefined}>
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
                <IconFilePlus size={18} aria-hidden="true" />
                Nueva publicación
              </button>
            ) : null}
          </div>
        </header>

        {actionSuccess && !formOpen ? (
          <p
            className="gallery-admin__banner gallery-admin__banner--success"
            role="status"
          >
            {actionSuccess}
          </p>
        ) : null}

        {error ? (
          <p className="gallery-admin__banner gallery-admin__banner--error" role="alert">
            {error}
          </p>
        ) : null}

        {formOpen ? (
          <section
            ref={formSectionRef}
            className="gallery-admin__editor"
            aria-labelledby="transparencia-editor-title"
          >
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
            <section
              className="gallery-admin__filters gallery-admin__filters--gallery"
              aria-label="Filtros"
            >
              <label className="gallery-admin__field gallery-admin__field--search">
                <span>Buscar por nombre</span>
                <span className="gallery-admin__search-control">
                  <IconSearch size={17} aria-hidden="true" />
                  <input
                    type="search"
                    value={searchName}
                    onChange={(event) => setSearchName(event.target.value)}
                    placeholder="Ej. informe, calidad…"
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
                <strong>{loading ? '…' : visiblePublications.length}</strong>
                <span>
                  {visiblePublications.length === 1
                    ? 'publicación'
                    : 'publicaciones'}
                </span>
              </div>
            </section>

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
                {visiblePublications.map((publication) => (
                  <article
                    className="gallery-admin__item gallery-admin__item--photo"
                    key={publication.id}
                  >
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
                        <li
                          className={
                            publication.activo ? 'is-active' : 'is-inactive'
                          }
                        >
                          {publication.activo ? 'Activa' : 'Inactiva'}
                        </li>
                        <li>{formatFileTypeLabel(publication.tipoArchivo)}</li>
                        <li>Orden {publication.ordenVisualizacion}</li>
                      </ul>
                    </div>

                    <div className="gallery-admin__side">
                      <div className="gallery-admin__actions">
                        <button
                          type="button"
                          onClick={() => openEditForm(publication)}
                        >
                          <IconPencil size={16} aria-hidden="true" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleToggleEstado(publication)}
                        >
                          {publication.activo ? (
                            <IconPlayerPause size={16} aria-hidden="true" />
                          ) : (
                            <IconPlayerPlay size={16} aria-hidden="true" />
                          )}
                          {publication.activo ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          type="button"
                          className="gallery-admin__danger"
                          onClick={() => void handleDelete(publication)}
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

export default TransparenciaAdminPage
