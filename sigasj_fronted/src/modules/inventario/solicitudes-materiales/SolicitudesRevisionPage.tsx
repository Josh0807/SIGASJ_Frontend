import { useEffect, useState } from 'react'
import {
  IconArrowLeft,
  IconClipboardCheck,
  IconEye,
  IconRefresh,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { Button, EmptyState, PageHeader } from '../../../shared/ui'
import { MATERIALES_PATH, solicitudRevisionDetailPath } from '../inventarioPaths'
import { getSolicitudesMaterialesAdmin } from './solicitudesMaterialesApi'
import {
  formatSolicitudDate,
  formatSolicitudStatus,
  getHttpErrorStatus,
  getSolicitudAveriaReference,
  getSolicitudFontaneroNombre,
  getSolicitudMaterialesCount,
  normalizeSolicitudesMaterialesList,
} from './solicitudMaterialesUtils'
import type { SolicitudMaterialesListItem } from './types'

type EstadoFiltro = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA' | 'DESPACHADA'

const ESTADO_OPCIONES: { value: EstadoFiltro; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'APROBADA', label: 'Aprobadas' },
  { value: 'RECHAZADA', label: 'Rechazadas' },
  { value: 'CANCELADA', label: 'Canceladas' },
  { value: 'DESPACHADA', label: 'Despachadas' },
]

function badgeClassForEstado(estado: string) {
  const value = estado.toUpperCase()
  if (value === 'APROBADA' || value === 'DESPACHADA') return 'inv-badge inv-badge--ok'
  if (value === 'PENDIENTE') return 'inv-badge inv-badge--low'
  if (value === 'RECHAZADA' || value === 'CANCELADA') return 'inv-badge inv-badge--out'
  return 'inv-badge inv-badge--inactive'
}

