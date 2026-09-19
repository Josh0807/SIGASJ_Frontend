import { useState } from 'react'
import ActivityFeedback from '../../actividades-fontanero/components/ActivityFeedback'
import { useAveriaAdminGestion } from '../hooks/useAveriaAdminGestion'
import {
  MENSAJE_PENDIENTE_ATENCION_ADMIN,
  mostrarAvisoPendienteAdmin,
} from '../utils/averiaPendienteAtencion'
import AveriasDetailField from './AveriasDetailField'
import AveriaStatusBadge from './AveriaStatusBadge'
import {
  PRIORIDAD_AVERIA_OPTIONS,
  isPrioridadAveria,
} from './prioridadAveria'
import { TIPO_AVERIA_OPTIONS, isTipoAveria } from './tipoAveria'
import './AveriasAdminGestionControls.css'
import {
  AVERIA_UNCLASSIFIED_LABEL,
  getPrioridadLabel,
  getTipoAveriaDetailLabel,
  type AveriaDetail,
} from './types'

const PRIORIDAD_SELECT_ID = 'averia-gestion-prioridad'
const CLASIFICACION_SELECT_ID = 'averia-gestion-clasificacion'

export const AVERIA_ESTADO_FONTANERO_HINT =
  'El Fontanero actualiza el estado al atender o resolver la avería.'

export type AveriasAdminGestionControlsProps = {
  averia: AveriaDetail
  canEdit: boolean
  onAveriaUpdated: (averia: AveriaDetail) => void
}

const AveriasAdminGestionControls = ({
  averia,
  canEdit,
  onAveriaUpdated,
}: AveriasAdminGestionControlsProps) => {
  const {
    pendingField,
    feedback,
    clearFeedback,
    updatePrioridad,
    updateClasificacion,
  } = useAveriaAdminGestion(onAveriaUpdated)

  const [prioridadValue, setPrioridadValue] = useState(
    averia.prioridad?.trim().toUpperCase() ?? '',
  )
  const [clasificacionValue, setClasificacionValue] = useState(
    averia.tipoAveria?.trim().toUpperCase() ?? '',
  )

  const isSaving = pendingField !== null
  const pendienteConResponsable = mostrarAvisoPendienteAdmin(
    String(averia.estado),
    averia.fontanero != null,
  )

  const handlePrioridadChange = async (nextRaw: string) => {
    clearFeedback()
    if (!isPrioridadAveria(nextRaw)) {
      setPrioridadValue(averia.prioridad?.trim().toUpperCase() ?? '')
      return
    }

    setPrioridadValue(nextRaw)
    if (nextRaw === (averia.prioridad?.trim().toUpperCase() ?? '')) {
      return
    }

    try {
      await updatePrioridad(averia.id, nextRaw)
    } catch {
      setPrioridadValue(averia.prioridad?.trim().toUpperCase() ?? '')
    }
  }

  const handleClasificacionChange = async (nextRaw: string) => {
    clearFeedback()
    if (!isTipoAveria(nextRaw)) {
      setClasificacionValue(averia.tipoAveria?.trim().toUpperCase() ?? '')
      return
    }

    setClasificacionValue(nextRaw)
    const actual = averia.tipoAveria?.trim().toUpperCase() ?? ''
    if (nextRaw === actual) {
      return
    }

    try {
      await updateClasificacion(averia.id, nextRaw)
    } catch {
      setClasificacionValue(averia.tipoAveria?.trim().toUpperCase() ?? '')
    }
  }

  return (
    <>
      {feedback ? (
        <ActivityFeedback
          variant={feedback.variant === 'success' ? 'success' : 'error'}
          message={feedback.message}
          className="averias-admin__gestion-feedback"
          testId="averia-gestion-feedback"
        />
      ) : null}

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

      {canEdit ? (
        <div className="averias-admin__gestion-controls">
          <label className="gallery-admin__field" htmlFor={PRIORIDAD_SELECT_ID}>
            <span>Prioridad</span>
            <select
              id={PRIORIDAD_SELECT_ID}
              name="prioridad"
              value={prioridadValue}
              disabled={isSaving}
              aria-busy={pendingField === 'prioridad'}
              onChange={(event) => void handlePrioridadChange(event.target.value)}
            >
              {!prioridadValue ? (
                <option value="" disabled>
                  {getPrioridadLabel(null)}
                </option>
              ) : null}
              {PRIORIDAD_AVERIA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label
            className="gallery-admin__field"
            htmlFor={CLASIFICACION_SELECT_ID}
          >
            <span>Clasificación</span>
            <select
              id={CLASIFICACION_SELECT_ID}
              name="clasificacion"
              value={clasificacionValue}
              disabled={isSaving}
              aria-busy={pendingField === 'clasificacion'}
              onChange={(event) =>
                void handleClasificacionChange(event.target.value)
              }
            >
              {!clasificacionValue ? (
                <option value="" disabled>
                  {AVERIA_UNCLASSIFIED_LABEL}
                </option>
              ) : null}
              {TIPO_AVERIA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <div className="averias-admin__gestion-readonly">
          <AveriasDetailField label="Tipo de avería">
            {getTipoAveriaDetailLabel(averia.tipoAveria)}
          </AveriasDetailField>
          <AveriasDetailField label="Prioridad">
            {getPrioridadLabel(averia.prioridad)}
          </AveriasDetailField>
        </div>
      )}
    </>
  )
}

export default AveriasAdminGestionControls
