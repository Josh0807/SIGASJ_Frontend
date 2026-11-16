import AdminNavIcon from '../admin-panel/components/AdminNavIcon'
import IndicatorCard from '../../shared/components/IndicatorCard'
import ErrorBoundary from '../../shared/components/ErrorBoundary'
import RecentAlertsWidget from './components/RecentAlertsWidget'
import RecentActivityWidget from './components/RecentActivityWidget'
import MapaRedPanel from '../mapa-red/MapaRedPanel'
import { useDashboardMetrics } from './hooks/useDashboardMetrics'
import { MAPA_RED_PATH } from '../mapa-red/mapaRedPaths'
import type { DashboardSummaryData } from './services/dashboardService'
import { useAuth } from '../auth/components/AuthContext'
import { canAccessAdminRoute } from '../auth/utils/adminNavigation'
import {
  InternalAdminRoleName,
  normalizeInternalRole,
} from '../auth/utils/internalRoles'
import { resolveAuthUserHeaderName } from '../auth/utils/authUserDisplay'
import { ALERTAS_REPOSICION_PATH } from '../inventario/inventarioPaths'
import type { DashboardIndicator } from './props'
import { IconRefresh } from '@tabler/icons-react'
import { ADMIN_COPY } from '../../shared/admin/adminCopy'
import { AdminShell, Button } from '../../shared/ui'
import panelOperativoImage from '../../assets/Hero1.webp'

const DASHBOARD_INDICATORS: DashboardIndicator[] = [
  {
    id: 'abonados',
    label: 'Asociados activos',
    value: null,
    detail: 'Personas en el padrón',
    badgeText: 'Activos',
    badgeType: 'success',
    icon: 'abonados',
    link: '/admin/abonados',
  },
  {
    id: 'averias',
    label: 'Averías abiertas',
    value: null,
    detail: 'Pendientes de resolución',
    badgeText: 'Abiertas',
    badgeType: 'info',
    icon: 'averias',
    link: '/admin/averias',
  },
  {
    id: 'solicitudes',
    label: 'Solicitudes en trámite',
    value: null,
    detail: 'Trámites ciudadanos',
    badgeText: 'En revisión',
    badgeType: 'info',
    icon: 'solicitudes',
    link: '/admin/solicitudes',
  },
  {
    id: 'alertas-reposicion',
    label: 'Alertas de reposición',
    value: null,
    detail: 'Stock bajo el mínimo',
    badgeText: 'Bodega',
    badgeType: 'warning',
    icon: 'inventario',
    link: ALERTAS_REPOSICION_PATH,
  },
]

const indicatorMetricKey = (
  indicatorId: DashboardIndicator['id'],
): keyof DashboardSummaryData | null => {
  if (indicatorId === 'abonados') return 'abonadosActivos'
  if (indicatorId === 'averias') return 'averiasReportadas'
  if (indicatorId === 'solicitudes') return 'solicitudesEnTramite'
  if (indicatorId === 'alertas-reposicion') return 'alertasReposicionPendientes'
  return null
}

const canShowIndicator = (
  user: Parameters<typeof canAccessAdminRoute>[0],
  indicator: DashboardIndicator,
) => {
  if (indicator.link && !canAccessAdminRoute(user, indicator.link)) {
    return false
  }

  if (indicator.id === 'solicitudes') {
    const role = normalizeInternalRole(user?.role)
    return (
      role === InternalAdminRoleName.Administradora ||
      role === InternalAdminRoleName.Secretaria
    )
  }

  return true
}

