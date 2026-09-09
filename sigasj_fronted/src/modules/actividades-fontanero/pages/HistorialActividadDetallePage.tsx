import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import ActivityFeedback from '../components/ActivityFeedback'
import DetalleActividad from '../components/DetalleActividad'
import { getActividadDetalle } from '../services/actividadesFontaneroApi'
import { isHistorialEstado } from '../types/actividadHistorial'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { ACTIVITY_FEEDBACK_MESSAGES } from '../utils/activityFeedbackMessages'
import { getHttpErrorStatus } from '../utils/httpErrorStatus'

const HistorialActividadDetallePage = () => {
  const { actividadId } = useParams<{ actividadId: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [actividad, setActividad] = useState<ActividadFontaneroRegistrada | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<
    'not-found' | 'error' | 'forbidden' | 'invalid-state' | null
  >(null)

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

        if (!isHistorialEstado(detalle.estado)) {
          setLoadError('invalid-state')
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
  }, [isInvalidId, logout, navigate, parsedId])

  const resolvedLoadError = isInvalidId ? 'not-found' : loadError
  const resolvedLoading = isInvalidId ? false : isLoading

  return (
    <section
      className="actividades-fontanero-historial-detalle"
      aria-labelledby="historial-detalle-title"
    >
      <header className="actividades-fontanero-historial-detalle__header">
        <p className="actividades-fontanero-historial-detalle__eyebrow">
          Historial de actividades
        </p>
        <h1 id="historial-detalle-title">Detalle de actividad</h1>
      </header>

      {resolvedLoading ? (
        <p className="actividades-fontanero-historial-detalle__state" role="status">
          Cargando detalle…
        </p>
      ) : null}

      {!resolvedLoading && resolvedLoadError === 'not-found' ? (
        <ActivityFeedback
          variant="warning"
          message={ACTIVITY_FEEDBACK_MESSAGES.notFound}
        />
      ) : null}

      {!resolvedLoading && resolvedLoadError === 'forbidden' ? (
        <ActivityFeedback
          variant="error"
          message={ACTIVITY_FEEDBACK_MESSAGES.forbidden}
        />
      ) : null}

      {!resolvedLoading && resolvedLoadError === 'invalid-state' ? (
        <ActivityFeedback
          variant="warning"
          message="Esta actividad aún no forma parte del historial consultable."
        />
      ) : null}

      {!resolvedLoading && resolvedLoadError === 'error' ? (
        <ActivityFeedback
          variant="error"
          message={ACTIVITY_FEEDBACK_MESSAGES.loadGeneric}
        />
      ) : null}

      {actividad ? <DetalleActividad actividad={actividad} /> : null}

      <Link
        to={ACTIVIDADES_FONTANERO_PATHS.historial}
        className="actividades-fontanero-historial-detalle__back"
      >
        Volver al historial
      </Link>
    </section>
  )
}

export default HistorialActividadDetallePage
