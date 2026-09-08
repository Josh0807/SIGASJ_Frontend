import { Link } from 'react-router-dom'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { formatActividadEstado } from '../utils/formatActividadEstado'
import { formatActividadFecha } from '../utils/formatActividadFecha'

export type CorreccionPendienteCardProps = {
  actividad: ActividadFontaneroRegistrada
}

const CorreccionPendienteCard = ({ actividad }: CorreccionPendienteCardProps) => (
  <article
    className="actividad-correccion-card"
    aria-labelledby={`correccion-actividad-${actividad.id}-titulo`}
  >
    <header className="actividad-correccion-card__header">
      <div className="actividad-correccion-card__heading">
        <p className="actividad-correccion-card__tipo">{actividad.tipoActividadNombre}</p>
        <h2
          id={`correccion-actividad-${actividad.id}-titulo`}
          className="actividad-correccion-card__titulo"
        >
          {actividad.titulo}
        </h2>
      </div>
      <span
        className="actividad-correccion-card__estado"
        data-estado={actividad.estado}
      >
        {formatActividadEstado(actividad.estado)}
      </span>
    </header>

    <dl className="actividad-correccion-card__meta">
      <div className="actividad-correccion-card__meta-item">
        <dt>Fecha de actividad</dt>
        <dd>{formatActividadFecha(actividad.fechaActividad)}</dd>
      </div>
      <div className="actividad-correccion-card__meta-item">
        <dt>Registro</dt>
        <dd>#{actividad.id}</dd>
      </div>
    </dl>

    {actividad.observacionCorreccion ? (
      <div
        className="actividad-correccion-card__motivo"
        role="note"
        aria-label="Motivo de corrección"
      >
        <p className="actividad-correccion-card__motivo-label">Motivo de corrección</p>
        <p className="actividad-correccion-card__motivo-texto">
          {actividad.observacionCorreccion}
        </p>
      </div>
    ) : null}

    <footer className="actividad-correccion-card__footer">
      <Link
        to={ACTIVIDADES_FONTANERO_PATHS.corregirActividad(actividad.id)}
        className="actividad-correccion-card__action"
        data-testid={`corregir-actividad-${actividad.id}`}
      >
        Corregir actividad
      </Link>
    </footer>
  </article>
)

export default CorreccionPendienteCard
