import AdminNavIcon from '../admin-panel/components/AdminNavIcon'
import IndicatorCard from '../../shared/components/IndicatorCard'
import ErrorBoundary from '../../shared/components/ErrorBoundary'
import RecentAlertsWidget from './components/RecentAlertsWidget'
import RecentActivityWidget from './components/RecentActivityWidget'
import { useDashboardMetrics } from './hooks/useDashboardMetrics'
import { useAuth } from '../auth/components/AuthContext'
import { canAccessAdminRoute } from '../auth/utils/adminNavigation'
import { resolveAuthUserHeaderName } from '../auth/utils/authUserDisplay'
import type { DashboardIndicator } from './props'
import { IconRefresh } from '@tabler/icons-react'
import welcomeImage from '../../assets/Hero1.png'
import gotinImage from '../../assets/Gotín sin fondo.png'

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
  {
    id: 'lecturas',
    label: 'Pendientes de lectura',
    value: null,
    detail: 'Ciclo en curso',
    badgeText: 'Pendientes',
    badgeType: 'warning',
    icon: 'lecturas',
  },
]

const AdminDashboard = () => {
  const { user } = useAuth()
  const { metrics, isLoading, isError, refetch } = useDashboardMetrics()
  const displayName = resolveAuthUserHeaderName(user)

  const indicators: DashboardIndicator[] = DASHBOARD_INDICATORS.filter((indicator) => {
    if (indicator.id === 'lecturas') {
      return canAccessAdminRoute(user, '/admin/lecturas')
    }
    return !indicator.link || canAccessAdminRoute(user, indicator.link)
  }).map((indicator) => {
    if (indicator.id === 'abonados') {
      return { ...indicator, value: metrics.abonadosActivos ?? null }
    }
    if (indicator.id === 'averias') {
      return { ...indicator, value: metrics.averiasReportadas ?? null }
    }
    if (indicator.id === 'solicitudes') {
      return { ...indicator, value: metrics.solicitudesEnTramite ?? null }
    }
    if (indicator.id === 'lecturas') {
      return { ...indicator, value: metrics.lecturasPendientes ?? null }
    }
    return indicator
  })

  return (
    <section className="admin-dashboard w-full min-w-0" aria-labelledby="admin-dashboard-title">
      <div className="admin-dashboard__shell sigasj-stack">
        <header className="admin-dashboard__welcome">
          <img
            className="admin-dashboard__welcome-art"
            src={welcomeImage}
            alt=""
          />
          <div className="admin-dashboard__welcome-content">
            <span className="admin-dashboard__eyebrow">Panel de Control General</span>
            <p className="admin-dashboard__welcome-kicker">Bienvenido de nuevo,</p>
            <p className="admin-dashboard__welcome-name">{displayName}</p>
            <h1 id="admin-dashboard-title">Dashboard administrativo</h1>
            <p className="admin-dashboard__welcome-text">
              ¡Bienvenido al sistema administrativo de ASADA San Juan! Aquí encontrarás
              un resumen general de la operación del servicio de agua, métricas principales
              y accesos directos a los módulos de gestión.
            </p>
          </div>
          <div className="admin-dashboard__system-status" role="status" aria-live="polite">
            <span className="admin-dashboard__status-ring">
              <img
                className="admin-dashboard__status-mascot"
                src={gotinImage}
                alt="Gotín"
              />
            </span>
            <div className="admin-dashboard__status-info">
              <strong>Sistema Operativo</strong>
              <small>¡ASADA San Juan!</small>
            </div>
          </div>
        </header>

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
