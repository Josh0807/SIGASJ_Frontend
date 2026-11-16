import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { IconChartBar, IconHistory, IconTool } from '@tabler/icons-react'
import { AdminShell, Button, PageHeader } from '../../../shared/ui'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { useAdminAverias } from '../hooks/useAdminAverias'
import AveriasAdminFilters from './AveriasAdminFilters'
import {
  AVERIAS_ADMIN_HISTORIAL_PATH,
  AVERIAS_ADMIN_REPORTE_PATH,
} from './averiasAdminPaths'
import AveriasAdminPagination from './AveriasAdminPagination'
import AveriasAdminQueryStates from './AveriasAdminQueryStates'
import AveriasAdminTable from './AveriasAdminTable'
import {
  buildAveriasAdminListSearch,
  parseAveriasAdminListSearch,
  toBackendPrioridad,
  type AveriasAdminListSearch,
} from './averiasAdminListSearch'
import {
  AVERIAS_ADMIN_LOAD_ERROR,
  DEFAULT_AVERIAS_LIMIT,
  DEFAULT_AVERIAS_PAGE,
  EMPTY_FILTER,
  type AveriaListItem,
} from './types'

const SEARCH_DEBOUNCE_MS = 400

export type AveriasAdminPageProps = {
  items?: AveriaListItem[]
  loading?: boolean
  error?: string | boolean | null
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  onViewDetail?: (id: number) => void
  onPageChange?: (page: number) => void
  onRetry?: () => void
}

