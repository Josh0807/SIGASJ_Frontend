import { useEffect, useMemo, useState } from 'react'
import { IconEye, IconPlus, IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { SOLICITUD_MATERIALES_NEW_PATH, SOLICITUDES_MATERIALES_PATH } from '../inventarioPaths'
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

const STATUS_OPTIONS = ['TODAS', 'PENDIENTE', 'APROBADA', 'RECHAZADA'] as const

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
        setTotal(Array.isArray(response) ? items.length : response.total ?? items.length)
        setTotalPages(Array.isArray(response) ? 1 : Math.max(response.totalPages ?? 1, 1))
      })
      .catch((requestError) => {
        if (!active) return
        if (getHttpErrorStatus(requestError) === 401) {
          navigate('/login', { replace: true })
          return
        }
        setError(getHttpErrorStatus(requestError) === 403
          ? 'No tiene permiso para consultar solicitudes de materiales.'
          : 'No fue posible consultar sus solicitudes de materiales.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
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

  return <section className="material-tracking" aria-labelledby="material-tracking-title">
    <header className="material-tracking__header">
      <div>
        <p className="material-request__eyebrow">Inventario · Fontanero</p>
        <h1 id="material-tracking-title">Mis solicitudes de materiales</h1>
        <p>Consulte el estado y detalle de las solicitudes que ha realizado.</p>
      </div>
      <Link className="material-request__primary" to={SOLICITUD_MATERIALES_NEW_PATH}><IconPlus size={19} aria-hidden="true" /> Nueva solicitud</Link>
    </header>

    <div className="material-tracking__filters">
      <label htmlFor="solicitud-estado">Filtrar por estado</label>
      <select id="solicitud-estado" value={status} onChange={(event) => changeStatus(event.target.value as typeof status)}>
        {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option === 'TODAS' ? 'Todos los estados' : formatSolicitudStatus(option)}</option>)}
      </select>
      {!loading && !error ? <span role="status">{total} {total === 1 ? 'solicitud' : 'solicitudes'}</span> : null}
    </div>

    {loading ? <div className="material-tracking__state" role="status"><span className="material-request__spinner" />Cargando sus solicitudes…</div> : null}
    {error ? <div className="material-tracking__state material-tracking__state--error" role="alert"><p>{error}</p><button type="button" onClick={retry}><IconRefresh size={18} aria-hidden="true" /> Reintentar</button></div> : null}
    {!loading && !error && requests.length === 0 && status === 'TODAS' ? <div className="material-tracking__empty"><h2>Aún no tiene solicitudes</h2><p>Cuando registre una solicitud podrá consultar aquí su estado.</p><Link className="material-request__primary" to={SOLICITUD_MATERIALES_NEW_PATH}>Crear primera solicitud</Link></div> : null}
    {!loading && !error && requests.length === 0 && status !== 'TODAS' ? <div className="material-tracking__empty"><h2>No hay resultados</h2><p>No tiene solicitudes con el estado seleccionado.</p><button type="button" onClick={() => changeStatus('TODAS')}>Ver todos los estados</button></div> : null}

    {!loading && !error && filtered.length > 0 ? <div className="material-tracking__table-wrap">
      <table>
        <thead><tr><th>Solicitud</th><th>Fecha</th><th>Estado</th><th>Materiales</th><th>Avería</th><th><span className="sr-only">Acción</span></th></tr></thead>
        <tbody>{filtered.map((request) => <tr key={request.id}>
          <td data-label="Solicitud"><strong>{request.codigo || `#${request.id}`}</strong></td>
          <td data-label="Fecha">{formatSolicitudDate(request.fechaSolicitud)}</td>
          <td data-label="Estado"><span className="material-tracking__badge" data-status={request.estado.toUpperCase()}>{formatSolicitudStatus(request.estado)}</span></td>
          <td data-label="Materiales">{getSolicitudMaterialesCount(request)}</td>
          <td data-label="Avería">{getSolicitudAveriaReference(request)}</td>
          <td data-label="Acción"><Link className="material-tracking__detail-link" to={`${SOLICITUDES_MATERIALES_PATH}/${request.id}`}><IconEye size={18} aria-hidden="true" /> Ver detalle</Link></td>
        </tr>)}</tbody>
      </table>
    </div> : null}
    {!loading && !error && totalPages > 1 ? <nav className="material-tracking__pagination" aria-label="Paginación de solicitudes">
      <button type="button" disabled={page <= 1} onClick={() => { setLoading(true); setPage((value) => value - 1) }}>Anterior</button>
      <span>Página {page} de {totalPages}</span>
      <button type="button" disabled={page >= totalPages} onClick={() => { setLoading(true); setPage((value) => value + 1) }}>Siguiente</button>
    </nav> : null}
  </section>
}
