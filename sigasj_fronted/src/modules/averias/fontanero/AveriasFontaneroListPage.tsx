import { Navigate } from 'react-router-dom'
import {
  IconArrowRight,
  IconMapPin,
  IconRefresh,
  IconTool,
} from '@tabler/icons-react'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { Alert } from '../../../shared/ui/Alert'
import { Badge } from '../../../shared/ui/Badge'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { AdminShell, PageHeader } from '../../../shared/ui'
import AveriaStatusBadge from '../admin/AveriaStatusBadge'
import { formatAveriaAdminDateTime } from '../admin/formatAveriaAdminDate'
import { useFontaneroAverias } from '../hooks/useFontaneroAverias'
import {
  MENSAJE_PENDIENTE_HORARIO_FONTANERO,
  esPendienteDeAtencion,
  mostrarAvisoHorarioFontanero,
} from '../utils/averiaPendienteAtencion'
import { agruparColaFontanero } from './colaFontanero'
import {
  FONTANERO_AVERIAS_TITLE,
  averiasFontaneroDetailPath,
} from './averiasFontaneroPaths'
import {
  getFontaneroPrioridadLabel,
  getFontaneroTipoLabel,
} from './fontaneroAveriaPresentation'
import {
  AVERIAS_FONTANERO_ATENCION_NO_INICIADA,
  AVERIAS_FONTANERO_DETAIL_FORBIDDEN,
  AVERIAS_FONTANERO_LIST_EMPTY,
  AVERIAS_FONTANERO_LIST_ERROR,
  AVERIAS_FONTANERO_LIST_LOADING,
  type AveriaFontaneroListItem,
} from './types'

const tonoPrioridad = (
  prioridad: string | null | undefined,
): 'danger' | 'warning' | 'info' | 'neutral' => {
  const valor = prioridad?.trim().toUpperCase()
  if (valor === 'ALTA') return 'danger'
  if (valor === 'MEDIA') return 'warning'
  if (valor === 'BAJA') return 'info'
  return 'neutral'
}

const tonoIconoGrupo = (
  grupoId: 'EN_ATENCION' | 'ASIGNADA' | 'PENDIENTE',
): string => {
  if (grupoId === 'EN_ATENCION') return 'bg-emerald-100 text-emerald-800'
  if (grupoId === 'ASIGNADA') return 'bg-amber-100 text-amber-900'
  return 'bg-[color-mix(in_srgb,var(--color-sigasj-ice)_80%,white)] text-sigasj-ink'
}

export type AveriasFontaneroListPageProps = {
  items?: AveriaFontaneroListItem[]
  dentroDeHorario?: boolean
  loading?: boolean
  error?: string | null
  unauthorized?: boolean
  forbidden?: boolean
}

