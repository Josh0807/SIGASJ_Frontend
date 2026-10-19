import { IconArrowLeft } from '@tabler/icons-react'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { useAuth } from '../../auth/components/AuthContext'
import {
  esNoAutenticado,
  getHttpStatus,
} from '../../recursos-humanos/colaboradorForm'
import { formatearFechaPermiso } from '../../recursos-humanos/permisoForm'
import {
  estadoSolicitudAusenciaClassName,
  estadoSolicitudAusenciaLabel,
  tipoSolicitudAusenciaLabel,
} from '../solicitudAusenciaLabels'
import { getMiSolicitudAusencia } from '../solicitudesAusenciaApi'
import { FONTANERO_MIS_SOLICITUDES_PATH } from '../solicitudesAusenciaPaths'
import type { SolicitudAusenciaFontanero } from '../types'

type Carga = {
  clave: string
  solicitud: SolicitudAusenciaFontanero | null
  error: string | null
  notFound: boolean
}

function Dato({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-1 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <dt className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="m-0 text-base font-semibold text-slate-800">{children}</dd>
    </div>
  )
}

/**
 * PBI 6.5.6 — Detalle propio (solo lectura). Consulta siempre al Backend.
 */
export default function MiSolicitudAusenciaDetallePage() {
  const { id } = useParams()
  const solicitudId = Number(id)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [recarga, setRecarga] = useState(0)
  const [carga, setCarga] = useState<Carga>({
    clave: '',
    solicitud: null,
    error: null,
    notFound: false,
  })
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
    getMiSolicitudAusencia(solicitudId, controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return
        setCarga({
          clave,
          solicitud: respuesta,
          error: null,
          notFound: false,
        })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (esNoAutenticado(err)) {
          salirPorSesion()
          return
        }
        const status = getHttpStatus(err)
        if (status === 403) {
          navigate(UNAUTHORIZED_ROUTE_PATH, { replace: true })
          return
        }
        setCarga({
          clave,
          solicitud: null,
          notFound: status === 404,
          error:
            status === 404
              ? 'No se encontró la solicitud.'
              : 'No fue posible cargar la solicitud. Intente nuevamente.',
        })
      })
    return () => controller.abort()
  }, [clave, idValido, solicitudId, salirPorSesion, navigate])

  const solicitud = carga.solicitud

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-5 overflow-x-hidden px-4 py-6 sm:px-6">
      <Link
        to={FONTANERO_MIS_SOLICITUDES_PATH}
        className="inline-flex w-fit min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-bold text-blue-800 no-underline hover:bg-sky-50"
      >
        <IconArrowLeft size={18} aria-hidden="true" />
        Volver a mis solicitudes
      </Link>

      {!idValido ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6" role="alert">
          <p className="m-0 font-semibold text-amber-900">No se encontró la solicitud.</p>
        </div>
      ) : cargando ? (
        <div
          className="rounded-2xl border border-sky-100 bg-white p-8 font-semibold text-slate-600"
          role="status"
        >
          Cargando solicitud…
        </div>
      ) : carga.error || !solicitud ? (
        <div className="grid gap-3 rounded-2xl border border-red-200 bg-red-50 p-6" role="alert">
          <p className="m-0 font-semibold text-red-800">
            {carga.error ?? 'No se encontró la solicitud.'}
          </p>
          {!carga.notFound ? (
            <button
              type="button"
              className="inline-flex w-fit min-h-11 items-center rounded-xl border border-blue-200 bg-white px-4 font-bold text-blue-800"
              onClick={() => setRecarga((n) => n + 1)}
            >
              Reintentar
            </button>
          ) : null}
        </div>
      ) : (
        <article className="grid gap-5 rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-8">
          <header className="grid gap-3">
            <p className="m-0 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
              Solicitud de {tipoSolicitudAusenciaLabel(solicitud.tipo).toLowerCase()}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="m-0 text-3xl font-black tracking-tight text-[#062e63]">
                {tipoSolicitudAusenciaLabel(solicitud.tipo)}
              </h1>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${estadoSolicitudAusenciaClassName(solicitud.estado)}`}
              >
                {estadoSolicitudAusenciaLabel(solicitud.estado)}
              </span>
            </div>
            {solicitud.estado === 'PENDIENTE' ? (
              <p className="m-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950">
                Su solicitud está pendiente de revisión.
              </p>
            ) : null}
            {solicitud.estado === 'APROBADA' ? (
              <p className="m-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950">
                Su solicitud fue aprobada por la Administración.
              </p>
            ) : null}
            {solicitud.estado === 'RECHAZADA' ? (
              <p className="m-0 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-950">
                Su solicitud fue rechazada.
              </p>
            ) : null}
          </header>

          <dl className="m-0 grid gap-3 sm:grid-cols-2">
            <Dato label="Periodo">
              {formatearFechaPermiso(solicitud.fechaInicio)} —{' '}
              {formatearFechaPermiso(solicitud.fechaFin)}
            </Dato>
            <Dato label="Fecha de solicitud">
              {formatearFechaPermiso(solicitud.createdAt.slice(0, 10))}
            </Dato>
            <Dato label="Motivo">{solicitud.motivo?.trim() || 'Sin motivo'}</Dato>
            <Dato label="Correo para aviso">
              {solicitud.correoNotificacion?.trim() || 'Sin correo indicado'}
            </Dato>
            {solicitud.observaciones?.trim() ? (
              <Dato label="Observaciones">{solicitud.observaciones}</Dato>
            ) : null}
            {solicitud.reviewedAt ? (
              <Dato label="Fecha de revisión">
                {formatearFechaPermiso(String(solicitud.reviewedAt).slice(0, 10))}
              </Dato>
            ) : null}
            {solicitud.estado === 'RECHAZADA' && solicitud.motivoRechazo?.trim() ? (
              <Dato label="Motivo del rechazo">{solicitud.motivoRechazo}</Dato>
            ) : null}
          </dl>
        </article>
      )}
    </div>
  )
}
