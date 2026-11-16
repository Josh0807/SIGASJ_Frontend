import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconArrowRight } from '@tabler/icons-react'
import AdminNavIcon from '../../admin-panel/components/AdminNavIcon'
import { useAuth } from '../../auth/components/AuthContext'
import {
  getAuthUserRoleLabel,
  resolveAuthUserDisplayName,
} from '../../auth/utils/authUserDisplay'
import {
  SOLICITUD_MATERIALES_NEW_PATH,
  SOLICITUDES_MATERIALES_PATH,
} from '../../inventario/inventarioPaths'
import { AdminShell, Alert, Card, PageHeader } from '../../../shared/ui'
import ActivityFeedback from '../components/ActivityFeedback'
import { useCorreccionesPendientesCount } from '../hooks/useCorreccionesPendientesCount'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'

type RegistrationNoticeState = {
  actividadRegistrada?: boolean
  tituloActividad?: string
} | null

type HomeLink = {
  title: string
  description: string
  path: string
  icon: 'inventario' | 'solicitudes' | 'dashboard' | 'actividades' | 'reportes' | 'averias'
  badge?: string
  primary?: boolean
}

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
    if (!state?.actividadRegistrada) return
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  if (!isAuthenticated || !user) {
    return (
      <AdminShell>
        <Alert tone="warning">
          No hay una sesión activa.{' '}
          <Link to="/login" className="font-semibold text-sigasj-primary">
            Ir al inicio de sesión
          </Link>
        </Alert>
      </AdminShell>
    )
  }

  const hasPendingCorrections = typeof count === 'number' && count > 0
  const correctionsDescription = isLoading
    ? 'Consultando actividades pendientes…'
    : hasPendingCorrections
      ? 'Revise y reenvíe las actividades que requieren ajuste.'
      : 'No tiene actividades pendientes de corrección.'

  const links: HomeLink[] = [
    {
      title: 'Registrar actividad',
      description: 'Elija el tipo y complete el registro de campo.',
      path: ACTIVIDADES_FONTANERO_PATHS.nueva,
      icon: 'actividades',
      primary: true,
    },
    {
      title: 'Dashboard de actividades',
      description: 'Resumen por estado y accesos rápidos.',
      path: ACTIVIDADES_FONTANERO_PATHS.dashboard,
      icon: 'dashboard',
    },
    {
      title: 'Mis actividades',
      description: 'Consulte lo que ya registró.',
      path: ACTIVIDADES_FONTANERO_PATHS.misActividades,
      icon: 'solicitudes',
    },
    {
      title: 'Historial',
      description: 'Actividades finalizadas o revisadas.',
      path: ACTIVIDADES_FONTANERO_PATHS.historial,
      icon: 'reportes',
    },
    {
      title: 'Correcciones pendientes',
      description: correctionsDescription,
      path: ACTIVIDADES_FONTANERO_PATHS.correcciones,
      icon: 'averias',
      badge:
        hasPendingCorrections && count !== null ? String(count) : undefined,
    },
    {
      title: 'Solicitar materiales',
      description: 'Pida insumos a bodega sin alterar existencias.',
      path: SOLICITUD_MATERIALES_NEW_PATH,
      icon: 'inventario',
    },
    {
      title: 'Mis solicitudes de materiales',
      description: 'Estado y detalle de pedidos a bodega.',
      path: SOLICITUDES_MATERIALES_PATH,
      icon: 'solicitudes',
    },
  ]

  return (
    <AdminShell aria-labelledby="actividades-fontanero-title">
      <PageHeader
        id="actividades-fontanero-title"
        title="Actividades"
        description={
          <>
            Hola, <strong>{displayName}</strong>
            {roleLabel ? <> ({roleLabel})</> : null}. Elija una opción para
            continuar.
          </>
        }
      />

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

      {!isLoading && !isError && !hasPendingCorrections ? (
        <p
          className="m-0 rounded-[13px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
          role="status"
          data-testid="correcciones-vacias"
        >
          Sin correcciones pendientes por ahora.
        </p>
      ) : null}

      <div
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        role="list"
        aria-label="Funciones del módulo de actividades"
      >
        {links.map((item) => (
          <Card
            key={item.path}
            as="article"
            lift
            interactive
            role="listitem"
            className="min-w-0"
          >
            <Link
              to={item.path}
              className="flex h-full min-h-[7.5rem] flex-col gap-3 p-4 text-inherit no-underline"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
                  <AdminNavIcon name={item.icon} />
                </span>
                <span className="grid size-9 place-items-center rounded-full bg-sigasj-surface-soft text-sigasj-primary">
                  <IconArrowRight size={18} aria-hidden="true" />
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="public-card-title m-0 flex flex-wrap items-center gap-2 text-[1.05rem]">
                  {item.title}
                  {item.badge ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                      {item.badge}
                    </span>
                  ) : null}
                </h2>
                <p className="public-card-text m-0 mt-1.5">{item.description}</p>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </AdminShell>
  )
}

export default ActividadesFontaneroHomePage
