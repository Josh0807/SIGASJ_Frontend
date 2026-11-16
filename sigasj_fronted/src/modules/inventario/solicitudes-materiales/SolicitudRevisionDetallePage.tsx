import { useEffect, useState } from 'react'
import {
  IconAlignLeft,
  IconArrowLeft,
  IconCheck,
  IconCircleCheck,
  IconClipboardList,
  IconPackage,
  IconRefresh,
  IconX,
} from '@tabler/icons-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import { SALIDAS_PATH, SOLICITUDES_REVISION_PATH } from '../inventarioPaths'
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
  const [showSalidaLink, setShowSalidaLink] = useState(false)

  useEffect(() => {
    let active = true
    if (!Number.isInteger(requestId) || requestId <= 0) {
      queueMicrotask(() => {
        if (active) {
          setError('La solicitud indicada no es válida.')
          setLoading(false)
        }
      })
      return () => {
        active = false
      }
    }
    void getSolicitudMaterialesAdmin(requestId)
      .then((response) => {
        if (active) setRequest(response)
      })
      .catch((requestError) => {
        if (!active) return
        if (getHttpErrorStatus(requestError) === 401) {
          navigate('/login', { replace: true })
          return
        }
        setError(solicitudRevisionErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [navigate, requestId, reloadKey])

  const retry = () => {
    setError('')
    setSuccess('')
    setShowSalidaLink(false)
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
      const updated =
        decision === 'aprobar'
          ? await aprobarSolicitudMaterialesAdmin(request.id)
          : await rechazarSolicitudMaterialesAdmin(request.id, motivoRechazo)
      setRequest(updated)
      if (decision === 'aprobar') {
        setSuccess('La solicitud fue aprobada. Las existencias no se modificaron.')
        setShowSalidaLink(true)
      } else {
        setSuccess('La solicitud fue rechazada. Las existencias no se modificaron.')
        setShowSalidaLink(false)
      }
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

  const averiaRef = request ? getSolicitudAveriaReference(request) : '—'
  const hasAveria = Boolean(averiaRef && averiaRef !== '—')
  const materialesDistintos = request ? getSolicitudMaterialesCount(request) : 0
  const cantidadTotal =
    request?.totalMateriales ??
    request?.detalles?.reduce((sum, item) => sum + item.cantidad, 0) ??
    0

  const statusBadgeClass = pending
    ? '!border-amber-200 !bg-[linear-gradient(90deg,#fffbeb,#fff7ed)] !text-amber-700 !shadow-[0_7px_18px_rgba(217,119,6,0.14)]'
    : approved
      ? '!border-emerald-200 !bg-[linear-gradient(90deg,#ecfdf5,#f0fdfa)] !text-emerald-700 !shadow-[0_7px_18px_rgba(5,150,105,0.14)]'
      : rejected
        ? '!border-rose-200 !bg-[linear-gradient(90deg,#fff1f2,#fef2f2)] !text-rose-700 !shadow-[0_7px_18px_rgba(225,29,72,0.14)]'
        : '!border-[#cfe4f7] !bg-[#f3f9ff] !text-[#1e5a9c]'

  const statusDotClass = pending
    ? '!bg-amber-500 !shadow-[0_0_0_5px_rgba(245,158,11,0.12)]'
    : approved
      ? '!bg-emerald-500 !shadow-[0_0_0_5px_rgba(16,185,129,0.12)]'
      : '!bg-rose-500 !shadow-[0_0_0_5px_rgba(244,63,94,0.12)]'

  return (
    <section
      className="material-detail !mx-0 !w-full !max-w-none !gap-5"
      aria-labelledby="solicitud-revision-detail-title"
    >
      {loading ? (
        <div className="material-tracking__state !rounded-2xl" role="status">
          <span className="material-request__spinner" />
          Cargando solicitud…
        </div>
      ) : null}

      {error ? (
        <div
          className="material-tracking__state material-tracking__state--error !rounded-2xl"
          role="alert"
        >
          <p>{error}</p>
          <button type="button" onClick={retry}>
            <IconRefresh size={18} aria-hidden="true" /> Reintentar
          </button>
        </div>
      ) : null}

      {success ? (
        <div className="material-tracking__state !rounded-2xl" role="status">
          {success}
          {showSalidaLink && request ? (
            <Link
              className="material-tracking__detail-link !ml-4"
              to={`${SALIDAS_PATH}?idSolicitud=${request.id}`}
            >
              Registrar salida de bodega →
            </Link>
          ) : null}
        </div>
      ) : null}

      {!loading && request ? (
        <>
          <header className="material-detail__header !relative !block !overflow-hidden !rounded-[1.5rem] !border-[#d7e8f7] !bg-[linear-gradient(145deg,#ffffff_0%,#f7fbff_55%,#eef6fc_100%)] !p-6 !shadow-[0_14px_32px_rgba(30,90,156,0.1)] sm:!p-7">
            <div className="relative z-[1] flex flex-wrap items-start justify-between gap-5">
              <div className="grid min-w-0 max-w-[42rem] gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(145deg,#1e5a9c,#123f70)] text-white shadow-[0_10px_22px_rgba(30,90,156,0.28)] sm:size-[4.25rem]">
                  <IconClipboardList size={30} stroke={2.2} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="material-request__eyebrow !mb-1 !text-[0.72rem] !font-bold !tracking-[0.08em] !text-[#1e5a9c]">
                    Inventario · Revisión
                  </p>
                  <h1
                    className="!m-0 !text-[clamp(1.45rem,2.6vw,1.85rem)] !font-black !tracking-[-0.03em] !text-[#123f70]"
                    id="solicitud-revision-detail-title"
                  >
                    {request.codigo || `Solicitud #${request.id}`}
                  </h1>
                  <p className="!mt-2 !text-[0.95rem] !leading-relaxed !text-slate-600">
                    Registrada el {formatSolicitudDate(request.fechaSolicitud)}
                  </p>
                </div>
              </div>

              <div className="!flex !shrink-0 !flex-col !items-end !gap-3 max-[700px]:!w-full max-[700px]:!items-stretch">
                <span
                  className={`material-tracking__badge !inline-flex !items-center !gap-2 !self-end !rounded-full !border !px-4 !py-2.5 !font-extrabold ${statusBadgeClass}`}
                  data-status={request.estado.toUpperCase()}
                >
                  {pending || approved || rejected ? (
                    <span
                      className={`!size-2 !rounded-full ${statusDotClass}`}
                      aria-hidden="true"
                    />
                  ) : null}
                  {formatSolicitudStatus(request.estado)}
                </span>
                <Link
                  className="material-detail__back group !inline-flex !w-fit !min-h-11 !items-center !gap-2 !self-end !rounded-2xl !border !border-[#bfe3fa] !bg-white !px-4 !py-2.5 !font-extrabold !text-[#1e5a9c] !no-underline !shadow-[0_8px_20px_rgba(30,90,156,0.12)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-[#7db7ed] hover:!bg-[#eaf6ff] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none max-[700px]:!w-full max-[700px]:!justify-center max-[700px]:!self-stretch"
                  to={SOLICITUDES_REVISION_PATH}
                >
                  <IconArrowLeft
                    className="!transition-transform !duration-300 group-hover:!-translate-x-1 motion-reduce:!transform-none"
                    size={18}
                    aria-hidden="true"
                  />{' '}
                  Volver a solicitudes pendientes
                </Link>
              </div>
            </div>
          </header>

          <dl
            className={`material-detail__summary !m-0 !grid !w-full !gap-3 !rounded-[1.5rem] !border !border-[#d7e8f7] !bg-[linear-gradient(145deg,#ffffff_0%,#f7fbff_55%,#eef6fc_100%)] !p-5 !shadow-[0_12px_30px_rgba(30,90,156,0.08)] sm:!gap-4 sm:!p-6 ${
              hasAveria
                ? 'sm:!grid-cols-2 xl:!grid-cols-4'
                : 'sm:!grid-cols-3'
            } [&>div]:!m-0 [&>div]:!rounded-2xl [&>div]:!border [&>div]:!border-[#e2eef8] [&>div]:!bg-white [&>div]:!p-4 [&>div]:!shadow-sm sm:[&>div]:!min-h-[5.5rem] sm:[&>div]:!p-5 [&_dt]:!mb-1.5 [&_dt]:!text-[0.7rem] [&_dt]:!font-extrabold [&_dt]:!tracking-[0.07em] [&_dt]:!text-slate-500 [&_dd]:!m-0 [&_dd]:!text-base [&_dd]:!font-extrabold [&_dd]:!leading-snug [&_dd]:!text-[#073b73] sm:[&_dd]:!text-lg`}
          >
            <div>
              <dt>Fontanero</dt>
              <dd>{getSolicitudFontaneroNombre(request)}</dd>
            </div>
            {hasAveria ? (
              <div>
                <dt>Avería relacionada</dt>
                <dd>{averiaRef}</dd>
              </div>
            ) : null}
            <div>
              <dt>Materiales distintos</dt>
              <dd>{materialesDistintos}</dd>
            </div>
            <div>
              <dt>Cantidad total</dt>
              <dd>{cantidadTotal}</dd>
            </div>
            <div
              className={`material-detail__summary-wide !min-h-0 sm:!col-span-full ${
                hasAveria ? 'xl:!col-span-4' : 'sm:!col-span-3'
              }`}
            >
              <dt>Observación general</dt>
              <dd className="!text-[0.95rem] !font-semibold !leading-relaxed !text-slate-700">
                {request.observacion || 'Sin observación'}
              </dd>
            </div>
            {request.fechaRevision ? (
              <div>
                <dt>Fecha de revisión</dt>
                <dd>{formatSolicitudDate(request.fechaRevision)}</dd>
              </div>
            ) : null}
            {request.idUsuarioAprobador ? (
              <div>
                <dt>Revisada por</dt>
                <dd>
                  {request.usuarioAprobador?.nombre ||
                    `Usuario #${request.idUsuarioAprobador}`}
                </dd>
              </div>
            ) : null}
            {request.motivoRechazo ? (
              <div className="material-detail__summary-wide sm:!col-span-full">
                <dt>Motivo de rechazo</dt>
                <dd className="!text-[0.95rem] !font-semibold !leading-relaxed !text-rose-800">
                  {request.motivoRechazo}
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="material-detail__materials !w-full !rounded-[1.5rem] !border !border-[#d7e8f7] !bg-white !p-5 !shadow-[0_12px_30px_rgba(30,90,156,0.08)] sm:!p-6">
            <div className="!mb-5 !flex !items-center !gap-3">
              <span className="!grid !size-11 !shrink-0 !place-items-center !rounded-2xl !bg-[linear-gradient(145deg,#1e5a9c,#123f70)] !text-white !shadow-[0_8px_18px_rgba(30,90,156,0.24)]">
                <IconPackage size={22} aria-hidden="true" />
              </span>
              <div>
                <h2 className="!m-0 !text-[1.1rem] !font-extrabold !tracking-tight !text-[#1e5a9c]">
                  Materiales solicitados
                </h2>
                <p className="!mt-1 !text-sm !text-slate-500">
                  Detalle de cantidades solicitadas y existencias disponibles.
                </p>
              </div>
            </div>

            <div className="material-tracking__table-wrap !w-full !overflow-hidden !rounded-2xl !border !border-[#e2eef8] !bg-white !shadow-sm">
              <table className="!w-full !table-fixed [&_thead]:!bg-[linear-gradient(90deg,#f4f8fc,#eaf6ff)] [&_th]:!border-b [&_th]:!border-[#e2eef8] [&_th]:!bg-transparent [&_th]:!px-4 [&_th]:!py-3.5 [&_th]:!text-left [&_th]:!text-[0.72rem] [&_th]:!font-extrabold [&_th]:!tracking-[0.06em] [&_th]:!text-[#315b79] [&_th:nth-child(1)]:!w-[38%] [&_th:nth-child(2)]:!w-[16%] [&_th:nth-child(3)]:!w-[16%] [&_th:nth-child(4)]:!w-[30%] [&_tbody_tr]:!border-b [&_tbody_tr]:!border-[#f0f5fa] [&_tbody_tr]:!transition-colors hover:[&_tbody_tr]:!bg-[#f7fbff] [&_tbody_tr:last-child]:!border-b-0 [&_td]:!border-b-0 [&_td]:!px-4 [&_td]:!py-4">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Cantidad</th>
                    <th>Existencia</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {(request.detalles ?? []).map((detail) => (
                    <tr key={detail.id}>
                      <td data-label="Material">
                        <strong className="!font-extrabold !text-[#073b73]">
                          {detail.material?.nombre ??
                            `Material #${detail.idMaterial}`}
                        </strong>
                      </td>
                      <td data-label="Cantidad">
                        <span className="!inline-flex !rounded-xl !border !border-[#cfe4f7] !bg-[#eaf6ff] !px-3 !py-1.5 !text-sm !font-extrabold !text-[#1e5a9c]">
                          {detail.cantidad}{' '}
                          {detail.material?.unidadMedida ?? ''}
                        </span>
                      </td>
                      <td data-label="Existencia">
                        <span className="!inline-flex !min-w-10 !justify-center !rounded-xl !border !border-emerald-100 !bg-emerald-50 !px-3 !py-1.5 !text-sm !font-extrabold !text-emerald-700">
                          {detail.material?.stockActual ?? '—'}
                        </span>
                      </td>
                      <td className="!text-slate-600" data-label="Nota">
                        {detail.observacion || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!request.detalles?.length ? (
              <p className="material-detail__no-materials">
                No se recibió información de materiales para esta solicitud.
              </p>
            ) : null}
          </div>

          {pending ? (
            <div className="material-review__motivo !grid !w-full !gap-5 !rounded-[1.5rem] !border !border-[#d7e8f7] !bg-[linear-gradient(145deg,#ffffff_0%,#f7fbff_100%)] !p-5 !shadow-[0_12px_30px_rgba(30,90,156,0.08)] sm:!p-6">
              <label className="!grid !w-full !gap-2.5">
                <span className="!text-[0.72rem] !font-extrabold !uppercase !tracking-[0.07em] !text-slate-500">
                  Motivo de rechazo (opcional)
                </span>
                <span className="provider-admin__control !flex !w-full !items-start !gap-3 !rounded-2xl !border !border-[#e2eef8] !bg-white !px-4 !py-3 !shadow-inner focus-within:!border-[#7db7ed] focus-within:!ring-4 focus-within:!ring-[#dcebff]">
                  <IconAlignLeft
                    className="!mt-1 !shrink-0 !text-slate-400"
                    size={20}
                    aria-hidden="true"
                  />
                  <textarea
                    className="!min-h-36 !w-full !resize-y !border-0 !bg-transparent !p-0 !text-[0.95rem] !leading-relaxed !text-[#123f70] !outline-none"
                    value={motivoRechazo}
                    maxLength={1000}
                    disabled={busy}
                    placeholder="Describa el motivo si va a rechazar la solicitud…"
                    onChange={(event) => setMotivoRechazo(event.target.value)}
                  />
                </span>
              </label>

              <div className="material-review__actions !flex !w-full !flex-col !gap-3 sm:!flex-row sm:!items-center sm:!justify-end">
                <button
                  type="button"
                  className="material-review__approve group !inline-flex !min-h-12 !flex-1 !items-center !justify-center !gap-2.5 !rounded-2xl !border-0 !bg-[linear-gradient(90deg,#059669,#14b8a6)] !px-7 !font-extrabold !text-white !shadow-[0_10px_24px_rgba(5,150,105,0.26)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!shadow-[0_16px_32px_rgba(5,150,105,0.36)] active:!translate-y-0 active:!scale-[0.97] disabled:!opacity-60 motion-reduce:!transform-none sm:!flex-none sm:!min-w-[11rem]"
                  disabled={busy}
                  onClick={() => setDecision('aprobar')}
                >
                  <IconCheck
                    className="!transition-transform !duration-300 group-hover:!scale-110"
                    size={20}
                    aria-hidden="true"
                  />
                  {busy ? 'Procesando…' : 'Aprobar'}
                </button>
                <button
                  type="button"
                  className="material-review__reject group !inline-flex !min-h-12 !flex-1 !items-center !justify-center !gap-2.5 !rounded-2xl !border !border-rose-200 !bg-white !px-7 !font-extrabold !text-rose-700 !shadow-[0_8px_20px_rgba(225,29,72,0.12)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-rose-400 hover:!bg-rose-50 active:!translate-y-0 active:!scale-[0.97] disabled:!opacity-60 motion-reduce:!transform-none sm:!flex-none sm:!min-w-[11rem]"
                  disabled={busy}
                  onClick={() => setDecision('rechazar')}
                >
                  <IconX
                    className="!transition-transform !duration-300 group-hover:!rotate-90"
                    size={20}
                    aria-hidden="true"
                  />
                  Rechazar
                </button>
              </div>
            </div>
          ) : (
            <aside className="material-detail__notice !flex !items-center !gap-4 !rounded-2xl !border !border-emerald-200 !bg-[linear-gradient(90deg,#ecfdf5,#f0fdfa)] !px-5 !py-4 !text-emerald-950 !shadow-[0_8px_22px_rgba(5,150,105,0.1)]">
              <span
                className="!grid !size-11 !shrink-0 !place-items-center !rounded-xl !bg-emerald-600 !text-white !shadow-[0_7px_16px_rgba(5,150,105,0.24)]"
                aria-hidden="true"
              >
                <IconCircleCheck size={24} />
              </span>
              <span className="!flex !min-w-0 !flex-col !gap-1">
                <strong className="!text-base !font-black !text-emerald-900">
                  Solicitud procesada
                </strong>
                <span className="!text-sm !leading-relaxed !text-emerald-800">
                  Esta solicitud ya fue atendida y su estado se encuentra
                  actualizado.
                </span>
              </span>
            </aside>
          )}
        </>
      ) : null}

      <ConfirmDialog
        isOpen={decision === 'aprobar'}
        title="Aprobar solicitud"
        message="¿Está segura de aprobar esta solicitud? La decisión no se podrá revertir desde este flujo y no modificará las existencias."
        confirmLabel="Aprobar solicitud"
        onCancel={() => setDecision(null)}
        onConfirm={() => {
          void confirmDecision()
        }}
      />
      <ConfirmDialog
        isOpen={decision === 'rechazar'}
        title="Rechazar solicitud"
        message="¿Está segura de rechazar esta solicitud? La decisión no se podrá revertir desde este flujo y no modificará las existencias."
        confirmLabel="Rechazar solicitud"
        confirmDanger
        onCancel={() => setDecision(null)}
        onConfirm={() => {
          void confirmDecision()
        }}
      />
    </section>
  )
}