const AveriasAdminPage = ({
  items,
  loading: loadingProp,
  error: errorProp,
  page: pageProp,
  limit = DEFAULT_AVERIAS_LIMIT,
  total,
  totalPages,
  onViewDetail,
  onPageChange,
  onRetry,
}: AveriasAdminPageProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const parsed = parseAveriasAdminListSearch(searchParams.toString())
  const [searchInput, setSearchInput] = useState(parsed.search)
  const [urlSearch, setUrlSearch] = useState(parsed.search)
  const appliedSearchRef = useRef(parsed.search)
  const filtersRef = useRef(parsed)

  if (parsed.search !== urlSearch) {
    setUrlSearch(parsed.search)
    setSearchInput(parsed.search)
  }

  const page = pageProp ?? parsed.page
  const search = parsed.search
  const estado = parsed.estado
  const prioridad = parsed.prioridad
  const fechaDesde = parsed.fechaDesde
  const fechaHasta = parsed.fechaHasta

  const replaceListSearch = useCallback(
    (next: AveriasAdminListSearch) => {
      const nextSearch = buildAveriasAdminListSearch(next)
      setSearchParams(
        new URLSearchParams(nextSearch.startsWith('?') ? nextSearch.slice(1) : nextSearch),
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const applySearch = useCallback(
    (value: string) => {
      const nextSearch = value.trim()
      if (appliedSearchRef.current === nextSearch) {
        return
      }

      appliedSearchRef.current = nextSearch
      replaceListSearch({
        ...filtersRef.current,
        page: DEFAULT_AVERIAS_PAGE,
        search: nextSearch,
      })
    },
    [replaceListSearch],
  )

  useEffect(() => {
    filtersRef.current = {
      page: parsed.page,
      search: parsed.search,
      estado: parsed.estado,
      prioridad: parsed.prioridad,
      fechaDesde: parsed.fechaDesde,
      fechaHasta: parsed.fechaHasta,
    }
    appliedSearchRef.current = parsed.search
  }, [
    parsed.page,
    parsed.search,
    parsed.estado,
    parsed.prioridad,
    parsed.fechaDesde,
    parsed.fechaHasta,
  ])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      applySearch(searchInput)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [applySearch, searchInput])

  // Con el rango invertido el servidor responde 400; no se consulta hasta corregirlo.
  const rangoFechasInvalido = Boolean(fechaDesde && fechaHasta && fechaDesde > fechaHasta)
  const remoteEnabled = items === undefined && !rangoFechasInvalido
  const remote = useAdminAverias(
    {
      page,
      limit,
      search: search || undefined,
      estado: estado || undefined,
      prioridad: toBackendPrioridad(prioridad),
      fechaDesde: fechaDesde || undefined,
      fechaHasta: fechaHasta || undefined,
    },
    { enabled: remoteEnabled },
  )

  if (remote.unauthorized) {
    return <Navigate to={LOGIN_ROUTE_PATH} replace />
  }

  if (remote.forbidden) {
    return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  }

  const listItems = items ?? remote.listado.data
  const isLoading = loadingProp ?? remote.loading
  const errorMessage =
    errorProp === undefined
      ? remote.error
      : errorProp
        ? (remote.error ?? AVERIAS_ADMIN_LOAD_ERROR)
        : null
  const listTotal = total ?? remote.listado.total
  const listTotalPages = totalPages ?? remote.listado.totalPages

  const hasActiveFilters =
    Boolean(searchInput.trim()) ||
    estado !== EMPTY_FILTER ||
    prioridad !== EMPTY_FILTER ||
    fechaDesde !== EMPTY_FILTER ||
    fechaHasta !== EMPTY_FILTER

  const patchFilters = (patch: Partial<AveriasAdminListSearch>) => {
    filtersRef.current = { ...filtersRef.current, ...patch }
    replaceListSearch({
      ...filtersRef.current,
      page: DEFAULT_AVERIAS_PAGE,
      ...patch,
    })
  }

  const goToPage = (nextPage: number) => {
    replaceListSearch({
      ...filtersRef.current,
      page: nextPage,
    })
    onPageChange?.(nextPage)
  }

  const clearFilters = () => {
    appliedSearchRef.current = ''
    setSearchInput('')
    replaceListSearch({
      page: DEFAULT_AVERIAS_PAGE,
      search: '',
      estado: EMPTY_FILTER,
      prioridad: EMPTY_FILTER,
      fechaDesde: EMPTY_FILTER,
      fechaHasta: EMPTY_FILTER,
    })
  }

  const showPagination =
    !(isLoading && listItems.length === 0) && !errorMessage

  return (
    <AdminShell
      className="averias-admin min-w-0"
      aria-labelledby="averias-admin-title"
    >
      <PageHeader
        id="averias-admin-title"
        eyebrow="Operación"
        title={
          <span className="inline-flex items-center gap-2">
            <IconTool size={22} aria-hidden="true" />
            Gestión de averías
          </span>
        }
        description="Revise reportes, asigne fontaneros y dé seguimiento hasta la resolución."
        actions={
          <>
            <Button
              to={AVERIAS_ADMIN_HISTORIAL_PATH}
              variant="secondary"
              leftIcon={<IconHistory size={18} aria-hidden="true" />}
            >
              Historial
            </Button>
            <Button
              to={AVERIAS_ADMIN_REPORTE_PATH}
              variant="primary"
              leftIcon={<IconChartBar size={18} aria-hidden="true" />}
            >
              Resumen
            </Button>
          </>
        }
      />

      <AveriasAdminFilters
        search={searchInput}
        estado={estado}
        prioridad={prioridad}
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        total={listTotal}
        loading={isLoading}
        onSearchChange={setSearchInput}
        onEstadoChange={(value) => patchFilters({ estado: value })}
        onPrioridadChange={(value) => patchFilters({ prioridad: value })}
        onFechaDesdeChange={(value) => patchFilters({ fechaDesde: value })}
        onFechaHastaChange={(value) => patchFilters({ fechaHasta: value })}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <section aria-label="Listado de averías" className="min-w-0">
        <AveriasAdminQueryStates
          loading={isLoading}
          error={errorMessage}
          hasResults={listItems.length > 0}
          onRetry={onRetry ?? remote.refetch}
        >
          <AveriasAdminTable
            items={listItems}
            onViewDetail={onViewDetail}
            footer={
              showPagination ? (
                <AveriasAdminPagination
                  page={page}
                  totalPages={listTotalPages}
                  total={listTotal}
                  limit={limit}
                  loading={isLoading}
                  onPageChange={goToPage}
                />
              ) : null
            }
          />
        </AveriasAdminQueryStates>
      </section>

      <p className="sr-only">
        Límite de página preparado: {limit} registros.
      </p>
    </AdminShell>
  )
}

export default AveriasAdminPage
