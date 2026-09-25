import { Link, Navigate, useSearchParams } from 'react-router-dom'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import IndicatorCard from '../../../shared/components/IndicatorCard'
import { useAdminAveriasReporteResumen } from '../hooks/useAdminAveriasReporteResumen'
import { AVERIAS_ADMIN_PATH } from './averiasAdminPaths'
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
    <main className="gallery-admin averias-admin w-full min-w-0">
      <div className="gallery-admin__shell sigasj-stack">
        <header className="gallery-admin__header">
          <div>
            <p className="gallery-admin__eyebrow">Panel administrativo</p>
            <h1>Resumen de averías</h1>
            <p>Cantidad de averías registradas según su estado actual.</p>
          </div>
          <div className="gallery-admin__header-actions">
            <Link className="gallery-admin__button" to={AVERIAS_ADMIN_PATH}>
              Volver a gestión
            </Link>
          </div>
        </header>

        <section className="gallery-admin__filters w-full" aria-label="Rango del resumen">
          <p className="averias-reporte__rango">{rango}</p>
          <label className="gallery-admin__field" htmlFor="averias-reporte-desde">
            <span>Desde</span>
            <input
              id="averias-reporte-desde"
              name="fechaDesde"
              type="date"
              value={fechas.fechaDesde}
              onChange={(event) => updateFecha('fechaDesde', event.target.value)}
            />
          </label>
          <label className="gallery-admin__field" htmlFor="averias-reporte-hasta">
            <span>Hasta</span>
            <input
              id="averias-reporte-hasta"
              name="fechaHasta"
              type="date"
              value={fechas.fechaHasta}
              onChange={(event) => updateFecha('fechaHasta', event.target.value)}
            />
          </label>
        </section>

        {errorMessage ? (
          <div className="gallery-admin__empty" role="alert">
            <p>{errorMessage}</p>
            {rangoInvalido ? null : (
              <button type="button" onClick={onRetry ?? remote.refetch}>
                Reintentar
              </button>
            )}
          </div>
        ) : (
          <section aria-label="Indicadores del resumen" aria-busy={isLoading || undefined}>
            <p className="visually-hidden">
              {isLoading ? AVERIAS_REPORTE_LOADING_MESSAGE : rango}
            </p>
            <div className="admin-dashboard__indicators-grid">
              {isLoading
                ? TARJETAS_CARGA.map((titulo) => (
                    <IndicatorCard key={titulo} title={titulo} value={0} isLoading />
                  ))
                : indicadores.map((indicador) => (
                    <IndicatorCard
                      key={indicador.id}
                      title={indicador.titulo}
                      value={indicador.cantidad}
                    />
                  ))}
            </div>
            {!isLoading && resumen?.total === 0 ? (
              <p className="gallery-admin__empty" role="status">
                {AVERIAS_REPORTE_EMPTY_MESSAGE}
              </p>
            ) : null}
          </section>
        )}
      </div>
    </main>
  )
}

export default AveriasReporteResumenPage
