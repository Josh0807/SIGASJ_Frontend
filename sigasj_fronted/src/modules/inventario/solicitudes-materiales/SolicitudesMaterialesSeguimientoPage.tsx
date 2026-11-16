import { useEffect, useMemo, useState } from 'react'
import {
  IconChevronLeft,
  IconChevronRight,
  IconClipboardList,
  IconEye,
  IconPackage,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import {
  AdminFilterField,
  AdminFilters,
  AdminShell,
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
  adminFilterSelectClassName,
} from '../../../shared/ui'
import {
  SOLICITUD_MATERIALES_NEW_PATH,
  SOLICITUDES_MATERIALES_PATH,
} from '../inventarioPaths'
import { getMisSolicitudesMateriales } from './solicitudesMaterialesApi'
import {
  formatSolicitudDate,
  formatSolicitudStatus,
  getSolicitudAveriaReference,
  getSolicitudMaterialesCount,
  normalizeSolicitudesMaterialesList,
  getHttpErrorStatus,
} from './solicitudMaterialesUtils'
import type { SolicitudMaterialesListItem } from './types'

const STATUS_OPTIONS = [
  'TODAS',
  'PENDIENTE',
  'APROBADA',
  'RECHAZADA',
  'CANCELADA',
  'DESPACHADA',
] as const

function statusTone(estado: string) {
  const value = estado.toUpperCase()
  if (value === 'PENDIENTE') {
    return '!border-amber-200 !bg-amber-50 !text-amber-700'
  }
  if (value === 'APROBADA' || value === 'APROBADO') {
    return '!border-emerald-200 !bg-emerald-50 !text-emerald-700'
  }
  if (value === 'RECHAZADA' || value === 'RECHAZADO') {
    return '!border-rose-200 !bg-rose-50 !text-rose-700'
  }
  if (value === 'CANCELADA' || value === 'CANCELADO') {
    return '!border-slate-200 !bg-slate-50 !text-slate-600'
  }
  if (value === 'DESPACHADA' || value === 'DESPACHADO') {
    return '!border-sky-200 !bg-sky-50 !text-sky-700'
  }
  return '!border-[#cfe4f7] !bg-[#f3f9ff] !text-[#1e5a9c]'
}

export default function SolicitudesMaterialesSeguimientoPage() {
  const [requests, setRequests] = useState<SolicitudMaterialesListItem[]>([])
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('TODAS')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    void getMisSolicitudesMateriales({
      ...(status === 'TODAS' ? {} : { estado: status }),
      page,
      limit: 10,
    })
      .then((response) => {
        if (!active) return
        const items = normalizeSolicitudesMaterialesList(response)
        setRequests(items)
        setTotal(
          Array.isArray(response) ? items.length : (response.total ?? items.length),
        )
        setTotalPages(
          Array.isArray(response) ? 1 : Math.max(response.totalPages ?? 1, 1),
        )
      })
      .catch((requestError) => {
        if (!active) return
        if (getHttpErrorStatus(requestError) === 401) {
          navigate('/login', { replace: true })
          return
        }
        setError(
          getHttpErrorStatus(requestError) === 403
            ? 'No tiene permiso para consultar solicitudes de materiales.'
            : 'No fue posible consultar sus solicitudes de materiales.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [navigate, page, reloadKey, status])

  const retry = () => {
    setError('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  const filtered = useMemo(() => requests, [requests])

  const changeStatus = (nextStatus: typeof status) => {
    setStatus(nextStatus)
    setPage(1)
    setError('')
    setLoading(true)
  }

  return (
    <AdminShell
      className="material-tracking material-tracking--fontanero gap-5 sm:gap-6"
      aria-labelledby="material-tracking-title"
    >
      <PageHeader
        id="material-tracking-title"
        eyebrow="Inventario · Fontanero"
        title={
          <span className="inline-flex items-center gap-2">
            <IconPackage size={22} aria-hidden="true" />
            Mis solicitudes de materiales
          </span>
        }
        description="Consulte el estado y detalle de las solicitudes que ha realizado."
        actions={
          <Button
            to={SOLICITUD_MATERIALES_NEW_PATH}
            variant="primary"
            leftIcon={<IconPlus size={20} aria-hidden="true" />}
          >
            Nueva solicitud
          </Button>
        }
      />

      <AdminFilters
        aria-label="Filtro por estado"
        summary={
          !loading && !error ? (
            <>
              <IconClipboardList size={18} aria-hidden="true" />
              <strong className="text-sigasj-ink">{total}</strong>
              <span>{total === 1 ? 'solicitud' : 'solicitudes'}</span>
            </>
          ) : null
        }
      >
        <AdminFilterField label="Estado">
          <select
            id="solicitud-estado"
            className={adminFilterSelectClassName}
            value={status}
            onChange={(event) =>
              changeStatus(event.target.value as typeof status)
            }
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === 'TODAS'
                  ? 'Todos los estados'
                  : formatSolicitudStatus(option)}
              </option>
            ))}
          </select>
        </AdminFilterField>
      </AdminFilters>

      {error ? (
        <Alert tone="danger">
          <div className="grid gap-3">
            <p className="m-0 font-semibold">{error}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="justify-self-start"
              leftIcon={<IconRefresh size={16} aria-hidden="true" />}
              onClick={retry}
            >
              Reintentar
            </Button>
          </div>
        </Alert>
      ) : null}

      <Card
        as="section"
        className="material-tracking__panel !gap-4 !p-0 overflow-hidden"
        aria-label="Listado de solicitudes"
      >
        {loading ? (
          <Alert tone="info" className="m-4">
            Cargando sus solicitudes…
          </Alert>
        ) : !error && requests.length === 0 && status === 'TODAS' ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              title="Aún no tiene solicitudes"
              description="Cuando registre una solicitud podrá consultar aquí su estado."
              actions={
                <Button
                  to={SOLICITUD_MATERIALES_NEW_PATH}
                  variant="primary"
                  leftIcon={<IconPlus size={20} aria-hidden="true" />}
                >
                  Crear primera solicitud
                </Button>
              }
            />
          </div>
        ) : !error && requests.length === 0 && status !== 'TODAS' ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              title="No hay resultados"
              description="No tiene solicitudes con el estado seleccionado."
              actions={
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => changeStatus('TODAS')}
                >
                  Ver todos los estados
                </Button>
              }
            />
          </div>
        ) : !error && filtered.length > 0 ? (
          <>
            <div className="material-tracking__table-wrap material-tracking__table-wrap--panel">
              <table>
                <thead>
                  <tr>
                    <th>Solicitud</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Materiales</th>
                    <th>Avería</th>
                    <th>
                      <span className="sr-only">Acción</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((request) => (
                    <tr key={request.id}>
                      <td data-label="Solicitud">
                        <strong>{request.codigo || `#${request.id}`}</strong>
                      </td>
                      <td data-label="Fecha">
                        {formatSolicitudDate(request.fechaSolicitud)}
                      </td>
                      <td data-label="Estado">
                        <span
                          className={`material-tracking__badge ${statusTone(request.estado)}`}
                          data-status={request.estado.toUpperCase()}
                        >
                          {formatSolicitudStatus(request.estado)}
                        </span>
                      </td>
                      <td data-label="Materiales">
                        <span className="material-tracking__qty">
                          {getSolicitudMaterialesCount(request)}
                        </span>
                      </td>
                      <td data-label="Avería">
                        {getSolicitudAveriaReference(request)}
                      </td>
                      <td data-label="Acción" className="material-tracking__row-action">
                        <Button
                          to={`${SOLICITUDES_MATERIALES_PATH}/${request.id}`}
                          variant="secondary"
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

            {totalPages > 1 ? (
              <nav
                className="flex flex-col items-center justify-between gap-3 border-t border-sigasj-border px-4 py-4 text-sm text-sigasj-muted sm:flex-row sm:px-5"
                aria-label="Paginación de solicitudes"
              >
                <p className="m-0 font-semibold">
                  Página {page} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<IconChevronLeft size={16} aria-hidden="true" />}
                    disabled={page <= 1}
                    onClick={() => {
                      setLoading(true)
                      setPage((value) => value - 1)
                    }}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    rightIcon={<IconChevronRight size={16} aria-hidden="true" />}
                    disabled={page >= totalPages}
                    onClick={() => {
                      setLoading(true)
                      setPage((value) => value + 1)
                    }}
                  >
                    Siguiente
                  </Button>
                </div>
              </nav>
            ) : null}
          </>
        ) : null}
      </Card>
    </AdminShell>
  )
}