const resolveGreeting = (date = new Date()) => {
  const hour = date.getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const AdminDashboard = () => {
  const { user } = useAuth()
  const visibleDefinitions = DASHBOARD_INDICATORS.filter((indicator) =>
    canShowIndicator(user, indicator),
  )
  const metricKeys = visibleDefinitions.flatMap((indicator) => {
    const key = indicatorMetricKey(indicator.id)
    return key ? [key] : []
  })
  const { metrics, isLoading, isError, refetch } = useDashboardMetrics(
    undefined,
    metricKeys,
  )
  const displayName = resolveAuthUserHeaderName(user)
  const greeting = resolveGreeting()
  const canSeeMapa = canAccessAdminRoute(user, MAPA_RED_PATH)

  const indicators: DashboardIndicator[] = visibleDefinitions.map((indicator) => {
    if (indicator.id === 'abonados') {
      return { ...indicator, value: metrics.abonadosActivos ?? null }
    }
    if (indicator.id === 'averias') {
      return { ...indicator, value: metrics.averiasReportadas ?? null }
    }
    if (indicator.id === 'solicitudes') {
      return { ...indicator, value: metrics.solicitudesEnTramite ?? null }
    }
    if (indicator.id === 'alertas-reposicion') {
      return { ...indicator, value: metrics.alertasReposicionPendientes ?? null }
    }
    return indicator
  })

  return (
    <AdminShell
      className="admin-dashboard w-full min-w-0"
      aria-labelledby="admin-dashboard-title"
    >
      <div className="admin-dashboard__shell">
        <header className="admin-dashboard__welcome-card">
          <div className="admin-dashboard__welcome-media" aria-hidden="true">
            <img
              src={panelOperativoImage}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="admin-dashboard__welcome-copy">
            {displayName ? (
              <p className="admin-dashboard__greeting">
                {greeting}, <strong>{displayName}</strong>
              </p>
            ) : (
              <p className="admin-dashboard__greeting">{greeting}</p>
            )}
            <h1 id="admin-dashboard-title">Resumen del acueducto</h1>
            <p className="admin-dashboard__lead">
              Indicadores, mapa de red y actividad reciente según su rol en SIGASJ.
            </p>
          </div>
        </header>

        {indicators.length > 0 ? (
          <section
            className="admin-dashboard__section admin-dashboard__section--kpis"
            aria-labelledby="admin-dashboard-kpis-title"
          >
            <div className="admin-dashboard__section-header admin-dashboard__section-header--with-action">
              <div>
                <h2 id="admin-dashboard-kpis-title">Indicadores</h2>
                <p>Cifras actuales de los módulos a su cargo.</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="admin-dashboard__refresh-btn"
                onClick={() => {
                  void refetch()
                }}
                disabled={isLoading}
                aria-label="Actualizar indicadores del dashboard"
                leftIcon={
                  <IconRefresh
                    className={
                      isLoading ? 'admin-dashboard__refresh-icon--loading' : undefined
                    }
                    aria-hidden="true"
                    size={17}
                    stroke={2}
                  />
                }
              >
                {isLoading ? 'Actualizando…' : 'Actualizar'}
              </Button>
            </div>

            {isError ? (
              <div className="admin-dashboard__global-error" role="alert">
                <span>{ADMIN_COPY.loadError('indicadores')}</span>
                <Button type="button" size="sm" onClick={() => void refetch()}>
                  {ADMIN_COPY.retry}
                </Button>
              </div>
            ) : null}

            <div className="admin-dashboard__indicators-grid">
              {indicators.map((indicator) => (
                <IndicatorCard
                  key={indicator.id}
                  title={indicator.label}
                  value={indicator.value}
                  description={indicator.detail}
                  badgeText={indicator.badgeText}
                  badgeType={indicator.badgeType}
                  icon={<AdminNavIcon name={indicator.icon} />}
                  className={`indicator-card--${indicator.id}`}
                  link={indicator.link}
                  isLoading={isLoading}
                  onRetry={() => void refetch()}
                />
              ))}
            </div>
          </section>
        ) : null}

        {canSeeMapa ? (
          <section
            className="admin-dashboard__section admin-dashboard__section--mapa"
            aria-labelledby="admin-dashboard-mapa-title"
          >
            <div className="admin-dashboard__section-header">
              <h2 id="admin-dashboard-mapa-title">Mapa de la red</h2>
              <p>Sectores, averías activas y detalle operativo.</p>
            </div>
            <ErrorBoundary>
              <MapaRedPanel
                compact
                hideShellTitle
                className="admin-dashboard__mapa"
              />
            </ErrorBoundary>
          </section>
        ) : null}

        <section
          className="admin-dashboard__section"
          aria-labelledby="admin-dashboard-live-title"
        >
          <div className="admin-dashboard__section-header">
            <h2 id="admin-dashboard-live-title">Seguimiento</h2>
            <p>Averías abiertas y movimientos recientes del sistema.</p>
          </div>
          <div className="admin-dashboard__widgets-grid">
            <ErrorBoundary>
              <RecentAlertsWidget />
            </ErrorBoundary>
            <ErrorBoundary>
              <RecentActivityWidget />
            </ErrorBoundary>
          </div>
        </section>
      </div>
    </AdminShell>
  )
}

export default AdminDashboard
