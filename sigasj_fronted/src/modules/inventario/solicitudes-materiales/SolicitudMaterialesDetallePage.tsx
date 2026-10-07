import { useEffect, useState } from 'react'
import { IconArrowLeft, IconInfoCircle, IconPackage, IconRefresh } from '@tabler/icons-react'
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

  const requestStatus = request?.estado?.toUpperCase()
  const pending = requestStatus === 'PENDIENTE'
  const approved = requestStatus === 'APROBADA' || requestStatus === 'APROBADO'
  const rejected = requestStatus === 'RECHAZADA' || requestStatus === 'RECHAZADO'

  return <section className="material-detail !mx-0 !w-full !max-w-none !gap-6" aria-labelledby="material-detail-title">
    {loading ? <div className="material-tracking__state" role="status"><span className="material-request__spinner" />Cargando detalle…</div> : null}
    {error ? <div className="material-tracking__state material-tracking__state--error" role="alert"><p>{error}</p><button type="button" onClick={retry}><IconRefresh size={18} aria-hidden="true" /> Reintentar</button></div> : null}
    {!loading && !error && request ? <>
      <header className="material-detail__header !w-full !rounded-3xl !border-sky-100 !bg-white !p-8 !shadow-[0_12px_34px_rgba(30,90,156,0.08)]">
        <div><p className="material-request__eyebrow">Solicitud de materiales</p><h1 id="material-detail-title">{request.codigo || `Solicitud #${request.id}`}</h1><p>Registrada el {formatSolicitudDate(request.fechaSolicitud)}</p></div>
        <div className="!flex !shrink-0 !flex-col !items-end !gap-4 max-[700px]:!w-full max-[700px]:!items-stretch">
          <span className={`material-tracking__badge !inline-flex !items-center !gap-2 !self-end !rounded-full !px-4 !py-2.5 !font-extrabold ${pending ? '!border-amber-200 !bg-linear-to-r !from-amber-50 !to-orange-50 !text-amber-700 !shadow-[0_7px_18px_rgba(217,119,6,0.14)]' : approved ? '!border-emerald-200 !bg-linear-to-r !from-emerald-50 !to-teal-50 !text-emerald-700 !shadow-[0_7px_18px_rgba(5,150,105,0.14)]' : rejected ? '!border-rose-200 !bg-linear-to-r !from-rose-50 !to-red-50 !text-rose-700 !shadow-[0_7px_18px_rgba(225,29,72,0.14)]' : ''}`} data-status={request.estado.toUpperCase()}>{pending || approved || rejected ? <span className={`!size-2 !rounded-full ${pending ? '!bg-amber-500 !shadow-[0_0_0_5px_rgba(245,158,11,0.12)]' : approved ? '!bg-emerald-500 !shadow-[0_0_0_5px_rgba(16,185,129,0.12)]' : '!bg-rose-500 !shadow-[0_0_0_5px_rgba(244,63,94,0.12)]'}`} aria-hidden="true" /> : null}{formatSolicitudStatus(request.estado)}</span>
          <Link className="material-detail__back group !inline-flex !w-fit !min-h-12 !items-center !gap-2.5 !self-end !rounded-2xl !border !border-blue-200 !bg-white !px-5 !py-3 !font-extrabold !text-blue-700 !shadow-[0_8px_20px_rgba(37,99,235,0.12)] !transition-all !duration-300 hover:!-translate-y-1 hover:!scale-[1.02] hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.2)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none max-[700px]:!w-full max-[700px]:!self-stretch" to={SOLICITUDES_MATERIALES_PATH}><IconArrowLeft className="!transition-transform !duration-300 group-hover:!-translate-x-1.5 motion-reduce:!transform-none" size={19} aria-hidden="true" /> Volver a mis solicitudes</Link>
        </div>
      </header>
      <dl className="material-detail__summary !grid !w-full !grid-cols-1 !gap-4 !rounded-3xl !border-blue-100 !bg-linear-to-br !from-white !via-blue-50/25 !to-sky-50/60 !p-7 !shadow-[0_14px_36px_rgba(30,90,156,0.1)] md:!grid-cols-2 xl:!grid-cols-3 [&>div]:!rounded-2xl [&>div]:!border [&>div]:!border-blue-100 [&>div]:!bg-white/90 [&>div]:!p-5 [&>div]:!shadow-[0_6px_16px_rgba(30,90,156,0.06)] [&>div]:!transition-all [&>div]:!duration-300 hover:[&>div]:!-translate-y-0.5 hover:[&>div]:!border-blue-200 hover:[&>div]:!shadow-[0_10px_22px_rgba(30,90,156,0.11)] [&_dt]:!mb-1 [&_dt]:!font-extrabold [&_dt]:!tracking-[0.07em] [&_dt]:!text-slate-500 [&_dd]:!text-lg [&_dd]:!font-extrabold [&_dd]:!text-[#073b73]">
        <div><dt>Avería relacionada</dt><dd>{request.averia?.codigo ?? request.averia?.numero ?? (request.idAveria ? `Avería #${request.idAveria}` : 'Sin avería relacionada')}</dd></div>
        <div><dt>Materiales distintos</dt><dd>{request.cantidadMateriales ?? request.detalles?.length ?? 0}</dd></div>
        <div><dt>Cantidad total</dt><dd>{request.totalMateriales ?? request.detalles?.reduce((sum, item) => sum + item.cantidad, 0) ?? 0}</dd></div>
        <div className="material-detail__summary-wide"><dt>Observación general</dt><dd>{request.observacion || 'Sin observación'}</dd></div>
      </dl>
      <div className="material-detail__materials !w-full !rounded-3xl !border-blue-100 !bg-white !p-7 !shadow-[0_14px_34px_rgba(30,90,156,0.1)]">
        <div className="!mb-5 !flex !items-center !gap-3"><span className="!grid !size-11 !shrink-0 !place-items-center !rounded-2xl !bg-linear-to-br !from-blue-600 !to-cyan-500 !text-white !shadow-[0_8px_18px_rgba(37,99,235,0.24)]"><IconPackage size={22} aria-hidden="true" /></span><div><h2 className="!m-0">Materiales solicitados</h2><p className="!mt-1 !text-sm !text-slate-500">Detalle de materiales y cantidades incluidas en la solicitud.</p></div></div>
        <div className="material-tracking__table-wrap !w-full !overflow-hidden !rounded-2xl !border-blue-100 !bg-white !shadow-[0_8px_22px_rgba(30,90,156,0.07)]"><table className="!w-full !table-fixed [&_thead]:!bg-linear-to-r [&_thead]:!from-[#f4f8fc] [&_thead]:!to-blue-50 [&_th]:!border-b [&_th]:!border-blue-100 [&_th]:!bg-transparent [&_th]:!px-5 [&_th]:!py-4 [&_th]:!font-extrabold [&_th]:!tracking-[0.06em] [&_th]:!text-[#315b79] [&_th:nth-child(1)]:!w-[45%] [&_th:nth-child(2)]:!w-[20%] [&_th:nth-child(3)]:!w-[35%] [&_tbody_tr]:!transition-colors [&_tbody_tr]:!duration-200 hover:[&_tbody_tr]:!bg-blue-50/60 [&_td]:!border-b-0 [&_td]:!px-5 [&_td]:!py-5"><thead><tr><th>Material</th><th>Cantidad</th><th>Nota</th></tr></thead><tbody>
          {(request.detalles ?? []).map((detail) => <tr key={detail.id}><td data-label="Material"><strong className="!font-black !text-[#073b73]">{detail.material?.nombre ?? `Material #${detail.idMaterial}`}</strong></td><td data-label="Cantidad"><span className="!inline-flex !rounded-xl !bg-blue-50 !px-3 !py-1.5 !font-extrabold !text-blue-700">{detail.cantidad} {detail.material?.unidadMedida ?? ''}</span></td><td className="!text-slate-600" data-label="Nota">{detail.observacion || '—'}</td></tr>)}
        </tbody></table></div>
        {!request.detalles?.length ? <p className="material-detail__no-materials">No se recibió información de materiales para esta solicitud.</p> : null}
      </div>
      <aside className="material-detail__notice !flex !w-full !flex-row !items-center !gap-4 !rounded-2xl !border-blue-200 !bg-linear-to-r !from-blue-50 !to-cyan-50 !p-5 !shadow-[0_8px_22px_rgba(37,99,235,0.08)]"><span className="!grid !size-10 !shrink-0 !place-items-center !rounded-xl !bg-blue-600 !text-white !shadow-md"><IconInfoCircle size={21} aria-hidden="true" /></span><span className="!grid !gap-1"><strong className="!text-[#073b73]">Consulta de seguimiento</strong><span className="!text-slate-600">Desde esta pantalla no se aprueban, rechazan ni despachan solicitudes.</span></span></aside>
    </> : null}
  </section>
}
