import { useEffect, useMemo, useState } from 'react'
import {
  IconClipboardList,
  IconEye,
  IconFilter,
  IconPackage,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { InventoryFormField } from '../InventoryFormField'
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

const requestButtonClasses =
  'group relative isolate overflow-hidden !inline-flex !min-h-11 !items-center !justify-center !gap-2 !rounded-2xl !border-0 !bg-gradient-to-r !from-blue-600 !via-blue-600 !to-sky-500 !px-5 !py-2.5 !font-extrabold !text-white !no-underline !shadow-[0_10px_24px_rgba(30,90,156,0.28)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:!from-blue-700 hover:!to-cyan-500 hover:!shadow-[0_16px_32px_rgba(30,90,156,0.36)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1e5a9c] motion-reduce:transform-none motion-reduce:transition-none'

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
    <section
      className="material-tracking material-tracking--fontanero"
      aria-labelledby="material-tracking-title"
    >
      <header className="material-tracking__header material-tracking__header--fontanero">
        <div className="material-tracking__header-main">
          <span className="material-tracking__header-icon" aria-hidden="true">
            <IconPackage size={28} stroke={2.2} />
          </span>
          <div className="material-tracking__header-copy">
            <p className="material-request__eyebrow inventory-page-eyebrow">
              Inventario · Fontanero
            </p>
            <h1 className="inventory-page-title" id="material-tracking-title">
              Mis solicitudes de materiales
            </h1>
            <p className="inventory-page-subtitle">
              Consulte el estado y detalle de las solicitudes que ha realizado.
            </p>
          </div>
        </div>

        <Link
          className={`material-request__primary ${requestButtonClasses}`}
          to={SOLICITUD_MATERIALES_NEW_PATH}
        >
          <IconPlus
            className="transition-transform duration-300 group-hover:rotate-90 motion-reduce:transform-none"
            size={20}
            aria-hidden="true"
          />
          Nueva solicitud
        </Link>
      </header>

      <div className="material-tracking__panel">
        <div className="material-tracking__filters material-tracking__filters--panel">
          <InventoryFormField
            label="Estado"
            icon={<IconFilter size={18} aria-hidden="true" />}
          >
            <select
              id="solicitud-estado"
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
          </InventoryFormField>

          {!loading && !error ? (
            <span className="material-tracking__count" role="status">
              <IconClipboardList size={18} aria-hidden="true" />
              {total} {total === 1 ? 'solicitud' : 'solicitudes'}
            </span>
          ) : null}
        </div>

        {loading ? (
          <div className="material-tracking__state" role="status">
            <span className="material-request__spinner" />
            Cargando sus solicitudes…
          </div>
        ) : null}

        {error ? (
          <div
            className="material-tracking__state material-tracking__state--error"
            role="alert"
          >
            <p>{error}</p>
            <button type="button" onClick={retry}>
              <IconRefresh size={18} aria-hidden="true" /> Reintentar
            </button>
          </div>
        ) : null}

        {!loading && !error && requests.length === 0 && status === 'TODAS' ? (
          <div className="material-tracking__empty">
            <h2>Aún no tiene solicitudes</h2>
            <p>Cuando registre una solicitud podrá consultar aquí su estado.</p>
            <Link
              className={`material-request__primary ${requestButtonClasses}`}
              to={SOLICITUD_MATERIALES_NEW_PATH}
            >
              <IconPlus
                className="transition-transform duration-300 group-hover:rotate-90 motion-reduce:transform-none"
                size={20}
                aria-hidden="true"
              />
              Crear primera solicitud
            </Link>
          </div>
        ) : null}

        {!loading && !error && requests.length === 0 && status !== 'TODAS' ? (
          <div className="material-tracking__empty">
            <h2>No hay resultados</h2>
            <p>No tiene solicitudes con el estado seleccionado.</p>
            <button
              type="button"
              className="material-tracking__filter-action"
              onClick={() => changeStatus('TODAS')}
            >
              Ver todos los estados
            </button>
          </div>
        ) : null}

        {!loading && !error && filtered.length > 0 ? (
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
                      <Link
                        className="material-tracking__detail-link"
                        to={`${SOLICITUDES_MATERIALES_PATH}/${request.id}`}
                      >
                        <IconEye size={18} aria-hidden="true" />
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!loading && !error && totalPages > 1 ? (
          <nav
            className="material-tracking__pagination"
            aria-label="Paginación de solicitudes"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                setLoading(true)
                setPage((value) => value - 1)
              }}
            >
              Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                setLoading(true)
                setPage((value) => value + 1)
              }}
            >
              Siguiente
            </button>
          </nav>
        ) : null}
      </div>
    </section>
  )
}
