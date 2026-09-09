import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ActividadRegistroFormShell from '../components/ActividadRegistroFormShell'
import ActivityFeedback from '../components/ActivityFeedback'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { useTiposActividadFontanero } from '../hooks/useTiposActividadFontanero'
import {
  corregirActividad,
  getActividadDetalle,
} from '../services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { actividadToFormValues } from '../utils/actividadCorreccionMapper'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { getHttpErrorStatus } from '../utils/httpErrorStatus'
import { useAuth } from '../../auth/components/AuthContext'

const CorregirActividadPage = () => {
  const { actividadId } = useParams<{ actividadId: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const catalogo = useTiposActividadFontanero()
  const [actividad, setActividad] = useState<ActividadFontaneroRegistrada | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<'not-found' | 'error' | 'forbidden' | null>(
    null,
  )

  const parsedId = Number(actividadId)
  const isInvalidId = !Number.isInteger(parsedId) || parsedId <= 0

  useEffect(() => {
    if (isInvalidId) {
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        const detalle = await getActividadDetalle(parsedId)
        if (cancelled) {
          return
        }

        if (detalle.estado !== 'REQUIERE_CORRECCION') {
          setLoadError('forbidden')
          setActividad(null)
          return
        }

        setActividad(detalle)
      } catch (error) {
        if (cancelled) {
          return
        }
        const status = getHttpErrorStatus(error)
        if (status === 401) {
          logout()
          navigate('/login', { replace: true })
          return
        }
        if (status === 403 || status === 404) {
          setLoadError(status === 404 ? 'not-found' : 'forbidden')
        } else {
          setLoadError('error')
        }
        setActividad(null)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [isInvalidId, parsedId, logout, navigate])

  if (isInvalidId) {
    return <Navigate to={ACTIVIDADES_FONTANERO_PATHS.correcciones} replace />
  }

  if (isLoading || catalogo.isLoading) {
    return (
      <section className="actividades-fontanero-correcciones" aria-live="polite">
        <p role="status">Cargando actividad para corrección…</p>
      </section>
    )
  }

  if (loadError === 'not-found') {
    return <Navigate to={ACTIVIDADES_FONTANERO_PATHS.correcciones} replace />
  }

  if (loadError === 'forbidden') {
    return (
      <section className="actividades-fontanero-correcciones" aria-live="polite">
        <ActivityFeedback
          variant="error"
          message="Esta actividad no está disponible para corrección."
        />
        <Link
          to={ACTIVIDADES_FONTANERO_PATHS.correcciones}
          className="actividades-fontanero-correcciones__back"
        >
          Volver a correcciones pendientes
        </Link>
      </section>
    )
  }

  if (loadError === 'error' || !actividad) {
    return (
      <section className="actividades-fontanero-correcciones" aria-live="polite">
        <ActivityFeedback
          variant="error"
          message={ACTIVITY_FEEDBACK_MESSAGES.loadGeneric}
        />
        <Link
          to={ACTIVIDADES_FONTANERO_PATHS.correcciones}
          className="actividades-fontanero-correcciones__back"
        >
          Volver a correcciones pendientes
        </Link>
      </section>
    )
  }

  const tipo = catalogo.tipos.find((item) => item.id === actividad.tipoActividadId)

  if (!tipo) {
    return (
      <section className="actividades-fontanero-correcciones" aria-live="polite">
        <ActivityFeedback
          variant="warning"
          message="No se encontró el tipo de actividad asociado."
          action={
            <button
              type="button"
              className="activity-feedback__retry"
              onClick={catalogo.refetch}
            >
              Reintentar catálogo
            </button>
          }
        />
      </section>
    )
  }

  return (
    <ActividadRegistroFormShell
      key={actividad.id}
      mode="corregir"
      tipo={tipo}
      initialValues={actividadToFormValues(actividad)}
      observacionCorreccion={actividad.observacionCorreccion}
      onSubmit={(values) => corregirActividad(actividad.id, tipo, values)}
      onCatalogStale={catalogo.refetch}
    />
  )
}

export default CorregirActividadPage
