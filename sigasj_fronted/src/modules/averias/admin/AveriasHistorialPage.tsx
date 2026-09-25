import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { useAdminAveriasHistorial } from '../hooks/useAdminAveriasHistorial'
import { getAdminAveriaFontaneros } from '../services/averiasAdminApi'
import AveriasAdminPagination from './AveriasAdminPagination'
import AveriasAdminQueryStates from './AveriasAdminQueryStates'
import AveriasHistorialFilters from './AveriasHistorialFilters'
import AveriasHistorialTable from './AveriasHistorialTable'
import { AVERIAS_ADMIN_PATH } from './averiasAdminPaths'
import {
  buildAveriasHistorialSearch,
  historialRangoFechasInvalido,
  parseAveriasHistorialSearch,
  type AveriasHistorialSearch,
} from './averiasHistorialSearch'
import { toBackendPrioridad } from './averiasAdminListSearch'
import {
  AVERIAS_HISTORIAL_EMPTY_MESSAGE,
  AVERIAS_HISTORIAL_LOAD_ERROR,
  AVERIAS_HISTORIAL_LOADING_MESSAGE,
  AVERIAS_HISTORIAL_RANGE_ERROR,
  DEFAULT_AVERIAS_LIMIT,
  DEFAULT_AVERIAS_PAGE,
  EMPTY_FILTER,
  type AveriaFontaneroAsignable,
  type AveriaHistorialItem,
} from './types'

const TEXT_DEBOUNCE_MS = 400

export type AveriasHistorialPageProps = {
  items?: AveriaHistorialItem[]
  loading?: boolean
  error?: string | boolean | null
  page?: number
  total?: number
  totalPages?: number
  fontaneros?: AveriaFontaneroAsignable[]
  onRetry?: () => void
}

