import React, { useCallback, useEffect, useState } from 'react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import { Link } from 'react-router-dom'
import AdminNavIcon from '../../admin-panel/components/AdminNavIcon'
import { useAuth } from '../../auth/components/AuthContext'
import { canAccessAdminRoute } from '../../auth/utils/adminNavigation'
import { ACTIVIDADES_FONTANERO_BASE_PATH } from '../../actividades-fontanero/actividadesFontaneroPaths'
import { ACTIVIDADES_ADMIN_BASE_PATH } from '../../actividades-fontanero/admin/actividadesAdminPaths'
import type { ActivityItem, RecentActivityWidgetProps } from '../props'
import { getRecentDashboardActivities } from '../services/dashboardService'

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  activities: activitiesProp,
}) => {
  const { user } = useAuth()
  const canOpenAdminActividades = canAccessAdminRoute(user, '/admin/actividades-fontanero')
  const canOpenFontaneroActividades = canAccessAdminRoute(user, '/admin/actividades')
  const canOpenAverias = canAccessAdminRoute(user, '/admin/averias')
  const [activities, setActivities] = useState<ActivityItem[]>(activitiesProp ?? [])
  const [isLoading, setIsLoading] = useState(activitiesProp === undefined)
  const [isError, setIsError] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  const loadActivities = useCallback(() => {
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    const cancelScheduled = runAfterEffect(() => {
      if (activitiesProp !== undefined) {
        setActivities(activitiesProp)
        setIsLoading(false)
        setIsError(false)
        return
      }

      setIsLoading(true)
      setIsError(false)

      const scope = canOpenAdminActividades
        ? 'admin'
        : canOpenFontaneroActividades
          ? 'fontanero'
          : canOpenAverias
            ? 'admin'
            : null

      if (scope === null) {
        setActivities([])
        setIsLoading(false)
        setIsError(false)
        return
      }

      void getRecentDashboardActivities(scope)
        .then((items) => {
          if (!cancelled) {
            setActivities(items)
            setIsError(false)
          }
        })
        .catch(() => {
          if (!cancelled) {
            setActivities([])
            setIsError(true)
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false)
          }
        })
    })

    return () => {
      cancelled = true
      cancelScheduled()
    }
  }, [
    activitiesProp,
    canOpenAdminActividades,
    canOpenFontaneroActividades,
    canOpenAverias,
    reloadToken,
  ])

  const footerPath = canOpenAdminActividades
    ? ACTIVIDADES_ADMIN_BASE_PATH
    : canOpenFontaneroActividades
      ? ACTIVIDADES_FONTANERO_BASE_PATH
      : canOpenAverias
        ? '/admin/averias'
        : null

  const hasActivityAccess =
    canOpenAdminActividades || canOpenFontaneroActividades || canOpenAverias

  const footerLabel =
    canOpenAdminActividades || canOpenFontaneroActividades
      ? 'Ver bitácora completa →'
      : 'Ver averías →'

  return (
    <div className="dashboard-widget recent-activity-widget">
      <div className="dashboard-widget__header">
        <div className="dashboard-widget__title-group">
          <span
            className="dashboard-widget__icon dashboard-widget__icon--activity"
            aria-hidden="true"
          >
            <AdminNavIcon name="reportes" />
          </span>
          <div>
            <h3 className="dashboard-widget__title">Actividad reciente</h3>
          </div>
        </div>
        {!isLoading && activities.length > 0 ? (
          <span className="recent-activity-widget__count" aria-live="polite">
            {activities.length} eventos
          </span>
        ) : null}
      </div>

      <div className="recent-activity-widget__body">
        {isLoading ? (
          <p className="recent-activity-widget__empty" role="status">
            Cargando actividad…
          </p>
        ) : isError ? (
          <div className="dashboard-widget__error" role="alert">
            <span>No se pudo cargar la actividad reciente.</span>
            <button type="button" onClick={loadActivities}>
              Reintentar
            </button>
          </div>
        ) : !hasActivityAccess ? (
          <p className="recent-activity-widget__empty">
            No hay bitácora disponible para su rol.
          </p>
        ) : activities.length === 0 ? (
          <div className="recent-activity-widget__empty recent-activity-widget__empty--rich">
            <p className="recent-activity-widget__empty-title">Sin eventos todavía</p>
            <p className="recent-activity-widget__empty-copy">
              Aquí verá reportes, notificaciones y registros de la bitácora.
            </p>
          </div>
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
            {footerLabel}
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export default RecentActivityWidget
