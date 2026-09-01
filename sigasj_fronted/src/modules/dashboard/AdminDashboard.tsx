import AdminNavIcon from '../admin-panel/components/AdminNavIcon'
import IndicatorCard from '../../shared/components/IndicatorCard'
import ErrorBoundary from '../../shared/components/ErrorBoundary'
import RecentAlertsWidget from './components/RecentAlertsWidget'
import RecentActivityWidget from './components/RecentActivityWidget'
import { useDashboardMetrics } from './hooks/useDashboardMetrics'
import { useAuth } from '../auth/components/AuthContext'
import { canAccessAdminRoute } from '../auth/utils/adminNavigation'
import type { DashboardIndicator } from './props'

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
    id: 'lecturas',
    label: 'Recursos Humanos',
    value: null,
    detail: 'Ciclo del mes actual',
    badgeText: 'En curso',
    badgeType: 'warning',
    icon: 'lecturas',
    link: '/admin/lecturas',
  },
  {
    id: 'averias',
    label: 'Averías reportadas',
    value: null,
    detail: 'Requieren atención',
    badgeText: 'Pendientes',
    badgeType: 'alert',
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
]

const AdminDashboard = () => {
  const { user } = useAuth()
  const { metrics, isLoading, isError, refetch } = useDashboardMetrics()

  const indicators: DashboardIndicator[] = DASHBOARD_INDICATORS.filter(
    (indicator) => !indicator.link || canAccessAdminRoute(user, indicator.link),
  ).map((indicator) => {
    if (indicator.id === 'abonados') {
      return { ...indicator, value: metrics.abonadosActivos ?? null }
    }
    if (indicator.id === 'lecturas') {
      return { ...indicator, value: metrics.lecturasPendientes ?? null }
    }
    if (indicator.id === 'averias') {
      return { ...indicator, value: metrics.averiasReportadas ?? null }
    }
    if (indicator.id === 'solicitudes') {
      return { ...indicator, value: metrics.solicitudesEnTramite ?? null }
    }
    return indicator
  })

  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
      <div className="admin-dashboard__shell">
        {/* Banner de Bienvenida */}
        <header className="admin-dashboard__welcome">
          <div className="admin-dashboard__welcome-content">
            <span className="admin-dashboard__eyebrow">Panel de Control General</span>
            <h1 id="admin-dashboard-title">Dashboard administrativo</h1>
            <p className="admin-dashboard__welcome-text">
              ¡Bienvenido al sistema administrativo de ASADA San Juan! Aquí encontrarás
              un resumen general de la operación del servicio de agua, métricas principales
              y accesos directos a los módulos de gestión.
            </p>
          </div>
          <div className="admin-dashboard__system-status" role="status" aria-live="polite">
            <span className="admin-dashboard__status-dot admin-dashboard__status-dot--online" />
            <div className="admin-dashboard__status-info">
              <strong>Sistema Operativo</strong>
              <small>¡ASADA San Juan!</small>
            </div>
          </div>
        </header>

        {/* Sección de Indicadores Generales */}
        <div className="admin-dashboard__section">
          <div className="admin-dashboard__section-header admin-dashboard__section-header--with-action">
            <div>
              <h2>Indicadores generales</h2>
              <p>Estado operativo en tiempo real del acueducto y servicios.</p>
            </div>
            <button
              type="button"
              className="admin-dashboard__refresh-btn"
              onClick={() => {
                void refetch()
              }}
              disabled={isLoading}
              aria-label="Actualizar datos del dashboard"
            >
              <span
                className={`admin-dashboard__refresh-icon ${
                  isLoading ? 'admin-dashboard__refresh-icon--loading' : ''
                }`}
                aria-hidden="true"
              >
                &#x21bb;
              </span>
              {isLoading ? 'Cargando...' : 'Actualizar datos'}
            </button>
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
                link={indicator.link}
                isLoading={isLoading}
                onRetry={() => void refetch()}
              />
            ))}
          </div>
        </div>

        {/* Sección de Operaciones y Estado en Tiempo Real (Widgets) */}
        <div className="admin-dashboard__section">
          <div className="admin-dashboard__section-header">
            <h2>Operaciones en tiempo real</h2>
            <p>Monitoreo de averías del acueducto y bitácora de actividad reciente.</p>
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
