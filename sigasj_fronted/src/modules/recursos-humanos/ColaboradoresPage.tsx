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
import { Button } from '../../shared/ui/Button'
import { PageHeader } from '../../shared/ui/PageHeader'
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
  colaboradorDetailPath,
} from './recursosHumanosPaths'
import RrhhSubnav from './RrhhSubnav'
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
  'min-h-11 w-full rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-[color:var(--asada-surface,#fff)] px-3.5 text-[color:var(--asada-ink,#123f70)] outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-[color:var(--asada-muted,#5b7390)] hover:border-[color:var(--asada-navy,#1e5a9c)] focus:border-[color:var(--asada-navy,#1e5a9c)] focus:ring-4 focus:ring-[color:color-mix(in_srgb,var(--asada-navy,#1e5a9c)_16%,transparent)]'

const labelClass =
  'text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[color:var(--asada-muted,#5b7390)]'

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
    <main className="admin-content-modern grid w-full min-w-0 gap-4">
      <RrhhSubnav />

      <PageHeader
        title="Colaboradores"
        description="Consulte y administre el personal de la ASADA."
        actions={
          <Button to={COLABORADOR_NEW_PATH} leftIcon={<IconUserPlus size={18} aria-hidden="true" />}>
            Registrar colaborador
          </Button>
        }
      />

      {aviso ? (
        <div
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
          role="status"
        >
          {aviso}
        </div>
      ) : null}
      {accionError ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
          role="alert"
        >
          {accionError}
        </div>
      ) : null}

      <section
        className="grid gap-3 rounded-2xl border border-[color:var(--asada-line,#d7e5f1)] bg-[color:var(--asada-surface,#fff)] p-4 shadow-[0_10px_24px_rgba(18,63,112,0.06)] md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end"
        aria-label="Búsqueda y filtros"
      >
        <label className="grid min-w-0 gap-1.5 md:col-span-2 xl:col-span-1">
          <span className={labelClass}>Buscar</span>
          <span className="relative block">
            <IconSearch
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--asada-muted,#5b7390)]"
              size={18}
              aria-hidden="true"
            />
            <input
              type="search"
              className={`${inputClass} pl-10`}
              placeholder="Nombre, apellidos o cédula"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </span>
        </label>
        <label className="grid min-w-0 gap-1.5">
          <span className={labelClass}>Cargo</span>
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
        <label className="grid min-w-0 gap-1.5">
          <span className={labelClass}>Estado</span>
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
          className="rrhh-touch-target inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-[color:var(--asada-surface,#fff)] px-4 text-sm font-bold text-[color:var(--asada-muted,#5b7390)] transition-[border-color,color,background-color] duration-200 enabled:hover:border-[color:var(--asada-navy,#1e5a9c)] enabled:hover:bg-[color:var(--asada-ice,#eaf6ff)] enabled:hover:text-[color:var(--asada-navy,#1e5a9c)] disabled:cursor-not-allowed disabled:opacity-45 md:col-span-2 xl:col-span-1"
          onClick={limpiarFiltros}
          disabled={!hayFiltros && !busqueda && !cargo}
        >
          <IconFilterOff size={17} aria-hidden="true" />
          Limpiar
        </button>
      </section>

      <section
        className="min-w-0 overflow-hidden rounded-2xl border border-[color:var(--asada-line,#d7e5f1)] bg-[color:var(--asada-surface,#fff)] shadow-[0_12px_28px_rgba(18,63,112,0.07)]"
        aria-busy={cargando}
        aria-label="Listado de colaboradores"
      >
        {cargando && !listado ? (
          <div className="grid gap-2.5 p-5" role="status">
            <span className="sr-only">Cargando colaboradores…</span>
            {[0, 1, 2].map((fila) => (
              <div
                key={fila}
                className="h-12 animate-pulse rounded-xl bg-[color:var(--asada-ice,#eaf6ff)] motion-reduce:animate-none"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : error ? (
          <div className="grid place-items-center gap-3 p-8 text-center" role="alert">
            <p className="m-0 font-semibold text-red-700">{error}</p>
            {resultado.reintentable ? (
              <button
                type="button"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-white px-4 text-sm font-bold text-[color:var(--asada-navy,#1e5a9c)] transition hover:bg-[color:var(--asada-ice,#eaf6ff)]"
                onClick={() => setRecarga((n) => n + 1)}
              >
                <IconRefresh size={17} aria-hidden="true" />
                Reintentar
              </button>
            ) : null}
          </div>
        ) : colaboradores.length === 0 ? (
          <div className="grid place-items-center gap-2.5 p-8 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-[color:var(--asada-ice,#eaf6ff)] text-[color:var(--asada-navy,#1e5a9c)]">
              <IconUsers size={24} aria-hidden="true" />
            </span>
            <h2 className="m-0 text-base font-extrabold text-[color:var(--asada-ink,#123f70)]">
              {hayFiltros ? 'Sin resultados' : 'Aún no hay colaboradores'}
            </h2>
            <p className="m-0 max-w-md text-sm text-[color:var(--asada-muted,#5b7390)]">
              {hayFiltros
                ? 'Ningún colaborador coincide con la búsqueda o los filtros aplicados.'
                : 'Use “Registrar colaborador” para agregar al personal de la ASADA.'}
            </p>
          </div>
        ) : (
          <table className={`w-full border-collapse text-left transition-opacity ${cargando ? 'opacity-60' : ''}`}>
            <thead className="hidden border-b border-[color:var(--asada-line,#d7e5f1)] bg-[color:var(--asada-ice,#eaf6ff)] text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[color:var(--asada-muted,#5b7390)] xl:table-header-group">
              <tr>
                <th scope="col" className="px-5 py-3">Cédula</th>
                <th scope="col" className="px-5 py-3">Colaborador</th>
                <th scope="col" className="px-5 py-3">Cargo</th>
                <th scope="col" className="px-5 py-3">Estado</th>
                <th scope="col" className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="block divide-y divide-[color:var(--asada-line,#d7e5f1)] xl:table-row-group">
              {colaboradores.map((colaborador) => {
                const nombre = nombreCompleto(colaborador)
                return (
                  <tr
                    key={colaborador.id}
                    className="group grid gap-2 px-4 py-3.5 transition-colors duration-150 hover:bg-[color:color-mix(in_srgb,var(--asada-ice,#eaf6ff)_55%,white)] xl:table-row xl:p-0"
                  >
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-5 xl:py-3.5">
                      <span className="text-xs font-bold uppercase text-[color:var(--asada-muted,#5b7390)] xl:hidden">
                        Cédula
                      </span>
                      <span className="whitespace-nowrap font-mono text-sm font-semibold text-[color:var(--asada-ink,#123f70)]">
                        {colaborador.cedula}
                      </span>
                    </td>
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-5 xl:py-3.5">
                      <span className="text-xs font-bold uppercase text-[color:var(--asada-muted,#5b7390)] xl:hidden">
                        Colaborador
                      </span>
                      <span className="min-w-0 text-right xl:text-left">
                        <span className="block font-extrabold text-[color:var(--asada-ink,#123f70)]">
                          {nombre}
                        </span>
                        <span className="block truncate text-sm text-[color:var(--asada-muted,#5b7390)]">
                          {colaborador.correoElectronico}
                        </span>
                      </span>
                    </td>
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-5 xl:py-3.5">
                      <span className="text-xs font-bold uppercase text-[color:var(--asada-muted,#5b7390)] xl:hidden">
                        Cargo
                      </span>
                      <span className="font-semibold text-[color:var(--asada-ink,#123f70)]">
                        {colaborador.cargo}
                      </span>
                    </td>
                    <td className="flex items-center justify-between gap-3 xl:table-cell xl:px-5 xl:py-3.5">
                      <span className="text-xs font-bold uppercase text-[color:var(--asada-muted,#5b7390)] xl:hidden">
                        Estado
                      </span>
                      <EstadoBadge activo={colaborador.activo} />
                    </td>
                    <td className="pt-1 xl:table-cell xl:px-5 xl:py-3.5">
                      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <Link
                          to={colaboradorDetailPath(colaborador.id)}
                          className="rrhh-touch-target inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[color:var(--asada-line,#d7e5f1)] bg-white px-3 py-1.5 text-sm font-bold text-[color:var(--asada-navy,#1e5a9c)] no-underline transition-[background-color,border-color] duration-150 hover:border-[color:var(--asada-navy,#1e5a9c)] hover:bg-[color:var(--asada-ice,#eaf6ff)] hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--asada-navy,#1e5a9c)]"
                          aria-label={`Ver a ${nombre}`}
                        >
                          <IconEye size={16} aria-hidden="true" />
                          Ver
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
            className="flex flex-col items-center justify-between gap-3 border-t border-[color:var(--asada-line,#d7e5f1)] bg-[color:color-mix(in_srgb,var(--asada-ice,#eaf6ff)_40%,white)] px-4 py-3 text-sm text-[color:var(--asada-muted,#5b7390)] sm:flex-row sm:px-5"
            aria-label="Paginación de colaboradores"
          >
            <p className="m-0">
              Mostrando {desde}–{hasta} de {total} colaborador{total === 1 ? '' : 'es'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rrhh-touch-target inline-flex min-h-9 items-center gap-1 rounded-lg border border-[color:var(--asada-line,#d7e5f1)] bg-white px-3 font-bold text-[color:var(--asada-ink,#123f70)] transition enabled:hover:border-[color:var(--asada-navy,#1e5a9c)] enabled:hover:bg-[color:var(--asada-ice,#eaf6ff)] disabled:cursor-not-allowed disabled:opacity-45"
                onClick={() => actualizarFiltros({ page: page - 1 })}
                disabled={page <= 1 || cargando}
              >
                <IconChevronLeft size={16} aria-hidden="true" />
                Anterior
              </button>
              <span className="px-1.5 font-semibold">
                {page} / {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                className="rrhh-touch-target inline-flex min-h-9 items-center gap-1 rounded-lg border border-[color:var(--asada-line,#d7e5f1)] bg-white px-3 font-bold text-[color:var(--asada-ink,#123f70)] transition enabled:hover:border-[color:var(--asada-navy,#1e5a9c)] enabled:hover:bg-[color:var(--asada-ice,#eaf6ff)] disabled:cursor-not-allowed disabled:opacity-45"
                onClick={() => actualizarFiltros({ page: page + 1 })}
                disabled={page >= totalPages || cargando}
              >
                Siguiente
                <IconChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </nav>
        ) : null}
      </section>
    </main>
  )
}
