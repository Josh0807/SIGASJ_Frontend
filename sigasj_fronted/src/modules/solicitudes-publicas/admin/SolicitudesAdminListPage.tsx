import {
  IconChevronLeft,
  IconChevronRight,
  IconClipboardList,
  IconEye,
  IconFilterOff,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import {
  AdminFilterField,
  AdminFilters,
  AdminShell,
  Alert,
  Button,
  EmptyState,
  PageHeader,
  adminFilterControlClassName,
} from '../../../shared/ui'
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
    <AdminShell
      className="gap-5 sm:gap-6"
      aria-labelledby="solicitudes-tramites-title"
    >
      <PageHeader
        id="solicitudes-tramites-title"
        eyebrow="Administración · Solicitudes"
        title={
          <span className="inline-flex items-center gap-2">
            <IconClipboardList size={22} aria-hidden="true" />
            Trámites digitales
          </span>
        }
        description="Consulta, filtra y abre los trámites recibidos desde los formularios ciudadanos."
        actions={
          <Button to={SOLICITUDES_ADMIN_PATH} variant="secondary">
            Volver a Gestión de solicitudes
          </Button>
        }
      />

      <AdminFilters
        aria-label="Búsqueda y filtros"
        summary={
          <>
            <strong className="text-sigasj-ink">{loading ? '…' : total}</strong>
            <span>{total === 1 ? 'solicitud' : 'solicitudes'}</span>
          </>
        }
      >
        <AdminFilterField label="Buscar">
          <span className="relative block">
            <IconSearch
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sigasj-muted"
              size={17}
              aria-hidden="true"
            />
            <input
              className={`${adminFilterControlClassName} pl-9`}
              type="search"
              value={search}
              placeholder="Código o solicitante"
              onChange={(event) => setSearch(event.target.value)}
            />
          </span>
        </AdminFilterField>
        <AdminFilterField label="Estado">
          <select
            className={adminFilterControlClassName}
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
        </AdminFilterField>
        <AdminFilterField label="Tipo de trámite">
          <select
            className={adminFilterControlClassName}
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
        </AdminFilterField>
        <Button
          type="button"
          variant="secondary"
          leftIcon={<IconFilterOff size={17} aria-hidden="true" />}
          disabled={!hasFilters}
          onClick={() => {
            setSearch('')
            updateFilters({ search: '', estado: '', tipo: '', page: 1 })
          }}
        >
          Limpiar
        </Button>
      </AdminFilters>

      <section
        className="overflow-hidden rounded-[28px] border border-[#d7e5f1]/90 bg-white shadow-[0_18px_45px_rgba(30, 90, 156,0.10)]"
        aria-label="Listado de solicitudes"
      >
        {loading ? (
          <Alert tone="info">{ADMIN_COPY.loading('solicitudes')}</Alert>
        ) : error ? (
          <EmptyState
            title={error}
            actions={
              <Button
                type="button"
                variant="secondary"
                leftIcon={<IconRefresh size={17} aria-hidden="true" />}
                onClick={() => setRefresh((value) => value + 1)}
              >
                {ADMIN_COPY.retry}
              </Button>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<IconSearch size={32} aria-hidden="true" />}
            title={ADMIN_COPY.emptyFiltered('solicitudes')}
          />
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
                      <Button
                        to={solicitudAdminDetailPath(row.id)}
                        variant="primary"
                        size="sm"
                        leftIcon={<IconEye size={16} aria-hidden="true" />}
                      >
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && total > 0 ? (
          <nav
            className="flex flex-col items-center justify-between gap-4 border-t border-[#d7e5f1] bg-slate-50/40 px-6 py-5 text-sm text-slate-500 sm:flex-row"
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
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<IconChevronLeft size={17} aria-hidden="true" />}
                disabled={page <= 1}
                onClick={() => updateFilters({ page: page - 1 })}
              >
                Anterior
              </Button>
              <span className="min-w-28 text-center font-extrabold text-[#315d87]">
                Página {page} de {Math.max(totalPages, 1)}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                rightIcon={<IconChevronRight size={17} aria-hidden="true" />}
                disabled={page >= totalPages}
                onClick={() => updateFilters({ page: page + 1 })}
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
