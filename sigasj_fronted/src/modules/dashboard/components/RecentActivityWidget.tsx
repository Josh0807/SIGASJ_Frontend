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
    <div className="dashboard-widget recent-activity-widget group !overflow-hidden !rounded-[26px] !border-blue-100 !bg-linear-to-br !from-white !via-white !to-blue-50/60 !p-7 !shadow-[0_14px_36px_rgba(15,63,110,0.1)] !transition-all !duration-300 hover:!-translate-y-1 hover:!border-blue-200 hover:!shadow-[0_20px_44px_rgba(37,99,235,0.15)] motion-reduce:!transform-none motion-reduce:!transition-none">
      <div className="dashboard-widget__header">
        <div className="dashboard-widget__title-group">
          <span className="dashboard-widget__icon dashboard-widget__icon--activity !grid !size-14 !place-items-center !rounded-2xl !border !border-white/70 !bg-linear-to-br !from-blue-600 !to-cyan-400 !text-white !shadow-[0_10px_22px_rgba(37,99,235,0.28)] !transition-transform !duration-300 group-hover:!rotate-3 group-hover:!scale-110 motion-reduce:!transform-none" aria-hidden="true">
            <AdminNavIcon name="reportes" />
          </span>
          <div>
            <h3 className="dashboard-widget__title !text-lg !font-extrabold !text-[#062e63]">Bitácora de Actividad</h3>
            <span className="dashboard-widget__subtitle !text-sm !text-slate-500">Operaciones recientes</span>
          </div>
        </div>
      </div>

      <div className="recent-activity-widget__body">
        {isLoading ? (
          <p className="recent-activity-widget__empty">Cargando actividad…</p>
        ) : activities.length === 0 ? (
          <p className="recent-activity-widget__empty !rounded-[20px] !border !border-dashed !border-blue-200 !bg-linear-to-br !from-blue-50 !to-cyan-50/60 !text-slate-500 !shadow-inner">Sin actividad reciente registrada.</p>
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
          <Link to={footerPath} className="dashboard-widget__link !inline-flex !items-center !rounded-xl !px-3 !py-2 !font-extrabold !text-blue-700 !transition-all !duration-300 hover:!translate-x-1 hover:!bg-blue-50 hover:!no-underline motion-reduce:!transform-none motion-reduce:!transition-none">
            Ver historial completo &rarr;
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export default RecentActivityWidget
