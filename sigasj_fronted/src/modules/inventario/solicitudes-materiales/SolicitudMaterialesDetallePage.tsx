import { useEffect, useState } from 'react'
import {
  IconArrowLeft,
  IconClipboardList,
  IconInfoCircle,
  IconPackage,
  IconRefresh,
  IconX,
} from '@tabler/icons-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import { SOLICITUDES_MATERIALES_PATH } from '../inventarioPaths'
import {
  cancelarMiSolicitudMateriales,
  getMiSolicitudMateriales,
} from './solicitudesMaterialesApi'
import {
  formatSolicitudDate,
  formatSolicitudStatus,
  getHttpErrorStatus,
} from './solicitudMaterialesUtils'
import type { SolicitudMateriales } from './types'

export default function SolicitudMaterialesDetallePage() {
  const { id } = useParams<{ id: string }>()
  const requestId = Number(id)
  const [request, setRequest] = useState<SolicitudMateriales | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [cancelBusy, setCancelBusy] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const navigate = useNavigate()

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
    void getMiSolicitudMateriales(requestId)
      .then((response) => {
        if (active) setRequest(response)
      })
      .catch((requestError) => {
        if (!active) return
        const status = getHttpErrorStatus(requestError)
        if (status === 401) {
          navigate('/login', { replace: true })
          return
        }
        if (status === 403)
          setError('Acceso denegado: esta solicitud no pertenece a su usuario.')
        else if (status === 404)
          setError('La solicitud indicada no existe en el sistema.')
        else setError('No fue posible consultar esta solicitud.')
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
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  const handleCancelar = async () => {
    if (cancelBusy || !request) return
    let active = true
    setCancelBusy(true)
    setCancelError('')
    try {
      await cancelarMiSolicitudMateriales(request.id)
      if (active) setReloadKey((value) => value + 1)
    } catch (requestError) {
      if (!active) return
      if (getHttpErrorStatus(requestError) === 401) {
        navigate('/login', { replace: true })
        return
      }
      setCancelError('No fue posible cancelar la solicitud. Intente nuevamente.')
    } finally {
      if (active) setCancelBusy(false)
      active = false
    }
  }

  const requestStatus = request?.estado?.toUpperCase()
  const pending = requestStatus === 'PENDIENTE'
  const approved =
    requestStatus === 'APROBADA' || requestStatus === 'APROBADO'
  const rejected =
    requestStatus === 'RECHAZADA' || requestStatus === 'RECHAZADO'
  const cancelled =
    requestStatus === 'CANCELADA' || requestStatus === 'CANCELADO'

  const statusBadgeClass = pending
    ? '!border-amber-200 !bg-gradient-to-r !from-amber-50 !to-orange-50 !text-amber-700 !shadow-[0_7px_18px_rgba(217,119,6,0.14)]'
    : approved
      ? '!border-emerald-200 !bg-gradient-to-r !from-emerald-50 !to-teal-50 !text-emerald-700 !shadow-[0_7px_18px_rgba(5,150,105,0.14)]'
      : rejected
        ? '!border-rose-200 !bg-gradient-to-r !from-rose-50 !to-red-50 !text-rose-700 !shadow-[0_7px_18px_rgba(225,29,72,0.14)]'
        : cancelled
          ? '!border-slate-200 !bg-slate-50 !text-slate-600 !shadow-[0_7px_18px_rgba(100,116,139,0.12)]'
          : '!border-[#cfe4f7] !bg-[#f3f9ff] !text-[#1e5a9c]'

  const statusDotClass = pending
    ? '!bg-amber-500 !shadow-[0_0_0_5px_rgba(245,158,11,0.12)]'
    : approved
      ? '!bg-emerald-500 !shadow-[0_0_0_5px_rgba(16,185,129,0.12)]'
      : cancelled
        ? '!bg-slate-400 !shadow-[0_0_0_5px_rgba(100,116,139,0.12)]'
        : '!bg-rose-500 !shadow-[0_0_0_5px_rgba(244,63,94,0.12)]'

  const averiaLabel =
    request?.averia?.codigo ??
    request?.averia?.numero ??
    (request?.idAveria ? `Avería #${request.idAveria}` : 'Sin avería relacionada')

  const materialesDistintos =
    request?.cantidadMateriales ?? request?.detalles?.length ?? 0
  const cantidadTotal =
    request?.totalMateriales ??
    request?.detalles?.reduce((sum, item) => sum + item.cantidad, 0) ??
    0

  return (
    <section
      className="material-detail !mx-0 !w-full !max-w-none !gap-5"
      aria-labelledby="material-detail-title"
    >
      {loading ? (
        <div className="material-tracking__state !rounded-2xl" role="status">
          <span className="material-request__spinner" />
          Cargando detalle…
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

      {!loading && !error && request ? (
        <>
          <header className="material-detail__header !relative !block !overflow-hidden !rounded-[1.5rem] !border-[#d7e8f7] !bg-gradient-to-br !from-white !via-[#f7fbff] !to-[#eaf4ff] !p-6 !shadow-[0_14px_32px_rgba(30,90,156,0.1)] sm:!p-7">
            <div
              className="pointer-events-none absolute -right-8 -top-10 hidden size-48 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.32)_0%,transparent_70%)] sm:block"
              aria-hidden="true"
            />

            <div className="relative z-[1] flex flex-wrap items-start justify-between gap-5">
              <div className="grid min-w-0 max-w-[40rem] gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#1e5a9c] to-[#38bdf8] text-white shadow-[0_10px_22px_rgba(30,90,156,0.28)] sm:size-[4.25rem]">
                  <IconClipboardList size={30} stroke={2.2} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="material-request__eyebrow !mb-1 !text-[0.72rem] !font-bold !tracking-[0.08em] !text-sigasj-primary">
                    Solicitud de materiales
                  </p>
                  <h1
                    className="!m-0 !text-[clamp(1.45rem,2.6vw,1.85rem)] !font-black !tracking-[-0.03em] !text-sigasj-ink"
                    id="material-detail-title"
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
                  {pending || approved || rejected || cancelled ? (
                    <span
                      className={`!size-2 !rounded-full ${statusDotClass}`}
                      aria-hidden="true"
                    />
                  ) : null}
                  {formatSolicitudStatus(request.estado)}
                </span>
                <Link
                  className="material-detail__back group !inline-flex !w-fit !min-h-11 !items-center !gap-2 !self-end !rounded-2xl !border !border-[#bfe3fa] !bg-white !px-4 !py-2.5 !font-extrabold !text-[#1e5a9c] !no-underline !shadow-[0_8px_20px_rgba(30,90,156,0.12)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-blue-400 hover:!bg-[#eaf6ff] hover:!shadow-[0_14px_28px_rgba(30,90,156,0.2)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none max-[700px]:!w-full max-[700px]:!justify-center max-[700px]:!self-stretch"
                  to={SOLICITUDES_MATERIALES_PATH}
                >
                  <IconArrowLeft
                    className="!transition-transform !duration-300 group-hover:!-translate-x-1 motion-reduce:!transform-none"
                    size={18}
                    aria-hidden="true"
                  />{' '}
                  Volver a mis solicitudes
                </Link>
              </div>
            </div>
          </header>

          <dl className="material-detail__summary !grid !w-full !grid-cols-1 !gap-3 !rounded-[1.5rem] !border !border-[#d7e8f7] !bg-gradient-to-br !from-white !via-[#f7fbff] !to-[#eef7ff] !p-5 !shadow-[0_12px_30px_rgba(30,90,156,0.08)] sm:!grid-cols-3 sm:!gap-4 sm:!p-6 [&>div]:!rounded-2xl [&>div]:!border [&>div]:!border-[#e2eef8] [&>div]:!bg-white [&>div]:!p-4 [&>div]:!shadow-sm [&_dt]:!mb-1 [&_dt]:!text-[0.7rem] [&_dt]:!font-extrabold [&_dt]:!tracking-[0.07em] [&_dt]:!text-slate-500 [&_dd]:!m-0 [&_dd]:!text-base [&_dd]:!font-extrabold [&_dd]:!leading-snug [&_dd]:!text-[#073b73] sm:[&_dd]:!text-lg">
            <div>
              <dt>Avería relacionada</dt>
              <dd>{averiaLabel}</dd>
            </div>
            <div>
              <dt>Materiales distintos</dt>
              <dd>{materialesDistintos}</dd>
            </div>
            <div>
              <dt>Cantidad total</dt>
              <dd>{cantidadTotal}</dd>
            </div>
            <div className="material-detail__summary-wide sm:!col-span-3">
              <dt>Observación general</dt>
              <dd className="!text-[0.95rem] !font-semibold !leading-relaxed !text-slate-700">
                {request.observacion || 'Sin observación'}
              </dd>
            </div>
          </dl>

          <div className="material-detail__materials !w-full !rounded-[1.5rem] !border !border-[#d7e8f7] !bg-white !p-5 !shadow-[0_12px_30px_rgba(30,90,156,0.08)] sm:!p-6">
            <div className="!mb-5 !flex !items-center !gap-3">
              <span className="!grid !size-11 !shrink-0 !place-items-center !rounded-2xl !bg-gradient-to-br !from-blue-600 !to-cyan-500 !text-white !shadow-[0_8px_18px_rgba(30,90,156,0.24)]">
                <IconPackage size={22} aria-hidden="true" />
              </span>
              <div>
                <h2 className="!m-0 !text-[1.1rem] !font-extrabold !tracking-tight !text-[#1e5a9c]">
                  Materiales solicitados
                </h2>
                <p className="!mt-1 !text-sm !text-slate-500">
                  Detalle de materiales y cantidades incluidas en la solicitud.
                </p>
              </div>
            </div>

            <div className="material-tracking__table-wrap !w-full !overflow-hidden !rounded-2xl !border !border-[#e2eef8] !bg-white !shadow-sm">
              <table className="!w-full !table-fixed [&_thead]:!bg-gradient-to-r [&_thead]:!from-[#f4f8fc] [&_thead]:!to-[#eaf6ff] [&_th]:!border-b [&_th]:!border-[#e2eef8] [&_th]:!bg-transparent [&_th]:!px-4 [&_th]:!py-3.5 [&_th]:!text-left [&_th]:!text-[0.72rem] [&_th]:!font-extrabold [&_th]:!tracking-[0.06em] [&_th]:!text-[#315b79] [&_th:nth-child(1)]:!w-[46%] [&_th:nth-child(2)]:!w-[22%] [&_th:nth-child(3)]:!w-[32%] [&_tbody_tr]:!border-b [&_tbody_tr]:!border-[#f0f5fa] [&_tbody_tr]:!transition-colors [&_tbody_tr]:!duration-200 hover:[&_tbody_tr]:!bg-[#f7fbff] [&_tbody_tr:last-child]:!border-b-0 [&_td]:!border-b-0 [&_td]:!px-4 [&_td]:!py-4">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Cantidad</th>
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

          <div className="!flex !flex-col !gap-4 sm:!flex-row sm:!items-center sm:!justify-between">
            <aside className="material-detail__notice !flex !min-w-0 !flex-1 !flex-row !items-start !gap-3 !rounded-2xl !border !border-[#cfe4f7] !bg-gradient-to-r !from-[#f5faff] !to-[#eef7ff] !p-4 !shadow-sm sm:!items-center">
              <span className="!grid !size-10 !shrink-0 !place-items-center !rounded-xl !bg-gradient-to-br !from-blue-600 !to-cyan-500 !text-white !shadow-md">
                <IconInfoCircle size={20} aria-hidden="true" />
              </span>
              <span className="!grid !gap-0.5">
                <strong className="!text-sm !font-extrabold !text-[#073b73]">
                  Consulta de seguimiento
                </strong>
                <span className="!text-sm !leading-relaxed !text-slate-600">
                  Desde esta pantalla no se aprueban, rechazan ni despachan
                  solicitudes.
                </span>
              </span>
            </aside>

            {pending ? (
              <button
                type="button"
                className="material-review__reject group !inline-flex !min-h-11 !shrink-0 !items-center !justify-center !gap-2 !rounded-2xl !border !border-rose-200 !bg-white !px-5 !font-extrabold !text-rose-700 !shadow-[0_8px_20px_rgba(225,29,72,0.12)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-rose-400 hover:!bg-rose-50 disabled:!opacity-60 max-[640px]:!w-full"
                disabled={cancelBusy}
                onClick={() => setConfirmCancel(true)}
              >
                <IconX size={18} aria-hidden="true" />
                {cancelBusy ? 'Cancelando…' : 'Cancelar solicitud'}
              </button>
            ) : null}
          </div>

          {cancelError ? (
            <div
              className="material-tracking__state material-tracking__state--error !rounded-2xl"
              role="alert"
            >
              {cancelError}
            </div>
          ) : null}
        </>
      ) : null}

      <ConfirmDialog
        isOpen={confirmCancel}
        title="Cancelar solicitud"
        message="¿Está seguro de cancelar esta solicitud? Esta acción no puede deshacerse y la solicitud quedará como cancelada."
        confirmLabel="Sí, cancelar"
        confirmDanger
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => {
          setConfirmCancel(false)
          void handleCancelar()
        }}
      />
    </section>
  )
}
