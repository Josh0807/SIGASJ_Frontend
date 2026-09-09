import { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import ActividadRegistroFormShell from '../components/ActividadRegistroFormShell'
import ActivityFeedback from '../components/ActivityFeedback'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { useTiposActividadFontanero } from '../hooks/useTiposActividadFontanero'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { useAuth } from '../../auth/components/AuthContext'

const RegistrarActividadPage = () => {
  const { tipoCodigo } = useParams<{ tipoCodigo: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const catalogo = useTiposActividadFontanero()
  const tipo = catalogo.tipos.find((item) => item.codigo === tipoCodigo)

  useEffect(() => {
    if (catalogo.isUnauthorized) {
      logout()
      navigate('/login', { replace: true })
    }
  }, [catalogo.isUnauthorized, logout, navigate])

  if (catalogo.isLoading) return <p role="status">Cargando tipo de actividad…</p>
  if (catalogo.isUnauthorized) {
    return (
      <ActivityFeedback
        variant="warning"
        message={ACTIVITY_FEEDBACK_MESSAGES.unauthorized}
      />
    )
  }
  if (catalogo.isForbidden) {
    return (
      <ActivityFeedback
        variant="error"
        message={ACTIVITY_FEEDBACK_MESSAGES.forbidden}
      />
    )
  }
  if (catalogo.isError) {
    return (
      <ActivityFeedback
        variant="error"
        message={ACTIVITY_FEEDBACK_MESSAGES.loadGeneric}
        action={
          <button
            type="button"
            className="activity-feedback__retry"
            onClick={catalogo.refetch}
          >
            Reintentar
          </button>
        }
      />
    )
  }

  if (!tipo) {
    return <Navigate to={ACTIVIDADES_FONTANERO_PATHS.nueva} replace />
  }

  return <ActividadRegistroFormShell tipo={tipo} onCatalogStale={catalogo.refetch} />
}

export default RegistrarActividadPage
