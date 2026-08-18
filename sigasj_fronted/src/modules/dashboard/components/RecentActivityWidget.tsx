import React from 'react'
import { Link } from 'react-router-dom'
import AdminNavIcon from '../../admin-panel/components/AdminNavIcon'
import type { ActivityItem, RecentActivityWidgetProps } from '../props'

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    user: 'Juan Pérez',
    action: 'Registró 45 lecturas en',
    target: 'Sector Norte',
    timeAgo: 'Hace 10 min',
    icon: 'lecturas',
  },
  {
    id: 'act-2',
    user: 'Ana Solís',
    action: 'Dio de alta al abonado',
    target: '#1042 (Carlos Mora)',
    timeAgo: 'Hace 45 min',
    icon: 'abonados',
  },
  {
    id: 'act-3',
    user: 'Carlos Ramos',
    action: 'Atendió reporte de fuga en',
    target: 'Calle Principal',
    timeAgo: 'Hace 1 hora',
    icon: 'averias',
  },
]

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  activities = DEFAULT_ACTIVITIES,
}) => {
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
        {activities.length === 0 ? (
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

      <div className="dashboard-widget__footer">
        <Link to="/admin/reportes" className="dashboard-widget__link">
          Ver historial completo &rarr;
        </Link>
      </div>
    </div>
  )
}

export default RecentActivityWidget
