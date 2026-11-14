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

const modernCardClasses = 'group !relative !min-h-[118px] !overflow-hidden !rounded-[22px] !border-[#d7e5f1] !bg-white/95 !p-5 !shadow-[0_10px_28px_rgba(30, 90, 156,0.08)] !transition-all !duration-300 !ease-out hover:!-translate-y-1.5 hover:!border-[#1e5a9c] hover:!shadow-[0_16px_36px_rgba(30, 90, 156,0.14)] active:!translate-y-0 active:!scale-[0.99] focus-visible:!outline-2 focus-visible:!outline-offset-4 focus-visible:!outline-[#1e5a9c] motion-reduce:!transform-none motion-reduce:!transition-none [&_.quick-access-card__icon]:!size-14 [&_.quick-access-card__icon]:!rounded-[18px] [&_.quick-access-card__icon]:!border [&_.quick-access-card__icon]:!border-white/70 [&_.quick-access-card__icon]:!text-white [&_.quick-access-card__icon]:!shadow-[0_10px_22px_rgba(30, 90, 156,0.28),inset_0_1px_0_rgba(255,255,255,0.35)] [&_.quick-access-card__icon]:!transition-all [&_.quick-access-card__icon]:!duration-300 hover:[&_.quick-access-card__icon]:!-rotate-3 hover:[&_.quick-access-card__icon]:!scale-110 hover:[&_.quick-access-card__icon]:!shadow-[0_14px_28px_rgba(30, 90, 156,0.34)] [&_.quick-access-card__title]:!text-base [&_.quick-access-card__title]:!font-extrabold [&_.quick-access-card__title]:!text-[#1e5a9c] [&_.quick-access-card__description]:!mt-1 [&_.quick-access-card__description]:!text-sm [&_.quick-access-card__description]:!leading-6 [&_.quick-access-card__description]:!text-[#5b7390] [&_.quick-access-card__arrow]:!grid [&_.quick-access-card__arrow]:!size-10 [&_.quick-access-card__arrow]:!place-items-center [&_.quick-access-card__arrow]:!rounded-full [&_.quick-access-card__arrow]:!bg-[#eaf6ff] [&_.quick-access-card__arrow]:!text-lg [&_.quick-access-card__arrow]:!font-black [&_.quick-access-card__arrow]:!text-[#1e5a9c] [&_.quick-access-card__arrow]:!shadow-inner [&_.quick-access-card__arrow]:!transition-all [&_.quick-access-card__arrow]:!duration-300 hover:[&_.quick-access-card__arrow]:!translate-x-1 hover:[&_.quick-access-card__arrow]:!bg-[#1e5a9c] hover:[&_.quick-access-card__arrow]:!text-white hover:[&_.quick-access-card__arrow]:!shadow-[0_8px_18px_rgba(30, 90, 156,0.28)]'
const modernPrimaryCardClasses = '!border-[#bfe3fa] !bg-linear-to-br !from-[#eaf6ff]/90 !via-white !to-[#bfe3fa]/40'
const blueIconClasses = '[&_.quick-access-card__icon]:!bg-linear-to-br [&_.quick-access-card__icon]:!from-[#1e5a9c] [&_.quick-access-card__icon]:!to-[#1e5a9c]'
const cyanIconClasses = '[&_.quick-access-card__icon]:!bg-linear-to-br [&_.quick-access-card__icon]:!from-[#1e5a9c] [&_.quick-access-card__icon]:!to-[#1e5a9c]'
const indigoIconClasses = '[&_.quick-access-card__icon]:!bg-linear-to-br [&_.quick-access-card__icon]:!from-[#123f70] [&_.quick-access-card__icon]:!to-[#1e5a9c]'
const violetIconClasses = '[&_.quick-access-card__icon]:!bg-linear-to-br [&_.quick-access-card__icon]:!from-[#1e5a9c] [&_.quick-access-card__icon]:!to-[#1e5a9c]'
const tealIconClasses = '[&_.quick-access-card__icon]:!bg-linear-to-br [&_.quick-access-card__icon]:!from-[#236c51] [&_.quick-access-card__icon]:!to-[#1e5a9c]'
const amberIconClasses = '[&_.quick-access-card__icon]:!bg-linear-to-br [&_.quick-access-card__icon]:!from-[#b45309] [&_.quick-access-card__icon]:!to-[#1e5a9c]'

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
      className="actividades-fontanero-home !max-w-6xl !gap-6"
      aria-labelledby="actividades-fontanero-title"
    >
      <header className="actividades-fontanero-home__welcome !rounded-[26px] !border-[#d7e5f1] !bg-linear-to-br !from-white !via-white !to-[#eaf6ff]/70 !p-8 !shadow-[0_16px_42px_rgba(15,63,110,0.1)]">
        <div className="actividades-fontanero-home__welcome-content">
          <span className="actividades-fontanero-home__eyebrow !text-sm !font-extrabold !tracking-[0.12em] !text-[#1e5a9c]">
            Módulo operativo · Fontanero
          </span>
          <h1 className="!text-4xl !font-black !tracking-[-0.025em] !text-[#1e5a9c]" id="actividades-fontanero-title">Registro de Actividades</h1>
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
          className="actividades-fontanero-home__back-link !inline-flex !min-h-11 !items-center !rounded-xl !border !border-[#bfe3fa] !bg-white !px-4 !font-extrabold !text-[#1e5a9c] !shadow-sm !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-blue-400 hover:!bg-[#eaf6ff] hover:!no-underline hover:!shadow-md active:!translate-y-0"
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
          className="actividades-fontanero-home__corrections-status !rounded-2xl !border-emerald-200 !bg-linear-to-r !from-emerald-50 !to-teal-50 !px-5 !py-3 !font-bold !text-emerald-700 !shadow-[0_6px_18px_rgba(16,185,129,0.08)]"
          role="status"
          data-testid="correcciones-vacias"
        >
          Sin correcciones pendientes por ahora.
        </p>
      )}

      <div
        className="actividades-fontanero-home__actions !gap-5"
        role="list"
        aria-label="Funciones del módulo de actividades"
      >
        <div role="listitem">
          <QuickAccessCard
            title="Solicitar materiales"
            description="Prepare una solicitud para bodega sin modificar las existencias."
            path={SOLICITUD_MATERIALES_NEW_PATH}
            icon={<AdminNavIcon name="inventario" />}
            className={`actividades-fontanero-home__card actividades-fontanero-home__card--primary ${modernCardClasses} ${modernPrimaryCardClasses} ${blueIconClasses}`}
          />
        </div>

        <div role="listitem">
          <QuickAccessCard
            title="Mis solicitudes de materiales"
            description="Consulte el estado y detalle de sus solicitudes a bodega."
            path={SOLICITUDES_MATERIALES_PATH}
            icon={<AdminNavIcon name="solicitudes" />}
            className={`actividades-fontanero-home__card ${modernCardClasses} ${cyanIconClasses}`}
          />
        </div>

        <div role="listitem">
          <QuickAccessCard
            title="Dashboard de actividades"
            description="Resumen por estado y accesos rápidos del módulo."
            path={ACTIVIDADES_FONTANERO_PATHS.dashboard}
            icon={<AdminNavIcon name="dashboard" />}
            className={`actividades-fontanero-home__card actividades-fontanero-home__card--primary ${modernCardClasses} ${modernPrimaryCardClasses} ${indigoIconClasses}`}
          />
        </div>

        <div role="listitem">
          <QuickAccessCard
            title="Registrar actividad realizada"
            description="Seleccione el tipo de actividad y complete el registro."
            path={ACTIVIDADES_FONTANERO_PATHS.nueva}
            icon={<AdminNavIcon name="actividades" />}
            className={`actividades-fontanero-home__card actividades-fontanero-home__card--primary ${modernCardClasses} ${modernPrimaryCardClasses} ${violetIconClasses}`}
          />
        </div>

        <div role="listitem">
          <QuickAccessCard
            title="Ver mis actividades"
            description="Consulte las actividades que ha registrado."
            path={ACTIVIDADES_FONTANERO_PATHS.misActividades}
            icon={<AdminNavIcon name="solicitudes" />}
            className={`actividades-fontanero-home__card ${modernCardClasses} ${cyanIconClasses}`}
          />
        </div>

        <div role="listitem">
          <QuickAccessCard
            title="Historial"
            description="Revise actividades anteriores ya finalizadas o revisadas."
            path={ACTIVIDADES_FONTANERO_PATHS.historial}
            icon={<AdminNavIcon name="reportes" />}
            className={`actividades-fontanero-home__card ${modernCardClasses} ${tealIconClasses}`}
          />
        </div>

        <div role="listitem">
          <QuickAccessCard
            title="Correcciones pendientes"
            description={correctionsDescription}
            path={ACTIVIDADES_FONTANERO_PATHS.correcciones}
            icon={<AdminNavIcon name="averias" />}
            badgeText={correctionsBadge}
            className={`actividades-fontanero-home__card ${modernCardClasses} ${amberIconClasses}`}
          />
        </div>
      </div>
    </section>
  )
}

export default ActividadesFontaneroHomePage
