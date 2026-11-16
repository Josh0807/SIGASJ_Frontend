import { useEffect, useState } from 'react'
import { Alert, Button } from '../../../shared/ui'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
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
  const [abierto, setAbierto] = useState(false)
  const cantidad = historial.eventos.length
  const conteo =
    historial.loading || historial.error
      ? null
      : cantidad === 1
        ? '1 evento'
        : `${cantidad} eventos`

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

  useEffect(() => {
    if (!historial.error) return undefined
    return runAfterEffect(() => setAbierto(true))
  }, [historial.error])

  return (
    <section
      className="averias-admin__section averias-evento"
      aria-labelledby="averia-historial-heading"
      aria-busy={historial.loading || undefined}
    >
      <details
        className="averias-evento__desplegable"
        open={abierto}
        onToggle={(event) => setAbierto(event.currentTarget.open)}
      >
      <summary className="averias-evento__resumen">
        <h2 id="averia-historial-heading">
          Historial de la avería
          {conteo ? <span className="averias-evento__conteo">{conteo}</span> : null}
        </h2>
      </summary>
      <div className="averias-evento__panel">
      {historial.loading ? (
        <div role="status" aria-live="polite">
          <span className="visually-hidden">{AVERIAS_EVENTOS_LOADING_MESSAGE}</span>
          <div className="mt-1 grid gap-3" aria-hidden="true">
            <div className="h-12 animate-pulse rounded-xl bg-sigasj-surface-soft motion-reduce:animate-none" />
            <div className="h-12 animate-pulse rounded-xl bg-sigasj-surface-soft motion-reduce:animate-none" />
          </div>
        </div>
      ) : null}
      {historial.error ? (
        <Alert tone="danger" role="alert">
          <div className="grid gap-3">
            <p className="m-0 font-semibold">{historial.error}</p>
            <div>
              <Button type="button" variant="secondary" size="sm" onClick={historial.refetch}>
                Reintentar
              </Button>
            </div>
          </div>
        </Alert>
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
                  <div className="averias-evento__cabeza">
                    <p className="averias-evento__fecha">
                      <time dateTime={evento.fechaHora}>
                        {formatFechaHoraEvento(evento.fechaHora)}
                      </time>
                    </p>
                    <p className="averias-evento__tipo">
                      {etiquetaTipoEvento(evento.tipoEvento)}
                    </p>
                  </div>
                  <p className="averias-evento__descripcion">{evento.descripcion}</p>
                  {estado || responsable || referencia ? (
                    <div className="averias-evento__meta">
                      {estado ? <p className="averias-evento__detalle">{estado}</p> : null}
                      {responsable ? (
                        <p className="averias-evento__detalle">{responsable}</p>
                      ) : null}
                      {referencia ? (
                        <p className="averias-evento__detalle">{referencia}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      ) : null}
      </div>
      </details>
    </section>
  )
}

export default AveriasAdminEventosHistorial
