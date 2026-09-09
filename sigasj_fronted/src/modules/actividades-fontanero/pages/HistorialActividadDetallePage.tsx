import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { getActividadDetalle } from '../services/actividadesFontaneroApi'
import { isHistorialEstado } from '../types/actividadHistorial'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import DetalleActividad from '../components/DetalleActividad'
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

  useEffect(() => {
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      // El parámetro de ruta inválido se traduce inmediatamente al estado 404 local.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadError('not-found')
      setIsLoading(false)
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
  }, [logout, navigate, parsedId])

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

      {isLoading ? (
        <p className="actividades-fontanero-historial-detalle__state" role="status">
          Cargando detalle…
        </p>
      ) : null}

      {!isLoading && loadError === 'not-found' ? (
        <div className="actividades-fontanero-historial-detalle__alert" role="alert">
          No se encontró la actividad solicitada.
        </div>
      ) : null}

      {!isLoading && loadError === 'forbidden' ? (
        <div className="actividades-fontanero-historial-detalle__alert" role="alert">
          No tiene permiso para consultar esta actividad.
        </div>
      ) : null}

      {!isLoading && loadError === 'invalid-state' ? (
        <div className="actividades-fontanero-historial-detalle__alert" role="alert">
          Esta actividad aún no forma parte del historial consultable.
        </div>
      ) : null}

      {!isLoading && loadError === 'error' ? (
        <div className="actividades-fontanero-historial-detalle__alert" role="alert">
          No se pudo cargar el detalle de la actividad.
        </div>
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
