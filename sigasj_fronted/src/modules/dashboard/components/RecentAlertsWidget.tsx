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
    <div className="dashboard-widget recent-alerts-widget">
      <div className="dashboard-widget__header">
        <div className="dashboard-widget__title-group">
          <span className="dashboard-widget__icon dashboard-widget__icon--averias" aria-hidden="true">
            <AdminNavIcon name="averias" />
          </span>
          <div>
            <h3 className="dashboard-widget__title">Averías Recientes</h3>
            <span className="dashboard-widget__subtitle">Reportes prioritarios</span>
          </div>
        </div>
        <span className="recent-alerts-widget__count">
          {isLoading ? '…' : `${alerts.length} activas`}
        </span>
      </div>

      <div className="recent-alerts-widget__body">
        {isLoading ? (
          <p className="recent-alerts-widget__empty">Cargando averías…</p>
        ) : alerts.length === 0 ? (
          <p className="recent-alerts-widget__empty">No hay averías prioritarias pendientes.</p>
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
          <Link to={footerPath} className="dashboard-widget__link">
            Ver todas las averías &rarr;
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export default RecentAlertsWidget
