import { useEffect, useState } from 'react'
import { IconArrowLeft, IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SOLICITUDES_MATERIALES_PATH } from '../inventarioPaths'
import { getMiSolicitudMateriales } from './solicitudesMaterialesApi'
import { formatSolicitudDate, formatSolicitudStatus, getHttpErrorStatus } from './solicitudMaterialesUtils'
import type { SolicitudMateriales } from './types'

export default function SolicitudMaterialesDetallePage() {
  const { id } = useParams<{ id: string }>()
  const requestId = Number(id)
  const [request, setRequest] = useState<SolicitudMateriales | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    if (!Number.isInteger(requestId) || requestId <= 0) {
      queueMicrotask(() => { if (active) { setError('La solicitud indicada no es válida.'); setLoading(false) } })
      return () => { active = false }
    }
    void getMiSolicitudMateriales(requestId)
      .then((response) => { if (active) setRequest(response) })
      .catch((requestError) => {
        if (!active) return
        const status = getHttpErrorStatus(requestError)
        if (status === 401) {
          navigate('/login', { replace: true })
          return
        }
        if (status === 403) setError('Acceso denegado: esta solicitud no pertenece a su usuario.')
        else if (status === 404) setError('La solicitud indicada no existe en el sistema.')
        else setError('No fue posible consultar esta solicitud.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [navigate, requestId, reloadKey])

  const retry = () => { setError(''); setLoading(true); setReloadKey((value) => value + 1) }

  return <section className="material-detail" aria-labelledby="material-detail-title">
    <Link className="material-detail__back" to={SOLICITUDES_MATERIALES_PATH}><IconArrowLeft size={18} aria-hidden="true" /> Volver a mis solicitudes</Link>
    {loading ? <div className="material-tracking__state" role="status"><span className="material-request__spinner" />Cargando detalle…</div> : null}
    {error ? <div className="material-tracking__state material-tracking__state--error" role="alert"><p>{error}</p><button type="button" onClick={retry}><IconRefresh size={18} aria-hidden="true" /> Reintentar</button></div> : null}
    {!loading && !error && request ? <>
      <header className="material-detail__header">
        <div><p className="material-request__eyebrow">Solicitud de materiales</p><h1 id="material-detail-title">{request.codigo || `Solicitud #${request.id}`}</h1><p>Registrada el {formatSolicitudDate(request.fechaSolicitud)}</p></div>
        <span className="material-tracking__badge" data-status={request.estado.toUpperCase()}>{formatSolicitudStatus(request.estado)}</span>
      </header>
      <dl className="material-detail__summary">
        <div><dt>Avería relacionada</dt><dd>{request.averia?.codigo ?? request.averia?.numero ?? (request.idAveria ? `Avería #${request.idAveria}` : 'Sin avería relacionada')}</dd></div>
        <div><dt>Materiales distintos</dt><dd>{request.cantidadMateriales ?? request.detalles?.length ?? 0}</dd></div>
        <div><dt>Cantidad total</dt><dd>{request.totalMateriales ?? request.detalles?.reduce((sum, item) => sum + item.cantidad, 0) ?? 0}</dd></div>
        <div className="material-detail__summary-wide"><dt>Observación general</dt><dd>{request.observacion || 'Sin observación'}</dd></div>
      </dl>
      <div className="material-detail__materials"><h2>Materiales solicitados</h2>
        <div className="material-tracking__table-wrap"><table><thead><tr><th>Material</th><th>Cantidad</th><th>Nota</th></tr></thead><tbody>
          {(request.detalles ?? []).map((detail) => <tr key={detail.id}><td data-label="Material"><strong>{detail.material?.nombre ?? `Material #${detail.idMaterial}`}</strong></td><td data-label="Cantidad">{detail.cantidad} {detail.material?.unidadMedida ?? ''}</td><td data-label="Nota">{detail.observacion || '—'}</td></tr>)}
        </tbody></table></div>
        {!request.detalles?.length ? <p className="material-detail__no-materials">No se recibió información de materiales para esta solicitud.</p> : null}
      </div>
      <aside className="material-detail__notice"><strong>Consulta de seguimiento</strong><span>Desde esta pantalla no se aprueban, rechazan ni despachan solicitudes.</span></aside>
    </> : null}
  </section>
}
