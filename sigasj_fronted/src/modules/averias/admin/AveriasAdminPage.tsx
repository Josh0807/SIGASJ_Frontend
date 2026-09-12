import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { useAdminAverias } from '../hooks/useAdminAverias'
import AveriasAdminFilters from './AveriasAdminFilters'
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
  const [tipoInput, setTipoInput] = useState(parsed.tipo)
  const [urlSearch, setUrlSearch] = useState(parsed.search)
  const [urlTipo, setUrlTipo] = useState(parsed.tipo)
  const appliedSearchRef = useRef(parsed.search)
  const appliedTipoRef = useRef(parsed.tipo)
  const filtersRef = useRef(parsed)

  if (parsed.search !== urlSearch) {
    setUrlSearch(parsed.search)
    setSearchInput(parsed.search)
  }

  if (parsed.tipo !== urlTipo) {
    setUrlTipo(parsed.tipo)
    setTipoInput(parsed.tipo)
  }

  const page = pageProp ?? parsed.page
  const search = parsed.search
  const estado = parsed.estado
  const prioridad = parsed.prioridad
  const tipo = parsed.tipo
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

  const applyTipo = useCallback(
    (value: string) => {
      const nextTipo = value.trim()
      if (appliedTipoRef.current === nextTipo) {
        return
      }

      appliedTipoRef.current = nextTipo
      replaceListSearch({
        ...filtersRef.current,
        page: DEFAULT_AVERIAS_PAGE,
        tipo: nextTipo,
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
      tipo: parsed.tipo,
      fechaDesde: parsed.fechaDesde,
      fechaHasta: parsed.fechaHasta,
    }
    appliedSearchRef.current = parsed.search
    appliedTipoRef.current = parsed.tipo
  }, [
    parsed.page,
    parsed.search,
    parsed.estado,
    parsed.prioridad,
    parsed.tipo,
    parsed.fechaDesde,
    parsed.fechaHasta,
  ])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      applySearch(searchInput)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [applySearch, searchInput])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      applyTipo(tipoInput)
    }, SEARCH_DEBOUNCE_MS)

    return () => window.clearTimeout(timeout)
  }, [applyTipo, tipoInput])

  const remoteEnabled = items === undefined
  const remote = useAdminAverias(
    {
      page,
      limit,
      search: search || undefined,
      estado: estado || undefined,
      prioridad: toBackendPrioridad(prioridad),
      tipo: tipo || undefined,
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
    Boolean(tipoInput.trim()) ||
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
    appliedTipoRef.current = ''
    setSearchInput('')
    setTipoInput('')
    replaceListSearch({
      page: DEFAULT_AVERIAS_PAGE,
      search: '',
      estado: EMPTY_FILTER,
      prioridad: EMPTY_FILTER,
      tipo: EMPTY_FILTER,
      fechaDesde: EMPTY_FILTER,
      fechaHasta: EMPTY_FILTER,
    })
  }

  return (
    <main className="gallery-admin averias-admin">
      <div className="gallery-admin__shell">
        <header className="gallery-admin__header">
          <div>
            <p className="gallery-admin__eyebrow">Panel administrativo</p>
            <h1>Gestión de averías</h1>
            <p>Consulte y dé seguimiento a las averías reportadas.</p>
          </div>
        </header>

        <AveriasAdminFilters
          search={searchInput}
          estado={estado}
          prioridad={prioridad}
          tipo={tipoInput}
          fechaDesde={fechaDesde}
          fechaHasta={fechaHasta}
          onSearchChange={setSearchInput}
          onEstadoChange={(value) => patchFilters({ estado: value })}
          onPrioridadChange={(value) => patchFilters({ prioridad: value })}
          onTipoChange={setTipoInput}
          onFechaDesdeChange={(value) => patchFilters({ fechaDesde: value })}
          onFechaHastaChange={(value) => patchFilters({ fechaHasta: value })}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <section aria-label="Listado de averías">
          <AveriasAdminQueryStates
            loading={isLoading}
            error={errorMessage}
            hasResults={listItems.length > 0}
            onRetry={onRetry ?? remote.refetch}
          >
            <AveriasAdminTable items={listItems} onViewDetail={onViewDetail} />
          </AveriasAdminQueryStates>
        </section>

        {isLoading && listItems.length === 0 ? null : errorMessage ? null : (
          <AveriasAdminPagination
            page={page}
            totalPages={listTotalPages}
            total={listTotal}
            loading={isLoading}
            onPageChange={goToPage}
          />
        )}

        <p className="visually-hidden">
          Límite de página preparado: {limit} registros.
        </p>
      </div>
    </main>
  )
}

export default AveriasAdminPage
