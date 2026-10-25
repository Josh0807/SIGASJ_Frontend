import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconFilterOff,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { formatearFechaHoraAsada } from '../../../shared/utils/fechaAsada'
import SolicitudEstadoBadge from './SolicitudEstadoBadge'
import {
  getSolicitudesAdmin,
  SOLICITUDES_ADMIN_PAGE_SIZE,
  solicitudesAdminError,
} from './solicitudesAdminApi'
import {
  SOLICITUDES_ADMIN_PATH,
  solicitudAdminDetailPath,
} from './solicitudesAdminPaths'
import {
  SOLICITUD_ESTADOS,
  type SolicitudesAdminFilters,
  type SolicitudesAdminList,
} from './types'
import { useSolicitudesAdminSecurity } from './useSolicitudesAdminSecurity'

const SEARCH_DELAY = 350
const TIPOS = [
  ['arreglo-pago', 'Arreglo de pago'],
  ['cambio-titular', 'Cambio de titular'],
  ['infraestructura-linderos', 'Infraestructura y linderos'],
  ['afiliacion', 'Afiliación'],
  ['disponibilidad-servicios', 'Disponibilidad de servicios'],
  ['constancia-servicio', 'Constancia de servicio'],
] as const

const readFilters = (params: URLSearchParams): SolicitudesAdminFilters => {
  const page = Number(params.get('page'))
  const estado = params.get('estado') ?? ''
  return {
    search: params.get('search') ?? '',
    estado: SOLICITUD_ESTADOS.includes(estado as (typeof SOLICITUD_ESTADOS)[number])
      ? estado
      : '',
    tipo: params.get('tipo') ?? '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

const applicantName = (row: {
  solicitante?: string
  detalleFormulario?: Record<string, unknown> | null
}) => {
  if (row.solicitante) return row.solicitante
  const detail = row.detalleFormulario ?? {}
  const candidates = [
    'nombreSolicitante',
    'nombre',
    'nombreNuevoTitular',
    'propietarioInmueble',
  ]
  const direct = candidates
    .map((key) => detail[key])
    .find((value) => typeof value === 'string' && value.trim())
  if (typeof direct === 'string') return direct
  const composed = [
    'nombreNuevoTitular',
    'primerApellidoNuevoTitular',
    'segundoApellidoNuevoTitular',
  ]
    .map((key) => detail[key])
    .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
    .join(' ')
  return composed || 'No disponible'
}

const inputClass =
  'min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

export default function SolicitudesAdminListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = readFilters(searchParams)
  const [search, setSearch] = useState(filters.search)
  const [result, setResult] = useState<SolicitudesAdminList | null>(null)
  const [request, setRequest] = useState({ key: '', error: '' })
  const [refresh, setRefresh] = useState(0)
  const handleSecurityError = useSolicitudesAdminSecurity()

  const updateFilters = useCallback(
    (changes: Partial<SolicitudesAdminFilters>) => {
      setSearchParams(
        (current) => {
          const next = { ...readFilters(current), page: 1, ...changes }
          const params = new URLSearchParams()
          if (next.search.trim()) params.set('search', next.search.trim())
          if (next.estado) params.set('estado', next.estado)
          if (next.tipo) params.set('tipo', next.tipo)
          if (next.page > 1) params.set('page', String(next.page))
          return params
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  useEffect(() => {
    if (search.trim() === filters.search.trim()) return
    const timer = window.setTimeout(() => updateFilters({ search }), SEARCH_DELAY)
    return () => window.clearTimeout(timer)
  }, [search, filters.search, updateFilters])

  const { estado, tipo, page } = filters
  const key = JSON.stringify([filters.search, estado, tipo, page, refresh])
  const loading = request.key !== key
  const error = loading ? '' : request.error

  useEffect(() => {
    const controller = new AbortController()
    getSolicitudesAdmin(
      { search: filters.search, estado, tipo, page },
      controller.signal,
    )
      .then((data) => {
        if (controller.signal.aborted) return
        setResult(data)
        setRequest({ key, error: '' })
        if (data.totalPages && page > data.totalPages) {
          updateFilters({ page: data.totalPages })
        }
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted || handleSecurityError(caught)) return
        setRequest({
          key,
          error: solicitudesAdminError(
            caught,
            'No fue posible cargar las solicitudes.',
          ),
        })
      })
    return () => controller.abort()
  }, [
    key,
    filters.search,
    estado,
    tipo,
    page,
    refresh,
    updateFilters,
    handleSecurityError,
  ])

  const hasFilters = Boolean(filters.search || estado || tipo)
  const rows = result?.data ?? []
  const total = result?.total ?? 0
  const totalPages = result?.totalPages ?? 0
  const from = total
    ? (page - 1) * (result?.limit ?? SOLICITUDES_ADMIN_PAGE_SIZE) + 1
    : 0
  const to = Math.min(page * (result?.limit ?? SOLICITUDES_ADMIN_PAGE_SIZE), total)

  return (
    <main className="admin-content-modern grid min-w-0 gap-5 sm:gap-6">
      <Link
        className="group inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 font-extrabold text-[#075fae] no-underline shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 motion-reduce:transform-none"
        to={SOLICITUDES_ADMIN_PATH}
      >
        <IconArrowLeft className="transition-transform group-hover:-translate-x-0.5 motion-reduce:transform-none" size={18} aria-hidden="true" />
        Volver a Gestión de solicitudes
      </Link>

      <header className="flex flex-col gap-5 rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-3 mt-0 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
            Administración · Solicitudes
          </p>
          <h1 className="m-0 text-3xl font-black tracking-tight text-[#062e63] sm:text-4xl">
            Trámites digitales
          </h1>
          <p className="mb-0 mt-3 max-w-2xl text-base leading-7 text-slate-500">
            Consulta, filtra y abre los trámites recibidos desde los formularios
            ciudadanos.
          </p>
        </div>
      </header>

      <section
        className="grid gap-4 rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:p-6 lg:grid-cols-[minmax(240px,2fr)_minmax(180px,1fr)_minmax(190px,1fr)_auto] lg:items-end"
        aria-label="Búsqueda y filtros"
      >
        <label className="grid gap-2">
          <span className="text-sm font-bold text-[#163f6b]">Buscar</span>
          <span className="relative">
            <IconSearch
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={19}
            />
            <input
              className={`${inputClass} pl-11`}
              type="search"
              value={search}
              placeholder="Código o solicitante"
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-[#163f6b]">Estado</span>
          <select
            className={inputClass}
            value={estado}
            onChange={(event) => updateFilters({ estado: event.target.value })}
          >
            <option value="">Todos los estados</option>
            {SOLICITUD_ESTADOS.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-[#163f6b]">Tipo de trámite</span>
          <select
            className={inputClass}
            value={tipo}
            onChange={(event) => updateFilters({ tipo: event.target.value })}
          >
            <option value="">Todos los trámites</option>
            {TIPOS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-600 disabled:opacity-40"
          type="button"
          disabled={!hasFilters}
          onClick={() => {
            setSearch('')
            updateFilters({ search: '', estado: '', tipo: '', page: 1 })
          }}
        >
          <IconFilterOff size={19} /> Limpiar
        </button>
      </section>

      <section
        className="overflow-hidden rounded-[28px] border border-sky-100/90 bg-white shadow-[0_18px_45px_rgba(30,90,156,0.10)]"
        aria-label="Listado de solicitudes"
      >
        {loading ? (
          <div className="grid min-h-64 place-items-center p-8" role="status">
            <span className="text-center font-bold text-[#315d87]">
              <span className="mx-auto mb-3 block size-9 animate-spin rounded-full border-4 border-sky-100 border-t-blue-600" />
              Cargando solicitudes…
            </span>
          </div>
        ) : error ? (
          <div className="grid min-h-64 place-items-center p-8 text-center" role="alert">
            <div>
              <p className="m-0 font-bold text-red-800">{error}</p>
              <button
                className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-0 bg-red-700 px-5 font-bold text-white"
                onClick={() => setRefresh((value) => value + 1)}
              >
                <IconRefresh size={18} /> Reintentar
              </button>
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <IconSearch className="mx-auto text-sky-300" size={42} />
              <h2 className="mb-0 mt-3 text-xl font-extrabold text-[#073b79]">
                No se encontraron solicitudes
              </h2>
              <p className="mb-0 mt-2 text-slate-500">
                Prueba con otros criterios de búsqueda o filtros.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left">
              <thead className="bg-[linear-gradient(180deg,#f1f8ff_0%,#eaf4fd_100%)] text-[0.72rem] font-black uppercase tracking-[0.09em] text-[#0a4d89]">
                <tr>
                  <th className="px-6 py-5">Código</th>
                  <th className="px-6 py-5">Tipo</th>
                  <th className="px-6 py-5">Solicitante</th>
                  <th className="px-6 py-5">Fecha</th>
                  <th className="px-6 py-5">Estado</th>
                  <th className="px-6 py-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr
                    className="group transition-colors duration-200 hover:bg-sky-50/70"
                    key={row.id}
                  >
                    <td className="px-6 py-5">
                      <span className="block whitespace-nowrap text-base font-black tracking-[0.01em] text-[#0561ad]">
                        {row.codigoSeguimiento}
                      </span>
                    </td>
                    <td className="max-w-[320px] px-6 py-5">
                      <span className="block text-[0.95rem] font-bold leading-6 text-[#123f70]">
                        {row.tipoSolicitud?.nombre ??
                          row.tipoSolicitud?.slug ??
                          'Sin tipo'}
                      </span>
                    </td>
                    <td className="max-w-[230px] px-6 py-5">
                      <span
                        className="block truncate text-[0.94rem] font-medium text-slate-600"
                        title={applicantName(row)}
                      >
                        {applicantName(row)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="whitespace-nowrap text-[0.92rem] font-medium tabular-nums text-slate-500">
                        {formatearFechaHoraAsada(row.fechaIngreso)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <SolicitudEstadoBadge estado={row.estado} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#0872d3] to-[#075fae] px-5 text-sm font-extrabold text-white no-underline shadow-[0_5px_12px_rgba(8,114,211,0.22)] transition duration-200 hover:-translate-y-0.5 hover:from-[#0767bd] hover:to-[#064f91] hover:shadow-[0_8px_18px_rgba(8,114,211,0.3)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 motion-reduce:transform-none"
                        to={solicitudAdminDetailPath(row.id)}
                      >
                        <IconEye size={18} stroke={2.3} /> Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && total > 0 ? (
          <nav
            className="flex flex-col items-center justify-between gap-4 border-t border-sky-100 bg-slate-50/40 px-6 py-5 text-sm text-slate-500 sm:flex-row"
            aria-label="Paginación de solicitudes"
          >
            <p className="m-0 font-medium">
              Mostrando{' '}
              <strong className="text-[#173f6e]">
                {from}–{to}
              </strong>{' '}
              de <strong className="text-[#173f6e]">{total}</strong>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-[#075fae] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300 disabled:shadow-none"
                disabled={page <= 1}
                onClick={() => updateFilters({ page: page - 1 })}
              >
                <IconChevronLeft size={17} />
                Anterior
              </button>
              <span className="min-w-28 text-center font-extrabold text-[#315d87]">
                Página {page} de {Math.max(totalPages, 1)}
              </span>
              <button
                className="inline-flex min-h-11 cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-[#075fae] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300 disabled:shadow-none"
                disabled={page >= totalPages}
                onClick={() => updateFilters({ page: page + 1 })}
              >
                Siguiente
                <IconChevronRight size={17} />
              </button>
            </div>
          </nav>
        ) : null}
      </section>
    </main>
  )
}
