import {
  IconArrowLeft,
  IconCalendarOff,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconFilterOff,
  IconPencil,
  IconRefresh,
  IconCalendarPlus,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { useAuth } from '../auth/components/AuthContext'
import { getColaboradoresOpciones } from './colaboradoresApi'
import { esNoAutenticado, esReintentable, nombreCompleto } from './colaboradorForm'
import {
  formatearFechaPermiso,
  nombreColaboradorPermiso,
  permisoErrorMessage,
} from './permisoForm'
import { PERMISOS_PAGE_SIZE, getPermisos } from './permisosApi'
import {
  InternalAdminRoleName,
  userHasAllowedRole,
} from '../auth/utils/adminNavigation'
import { SOLICITUDES_AUSENCIA_ADMIN_PATH } from '../solicitudes-ausencia/solicitudesAusenciaPaths'
import {
  PERMISO_NEW_PATH,
  permisoDetailPath,
  permisoEditPath,
} from './recursosHumanosPaths'
import RrhhSubnav from './RrhhSubnav'
import type { Colaborador, PermisosFiltros, PermisosListado } from './types'

const leerFiltros = (params: URLSearchParams): PermisosFiltros => {
  const page = Number(params.get('page'))
  return {
    colaboradorId: params.get('colaboradorId') ?? '',
    fechaInicio: params.get('fechaInicio') ?? '',
    fechaFin: params.get('fechaFin') ?? '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

const inputClass =
  'min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

export default function PermisosPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, user } = useAuth()
  const verColaSolicitudes = userHasAllowedRole(user, [
    InternalAdminRoleName.Administradora,
  ])
  const [searchParams, setSearchParams] = useSearchParams()
  const filtros = leerFiltros(searchParams)
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [listado, setListado] = useState<PermisosListado | null>(null)
  const [resultado, setResultado] = useState<{
    clave: string
    error: string | null
    reintentable: boolean
  }>({ clave: '', error: null, reintentable: true })
  const aviso =
    (location.state as { success?: string } | null)?.success ?? null
  const [recarga, setRecarga] = useState(0)

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  const actualizarFiltros = useCallback(
    (cambios: Partial<PermisosFiltros>) => {
      setSearchParams(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales)
          const resultadoFiltros = { ...leerFiltros(actuales), page: 1, ...cambios }
          const pares: Array<[string, string]> = [
            ['colaboradorId', resultadoFiltros.colaboradorId.trim()],
            ['fechaInicio', resultadoFiltros.fechaInicio.trim()],
            ['fechaFin', resultadoFiltros.fechaFin.trim()],
            ['page', resultadoFiltros.page > 1 ? String(resultadoFiltros.page) : ''],
          ]
          pares.forEach(([clave, valor]) =>
            valor ? siguientes.set(clave, valor) : siguientes.delete(clave),
          )
          return siguientes
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  useEffect(() => {
    const controller = new AbortController()
    getColaboradoresOpciones(controller.signal)
      .then((respuesta) => {
        if (!controller.signal.aborted) setColaboradores(respuesta.data)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted && esNoAutenticado(err)) salirPorSesion()
      })
    return () => controller.abort()
  }, [salirPorSesion])

  const { colaboradorId, fechaInicio, fechaFin, page } = filtros
  const clave = JSON.stringify([colaboradorId, fechaInicio, fechaFin, page, recarga])
  const cargando = resultado.clave !== clave
  const error = cargando ? null : resultado.error

  useEffect(() => {
    const controller = new AbortController()
    getPermisos({ colaboradorId, fechaInicio, fechaFin, page }, controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return
        setListado(respuesta)
        setResultado({ clave, error: null, reintentable: true })
        if (respuesta.totalPages > 0 && page > respuesta.totalPages) {
          actualizarFiltros({ page: respuesta.totalPages })
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (esNoAutenticado(err)) {
          salirPorSesion()
          return
        }
        setResultado({
          clave,
          error: permisoErrorMessage(err, 'No fue posible cargar los permisos.'),
          reintentable: esReintentable(err),
        })
      })
    return () => controller.abort()
  }, [clave, colaboradorId, fechaInicio, fechaFin, page, salirPorSesion, actualizarFiltros])

  const hayFiltros = Boolean(colaboradorId || fechaInicio || fechaFin)
  const limpiarFiltros = () => {
    actualizarFiltros({ colaboradorId: '', fechaInicio: '', fechaFin: '', page: 1 })
  }

  const permisos = listado?.data ?? []
  const total = listado?.total ?? 0
  const totalPages = listado?.totalPages ?? 0
  const desde = total ? (page - 1) * PERMISOS_PAGE_SIZE + 1 : 0
  const hasta = Math.min(page * PERMISOS_PAGE_SIZE, total)

  return (
    <main className="grid w-full min-w-0 gap-5 sm:gap-6">
      <RrhhSubnav />
      <header className="flex flex-col gap-5 rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
            Administración · Permisos
          </p>
          <h1 className="m-0 text-3xl font-black tracking-tight text-[#062e63] sm:text-4xl">
            Permisos del personal
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Aquí solo aparecen los permisos ya otorgados. Las solicitudes que envía
            el Fontanero se revisan en Solicitudes a revisar; al aprobarlas se
            agregan a esta lista.
          </p>
        </div>
        <Link
          to={PERMISO_NEW_PATH}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-6 py-3.5 font-extrabold text-white no-underline shadow-[0_11px_26px_rgba(37,99,235,0.3)] transition hover:-translate-y-1 hover:text-white hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 motion-reduce:transform-none"
        >
          <IconCalendarPlus size={20} aria-hidden="true" />
          Registrar permiso
        </Link>
      </header>

      {verColaSolicitudes ? (
        <Link
          className="group inline-flex min-h-11 w-fit items-center gap-2.5 rounded-2xl border border-blue-200 bg-white px-4 py-2.5 font-extrabold text-blue-700 no-underline shadow-[0_6px_18px_rgba(37,99,235,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800 hover:no-underline hover:shadow-[0_10px_24px_rgba(37,99,235,0.18)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-600 active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
          to={`${SOLICITUDES_AUSENCIA_ADMIN_PATH}?estado=PENDIENTE`}
        >
          <IconArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1 motion-reduce:transform-none" size={19} aria-hidden="true" />
          Volver a solicitudes a revisar
        </Link>
      ) : null}

      {aviso ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-semibold text-emerald-800" role="status">
          {aviso}
        </div>
      ) : null}

      <section
        className="grid gap-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-6 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end"
        aria-label="Filtros de permisos"
      >
        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-bold text-[#163f6b]">Colaborador</span>
          <select
            className={inputClass}
            value={colaboradorId}
            onChange={(event) => actualizarFiltros({ colaboradorId: event.target.value })}
          >
            <option value="">Todos los colaboradores</option>
            {colaboradores.map((colaborador) => (
              <option key={colaborador.id} value={String(colaborador.id)}>
                {nombreCompleto(colaborador)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-bold text-[#163f6b]">Desde</span>
          <input
            type="date"
            className={inputClass}
            value={fechaInicio}
            onChange={(event) => actualizarFiltros({ fechaInicio: event.target.value })}
          />
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-bold text-[#163f6b]">Hasta</span>
          <input
            type="date"
            className={inputClass}
            value={fechaFin}
            onChange={(event) => actualizarFiltros({ fechaFin: event.target.value })}
          />
        </label>
        <button
          type="button"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2 xl:col-span-1"
          onClick={limpiarFiltros}
          disabled={!hayFiltros}
        >
          <IconFilterOff size={18} aria-hidden="true" />
          Limpiar filtros
        </button>
      </section>

      <section
        className="min-w-0 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl"
        aria-busy={cargando}
        aria-label="Listado de permisos"
      >
        {cargando && !listado ? (
          <div className="grid gap-3 p-6" role="status">
            <span className="sr-only">Cargando permisos…</span>
            {[0, 1, 2].map((fila) => (
              <div key={fila} className="h-14 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" aria-hidden="true" />
            ))}
          </div>
        ) : error ? (
          <div className="grid place-items-center gap-4 p-10 text-center" role="alert">
            <p className="m-0 font-semibold text-red-700">{error}</p>
            {resultado.reintentable ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 font-bold text-blue-800 transition hover:bg-blue-50"
                onClick={() => setRecarga((n) => n + 1)}
              >
                <IconRefresh size={18} aria-hidden="true" />
                Reintentar
              </button>
            ) : null}
          </div>
        ) : permisos.length === 0 ? (
          <div className="grid place-items-center gap-3 p-10 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <IconCalendarOff size={28} aria-hidden="true" />
            </span>
            <h2 className="m-0 text-lg font-extrabold text-[#073b73]">
              {hayFiltros ? 'Sin resultados' : 'Aún no hay permisos'}
            </h2>
            <p className="m-0 max-w-md text-slate-500">
              {hayFiltros
                ? 'Ningún permiso coincide con el colaborador o las fechas indicadas.'
                : 'Use “Registrar permiso” para anotar un permiso del personal.'}
            </p>
          </div>
        ) : (
          <table className={`w-full border-collapse text-left transition-opacity ${cargando ? 'opacity-60' : ''}`}>
            <thead className="hidden bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-500 xl:table-header-group">
              <tr>
                <th scope="col" className="px-6 py-4">Colaborador</th>
                <th scope="col" className="px-6 py-4">Inicio</th>
                <th scope="col" className="px-6 py-4">Fin</th>
                <th scope="col" className="px-6 py-4">Motivo</th>
                <th scope="col" className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="block divide-y divide-slate-100 xl:table-row-group">
              {permisos.map((permiso) => {
                const nombre = nombreColaboradorPermiso(permiso)
                return (
                  <tr key={permiso.id} className="grid gap-2 px-5 py-4 transition hover:bg-sky-50/50 xl:table-row xl:p-0">
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                      <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Colaborador</span>
                      <span className="min-w-0 text-right xl:text-left">
                        <span className="block font-extrabold text-[#073b73]">{nombre}</span>
                        <span className="block text-sm text-slate-500">{permiso.colaborador?.cedula}</span>
                      </span>
                    </td>
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                      <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Inicio</span>
                      <span className="font-semibold text-slate-700">{formatearFechaPermiso(permiso.fechaInicio)}</span>
                    </td>
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                      <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Fin</span>
                      <span className="font-semibold text-slate-700">{formatearFechaPermiso(permiso.fechaFin)}</span>
                    </td>
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                      <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Motivo</span>
                      <span className="font-semibold text-slate-700">{permiso.motivo}</span>
                    </td>
                    <td className="pt-2 xl:table-cell xl:px-6 xl:py-4">
                      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <Link
                          to={permisoDetailPath(permiso.id)}
                          className="group rrhh-touch-target inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700 no-underline shadow-[0_5px_14px_rgba(37,99,235,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500 hover:from-blue-600 hover:to-sky-500 hover:text-white hover:no-underline hover:shadow-[0_9px_20px_rgba(37,99,235,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none"
                          aria-label={`Ver permiso de ${nombre}`}
                        >
                          <IconEye className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none" size={17} aria-hidden="true" />
                          Ver
                        </Link>
                        <Link
                          to={permisoEditPath(permiso.id)}
                          className="group rrhh-touch-target inline-flex min-h-10 items-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-blue-700 to-sky-500 px-4 py-2 text-sm font-extrabold text-white no-underline shadow-[0_8px_18px_rgba(37,99,235,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-800 hover:to-sky-600 hover:text-white hover:no-underline hover:shadow-[0_11px_24px_rgba(37,99,235,0.32)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:translate-y-0 active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none"
                          aria-label={`Editar permiso de ${nombre}`}
                        >
                          <IconPencil className="transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transform-none" size={17} aria-hidden="true" />
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {!error && total > 0 ? (
          <nav
            className="flex flex-col items-center justify-between gap-3 border-t border-sky-100 bg-slate-50/60 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:px-6"
            aria-label="Paginación de permisos"
          >
            <p className="m-0">
              Mostrando {desde}–{hasta} de {total} permiso{total === 1 ? '' : 's'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rrhh-touch-target inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 font-extrabold text-slate-600 transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-blue-300 enabled:hover:bg-blue-50 enabled:hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-70"
                onClick={() => actualizarFiltros({ page: page - 1 })}
                disabled={page <= 1 || cargando}
              >
                <IconChevronLeft size={17} aria-hidden="true" />
                Anterior
              </button>
              <span className="px-2 font-semibold text-slate-600">
                Página {page} de {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                className="rrhh-touch-target inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 font-extrabold text-slate-600 transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-blue-300 enabled:hover:bg-blue-50 enabled:hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-70"
                onClick={() => actualizarFiltros({ page: page + 1 })}
                disabled={page >= totalPages || cargando}
              >
                Siguiente
                <IconChevronRight size={17} aria-hidden="true" />
              </button>
            </div>
          </nav>
        ) : null}
      </section>
    </main>
  )
}
