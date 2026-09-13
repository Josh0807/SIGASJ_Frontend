import { useEffect, useState } from 'react'
import { IconEye, IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
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

export default function SolicitudesRevisionPage() {
  const [requests, setRequests] = useState<SolicitudMaterialesListItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    void getSolicitudesMaterialesAdmin({ estado: 'PENDIENTE', page, limit: 10 })
      .then((response) => {
        if (!active) return
        const items = normalizeSolicitudesMaterialesList(response)
        setRequests(items)
        setTotal(Array.isArray(response) ? items.length : response.total ?? items.length)
        setTotalPages(Array.isArray(response) ? 1 : Math.max(response.totalPages ?? 1, 1))
      })
      .catch((requestError) => {
        if (!active) return
        const status = getHttpErrorStatus(requestError)
        if (status === 401) {
          navigate('/login', { replace: true })
          return
        }
        setError(status === 403
          ? 'No tiene permiso para revisar solicitudes de materiales.'
          : 'No fue posible cargar las solicitudes pendientes.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [navigate, page, reloadKey])

  const retry = () => {
    setError('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  return <section className="material-tracking" aria-labelledby="solicitud-revision-title">
    <header className="material-tracking__header">
      <div>
        <p className="material-request__eyebrow">Inventario · Administración</p>
        <h1 id="solicitud-revision-title">Revisión de solicitudes de materiales</h1>
        <p>Consulte las solicitudes pendientes enviadas por los fontaneros y abra el detalle para revisarlas.</p>
      </div>
      <Link className="material-tracking__detail-link" to={MATERIALES_PATH}>Volver al catálogo</Link>
    </header>

    {!loading && !error ? <div className="material-tracking__filters">
      <span role="status">{total} {total === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}</span>
    </div> : null}

    {loading ? <div className="material-tracking__state" role="status"><span className="material-request__spinner" />Cargando solicitudes pendientes…</div> : null}
    {error ? <div className="material-tracking__state material-tracking__state--error" role="alert"><p>{error}</p><button type="button" onClick={retry}><IconRefresh size={18} aria-hidden="true" /> Reintentar</button></div> : null}
    {!loading && !error && requests.length === 0 ? <div className="material-tracking__empty"><h2>No hay solicitudes pendientes</h2><p>Cuando un fontanero envíe una solicitud de materiales, aparecerá aquí para su revisión.</p></div> : null}

    {!loading && !error && requests.length > 0 ? <div className="material-tracking__table-wrap">
      <table>
        <thead>
          <tr>
            <th>Solicitud</th>
            <th>Fecha</th>
            <th>Fontanero</th>
            <th>Avería</th>
            <th>Estado</th>
            <th>Materiales</th>
            <th><span className="visually-hidden">Acción</span></th>
          </tr>
        </thead>
        <tbody>{requests.map((request) => <tr key={request.id}>
          <td data-label="Solicitud"><strong>{request.codigo || `#${request.id}`}</strong></td>
          <td data-label="Fecha">{formatSolicitudDate(request.fechaSolicitud)}</td>
          <td data-label="Fontanero">{getSolicitudFontaneroNombre(request)}</td>
          <td data-label="Avería">{getSolicitudAveriaReference(request)}</td>
          <td data-label="Estado"><span className="material-tracking__badge" data-status={request.estado.toUpperCase()}>{formatSolicitudStatus(request.estado)}</span></td>
          <td data-label="Materiales">{getSolicitudMaterialesCount(request)}</td>
          <td data-label="Acción">
            <Link
              className="material-tracking__detail-link"
              to={solicitudRevisionDetailPath(request.id)}
              state={{ solicitud: request }}
            >
              <IconEye size={18} aria-hidden="true" /> Ver detalle
            </Link>
          </td>
        </tr>)}</tbody>
      </table>
    </div> : null}

    {!loading && !error && totalPages > 1 ? <nav className="material-tracking__pagination" aria-label="Paginación de solicitudes pendientes">
      <button type="button" disabled={page <= 1} onClick={() => { setLoading(true); setPage((value) => value - 1) }}>Anterior</button>
      <span>Página {page} de {totalPages}</span>
      <button type="button" disabled={page >= totalPages} onClick={() => { setLoading(true); setPage((value) => value + 1) }}>Siguiente</button>
    </nav> : null}
  </section>
}
