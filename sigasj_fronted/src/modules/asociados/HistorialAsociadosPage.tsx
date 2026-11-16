import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconFilterOff,
  IconHistory,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { ADMIN_COPY } from '../../shared/admin/adminCopy'
import {
  AdminFilterField,
  AdminFilters,
  AdminShell,
  Alert,
  Button,
  EmptyState,
  PageHeader,
  adminFilterControlClassName,
} from '../../shared/ui'
import { useAuth } from '../auth/components/AuthContext'
import { esNoAutenticado, esReintentable, formatearFecha, historialAsociadosError, nombreCompleto } from './asociadoForm'
import { ASOCIADOS_HISTORIAL_PAGE_SIZE, getHistorialAsociados } from './asociadosApi'
import { ASOCIADOS_PATH, asociadoDetailPath } from './asociadosPaths'
import EstadoAsociadoBadge from './EstadoAsociadoBadge'
import type { AsociadosListado, HistorialAsociadosFiltros, HistorialEstadoFiltro, HistorialOrden } from './types'

const EMPTY_FILTERS: HistorialAsociadosFiltros = {
  search: '', estado: 'todos', fechaRegistroDesde: '', fechaRegistroHasta: '',
  fechaInactivacionDesde: '', fechaInactivacionHasta: '', orden: 'ASC', page: 1,
}

