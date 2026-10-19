import { IconClipboardList, IconEye, IconPlus, IconRefresh } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { useAuth } from '../../auth/components/AuthContext'
import { esNoAutenticado, esReintentable } from '../../recursos-humanos/colaboradorForm'
import { formatearFechaPermiso } from '../../recursos-humanos/permisoForm'
import {
  estadoSolicitudAusenciaClassName,
  estadoSolicitudAusenciaLabel,
  resumirMotivo,
  tipoSolicitudAusenciaLabel,
} from '../solicitudAusenciaLabels'
import { getMisSolicitudesAusencia } from '../solicitudesAusenciaApi'
import {
  FONTANERO_MIS_SOLICITUDES_TITLE,
  FONTANERO_SOLICITAR_AUSENCIA_PATH,
  misSolicitudAusenciaDetailPath,
} from '../solicitudesAusenciaPaths'
import type { SolicitudAusenciaFontanero } from '../types'

type Carga = {
  clave: string
  data: SolicitudAusenciaFontanero[]
  error: string | null
  reintentable: boolean
}

/**
 * PBI 6.5.6 — Listado de solicitudes propias (solo lectura, API 6.5.3).
 */
export default function MisSolicitudesAusenciaPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [recarga, setRecarga] = useState(0)
  const [carga, setCarga] = useState<Carga>({
    clave: '',
    data: [],
    error: null,
    reintentable: true,
  })
  const clave = String(recarga)
  const cargando = carga.clave !== clave

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  useEffect(() => {
    const controller = new AbortController()
    getMisSolicitudesAusencia(controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return
        setCarga({
          clave,
          data: respuesta,
          error: null,
          reintentable: true,
        })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (esNoAutenticado(err)) {
          salirPorSesion()
          return
        }
        setCarga({
          clave,
          data: [],
          error: 'No fue posible cargar sus solicitudes. Intente nuevamente.',
          reintentable: esReintentable(err),
        })
      })
    return () => controller.abort()
  }, [clave, salirPorSesion])

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 overflow-x-hidden px-4 py-6 sm:px-6">
      <header className="rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
          Fontanero
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="m-0 flex items-center gap-3 text-2xl font-black tracking-tight text-[#062e63] sm:text-4xl">
              <IconClipboardList
                className="shrink-0 text-blue-600"
                size={34}
                aria-hidden="true"
              />
              {FONTANERO_MIS_SOLICITUDES_TITLE}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              Consulte el historial y el estado de sus solicitudes de permiso o vacaciones.
            </p>
          </div>
          <Link
            to={FONTANERO_SOLICITAR_AUSENCIA_PATH}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-600 px-4 font-bold text-white no-underline hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <IconPlus size={18} aria-hidden="true" />
            Solicitar permiso o vacaciones
          </Link>
        </div>
      </header>

      {cargando ? (
        <div
          className="rounded-2xl border border-sky-100 bg-white p-8 font-semibold text-slate-600"
          role="status"
        >
          Cargando solicitudes…
        </div>
      ) : carga.error ? (
        <div
          className="grid gap-3 rounded-2xl border border-red-200 bg-red-50 p-6"
          role="alert"
        >
          <p className="m-0 font-semibold text-red-800">{carga.error}</p>
          {carga.reintentable ? (
            <button
              type="button"
              className="inline-flex w-fit min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 font-bold text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              onClick={() => setRecarga((n) => n + 1)}
            >
              <IconRefresh size={18} aria-hidden="true" />
              Reintentar
            </button>
          ) : null}
        </div>
      ) : !carga.data.length ? (
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">
          <p className="m-0 text-lg font-semibold text-slate-700">
            Aún no tiene solicitudes registradas.
          </p>
          <Link
            to={FONTANERO_SOLICITAR_AUSENCIA_PATH}
            className="inline-flex w-fit min-h-11 items-center gap-2 rounded-xl border border-blue-200 px-4 font-bold text-blue-800 no-underline hover:bg-sky-50"
          >
            Solicitar permiso o vacaciones
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile / tablet: cards */}
          <ul className="m-0 grid list-none gap-3 p-0 md:hidden">
            {carga.data.map((item) => (
              <li
                key={item.id}
                className="grid gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-[0_8px_24px_rgba(30,90,156,0.06)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-extrabold text-[#062e63]">
                    {tipoSolicitudAusenciaLabel(item.tipo)}
                  </span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${estadoSolicitudAusenciaClassName(item.estado)}`}
                  >
                    {estadoSolicitudAusenciaLabel(item.estado)}
                  </span>
                </div>
                <p className="m-0 text-sm text-slate-600">
                  {formatearFechaPermiso(item.fechaInicio)} —{' '}
                  {formatearFechaPermiso(item.fechaFin)}
                </p>
                <p className="m-0 text-sm text-slate-700">{resumirMotivo(item.motivo)}</p>
                <Link
                  to={misSolicitudAusenciaDetailPath(item.id)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 font-bold text-blue-700 no-underline hover:bg-sky-50"
                >
                  <IconEye size={18} aria-hidden="true" />
                  Ver detalle
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-sky-100 bg-white shadow-[0_12px_30px_rgba(30,90,156,0.07)] md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Periodo</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Solicitud</th>
                  <th className="px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {carga.data.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {tipoSolicitudAusenciaLabel(item.tipo)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatearFechaPermiso(item.fechaInicio)} —{' '}
                      {formatearFechaPermiso(item.fechaFin)}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-slate-700">
                      {resumirMotivo(item.motivo)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${estadoSolicitudAusenciaClassName(item.estado)}`}
                      >
                        {estadoSolicitudAusenciaLabel(item.estado)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatearFechaPermiso(item.createdAt.slice(0, 10))}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={misSolicitudAusenciaDetailPath(item.id)}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 font-bold text-blue-700 no-underline hover:bg-sky-50"
                      >
                        <IconEye size={18} aria-hidden="true" />
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
