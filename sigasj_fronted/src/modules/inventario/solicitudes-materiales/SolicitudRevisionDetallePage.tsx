import { useEffect, useState } from 'react'
import { IconArrowLeft, IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import { SOLICITUDES_REVISION_PATH } from '../inventarioPaths'
import {
  aprobarSolicitudMaterialesAdmin,
  getSolicitudMaterialesAdmin,
  rechazarSolicitudMaterialesAdmin,
} from './solicitudesMaterialesApi'
import {
  formatSolicitudDate,
  formatSolicitudStatus,
  getHttpErrorStatus,
  getSolicitudAveriaReference,
  getSolicitudFontaneroNombre,
  getSolicitudMaterialesCount,
  solicitudRevisionErrorMessage,
} from './solicitudMaterialesUtils'
import type { SolicitudMateriales } from './types'

export default function SolicitudRevisionDetallePage() {
  const { id } = useParams<{ id: string }>()
  const requestId = Number(id)
  const navigate = useNavigate()
  const [request, setRequest] = useState<SolicitudMateriales | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [decision, setDecision] = useState<'aprobar' | 'rechazar' | null>(null)
  const [busy, setBusy] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
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
    void getSolicitudMaterialesAdmin(requestId)
      .then((response) => { if (active) setRequest(response) })
      .catch((requestError) => {
        if (!active) return
        if (getHttpErrorStatus(requestError) === 401) {
          navigate('/login', { replace: true })
          return
        }
        setError(solicitudRevisionErrorMessage(requestError))
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [navigate, requestId, reloadKey])

  const retry = () => {
    setError('')
    setSuccess('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  const pending = request?.estado?.toUpperCase() === 'PENDIENTE'

  const confirmDecision = async () => {
    if (!request || busy || !decision) return
    setBusy(true)
    setDecision(null)
    setError('')
    setSuccess('')
    try {
      const updated = decision === 'aprobar'
        ? await aprobarSolicitudMaterialesAdmin(request.id)
        : await rechazarSolicitudMaterialesAdmin(request.id, motivoRechazo)
      setRequest(updated)
      setSuccess(decision === 'aprobar'
        ? 'La solicitud fue aprobada. Las existencias no se modificaron.'
        : 'La solicitud fue rechazada. Las existencias no se modificaron.')
    } catch (requestError) {
      if (getHttpErrorStatus(requestError) === 401) {
        navigate('/login', { replace: true })
        return
      }
      setError(solicitudRevisionErrorMessage(requestError))
      if (getHttpErrorStatus(requestError) === 400) {
        setLoading(true)
        setReloadKey((value) => value + 1)
      }
    } finally {
      setBusy(false)
    }
  }

  return <section className="material-detail" aria-labelledby="solicitud-revision-detail-title">
    <Link className="material-detail__back" to={SOLICITUDES_REVISION_PATH}>
      <IconArrowLeft size={18} aria-hidden="true" /> Volver a solicitudes pendientes
    </Link>
    {loading ? <div className="material-tracking__state" role="status"><span className="material-request__spinner" />Cargando solicitud…</div> : null}
    {error ? <div className="material-tracking__state material-tracking__state--error" role="alert"><p>{error}</p><button type="button" onClick={retry}><IconRefresh size={18} aria-hidden="true" /> Reintentar</button></div> : null}
    {success ? <div className="material-tracking__state" role="status">{success}</div> : null}
    {!loading && request ? <>
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
        <div><dt>Cantidad total</dt><dd>{request.totalMateriales ?? request.detalles?.reduce((sum, item) => sum + item.cantidad, 0) ?? 0}</dd></div>
        <div className="material-detail__summary-wide"><dt>Observación general</dt><dd>{request.observacion || 'Sin observación'}</dd></div>
        {request.fechaRevision ? <div><dt>Fecha de revisión</dt><dd>{formatSolicitudDate(request.fechaRevision)}</dd></div> : null}
        {request.idUsuarioAprobador ? <div><dt>Revisada por</dt><dd>{request.usuarioAprobador?.nombre || `Usuario #${request.idUsuarioAprobador}`}</dd></div> : null}
        {request.motivoRechazo ? <div className="material-detail__summary-wide"><dt>Motivo de rechazo</dt><dd>{request.motivoRechazo}</dd></div> : null}
      </dl>
      <div className="material-detail__materials">
        <h2>Materiales solicitados</h2>
        <div className="material-tracking__table-wrap">
          <table>
            <thead><tr><th>Material</th><th>Cantidad</th><th>Existencia</th><th>Nota</th></tr></thead>
            <tbody>
              {(request.detalles ?? []).map((detail) => (
                <tr key={detail.id}>
                  <td data-label="Material"><strong>{detail.material?.nombre ?? `Material #${detail.idMaterial}`}</strong></td>
                  <td data-label="Cantidad">{detail.cantidad} {detail.material?.unidadMedida ?? ''}</td>
                  <td data-label="Existencia">{detail.material?.stockActual ?? '—'}</td>
                  <td data-label="Nota">{detail.observacion || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!request.detalles?.length ? <p className="material-detail__no-materials">No se recibió información de materiales para esta solicitud.</p> : null}
      </div>
      {pending ? <>
        <label className="material-review__motivo">
          <span>Motivo de rechazo (opcional)</span>
          <textarea value={motivoRechazo} maxLength={1000} disabled={busy} onChange={(event) => setMotivoRechazo(event.target.value)} />
        </label>
        <div className="material-review__actions">
          <button type="button" className="material-review__approve" disabled={busy} onClick={() => setDecision('aprobar')}>{busy ? 'Procesando…' : 'Aprobar'}</button>
          <button type="button" className="material-review__reject" disabled={busy} onClick={() => setDecision('rechazar')}>Rechazar</button>
        </div>
      </> : <aside className="material-detail__notice"><strong>Solicitud procesada</strong><span>Esta solicitud ya no está pendiente. Aprobar o rechazar no modifica las existencias del inventario.</span></aside>}
    </> : null}
    <ConfirmDialog
      isOpen={decision === 'aprobar'}
      title="Aprobar solicitud"
      message="¿Está segura de aprobar esta solicitud? La decisión no se podrá revertir desde este flujo y no modificará las existencias."
      confirmLabel="Aprobar solicitud"
      onCancel={() => setDecision(null)}
      onConfirm={() => { void confirmDecision() }}
    />
    <ConfirmDialog
      isOpen={decision === 'rechazar'}
      title="Rechazar solicitud"
      message="¿Está segura de rechazar esta solicitud? La decisión no se podrá revertir desde este flujo y no modificará las existencias."
      confirmLabel="Rechazar solicitud"
      confirmDanger
      onCancel={() => setDecision(null)}
      onConfirm={() => { void confirmDecision() }}
    />
  </section>
}