const AveriasFontaneroListPage = ({
  items: itemsProp,
  dentroDeHorario: dentroDeHorarioProp,
  loading: loadingProp,
  error: errorProp,
  unauthorized: unauthorizedProp,
  forbidden: forbiddenProp,
}: AveriasFontaneroListPageProps) => {
  const remoteEnabled =
    itemsProp === undefined &&
    dentroDeHorarioProp === undefined &&
    loadingProp === undefined &&
    errorProp === undefined &&
    unauthorizedProp === undefined &&
    forbiddenProp === undefined
  const remote = useFontaneroAverias({ enabled: remoteEnabled })

  if (unauthorizedProp ?? remote.unauthorized) {
    return <Navigate to={LOGIN_ROUTE_PATH} replace />
  }

  const items = itemsProp ?? remote.items
  const dentroDeHorario = dentroDeHorarioProp ?? remote.dentroDeHorario
  const grupos = agruparColaFontanero(items)
  const loading = loadingProp ?? remote.loading
  const error = errorProp === undefined ? remote.error : errorProp
  const forbidden = forbiddenProp ?? remote.forbidden

  return (
    <AdminShell aria-labelledby="averias-fontanero-title">
      <PageHeader
        id="averias-fontanero-title"
        title={FONTANERO_AVERIAS_TITLE}
        description="Cola asignada a usted. Abra el detalle para iniciar o continuar la atención."
        actions={
          remoteEnabled ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<IconRefresh size={16} aria-hidden="true" />}
              onClick={() => remote.refetch()}
              disabled={loading}
            >
              Actualizar
            </Button>
          ) : null
        }
      />

      <Card
        as="section"
        className="!grid !gap-4 !p-4 sm:!p-5"
        aria-labelledby="averias-fontanero-list-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sigasj-border pb-3">
          <h2
            className="m-0 text-[1.05rem] font-extrabold tracking-tight text-sigasj-ink"
            id="averias-fontanero-list-heading"
          >
            Averías asignadas
          </h2>
          {items.length > 0 ? (
            <Badge tone="info">
              {items.length} avería{items.length === 1 ? '' : 's'}
            </Badge>
          ) : null}
        </div>

        {forbidden ? (
          <Alert tone="danger" role="alert">
            {AVERIAS_FONTANERO_DETAIL_FORBIDDEN}
          </Alert>
        ) : loading && items.length === 0 ? (
          <Card padded className="!p-5" role="status" aria-busy="true">
            <span className="sr-only">{AVERIAS_FONTANERO_LIST_LOADING}</span>
            <p className="m-0 font-semibold text-sigasj-muted">
              {AVERIAS_FONTANERO_LIST_LOADING}
            </p>
            <div className="mt-3 grid gap-3">
              {[0, 1].map((fila) => (
                <div
                  key={fila}
                  className="h-16 animate-pulse rounded-xl bg-sigasj-surface-soft motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ))}
            </div>
          </Card>
        ) : error ? (
          <Alert tone="danger">
            <div className="grid gap-3">
              <p className="m-0 font-semibold">
                {error || AVERIAS_FONTANERO_LIST_ERROR}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="justify-self-start"
                leftIcon={<IconRefresh size={16} aria-hidden="true" />}
                onClick={remote.refetch}
              >
                Intentar nuevamente
              </Button>
            </div>
          </Alert>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<IconTool size={28} aria-hidden="true" />}
            title="Sin averías en cola"
            description={AVERIAS_FONTANERO_LIST_EMPTY}
          />
        ) : (
          <div className="grid gap-5">
            {grupos.map((grupo) => (
              <section
                key={grupo.id}
                className="grid gap-3"
                aria-labelledby={`averias-fontanero-grupo-${grupo.id}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    id={`averias-fontanero-grupo-${grupo.id}`}
                    className="m-0 text-sm font-extrabold uppercase tracking-[0.06em] text-sigasj-muted"
                  >
                    {grupo.titulo}
                  </h3>
                  <Badge tone="neutral">{grupo.items.length}</Badge>
                </div>

                <ul className="m-0 grid list-none gap-3 p-0">
                  {grupo.items.map((item) => {
                    const avisoHorario = mostrarAvisoHorarioFontanero(
                      String(item.estado),
                      dentroDeHorario,
                    )
                    const avisoPendiente =
                      !avisoHorario && esPendienteDeAtencion(String(item.estado))

                    return (
                      <li key={item.id}>
                        <Card
                          padded
                          className="!grid !gap-3.5 !p-4 transition-shadow duration-200 hover:shadow-[0_10px_28px_rgba(30,90,156,0.12)] sm:!grid-cols-[auto_minmax(0,1fr)_auto] sm:!items-start sm:!gap-4"
                        >
                          <span
                            className={`grid size-11 shrink-0 place-items-center rounded-xl ${tonoIconoGrupo(grupo.id)}`}
                            aria-hidden="true"
                          >
                            <IconTool size={20} />
                          </span>

                          <div className="grid min-w-0 gap-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="m-0 text-base font-extrabold tracking-tight text-sigasj-ink">
                                {item.codigoSeguimiento}
                              </h4>
                              <AveriaStatusBadge
                                estado={item.estado}
                                variant="flat"
                              />
                            </div>

                            <p className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-sigasj-muted">
                              <span>
                                Asignada el{' '}
                                {formatAveriaAdminDateTime(item.fechaAsignacion)}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 text-sigasj-ink">
                                <IconMapPin size={14} aria-hidden="true" />
                                {item.sectorComunidad}
                              </span>
                            </p>

                            <p
                              className="m-0 line-clamp-2 text-sm font-semibold text-sigasj-ink"
                              title={item.ubicacion}
                            >
                              {item.ubicacion}
                            </p>

                            <div className="flex flex-wrap gap-2">
                              <Badge tone={tonoPrioridad(item.prioridad)}>
                                Prioridad{' '}
                                {getFontaneroPrioridadLabel(item.prioridad)}
                              </Badge>
                              <Badge tone="neutral">
                                Tipo {getFontaneroTipoLabel(item.tipoAveria)}
                              </Badge>
                            </div>

                            {avisoHorario ? (
                              <Alert tone="warning" className="!py-2.5 !text-sm">
                                {MENSAJE_PENDIENTE_HORARIO_FONTANERO}
                              </Alert>
                            ) : avisoPendiente ? (
                              <Alert tone="info" className="!py-2.5 !text-sm">
                                {AVERIAS_FONTANERO_ATENCION_NO_INICIADA}
                              </Alert>
                            ) : null}
                          </div>

                          <Button
                            to={averiasFontaneroDetailPath(item.id)}
                            size="sm"
                            className="w-full sm:w-auto sm:self-center"
                            rightIcon={
                              <IconArrowRight size={16} aria-hidden="true" />
                            }
                            aria-label={`Ver detalle de la avería ${item.codigoSeguimiento}`}
                          >
                            Ver detalle
                          </Button>
                        </Card>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Card>
    </AdminShell>
  )
}

export default AveriasFontaneroListPage
