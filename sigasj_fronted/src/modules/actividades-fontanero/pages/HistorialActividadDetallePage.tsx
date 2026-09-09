import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { getActividadDetalle } from '../services/actividadesFontaneroApi'
import { isHistorialEstado } from '../types/actividadHistorial'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { listDatosEspecificosDetalle } from '../utils/formatDatosEspecificosDetalle'
import { formatActividadEstado } from '../utils/formatActividadEstado'
import { formatActividadFecha } from '../utils/formatActividadFecha'
import { getHttpErrorStatus } from '../utils/httpErrorStatus'

const observacionCorreccionLabel = (estado: string): string => {
  if (estado === 'RECHAZADA') {
    return 'Motivo de rechazo'
  }
  if (estado === 'CORREGIDA') {
    return 'Observación de corrección'
  }
  return 'Observación'
}

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

  const datosEspecificos = useMemo(
    () => listDatosEspecificosDetalle(actividad?.datosEspecificos),
    [actividad?.datosEspecificos],
  )

  useEffect(() => {
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
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

      {actividad ? (
        <article className="actividades-fontanero-historial-detalle__panel">
          <div className="actividades-fontanero-historial-detalle__title-row">
            <div>
              <p className="actividades-fontanero-historial-detalle__tipo">
                {actividad.tipoActividadNombre}
              </p>
              <h2>{actividad.titulo}</h2>
            </div>
            <span
              className="actividades-fontanero-historial-detalle__estado"
              data-estado={actividad.estado}
            >
              {formatActividadEstado(actividad.estado)}
            </span>
          </div>

          <dl className="actividades-fontanero-historial-detalle__meta">
            <div>
              <dt>Fecha de actividad</dt>
              <dd>{formatActividadFecha(actividad.fechaActividad)}</dd>
            </div>
            <div>
              <dt>Registro</dt>
              <dd>#{actividad.id}</dd>
            </div>
            <div>
              <dt>Ubicación</dt>
              <dd>{actividad.ubicacion ?? '—'}</dd>
            </div>
            <div>
              <dt>Actualización</dt>
              <dd>{formatActividadFecha(actividad.updatedAt.slice(0, 10))}</dd>
            </div>
          </dl>

          {actividad.descripcion ? (
            <div className="actividades-fontanero-historial-detalle__block">
              <h3>Descripción</h3>
              <p>{actividad.descripcion}</p>
            </div>
          ) : null}

          {actividad.observaciones ? (
            <div className="actividades-fontanero-historial-detalle__block">
              <h3>Observaciones</h3>
              <p>{actividad.observaciones}</p>
            </div>
          ) : null}

          {datosEspecificos.length > 0 ? (
            <div className="actividades-fontanero-historial-detalle__block">
              <h3>Datos específicos</h3>
              <dl className="actividades-fontanero-historial-detalle__meta">
                {datosEspecificos.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {actividad.observacionCorreccion ? (
            <div className="actividades-fontanero-historial-detalle__block">
              <h3>{observacionCorreccionLabel(actividad.estado)}</h3>
              <p>{actividad.observacionCorreccion}</p>
            </div>
          ) : null}
        </article>
      ) : null}

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
