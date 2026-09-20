import {
  MENSAJE_PENDIENTE_ATENCION_ADMIN,
  mostrarAvisoPendienteAdmin,
} from '../utils/averiaPendienteAtencion'
import AveriasDetailField from './AveriasDetailField'
import AveriaStatusBadge from './AveriaStatusBadge'
import './AveriasAdminGestionControls.css'
import {
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

  return (
    <>
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

      <div className="averias-admin__gestion-readonly">
        <AveriasDetailField label="Tipo de avería">
          {getTipoAveriaDetailLabel(averia.tipoAveria)}
        </AveriasDetailField>
        <AveriasDetailField label="Prioridad">
          {getPrioridadLabel(averia.prioridad)}
        </AveriasDetailField>
      </div>
      <p className="averias-admin__hint" role="note">
        {AVERIA_CLASIFICACION_FONTANERO_HINT}
      </p>
    </>
  )
}

export default AveriasAdminGestionControls
