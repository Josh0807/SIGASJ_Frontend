import { useEffect, useState } from 'react'
import { IconArrowLeft } from '@tabler/icons-react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { SOLICITUDES_REVISION_PATH } from '../inventarioPaths'
import { getSolicitudesMaterialesAdmin } from './solicitudesMaterialesApi'
import {
  formatSolicitudDate,
  formatSolicitudStatus,
  getSolicitudAveriaReference,
  getSolicitudFontaneroNombre,
  getSolicitudMaterialesCount,
  normalizeSolicitudesMaterialesList,
} from './solicitudMaterialesUtils'
import type { SolicitudMaterialesListItem } from './types'

type RevisionLocationState = {
  solicitud?: SolicitudMaterialesListItem
}

const DECISION_HINT = 'La decisión se habilitará al integrar la aprobación y el rechazo con el backend.'

export default function SolicitudRevisionDetallePage() {
  const { id } = useParams<{ id: string }>()
  const requestId = Number(id)
  const location = useLocation()
  const fromList = (location.state as RevisionLocationState | null)?.solicitud
  const [request, setRequest] = useState<SolicitudMaterialesListItem | null>(
    fromList && fromList.id === requestId ? fromList : null,
  )
  const [loading, setLoading] = useState(!request)
  const [error, setError] = useState('')

  useEffect(() => {
    if (request) return
    let active = true
    if (!Number.isInteger(requestId) || requestId <= 0) {
      queueMicrotask(() => {
        if (active) {
          setError('La solicitud indicada no es válida.')
          setLoading(false)
        }
      })
      return () => { active = false }
    }
    void getSolicitudesMaterialesAdmin({ estado: 'PENDIENTE', page: 1, limit: 50 })
      .then((response) => {
        if (!active) return
        const found = normalizeSolicitudesMaterialesList(response).find((item) => item.id === requestId) ?? null
        setRequest(found)
        if (!found) setError('No se encontró esta solicitud en el listado de pendientes. Vuelva a la revisión e inténtelo de nuevo.')
      })
      .catch(() => {
        if (active) setError('No fue posible cargar el resumen de esta solicitud.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [request, requestId])

  return <section className="material-detail" aria-labelledby="solicitud-revision-detail-title">
    <Link className="material-detail__back" to={SOLICITUDES_REVISION_PATH}>
      <IconArrowLeft size={18} aria-hidden="true" /> Volver a solicitudes pendientes
    </Link>
    {loading ? <div className="material-tracking__state" role="status"><span className="material-request__spinner" />Cargando solicitud…</div> : null}
    {error ? <div className="material-tracking__state material-tracking__state--error" role="alert"><p>{error}</p></div> : null}
    {!loading && !error && request ? <>
      <header className="material-detail__header">
        <div>
          <p className="material-request__eyebrow">Inventario · Revisión</p>
          <h1 id="solicitud-revision-detail-title">{request.codigo || `Solicitud #${request.id}`}</h1>
          <p>Registrada el {formatSolicitudDate(request.fechaSolicitud)}</p>
        </div>
        <span className="material-tracking__badge" data-status={request.estado.toUpperCase()}>{formatSolicitudStatus(request.estado)}</span>
      </header>
      <dl className="material-detail__summary">
        <div><dt>Fontanero</dt><dd>{getSolicitudFontaneroNombre(request)}</dd></div>
        <div><dt>Avería relacionada</dt><dd>{getSolicitudAveriaReference(request)}</dd></div>
        <div><dt>Materiales distintos</dt><dd>{getSolicitudMaterialesCount(request)}</dd></div>
        <div className="material-detail__summary-wide"><dt>Observación general</dt><dd>{request.observacion || 'Sin observación'}</dd></div>
      </dl>
      <div className="material-review__actions">
        <button type="button" className="material-review__approve" disabled title={DECISION_HINT}>Aprobar</button>
        <button type="button" className="material-review__reject" disabled title={DECISION_HINT}>Rechazar</button>
      </div>
      <aside className="material-detail__notice">
        <strong>Detalle de materiales</strong>
        <span>El listado de ítems se conectará cuando el backend de detalle esté disponible. Aprobar y rechazar se habilitarán en la integración con el servidor.</span>
      </aside>
    </> : null}
  </section>
}
