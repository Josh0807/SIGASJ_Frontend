import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import CorreccionPendienteCard from '../components/CorreccionPendienteCard'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { useCorreccionesPendientes } from '../hooks/useCorreccionesPendientes'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { IconArrowLeft, IconChecks, IconRefresh } from '@tabler/icons-react'
import {
  AdminShell,
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from '../../../shared/ui'

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
    <AdminShell
      className="actividades-fontanero-correcciones gap-5 sm:gap-6"
      aria-labelledby="correcciones-pendientes-title"
    >
      <PageHeader
        id="correcciones-pendientes-title"
        eyebrow="Registro de actividades"
        title="Correcciones pendientes"
        description="Revise las actividades que requieren ajuste, lea el motivo indicado y reenvíe la información corregida."
        actions={
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <Button
              to={ACTIVIDADES_FONTANERO_PATHS.home}
              variant="secondary"
              leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
            >
              Menú de actividades
            </Button>
            {!isLoading && !isError && total > 0 ? (
              <p className="m-0 text-sm font-semibold text-sigasj-muted" role="status" data-testid="correcciones-total">
                {total} {total === 1 ? 'actividad pendiente' : 'actividades pendientes'}
              </p>
            ) : null}
          </div>
        }
      />

      {isForbidden ? (
        <Alert tone="danger">{ACTIVITY_FEEDBACK_MESSAGES.forbidden}</Alert>
      ) : null}

      {isError && !isForbidden ? (
        <Alert tone="danger">
          <div className="grid gap-3">
            <p className="m-0 font-semibold">{ACTIVITY_FEEDBACK_MESSAGES.loadGeneric}</p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="justify-self-start"
              leftIcon={<IconRefresh size={16} aria-hidden="true" />}
              onClick={refetch}
            >
              Reintentar
            </Button>
          </div>
        </Alert>
      ) : null}

      <Card as="section" padded className="!gap-4" aria-label="Actividades pendientes de corrección">
        {isLoading ? (
          <Alert tone="info" data-testid="correcciones-cargando">
            Cargando correcciones pendientes…
          </Alert>
        ) : isEmpty ? (
          <EmptyState
            icon={<IconChecks size={28} aria-hidden="true" />}
            title="Sin correcciones pendientes"
            description="Cuando una actividad requiera ajustes, aparecerá aquí con el motivo y la opción para corregirla."
            data-testid="correcciones-lista-vacia"
          />
        ) : !isError && actividades.length > 0 ? (
          <ul className="actividades-fontanero-correcciones__list m-0 grid list-none gap-4 p-0" role="list">
            {actividades.map((actividad) => (
              <li key={actividad.id}>
                <CorreccionPendienteCard actividad={actividad} />
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </AdminShell>
  )
}

export default ActividadesFontaneroCorreccionesPage
