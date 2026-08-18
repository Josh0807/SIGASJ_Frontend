import React from 'react'
import { Link } from 'react-router-dom'
import AdminNavIcon from '../../admin-panel/components/AdminNavIcon'
import type { ReadingProgressWidgetProps } from '../props'

const ReadingProgressWidget: React.FC<ReadingProgressWidgetProps> = ({
  completedLecturas = 1060,
  totalLecturas = 1248,
  currentMonth = 'Mes en curso',
}) => {
  const percentage = Math.min(
    100,
    Math.max(0, Math.round((completedLecturas / (totalLecturas || 1)) * 100)),
  )
  const pending = Math.max(0, totalLecturas - completedLecturas)

  return (
    <div className="dashboard-widget reading-progress-widget">
      <div className="dashboard-widget__header">
        <div className="dashboard-widget__title-group">
          <span className="dashboard-widget__icon dashboard-widget__icon--lecturas" aria-hidden="true">
            <AdminNavIcon name="lecturas" />
          </span>
          <div>
            <h3 className="dashboard-widget__title">Ciclo de Lecturas</h3>
            <span className="dashboard-widget__subtitle">{currentMonth}</span>
          </div>
        </div>
        <span className="reading-progress-widget__badge">{percentage}% Completado</span>
      </div>

      <div className="reading-progress-widget__body">
        <div className="reading-progress-widget__bar-container" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso de lecturas de medidores">
          <div
            className="reading-progress-widget__bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="reading-progress-widget__stats">
          <div className="reading-progress-widget__stat">
            <span className="reading-progress-widget__stat-value">{completedLecturas.toLocaleString()}</span>
            <span className="reading-progress-widget__stat-label">Completadas</span>
          </div>
          <div className="reading-progress-widget__stat-divider" />
          <div className="reading-progress-widget__stat">
            <span className="reading-progress-widget__stat-value reading-progress-widget__stat-value--pending">
              {pending.toLocaleString()}
            </span>
            <span className="reading-progress-widget__stat-label">Pendientes</span>
          </div>
          <div className="reading-progress-widget__stat-divider" />
          <div className="reading-progress-widget__stat">
            <span className="reading-progress-widget__stat-value">{totalLecturas.toLocaleString()}</span>
            <span className="reading-progress-widget__stat-label">Total Medidores</span>
          </div>
        </div>
      </div>

      <div className="dashboard-widget__footer">
        <Link to="/admin/lecturas" className="dashboard-widget__link">
          Gestionar lecturas &rarr;
        </Link>
      </div>
    </div>
  )
}

export default ReadingProgressWidget
