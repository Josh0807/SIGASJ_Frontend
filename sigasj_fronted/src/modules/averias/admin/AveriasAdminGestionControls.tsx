import { useRef, useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import ActivityFeedback from '../../actividades-fontanero/components/ActivityFeedback'
import { useAveriaAdminGestion } from '../hooks/useAveriaAdminGestion'
import {
  buildOpcionesEstadoEditable,
  requiereConfirmacionCambioEstado,
} from './averiasEstadoTransiciones'
import AveriasDetailField from './AveriasDetailField'
import {
  ESTADO_AVERIA_LABELS,
  isEstadoAveria,
  type EstadoAveria,
} from './estadoAveria'
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

const ESTADO_SELECT_ID = 'averia-gestion-estado'
const PRIORIDAD_SELECT_ID = 'averia-gestion-prioridad'
const CLASIFICACION_SELECT_ID = 'averia-gestion-clasificacion'

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
  const estadoSelectRef = useRef<HTMLSelectElement>(null)
  const {
    pendingField,
    feedback,
    clearFeedback,
    updateEstado,
    updatePrioridad,
    updateClasificacion,
  } = useAveriaAdminGestion(onAveriaUpdated)

  const [estadoValue, setEstadoValue] = useState(averia.estado)
  const [prioridadValue, setPrioridadValue] = useState(
    averia.prioridad?.trim().toUpperCase() ?? '',
  )
  const [clasificacionValue, setClasificacionValue] = useState(
    averia.tipoAveria?.trim().toUpperCase() ?? '',
  )
  const [confirmEstado, setConfirmEstado] = useState<EstadoAveria | null>(null)

  if (!canEdit) {
    return (
      <>
        <AveriasDetailField label="Estado">
          <AveriaStatusBadge estado={averia.estado} />
        </AveriasDetailField>
        <AveriasDetailField label="Tipo de avería">
          {getTipoAveriaDetailLabel(averia.tipoAveria)}
        </AveriasDetailField>
        <AveriasDetailField label="Prioridad">
          {getPrioridadLabel(averia.prioridad)}
        </AveriasDetailField>
      </>
    )
  }

  const estadoOpciones = buildOpcionesEstadoEditable(
    averia.estado,
    averia.fontanero != null,
  )
  const isSaving = pendingField !== null

  const revertEstado = () => {
    setEstadoValue(averia.estado)
  }

  const applyEstado = async (destino: EstadoAveria) => {
    if (destino === averia.estado) {
      return
    }
    try {
      await updateEstado(averia.id, destino)
    } catch {
      revertEstado()
    }
  }

  const handleEstadoChange = (nextRaw: string) => {
    clearFeedback()
    if (!isEstadoAveria(nextRaw)) {
      revertEstado()
      return
    }

    setEstadoValue(nextRaw)

    if (nextRaw === averia.estado) {
      return
    }

    if (requiereConfirmacionCambioEstado(nextRaw)) {
      setConfirmEstado(nextRaw)
      return
    }

    void applyEstado(nextRaw)
  }

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

  const confirmCopy =
    confirmEstado === 'RESUELTA'
      ? {
          title: 'Marcar avería como resuelta',
          message:
            'Esta acción indica que la avería quedó atendida. ¿Desea continuar?',
          confirmLabel: 'Marcar resuelta',
        }
      : confirmEstado === 'CANCELADA'
        ? {
            title: 'Cancelar avería',
            message:
              'La avería quedará cerrada sin resolución. ¿Desea continuar?',
            confirmLabel: 'Cancelar avería',
            confirmDanger: true as const,
          }
        : null

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

      <div className="averias-admin__gestion-controls">
        <label className="gallery-admin__field" htmlFor={ESTADO_SELECT_ID}>
          <span>Estado</span>
          <select
            ref={estadoSelectRef}
            id={ESTADO_SELECT_ID}
            name="estado"
            value={isEstadoAveria(estadoValue) ? estadoValue : averia.estado}
            disabled={isSaving || estadoOpciones.length === 0}
            aria-busy={pendingField === 'estado'}
            onChange={(event) => handleEstadoChange(event.target.value)}
          >
            {estadoOpciones.map((value) => (
              <option key={value} value={value}>
                {ESTADO_AVERIA_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

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

      {confirmCopy && confirmEstado ? (
        <ConfirmDialog
          isOpen
          title={confirmCopy.title}
          message={confirmCopy.message}
          confirmLabel={confirmCopy.confirmLabel}
          confirmDanger={'confirmDanger' in confirmCopy && confirmCopy.confirmDanger}
          returnFocusRef={estadoSelectRef}
          onCancel={() => {
            setConfirmEstado(null)
            revertEstado()
          }}
          onConfirm={() => {
            const destino = confirmEstado
            setConfirmEstado(null)
            void applyEstado(destino)
          }}
        />
      ) : null}
    </>
  )
}

export default AveriasAdminGestionControls
