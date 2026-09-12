import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AdminNavIcon from '../../admin-panel/components/AdminNavIcon'
import QuickAccessCard from '../../../shared/components/QuickAccessCard'
import { useAuth } from '../../auth/components/AuthContext'
import {
  getAuthUserRoleLabel,
  resolveAuthUserDisplayName,
} from '../../auth/utils/authUserDisplay'
import { ADMIN_BASE_PATH } from '../../../app/router/adminPaths'
import ActivityFeedback from '../components/ActivityFeedback'
import { useCorreccionesPendientesCount } from '../hooks/useCorreccionesPendientesCount'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { SOLICITUD_MATERIALES_NEW_PATH, SOLICITUDES_MATERIALES_PATH } from '../../inventario/inventarioPaths'

const DASHBOARD_PATH = `${ADMIN_BASE_PATH}/dashboard`

type RegistrationNoticeState = {
  actividadRegistrada?: boolean
  tituloActividad?: string
} | null

const buildRegistrationSuccessMessage = (title?: string) =>
  title
    ? `${ACTIVITY_FEEDBACK_MESSAGES.successRegister.replace(/\.$/, '')}: ${title}.`
    : ACTIVITY_FEEDBACK_MESSAGES.successRegister

const ActividadesFontaneroHomePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()
  const [successNotice] = useState(() => {
    const state = location.state as RegistrationNoticeState
    return state?.actividadRegistrada
      ? buildRegistrationSuccessMessage(state.tituloActividad)
      : null
  })
  const displayName = resolveAuthUserDisplayName(user)
  const roleLabel = getAuthUserRoleLabel(user)
  const {
    count,
    isLoading,
    isError,
    isUnauthorized,
    isForbidden,
    refetch,
  } = useCorreccionesPendientesCount()

  useEffect(() => {
    const state = location.state as RegistrationNoticeState
    if (!state?.actividadRegistrada) {
      return
    }

    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  if (!isAuthenticated || !user) {
    return (
      <section className="actividades-fontanero-home" aria-live="polite">
        <div className="actividades-fontanero-home__state">
          <p>No hay una sesión activa. Inicie sesión para continuar.</p>
          <Link to="/login" className="actividades-fontanero-home__back-link">
            Ir al inicio de sesión
          </Link>
        </div>
      </section>
    )
  }

  const hasPendingCorrections = typeof count === 'number' && count > 0
  const correctionsDescription = isLoading
    ? 'Consultando actividades pendientes…'
    : hasPendingCorrections
      ? 'Revise y reenvíe las actividades que requieren ajuste.'
      : 'No tiene actividades pendientes de corrección.'

  const correctionsBadge =
    hasPendingCorrections && count !== null ? String(count) : undefined

  return (
    <section
      className="actividades-fontanero-home"
      aria-labelledby="actividades-fontanero-title"
    >
      <header className="actividades-fontanero-home__welcome">
        <div className="actividades-fontanero-home__welcome-content">
          <span className="actividades-fontanero-home__eyebrow">
            Módulo operativo · Fontanero
          </span>
          <h1 id="actividades-fontanero-title">Registro de Actividades</h1>
          <p className="actividades-fontanero-home__welcome-text">
            Hola, <strong data-testid="fontanero-display-name">{displayName}</strong>
            {roleLabel ? (
              <>
                {' '}
                (<span data-testid="fontanero-role-label">{roleLabel}</span>)
              </>
            ) : null}
            . Seleccione una opción para continuar.
          </p>
        </div>
        <Link
          to={DASHBOARD_PATH}
          className="actividades-fontanero-home__back-link"
        >
          Volver al dashboard
        </Link>
      </header>

      {successNotice ? (
        <ActivityFeedback
          variant="success"
          message={successNotice}
          testId="actividad-registrada-exito"
        />
      ) : null}

      {isUnauthorized || isForbidden ? (
        <ActivityFeedback
          variant={isUnauthorized ? 'warning' : 'error'}
          message={
            isUnauthorized
              ? ACTIVITY_FEEDBACK_MESSAGES.unauthorized
              : ACTIVITY_FEEDBACK_MESSAGES.forbidden
          }
        />
      ) : null}

      {isError && !isUnauthorized && !isForbidden ? (
        <ActivityFeedback
          variant="error"
          message={ACTIVITY_FEEDBACK_MESSAGES.loadCorrections}
          action={
            <button
              type="button"
              className="activity-feedback__retry"
              onClick={refetch}
            >
              Reintentar
            </button>
          }
        />
      ) : null}

      {!isLoading && !isError && !hasPendingCorrections && (
        <p
          className="actividades-fontanero-home__corrections-status"
          role="status"
          data-testid="correcciones-vacias"
        >
          Sin correcciones pendientes por ahora.
        </p>
      )}

      <div
        className="actividades-fontanero-home__actions"
        role="list"
        aria-label="Funciones del módulo de actividades"
      >
        <div role="listitem">
          <QuickAccessCard
            title="Solicitar materiales"
            description="Prepare una solicitud para bodega sin modificar las existencias."
            path={SOLICITUD_MATERIALES_NEW_PATH}
            icon={<AdminNavIcon name="inventario" />}
            className="actividades-fontanero-home__card actividades-fontanero-home__card--primary"
          />
        </div>

        <div role="listitem">
          <QuickAccessCard
            title="Mis solicitudes de materiales"
            description="Consulte el estado y detalle de sus solicitudes a bodega."
            path={SOLICITUDES_MATERIALES_PATH}
            icon={<AdminNavIcon name="solicitudes" />}
            className="actividades-fontanero-home__card"
          />
        </div>

        <div role="listitem">
          <QuickAccessCard
            title="Dashboard de actividades"
            description="Resumen por estado y accesos rápidos del módulo."
            path={ACTIVIDADES_FONTANERO_PATHS.dashboard}
            icon={<AdminNavIcon name="dashboard" />}
            className="actividades-fontanero-home__card actividades-fontanero-home__card--primary"
          />
        </div>

        <div role="listitem">
          <QuickAccessCard
            title="Registrar actividad realizada"
            description="Seleccione el tipo de actividad y complete el registro."
            path={ACTIVIDADES_FONTANERO_PATHS.nueva}
            icon={<AdminNavIcon name="actividades" />}
            className="actividades-fontanero-home__card actividades-fontanero-home__card--primary"
          />
        </div>

        <div role="listitem">
          <QuickAccessCard
            title="Ver mis actividades"
            description="Consulte las actividades que ha registrado."
            path={ACTIVIDADES_FONTANERO_PATHS.misActividades}
            icon={<AdminNavIcon name="solicitudes" />}
            className="actividades-fontanero-home__card"
          />
        </div>

        <div role="listitem">
          <QuickAccessCard
            title="Historial"
            description="Revise actividades anteriores ya finalizadas o revisadas."
            path={ACTIVIDADES_FONTANERO_PATHS.historial}
            icon={<AdminNavIcon name="reportes" />}
            className="actividades-fontanero-home__card"
          />
        </div>

        <div role="listitem">
          <QuickAccessCard
            title="Correcciones pendientes"
            description={correctionsDescription}
            path={ACTIVIDADES_FONTANERO_PATHS.correcciones}
            icon={<AdminNavIcon name="averias" />}
            badgeText={correctionsBadge}
            className="actividades-fontanero-home__card"
          />
        </div>
      </div>
    </section>
  )
}

export default ActividadesFontaneroHomePage
