import { useEffect, useState } from 'react'
import {
  IconArrowLeft,
  IconClipboardList,
  IconInfoCircle,
  IconPackage,
  IconRefresh,
  IconX,
} from '@tabler/icons-react'
import { useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import {
  AdminShell,
  Alert,
  Button,
  Card,
  PageHeader,
} from '../../../shared/ui'
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
    ? 'border-amber-200 bg-amber-50 text-amber-700'
    : approved
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : rejected
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : cancelled
          ? 'border-slate-200 bg-slate-50 text-slate-600'
          : 'border-sigasj-border bg-sigasj-surface-soft text-sigasj-primary'

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
    <AdminShell
      className="material-detail gap-5 sm:gap-6"
      aria-labelledby="material-detail-title"
    >
      {loading ? (
        <Alert tone="info">Cargando detalle…</Alert>
      ) : null}

      {error ? (
        <Alert tone="danger">
          <div className="grid gap-3">
            <p className="m-0 font-semibold">{error}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="justify-self-start"
              leftIcon={<IconRefresh size={16} aria-hidden="true" />}
              onClick={retry}
            >
              Reintentar
            </Button>
          </div>
        </Alert>
      ) : null}

      {!loading && !error && request ? (
        <>
          <PageHeader
            id="material-detail-title"
            eyebrow="Solicitud de materiales"
            title={
              <span className="inline-flex flex-wrap items-center gap-3">
                <IconClipboardList size={22} aria-hidden="true" />
                {request.codigo || `Solicitud #${request.id}`}
                <span
                  className={`material-tracking__badge inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-extrabold ${statusBadgeClass}`}
                  data-status={request.estado.toUpperCase()}
                >
                  {pending || approved || rejected || cancelled ? (
                    <span
                      className={`size-2 rounded-full ${statusDotClass}`}
                      aria-hidden="true"
                    />
                  ) : null}
                  {formatSolicitudStatus(request.estado)}
                </span>
              </span>
            }
            description={`Registrada el ${formatSolicitudDate(request.fechaSolicitud)}`}
            actions={
              <Button
                to={SOLICITUDES_MATERIALES_PATH}
                variant="secondary"
                leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
              >
                Mis solicitudes
              </Button>
            }
          />

          <Card padded className="material-detail__summary w-full">
            <dl className="m-0 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 [&>div]:rounded-[10px] [&>div]:border [&>div]:border-sigasj-border [&>div]:bg-sigasj-surface-soft/40 [&>div]:p-4 [&_dt]:mb-1 [&_dt]:text-[0.7rem] [&_dt]:font-extrabold [&_dt]:tracking-[0.07em] [&_dt]:text-sigasj-muted [&_dd]:m-0 [&_dd]:text-base [&_dd]:font-extrabold [&_dd]:text-sigasj-ink">
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
          </Card>

          <Card padded className="material-detail__materials !gap-4">
            <div className="!mb-5 !flex !items-center !gap-3">
              <span className="!grid !size-11 !shrink-0 !place-items-center !rounded-2xl !bg-[#1e5a9c] !text-white !shadow-[0_8px_18px_rgba(30,90,156,0.24)]">
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
          </Card>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Alert
              tone="info"
              className="material-detail__notice min-w-0 flex-1"
              title="Consulta de seguimiento"
              icon={<IconInfoCircle size={20} aria-hidden="true" />}
            >
              Desde esta pantalla no se aprueban, rechazan ni despachan solicitudes.
            </Alert>

            {pending ? (
              <Button
                type="button"
                variant="danger"
                disabled={cancelBusy}
                onClick={() => setConfirmCancel(true)}
                leftIcon={<IconX size={18} aria-hidden="true" />}
              >
                {cancelBusy ? 'Cancelando…' : 'Cancelar solicitud'}
              </Button>
            ) : null}
          </div>

          {cancelError ? (
            <Alert tone="danger">{cancelError}</Alert>
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
    </AdminShell>
  )
}