export default function SolicitudesRevisionPage() {
  const [requests, setRequests] = useState<SolicitudMaterialesListItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('PENDIENTE')
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    void getSolicitudesMaterialesAdmin({ estado: estadoFiltro, page, limit: 10 })
      .then((response) => {
        if (!active) return
        const items = normalizeSolicitudesMaterialesList(response)
        setRequests(items)
        setTotal(
          Array.isArray(response) ? items.length : (response.total ?? items.length),
        )
        setTotalPages(
          Array.isArray(response)
            ? 1
            : Math.max(response.totalPages ?? 1, 1),
        )
        setError('')
      })
      .catch((requestError) => {
        if (!active) return
        const status = getHttpErrorStatus(requestError)
        if (status === 401) {
          navigate('/login', { replace: true })
          return
        }
        setError(
          status === 403
            ? 'No tiene permiso para revisar solicitudes de materiales.'
            : 'No fue posible cargar las solicitudes pendientes.',
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [navigate, page, reloadKey, estadoFiltro])

  const retry = () => {
    setError('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  const estadoLabel =
    ESTADO_OPCIONES.find((option) => option.value === estadoFiltro)?.label.toLowerCase() ??
    ''
  const from = total === 0 ? 0 : (page - 1) * 10 + 1
  const to = Math.min(page * 10, total)
  const isEmpty = !loading && !error && requests.length === 0

  return (
    <section
      className="inv-solicitudes"
      style={{ display: 'grid', gap: 14 }}
      aria-labelledby="solicitud-revision-title"
    >
      <PageHeader
        title={
          <span id="solicitud-revision-title">
            Revisión de solicitudes de materiales
          </span>
        }
        description="Apruebe o rechace lo que envían los fontaneros desde el detalle de cada solicitud."
        actions={
          <Button
            to={MATERIALES_PATH}
            variant="secondary"
            leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
          >
            Volver al catálogo
          </Button>
        }
      />

      <section className="inv-panel" aria-label="Solicitudes de materiales">
        <div className="inv-panel__heading" style={{ borderBottom: 0, marginBottom: 0 }}>
          <div className="inv-status-bar__main">
            <span className="inv-status-bar__icon">
              <IconClipboardCheck size={20} aria-hidden="true" />
            </span>
            <div className="inv-status-bar__copy">
              <h2 style={{ margin: 0 }}>Bandeja de revisión</h2>
              <p style={{ margin: '3px 0 0' }}>
                Filtre por estado y abra el detalle para decidir.
              </p>
            </div>
          </div>
          <div
            className={`inv-status-bar__metric${total === 0 ? ' is-quiet' : ''}`}
            role="status"
          >
            <strong>{total}</strong>
            <span>{total === 1 ? 'solicitud' : 'solicitudes'}</span>
          </div>
        </div>

        <div
          className="inv-panel__toolbar"
          style={{ justifyContent: 'space-between', gap: 12 }}
        >
          <div className="inv-seg" role="tablist" aria-label="Filtrar por estado">
            {ESTADO_OPCIONES.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={estadoFiltro === option.value}
                className={`inv-seg__btn${estadoFiltro === option.value ? ' is-active' : ''}`}
                onClick={() => {
                  if (estadoFiltro === option.value) return
                  setPage(1)
                  setLoading(true)
                  setEstadoFiltro(option.value)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inv-btn inv-btn--secondary"
            onClick={retry}
            disabled={loading}
            aria-label="Actualizar listado"
          >
            <IconRefresh size={18} aria-hidden="true" />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="inv-state" role="status">
            Cargando solicitudes pendientes…
          </div>
        ) : null}

        {error ? (
          <div className="inv-error" role="alert">
            <p>{error}</p>
            <button type="button" className="inv-btn inv-btn--primary" onClick={retry}>
              <IconRefresh size={18} aria-hidden="true" />
              Reintentar
            </button>
          </div>
        ) : null}

        {isEmpty ? (
          <EmptyState
            icon={<IconClipboardCheck size={30} aria-hidden="true" />}
            title={`No hay solicitudes ${estadoLabel}`}
            description="Cuando un fontanero envíe materiales para aprobación, aparecerán aquí listas para revisar."
            actions={
              estadoFiltro !== 'PENDIENTE' ? (
                <Button
                  type="button"
                  onClick={() => {
                    setPage(1)
                    setLoading(true)
                    setEstadoFiltro('PENDIENTE')
                  }}
                >
                  Ver pendientes
                </Button>
              ) : undefined
            }
          />
        ) : null}

        {!loading && !error && requests.length > 0 ? (
          <>
            <div className="inv-panel__heading">
              <div>
                <h2>Solicitudes {estadoLabel}</h2>
                <p>
                  Mostrando {from}–{to} de {total}
                </p>
              </div>
            </div>
            <div className="inv-table-wrap">
              <table className="inv-table">
                <caption className="visually-hidden">
                  Solicitudes de materiales
                </caption>
                <thead>
                  <tr>
                    <th>Solicitud</th>
                    <th>Fecha</th>
                    <th>Fontanero</th>
                    <th>Avería</th>
                    <th>Estado</th>
                    <th>Materiales</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td data-label="Solicitud">
                        <strong>{request.codigo || `#${request.id}`}</strong>
                      </td>
                      <td data-label="Fecha">
                        {formatSolicitudDate(request.fechaSolicitud)}
                      </td>
                      <td data-label="Fontanero">
                        {getSolicitudFontaneroNombre(request)}
                      </td>
                      <td data-label="Avería">
                        {getSolicitudAveriaReference(request)}
                      </td>
                      <td data-label="Estado">
                        <span className={badgeClassForEstado(request.estado)}>
                          {formatSolicitudStatus(request.estado)}
                        </span>
                      </td>
                      <td data-label="Materiales">
                        {getSolicitudMaterialesCount(request)}
                      </td>
                      <td data-label="Acción">
                        <Button
                          className="inv-row-action"
                          size="sm"
                          to={solicitudRevisionDetailPath(request.id)}
                          state={{ solicitud: request }}
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
          </>
        ) : null}
      </section>

      {!loading && !error && totalPages > 1 ? (
        <nav
          className="inv-pagination"
          aria-label="Paginación de solicitudes pendientes"
        >
          <button
            type="button"
            className="inv-btn inv-btn--secondary"
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
            className="inv-btn inv-btn--secondary"
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
    </section>
  )
}
