import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminNavIcon from '../../admin-panel/components/AdminNavIcon'
import { useAuth } from '../../auth/components/AuthContext'
import { canAccessAdminRoute } from '../../auth/utils/adminNavigation'
import { ACTIVIDADES_FONTANERO_BASE_PATH } from '../../actividades-fontanero/actividadesFontaneroPaths'
import type { ActivityItem, RecentActivityWidgetProps } from '../props'
import { getRecentDashboardActivities } from '../services/dashboardService'

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  activities: activitiesProp,
}) => {
  const { user } = useAuth()
  const canOpenAdminReportes = canAccessAdminRoute(user, '/admin/reportes')
  const canOpenAdminActividades = canAccessAdminRoute(user, '/admin/actividades-fontanero')
  const canOpenFontaneroActividades = canAccessAdminRoute(user, '/admin/actividades')
  const [activities, setActivities] = useState<ActivityItem[]>(activitiesProp ?? [])
  const [isLoading, setIsLoading] = useState(activitiesProp === undefined)

  useEffect(() => {
    if (activitiesProp !== undefined) {
      setActivities(activitiesProp)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    const scope =
      canOpenAdminActividades || canOpenAdminReportes
        ? 'admin'
        : canOpenFontaneroActividades
          ? 'fontanero'
          : null

    if (scope === null) {
      setActivities([])
      setIsLoading(false)
      return
    }

    void getRecentDashboardActivities(scope)
      .then((items) => {
        if (!cancelled) {
          setActivities(items)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setActivities([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [activitiesProp, canOpenAdminActividades, canOpenAdminReportes, canOpenFontaneroActividades])

  const footerPath = canOpenAdminReportes
    ? '/admin/reportes'
    : canOpenFontaneroActividades
      ? ACTIVIDADES_FONTANERO_BASE_PATH
      : null

  return (
    <div className="dashboard-widget recent-activity-widget">
      <div className="dashboard-widget__header">
        <div className="dashboard-widget__title-group">
          <span className="dashboard-widget__icon dashboard-widget__icon--activity" aria-hidden="true">
            <AdminNavIcon name="reportes" />
          </span>
          <div>
            <h3 className="dashboard-widget__title">Bitácora de Actividad</h3>
            <span className="dashboard-widget__subtitle">Operaciones recientes</span>
          </div>
        </div>
      </div>

      <div className="recent-activity-widget__body">
        {isLoading ? (
          <p className="recent-activity-widget__empty">Cargando actividad…</p>
        ) : activities.length === 0 ? (
          <p className="recent-activity-widget__empty">Sin actividad reciente registrada.</p>
        ) : (
          <ul className="recent-activity-widget__timeline">
            {activities.map((item) => (
              <li key={item.id} className="recent-activity-widget__timeline-item">
                <span className="recent-activity-widget__bullet" aria-hidden="true" />
                <div className="recent-activity-widget__content">
                  <p className="recent-activity-widget__text">
                    <strong>{item.user}</strong> {item.action}{' '}
                    <span className="recent-activity-widget__target">{item.target}</span>
                  </p>
                  <span className="recent-activity-widget__time">{item.timeAgo}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {footerPath ? (
        <div className="dashboard-widget__footer">
          <Link to={footerPath} className="dashboard-widget__link">
            Ver historial completo &rarr;
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export default RecentActivityWidget
