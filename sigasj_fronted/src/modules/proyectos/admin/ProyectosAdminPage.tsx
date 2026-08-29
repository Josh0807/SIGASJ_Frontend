import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ESTADO_PROYECTO_OPTIONS,
  type EstadoProyecto,
} from '../types/estadoProyecto'
import {
  DEFAULT_PROYECTOS_LIMIT,
  DEFAULT_PROYECTOS_PAGE,
  clampProyectosPage,
} from './types'
import ProyectosAdminTable from './ProyectosAdminTable'
import ProyectosAdminPagination from './ProyectosAdminPagination'
import ProyectosAdminQueryStates from './ProyectosAdminQueryStates'
import { PROYECTOS_ADMIN_NEW_PATH } from './proyectosAdminPaths'
import {
  toActivoQueryParam,
  updateProyectoEstado,
  updateProyectoVisibilidad,
} from '../services/proyectosApi'
import { useAdminProyectos } from '../hooks/useAdminProyectos'

const EMPTY_FILTER = ''
const NOMBRE_SEARCH_DEBOUNCE_MS = 400
const NOMBRE_SEARCH_INPUT_ID = 'proyectos-admin-buscar'
const ESTADO_FILTER_ID = 'proyectos-admin-estado'
const ACTIVO_FILTER_ID = 'proyectos-admin-activo'

const ProyectosAdminPage = () => {
  const [nombreInput, setNombreInput] = useState('')
  const [nombre, setNombre] = useState('')
  const [estado, setEstado] = useState(EMPTY_FILTER)
  const [activo, setActivo] = useState(EMPTY_FILTER)
  const [page, setPage] = useState(DEFAULT_PROYECTOS_PAGE)
  const [actionError, setActionError] = useState<string | null>(null)
  const appliedNombreRef = useRef(nombre)

  const applyNombreSearch = useCallback((value: string) => {
    const nextNombre = value.trim()
    if (appliedNombreRef.current === nextNombre) {
      return
    }

    appliedNombreRef.current = nextNombre
    setNombre(nextNombre)
    setPage(DEFAULT_PROYECTOS_PAGE)
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      applyNombreSearch(nombreInput)
    }, NOMBRE_SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [nombreInput, applyNombreSearch])

  const { listado, loading, error, refetch } = useAdminProyectos({
    nombre: nombre || undefined,
    estado: estado ? (estado as EstadoProyecto) : undefined,
    activo: toActivoQueryParam(activo),
    page,
    limit: DEFAULT_PROYECTOS_LIMIT,
  })

  const handleToggleVisibilidad = async (id: number, proximoActivo: boolean) => {
    setActionError(null)
    try {
      await updateProyectoVisibilidad(id, proximoActivo)
      await refetch()
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No fue posible actualizar la visibilidad del proyecto.'
      setActionError(msg)
    }
  }

  const handleEstadoChange = async (id: number, nuevoEstado: EstadoProyecto) => {
    setActionError(null)
    try {
      await updateProyectoEstado(id, nuevoEstado)
      await refetch()
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'No fue posible actualizar el estado de ejecución.'
      setActionError(msg)
    }
  }


  const totalPages = listado.totalPages
  const hasActiveFilters =
    Boolean(nombreInput.trim()) || estado !== EMPTY_FILTER || activo !== EMPTY_FILTER

  const goToPage = (nextPage: number) => {
    setPage(clampProyectosPage(nextPage, totalPages))
  }

  const clearFilters = () => {
    setNombreInput('')
    appliedNombreRef.current = ''
    setNombre('')
    setEstado(EMPTY_FILTER)
    setActivo(EMPTY_FILTER)
    setPage(DEFAULT_PROYECTOS_PAGE)
  }

  return (
    <main className="gallery-admin proyectos-admin">
      <div className="gallery-admin__shell">
        <header className="gallery-admin__header">
          <div>
            <p className="gallery-admin__eyebrow">Panel administrativo</p>
            <h1>Gestión de Proyectos</h1>
            <p>
              Consulte los proyectos institucionales, filtre por nombre, estado
              de ejecución y visibilidad pública.
            </p>
          </div>
          <div className="gallery-admin__header-actions">
            <Link className="gallery-admin__link" to="/#proyectos">
              Ver sitio público
            </Link>
            <Link
              className="gallery-admin__button gallery-admin__button--primary"
              to={PROYECTOS_ADMIN_NEW_PATH}
            >
              Nuevo proyecto
            </Link>
          </div>
        </header>

        <section className="gallery-admin__filters" aria-label="Búsqueda y filtros">
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              applyNombreSearch(nombreInput)
            }}
          >
            <label className="gallery-admin__field" htmlFor={NOMBRE_SEARCH_INPUT_ID}>
              <span>Buscar por nombre</span>
              <input
                id={NOMBRE_SEARCH_INPUT_ID}
                name="nombre"
                type="search"
                maxLength={200}
                value={nombreInput}
                onChange={(event) => setNombreInput(event.target.value)}
                placeholder="Ej. acueducto, tanque…"
              />
            </label>
          </form>
          <label className="gallery-admin__field" htmlFor={ESTADO_FILTER_ID}>
            <span>Estado</span>
            <select
              id={ESTADO_FILTER_ID}
              name="estado"
              value={estado}
              onChange={(event) => {
                setEstado(event.target.value)
                setPage(DEFAULT_PROYECTOS_PAGE)
              }}
            >
              <option value={EMPTY_FILTER}>Todos los estados</option>
              {ESTADO_PROYECTO_OPTIONS.map((estadoProyecto) => (
                <option value={estadoProyecto.value} key={estadoProyecto.value}>
                  {estadoProyecto.label}
                </option>
              ))}
            </select>
          </label>
          <label className="gallery-admin__field" htmlFor={ACTIVO_FILTER_ID}>
            <span>Visibilidad</span>
            <select
              id={ACTIVO_FILTER_ID}
              name="activo"
              value={activo}
              onChange={(event) => {
                setActivo(event.target.value)
                setPage(DEFAULT_PROYECTOS_PAGE)
              }}
            >
              <option value={EMPTY_FILTER}>Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </label>
          {hasActiveFilters ? (
            <p className="gallery-admin__filter-reset">
              <button
                type="button"
                className="gallery-admin__button"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            </p>
          ) : null}
        </section>

        {actionError ? (
          <div className="gallery-admin__error" role="alert" style={{ marginBottom: '16px' }}>
            <p>{actionError}</p>
            <button type="button" onClick={() => setActionError(null)}>
              Cerrar
            </button>
          </div>
        ) : null}

        <section aria-label="Listado de proyectos">
          <ProyectosAdminQueryStates
            loading={loading}
            error={error}
            hasResults={listado.data.length > 0}
            hasActiveFilters={hasActiveFilters}
            onRetry={refetch}
          >
            <ProyectosAdminTable
              proyectos={listado.data}
              onToggleVisibilidad={handleToggleVisibilidad}
              onEstadoChange={handleEstadoChange}
            />
          </ProyectosAdminQueryStates>
        </section>


        {loading || error ? null : (
          <ProyectosAdminPagination
            page={page}
            totalPages={listado.totalPages}
            total={listado.total}
            loading={loading}
            onPageChange={goToPage}
          />
        )}
      </div>
    </main>
  )
}

export default ProyectosAdminPage
