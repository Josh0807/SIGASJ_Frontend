import {
  IconArrowLeft,
  IconCheck,
  IconFileDescription,
  IconX,
} from '@tabler/icons-react'
import { useCallback, useEffect, useId, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import {
  AdminShell,
  Alert,
  Button,
  PageHeader,
} from '../../../shared/ui'
import { useAuth } from '../../auth/components/AuthContext'
import {
  esNoAutenticado,
  getHttpStatus,
  nombreCompleto,
} from '../../recursos-humanos/colaboradorForm'
import { formatearFechaPermiso } from '../../recursos-humanos/permisoForm'
import { PERMISOS_PATH, RRHH_TITLE, VACACIONES_PATH } from '../../recursos-humanos/recursosHumanosPaths'
import RrhhSubnav from '../../recursos-humanos/RrhhSubnav'
import {
  mensajeErrorAprobarSolicitud,
  mensajeErrorRechazarSolicitud,
} from '../solicitudAusenciaAdminMessages'
import {
  estadoSolicitudAusenciaClassName,
  estadoSolicitudAusenciaLabel,
  tipoSolicitudAusenciaLabel,
} from '../solicitudAusenciaLabels'
import {
  abrirEvidenciaSolicitudAusencia,
  aprobarSolicitudAusencia,
  getSolicitudAusencia,
  rechazarSolicitudAusencia,
} from '../solicitudesAusenciaApi'
import { SOLICITUDES_AUSENCIA_ADMIN_PATH } from '../solicitudesAusenciaPaths'
import type { SolicitudAusencia } from '../types'
type Carga = {
  clave: string
  solicitud: SolicitudAusencia | null
  error: string | null
}

function DetalleCampo({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[minmax(8rem,32%)_minmax(0,1fr)] sm:items-baseline sm:gap-4">
      <dt className="text-sm font-semibold text-[color:var(--asada-muted,#5b7390)]">
        {label}
      </dt>
      <dd className="m-0 break-words text-[0.95rem] font-bold leading-5 text-[color:var(--asada-ink,#123f70)]">
        {children}
      </dd>
    </div>
  )
}

/**
 * PBI 6.5.7 — Detalle admin: aprobar/rechazar vía API 6.5.4 (sin crear RRHH desde FE).
 */
export default function SolicitudAusenciaDetallePage() {
  const { id } = useParams()
  const solicitudId = Number(id)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const motivoId = useId()
  const [recarga, setRecarga] = useState(0)
  const [carga, setCarga] = useState<Carga>({
    clave: '',
    solicitud: null,
    error: null,
  })
  const [accionError, setAccionError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [busy, setBusy] = useState<'aprobar' | 'rechazar' | null>(null)
  const [modalRechazo, setModalRechazo] = useState(false)
  const [modalAprobar, setModalAprobar] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const idValido = Number.isInteger(solicitudId) && solicitudId > 0
  const clave = `${solicitudId}:${recarga}`
  const cargando = idValido && carga.clave !== clave

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  useEffect(() => {
    if (!idValido) return undefined
    const controller = new AbortController()
    getSolicitudAusencia(solicitudId, controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return
        setCarga({ clave, solicitud: respuesta, error: null })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (esNoAutenticado(err)) {
          salirPorSesion()
          return
        }
        setCarga({
          clave,
          solicitud: null,
          error:
            getHttpStatus(err) === 404
              ? 'No se encontró la solicitud.'
              : 'No fue posible cargar la solicitud.',
        })
      })
    return () => controller.abort()
  }, [clave, idValido, solicitudId, salirPorSesion])

  useEffect(() => {
    if (!modalRechazo && !modalAprobar) return undefined
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        setModalRechazo(false)
        setModalAprobar(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalRechazo, modalAprobar, busy])

  const solicitud = carga.solicitud
  const mensajeAprobar =
    solicitud?.tipo === 'VACACIONES'
      ? `Se descontarán ${solicitud.resumenVacaciones?.diasNetos ?? 'los'} día(s) netos (sin feriados) del saldo.`
      : 'Se creará el registro oficial en Permisos.'

  const textoAvisoCorreo = (
    decision: 'aprobada' | 'rechazada',
    aviso?: SolicitudAusencia['avisoCorreo'],
  ) => {
    if (!aviso) {
      return 'Se intentó avisar por campana; el correo no reportó estado.'
    }
    if (aviso.enviado && aviso.destinos.length > 0) {
      const destinos = aviso.destinos.join(', ')
      if (aviso.vistaPreviaUrl) {
        return `Correo de ${decision} generado hacia ${destinos} (vista previa de prueba: ${aviso.vistaPreviaUrl}).`
      }
      return `Correo de ${decision} enviado a ${destinos}.`
    }
    return `No se envió correo${aviso.motivoOmitido ? `: ${aviso.motivoOmitido}` : '.'}`
  }

  const aprobar = async () => {
    if (!solicitud || busy) return
    setModalAprobar(false)
    setBusy('aprobar')
    setAccionError(null)
    setAviso(null)
    try {
      const actualizada = await aprobarSolicitudAusencia(solicitud.id)
      setCarga({ clave, solicitud: actualizada, error: null })
      const base =
        actualizada.tipo === 'VACACIONES'
          ? 'Solicitud aprobada. El movimiento de vacaciones quedó en RRHH.'
          : 'Solicitud aprobada. El permiso quedó en RRHH.'
      setAviso(`${base} ${textoAvisoCorreo('aprobada', actualizada.avisoCorreo)}`)
    } catch (err: unknown) {
      if (esNoAutenticado(err)) {
        salirPorSesion()
        return
      }
      setAccionError(mensajeErrorAprobarSolicitud(err))
      if (getHttpStatus(err) === 409 || getHttpStatus(err) === 404) {
        setRecarga((n) => n + 1)
      }
    } finally {
      setBusy(null)
    }
  }

  const confirmarRechazo = async () => {
    if (!solicitud || busy) return
    setBusy('rechazar')
    setAccionError(null)
    setAviso(null)
    try {
      const actualizada = await rechazarSolicitudAusencia(
        solicitud.id,
        motivoRechazo.trim() || undefined,
      )
      setCarga({ clave, solicitud: actualizada, error: null })
      setAviso(
        `Solicitud rechazada. No se generó registro en RRHH. ${textoAvisoCorreo('rechazada', actualizada.avisoCorreo)}`,
      )
      setModalRechazo(false)
      setMotivoRechazo('')
    } catch (err: unknown) {
      if (esNoAutenticado(err)) {
        salirPorSesion()
        return
      }
      setAccionError(mensajeErrorRechazarSolicitud(err))
      if (getHttpStatus(err) === 409 || getHttpStatus(err) === 404) {
        setModalRechazo(false)
        setRecarga((n) => n + 1)
      }
    } finally {
      setBusy(null)
    }
  }

  return (
    <AdminShell
      className="mx-auto max-w-4xl gap-5 sm:gap-6"
      aria-labelledby="solicitud-ausencia-admin-detalle-title"
    >
      <RrhhSubnav />

      <PageHeader
        id="solicitud-ausencia-admin-detalle-title"
        eyebrow={
          solicitud
            ? `${RRHH_TITLE} · Solicitud de ausencia`
            : `${RRHH_TITLE} · Solicitud`
        }
        title={
          solicitud ? (
            <span className="inline-flex flex-wrap items-center gap-3">
              {tipoSolicitudAusenciaLabel(solicitud.tipo)}
              <span
                className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-3 py-1 text-xs font-extrabold tracking-[0.01em] ${estadoSolicitudAusenciaClassName(solicitud.estado)}`}
              >
                <span
                  className={`size-2 rounded-full ${
                    solicitud.estado === 'PENDIENTE'
                      ? 'bg-amber-500'
                      : solicitud.estado === 'APROBADA'
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                  }`}
                  aria-hidden="true"
                />
                {estadoSolicitudAusenciaLabel(solicitud.estado)}
              </span>
            </span>
          ) : (
            'Detalle de solicitud'
          )
        }
        description={
          solicitud
            ? `Registrada el ${formatearFechaPermiso(solicitud.createdAt.slice(0, 10))}`
            : 'Revise los datos y apruebe o rechace según corresponda.'
        }
        actions={
          <Button
            to={SOLICITUDES_AUSENCIA_ADMIN_PATH}
            variant="secondary"
            size="sm"
            leftIcon={<IconArrowLeft size={16} aria-hidden="true" />}
          >
            Volver a solicitudes
          </Button>
        }
      />

      {!idValido || (!cargando && (carga.error || !solicitud)) ? (
        <Alert tone="danger">
          <div className="grid gap-3">
            <p className="m-0 font-semibold">
              {carga.error ?? 'No se encontró la solicitud.'}
            </p>
            {idValido ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="justify-self-start"
                onClick={() => setRecarga((n) => n + 1)}
              >
                Reintentar
              </Button>
            ) : null}
          </div>
        </Alert>
      ) : cargando || !solicitud ? (
        <Alert tone="info" role="status">
          Cargando solicitud…
        </Alert>
      ) : (
        <>
          {aviso ? (
            <div
              className="grid gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-semibold text-emerald-800"
              role="status"
            >
              <p className="m-0">{aviso}</p>
              {solicitud.estado === 'APROBADA' ? (
                <p className="m-0 text-sm font-medium">
                  {solicitud.tipo === 'VACACIONES' ? (
                    <Link to={VACACIONES_PATH} className="text-emerald-900 underline">
                      Ver vacaciones / movimientos
                    </Link>
                  ) : (
                    <Link to={PERMISOS_PATH} className="text-emerald-900 underline">
                      Ver permisos
                    </Link>
                  )}
                </p>
              ) : null}
            </div>
          ) : null}
          {accionError ? (
            <div
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-800"
              role="alert"
            >
              {accionError}
            </div>
          ) : null}

          <article className="min-w-0 overflow-hidden rounded-2xl border border-[color:var(--asada-line,#d7e5f1)] bg-white shadow-[0_12px_28px_rgba(18,63,112,0.07)] sm:rounded-3xl">
            <dl className="m-0 divide-y divide-[color:var(--asada-line,#d7e5f1)] px-4 pt-4 sm:px-6 sm:pt-5">
              <DetalleCampo label="Colaborador">
                {solicitud.colaborador
                  ? nombreCompleto(solicitud.colaborador)
                  : `#${solicitud.colaboradorId}`}
              </DetalleCampo>
              <DetalleCampo label="Correo para aviso">
                {solicitud.correoNotificacion?.trim() ||
                  solicitud.colaborador?.correoElectronico?.trim() ||
                  'Sin correo indicado'}
              </DetalleCampo>
              <DetalleCampo label="Periodo">
                {formatearFechaPermiso(solicitud.fechaInicio)} —{' '}
                {formatearFechaPermiso(solicitud.fechaFin)}
              </DetalleCampo>
              <DetalleCampo label="Motivo">
                {solicitud.motivo?.trim() || 'Sin motivo'}
              </DetalleCampo>
              <DetalleCampo label="Fecha de solicitud">
                {formatearFechaPermiso(solicitud.createdAt.slice(0, 10))}
              </DetalleCampo>
              {solicitud.tipo === 'VACACIONES' && solicitud.resumenVacaciones ? (
                <div className="grid gap-1.5 bg-[#f7fbff] py-3.5 sm:grid-cols-[minmax(8rem,32%)_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm font-semibold text-[color:var(--asada-navy,#1e5a9c)]">
                    Días a descontar
                  </dt>
                  <dd className="m-0 text-[0.95rem] font-bold leading-5 text-[color:var(--asada-ink,#123f70)]">
                    Calendario: {solicitud.resumenVacaciones.diasCalendario} · Feriados:{' '}
                    {solicitud.resumenVacaciones.feriados.length} · Netos:{' '}
                    {solicitud.resumenVacaciones.diasNetos}
                    {solicitud.resumenVacaciones.feriados.length > 0 ? (
                      <ul className="mb-0 mt-2 list-disc space-y-1 pl-5 text-sm font-semibold text-[color:var(--asada-muted,#5b7390)]">
                        {solicitud.resumenVacaciones.feriados.map((f) => (
                          <li key={f.fecha}>
                            {formatearFechaPermiso(f.fecha)} — {f.nombre}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </dd>
                </div>
              ) : null}
              {solicitud.tipo === 'VACACIONES' && solicitud.saldoVacaciones ? (
                <div className="grid gap-1.5 bg-emerald-50/50 py-3.5 sm:grid-cols-[minmax(8rem,32%)_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm font-semibold text-emerald-800">
                    Saldo de vacaciones
                  </dt>
                  <dd className="m-0 text-[0.95rem] font-bold leading-5 text-emerald-950">
                    Disponibles: {solicitud.saldoVacaciones.diasDisponibles} · Adquiridas:{' '}
                    {solicitud.saldoVacaciones.diasAcumulados} · Disfrutadas:{' '}
                    {solicitud.saldoVacaciones.diasDisfrutados}
                  </dd>
                </div>
              ) : null}
              {solicitud.registroGeneradoId ? (
                <DetalleCampo label="Registro RRHH">
                  {solicitud.registroGeneradoTipo} #{solicitud.registroGeneradoId}
                </DetalleCampo>
              ) : null}
              {solicitud.motivoRechazo ? (
                <div className="grid gap-1.5 rounded-xl border border-amber-200 bg-[#fff9e6] px-3 py-3.5 my-3 sm:grid-cols-[minmax(8rem,32%)_minmax(0,1fr)] sm:gap-4">
                  <dt className="text-sm font-semibold text-amber-900">
                    Motivo de rechazo
                  </dt>
                  <dd className="m-0 text-[0.95rem] font-bold leading-5 text-amber-950">
                    {solicitud.motivoRechazo}
                  </dd>
                </div>
              ) : null}
            </dl>

            <section className="border-t border-[color:var(--asada-line,#d7e5f1)] px-4 py-4 sm:px-6">
              <h2 className="m-0 flex items-center gap-2 text-sm font-black tracking-tight text-[color:var(--asada-ink,#123f70)]">
                <span className="grid size-8 place-items-center rounded-xl bg-[color:var(--asada-ice,#eaf6ff)] text-[color:var(--asada-navy,#1e5a9c)]">
                  <IconFileDescription size={17} aria-hidden="true" />
                </span>
                Evidencia
              </h2>
              {solicitud.documentos?.length ? (
                <ul className="mb-0 mt-3 grid list-none gap-2 p-0">
                  {solicitud.documentos.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-[#f7fbff] px-3.5 py-3"
                    >
                      <span className="min-w-0 break-words text-sm font-bold text-[color:var(--asada-ink,#123f70)]">
                        {doc.nombreOriginal}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          void abrirEvidenciaSolicitudAusencia(
                            doc.rutaReferenciaArchivo,
                            'admin',
                          )
                        }
                      >
                        Ver documento
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-0 mt-3 text-sm font-semibold text-[color:var(--asada-muted,#5b7390)]">
                  Sin evidencia adjunta.
                </p>
              )}
            </section>

            {solicitud.estado === 'PENDIENTE' ? (
              <div className="flex flex-col gap-3 border-t border-[color:var(--asada-line,#d7e5f1)] px-4 py-4 sm:flex-row sm:items-center sm:gap-3 sm:px-6">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  disabled={Boolean(busy)}
                  loading={busy === 'aprobar'}
                  leftIcon={<IconCheck size={18} aria-hidden="true" />}
                  onClick={() => setModalAprobar(true)}
                >
                  {busy === 'aprobar' ? 'Aprobando…' : 'Aprobar solicitud'}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  className="w-full sm:w-auto"
                  disabled={Boolean(busy)}
                  leftIcon={<IconX size={18} aria-hidden="true" />}
                  onClick={() => {
                    setMotivoRechazo('')
                    setModalRechazo(true)
                  }}
                >
                  Rechazar
                </Button>
              </div>
            ) : null}
          </article>
        </>
      )}

      {modalAprobar && solicitud ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="aprobar-titulo"
        >
          <div className="grid w-full max-w-md gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 id="aprobar-titulo" className="m-0 text-xl font-black text-[#062e63]">
              Aprobar solicitud
            </h2>
            <p className="m-0 text-slate-600">
              {tipoSolicitudAusenciaLabel(solicitud.tipo)} de{' '}
              {solicitud.colaborador
                ? nombreCompleto(solicitud.colaborador)
                : `#${solicitud.colaboradorId}`}
              . {mensajeAprobar}
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={Boolean(busy)}
                onClick={() => setModalAprobar(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={Boolean(busy)}
                loading={busy === 'aprobar'}
                leftIcon={<IconCheck size={18} aria-hidden="true" />}
                onClick={() => void aprobar()}
              >
                {busy === 'aprobar' ? 'Aprobando…' : 'Confirmar aprobación'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {modalRechazo && solicitud ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rechazo-titulo"
        >
          <div className="grid w-full max-w-md gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 id="rechazo-titulo" className="m-0 text-xl font-black text-[#062e63]">
              Rechazar solicitud
            </h2>
            <p className="m-0 text-slate-600">
              {tipoSolicitudAusenciaLabel(solicitud.tipo)} de{' '}
              {solicitud.colaborador
                ? nombreCompleto(solicitud.colaborador)
                : `#${solicitud.colaboradorId}`}
              . No se creará registro en RRHH.
            </p>
            <label className="grid gap-1" htmlFor={motivoId}>
              <span className="text-xs font-bold uppercase text-slate-500">
                Comentario (opcional)
              </span>
              <textarea
                id={motivoId}
                className="min-h-24 rounded-xl border border-slate-200 px-3 py-2"
                value={motivoRechazo}
                maxLength={500}
                onChange={(e) => setMotivoRechazo(e.target.value)}
              />
            </label>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={Boolean(busy)}
                  onClick={() => setModalRechazo(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  disabled={Boolean(busy)}
                  loading={busy === 'rechazar'}
                  leftIcon={<IconX size={18} aria-hidden="true" />}
                  onClick={() => void confirmarRechazo()}
                >
                  {busy === 'rechazar' ? 'Rechazando…' : 'Confirmar rechazo'}
                </Button>
              </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  )
}
