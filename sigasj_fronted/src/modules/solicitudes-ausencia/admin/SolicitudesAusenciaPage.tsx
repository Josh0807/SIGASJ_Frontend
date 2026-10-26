import { IconEye, IconRefresh } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { useAuth } from '../../auth/components/AuthContext'
import {
  esNoAutenticado,
  esReintentable,
  nombreCompleto,
} from '../../recursos-humanos/colaboradorForm'
import { formatearFechaPermiso } from '../../recursos-humanos/permisoForm'
import { RRHH_TITLE } from '../../recursos-humanos/recursosHumanosPaths'
import RrhhSubnav from '../../recursos-humanos/RrhhSubnav'
import {
  estadoSolicitudAusenciaClassName,
  estadoSolicitudAusenciaLabel,
  tipoSolicitudAusenciaLabel,
} from '../solicitudAusenciaLabels'
import { getSolicitudesAusencia } from '../solicitudesAusenciaApi'
import { solicitudAusenciaDetailPath } from '../solicitudesAusenciaPaths'
import type {
  EstadoSolicitudAusencia,
  SolicitudAusencia,
  TipoSolicitudAusencia,
} from '../types'
const accionListadoClassName =
  'group inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/80 px-3.5 py-2 text-sm font-extrabold text-blue-700 no-underline shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:shadow-[0_7px_16px_rgba(37,99,235,0.14)] motion-reduce:transform-none motion-reduce:transition-none'

type Carga = {
  clave: string
  data: SolicitudAusencia[]
  total: number
  totalPages: number
  error: string | null
  reintentable: boolean
}

/**
 * PBI 6.5.7 — Cola administrativa de solicitudes (solo lectura + enlace a detalle).
 * Aprobar/rechazar en detalle vía API 6.5.4.
 */
