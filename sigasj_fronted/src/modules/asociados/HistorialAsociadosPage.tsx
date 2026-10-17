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
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
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

const inputClass = 'min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

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

  return <main className="grid w-full min-w-0 gap-5 sm:gap-6">
    <Link to={ASOCIADOS_PATH} className="group inline-flex min-h-11 w-fit items-center gap-2.5 rounded-2xl border border-blue-200 bg-white px-4 py-2.5 font-extrabold text-blue-700 no-underline shadow-[0_6px_18px_rgba(37,99,235,0.1)] transition hover:-translate-y-0.5 hover:bg-blue-50 hover:no-underline"><IconArrowLeft className="transition-transform group-hover:-translate-x-1" size={19} />Volver a Gestión de asociados</Link>

    <header className="flex flex-col gap-5 rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8 lg:flex-row lg:items-center lg:justify-between">
      <div><p className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">Administración · Asociados</p><h1 className="m-0 text-3xl font-black tracking-tight text-[#062e63] sm:text-4xl">Historial de asociados</h1><p className="mt-3 max-w-3xl text-base leading-7 text-slate-500 sm:text-lg">Consulte asociados actuales y anteriores, sus fechas y su estado. Esta pantalla es de solo lectura.</p></div>
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-[0_10px_24px_rgba(79,70,229,0.28)]"><IconHistory size={28} /></span>
    </header>

    <form onSubmit={applyFilters} className="grid gap-5 rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-6" aria-label="Filtros del historial">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-end">
        <label className="grid min-w-0 gap-2 md:col-span-2 xl:col-span-1">
          <span className="text-sm font-bold text-[#163f6b]">Buscar asociado</span>
          <span className="relative">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
            <input type="search" className={`${inputClass} pl-11`} placeholder="Nombre, apellidos o cédula" value={draft.search} onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))} />
          </span>
        </label>
        <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-0 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-6 py-3.5 font-extrabold text-white shadow-[0_11px_26px_rgba(37,99,235,0.3)] transition hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(37,99,235,0.35)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 motion-reduce:transform-none"><IconSearch size={20} aria-hidden="true" />Aplicar filtros</button>
        <button type="button" onClick={clearFilters} disabled={!hasFilters && !draft.search} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-extrabold text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"><IconFilterOff size={20} aria-hidden="true" />Limpiar filtros</button>
      </div>

      <div className="grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-2 xl:grid-cols-3">
        <label className="grid gap-2"><span className="text-sm font-bold text-[#163f6b]">Registro desde</span><input type="date" className={inputClass} value={draft.fechaRegistroDesde} onChange={(event) => setDraft((current) => ({ ...current, fechaRegistroDesde: event.target.value }))} /></label>
        <label className="grid gap-2"><span className="text-sm font-bold text-[#163f6b]">Registro hasta</span><input type="date" className={inputClass} value={draft.fechaRegistroHasta} onChange={(event) => setDraft((current) => ({ ...current, fechaRegistroHasta: event.target.value }))} /></label>
        <label className="grid gap-2"><span className="text-sm font-bold text-[#163f6b]">Estado</span><select className={inputClass} value={draft.estado} onChange={(event) => setDraft((current) => ({ ...current, estado: event.target.value as HistorialEstadoFiltro }))}><option value="todos">Todos</option><option value="activo">Activos</option><option value="inactivo">Inactivos</option></select></label>
        <label className="grid gap-2"><span className="text-sm font-bold text-[#163f6b]">Inactivación desde</span><input type="date" className={inputClass} value={draft.fechaInactivacionDesde} onChange={(event) => setDraft((current) => ({ ...current, fechaInactivacionDesde: event.target.value }))} /></label>
        <label className="grid gap-2"><span className="text-sm font-bold text-[#163f6b]">Inactivación hasta</span><input type="date" className={inputClass} value={draft.fechaInactivacionHasta} onChange={(event) => setDraft((current) => ({ ...current, fechaInactivacionHasta: event.target.value }))} /></label>
        <label className="grid gap-2"><span className="text-sm font-bold text-[#163f6b]">Orden alfabético</span><select className={inputClass} value={draft.orden} onChange={(event) => setDraft((current) => ({ ...current, orden: event.target.value as HistorialOrden }))}><option value="ASC">A–Z</option><option value="DESC">Z–A</option></select></label>
      </div>
    </form>

    <section className="min-w-0 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl" aria-busy={loading} aria-label="Historial de asociados">
      {loading && !listado ? <div className="grid gap-3 p-6" role="status"><span className="sr-only">Cargando historial…</span>{[0, 1, 2].map((row) => <div key={row} className="h-16 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />)}</div>
      : error ? <div className="grid place-items-center gap-4 p-10 text-center" role="alert"><p className="m-0 font-semibold text-red-700">{error}</p>{result.retryable ? <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 font-bold text-blue-800" onClick={() => setReload((value) => value + 1)}><IconRefresh size={18} />Reintentar</button> : null}</div>
      : rows.length === 0 ? <div className="grid place-items-center gap-3 p-10 text-center"><span className="grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-700"><IconHistory size={28} /></span><h2 className="m-0 text-lg font-extrabold text-[#073b73]">{hasFilters ? 'Sin resultados' : 'Historial vacío'}</h2><p className="m-0 max-w-md text-slate-500">{hasFilters ? 'Ningún asociado coincide con los filtros aplicados.' : 'Todavía no existen asociados para mostrar en el historial.'}</p></div>
      : <table className={`w-full border-collapse text-left transition-opacity ${loading ? 'opacity-60' : ''}`}><thead className="hidden bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-500 xl:table-header-group"><tr><th className="px-5 py-4">Asociado</th><th className="px-5 py-4">Cédula</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Registro</th><th className="px-5 py-4">Inactivación</th><th className="px-5 py-4 text-right">Acción</th></tr></thead><tbody className="block divide-y divide-slate-100 xl:table-row-group">{rows.map((asociado) => <tr key={asociado.id} className="grid gap-2 px-5 py-5 transition-colors hover:bg-sky-50/50 xl:table-row xl:p-0"><td className="flex items-center justify-between gap-3 xl:table-cell xl:px-5 xl:py-4"><span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Asociado</span><span className="min-w-0 text-right xl:text-left"><strong className="block text-[#073b73]">{nombreCompleto(asociado)}</strong><span className="block truncate text-sm text-slate-500">{asociado.correoElectronico}</span></span></td><td className="flex justify-between gap-3 xl:table-cell xl:px-5 xl:py-4"><span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Cédula</span><span className="font-mono text-sm font-semibold text-slate-700">{asociado.cedula}</span></td><td className="flex items-center justify-between gap-3 xl:table-cell xl:px-5 xl:py-4"><span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Estado</span><EstadoAsociadoBadge activo={asociado.activo} /></td><td className="flex justify-between gap-3 xl:table-cell xl:px-5 xl:py-4"><span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Registro</span><span className="font-semibold text-slate-700">{formatearFecha(asociado.fechaRegistro)}</span></td><td className="flex justify-between gap-3 xl:table-cell xl:px-5 xl:py-4"><span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Inactivación</span><span className="font-semibold text-slate-700">{formatearFecha(asociado.fechaInactivacion)}</span></td><td className="pt-2 xl:table-cell xl:px-5 xl:py-4"><div className="flex xl:justify-end"><Link to={asociadoDetailPath(asociado.id)} state={{ from: `${location.pathname}${location.search}` }} className="group inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700 no-underline shadow-[0_5px_14px_rgba(37,99,235,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500 hover:from-blue-600 hover:to-sky-500 hover:text-white hover:no-underline hover:shadow-[0_9px_20px_rgba(37,99,235,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none" aria-label={`Ver detalle de ${nombreCompleto(asociado)}`}><IconEye className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none" size={17} aria-hidden="true" />Ver detalle</Link></div></td></tr>)}</tbody></table>}
      {!error && total > 0 ? <nav className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row" aria-label="Paginación del historial"><p className="m-0">Mostrando {from}–{to} de {total}</p><div className="flex items-center gap-2"><button type="button" className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-600 disabled:opacity-40" disabled={filters.page <= 1 || loading} onClick={() => changePage(filters.page - 1)}><IconChevronLeft size={17} />Anterior</button><span className="px-2 font-semibold">Página {filters.page} de {Math.max(totalPages, 1)}</span><button type="button" className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-600 disabled:opacity-40" disabled={filters.page >= totalPages || loading} onClick={() => changePage(filters.page + 1)}>Siguiente<IconChevronRight size={17} /></button></div></nav> : null}
    </section>
  </main>
}
