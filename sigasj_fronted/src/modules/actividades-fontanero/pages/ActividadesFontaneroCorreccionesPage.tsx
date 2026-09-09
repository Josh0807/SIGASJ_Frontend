import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import ActivityFeedback from '../components/ActivityFeedback'
import CorreccionPendienteCard from '../components/CorreccionPendienteCard'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { useCorreccionesPendientes } from '../hooks/useCorreccionesPendientes'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'

const ActividadesFontaneroCorreccionesPage = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const {
    actividades,
    total,
    isLoading,
    isError,
    isEmpty,
    isUnauthorized,
    isForbidden,
    refetch,
  } = useCorreccionesPendientes()

  useEffect(() => {
    if (isUnauthorized) {
      logout()
      navigate('/login', { replace: true })
    }
  }, [isUnauthorized, logout, navigate])

  return (
    <section
      className="actividades-fontanero-correcciones"
      aria-labelledby="correcciones-pendientes-title"
    >
      <header className="actividades-fontanero-correcciones__header">
        <div>
          <p className="actividades-fontanero-correcciones__eyebrow">
            Registro de Actividades
          </p>
          <h1 id="correcciones-pendientes-title">Correcciones pendientes</h1>
          <p className="actividades-fontanero-correcciones__intro">
            Revise las actividades que requieren ajuste, lea el motivo indicado y
            reenvíe la información corregida.
          </p>
        </div>
        {!isLoading && !isError && total > 0 ? (
          <p
            className="actividades-fontanero-correcciones__count"
            role="status"
            data-testid="correcciones-total"
          >
            {total} {total === 1 ? 'actividad pendiente' : 'actividades pendientes'}
          </p>
        ) : null}
      </header>

      {isLoading ? (
        <div
          className="actividades-fontanero-correcciones__state"
          role="status"
          data-testid="correcciones-cargando"
        >
          <span className="actividades-fontanero-correcciones__spinner" aria-hidden="true" />
          Cargando correcciones pendientes…
        </div>
      ) : null}

      {isForbidden ? (
        <ActivityFeedback
          variant="error"
          message={ACTIVITY_FEEDBACK_MESSAGES.forbidden}
        />
      ) : null}

      {isError && !isForbidden ? (
        <ActivityFeedback
          variant="error"
          message={ACTIVITY_FEEDBACK_MESSAGES.loadGeneric}
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

      {isEmpty ? (
        <div
          className="actividades-fontanero-correcciones__empty"
          role="status"
          data-testid="correcciones-lista-vacia"
        >
          <p className="actividades-fontanero-correcciones__empty-title">
            Sin correcciones pendientes
          </p>
          <p className="actividades-fontanero-correcciones__empty-text">
            Cuando una actividad requiera ajustes, aparecerá aquí con el motivo y la
            opción para corregirla.
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && actividades.length > 0 ? (
        <div
          className="actividades-fontanero-correcciones__list"
          role="list"
          aria-label="Actividades pendientes de corrección"
        >
          {actividades.map((actividad) => (
            <div key={actividad.id} role="listitem">
              <CorreccionPendienteCard actividad={actividad} />
            </div>
          ))}
        </div>
      ) : null}

      <Link
        to={ACTIVIDADES_FONTANERO_PATHS.home}
        className="actividades-fontanero-correcciones__back"
      >
        Volver al menú de actividades
      </Link>
    </section>
  )
}

export default ActividadesFontaneroCorreccionesPage
