import { Link, Navigate, useSearchParams } from 'react-router-dom'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import IndicatorCard from '../../../shared/components/IndicatorCard'
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
    <main className="gallery-admin averias-admin w-full min-w-0">
      <div className="gallery-admin__shell sigasj-stack">
        <header className="gallery-admin__header !rounded-[28px] !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/70 !px-8 !py-8 !shadow-[0_14px_38px_rgba(30,90,156,0.10)] md:!px-10">
          <div className="space-y-3">
            <p className="gallery-admin__eyebrow !m-0 !text-sm !font-black !tracking-[0.12em] !text-blue-600">Panel administrativo</p>
            <h1>Resumen de averías</h1>
            <p>Cantidad de averías registradas según su estado actual.</p>
          </div>
          <div className="gallery-admin__header-actions !gap-3">
            <Link
              className="gallery-admin__button !rounded-2xl !border-0 !bg-gradient-to-r !from-blue-600 !to-sky-500 !px-6 !py-3.5 !font-bold !text-white !no-underline !shadow-lg !shadow-blue-200"
              to={`${AVERIAS_ADMIN_IMPRIMIR_PATH}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
            >
              Imprimir averías atendidas
            </Link>
            <Link className="gallery-admin__button !rounded-2xl !border-blue-200 !bg-white !px-6 !py-3.5 !font-bold !text-blue-700 !no-underline !shadow-md" to={AVERIAS_ADMIN_PATH}>
              Volver a gestión
            </Link>
          </div>
        </header>

        <section className="gallery-admin__filters w-full !rounded-[28px] !border-blue-100 !bg-white/90 !p-7 !shadow-[0_14px_38px_rgba(30,90,156,0.08)]" aria-label="Rango del resumen">
          <div className="col-span-full border-b border-blue-100 pb-5">
            <p className="mb-1 text-sm font-black uppercase tracking-[0.12em] text-blue-600">Consulta del resumen</p>
            <h2 className="m-0 text-2xl font-black tracking-tight text-[#07376f]">Filtrar por periodo</h2>
          </div>
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
          <section className="averias-summary-indicators rounded-[28px] border border-blue-100 bg-white/90 p-6 shadow-[0_14px_38px_rgba(30,90,156,0.08)] md:p-8" aria-label="Indicadores del resumen" aria-busy={isLoading || undefined}>
            <div className="mb-6 border-b border-blue-100 pb-5">
              <p className="mb-1 text-sm font-black uppercase tracking-[0.12em] text-blue-600">Estado general</p>
              <h2 className="m-0 text-2xl font-black tracking-tight text-[#07376f]">Indicadores de averías</h2>
              <p className="mt-2 text-base text-slate-500">Resumen de los casos registrados para el periodo seleccionado.</p>
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
