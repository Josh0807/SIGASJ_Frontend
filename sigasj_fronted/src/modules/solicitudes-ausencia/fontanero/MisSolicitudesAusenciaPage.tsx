import {
  IconBeach,
  IconCalendarEvent,
  IconClipboardList,
  IconEye,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { Alert } from '../../../shared/ui/Alert'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { useAuth } from '../../auth/components/AuthContext'
import { esNoAutenticado, esReintentable } from '../../recursos-humanos/colaboradorForm'
import { formatearFechaPermiso } from '../../recursos-humanos/permisoForm'
import {
  estadoSolicitudAusenciaClassName,
  estadoSolicitudAusenciaLabel,
  resumirMotivo,
  tipoSolicitudAusenciaLabel,
} from '../solicitudAusenciaLabels'
import { getMisSolicitudesAusencia } from '../solicitudesAusenciaApi'
import {
  FONTANERO_MIS_SOLICITUDES_TITLE,
  FONTANERO_SOLICITAR_AUSENCIA_PATH,
  misSolicitudAusenciaDetailPath,
} from '../solicitudesAusenciaPaths'
import type { SolicitudAusenciaFontanero, TipoSolicitudAusencia } from '../types'

type Carga = {
  clave: string
  data: SolicitudAusenciaFontanero[]
  error: string | null
  reintentable: boolean
}

const tonoTipo = (tipo: TipoSolicitudAusencia): 'info' | 'warning' =>
  tipo === 'VACACIONES' ? 'info' : 'warning'

const detalleSecundario = (item: SolicitudAusenciaFontanero): string => {
  if (item.tipo === 'VACACIONES') {
    const resumen = item.resumenVacaciones
    if (resumen) {
      const feriados = resumen.feriados.length
      return feriados > 0
        ? `${resumen.diasNetos} día${resumen.diasNetos === 1 ? '' : 's'} netos · ${feriados} feriado${feriados === 1 ? '' : 's'}`
        : `${resumen.diasNetos} día${resumen.diasNetos === 1 ? '' : 's'} a descontar`
    }
    return 'Solicitud de vacaciones'
  }
  return resumirMotivo(item.motivo)
}

/**
 * PBI 6.5.6 — Listado de solicitudes propias (solo lectura, API 6.5.3).
 */
export default function MisSolicitudesAusenciaPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [recarga, setRecarga] = useState(0)
  const [carga, setCarga] = useState<Carga>({
    clave: '',
    data: [],
    error: null,
    reintentable: true,
  })
  const clave = String(recarga)
  const cargando = carga.clave !== clave

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  useEffect(() => {
    const controller = new AbortController()
    getMisSolicitudesAusencia(controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return
        setCarga({
          clave,
          data: respuesta,
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
          error: 'No fue posible cargar sus solicitudes. Intente nuevamente.',
          reintentable: esReintentable(err),
        })
      })
    return () => controller.abort()
  }, [clave, salirPorSesion])

  return (
    <div className="admin-content-modern grid w-full min-w-0 gap-4">
      <PageHeader
        title={FONTANERO_MIS_SOLICITUDES_TITLE}
        description="Consulte el historial y el estado de sus permisos y vacaciones."
        actions={
          <Button
            to={FONTANERO_SOLICITAR_AUSENCIA_PATH}
            size="sm"
            leftIcon={<IconPlus size={16} aria-hidden="true" />}
          >
            Nueva solicitud
          </Button>
        }
      />

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
          icon={<IconClipboardList size={28} aria-hidden="true" />}
          title="Sin solicitudes"
          description="Cuando envíe un permiso o vacaciones, el historial y el estado aparecerán aquí."
          actions={
            <Button
              to={FONTANERO_SOLICITAR_AUSENCIA_PATH}
              size="sm"
              leftIcon={<IconPlus size={16} aria-hidden="true" />}
            >
              Solicitar permiso o vacaciones
            </Button>
          }
        />
      ) : (
        <>
          <ul className="m-0 grid list-none gap-3 p-0 md:hidden">
            {carga.data.map((item) => (
              <li key={item.id}>
                <Card padded className="!grid !gap-3 !p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <Badge tone={tonoTipo(item.tipo)}>
                      {item.tipo === 'VACACIONES' ? (
                        <IconBeach size={13} aria-hidden="true" />
                      ) : (
                        <IconCalendarEvent size={13} aria-hidden="true" />
                      )}
                      {tipoSolicitudAusenciaLabel(item.tipo)}
                    </Badge>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-wide ${estadoSolicitudAusenciaClassName(item.estado)}`}
                    >
                      {estadoSolicitudAusenciaLabel(item.estado)}
                    </span>
                  </div>
                  <p className="m-0 text-sm font-semibold tabular-nums text-sigasj-muted">
                    {formatearFechaPermiso(item.fechaInicio)} —{' '}
                    {formatearFechaPermiso(item.fechaFin)}
                  </p>
                  <p className="m-0 text-sm font-semibold text-sigasj-ink">
                    {detalleSecundario(item)}
                  </p>
                  <Button
                    to={misSolicitudAusenciaDetailPath(item.id)}
                    variant="secondary"
                    size="sm"
                    className="w-fit"
                    leftIcon={<IconEye size={16} aria-hidden="true" />}
                  >
                    Ver detalle
                  </Button>
                </Card>
              </li>
            ))}
          </ul>

          <Card as="section" className="hidden min-w-0 overflow-hidden !p-0 md:block">
            <div className="flex items-center gap-2.5 border-b border-sigasj-border px-4 py-3.5 sm:px-5">
              <span className="grid size-8 place-items-center rounded-xl bg-sigasj-surface-soft text-sigasj-primary">
                <IconClipboardList size={18} aria-hidden="true" />
              </span>
              <h2 className="m-0 text-[1.05rem] font-extrabold tracking-tight text-sigasj-ink">
                Historial
              </h2>
              <Badge tone="info" className="ml-auto">
                {carga.data.length} solicitud{carga.data.length === 1 ? '' : 'es'}
              </Badge>
            </div>

            <table className="w-full border-collapse text-left">
              <thead className="bg-[color-mix(in_srgb,var(--color-sigasj-ice)_70%,white)] text-[0.68rem] font-bold uppercase tracking-[0.08em] text-sigasj-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    Tipo
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Periodo
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Detalle
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
                      <Badge tone={tonoTipo(item.tipo)}>
                        {tipoSolicitudAusenciaLabel(item.tipo)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold tabular-nums text-sigasj-muted">
                      {formatearFechaPermiso(item.fechaInicio)} —{' '}
                      {formatearFechaPermiso(item.fechaFin)}
                    </td>
                    <td className="max-w-xs px-5 py-3.5 text-sm font-semibold text-sigasj-ink">
                      {detalleSecundario(item)}
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
                        to={misSolicitudAusenciaDetailPath(item.id)}
                        variant="secondary"
                        size="sm"
                        leftIcon={<IconEye size={16} aria-hidden="true" />}
                      >
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}
