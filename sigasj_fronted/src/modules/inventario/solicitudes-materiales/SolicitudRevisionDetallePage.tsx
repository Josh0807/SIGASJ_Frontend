import { useEffect, useState } from 'react'
import { IconAlignLeft, IconArrowLeft, IconCheck, IconPackage, IconRefresh, IconX } from '@tabler/icons-react'
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

  const requestStatus = request?.estado?.toUpperCase()
  const pending = requestStatus === 'PENDIENTE'
  const approved = requestStatus === 'APROBADA' || requestStatus === 'APROBADO'
  const rejected = requestStatus === 'RECHAZADA' || requestStatus === 'RECHAZADO'

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

  return <section className="material-detail !mx-0 !w-full !max-w-none !gap-6" aria-labelledby="solicitud-revision-detail-title">
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
        <div className="!flex !shrink-0 !flex-col !items-end !gap-4 max-[700px]:!w-full max-[700px]:!items-stretch">
          <span className={`material-tracking__badge !inline-flex !items-center !gap-2 !self-end !rounded-full !px-4 !py-2.5 !font-extrabold ${pending ? '!border-amber-200 !bg-linear-to-r !from-amber-50 !to-orange-50 !text-amber-700 !shadow-[0_7px_18px_rgba(217,119,6,0.14)]' : approved ? '!border-emerald-200 !bg-linear-to-r !from-emerald-50 !to-teal-50 !text-emerald-700 !shadow-[0_7px_18px_rgba(5,150,105,0.14)]' : rejected ? '!border-rose-200 !bg-linear-to-r !from-rose-50 !to-red-50 !text-rose-700 !shadow-[0_7px_18px_rgba(225,29,72,0.14)]' : ''}`} data-status={request.estado.toUpperCase()}>{pending || approved || rejected ? <span className={`!size-2 !rounded-full ${pending ? '!bg-amber-500 !shadow-[0_0_0_5px_rgba(245,158,11,0.12)]' : approved ? '!bg-emerald-500 !shadow-[0_0_0_5px_rgba(16,185,129,0.12)]' : '!bg-rose-500 !shadow-[0_0_0_5px_rgba(244,63,94,0.12)]'}`} aria-hidden="true" /> : null}{formatSolicitudStatus(request.estado)}</span>
          <Link className="material-detail__back group !inline-flex !w-fit !min-h-12 !items-center !gap-2.5 !self-end !rounded-2xl !border !border-blue-200 !bg-white !px-5 !py-3 !font-extrabold !text-blue-700 !shadow-[0_8px_20px_rgba(37,99,235,0.12)] !transition-all !duration-300 hover:!-translate-y-1 hover:!scale-[1.02] hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.2)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none max-[700px]:!w-full max-[700px]:!self-stretch" to={SOLICITUDES_REVISION_PATH}>
            <IconArrowLeft className="!transition-transform !duration-300 group-hover:!-translate-x-1.5 motion-reduce:!transform-none" size={19} aria-hidden="true" /> Volver a solicitudes pendientes
          </Link>
        </div>
      </header>
      <dl className="material-detail__summary !grid !w-full !grid-cols-1 !gap-4 !rounded-3xl !border-blue-100 !bg-linear-to-br !from-white !via-blue-50/25 !to-sky-50/60 !p-7 !shadow-[0_14px_36px_rgba(30,90,156,0.1)] md:!grid-cols-2 xl:!grid-cols-3 [&>div]:!rounded-2xl [&>div]:!border [&>div]:!border-blue-100 [&>div]:!bg-white/90 [&>div]:!p-5 [&>div]:!shadow-[0_6px_16px_rgba(30,90,156,0.06)] [&>div]:!transition-all [&>div]:!duration-300 hover:[&>div]:!-translate-y-0.5 hover:[&>div]:!border-blue-200 hover:[&>div]:!shadow-[0_10px_22px_rgba(30,90,156,0.11)] [&_dt]:!mb-1 [&_dt]:!font-extrabold [&_dt]:!tracking-[0.07em] [&_dt]:!text-slate-500 [&_dd]:!text-lg [&_dd]:!font-extrabold [&_dd]:!text-[#073b73]">
        <div><dt>Fontanero</dt><dd>{getSolicitudFontaneroNombre(request)}</dd></div>
        <div><dt>Avería relacionada</dt><dd>{getSolicitudAveriaReference(request)}</dd></div>
        <div><dt>Materiales distintos</dt><dd>{getSolicitudMaterialesCount(request)}</dd></div>
        <div><dt>Cantidad total</dt><dd>{request.totalMateriales ?? request.detalles?.reduce((sum, item) => sum + item.cantidad, 0) ?? 0}</dd></div>
        <div className="material-detail__summary-wide"><dt>Observación general</dt><dd>{request.observacion || 'Sin observación'}</dd></div>
        {request.fechaRevision ? <div><dt>Fecha de revisión</dt><dd>{formatSolicitudDate(request.fechaRevision)}</dd></div> : null}
        {request.idUsuarioAprobador ? <div><dt>Revisada por</dt><dd>{request.usuarioAprobador?.nombre || `Usuario #${request.idUsuarioAprobador}`}</dd></div> : null}
        {request.motivoRechazo ? <div className="material-detail__summary-wide"><dt>Motivo de rechazo</dt><dd>{request.motivoRechazo}</dd></div> : null}
      </dl>
      <div className="material-detail__materials !w-full !rounded-3xl !border-blue-100 !bg-white !p-7 !shadow-[0_14px_34px_rgba(30,90,156,0.1)]">
        <div className="!mb-5 !flex !items-center !gap-3">
          <span className="!grid !size-11 !shrink-0 !place-items-center !rounded-2xl !bg-linear-to-br !from-blue-600 !to-cyan-500 !text-white !shadow-[0_8px_18px_rgba(37,99,235,0.24)]"><IconPackage size={22} aria-hidden="true" /></span>
          <div><h2 className="!m-0">Materiales solicitados</h2><p className="!mt-1 !text-sm !text-slate-500">Detalle de cantidades solicitadas y existencias disponibles.</p></div>
        </div>
        <div className="material-tracking__table-wrap !w-full !overflow-hidden !rounded-2xl !border-blue-100 !bg-white !shadow-[0_8px_22px_rgba(30,90,156,0.07)]">
          <table className="!w-full !table-fixed [&_thead]:!bg-linear-to-r [&_thead]:!from-[#f4f8fc] [&_thead]:!to-blue-50 [&_th]:!border-b [&_th]:!border-blue-100 [&_th]:!bg-transparent [&_th]:!px-5 [&_th]:!py-4 [&_th]:!font-extrabold [&_th]:!tracking-[0.06em] [&_th]:!text-[#315b79] [&_th:nth-child(1)]:!w-[38%] [&_th:nth-child(2)]:!w-[16%] [&_th:nth-child(3)]:!w-[16%] [&_th:nth-child(4)]:!w-[30%] [&_tbody_tr]:!transition-colors [&_tbody_tr]:!duration-200 hover:[&_tbody_tr]:!bg-blue-50/60 [&_td]:!border-b-0 [&_td]:!px-5 [&_td]:!py-5">
            <thead><tr><th>Material</th><th>Cantidad</th><th>Existencia</th><th>Nota</th></tr></thead>
            <tbody>
              {(request.detalles ?? []).map((detail) => (
                <tr key={detail.id}>
                  <td data-label="Material"><strong className="!font-black !text-[#073b73]">{detail.material?.nombre ?? `Material #${detail.idMaterial}`}</strong></td>
                  <td data-label="Cantidad"><span className="!inline-flex !rounded-xl !bg-blue-50 !px-3 !py-1.5 !font-extrabold !text-blue-700">{detail.cantidad} {detail.material?.unidadMedida ?? ''}</span></td>
                  <td data-label="Existencia"><span className="!inline-flex !min-w-10 !justify-center !rounded-xl !bg-emerald-50 !px-3 !py-1.5 !font-extrabold !text-emerald-700">{detail.material?.stockActual ?? '—'}</span></td>
                  <td className="!text-slate-600" data-label="Nota">{detail.observacion || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!request.detalles?.length ? <p className="material-detail__no-materials">No se recibió información de materiales para esta solicitud.</p> : null}
      </div>
      {pending ? <>
        <label className="material-review__motivo !w-full !gap-3 !rounded-3xl !border-blue-100 !bg-linear-to-br !from-white !to-blue-50/50 !p-7 !shadow-[0_14px_34px_rgba(30,90,156,0.1)] [&>span:first-child]:!font-extrabold [&>span:first-child]:!tracking-[0.06em] [&>span:first-child]:!text-[#073b73] [&_.provider-admin__control]:!w-full [&_textarea]:!min-h-32 [&_textarea]:!rounded-2xl [&_textarea]:!border-blue-100 [&_textarea]:!bg-white [&_textarea]:!shadow-inner focus-within:[&_textarea]:!border-blue-400 focus-within:[&_textarea]:!ring-4 focus-within:[&_textarea]:!ring-blue-100">
          <span>Motivo de rechazo (opcional)</span>
          <span className="provider-admin__control">
            <IconAlignLeft size={20} aria-hidden="true" />
            <textarea value={motivoRechazo} maxLength={1000} disabled={busy} onChange={(event) => setMotivoRechazo(event.target.value)} />
          </span>
        </label>
        <div className="material-review__actions !gap-4">
          <button type="button" className="material-review__approve group !inline-flex !min-h-14 !items-center !justify-center !gap-2.5 !rounded-2xl !border-0 !bg-linear-to-r !from-emerald-600 !to-teal-500 !px-7 !font-extrabold !text-white !shadow-[0_10px_24px_rgba(5,150,105,0.26)] !transition-all !duration-300 hover:!-translate-y-1 hover:!scale-[1.02] hover:!shadow-[0_16px_32px_rgba(5,150,105,0.36)] active:!translate-y-0 active:!scale-[0.97] disabled:!transform-none disabled:!opacity-60 motion-reduce:!transform-none motion-reduce:!transition-none" disabled={busy} onClick={() => setDecision('aprobar')}><IconCheck className="!transition-transform !duration-300 group-hover:!scale-125" size={20} aria-hidden="true" />{busy ? 'Procesando…' : 'Aprobar'}</button>
          <button type="button" className="material-review__reject group !inline-flex !min-h-14 !items-center !justify-center !gap-2.5 !rounded-2xl !border !border-rose-200 !bg-white !px-7 !font-extrabold !text-rose-700 !shadow-[0_8px_20px_rgba(225,29,72,0.12)] !transition-all !duration-300 hover:!-translate-y-1 hover:!scale-[1.02] hover:!border-rose-400 hover:!bg-rose-50 hover:!shadow-[0_14px_28px_rgba(225,29,72,0.2)] active:!translate-y-0 active:!scale-[0.97] disabled:!transform-none disabled:!opacity-60 motion-reduce:!transform-none motion-reduce:!transition-none" disabled={busy} onClick={() => setDecision('rechazar')}><IconX className="!transition-transform !duration-300 group-hover:!rotate-90" size={20} aria-hidden="true" />Rechazar</button>
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
