import {
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconFilterOff,
  IconRefresh,
  IconSearch,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { useAuth } from '../auth/components/AuthContext'
import {
  asociadoConsultaError,
  esNoAutenticado,
  esReintentable,
  formatearFecha,
  nombreCompleto,
} from './asociadoForm'
import { ASOCIADOS_PAGE_SIZE, getAsociados } from './asociadosApi'
import { ASOCIADO_NEW_PATH, ASOCIADOS_TITLE, asociadoDetailPath } from './asociadosPaths'
import EstadoAsociadoBadge from './EstadoAsociadoBadge'
import type { AsociadosFiltros, AsociadosListado, EstadoFiltro } from './types'

const SEARCH_DEBOUNCE_MS = 350
const ESTADOS: EstadoFiltro[] = ['todos', 'activos', 'inactivos']

const leerFiltros = (params: URLSearchParams): AsociadosFiltros => {
  const estado = params.get('estado') as EstadoFiltro | null
  const page = Number(params.get('page'))
  return {
    search: params.get('search') ?? '',
    estado: estado && ESTADOS.includes(estado) ? estado : 'todos',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

const inputClass =
  'min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'

export default function AsociadosPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const filtros = leerFiltros(searchParams)
  const [busqueda, setBusqueda] = useState(filtros.search)
  const [listado, setListado] = useState<AsociadosListado | null>(null)
  const [resultado, setResultado] = useState<{
    clave: string
    error: string | null
    reintentable: boolean
  }>({ clave: '', error: null, reintentable: true })
  const [recarga, setRecarga] = useState(0)
  const aviso = (location.state as { success?: string } | null)?.success ?? null

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  const actualizarFiltros = useCallback(
    (cambios: Partial<AsociadosFiltros>) => {
      setSearchParams(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales)
          const resultado = { ...leerFiltros(actuales), page: 1, ...cambios }
          const pares: Array<[string, string]> = [
            ['search', resultado.search.trim()],
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
    if (busqueda.trim() === filtros.search.trim()) {
      return undefined
    }
    const timer = window.setTimeout(
      () => actualizarFiltros({ search: busqueda }),
      SEARCH_DEBOUNCE_MS,
    )
    return () => window.clearTimeout(timer)
  }, [busqueda, filtros.search, actualizarFiltros])

  const { search, estado, page } = filtros
  const clave = JSON.stringify([search, estado, page, recarga])
  const cargando = resultado.clave !== clave
  const error = cargando ? null : resultado.error

  useEffect(() => {
    const controller = new AbortController()
    getAsociados({ search, estado, page }, controller.signal)
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
          error: asociadoConsultaError(err, 'No fue posible cargar los asociados.'),
          reintentable: esReintentable(err),
        })
      })
    return () => controller.abort()
  }, [clave, search, estado, page, salirPorSesion, actualizarFiltros])

  const hayFiltros = Boolean(search || estado !== 'todos')
  const limpiarFiltros = () => {
    setBusqueda('')
    actualizarFiltros({ search: '', estado: 'todos', page: 1 })
  }

  const asociados = listado?.data ?? []
  const total = listado?.total ?? 0
  const totalPages = listado?.totalPages ?? 0
  const desde = total ? (page - 1) * ASOCIADOS_PAGE_SIZE + 1 : 0
  const hasta = Math.min(page * ASOCIADOS_PAGE_SIZE, total)

  return (
    <main className="grid w-full min-w-0 gap-5 sm:gap-6">
      {aviso ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-semibold text-emerald-800 shadow-sm" role="status">
          {aviso}
        </div>
      ) : null}

      <header className="flex flex-col gap-5 rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
            Administración · Asociados
          </p>
          <h1 className="m-0 text-3xl font-black tracking-tight text-[#062e63] sm:text-4xl">
            {ASOCIADOS_TITLE}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Registre, consulte y busque la información de las personas asociadas.
          </p>
        </div>
        <Link
          to={ASOCIADO_NEW_PATH}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-6 py-3.5 font-extrabold text-white no-underline shadow-[0_11px_26px_rgba(37,99,235,0.3)] transition hover:-translate-y-1 hover:text-white hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 motion-reduce:transform-none"
        >
          <IconUserPlus size={20} aria-hidden="true" />
          Registrar asociado
        </Link>
      </header>

      <section
        className="grid gap-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] md:items-end"
        aria-label="Búsqueda y filtros"
      >
        <label className="grid min-w-0 gap-2">
          <span className="text-sm font-bold text-[#163f6b]">Buscar</span>
          <span className="relative block">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} aria-hidden="true" />
            <input
              type="search"
              className={`${inputClass} pl-11`}
              placeholder="Nombre, apellidos o cédula"
              maxLength={100}
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </span>
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
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={limpiarFiltros}
          disabled={!hayFiltros && !busqueda}
        >
          <IconFilterOff size={18} aria-hidden="true" />
          Limpiar filtros
        </button>
      </section>

      <section
        className="min-w-0 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl"
        aria-busy={cargando}
        aria-label="Listado de asociados"
      >
        {cargando && !listado ? (
          <div className="grid gap-3 p-6" role="status">
            <span className="sr-only">Cargando asociados…</span>
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
        ) : asociados.length === 0 ? (
          <div className="grid place-items-center gap-3 p-10 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <IconUsers size={28} aria-hidden="true" />
            </span>
            <h2 className="m-0 text-lg font-extrabold text-[#073b73]">
              {hayFiltros ? 'Sin resultados' : 'Aún no hay asociados'}
            </h2>
            <p className="m-0 max-w-md text-slate-500">
              {hayFiltros
                ? 'Ningún asociado coincide con la búsqueda o los filtros aplicados.'
                : 'Use “Registrar asociado” para agregar una nueva persona al sistema.'}
            </p>
          </div>
        ) : (
          <table className={`w-full border-collapse text-left transition-opacity ${cargando ? 'opacity-60' : ''}`}>
            <thead className="hidden bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-500 xl:table-header-group">
              <tr>
                <th scope="col" className="px-6 py-4">Cédula</th>
                <th scope="col" className="px-6 py-4">Asociado</th>
                <th scope="col" className="px-6 py-4">Fecha de registro</th>
                <th scope="col" className="px-6 py-4">Estado</th>
                <th scope="col" className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="block divide-y divide-slate-100 xl:table-row-group">
              {asociados.map((asociado) => {
                const nombre = nombreCompleto(asociado)
                return (
                  <tr key={asociado.id} className="grid gap-2 px-5 py-4 transition hover:bg-sky-50/50 xl:table-row xl:p-0">
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                      <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Cédula</span>
                      <span className="whitespace-nowrap font-mono text-sm font-semibold text-slate-700">{asociado.cedula}</span>
                    </td>
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                      <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Asociado</span>
                      <span className="min-w-0 text-right xl:text-left">
                        <span className="block font-extrabold text-[#073b73]">{nombre}</span>
                        <span className="block truncate text-sm text-slate-500">{asociado.correoElectronico}</span>
                      </span>
                    </td>
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                      <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Fecha de registro</span>
                      <span className="font-semibold text-slate-700">{formatearFecha(asociado.fechaRegistro)}</span>
                    </td>
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4">
                      <span className="text-xs font-bold uppercase text-slate-400 xl:hidden">Estado</span>
                      <EstadoAsociadoBadge activo={asociado.activo} />
                    </td>
                    <td className="pt-2 xl:table-cell xl:px-6 xl:py-4">
                      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <Link
                          to={asociadoDetailPath(asociado.id)}
                          state={{ from: `${location.pathname}${location.search}` }}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[#d6e6f8] bg-[#f3f8fe] px-3 py-1.5 text-sm font-bold text-[#1d5fb8] no-underline transition hover:border-[#1d6fd6] hover:bg-[#1d6fd6] hover:text-white hover:no-underline"
                          aria-label={`Ver a ${nombre}`}
                        >
                          <IconEye size={16} aria-hidden="true" />
                          Ver
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
            className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:px-6"
            aria-label="Paginación de asociados"
          >
            <p className="m-0">
              Mostrando {desde}–{hasta} de {total} asociado{total === 1 ? '' : 's'}
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
