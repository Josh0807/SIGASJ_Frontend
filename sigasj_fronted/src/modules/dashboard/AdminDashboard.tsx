import AdminNavIcon from '../admin-panel/components/AdminNavIcon'
import IndicatorCard from '../../shared/components/IndicatorCard'
import ErrorBoundary from '../../shared/components/ErrorBoundary'
import RecentAlertsWidget from './components/RecentAlertsWidget'
import RecentActivityWidget from './components/RecentActivityWidget'
import { useDashboardMetrics } from './hooks/useDashboardMetrics'
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

const DASHBOARD_INDICATORS: DashboardIndicator[] = [
  {
    id: 'abonados',
    label: 'Asociados activos',
    value: null,
    detail: 'Padrón actualizado',
    badgeText: 'Activos',
    badgeType: 'success',
    icon: 'abonados',
    link: '/admin/abonados',
  },
  {
    id: 'averias',
    label: 'Averías reportadas',
    value: null,
    detail: 'Requieren atención',
    badgeText: 'Pendientes',
    badgeType: 'info',
    icon: 'averias',
    link: '/admin/averias',
  },
  {
    id: 'solicitudes',
    label: 'Solicitudes en trámite',
    value: null,
    detail: 'Nuevos servicios',
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
    badgeText: 'Pendientes',
    badgeType: 'warning',
    icon: 'inventario',
    link: ALERTAS_REPOSICION_PATH,
  },
]

const indicatorMetricKey = (
  indicatorId: DashboardIndicator['id'],
): keyof DashboardSummaryData | null => {
  if (indicatorId === 'abonados') {
    return 'abonadosActivos'
  }
  if (indicatorId === 'averias') {
    return 'averiasReportadas'
  }
  if (indicatorId === 'solicitudes') {
    return 'solicitudesEnTramite'
  }
  if (indicatorId === 'alertas-reposicion') {
    return 'alertasReposicionPendientes'
  }
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
    <section
      className="admin-dashboard admin-content-modern w-full min-w-0"
      aria-labelledby="admin-dashboard-title"
    >
      <div className="admin-dashboard__shell">
        <div className="admin-dashboard__top-grid">
          <header className="admin-dashboard__welcome-card">
            <span className="admin-dashboard__eyebrow">Panel operativo</span>
            {displayName ? (
              <p className="admin-dashboard__greeting">
                {greeting}, <strong>{displayName}</strong>
              </p>
            ) : null}
            <h1 id="admin-dashboard-title">Dashboard administrativo</h1>
            <p className="admin-dashboard__lead">
              Resumen del estado del acueducto según su rol: asociados, averías,
              solicitudes y alertas.
            </p>
          </header>

          <aside className="admin-dashboard__focus-card" aria-label="Acciones del panel">
            <div className="admin-dashboard__focus-copy">
              <h2>Control del día</h2>
              <p>
                Refresque las cifras cuando necesite la lectura más reciente.
              </p>
            </div>
            {indicators.length > 0 ? (
              <button
                type="button"
                className="admin-dashboard__refresh-btn"
                onClick={() => {
                  void refetch()
                }}
                disabled={isLoading}
                aria-label="Actualizar datos del dashboard"
              >
                <IconRefresh
                  className={`admin-dashboard__refresh-icon ${
                    isLoading ? 'admin-dashboard__refresh-icon--loading' : ''
                  }`}
                  aria-hidden="true"
                  size={18}
                  stroke={2}
                />
                {isLoading ? 'Cargando...' : 'Actualizar datos'}
              </button>
            ) : null}
          </aside>
        </div>

        {indicators.length > 0 ? (
          <div className="admin-dashboard__section">
            <div className="admin-dashboard__section-header">
              <h2>Indicadores principales</h2>
              <p>Resumen actual de los módulos disponibles para su cuenta.</p>
            </div>

            {isError ? (
              <div className="admin-dashboard__global-error" role="alert">
                <span>No se pudieron actualizar algunos indicadores del servidor.</span>
                <button type="button" onClick={() => void refetch()}>
                  Reintentar
                </button>
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
          </div>
        ) : null}

        <div className="admin-dashboard__section">
          <div className="admin-dashboard__section-header">
            <h2>Operación en vivo</h2>
            <p>Lo más reciente del acueducto, sin salir del panel.</p>
          </div>
          <div className="admin-dashboard__widgets-grid">
            <ErrorBoundary>
              <RecentAlertsWidget />
            </ErrorBoundary>
            <ErrorBoundary>
              <RecentActivityWidget />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard
