import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminNavIcon from '../../admin-panel/components/AdminNavIcon'
import { useAuth } from '../../auth/components/AuthContext'
import {
  canAccessAdminRoute,
  InternalAdminRoleName,
  userHasAllowedRole,
} from '../../auth/utils/adminNavigation'
import { FONTANERO_AVERIAS_PATH } from '../../averias/fontanero/averiasFontaneroPaths'
import type { AlertItem, RecentAlertsWidgetProps } from '../props'
import { getRecentDashboardAlerts } from '../services/dashboardService'

const URGENCY_LABELS: Record<AlertItem['urgency'], string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

const RecentAlertsWidget: React.FC<RecentAlertsWidgetProps> = ({ alerts: alertsProp }) => {
  const { user } = useAuth()
  const canOpenAdminAverias = canAccessAdminRoute(user, '/admin/averias')
  const canOpenFontaneroAverias = userHasAllowedRole(user, [
    InternalAdminRoleName.Fontanero,
  ])
  const [alerts, setAlerts] = useState<AlertItem[]>(alertsProp ?? [])
  const [isLoading, setIsLoading] = useState(alertsProp === undefined)

  useEffect(() => {
    if (alertsProp !== undefined) {
      setAlerts(alertsProp)
      setIsLoading(false)
      return
    }

    const scope = canOpenAdminAverias
      ? 'admin'
      : canOpenFontaneroAverias
        ? 'fontanero'
        : null

    if (scope === null) {
      setAlerts([])
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    void getRecentDashboardAlerts(scope)
      .then((items) => {
        if (!cancelled) {
          setAlerts(items)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAlerts([])
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
  }, [alertsProp, canOpenAdminAverias, canOpenFontaneroAverias])

  const footerPath = canOpenAdminAverias
    ? '/admin/averias'
    : canOpenFontaneroAverias
      ? FONTANERO_AVERIAS_PATH
      : null

  return (
    <div className="dashboard-widget recent-alerts-widget group !overflow-hidden !rounded-[26px] !border-rose-100 !bg-linear-to-br !from-white !via-white !to-rose-50/50 !p-7 !shadow-[0_14px_36px_rgba(15,63,110,0.1)] !transition-all !duration-300 hover:!-translate-y-1 hover:!border-rose-200 hover:!shadow-[0_20px_44px_rgba(225,29,72,0.13)] motion-reduce:!transform-none motion-reduce:!transition-none">
      <div className="dashboard-widget__header">
        <div className="dashboard-widget__title-group">
          <span className="dashboard-widget__icon dashboard-widget__icon--averias !grid !size-14 !place-items-center !rounded-2xl !border !border-white/70 !bg-linear-to-br !from-rose-500 !to-orange-400 !text-white !shadow-[0_10px_22px_rgba(225,29,72,0.28)] !transition-transform !duration-300 group-hover:!-rotate-3 group-hover:!scale-110 motion-reduce:!transform-none" aria-hidden="true">
            <AdminNavIcon name="averias" />
          </span>
          <div>
            <h3 className="dashboard-widget__title !text-lg !font-extrabold !text-[#062e63]">Averías Recientes</h3>
            <span className="dashboard-widget__subtitle !text-sm !text-slate-500">Reportes prioritarios</span>
          </div>
        </div>
        <span className="recent-alerts-widget__count !rounded-full !border !border-rose-200 !bg-rose-50 !px-3 !py-1.5 !font-extrabold !text-rose-700 !shadow-sm">
          {isLoading ? '…' : `${alerts.length} activas`}
        </span>
      </div>

      <div className="recent-alerts-widget__body">
        {isLoading ? (
          <p className="recent-alerts-widget__empty">Cargando averías…</p>
        ) : alerts.length === 0 ? (
          <p className="recent-alerts-widget__empty !rounded-[20px] !border !border-dashed !border-rose-200 !bg-linear-to-br !from-rose-50 !to-orange-50/60 !text-slate-500 !shadow-inner">No hay averías prioritarias pendientes.</p>
        ) : (
          <ul className="recent-alerts-widget__list">
            {alerts.map((alert) => (
              <li key={alert.id} className="recent-alerts-widget__item">
                <div className="recent-alerts-widget__item-main">
                  <span className={`recent-alerts-widget__urgency recent-alerts-widget__urgency--${alert.urgency}`}>
                    {URGENCY_LABELS[alert.urgency]}
                  </span>
                  <div className="recent-alerts-widget__info">
                    {alert.code ? (
                      <span className="recent-alerts-widget__item-code">{alert.code}</span>
                    ) : null}
                    <strong className="recent-alerts-widget__item-title">{alert.title}</strong>
                    <span className="recent-alerts-widget__item-location">{alert.location}</span>
                  </div>
                </div>
                <span className="recent-alerts-widget__time">{alert.timeAgo}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {footerPath ? (
        <div className="dashboard-widget__footer">
          <Link to={footerPath} className="dashboard-widget__link !inline-flex !items-center !rounded-xl !px-3 !py-2 !font-extrabold !text-blue-700 !transition-all !duration-300 hover:!translate-x-1 hover:!bg-blue-50 hover:!no-underline motion-reduce:!transform-none motion-reduce:!transition-none">
            Ver todas las averías &rarr;
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export default RecentAlertsWidget
