import { Link } from 'react-router-dom'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { formatActividadEstado } from '../utils/formatActividadEstado'
import { formatActividadFecha } from '../utils/formatActividadFecha'

export type HistorialActividadCardProps = {
  actividad: ActividadFontaneroRegistrada
}

const HistorialActividadCard = ({ actividad }: HistorialActividadCardProps) => (
  <article
    className="actividad-historial-card"
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

    <dl className="actividad-historial-card__meta">
      <div className="actividad-historial-card__meta-item">
        <dt>Fecha de actividad</dt>
        <dd>{formatActividadFecha(actividad.fechaActividad)}</dd>
      </div>
      <div className="actividad-historial-card__meta-item">
        <dt>Registro</dt>
        <dd>#{actividad.id}</dd>
      </div>
      {actividad.ubicacion ? (
        <div className="actividad-historial-card__meta-item">
          <dt>Ubicación</dt>
          <dd>{actividad.ubicacion}</dd>
        </div>
      ) : null}
    </dl>

    {actividad.descripcion ? (
      <p className="actividad-historial-card__descripcion">{actividad.descripcion}</p>
    ) : null}

    <footer className="actividad-historial-card__footer">
      <Link
        to={ACTIVIDADES_FONTANERO_PATHS.historialDetalle(actividad.id)}
        className="actividad-historial-card__action"
        data-testid={`ver-historial-actividad-${actividad.id}`}
      >
        Ver detalle
      </Link>
    </footer>
  </article>
)

export default HistorialActividadCard
