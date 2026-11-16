import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  IconBuildingBridge,
  IconFilterOff,
  IconFolderPlus,
  IconSearch,
} from '@tabler/icons-react'
import { UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/routePaths'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import {
  AdminFilterField,
  AdminFilters,
  AdminShell,
  Alert,
  Button,
  PageHeader,
  adminFilterControlClassName,
} from '../../../shared/ui'
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

  const { listado, loading, error, forbidden, refetch } = useAdminProyectos({
    nombre: nombre || undefined,
    estado: estado ? (estado as EstadoProyecto) : undefined,
    activo: toActivoQueryParam(activo),
    page,
    limit: DEFAULT_PROYECTOS_LIMIT,
  })

  if (forbidden) {
    return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  }

  const handleToggleVisibilidad = async (id: number, proximoActivo: boolean) => {
    setActionError(null)
    try {
      await updateProyectoVisibilidad(id, proximoActivo)
      await refetch()
    } catch {
      setActionError(ADMIN_COPY.actionError('actualizar', 'la visibilidad del proyecto'))
    }
  }

  const handleEstadoChange = async (id: number, nuevoEstado: EstadoProyecto) => {
    setActionError(null)
    try {
      await updateProyectoEstado(id, nuevoEstado)
      await refetch()
    } catch {
      setActionError(ADMIN_COPY.actionError('actualizar', 'el estado del proyecto'))
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
    <AdminShell
      className="proyectos-admin min-w-0"
      aria-labelledby="proyectos-admin-title"
    >
      <PageHeader
        id="proyectos-admin-title"
        eyebrow="Inventario institucional · Administración"
        title={
          <span className="inline-flex items-center gap-2">
            <IconBuildingBridge size={22} aria-hidden="true" />
            Gestión de Proyectos
          </span>
        }
        description="Obras y mejoras en curso: estado, portada, galería y visibilidad en el sitio de la comunidad."
        actions={
          <>
            <Button to="/admin/dashboard" variant="ghost">
              {ADMIN_COPY.backHome}
            </Button>
            <Button
              to={PROYECTOS_ADMIN_NEW_PATH}
              variant="primary"
              leftIcon={<IconFolderPlus size={18} aria-hidden="true" />}
            >
              Nuevo proyecto
            </Button>
          </>
        }
      />

      <AdminFilters
        aria-label="Búsqueda y filtros"
        summary={
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-1.5">
              <strong className="text-sigasj-ink">
                {loading ? '…' : listado.total}
              </strong>
              <span>{listado.total === 1 ? 'proyecto' : 'proyectos'}</span>
            </span>
            {hasActiveFilters ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<IconFilterOff size={16} aria-hidden="true" />}
                onClick={clearFilters}
              >
                Limpiar filtros
              </Button>
            ) : null}
          </div>
        }
      >
        <AdminFilterField label="Buscar por nombre" className="sm:col-span-2">
          <span className="relative block">
            <IconSearch
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sigasj-muted"
              size={17}
              aria-hidden="true"
            />
            <input
              id={NOMBRE_SEARCH_INPUT_ID}
              name="nombre"
              type="search"
              className={`${adminFilterControlClassName} pl-9`}
              maxLength={200}
              value={nombreInput}
              onChange={(event) => setNombreInput(event.target.value)}
              placeholder="Ej. acueducto, tanque…"
            />
          </span>
        </AdminFilterField>
        <AdminFilterField label="Estado">
          <select
            id={ESTADO_FILTER_ID}
            name="estado"
            className={adminFilterControlClassName}
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
        </AdminFilterField>
        <AdminFilterField label="Visibilidad">
          <select
            id={ACTIVO_FILTER_ID}
            name="activo"
            className={adminFilterControlClassName}
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
        </AdminFilterField>
      </AdminFilters>

      {actionError ? (
        <Alert tone="danger" role="alert">
          {actionError}{' '}
          <button
            type="button"
            className="ml-1 font-semibold underline"
            onClick={() => setActionError(null)}
          >
            Cerrar
          </button>
        </Alert>
      ) : null}

      <section aria-label="Listado de proyectos" className="min-w-0">
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
    </AdminShell>
  )
}

export default ProyectosAdminPage