import {
  IconCalendarOff,
  IconCalendarPlus,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconFilterOff,
  IconFirstAidKit,
  IconPencil,
  IconRefresh,
  IconUser,
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
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  adminFilterControlClassName,
} from '../../shared/ui'
import { useAuth } from '../auth/components/AuthContext'
import { getColaboradoresOpciones } from './colaboradoresApi'
import {
  esNoAutenticado,
  esReintentable,
  nombreCompleto,
} from './colaboradorForm'
import {
  formatearFechaPermiso,
  incapacidadErrorMessage,
  nombreColaboradorIncapacidad,
  resumenObservaciones,
} from './incapacidadForm'
import { INCAPACIDADES_PAGE_SIZE, getIncapacidades } from './incapacidadesApi'
import {
  INCAPACIDAD_NEW_PATH,
  incapacidadDetailPath,
  incapacidadEditPath,
} from './recursosHumanosPaths'
import RrhhSubnav from './RrhhSubnav'
import type {
  Colaborador,
  IncapacidadesFiltros,
  IncapacidadesListado,
} from './types'

const leerFiltros = (params: URLSearchParams): IncapacidadesFiltros => {
  const page = Number(params.get('page'))
  return {
    colaboradorId: params.get('colaboradorId') ?? '',
    fechaInicio: params.get('fechaInicio') ?? '',
    fechaFin: params.get('fechaFin') ?? '',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

export default function IncapacidadesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const filtros = leerFiltros(searchParams)
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [listado, setListado] = useState<IncapacidadesListado | null>(null)
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
    (cambios: Partial<IncapacidadesFiltros>) => {
      setSearchParams(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales)
          const resultadoFiltros = {
            ...leerFiltros(actuales),
            page: 1,
            ...cambios,
          }
          const pares: Array<[string, string]> = [
            ['colaboradorId', resultadoFiltros.colaboradorId.trim()],
            ['fechaInicio', resultadoFiltros.fechaInicio.trim()],
            ['fechaFin', resultadoFiltros.fechaFin.trim()],
            [
              'page',
              resultadoFiltros.page > 1 ? String(resultadoFiltros.page) : '',
            ],
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
  const clave = JSON.stringify([
    colaboradorId,
    fechaInicio,
    fechaFin,
    page,
    recarga,
  ])
  const cargando = resultado.clave !== clave
  const error = cargando ? null : resultado.error

  useEffect(() => {
    const controller = new AbortController()
    getIncapacidades(
      { colaboradorId, fechaInicio, fechaFin, page },
      controller.signal,
    )
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
          error: incapacidadErrorMessage(
            err,
            'No fue posible cargar las incapacidades. Intente nuevamente.',
          ),
          reintentable: esReintentable(err),
        })
      })
    return () => controller.abort()
  }, [
    clave,
    colaboradorId,
    fechaInicio,
    fechaFin,
    page,
    salirPorSesion,
    actualizarFiltros,
  ])

  const hayFiltros = Boolean(colaboradorId || fechaInicio || fechaFin)
  const limpiarFiltros = () => {
    actualizarFiltros({
      colaboradorId: '',
      fechaInicio: '',
      fechaFin: '',
      page: 1,
    })
  }

  const incapacidades = listado?.data ?? []
  const total = listado?.total ?? 0
  const totalPages = listado?.totalPages ?? 0
  const desde = total ? (page - 1) * INCAPACIDADES_PAGE_SIZE + 1 : 0
  const hasta = Math.min(page * INCAPACIDADES_PAGE_SIZE, total)

  return (
    <AdminShell className="gap-5 sm:gap-6" aria-labelledby="incapacidades-rrhh-title">
      <RrhhSubnav />

      <PageHeader
        id="incapacidades-rrhh-title"
        eyebrow="Administración · Incapacidades"
        title={
          <span className="inline-flex items-center gap-2">
            <IconFirstAidKit size={22} aria-hidden="true" />
            Incapacidades del personal
          </span>
        }
        description="Registre y consulte los periodos de incapacidad administrativa de los colaboradores."
        actions={
          <Button
            to={INCAPACIDAD_NEW_PATH}
            variant="primary"
            size="sm"
            leftIcon={<IconCalendarPlus size={16} aria-hidden="true" />}
          >
            Registrar incapacidad
          </Button>
        }
      />

      {aviso ? (
        <Alert tone="success" role="status">
          {aviso}
        </Alert>
      ) : null}

      <AdminFilters
        aria-label="Filtros de incapacidades"
        summary={
          <>
            <strong className="text-sigasj-ink">{cargando ? '…' : total}</strong>
            <span>
              {total === 1 ? 'incapacidad' : 'incapacidades'}
            </span>
          </>
        }
      >
        <AdminFilterField label="Colaborador">
          <select
            className={adminFilterControlClassName}
            value={colaboradorId}
            aria-label="Filtrar por colaborador"
            onChange={(event) =>
              actualizarFiltros({ colaboradorId: event.target.value })
            }
          >
            <option value="">Todos los colaboradores</option>
            {colaboradores.map((colaborador) => (
              <option key={colaborador.id} value={String(colaborador.id)}>
                {nombreCompleto(colaborador)}
              </option>
            ))}
          </select>
        </AdminFilterField>
        <AdminFilterField label="Desde">
          <input
            type="date"
            className={adminFilterControlClassName}
            value={fechaInicio}
            aria-label="Filtrar desde"
            onChange={(event) =>
              actualizarFiltros({ fechaInicio: event.target.value })
            }
          />
        </AdminFilterField>
        <AdminFilterField label="Hasta">
          <input
            type="date"
            className={adminFilterControlClassName}
            value={fechaFin}
            aria-label="Filtrar hasta"
            onChange={(event) =>
              actualizarFiltros({ fechaFin: event.target.value })
            }
          />
        </AdminFilterField>
        {hayFiltros ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<IconFilterOff size={16} aria-hidden="true" />}
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </Button>
        ) : null}
      </AdminFilters>

      {cargando && !listado ? (
        <Alert tone="info">{ADMIN_COPY.loading('incapacidades')}</Alert>
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
      ) : incapacidades.length === 0 ? (
        <EmptyState
          icon={<IconCalendarOff size={28} aria-hidden="true" />}
          title={
            hayFiltros
              ? 'No se encontraron incapacidades con los filtros seleccionados.'
              : 'No se encontraron incapacidades.'
          }
          description={
            hayFiltros
              ? 'Pruebe otros criterios o limpie los filtros.'
              : 'Use “Registrar incapacidad” para anotar un periodo administrativo.'
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
                to={INCAPACIDAD_NEW_PATH}
                size="sm"
                leftIcon={<IconCalendarPlus size={16} aria-hidden="true" />}
              >
                Registrar incapacidad
              </Button>
            )
          }
        />
      ) : (
        <>
          <ul className="m-0 grid list-none gap-3 p-0 xl:hidden">
            {incapacidades.map((incapacidad) => {
              const nombre = nombreColaboradorIncapacidad(incapacidad)
              return (
                <li key={incapacidad.id}>
                  <Card padded className="!grid !gap-3 !p-4">
                    <div className="min-w-0">
                      <p className="m-0 flex items-center gap-1.5 text-sm font-semibold text-sigasj-muted">
                        <IconUser size={14} aria-hidden="true" />
                        Colaborador
                      </p>
                      <p className="mb-0 mt-1 text-base font-extrabold text-sigasj-ink">
                        {nombre}
                      </p>
                      {incapacidad.colaborador?.cedula ? (
                        <p className="m-0 text-sm font-semibold text-sigasj-muted">
                          {incapacidad.colaborador.cedula}
                        </p>
                      ) : null}
                    </div>
                    <p className="m-0 text-sm font-semibold tabular-nums text-sigasj-muted">
                      {formatearFechaPermiso(incapacidad.fechaInicio)} —{' '}
                      {formatearFechaPermiso(incapacidad.fechaFin)}
                    </p>
                    <p className="m-0 text-sm font-semibold text-sigasj-ink">
                      {resumenObservaciones(incapacidad.observaciones)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        to={incapacidadDetailPath(incapacidad.id)}
                        variant="secondary"
                        size="sm"
                        leftIcon={<IconEye size={16} aria-hidden="true" />}
                        aria-label={`Ver detalle de incapacidad de ${nombre}`}
                      >
                        Ver detalle
                      </Button>
                      <Button
                        to={incapacidadEditPath(incapacidad.id)}
                        size="sm"
                        leftIcon={<IconPencil size={16} aria-hidden="true" />}
                        aria-label={`Editar incapacidad de ${nombre}`}
                      >
                        Editar
                      </Button>
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>

          <Card
            as="section"
            className={`hidden min-w-0 overflow-hidden !p-0 xl:block ${cargando ? 'opacity-60' : ''}`}
            aria-busy={cargando}
            aria-label="Listado de incapacidades"
          >
            <div className="flex items-center gap-2.5 border-b border-sigasj-border px-4 py-3.5 sm:px-5">
              <span className="grid size-8 place-items-center rounded-xl bg-sigasj-surface-soft text-sigasj-primary">
                <IconFirstAidKit size={18} aria-hidden="true" />
              </span>
              <h2 className="m-0 text-[1.05rem] font-extrabold tracking-tight text-sigasj-ink">
                Registros
              </h2>
              <Badge tone="info" className="ml-auto">
                {total} incapacidad{total === 1 ? '' : 'es'}
              </Badge>
            </div>

            <table className="w-full border-collapse text-left">
              <thead className="bg-[color-mix(in_srgb,var(--color-sigasj-ice)_70%,white)] text-[0.68rem] font-bold uppercase tracking-[0.08em] text-sigasj-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Colaborador
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Inicio
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Fin
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Observaciones
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sigasj-border">
                {incapacidades.map((incapacidad) => {
                  const nombre = nombreColaboradorIncapacidad(incapacidad)
                  return (
                    <tr
                      key={incapacidad.id}
                      className="transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-sigasj-ice)_55%,white)]"
                    >
                      <td className="px-5 py-3.5">
                        <span className="block font-extrabold text-sigasj-ink">
                          {nombre}
                        </span>
                        {incapacidad.colaborador?.cedula ? (
                          <span className="block text-sm font-semibold text-sigasj-muted">
                            {incapacidad.colaborador.cedula}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold tabular-nums text-sigasj-muted">
                        {formatearFechaPermiso(incapacidad.fechaInicio)}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold tabular-nums text-sigasj-muted">
                        {formatearFechaPermiso(incapacidad.fechaFin)}
                      </td>
                      <td className="max-w-[24rem] px-5 py-3.5 text-sm font-semibold text-sigasj-ink">
                        <span className="line-clamp-2">
                          {resumenObservaciones(incapacidad.observaciones)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button
                            to={incapacidadDetailPath(incapacidad.id)}
                            variant="secondary"
                            size="sm"
                            leftIcon={<IconEye size={16} aria-hidden="true" />}
                            aria-label={`Ver detalle de incapacidad de ${nombre}`}
                          >
                            Ver detalle
                          </Button>
                          <Button
                            to={incapacidadEditPath(incapacidad.id)}
                            size="sm"
                            leftIcon={
                              <IconPencil size={16} aria-hidden="true" />
                            }
                            aria-label={`Editar incapacidad de ${nombre}`}
                          >
                            Editar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <nav
              className="flex flex-col items-center justify-between gap-3 border-t border-sigasj-border px-4 py-3.5 text-sm text-sigasj-muted sm:flex-row sm:px-5"
              aria-label="Paginación de incapacidades"
            >
              <p className="m-0 font-semibold">
                Mostrando {desde}–{hasta} de {total} incapacidad
                {total === 1 ? '' : 'es'}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<IconChevronLeft size={16} aria-hidden="true" />}
                  disabled={page <= 1 || cargando}
                  onClick={() => actualizarFiltros({ page: page - 1 })}
                >
                  Anterior
                </Button>
                <span className="px-1.5 font-semibold text-sigasj-ink">
                  Página {page} de {Math.max(totalPages, 1)}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  rightIcon={<IconChevronRight size={16} aria-hidden="true" />}
                  disabled={page >= totalPages || cargando}
                  onClick={() => actualizarFiltros({ page: page + 1 })}
                >
                  Siguiente
                </Button>
              </div>
            </nav>
          </Card>

          <nav
            className="flex flex-wrap items-center justify-between gap-3 xl:hidden"
            aria-label="Paginación de incapacidades (móvil)"
          >
            <p className="m-0 text-sm font-semibold text-sigasj-muted">
              Mostrando {desde}–{hasta} de {total} incapacidad
              {total === 1 ? '' : 'es'}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<IconChevronLeft size={16} aria-hidden="true" />}
                disabled={page <= 1 || cargando}
                onClick={() => actualizarFiltros({ page: page - 1 })}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                rightIcon={<IconChevronRight size={16} aria-hidden="true" />}
                disabled={page >= totalPages || cargando}
                onClick={() => actualizarFiltros({ page: page + 1 })}
              >
                Siguiente
              </Button>
            </div>
          </nav>
        </>
      )}
    </AdminShell>
  )
}
