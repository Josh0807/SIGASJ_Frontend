import {
  MENSAJE_ATENCION_NO_INICIADA,
  MENSAJE_PENDIENTE_ATENCION_ADMIN,
  mostrarAvisoPendienteAdmin,
} from '../utils/averiaPendienteAtencion'
import AveriasDetailField from './AveriasDetailField'
import AveriaStatusBadge from './AveriaStatusBadge'
import { formatAveriaAdminDateTimeOrUnavailable } from './formatAveriaAdminDate'
import './AveriasAdminGestionControls.css'
import {
  AVERIA_UNAVAILABLE_LABEL,
  getPrioridadLabel,
  getTipoAveriaDetailLabel,
  type AveriaDetail,
} from './types'

export const AVERIA_ESTADO_FONTANERO_HINT =
  'El Fontanero actualiza el estado al atender o resolver la avería.'

export const AVERIA_CLASIFICACION_FONTANERO_HINT =
  'El Fontanero califica la prioridad (Baja, Media o Alta) y el tipo (Tubo madre o Tubo medidor).'

export type AveriasAdminGestionControlsProps = {
  averia: AveriaDetail
}

const AveriasAdminGestionControls = ({
  averia,
}: AveriasAdminGestionControlsProps) => {
  const pendienteConResponsable = mostrarAvisoPendienteAdmin(
    String(averia.estado),
    averia.fontanero != null,
  )

  const inicioAtencion = averia.fechaInicioAtencion
    ? formatAveriaAdminDateTimeOrUnavailable(
        averia.fechaInicioAtencion,
        AVERIA_UNAVAILABLE_LABEL,
      )
    : pendienteConResponsable
      ? MENSAJE_ATENCION_NO_INICIADA
      : AVERIA_UNAVAILABLE_LABEL

  return (
    <div className="averias-admin__gestion">
      <div className="averias-admin__estado-panel">
        <div className="averias-admin__estado-panel-copy">
          <p className="averias-admin__estado-label">Estado</p>
          <AveriaStatusBadge estado={averia.estado} />
        </div>
        <p
          className={
            pendienteConResponsable
              ? 'averias-admin__horario-hint'
              : 'averias-admin__hint'
          }
          role="status"
        >
          {pendienteConResponsable
            ? MENSAJE_PENDIENTE_ATENCION_ADMIN
            : AVERIA_ESTADO_FONTANERO_HINT}
        </p>
      </div>

      <div className="averias-admin__gestion-bloque">
        <p className="averias-admin__gestion-caption">Calificación</p>
        <dl className="averias-admin__gestion-readonly">
          <AveriasDetailField label="Tipo de avería">
            {getTipoAveriaDetailLabel(averia.tipoAveria)}
          </AveriasDetailField>
          <AveriasDetailField label="Prioridad">
            {getPrioridadLabel(averia.prioridad)}
          </AveriasDetailField>
        </dl>
        <p className="averias-admin__hint" role="note">
          {AVERIA_CLASIFICACION_FONTANERO_HINT}
        </p>
      </div>

      <div className="averias-admin__gestion-bloque">
        <p className="averias-admin__gestion-caption">Fechas</p>
        <dl className="averias-admin__gestion-readonly">
          <AveriasDetailField label="Inicio de atención">
            {inicioAtencion}
          </AveriasDetailField>
          <AveriasDetailField label="Fecha de resolución">
            {formatAveriaAdminDateTimeOrUnavailable(
              averia.fechaResolucion,
              AVERIA_UNAVAILABLE_LABEL,
            )}
          </AveriasDetailField>
        </dl>
      </div>
    </div>
  )
}

export default AveriasAdminGestionControls