const readFilters = (params: URLSearchParams): HistorialAsociadosFiltros => {
  const page = Number(params.get('page'))
  const estado = params.get('estado')
  const orden = params.get('orden')
  return {
    search: params.get('search') ?? '',
    estado: estado === 'activo' || estado === 'inactivo' ? estado : 'todos',
    fechaRegistroDesde: params.get('fechaRegistroDesde') ?? '',
    fechaRegistroHasta: params.get('fechaRegistroHasta') ?? '',
    fechaInactivacionDesde: params.get('fechaInactivacionDesde') ?? '',
    fechaInactivacionHasta: params.get('fechaInactivacionHasta') ?? '',
    orden: orden === 'DESC' ? 'DESC' : 'ASC',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

export default function HistorialAsociadosPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = readFilters(searchParams)
  const [draft, setDraft] = useState(filters)
  const [listado, setListado] = useState<AsociadosListado | null>(null)
  const [result, setResult] = useState({ key: '', error: null as string | null, retryable: true })
  const [reload, setReload] = useState(0)

  const leaveForLogin = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  const writeFilters = useCallback((next: HistorialAsociadosFiltros) => {
    const params = new URLSearchParams()
    Object.entries(next).forEach(([key, value]) => {
      if (value !== '' && value !== 'todos' && !(key === 'orden' && value === 'ASC') && !(key === 'page' && value === 1)) {
        params.set(key, String(value))
      }
    })
    setSearchParams(params, { replace: true })
  }, [setSearchParams])

  const { search, estado, fechaRegistroDesde, fechaRegistroHasta, fechaInactivacionDesde, fechaInactivacionHasta, orden, page } = filters
  const key = JSON.stringify([search, estado, fechaRegistroDesde, fechaRegistroHasta, fechaInactivacionDesde, fechaInactivacionHasta, orden, page, reload])
  const loading = result.key !== key
  const error = loading ? null : result.error

  useEffect(() => {
    const controller = new AbortController()
    getHistorialAsociados({ search, estado, fechaRegistroDesde, fechaRegistroHasta, fechaInactivacionDesde, fechaInactivacionHasta, orden, page }, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return
        setListado(response)
        setResult({ key, error: null, retryable: true })
        if (response.totalPages > 0 && page > response.totalPages) {
          const next = { search, estado, fechaRegistroDesde, fechaRegistroHasta, fechaInactivacionDesde, fechaInactivacionHasta, orden, page: response.totalPages }
          setDraft(next)
          writeFilters(next)
        }
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return
        if (esNoAutenticado(caught)) return leaveForLogin()
        setResult({
          key,
          error: historialAsociadosError(caught),
          retryable: esReintentable(caught),
        })
      })
    return () => controller.abort()
  }, [fechaInactivacionDesde, fechaInactivacionHasta, fechaRegistroDesde, fechaRegistroHasta, key, leaveForLogin, orden, page, search, estado, writeFilters])

  const applyFilters = (event: FormEvent) => {
    event.preventDefault()
    const next = { ...draft, search: draft.search.trim(), page: 1 }
    setDraft(next)
    writeFilters(next)
  }

  const clearFilters = () => {
    setDraft(EMPTY_FILTERS)
    writeFilters(EMPTY_FILTERS)
  }

  const changePage = (page: number) => {
    const next = { ...filters, page }
    setDraft(next)
    writeFilters(next)
  }

  const rows = listado?.data ?? []
  const total = listado?.total ?? 0
  const totalPages = listado?.totalPages ?? 0
  const from = total ? (filters.page - 1) * ASOCIADOS_HISTORIAL_PAGE_SIZE + 1 : 0
  const to = Math.min(filters.page * ASOCIADOS_HISTORIAL_PAGE_SIZE, total)
  const hasFilters = Object.entries(filters).some(([keyName, value]) =>
    keyName !== 'page' && keyName !== 'orden' && value !== '' && value !== 'todos',
  ) || filters.orden !== 'ASC'

  return (
    <AdminShell aria-labelledby="historial-asociados-title" className="gap-5 sm:gap-6">
      <PageHeader
        id="historial-asociados-title"
        eyebrow="Administración · Asociados"
        title={
          <span className="inline-flex items-center gap-2">
            <IconHistory size={22} aria-hidden="true" />
            Historial de asociados
          </span>
        }
        description="Consulte asociados actuales y anteriores, sus fechas y su estado. Esta pantalla es de solo lectura."
        actions={
          <Button
            to={ASOCIADOS_PATH}
            variant="secondary"
            leftIcon={<IconArrowLeft size={17} aria-hidden="true" />}
          >
            {ADMIN_COPY.backToList}
          </Button>
        }
      />

      <form onSubmit={applyFilters} aria-label="Filtros del historial">
        <AdminFilters
          summary={
            <>
              <strong className="text-sigasj-ink">{loading ? '…' : total}</strong>
              <span>registros</span>
            </>
          }
        >
          <AdminFilterField label="Buscar asociado" className="md:col-span-2 xl:col-span-1">
            <span className="relative block">
              <IconSearch
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sigasj-muted"
                size={17}
                aria-hidden="true"
              />
              <input
                type="search"
                className={`${adminFilterControlClassName} pl-9`}
                placeholder="Nombre, apellidos o cédula"
                value={draft.search}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, search: event.target.value }))
                }
              />
            </span>
          </AdminFilterField>
          <Button type="submit" variant="primary" leftIcon={<IconSearch size={17} aria-hidden="true" />}>
            Aplicar filtros
          </Button>
          <Button
            type="button"
            variant="secondary"
            leftIcon={<IconFilterOff size={17} aria-hidden="true" />}
            onClick={clearFilters}
            disabled={!hasFilters && !draft.search}
          >
            Limpiar filtros
          </Button>
        </AdminFilters>

        <div className="mt-4 grid gap-4 rounded-[var(--radius-asada)] border border-sigasj-border bg-sigasj-surface p-5 md:grid-cols-2 xl:grid-cols-3">
          <AdminFilterField label="Registro desde">
            <input
              type="date"
              className={adminFilterControlClassName}
              value={draft.fechaRegistroDesde}
              onChange={(event) =>
                setDraft((current) => ({ ...current, fechaRegistroDesde: event.target.value }))
              }
            />
          </AdminFilterField>
          <AdminFilterField label="Registro hasta">
            <input
              type="date"
              className={adminFilterControlClassName}
              value={draft.fechaRegistroHasta}
              onChange={(event) =>
                setDraft((current) => ({ ...current, fechaRegistroHasta: event.target.value }))
              }
            />
          </AdminFilterField>
          <AdminFilterField label="Estado">
            <select
              className={adminFilterControlClassName}
              value={draft.estado}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  estado: event.target.value as HistorialEstadoFiltro,
                }))
              }
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </AdminFilterField>
          <AdminFilterField label="Inactivación desde">
            <input
              type="date"
              className={adminFilterControlClassName}
              value={draft.fechaInactivacionDesde}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fechaInactivacionDesde: event.target.value,
                }))
              }
            />
          </AdminFilterField>
          <AdminFilterField label="Inactivación hasta">
            <input
              type="date"
              className={adminFilterControlClassName}
              value={draft.fechaInactivacionHasta}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fechaInactivacionHasta: event.target.value,
                }))
              }
            />
          </AdminFilterField>
          <AdminFilterField label="Orden alfabético">
            <select
              className={adminFilterControlClassName}
              value={draft.orden}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  orden: event.target.value as HistorialOrden,
                }))
              }
            >
              <option value="ASC">A–Z</option>
              <option value="DESC">Z–A</option>
            </select>
          </AdminFilterField>
        </div>
      </form>

    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#d7e5f1] bg-white shadow-[0_12px_30px_rgba(30, 90, 156,0.07)] sm:rounded-3xl" aria-busy={loading} aria-label="Historial de asociados">
      {loading && !listado ? (
        <Alert tone="info">{ADMIN_COPY.loading('el historial')}</Alert>
      ) : error ? (
        <EmptyState
          title={error}
          actions={
            result.retryable ? (
              <Button
                type="button"
                variant="secondary"
                leftIcon={<IconRefresh size={17} aria-hidden="true" />}
                onClick={() => setReload((value) => value + 1)}
              >
                {ADMIN_COPY.retry}
              </Button>
            ) : undefined
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<IconHistory size={32} aria-hidden="true" />}
          title={
            hasFilters
              ? ADMIN_COPY.emptyFiltered('registros en el historial')
              : ADMIN_COPY.empty('registros en el historial')
          }
        />
      ) : (
        <table
          className={`w-full border-collapse text-left transition-opacity ${loading ? 'opacity-60' : ''}`}
        >
          <thead className="hidden bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-500 xl:table-header-group">
            <tr>
              <th className="px-5 py-4">Asociado</th>
              <th className="px-5 py-4">Cédula</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Registro</th>
              <th className="px-5 py-4">Inactivación</th>
              <th className="px-5 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="block divide-y divide-slate-100 xl:table-row-group">
            {rows.map((asociado) => (
              <tr
                key={asociado.id}
                className="grid gap-2 px-5 py-5 transition-colors hover:bg-sky-50/50 xl:table-row xl:p-0"
              >
                <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-5 xl:py-4">
                  <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">
                    Asociado
                  </span>
                  <span className="min-w-0 text-right xl:text-left">
                    <strong className="block text-[#073b73]">
                      {nombreCompleto(asociado)}
                    </strong>
                    <span className="block truncate text-sm text-slate-500">
                      {asociado.correoElectronico}
                    </span>
                  </span>
                </td>
                <td className="flex justify-between gap-3 xl:table-cell xl:px-5 xl:py-4">
                  <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">
                    Cédula
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-700">
                    {asociado.cedula}
                  </span>
                </td>
                <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-5 xl:py-4">
                  <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">
                    Estado
                  </span>
                  <EstadoAsociadoBadge activo={asociado.activo} />
                </td>
                <td className="flex justify-between gap-3 xl:table-cell xl:px-5 xl:py-4">
                  <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">
                    Registro
                  </span>
                  <span className="font-semibold text-slate-700">
                    {formatearFecha(asociado.fechaRegistro)}
                  </span>
                </td>
                <td className="flex justify-between gap-3 xl:table-cell xl:px-5 xl:py-4">
                  <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">
                    Inactivación
                  </span>
                  <span className="font-semibold text-slate-700">
                    {formatearFecha(asociado.fechaInactivacion)}
                  </span>
                </td>
                <td className="pt-2 xl:table-cell xl:px-5 xl:py-4">
                  <div className="flex xl:justify-end">
                    <Button
                      to={asociadoDetailPath(asociado.id)}
                      state={{ from: `${location.pathname}${location.search}` }}
                      variant="secondary"
                      size="sm"
                      leftIcon={<IconEye size={16} aria-hidden="true" />}
                      aria-label={`Ver detalle de ${nombreCompleto(asociado)}`}
                    >
                      Ver detalle
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!error && total > 0 ? (
        <nav
          className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row"
          aria-label="Paginación del historial"
        >
          <p className="m-0">
            Mostrando {from}–{to} de {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<IconChevronLeft size={17} aria-hidden="true" />}
              disabled={filters.page <= 1 || loading}
              onClick={() => changePage(filters.page - 1)}
            >
              Anterior
            </Button>
            <span className="px-2 font-semibold">
              Página {filters.page} de {Math.max(totalPages, 1)}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              rightIcon={<IconChevronRight size={17} aria-hidden="true" />}
              disabled={filters.page >= totalPages || loading}
              onClick={() => changePage(filters.page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </nav>
      ) : null}
    </section>
    </AdminShell>
  )
}
