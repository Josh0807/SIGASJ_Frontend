import {
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconFilterOff,
  IconHistory,
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
  EmptyState,
  PageHeader,
  adminFilterControlClassName,
} from '../../shared/ui'
import { useAuth } from '../auth/components/AuthContext'
import {
  asociadoConsultaError,
  esNoAutenticado,
  esReintentable,
  formatearFecha,
  nombreCompleto,
} from './asociadoForm'
import { ASOCIADOS_PAGE_SIZE, getAsociados } from './asociadosApi'
import { ASOCIADO_NEW_PATH, ASOCIADOS_HISTORIAL_PATH, asociadoDetailPath } from './asociadosPaths'
import EstadoAsociadoBadge from './EstadoAsociadoBadge'
import type { Asociado, AsociadosFiltros, AsociadosListado, EstadoFiltro } from './types'
import CambiarEstadoAsociado from './CambiarEstadoAsociado'

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
  const [aviso, setAviso] = useState<string | null>(
    (location.state as { success?: string } | null)?.success ?? null,
  )
  const [accionError, setAccionError] = useState<string | null>(null)

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

  const reemplazarAsociado = (actualizado: Asociado) => {
    setAccionError(null)
    setAviso(
      `${nombreCompleto(actualizado)} fue ${actualizado.activo ? 'reactivado' : 'inactivado'} correctamente.`,
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
    <AdminShell aria-labelledby="asociados-admin-title" className="gap-5 sm:gap-6">
      {aviso ? <Alert tone="success">{aviso}</Alert> : null}
      {accionError ? <Alert tone="danger">{accionError}</Alert> : null}

      <PageHeader
        id="asociados-admin-title"
        title="Asociados"
        description="Personas asociadas al servicio de agua de la ASADA."
        actions={
          <>
            <Button
              to={ASOCIADOS_HISTORIAL_PATH}
              variant="secondary"
              leftIcon={<IconHistory size={18} aria-hidden="true" />}
            >
              Ver historial
            </Button>
            <Button
              to={ASOCIADO_NEW_PATH}
              variant="primary"
              leftIcon={<IconUserPlus size={18} aria-hidden="true" />}
            >
              Registrar asociado
            </Button>
          </>
        }
      />

      <AdminFilters
        aria-label="Búsqueda y filtros"
        summary={
          <>
            <strong className="text-sigasj-ink">{cargando ? '…' : total}</strong>
            <span>{total === 1 ? 'asociado' : 'asociados'}</span>
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
              maxLength={100}
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </span>
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
          leftIcon={<IconFilterOff size={17} aria-hidden="true" />}
          onClick={limpiarFiltros}
          disabled={!hayFiltros && !busqueda}
        >
          Limpiar filtros
        </Button>
      </AdminFilters>

      <section
        className="min-w-0 overflow-hidden rounded-2xl border border-[#d7e5f1] bg-white shadow-[0_12px_30px_rgba(30, 90, 156,0.07)] sm:rounded-3xl"
        aria-busy={cargando}
        aria-label="Listado de asociados"
      >
        {cargando && !listado ? (
          <Alert tone="info">{ADMIN_COPY.loading('asociados')}</Alert>
        ) : error ? (
          <EmptyState
            title={error}
            actions={
              resultado.reintentable ? (
                <Button
                  type="button"
                  variant="secondary"
                  leftIcon={<IconRefresh size={17} aria-hidden="true" />}
                  onClick={() => setRecarga((n) => n + 1)}
                >
                  {ADMIN_COPY.retry}
                </Button>
              ) : undefined
            }
          />
        ) : asociados.length === 0 ? (
          <EmptyState
            icon={<IconUsers size={32} aria-hidden="true" />}
            title={
              hayFiltros
                ? ADMIN_COPY.emptyFiltered('asociados')
                : ADMIN_COPY.empty('asociados registrados')
            }
            actions={
              !hayFiltros ? (
                <Button
                  to={ASOCIADO_NEW_PATH}
                  variant="primary"
                  leftIcon={<IconUserPlus size={18} aria-hidden="true" />}
                >
                  Registrar asociado
                </Button>
              ) : undefined
            }
          />
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
                        <Button
                          to={asociadoDetailPath(asociado.id)}
                          state={{ from: `${location.pathname}${location.search}` }}
                          variant="secondary"
                          size="sm"
                          leftIcon={<IconEye size={16} aria-hidden="true" />}
                          aria-label={`Ver a ${nombre}`}
                        >
                          Ver
                        </Button>
                        <CambiarEstadoAsociado
                          asociado={asociado}
                          compacto
                          onCambiado={reemplazarAsociado}
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
            aria-label="Paginación de asociados"
          >
            <p className="m-0">
              Mostrando {desde}–{hasta} de {total} asociado{total === 1 ? '' : 's'}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<IconChevronLeft size={17} aria-hidden="true" />}
                onClick={() => actualizarFiltros({ page: page - 1 })}
                disabled={page <= 1 || cargando}
              >
                Anterior
              </Button>
              <span className="px-2 font-semibold text-slate-600">
                Página {page} de {Math.max(totalPages, 1)}
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                rightIcon={<IconChevronRight size={17} aria-hidden="true" />}
                onClick={() => actualizarFiltros({ page: page + 1 })}
                disabled={page >= totalPages || cargando}
              >
                Siguiente
              </Button>
            </div>
          </nav>
        ) : null}
      </section>
    </AdminShell>
  )
}
