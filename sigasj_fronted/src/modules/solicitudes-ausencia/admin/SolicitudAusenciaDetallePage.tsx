import { IconArrowLeft, IconCheck, IconX } from '@tabler/icons-react'
import { useCallback, useEffect, useId, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
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
    if (!modalRechazo) return undefined
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        setModalRechazo(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalRechazo, busy])

  const solicitud = carga.solicitud

  const aprobar = async () => {
    if (!solicitud || busy) return
    const mensaje =
      solicitud.tipo === 'VACACIONES'
        ? '¿Desea aprobar esta solicitud de vacaciones? Se registrará el disfrute correspondiente y se actualizará el saldo.'
        : '¿Desea aprobar esta solicitud de permiso? Se creará el registro oficial en Permisos.'
    if (!window.confirm(mensaje)) return
    setBusy('aprobar')
    setAccionError(null)
    setAviso(null)
    try {
      const actualizada = await aprobarSolicitudAusencia(solicitud.id)
      setCarga({ clave, solicitud: actualizada, error: null })
      setAviso(
        actualizada.tipo === 'VACACIONES'
          ? 'Solicitud aprobada. El movimiento de vacaciones quedó registrado en RRHH.'
          : 'Solicitud aprobada. El permiso quedó registrado en RRHH.',
      )
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
      setAviso('Solicitud rechazada. No se generó registro en RRHH.')
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
    <div className="mx-auto grid w-full max-w-4xl gap-5 overflow-x-hidden px-4 py-6 sm:px-6">
      <RrhhSubnav />
      <Link
        to={SOLICITUDES_AUSENCIA_ADMIN_PATH}
        className="inline-flex w-fit min-h-11 items-center gap-2 font-bold text-blue-700 no-underline hover:underline"
      >
        <IconArrowLeft size={18} aria-hidden="true" /> Volver a solicitudes
      </Link>

      {!idValido || (!cargando && (carga.error || !solicitud)) ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6" role="alert">
          <p className="m-0 font-semibold text-red-800">
            {carga.error ?? 'No se encontró la solicitud.'}
          </p>
          {idValido ? (
            <button
              type="button"
              className="mt-4 min-h-11 rounded-xl border border-blue-200 bg-white px-4 font-bold text-blue-800"
              onClick={() => setRecarga((n) => n + 1)}
            >
              Reintentar
            </button>
          ) : null}
        </div>
      ) : cargando || !solicitud ? (
        <div
          className="rounded-2xl border border-sky-100 bg-white p-8 font-semibold text-slate-600"
          role="status"
        >
          Cargando solicitud…
        </div>
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

          <article className="grid gap-5 rounded-2xl border border-sky-100 bg-white p-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8">
            <header className="grid gap-3">
              <p className="mb-0 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
                {RRHH_TITLE} · Solicitud de ausencia
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="m-0 text-3xl font-black text-[#062e63]">
                  {tipoSolicitudAusenciaLabel(solicitud.tipo)}
                </h1>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${estadoSolicitudAusenciaClassName(solicitud.estado)}`}
                >
                  {estadoSolicitudAusenciaLabel(solicitud.estado)}
                </span>
              </div>
            </header>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-extrabold uppercase text-slate-500">
                  Colaborador
                </dt>
                <dd className="m-0 mt-1 font-semibold text-slate-800">
                  {solicitud.colaborador
                    ? nombreCompleto(solicitud.colaborador)
                    : `#${solicitud.colaboradorId}`}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-extrabold uppercase text-slate-500">
                  Correo para aviso
                </dt>
                <dd className="m-0 mt-1 font-semibold text-slate-800">
                  {solicitud.correoNotificacion?.trim() ||
                    solicitud.colaborador?.correoElectronico?.trim() ||
                    'Sin correo indicado'}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-extrabold uppercase text-slate-500">Periodo</dt>
                <dd className="m-0 mt-1 font-semibold text-slate-800">
                  {formatearFechaPermiso(solicitud.fechaInicio)} —{' '}
                  {formatearFechaPermiso(solicitud.fechaFin)}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 sm:col-span-2">
                <dt className="text-xs font-extrabold uppercase text-slate-500">Motivo</dt>
                <dd className="m-0 mt-1 font-semibold text-slate-800">
                  {solicitud.motivo?.trim() || 'Sin motivo'}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-extrabold uppercase text-slate-500">
                  Fecha de solicitud
                </dt>
                <dd className="m-0 mt-1 font-semibold text-slate-800">
                  {formatearFechaPermiso(solicitud.createdAt.slice(0, 10))}
                </dd>
              </div>
              {solicitud.tipo === 'VACACIONES' && solicitud.saldoVacaciones ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 sm:col-span-2">
                  <dt className="text-xs font-extrabold uppercase text-emerald-800">
                    Saldo de vacaciones (actual)
                  </dt>
                  <dd className="m-0 mt-1 font-semibold text-emerald-950">
                    Disponibles: {solicitud.saldoVacaciones.diasDisponibles} · Adquiridas:{' '}
                    {solicitud.saldoVacaciones.diasAcumulados} · Disfrutadas:{' '}
                    {solicitud.saldoVacaciones.diasDisfrutados}
                  </dd>
                </div>
              ) : null}
              {solicitud.registroGeneradoId ? (
                <div className="rounded-xl bg-slate-50 px-4 py-3 sm:col-span-2">
                  <dt className="text-xs font-extrabold uppercase text-slate-500">
                    Registro RRHH generado
                  </dt>
                  <dd className="m-0 mt-1 font-semibold text-slate-800">
                    {solicitud.registroGeneradoTipo} #{solicitud.registroGeneradoId}
                  </dd>
                </div>
              ) : null}
              {solicitud.motivoRechazo ? (
                <div className="rounded-xl bg-amber-50 px-4 py-3 sm:col-span-2">
                  <dt className="text-xs font-extrabold uppercase text-amber-800">
                    Motivo de rechazo
                  </dt>
                  <dd className="m-0 mt-1 font-semibold text-amber-950">
                    {solicitud.motivoRechazo}
                  </dd>
                </div>
              ) : null}
            </dl>

              {solicitud.estado === 'PENDIENTE' ? (
                <div className="mt-1 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:gap-4">
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => void aprobar()}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 px-7 py-3.5 font-extrabold text-white shadow-[0_11px_26px_rgba(16,185,129,0.32)] transition hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none sm:w-auto motion-reduce:transform-none"
                  >
                    <IconCheck size={20} aria-hidden="true" />
                    {busy === 'aprobar' ? 'Aprobando…' : 'Aprobar solicitud'}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => {
                      setMotivoRechazo('')
                      setModalRechazo(true)
                    }}
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white px-6 py-3.5 font-extrabold text-rose-700 transition hover:-translate-y-1 hover:border-rose-400 hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none sm:w-auto motion-reduce:transform-none"
                  >
                    <IconX size={20} aria-hidden="true" />
                    Rechazar
                  </button>
                </div>
              ) : null}
          </article>
        </>
      )}

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
                <button
                  type="button"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:opacity-60"
                  disabled={Boolean(busy)}
                  onClick={() => setModalRechazo(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-rose-500 bg-gradient-to-r from-rose-700 via-rose-600 to-red-500 px-6 py-3 font-extrabold text-white shadow-[0_11px_26px_rgba(225,29,72,0.28)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none motion-reduce:transform-none"
                  disabled={Boolean(busy)}
                  onClick={() => void confirmarRechazo()}
                >
                  <IconX size={18} aria-hidden="true" />
                  {busy === 'rechazar' ? 'Rechazando…' : 'Confirmar rechazo'}
                </button>
              </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
