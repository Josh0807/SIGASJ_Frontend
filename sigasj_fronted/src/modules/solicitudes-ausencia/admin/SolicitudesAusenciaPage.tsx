import {
  IconBeach,
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconFilterOff,
  IconRefresh,
  IconUser,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { Alert } from '../../../shared/ui/Alert'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { useAuth } from '../../auth/components/AuthContext'
import {
  esNoAutenticado,
  esReintentable,
  nombreCompleto,
} from '../../recursos-humanos/colaboradorForm'
import { formatearFechaPermiso } from '../../recursos-humanos/permisoForm'
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

type Carga = {
  clave: string
  data: SolicitudAusencia[]
  total: number
  totalPages: number
  error: string | null
  reintentable: boolean
}

const labelClass = 'text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted'
const selectClass =
  'min-h-11 w-full min-w-[10rem] rounded-xl border border-sigasj-border bg-white px-3.5 text-[0.95rem] font-semibold text-sigasj-ink outline-none transition focus:border-sigasj-primary focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-sigasj-primary)_22%,transparent)]'

const tonoTipo = (tipo: TipoSolicitudAusencia): 'info' | 'warning' =>
  tipo === 'VACACIONES' ? 'info' : 'warning'

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

  const limpiarFiltros = () => {
    const siguientes = new URLSearchParams(params)
    siguientes.delete('estado')
    siguientes.delete('tipo')
    siguientes.delete('page')
    setParams(siguientes)
  }

  return (
    <main className="admin-content-modern grid w-full min-w-0 gap-4">
      <RrhhSubnav />

      <PageHeader
        title="Solicitudes a revisar"
        description="Permisos y vacaciones enviados por el personal. Al aprobar un permiso queda en Permisos otorgados; al aprobar vacaciones se descuenta el saldo."
      />

      <Card
        as="section"
        padded
        className="!p-3.5"
        aria-label="Filtros de solicitudes"
      >
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid min-w-0 flex-1 gap-1.5 sm:max-w-[14rem]">
            <span className={labelClass}>Estado</span>
            <select
              className={selectClass}
              value={estado}
              aria-label="Filtrar por estado"
              onChange={(e) => actualizar({ estado: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="APROBADA">Aprobada</option>
              <option value="RECHAZADA">Rechazada</option>
            </select>
          </label>
          <label className="grid min-w-0 flex-1 gap-1.5 sm:max-w-[14rem]">
            <span className={labelClass}>Tipo</span>
            <select
              className={selectClass}
              value={tipo}
              aria-label="Filtrar por tipo"
              onChange={(e) => actualizar({ tipo: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="PERMISO">Permiso</option>
              <option value="VACACIONES">Vacaciones</option>
            </select>
          </label>
          {hayFiltro ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<IconFilterOff size={16} aria-hidden="true" />}
              onClick={limpiarFiltros}
            >
              Limpiar
            </Button>
          ) : null}
        </div>
      </Card>

      {cargando ? (
        <Card padded className="!p-5" role="status" aria-busy="true">
          <span className="sr-only">Cargando solicitudes…</span>
          <div className="grid gap-3">
            {[0, 1, 2].map((fila) => (
              <div
                key={fila}
                className="h-12 animate-pulse rounded-xl bg-sigasj-surface-soft motion-reduce:animate-none"
                aria-hidden="true"
              />
            ))}
          </div>
        </Card>
      ) : carga.error ? (
        <Alert tone="danger">
          <div className="grid gap-3">
            <p className="m-0 font-semibold">{carga.error}</p>
            {carga.reintentable ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="justify-self-start"
                leftIcon={<IconRefresh size={16} aria-hidden="true" />}
                onClick={() => setRecarga((n) => n + 1)}
              >
                Reintentar
              </Button>
            ) : null}
          </div>
        </Alert>
      ) : !carga.data.length ? (
        <EmptyState
          icon={<IconCalendarEvent size={28} aria-hidden="true" />}
          title={hayFiltro ? 'Sin resultados' : 'Sin solicitudes'}
          description={
            hayFiltro
              ? 'No hay solicitudes con esos filtros. Pruebe otra combinación o limpie los filtros.'
              : 'Cuando el personal envíe permisos o vacaciones, aparecerán aquí para su revisión.'
          }
          actions={
            hayFiltro ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<IconFilterOff size={16} aria-hidden="true" />}
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <ul className="m-0 grid list-none gap-3 p-0 lg:hidden">
            {carga.data.map((item) => (
              <li key={item.id}>
                <Card padded className="!grid !gap-3 !p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="m-0 flex items-center gap-1.5 text-sm font-semibold text-sigasj-muted">
                        <IconUser size={14} aria-hidden="true" />
                        Colaborador
                      </p>
                      <p className="mb-0 mt-1 text-base font-extrabold text-sigasj-ink">
                        {item.colaborador
                          ? nombreCompleto(item.colaborador)
                          : `#${item.colaboradorId}`}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide ${estadoSolicitudAusenciaClassName(item.estado)}`}
                    >
                      {estadoSolicitudAusenciaLabel(item.estado)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={tonoTipo(item.tipo)}>
                      {item.tipo === 'VACACIONES' ? (
                        <IconBeach size={13} aria-hidden="true" />
                      ) : null}
                      {tipoSolicitudAusenciaLabel(item.tipo)}
                    </Badge>
                    <span className="text-sm font-semibold text-sigasj-muted">
                      {formatearFechaPermiso(item.fechaInicio)} —{' '}
                      {formatearFechaPermiso(item.fechaFin)}
                    </span>
                  </div>
                  <Button
                    to={solicitudAusenciaDetailPath(item.id)}
                    variant={item.estado === 'PENDIENTE' ? 'primary' : 'secondary'}
                    size="sm"
                    className="w-full max-[760px]:w-full min-[761px]:w-fit"
                    leftIcon={<IconEye size={16} aria-hidden="true" />}
                  >
                    {item.estado === 'PENDIENTE' ? 'Revisar' : 'Ver detalle'}
                  </Button>
                </Card>
              </li>
            ))}
          </ul>

          <Card as="section" className="hidden min-w-0 overflow-hidden !p-0 lg:block">
            <div className="flex items-center gap-2.5 border-b border-sigasj-border px-4 py-3.5 sm:px-5">
              <span className="grid size-8 place-items-center rounded-xl bg-sigasj-surface-soft text-sigasj-primary">
                <IconCalendarEvent size={18} aria-hidden="true" />
              </span>
              <h2 className="m-0 text-[1.05rem] font-extrabold tracking-tight text-sigasj-ink">
                Listado
              </h2>
              <Badge tone="info" className="ml-auto">
                {carga.total} solicitud{carga.total === 1 ? '' : 'es'}
              </Badge>
            </div>

            <table className="w-full border-collapse text-left">
              <thead className="bg-[color-mix(in_srgb,var(--color-sigasj-ice)_70%,white)] text-[0.68rem] font-bold uppercase tracking-[0.08em] text-sigasj-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Colaborador
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Tipo
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Periodo
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Estado
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Solicitud
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sigasj-border">
                {carga.data.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-sigasj-ice)_55%,white)]"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-extrabold text-sigasj-ink">
                        {item.colaborador
                          ? nombreCompleto(item.colaborador)
                          : `#${item.colaboradorId}`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={tonoTipo(item.tipo)}>
                        {tipoSolicitudAusenciaLabel(item.tipo)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold tabular-nums text-sigasj-muted">
                      {formatearFechaPermiso(item.fechaInicio)} —{' '}
                      {formatearFechaPermiso(item.fechaFin)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide ${estadoSolicitudAusenciaClassName(item.estado)}`}
                      >
                        {estadoSolicitudAusenciaLabel(item.estado)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold tabular-nums text-sigasj-muted">
                      {formatearFechaPermiso(item.createdAt.slice(0, 10))}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        to={solicitudAusenciaDetailPath(item.id)}
                        variant={item.estado === 'PENDIENTE' ? 'primary' : 'secondary'}
                        size="sm"
                        leftIcon={<IconEye size={16} aria-hidden="true" />}
                      >
                        {item.estado === 'PENDIENTE' ? 'Revisar' : 'Ver'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <nav
              className="flex flex-col items-center justify-between gap-3 border-t border-sigasj-border px-4 py-3.5 text-sm text-sigasj-muted sm:flex-row sm:px-5"
              aria-label="Paginación de solicitudes"
            >
              <p className="m-0 font-semibold">
                Página {page} de {Math.max(1, carga.totalPages)} · {carga.total}{' '}
                solicitud{carga.total === 1 ? '' : 'es'}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<IconChevronLeft size={16} aria-hidden="true" />}
                  disabled={page <= 1 || cargando}
                  onClick={() => actualizar({ page: String(page - 1) })}
                >
                  Anterior
                </Button>
                <span className="px-1.5 font-semibold text-sigasj-ink">
                  {page} / {Math.max(1, carga.totalPages)}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  rightIcon={<IconChevronRight size={16} aria-hidden="true" />}
                  disabled={page >= carga.totalPages || cargando}
                  onClick={() => actualizar({ page: String(page + 1) })}
                >
                  Siguiente
                </Button>
              </div>
            </nav>
          </Card>

          <nav
            className="flex flex-wrap items-center justify-between gap-3 lg:hidden"
            aria-label="Paginación de solicitudes (móvil)"
          >
            <p className="m-0 text-sm font-semibold text-sigasj-muted">
              {page} / {Math.max(1, carga.totalPages)} · {carga.total}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => actualizar({ page: String(page - 1) })}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={page >= carga.totalPages}
                onClick={() => actualizar({ page: String(page + 1) })}
              >
                Siguiente
              </Button>
            </div>
          </nav>
        </>
      )}
    </main>
  )
}
