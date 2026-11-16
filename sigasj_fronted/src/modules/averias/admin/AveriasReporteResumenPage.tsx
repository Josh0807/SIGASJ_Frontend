import { Navigate, useSearchParams } from 'react-router-dom'
import { IconArrowLeft } from '@tabler/icons-react'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import IndicatorCard from '../../../shared/components/IndicatorCard'
import {
  AdminFilterField,
  AdminFilters,
  AdminShell,
  Button,
  EmptyState,
  PageHeader,
  adminFilterControlClassName,
} from '../../../shared/ui'
import { useAdminAveriasReporteResumen } from '../hooks/useAdminAveriasReporteResumen'
import { AVERIAS_ADMIN_IMPRIMIR_PATH, AVERIAS_ADMIN_PATH } from './averiasAdminPaths'
import {
  buildReporteFechas,
  formatRangoReporte,
  indicadoresReporte,
  parseReporteFechas,
  reporteRangoInvalido,
} from './averiasReporteResumen'
import {
  AVERIAS_REPORTE_EMPTY_MESSAGE,
  AVERIAS_REPORTE_LOAD_ERROR,
  AVERIAS_REPORTE_LOADING_MESSAGE,
  AVERIAS_REPORTE_RANGE_ERROR,
  type AveriasReporteResumen,
} from './types'

const TARJETAS_CARGA = [
  'Total registradas',
  'Recibidas',
  'Asignadas',
  'Pendientes de atención',
  'En atención',
  'Resueltas',
]

export type AveriasReporteResumenPageProps = {
  resumen?: AveriasReporteResumen
  loading?: boolean
  error?: string | boolean | null
  onRetry?: () => void
}

const AveriasReporteResumenPage = ({
  resumen: resumenProp,
  loading: loadingProp,
  error: errorProp,
  onRetry,
}: AveriasReporteResumenPageProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const fechas = parseReporteFechas(searchParams.toString())
  const rangoInvalido = reporteRangoInvalido(fechas.fechaDesde, fechas.fechaHasta)
  const remoteEnabled = resumenProp === undefined && !rangoInvalido
  const remote = useAdminAveriasReporteResumen(
    {
      fechaDesde: fechas.fechaDesde || undefined,
      fechaHasta: fechas.fechaHasta || undefined,
    },
    { enabled: remoteEnabled },
  )

  if (remote.unauthorized) {
    return <Navigate to={LOGIN_ROUTE_PATH} replace />
  }

  if (remote.forbidden) {
    return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  }

  const resumen = resumenProp ?? remote.resumen
  const isLoading = loadingProp ?? (rangoInvalido ? false : remote.loading)
  const errorMessage = rangoInvalido
    ? AVERIAS_REPORTE_RANGE_ERROR
    : errorProp === undefined
      ? remote.error
      : errorProp
        ? (remote.error ?? AVERIAS_REPORTE_LOAD_ERROR)
        : null
  const rango = formatRangoReporte(
    resumen?.fechaDesde ?? (fechas.fechaDesde || null),
    resumen?.fechaHasta ?? (fechas.fechaHasta || null),
  )
  const indicadores = resumen ? indicadoresReporte(resumen) : []

  const updateFecha = (key: 'fechaDesde' | 'fechaHasta', value: string) => {
    const next = buildReporteFechas({ ...fechas, [key]: value })
    setSearchParams(new URLSearchParams(next.startsWith('?') ? next.slice(1) : next), {
      replace: true,
    })
  }

  return (
    <AdminShell
      className="averias-admin w-full min-w-0"
      aria-labelledby="averias-reporte-title"
    >
      <PageHeader
        id="averias-reporte-title"
        eyebrow="Operación · Averías"
        title="Resumen de averías"
        description="Cantidad de averías registradas según su estado actual."
        actions={
          <>
            <Button
              to={`${AVERIAS_ADMIN_IMPRIMIR_PATH}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
              size="sm"
            >
              Imprimir averías atendidas
            </Button>
            <Button
              to={AVERIAS_ADMIN_PATH}
              variant="secondary"
              size="sm"
              leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
            >
              {ADMIN_COPY.backToList}
            </Button>
          </>
        }
      />

      <AdminFilters
        aria-label="Rango del resumen"
        summary={
          <p className="m-0 whitespace-nowrap text-sm font-semibold text-sigasj-muted">
            {rango}
          </p>
        }
      >
        <AdminFilterField label="Desde">
          <input
            id="averias-reporte-desde"
            name="fechaDesde"
            type="date"
            className={adminFilterControlClassName}
            value={fechas.fechaDesde}
            onChange={(event) => updateFecha('fechaDesde', event.target.value)}
          />
        </AdminFilterField>
        <AdminFilterField label="Hasta">
          <input
            id="averias-reporte-hasta"
            name="fechaHasta"
            type="date"
            className={adminFilterControlClassName}
            value={fechas.fechaHasta}
            onChange={(event) => updateFecha('fechaHasta', event.target.value)}
          />
        </AdminFilterField>
      </AdminFilters>

        {errorMessage ? (
          <EmptyState
            role="alert"
            title={errorMessage}
            actions={
              rangoInvalido ? undefined : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onRetry ?? remote.refetch}
                >
                  {ADMIN_COPY.retry}
                </Button>
              )
            }
          />
        ) : (
          <section
            className="averias-summary-indicators"
            aria-label="Indicadores del resumen"
            aria-busy={isLoading || undefined}
          >
            <div className="averias-summary-indicators__head">
              <h2>Indicadores de averías</h2>
              <p>Resumen de los casos registrados para el periodo seleccionado.</p>
            </div>
            <p className="visually-hidden">
              {isLoading ? AVERIAS_REPORTE_LOADING_MESSAGE : rango}
            </p>
            <div className="admin-dashboard__indicators-grid">
              {isLoading
                ? TARJETAS_CARGA.map((titulo) => (
                    <IndicatorCard key={titulo} title={titulo} value={0} isLoading className="activities-indicator-modern" />
                  ))
                : indicadores.map((indicador) => (
                    <IndicatorCard
                      key={indicador.id}
                      title={indicador.titulo}
                      value={indicador.cantidad}
                      className="activities-indicator-modern"
                    />
                  ))}
            </div>
            {!isLoading && resumen?.total === 0 ? (
              <EmptyState role="status" title={AVERIAS_REPORTE_EMPTY_MESSAGE} />
            ) : null}
          </section>
        )}
    </AdminShell>
  )
}

export default AveriasReporteResumenPage
