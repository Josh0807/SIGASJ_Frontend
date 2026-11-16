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
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { ADMIN_COPY } from '../../shared/admin/adminCopy'
import {
  AdminFilterField,
  AdminFilters,
  AdminShell,
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
  adminFilterControlClassName,
} from '../../shared/ui'
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
    <AdminShell className="gap-5 sm:gap-6" aria-labelledby="colaboradores-rrhh-title">
      <RrhhSubnav />

      <PageHeader
        id="colaboradores-rrhh-title"
        eyebrow="Administración · Recursos humanos"
        title={
          <span className="inline-flex items-center gap-2">
            <IconUsers size={22} aria-hidden="true" />
            Colaboradores
          </span>
        }
        description="Consulte y administre el personal de la ASADA."
        actions={
          <Button
            to={COLABORADOR_NEW_PATH}
            variant="primary"
            size="sm"
            leftIcon={<IconUserPlus size={16} aria-hidden="true" />}
          >
            Registrar colaborador
          </Button>
        }
      />

      {aviso ? (
        <Alert tone="success" role="status">
          {aviso}
        </Alert>
      ) : null}
      {accionError ? <Alert tone="danger">{accionError}</Alert> : null}

      <AdminFilters
        aria-label="Búsqueda y filtros"
        className="!grid-cols-1 sm:!grid-cols-[minmax(0,1fr)_auto]"
        summary={
          <>
            <strong className="text-sigasj-ink">{cargando ? '…' : total}</strong>
            <span>
              {total === 1 ? 'colaborador' : 'colaboradores'}
            </span>
          </>
        }
      >
        <AdminFilterField label="Buscar">
          <span className="relative block">
            <IconSearch
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sigasj-muted"
              size={17}
              aria-hidden="true"
            />
            <input
              type="search"
              className={`${adminFilterControlClassName} pl-9`}
              placeholder="Nombre, apellidos o cédula"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </span>
        </AdminFilterField>
        <AdminFilterField label="Cargo">
          <input
            className={adminFilterControlClassName}
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
        </AdminFilterField>
        <AdminFilterField label="Estado">
          <select
            className={adminFilterControlClassName}
            value={estado}
            onChange={(event) =>
              actualizarFiltros({ estado: event.target.value as EstadoFiltro })
            }
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </AdminFilterField>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={<IconFilterOff size={16} aria-hidden="true" />}
          onClick={limpiarFiltros}
          disabled={!hayFiltros && !busqueda && !cargo}
        >
          Limpiar
        </Button>
      </AdminFilters>

      <Card
        as="section"
        className={`min-w-0 overflow-hidden !p-0 ${cargando && listado ? 'opacity-60' : ''}`}
        aria-busy={cargando}
        aria-label="Listado de colaboradores"
      >
        {cargando && !listado ? (
          <Alert tone="info" className="m-0 rounded-none border-0">
            {ADMIN_COPY.loading('colaboradores')}
          </Alert>
        ) : error ? (
          <EmptyState
            title={error}
            actions={
              resultado.reintentable ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<IconRefresh size={16} aria-hidden="true" />}
                  onClick={() => setRecarga((n) => n + 1)}
                >
                  {ADMIN_COPY.retry}
                </Button>
              ) : undefined
            }
          />
        ) : colaboradores.length === 0 ? (
          <EmptyState
            icon={<IconUsers size={32} aria-hidden="true" />}
            title={
              hayFiltros
                ? ADMIN_COPY.emptyFiltered('colaboradores')
                : ADMIN_COPY.empty('colaboradores registrados')
            }
            description={
              hayFiltros
                ? undefined
                : 'Use «Registrar colaborador» para agregar al personal de la ASADA.'
            }
            actions={
              hayFiltros ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<IconFilterOff size={16} aria-hidden="true" />}
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </Button>
              ) : (
                <Button
                  to={COLABORADOR_NEW_PATH}
                  variant="primary"
                  size="sm"
                  leftIcon={<IconUserPlus size={16} aria-hidden="true" />}
                >
                  Registrar colaborador
                </Button>
              )
            }
          />
        ) : (
          <table className="w-full border-collapse text-left">
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
                        <Button
                          to={colaboradorDetailPath(colaborador.id)}
                          variant="secondary"
                          size="sm"
                          leftIcon={<IconEye size={16} aria-hidden="true" />}
                          aria-label={`Ver a ${nombre}`}
                        >
                          Ver
                        </Button>
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
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<IconChevronLeft size={16} aria-hidden="true" />}
                onClick={() => actualizarFiltros({ page: page - 1 })}
                disabled={page <= 1 || cargando}
              >
                Anterior
              </Button>
              <span className="px-1.5 font-semibold">
                {page} / {Math.max(totalPages, 1)}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                rightIcon={<IconChevronRight size={16} aria-hidden="true" />}
                onClick={() => actualizarFiltros({ page: page + 1 })}
                disabled={page >= totalPages || cargando}
              >
                Siguiente
              </Button>
            </div>
          </nav>
        ) : null}
      </Card>
    </AdminShell>
  )
}