export default function SolicitudesAusenciaPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [params, setParams] = useSearchParams()
  const estado = (params.get('estado') ?? '') as EstadoSolicitudAusencia | ''
  const tipo = (params.get('tipo') ?? '') as TipoSolicitudAusencia | ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const [recarga, setRecarga] = useState(0)
  const [carga, setCarga] = useState<Carga>({
    clave: '',
    data: [],
    total: 0,
    totalPages: 0,
    error: null,
    reintentable: true,
  })
  const clave = `${estado}|${tipo}|${page}|${recarga}`
  const cargando = carga.clave !== clave
  const hayFiltro = Boolean(estado || tipo)

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  useEffect(() => {
    const controller = new AbortController()
    getSolicitudesAusencia({ estado, tipo, page }, controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return
        setCarga({
          clave,
          data: respuesta.data,
          total: respuesta.total,
          totalPages: respuesta.totalPages,
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
          total: 0,
          totalPages: 0,
          error: 'No fue posible cargar las solicitudes. Intente nuevamente.',
          reintentable: esReintentable(err),
        })
      })
    return () => controller.abort()
  }, [clave, estado, tipo, page, salirPorSesion])

  const actualizar = (cambios: Record<string, string>) => {
    const siguientes = new URLSearchParams(params)
    Object.entries(cambios).forEach(([k, v]) => {
      if (!v) siguientes.delete(k)
      else siguientes.set(k, v)
    })
    if (!('page' in cambios)) siguientes.set('page', '1')
    setParams(siguientes)
  }

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-4 py-2 sm:gap-5 sm:py-4">
      <RrhhSubnav />
      <header className="rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
          Administración · {RRHH_TITLE}
        </p>
        <h1 className="m-0 text-3xl font-black tracking-tight text-[#062e63] sm:text-4xl">
          Solicitudes a revisar
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
          Cola de permiso y vacaciones que envía el Fontanero. Al aprobar un
          permiso se registra en Permisos otorgados; al aprobar vacaciones se
          descuenta el saldo.
        </p>
      </header>

      <section
        className="flex flex-wrap gap-3 rounded-2xl border border-sky-100 bg-white p-4"
        aria-label="Filtros de solicitudes"
      >
        <label className="grid gap-1">
          <span className="text-xs font-bold uppercase text-slate-500">Estado</span>
          <select
            className="min-h-11 rounded-xl border border-slate-200 px-3"
            value={estado}
            onChange={(e) => actualizar({ estado: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="APROBADA">Aprobada</option>
            <option value="RECHAZADA">Rechazada</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-bold uppercase text-slate-500">Tipo</span>
          <select
            className="min-h-11 rounded-xl border border-slate-200 px-3"
            value={tipo}
            onChange={(e) => actualizar({ tipo: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="PERMISO">Permiso</option>
            <option value="VACACIONES">Vacaciones</option>
          </select>
        </label>
      </section>

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
              className="inline-flex w-fit min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 font-bold text-blue-800"
              onClick={() => setRecarga((n) => n + 1)}
            >
              <IconRefresh size={18} aria-hidden="true" /> Reintentar
            </button>
          ) : null}
        </div>
      ) : !carga.data.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">
          {hayFiltro
            ? 'No se encontraron solicitudes con el estado seleccionado.'
            : 'No hay solicitudes registradas.'}
        </div>
      ) : (
        <>
          <ul className="m-0 grid list-none gap-3 p-0 lg:hidden">
            {carga.data.map((item) => (
              <li
                key={item.id}
                className="grid gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-[0_8px_24px_rgba(30,90,156,0.06)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-extrabold text-[#062e63]">
                    {item.colaborador
                      ? nombreCompleto(item.colaborador)
                      : `#${item.colaboradorId}`}
                  </span>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${estadoSolicitudAusenciaClassName(item.estado)}`}
                  >
                    {estadoSolicitudAusenciaLabel(item.estado)}
                  </span>
                </div>
                <p className="m-0 text-sm text-slate-600">
                  {tipoSolicitudAusenciaLabel(item.tipo)} ·{' '}
                  {formatearFechaPermiso(item.fechaInicio)} —{' '}
                  {formatearFechaPermiso(item.fechaFin)}
                </p>
                <Link
                  to={solicitudAusenciaDetailPath(item.id)}
                  className={`${accionListadoClassName} w-fit self-start`}
                >
                  <IconEye
                    className="transition-transform duration-300 group-hover:scale-110"
                    size={17}
                    aria-hidden="true"
                  />
                  {item.estado === 'PENDIENTE' ? 'Revisar' : 'Ver detalle'}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-2xl border border-sky-100 bg-white shadow-[0_12px_30px_rgba(30,90,156,0.07)] lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Periodo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Solicitud</th>
                  <th className="px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {carga.data.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {item.colaborador
                        ? nombreCompleto(item.colaborador)
                        : `#${item.colaboradorId}`}
                    </td>
                    <td className="px-4 py-3">
                      {tipoSolicitudAusenciaLabel(item.tipo)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatearFechaPermiso(item.fechaInicio)} —{' '}
                      {formatearFechaPermiso(item.fechaFin)}
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
                        to={solicitudAusenciaDetailPath(item.id)}
                        className={accionListadoClassName}
                      >
                        <IconEye
                          className="transition-transform duration-300 group-hover:scale-110"
                          size={17}
                          aria-hidden="true"
                        />
                        {item.estado === 'PENDIENTE' ? 'Revisar' : 'Ver detalle'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-500">
            <span>
              Página {page} de {Math.max(1, carga.totalPages)} · {carga.total}{' '}
              solicitudes
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="min-h-10 rounded-xl border border-slate-200 px-3 font-bold disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => actualizar({ page: String(page - 1) })}
              >
                Anterior
              </button>
              <button
                type="button"
                className="min-h-10 rounded-xl border border-slate-200 px-3 font-bold disabled:opacity-40"
                disabled={page >= carga.totalPages}
                onClick={() => actualizar({ page: String(page + 1) })}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
