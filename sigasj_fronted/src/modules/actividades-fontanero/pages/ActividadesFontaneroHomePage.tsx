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
import { useCorreccionesPendientesCount } from '../hooks/useCorreccionesPendientesCount'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'

const DASHBOARD_PATH = `${ADMIN_BASE_PATH}/dashboard`

type RegistrationNoticeState = {
  actividadRegistrada?: boolean
  tituloActividad?: string
} | null

const buildRegistrationSuccessMessage = (title?: string) =>
  title
    ? `Actividad registrada correctamente: ${title}`
    : 'Actividad registrada correctamente.'

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
        <div
          className="actividades-fontanero-home__success"
          role="status"
          data-testid="actividad-registrada-exito"
        >
          {successNotice}
        </div>
      ) : null}

      {(isUnauthorized || isForbidden) && (
        <div className="actividades-fontanero-home__alert" role="alert">
          {isUnauthorized
            ? 'Su sesión no es válida o ha vencido. Vuelva a iniciar sesión para consultar correcciones.'
            : 'No tiene permiso para consultar correcciones pendientes.'}
        </div>
      )}

      {isError && !isUnauthorized && !isForbidden && (
        <div className="actividades-fontanero-home__alert" role="status">
          No se pudo cargar el indicador de correcciones.{' '}
          <button
            type="button"
            className="actividades-fontanero-home__retry"
            onClick={refetch}
          >
            Reintentar
          </button>
        </div>
      )}

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
