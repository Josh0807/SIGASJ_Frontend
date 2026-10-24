import type { ReactNode } from 'react'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { formatActividadEstado } from '../utils/formatActividadEstado'
import { formatPeriodoActividadPartes } from '../utils/formatActividadFecha'

export type HistorialActividadCardProps = {
  actividad: ActividadFontaneroRegistrada
  onVerDetalle: () => void
  extraFooter?: ReactNode
}

const HistorialActividadCard = ({
  actividad,
  onVerDetalle,
  extraFooter,
}: HistorialActividadCardProps) => {
  const horario = formatPeriodoActividadPartes(actividad)

  return (
    <article
      className="actividad-historial-card actividad-historial-card--simple"
      aria-labelledby={`historial-actividad-${actividad.id}-titulo`}
    >
      <header className="actividad-historial-card__header">
        <div className="actividad-historial-card__heading">
          <p className="actividad-historial-card__tipo">{actividad.tipoActividadNombre}</p>
          <h2
            id={`historial-actividad-${actividad.id}-titulo`}
            className="actividad-historial-card__titulo"
          >
            {actividad.titulo}
          </h2>
        </div>
        <span
          className="actividad-historial-card__estado"
          data-estado={actividad.estado}
        >
          {formatActividadEstado(actividad.estado)}
        </span>
      </header>

      <dl className="actividad-historial-card__meta actividad-historial-card__meta--compact">
        <div className="actividad-historial-card__meta-item">
          <div className="actividad-historial-card__fecha-hora">
            <div className="actividad-historial-card__fecha-hora-col">
              <span className="actividad-historial-card__fecha-hora-label">Fecha</span>
              <span className="actividad-historial-card__fecha-hora-valor">{horario.fecha}</span>
            </div>
            <div className="actividad-historial-card__fecha-hora-col actividad-historial-card__fecha-hora-col--hora">
              <span className="actividad-historial-card__fecha-hora-label">Hora</span>
              <span className="actividad-historial-card__fecha-hora-valor actividad-historial-card__fecha-hora-valor--hora">
                {horario.hora}
              </span>
            </div>
          </div>
        </div>
      </dl>

      <footer className="actividad-historial-card__footer">
        {extraFooter}
        <button
          type="button"
          className="actividad-historial-card__action"
          data-testid={`ver-historial-actividad-${actividad.id}`}
          onClick={onVerDetalle}
        >
          Ver detalle
        </button>
      </footer>
    </article>
  )
}

export default HistorialActividadCard
