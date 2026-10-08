import {
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconFilterOff,
  IconPencil,
  IconRefresh,
  IconSearch,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { useAuth } from '../auth/components/AuthContext'
import CambiarEstadoColaborador from './CambiarEstadoColaborador'
import { COLABORADORES_PAGE_SIZE, getColaboradores } from './colaboradoresApi'
import {
  CARGOS_SUGERIDOS,
  colaboradorErrorMessage,
  esNoAutenticado,
  esReintentable,
  nombreCompleto,
} from './colaboradorForm'
import EstadoBadge from './EstadoBadge'
import {
  COLABORADOR_NEW_PATH,
  RRHH_TITLE,
  colaboradorDetailPath,
  colaboradorEditPath,
} from './recursosHumanosPaths'
import type { Colaborador, ColaboradoresFiltros, ColaboradoresListado, EstadoFiltro } from './types'

const SEARCH_DEBOUNCE_MS = 350
const ESTADOS: EstadoFiltro[] = ['todos', 'activos', 'inactivos']

const leerFiltros = (params: URLSearchParams): ColaboradoresFiltros => {
  const estado = params.get('estado') as EstadoFiltro | null
  const page = Number(params.get('page'))
  return {
    search: params.get('search') ?? '',
    cargo: params.get('cargo') ?? '',
    estado: estado && ESTADOS.includes(estado) ? estado : 'todos',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

const inputClass =
  'min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

export default function ColaboradoresPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const filtros = leerFiltros(searchParams)
  const [busqueda, setBusqueda] = useState(filtros.search)
  const [cargo, setCargo] = useState(filtros.cargo)
  const [listado, setListado] = useState<ColaboradoresListado | null>(null)
  const [resultado, setResultado] = useState<{
    clave: string
    error: string | null
    reintentable: boolean
  }>({ clave: '', error: null, reintentable: true })
  const [accionError, setAccionError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(
    (location.state as { success?: string } | null)?.success ?? null,
  )
  const [recarga, setRecarga] = useState(0)

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  const actualizarFiltros = useCallback(
    (cambios: Partial<ColaboradoresFiltros>) => {
      setSearchParams(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales)
          const resultado = { ...leerFiltros(actuales), page: 1, ...cambios }
          const pares: Array<[string, string]> = [
            ['search', resultado.search.trim()],
            ['cargo', resultado.cargo.trim()],
            ['estado', resultado.estado === 'todos' ? '' : resultado.estado],
            ['page', resultado.page > 1 ? String(resultado.page) : ''],
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
    if (busqueda.trim() === filtros.search.trim() && cargo.trim() === filtros.cargo.trim()) {
      return undefined
    }
    const timer = window.setTimeout(
      () => actualizarFiltros({ search: busqueda, cargo }),
      SEARCH_DEBOUNCE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [busqueda, cargo, filtros.search, filtros.cargo, actualizarFiltros])

  const { search, estado, page } = filtros
  const cargoFiltro = filtros.cargo
  const clave = JSON.stringify([search, cargoFiltro, estado, page, recarga])
  const cargando = resultado.clave !== clave
  const error = cargando ? null : resultado.error

  useEffect(() => {
    const controller = new AbortController()
    getColaboradores({ search, cargo: cargoFiltro, estado, page }, controller.signal)
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
          error: colaboradorErrorMessage(err, 'No fue posible cargar los colaboradores.'),
          reintentable: esReintentable(err),
        })
      })
    return () => controller.abort()
  }, [clave, search, cargoFiltro, estado, page, salirPorSesion, actualizarFiltros])

  const reemplazarColaborador = (actualizado: Colaborador) => {
    setAccionError(null)
    setAviso(
      `${nombreCompleto(actualizado)} quedó ${actualizado.activo ? 'activo' : 'inactivo'}.`,
    )
    setListado((actual) =>
      actual
        ? {
            ...actual,
            data: actual.data.map((fila) => (fila.id === actualizado.id ? actualizado : fila)),
          }
        : actual,
    )
  }

  const hayFiltros = Boolean(search || cargoFiltro || estado !== 'todos')
  const limpiarFiltros = () => {
    setBusqueda('')
    setCargo('')
    actualizarFiltros({ search: '', cargo: '', estado: 'todos', page: 1 })
  }

  const colaboradores = listado?.data ?? []
  const total = listado?.total ?? 0
  const totalPages = listado?.totalPages ?? 0
  const desde = total ? (page - 1) * COLABORADORES_PAGE_SIZE + 1 : 0
  const hasta = Math.min(page * COLABORADORES_PAGE_SIZE, total)

  return (
    <main className="grid w-full min-w-0 gap-5 sm:gap-6">
      <header className="flex flex-col gap-5 rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
            Administración · Colaboradores
          </p>
          <h1 className="m-0 text-3xl font-black tracking-tight text-[#062e63] sm:text-4xl">
            {RRHH_TITLE}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Registre, consulte y administre el personal de la ASADA.
          </p>
        </div>
        <Link
          to={COLABORADOR_NEW_PATH}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-6 py-3.5 font-extrabold text-white no-underline shadow-[0_11px_26px_rgba(37,99,235,0.3)] transition hover:-translate-y-1 hover:text-white hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 motion-reduce:transform-none"
        >
          <IconUserPlus size={20} aria-hidden="true" />
          Registrar colaborador
        </Link>
      </header>

      {aviso ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-semibold text-emerald-800" role="status">
          {aviso}
        </div>
      ) : null}
      {accionError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-800" role="alert">
          {accionError}
        </div>
      ) : null}

      <section
        className="grid gap-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-6 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end"
        aria-label="Búsqueda y filtros"
      >
        <label className="grid min-w-0 gap-2 md:col-span-2 xl:col-span-1">
          <span className="text-sm font-bold text-[#163f6b]">Buscar</span>
          <span className="relative block">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} aria-hidden="true" />
            <input
              type="search"
              className={`${inputClass} pl-11`}
              placeholder="Nombre, apellidos o cédula"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </span>
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-bold text-[#163f6b]">Cargo</span>
          <input
            className={inputClass}
            list="rrhh-cargos-filtro"
            placeholder="Todos los cargos"
            value={cargo}
            onChange={(event) => setCargo(event.target.value)}
          />
          <datalist id="rrhh-cargos-filtro">
            {CARGOS_SUGERIDOS.map((opcion) => (
              <option key={opcion} value={opcion} />
            ))}
          </datalist>
        </label>
        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-bold text-[#163f6b]">Estado</span>
          <select
            className={inputClass}
            value={estado}
            onChange={(event) => actualizarFiltros({ estado: event.target.value as EstadoFiltro })}
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </label>
        <button
          type="button"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-2 xl:col-span-1"
          onClick={limpiarFiltros}
          disabled={!hayFiltros && !busqueda && !cargo}
        >
          <IconFilterOff size={18} aria-hidden="true" />
          Limpiar filtros
        </button>
      </section>

      <section
        className="min-w-0 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl"
        aria-busy={cargando}
        aria-label="Listado de colaboradores"
      >
        {cargando && !listado ? (
          <div className="grid gap-3 p-6" role="status">
            <span className="sr-only">Cargando colaboradores…</span>
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
        ) : colaboradores.length === 0 ? (
          <div className="grid place-items-center gap-3 p-10 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <IconUsers size={28} aria-hidden="true" />
            </span>
            <h2 className="m-0 text-lg font-extrabold text-[#073b73]">
              {hayFiltros ? 'Sin resultados' : 'Aún no hay colaboradores'}
            </h2>
            <p className="m-0 max-w-md text-slate-500">
              {hayFiltros
                ? 'Ningún colaborador coincide con la búsqueda o los filtros aplicados.'
                : 'Use “Registrar colaborador” para agregar al personal de la ASADA.'}
            </p>
          </div>
        ) : (
          <table className={`w-full border-collapse text-left transition-opacity ${cargando ? 'opacity-60' : ''}`}>
            <thead className="hidden bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-500 xl:table-header-group">
              <tr>
                <th scope="col" className="px-6 py-4">Cédula</th>
                <th scope="col" className="px-6 py-4">Colaborador</th>
                <th scope="col" className="px-6 py-4">Cargo</th>
                <th scope="col" className="px-6 py-4">Estado</th>
                <th scope="col" className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="block divide-y divide-slate-100 xl:table-row-group">
              {colaboradores.map((colaborador) => {
                const nombre = nombreCompleto(colaborador)
                return (
                  <tr key={colaborador.id} className="grid gap-2 px-5 py-4 transition hover:bg-sky-50/50 xl:table-row xl:p-0">
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                      <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Cédula</span>
                      <span className="whitespace-nowrap font-mono text-sm font-semibold text-slate-700">{colaborador.cedula}</span>
                    </td>
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                      <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Colaborador</span>
                      <span className="min-w-0 text-right xl:text-left">
                        <span className="block font-extrabold text-[#073b73]">{nombre}</span>
                        <span className="block truncate text-sm text-slate-500">{colaborador.correoElectronico}</span>
                      </span>
                    </td>
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                      <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Cargo</span>
                      <span className="font-semibold text-slate-700">{colaborador.cargo}</span>
                    </td>
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                      <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Estado</span>
                      <EstadoBadge activo={colaborador.activo} />
                    </td>
                    <td className="pt-2 xl:table-cell xl:px-6 xl:py-4">
                      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <Link
                          to={colaboradorDetailPath(colaborador.id)}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[#d6e6f8] bg-[#f3f8fe] px-3 py-1.5 text-sm font-bold text-[#1d5fb8] no-underline transition hover:border-[#1d6fd6] hover:bg-[#1d6fd6] hover:text-white hover:no-underline"
                          aria-label={`Ver a ${nombre}`}
                        >
                          <IconEye size={16} aria-hidden="true" />
                          Ver
                        </Link>
                        <Link
                          to={colaboradorEditPath(colaborador.id)}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-600 no-underline transition hover:border-blue-300 hover:text-blue-700 hover:no-underline"
                          aria-label={`Editar a ${nombre}`}
                        >
                          <IconPencil size={16} aria-hidden="true" />
                          Editar
                        </Link>
                        <CambiarEstadoColaborador
                          colaborador={colaborador}
                          compacto
                          onCambiado={reemplazarColaborador}
                          onError={(mensaje) => {
                            setAviso(null)
                            setAccionError(mensaje)
                          }}
                          onNoAutenticado={salirPorSesion}
                        />
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
            className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:px-6"
            aria-label="Paginación de colaboradores"
          >
            <p className="m-0">
              Mostrando {desde}–{hasta} de {total} colaborador{total === 1 ? '' : 'es'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
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
                className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
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
