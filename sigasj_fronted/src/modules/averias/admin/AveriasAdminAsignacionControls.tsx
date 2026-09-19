import { useRef, useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import ActivityFeedback from '../../actividades-fontanero/components/ActivityFeedback'
import { useAveriaAdminAsignacion } from '../hooks/useAveriaAdminAsignacion'
import {
  MENSAJE_PENDIENTE_ATENCION_ADMIN,
  mostrarAvisoPendienteAdmin,
} from '../utils/averiaPendienteAtencion'
import {
  AVERIA_RECIBIDA_ANTES_ASIGNAR_MSG,
  getAveriaAsignacionView,
} from './averiaAsignacionView'
import AveriasDetailField from './AveriasDetailField'
import { formatAveriaAdminDateTimeOrUnavailable } from './formatAveriaAdminDate'
import {
  AVERIA_UNAVAILABLE_LABEL,
  AVERIA_UNASSIGNED_LABEL,
  AVERIAS_ADMIN_FONTANEROS_EMPTY,
  buildAveriaAsignacionConfirmMessage,
  getFontaneroAsignableLabel,
  getFontaneroLabel,
  type AveriaDetail,
} from './types'
import './AveriasAdminAsignacionControls.css'

const FONTANERO_SELECT_ID = 'averia-asignacion-fontanero'

export type AveriasAdminAsignacionControlsProps = {
  averia: AveriaDetail
  canAssign: boolean
  onAveriaUpdated: (averia: AveriaDetail) => void
}

const AveriasAdminAsignacionControls = ({
  averia,
  canAssign,
  onAveriaUpdated,
}: AveriasAdminAsignacionControlsProps) => {
  const assignButtonRef = useRef<HTMLButtonElement>(null)
  const view = getAveriaAsignacionView(averia, canAssign)
  const loadFontaneros = view === 'formulario'

  const {
    fontaneros,
    listLoading,
    listError,
    refetchFontaneros,
    selectedFontaneroId,
    selectFontaneroIdFromString,
    assigning,
    feedback,
    clearFeedback,
    assignFontanero,
  } = useAveriaAdminAsignacion(onAveriaUpdated, { loadFontaneros })

  const [confirmOpen, setConfirmOpen] = useState(false)

  const busy = listLoading || assigning
  const selectedFontanero =
    selectedFontaneroId != null
      ? fontaneros.find((item) => item.id === selectedFontaneroId)
      : undefined
  const confirmMessage =
    selectedFontanero != null
      ? buildAveriaAsignacionConfirmMessage(selectedFontanero)
      : '¿Desea asignar esta avería al fontanero seleccionado?'

  const handleAssignClick = () => {
    clearFeedback()
    if (selectedFontaneroId == null) {
      return
    }
    setConfirmOpen(true)
  }

  const handleConfirmAssign = () => {
    setConfirmOpen(false)
    if (selectedFontaneroId == null) {
      return
    }
    void assignFontanero(averia.id, selectedFontaneroId).catch(() => undefined)
  }

  if (view === 'asignada' || view === 'solo_lectura') {
    const pendienteConResponsable = mostrarAvisoPendienteAdmin(
      String(averia.estado),
      averia.fontanero != null,
    )
    return (
      <dl className="averias-admin__fields">
        <AveriasDetailField label="Fontanero asignado">
          {getFontaneroLabel(averia.fontanero)}
        </AveriasDetailField>
        <AveriasDetailField label="Fecha de asignación">
          {formatAveriaAdminDateTimeOrUnavailable(
            averia.fechaAsignacion,
            AVERIA_UNAVAILABLE_LABEL,
          )}
        </AveriasDetailField>
        {pendienteConResponsable ? (
          <AveriasDetailField label="Atención">
            <p className="averias-admin__horario-hint" role="status">
              {MENSAJE_PENDIENTE_ATENCION_ADMIN}
            </p>
          </AveriasDetailField>
        ) : null}
      </dl>
    )
  }

  if (view === 'recibida_info') {
    return (
      <p className="averias-admin-asignacion__hint" role="status">
        {AVERIA_RECIBIDA_ANTES_ASIGNAR_MSG}
      </p>
    )
  }

  return (
    <div className="averias-admin-asignacion">
      {feedback ? (
        <ActivityFeedback
          variant={feedback.variant === 'success' ? 'success' : 'error'}
          message={feedback.message}
          className="averias-admin-asignacion__feedback"
          testId="averia-asignacion-feedback"
        />
      ) : null}

      <dl className="averias-admin__fields">
        <AveriasDetailField label="Fontanero asignado">
          {AVERIA_UNASSIGNED_LABEL}
        </AveriasDetailField>
      </dl>

      {listError ? (
        <ActivityFeedback
          variant="error"
          message={listError}
          action={
            <button
              type="button"
              className="gallery-admin__button"
              onClick={() => refetchFontaneros()}
            >
              Reintentar
            </button>
          }
        />
      ) : null}

      {listLoading ? (
        <p
          className="averias-admin-asignacion__hint"
          role="status"
          aria-busy="true"
        >
          Cargando fontaneros disponibles…
        </p>
      ) : null}

      {!listError && !listLoading && fontaneros.length === 0 ? (
        <p className="averias-admin-asignacion__hint" role="status">
          {AVERIAS_ADMIN_FONTANEROS_EMPTY}
        </p>
      ) : null}

      {!listError && fontaneros.length > 0 ? (
        <div className="averias-admin-asignacion__controls">
          <label className="gallery-admin__field" htmlFor={FONTANERO_SELECT_ID}>
            <span>Seleccionar fontanero</span>
            <select
              id={FONTANERO_SELECT_ID}
              name="fontaneroId"
              value={
                selectedFontaneroId != null ? String(selectedFontaneroId) : ''
              }
              disabled={busy}
              aria-busy={assigning}
              onChange={(event) =>
                selectFontaneroIdFromString(event.target.value)
              }
            >
              <option value="" disabled>
                Seleccione un fontanero
              </option>
              {fontaneros.map((fontanero) => (
                <option key={fontanero.id} value={String(fontanero.id)}>
                  {getFontaneroAsignableLabel(fontanero)}
                </option>
              ))}
            </select>
          </label>

          <button
            ref={assignButtonRef}
            type="button"
            className="gallery-admin__button"
            disabled={busy || selectedFontaneroId == null}
            aria-busy={assigning}
            onClick={handleAssignClick}
          >
            {assigning ? 'Asignando…' : 'Asignar fontanero'}
          </button>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Asignar avería"
        message={confirmMessage}
        confirmLabel="Confirmar asignación"
        returnFocusRef={assignButtonRef}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmAssign}
      />
    </div>
  )
}

export default AveriasAdminAsignacionControls