const AveriasHistorialPage = ({
  items,
  loading: loadingProp,
  error: errorProp,
  page: pageProp,
  total,
  totalPages,
  fontaneros: fontanerosProp,
  onRetry,
}: AveriasHistorialPageProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const parsed = parseAveriasHistorialSearch(searchParams.toString())
  const [codigoInput, setCodigoInput] = useState(parsed.codigoSeguimiento)
  const [sectorInput, setSectorInput] = useState(parsed.sector)
  const [urlCodigo, setUrlCodigo] = useState(parsed.codigoSeguimiento)
  const [urlSector, setUrlSector] = useState(parsed.sector)
  const appliedCodigoRef = useRef(parsed.codigoSeguimiento)
  const appliedSectorRef = useRef(parsed.sector)
  const filtersRef = useRef(parsed)
  const [fontaneros, setFontaneros] = useState<AveriaFontaneroAsignable[]>(
    fontanerosProp ?? [],
  )

  if (parsed.codigoSeguimiento !== urlCodigo) {
    setUrlCodigo(parsed.codigoSeguimiento)
    setCodigoInput(parsed.codigoSeguimiento)
  }

  if (parsed.sector !== urlSector) {
    setUrlSector(parsed.sector)
    setSectorInput(parsed.sector)
  }

  const page = pageProp ?? parsed.page
  const rangoInvalido = historialRangoFechasInvalido(parsed.fechaDesde, parsed.fechaHasta)

  const replaceSearch = useCallback(
    (next: AveriasHistorialSearch) => {
      const nextSearch = buildAveriasHistorialSearch(next)
      setSearchParams(
        new URLSearchParams(nextSearch.startsWith('?') ? nextSearch.slice(1) : nextSearch),
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const applyCodigo = useCallback(
    (value: string) => {
      const nextCodigo = value.trim()
      if (appliedCodigoRef.current === nextCodigo) {
        return
      }
      appliedCodigoRef.current = nextCodigo
      replaceSearch({
        ...filtersRef.current,
        page: DEFAULT_AVERIAS_PAGE,
        codigoSeguimiento: nextCodigo,
      })
    },
    [replaceSearch],
  )

  const applySector = useCallback(
    (value: string) => {
      const nextSector = value.trim()
      if (appliedSectorRef.current === nextSector) {
        return
      }
      appliedSectorRef.current = nextSector
      replaceSearch({
        ...filtersRef.current,
        page: DEFAULT_AVERIAS_PAGE,
        sector: nextSector,
      })
    },
    [replaceSearch],
  )

  useEffect(() => {
    filtersRef.current = {
      page: parsed.page,
      codigoSeguimiento: parsed.codigoSeguimiento,
      estado: parsed.estado,
      prioridad: parsed.prioridad,
      tipo: parsed.tipo,
      fontaneroId: parsed.fontaneroId,
      sector: parsed.sector,
      fechaDesde: parsed.fechaDesde,
      fechaHasta: parsed.fechaHasta,
    }
    appliedCodigoRef.current = parsed.codigoSeguimiento
    appliedSectorRef.current = parsed.sector
  }, [
    parsed.page,
    parsed.codigoSeguimiento,
    parsed.estado,
    parsed.prioridad,
    parsed.tipo,
    parsed.fontaneroId,
    parsed.sector,
    parsed.fechaDesde,
    parsed.fechaHasta,
  ])

  useEffect(() => {
    const timeout = window.setTimeout(() => applyCodigo(codigoInput), TEXT_DEBOUNCE_MS)
    return () => window.clearTimeout(timeout)
  }, [applyCodigo, codigoInput])

  useEffect(() => {
    const timeout = window.setTimeout(() => applySector(sectorInput), TEXT_DEBOUNCE_MS)
    return () => window.clearTimeout(timeout)
  }, [applySector, sectorInput])

  useEffect(() => {
    if (fontanerosProp) {
      return
    }

    const controller = new AbortController()
    void getAdminAveriaFontaneros(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setFontaneros(result.data)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFontaneros([])
        }
      })

    return () => controller.abort()
  }, [fontanerosProp])

  const remoteEnabled = items === undefined && !rangoInvalido
  const fontaneroId = parsed.fontaneroId ? Number(parsed.fontaneroId) : undefined
  const remote = useAdminAveriasHistorial(
    {
      page,
      limit: DEFAULT_AVERIAS_LIMIT,
      codigoSeguimiento: parsed.codigoSeguimiento || undefined,
      estado: parsed.estado || undefined,
      prioridad: toBackendPrioridad(parsed.prioridad),
      tipo: parsed.tipo || undefined,
      fontaneroId,
      sector: parsed.sector || undefined,
      fechaDesde: parsed.fechaDesde || undefined,
      fechaHasta: parsed.fechaHasta || undefined,
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
  const isLoading = loadingProp ?? (rangoInvalido ? false : remote.loading)
  const errorMessage = rangoInvalido
    ? AVERIAS_HISTORIAL_RANGE_ERROR
    : errorProp === undefined
      ? remote.error
      : errorProp
        ? (remote.error ?? AVERIAS_HISTORIAL_LOAD_ERROR)
        : null
  const listTotal = total ?? remote.listado.total
  const listTotalPages = totalPages ?? remote.listado.totalPages
  const fontaneroOptions = fontanerosProp ?? fontaneros

  const hasActiveFilters =
    Boolean(codigoInput.trim()) ||
    Boolean(sectorInput.trim()) ||
    parsed.estado !== EMPTY_FILTER ||
    parsed.prioridad !== EMPTY_FILTER ||
    parsed.tipo !== EMPTY_FILTER ||
    parsed.fontaneroId !== EMPTY_FILTER ||
    parsed.fechaDesde !== EMPTY_FILTER ||
    parsed.fechaHasta !== EMPTY_FILTER

  const patchFilters = (patch: Partial<AveriasHistorialSearch>) => {
    filtersRef.current = { ...filtersRef.current, ...patch }
    replaceSearch({
      ...filtersRef.current,
      page: DEFAULT_AVERIAS_PAGE,
      ...patch,
    })
  }

  const goToPage = (nextPage: number) => {
    replaceSearch({
      ...filtersRef.current,
      page: nextPage,
    })
  }

  const clearFilters = () => {
    appliedCodigoRef.current = ''
    appliedSectorRef.current = ''
    setCodigoInput('')
    setSectorInput('')
    replaceSearch({
      page: DEFAULT_AVERIAS_PAGE,
      codigoSeguimiento: '',
      estado: EMPTY_FILTER,
      prioridad: EMPTY_FILTER,
      tipo: EMPTY_FILTER,
      fontaneroId: EMPTY_FILTER,
      sector: '',
      fechaDesde: EMPTY_FILTER,
      fechaHasta: EMPTY_FILTER,
    })
  }

  return (
    <main className="gallery-admin averias-admin w-full min-w-0">
      <div className="gallery-admin__shell sigasj-stack">
        <header className="gallery-admin__header">
          <div>
            <p className="gallery-admin__eyebrow">Panel administrativo</p>
            <h1>Historial de averías</h1>
            <p>
              Consulte averías actuales y resueltas. Esta vista no modifica los casos.
            </p>
          </div>
          <div className="gallery-admin__header-actions">
            <Link className="gallery-admin__button" to={AVERIAS_ADMIN_PATH}>
              Volver a gestión
            </Link>
          </div>
        </header>

        <AveriasHistorialFilters
          codigoSeguimiento={codigoInput}
          estado={parsed.estado}
          prioridad={parsed.prioridad}
          tipo={parsed.tipo}
          fontaneroId={parsed.fontaneroId}
          sector={sectorInput}
          fechaDesde={parsed.fechaDesde}
          fechaHasta={parsed.fechaHasta}
          fontaneros={fontaneroOptions}
          onCodigoChange={setCodigoInput}
          onEstadoChange={(value) => patchFilters({ estado: value })}
          onPrioridadChange={(value) => patchFilters({ prioridad: value })}
          onTipoChange={(value) => patchFilters({ tipo: value })}
          onFontaneroChange={(value) => patchFilters({ fontaneroId: value })}
          onSectorChange={setSectorInput}
          onFechaDesdeChange={(value) => patchFilters({ fechaDesde: value })}
          onFechaHastaChange={(value) => patchFilters({ fechaHasta: value })}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <section aria-label="Historial de averías">
          <AveriasAdminQueryStates
            loading={isLoading}
            error={errorMessage}
            hasResults={listItems.length > 0}
            loadingMessage={AVERIAS_HISTORIAL_LOADING_MESSAGE}
            emptyMessage={AVERIAS_HISTORIAL_EMPTY_MESSAGE}
            onRetry={rangoInvalido ? undefined : (onRetry ?? remote.refetch)}
          >
            <AveriasHistorialTable items={listItems} />
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
      </div>
    </main>
  )
}

export default AveriasHistorialPage
