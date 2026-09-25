import { useEffect } from 'react'
import { useAdminAveriaEventosHistorial } from '../hooks/useAdminAveriaEventosHistorial'
import {
  etiquetaTipoEvento,
  formatFechaHoraEvento,
  textoEstadoEvento,
  textoReferenciaEvento,
  textoResponsableEvento,
} from './averiasEventoHistorial'
import {
  AVERIAS_EVENTOS_EMPTY_MESSAGE,
  AVERIAS_EVENTOS_LOADING_MESSAGE,
} from './types'

type AveriasAdminEventosHistorialProps = {
  averiaId: number
  onUnauthorized?: () => void
  onForbidden?: () => void
}

const AveriasAdminEventosHistorial = ({
  averiaId,
  onUnauthorized,
  onForbidden,
}: AveriasAdminEventosHistorialProps) => {
  const historial = useAdminAveriaEventosHistorial(averiaId)

  useEffect(() => {
    if (historial.unauthorized) {
      onUnauthorized?.()
    }
  }, [historial.unauthorized, onUnauthorized])

  useEffect(() => {
    if (historial.forbidden) {
      onForbidden?.()
    }
  }, [historial.forbidden, onForbidden])

  return (
    <section
      className="averias-admin__section averias-evento"
      aria-labelledby="averia-historial-heading"
      aria-busy={historial.loading || undefined}
    >
      <h2 id="averia-historial-heading">Historial de la avería</h2>
      {historial.loading ? (
        <div role="status" aria-live="polite">
          <span className="visually-hidden">{AVERIAS_EVENTOS_LOADING_MESSAGE}</span>
          <div className="gallery-admin__skeleton" aria-hidden="true">
            <div className="gallery-admin__skeleton-row">
              <span className="indicator-card__skeleton" />
              <span className="indicator-card__skeleton" />
            </div>
            <div className="gallery-admin__skeleton-row">
              <span className="indicator-card__skeleton" />
              <span className="indicator-card__skeleton" />
            </div>
          </div>
        </div>
      ) : null}
      {historial.error ? (
        <div className="gallery-admin__empty" role="alert">
          <p>{historial.error}</p>
          <button type="button" onClick={historial.refetch}>
            Reintentar
          </button>
        </div>
      ) : null}
      {!historial.loading && !historial.error && historial.eventos.length === 0 ? (
        <p className="averias-admin__prewrap" role="status">
          {AVERIAS_EVENTOS_EMPTY_MESSAGE}
        </p>
      ) : null}
      {!historial.loading && !historial.error && historial.eventos.length > 0 ? (
        <ol className="averias-evento__lista">
          {historial.eventos.map((evento) => {
            const estado = textoEstadoEvento(evento)
            const responsable = textoResponsableEvento(evento)
            const referencia = textoReferenciaEvento(evento)
            return (
              <li key={evento.id} className="averias-evento__item">
                <p className="averias-evento__marca" aria-hidden="true">
                  <span className="averias-evento__punto" />
                </p>
                <div className="averias-evento__cuerpo">
                  <p className="averias-evento__fecha">
                    <time dateTime={evento.fechaHora}>
                      {formatFechaHoraEvento(evento.fechaHora)}
                    </time>
                  </p>
                  <p className="averias-evento__tipo">
                    {etiquetaTipoEvento(evento.tipoEvento)}
                  </p>
                  <p className="averias-evento__descripcion">{evento.descripcion}</p>
                  {estado ? <p className="averias-evento__detalle">{estado}</p> : null}
                  {responsable ? (
                    <p className="averias-evento__detalle">{responsable}</p>
                  ) : null}
                  {referencia ? (
                    <p className="averias-evento__detalle">{referencia}</p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      ) : null}
    </section>
  )
}

export default AveriasAdminEventosHistorial
