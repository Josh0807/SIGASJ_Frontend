import React from 'react'
import { Link } from 'react-router-dom'
import AdminNavIcon from '../../admin-panel/components/AdminNavIcon'
import type { AlertItem, RecentAlertsWidgetProps } from '../props'

const DEFAULT_ALERTS: AlertItem[] = [
  {
    id: 'av-101',
    title: 'Fuga de tubería principal',
    location: 'Sector Central - Av. 2',
    urgency: 'alta',
    timeAgo: 'Hace 25 min',
  },
  {
    id: 'av-102',
    title: 'Baja presión en hidrante',
    location: 'Barrio El Carmen',
    urgency: 'media',
    timeAgo: 'Hace 2 horas',
  },
  {
    id: 'av-103',
    title: 'Medidor dañado',
    location: 'Sector Norte - Calle 5',
    urgency: 'baja',
    timeAgo: 'Hace 4 horas',
  },
]

const RecentAlertsWidget: React.FC<RecentAlertsWidgetProps> = ({
  alerts = DEFAULT_ALERTS,
}) => {
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
        <span className="recent-alerts-widget__count">{alerts.length} activas</span>
      </div>

      <div className="recent-alerts-widget__body">
        {alerts.length === 0 ? (
          <p className="recent-alerts-widget__empty">No hay averías prioritarias pendientes.</p>
        ) : (
          <ul className="recent-alerts-widget__list">
            {alerts.map((alert) => (
              <li key={alert.id} className="recent-alerts-widget__item">
                <div className="recent-alerts-widget__item-main">
                  <span className={`recent-alerts-widget__urgency recent-alerts-widget__urgency--${alert.urgency}`}>
                    {alert.urgency.toUpperCase()}
                  </span>
                  <div className="recent-alerts-widget__info">
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

      <div className="dashboard-widget__footer">
        <Link to="/admin/averias" className="dashboard-widget__link">
          Ver todas las averías &rarr;
        </Link>
      </div>
    </div>
  )
}

export default RecentAlertsWidget
