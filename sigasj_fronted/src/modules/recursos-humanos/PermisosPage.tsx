import {
  IconArrowLeft,
  IconCalendarOff,
  IconCalendarPlus,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconFilterOff,
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
  adminFilterSelectClassName,
} from '../../shared/ui'
import { useAuth } from '../auth/components/AuthContext'
import {
  InternalAdminRoleName,
  userHasAllowedRole,
} from '../auth/utils/adminNavigation'
import { SOLICITUDES_AUSENCIA_ADMIN_PATH } from '../solicitudes-ausencia/solicitudesAusenciaPaths'
import { getColaboradoresOpciones } from './colaboradoresApi'
import { esNoAutenticado, esReintentable, nombreCompleto } from './colaboradorForm'
import {
  formatearFechaPermiso,
  nombreColaboradorPermiso,
  permisoErrorMessage,
} from './permisoForm'
import { PERMISOS_PAGE_SIZE, getPermisos } from './permisosApi'
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
    getPermisos(
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
          error: permisoErrorMessage(err, 'No fue posible cargar los permisos.'),
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

  const permisos = listado?.data ?? []
  const total = listado?.total ?? 0
  const totalPages = listado?.totalPages ?? 0
  const desde = total ? (page - 1) * PERMISOS_PAGE_SIZE + 1 : 0
  const hasta = Math.min(page * PERMISOS_PAGE_SIZE, total)

  return (
    <AdminShell className="gap-5 sm:gap-6" aria-labelledby="permisos-rrhh-title">
      <RrhhSubnav />

      <PageHeader
        id="permisos-rrhh-title"
        eyebrow="Administración · Permisos"
        title={
          <span className="inline-flex items-center gap-2">
            <IconCalendarPlus size={22} aria-hidden="true" />
            Permisos del personal
          </span>
        }
        description="Solo permisos ya otorgados. Las solicitudes del Fontanero se revisan en Solicitudes a revisar y, al aprobarse, aparecen aquí."
        actions={
          <>
            {verColaSolicitudes ? (
              <Button
                to={`${SOLICITUDES_AUSENCIA_ADMIN_PATH}?estado=PENDIENTE`}
                variant="secondary"
                size="sm"
                leftIcon={<IconArrowLeft size={16} aria-hidden="true" />}
              >
                Solicitudes a revisar
              </Button>
            ) : null}
            <Button
              to={PERMISO_NEW_PATH}
              variant="primary"
              size="sm"
              leftIcon={<IconCalendarPlus size={16} aria-hidden="true" />}
            >
              Registrar permiso
            </Button>
          </>
        }
      />

      {aviso ? (
        <Alert tone="success" role="status">
          {aviso}
        </Alert>
      ) : null}

      <AdminFilters
        aria-label="Filtros de permisos"
        summary={
          <>
            <strong className="text-sigasj-ink">{cargando ? '…' : total}</strong>
            <span>{total === 1 ? 'permiso' : 'permisos'}</span>
          </>
        }
      >
        <AdminFilterField label="Colaborador">
          <select
            className={adminFilterSelectClassName}
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
        <Alert tone="info">{ADMIN_COPY.loading('permisos')}</Alert>
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
      ) : permisos.length === 0 ? (
        <EmptyState
          icon={<IconCalendarOff size={28} aria-hidden="true" />}
          title={hayFiltros ? 'Sin resultados' : 'Aún no hay permisos'}
          description={
            hayFiltros
              ? 'Ningún permiso coincide con el colaborador o las fechas indicadas.'
              : 'Registre un permiso o apruebe una solicitud del Fontanero para verlo aquí.'
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
                to={PERMISO_NEW_PATH}
                size="sm"
                leftIcon={<IconCalendarPlus size={16} aria-hidden="true" />}
              >
                Registrar permiso
              </Button>
            )
          }
        />
      ) : (
        <>
          <ul className="m-0 grid list-none gap-3 p-0 xl:hidden">
            {permisos.map((permiso) => {
              const nombre = nombreColaboradorPermiso(permiso)
              return (
                <li key={permiso.id}>
                  <Card padded className="!grid !gap-3 !p-4">
                    <div className="min-w-0">
                      <p className="m-0 flex items-center gap-1.5 text-sm font-semibold text-sigasj-muted">
                        <IconUser size={14} aria-hidden="true" />
                        Colaborador
                      </p>
                      <p className="mb-0 mt-1 text-base font-extrabold text-sigasj-ink">
                        {nombre}
                      </p>
                      {permiso.colaborador?.cedula ? (
                        <p className="m-0 text-sm font-semibold text-sigasj-muted">
                          {permiso.colaborador.cedula}
                        </p>
                      ) : null}
                    </div>
                    <p className="m-0 text-sm font-semibold tabular-nums text-sigasj-muted">
                      {formatearFechaPermiso(permiso.fechaInicio)} —{' '}
                      {formatearFechaPermiso(permiso.fechaFin)}
                    </p>
                    <p className="m-0 text-sm font-semibold text-sigasj-ink">
                      {permiso.motivo}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        to={permisoDetailPath(permiso.id)}
                        variant="secondary"
                        size="sm"
                        leftIcon={<IconEye size={16} aria-hidden="true" />}
                        aria-label={`Ver permiso de ${nombre}`}
                      >
                        Ver
                      </Button>
                      <Button
                        to={permisoEditPath(permiso.id)}
                        size="sm"
                        leftIcon={<IconPencil size={16} aria-hidden="true" />}
                        aria-label={`Editar permiso de ${nombre}`}
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
            aria-label="Listado de permisos"
          >
            <div className="flex items-center gap-2.5 border-b border-sigasj-border px-4 py-3.5 sm:px-5">
              <span className="grid size-8 place-items-center rounded-xl bg-sigasj-surface-soft text-sigasj-primary">
                <IconCalendarPlus size={18} aria-hidden="true" />
              </span>
              <h2 className="m-0 text-[1.05rem] font-extrabold tracking-tight text-sigasj-ink">
                Otorgados
              </h2>
              <Badge tone="info" className="ml-auto">
                {total} permiso{total === 1 ? '' : 's'}
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
                    Motivo
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sigasj-border">
                {permisos.map((permiso) => {
                  const nombre = nombreColaboradorPermiso(permiso)
                  return (
                    <tr
                      key={permiso.id}
                      className="transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-sigasj-ice)_55%,white)]"
                    >
                      <td className="px-5 py-3.5">
                        <span className="block font-extrabold text-sigasj-ink">
                          {nombre}
                        </span>
                        {permiso.colaborador?.cedula ? (
                          <span className="block text-sm font-semibold text-sigasj-muted">
                            {permiso.colaborador.cedula}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold tabular-nums text-sigasj-muted">
                        {formatearFechaPermiso(permiso.fechaInicio)}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold tabular-nums text-sigasj-muted">
                        {formatearFechaPermiso(permiso.fechaFin)}
                      </td>
                      <td className="max-w-[22rem] px-5 py-3.5 text-sm font-semibold text-sigasj-ink">
                        <span className="line-clamp-2">{permiso.motivo}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Button
                            to={permisoDetailPath(permiso.id)}
                            variant="secondary"
                            size="sm"
                            leftIcon={<IconEye size={16} aria-hidden="true" />}
                            aria-label={`Ver permiso de ${nombre}`}
                          >
                            Ver
                          </Button>
                          <Button
                            to={permisoEditPath(permiso.id)}
                            size="sm"
                            leftIcon={
                              <IconPencil size={16} aria-hidden="true" />
                            }
                            aria-label={`Editar permiso de ${nombre}`}
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
              aria-label="Paginación de permisos"
            >
              <p className="m-0 font-semibold">
                Mostrando {desde}–{hasta} de {total} permiso
                {total === 1 ? '' : 's'}
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
            aria-label="Paginación de permisos (móvil)"
          >
            <p className="m-0 text-sm font-semibold text-sigasj-muted">
              Mostrando {desde}–{hasta} de {total} permiso
              {total === 1 ? '' : 's'}
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
