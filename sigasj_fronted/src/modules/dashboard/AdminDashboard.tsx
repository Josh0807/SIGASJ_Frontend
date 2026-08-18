import AdminNavIcon, { type AdminNavIconName } from '../admin-panel/components/AdminNavIcon'
import IndicatorCard from '../../shared/components/IndicatorCard'
import QuickAccessCard from '../../shared/components/QuickAccessCard'
import { ADMIN_NAV_ITEMS } from '../../app/router/privateRoutes'
import { getAuthorizedQuickAccessItems } from './config/quickAccessConfig'
import { useDashboardMetrics } from './hooks/useDashboardMetrics'

type DashboardIndicator = {
  id: string
  label: string
  value: string | number | null
  detail: string
  badgeText: string
  badgeType: 'success' | 'warning' | 'info' | 'alert'
  icon: AdminNavIconName
  link: string
}

const AdminDashboard = () => {
  const { metrics, isLoading, isError, refetch } = useDashboardMetrics()
  const allowedPaths = ADMIN_NAV_ITEMS.map((item) => item.path)
  const quickAccessItems = getAuthorizedQuickAccessItems(allowedPaths)

  const indicators: DashboardIndicator[] = [
    {
      id: 'abonados',
      label: 'Abonados activos',
      value: metrics.abonadosActivos ?? null,
      detail: 'Padrón actualizado',
      badgeText: 'Activos',
      badgeType: 'success',
      icon: 'abonados',
      link: '/admin/abonados',
    },
    {
      id: 'lecturas',
      label: 'Lecturas pendientes',
      value: metrics.lecturasPendientes ?? null,
      detail: 'Ciclo del mes actual',
      badgeText: 'En curso',
      badgeType: 'warning',
      icon: 'lecturas',
      link: '/admin/lecturas',
    },
    {
      id: 'averias',
      label: 'Averías reportadas',
      value: metrics.averiasReportadas ?? null,
      detail: 'Requieren atención',
      badgeText: 'Pendientes',
      badgeType: 'alert',
      icon: 'averias',
      link: '/admin/averias',
    },
    {
      id: 'solicitudes',
      label: 'Solicitudes en trámite',
      value: metrics.solicitudesEnTramite ?? null,
      detail: 'Nuevos servicios',
      badgeText: 'En revisión',
      badgeType: 'info',
      icon: 'solicitudes',
      link: '/admin/solicitudes',
    },
  ]

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
              &#x21bb; {isLoading ? 'Cargando...' : 'Actualizar datos'}
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

        {/* Sección de Accesos Rápido */}
        <div className="admin-dashboard__section">
          <div className="admin-dashboard__section-header">
            <h2>Accesos rápidos</h2>
            <p>Accede directamente a los diferentes módulos de administración.</p>
          </div>
          <div className="admin-dashboard__quick-access-grid">
            {quickAccessItems.map((item) => (
              <QuickAccessCard
                key={item.id}
                title={item.title}
                description={item.description}
                path={item.path}
                icon={<AdminNavIcon name={item.icon} />}
                badgeText={item.badgeText}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard
