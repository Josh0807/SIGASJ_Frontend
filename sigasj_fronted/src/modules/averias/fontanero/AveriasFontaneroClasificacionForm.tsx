import { useRef, useState, type FormEvent } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import ActivityFeedback from '../../actividades-fontanero/components/ActivityFeedback'
import {
  extractHttpErrorMessage,
  getHttpErrorStatus,
} from '../../actividades-fontanero/utils/httpErrorStatus'
import { isAbortError } from '../admin/averiaAdminError'
import { PRIORIDAD_AVERIA_FONTANERO_OPTIONS } from '../admin/prioridadAveria'
import { TIPO_AVERIA_FONTANERO_OPTIONS } from '../admin/tipoAveria'
import {
  patchFontaneroAveriaClasificacion,
  patchFontaneroAveriaPrioridad,
} from '../services/averiasFontaneroApi'
import {
  AVERIAS_FONTANERO_CALIFICAR_CONFIRM_ACEPTAR,
  AVERIAS_FONTANERO_CALIFICAR_CONFIRM_TITULO,
  AVERIAS_FONTANERO_CALIFICAR_ERROR,
  AVERIAS_FONTANERO_CALIFICAR_FORBIDDEN,
  AVERIAS_FONTANERO_CALIFICAR_GUARDAR,
  AVERIAS_FONTANERO_CALIFICAR_HINT,
  AVERIAS_FONTANERO_CALIFICAR_INVALIDA,
  AVERIAS_FONTANERO_CALIFICAR_LOADING,
  AVERIAS_FONTANERO_CALIFICAR_SUCCESS,
  AVERIAS_FONTANERO_CALIFICAR_TITULO,
  AVERIAS_FONTANERO_DETAIL_NOT_FOUND,
  type AveriaFontaneroDetail,
} from './types'

const PRIORIDAD_SELECT_ID = 'averia-fontanero-prioridad'
const TIPO_SELECT_ID = 'averia-fontanero-clasificacion'

const toPrioridadValue = (value: string): 'BAJA' | 'MEDIA' | 'ALTA' | '' => {
  const normalized = value.trim().toUpperCase()
  if (normalized === 'BAJA' || normalized === 'MEDIA' || normalized === 'ALTA') {
    return normalized
  }
  return ''
}

const toTipoValue = (value: string): 'TUBO_MADRE' | 'TUBO_MEDIDOR' | '' => {
  const normalized = value.trim().toUpperCase()
  if (normalized === 'TUBO_MADRE' || normalized === 'TUBO_MEDIDOR') {
    return normalized
  }
  return ''
}

type AveriasFontaneroClasificacionFormProps = {
  averia: AveriaFontaneroDetail
  onUpdated: (averia: AveriaFontaneroDetail, message: string) => void
  onUnauthorized: () => void
}

const parseCalificacionError = (error: unknown): string => {
  const status = getHttpErrorStatus(error)
  if (status === 403) {
    return AVERIAS_FONTANERO_CALIFICAR_FORBIDDEN
  }
  if (status === 404) {
    return AVERIAS_FONTANERO_DETAIL_NOT_FOUND
  }
  if (status === 400) {
    return extractHttpErrorMessage(error, AVERIAS_FONTANERO_CALIFICAR_INVALIDA)
  }
  return AVERIAS_FONTANERO_CALIFICAR_ERROR
}

const AveriasFontaneroClasificacionForm = ({
  averia,
  onUpdated,
  onUnauthorized,
}: AveriasFontaneroClasificacionFormProps) => {
  const [prioridad, setPrioridad] = useState(toPrioridadValue(averia.prioridad))
  const [tipo, setTipo] = useState(toTipoValue(averia.tipoAveria))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const guardarRef = useRef<HTMLButtonElement>(null)

  const prioridadLabel =
    PRIORIDAD_AVERIA_FONTANERO_OPTIONS.find((option) => option.value === prioridad)
      ?.label ?? prioridad
  const tipoLabel =
    TIPO_AVERIA_FONTANERO_OPTIONS.find((option) => option.value === tipo)?.label ??
    tipo

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) {
      return
    }
    if (!prioridad || !tipo) {
      setError(AVERIAS_FONTANERO_CALIFICAR_INVALIDA)
      return
    }
    setError(null)
    setConfirmOpen(true)
  }

  const guardarCalificacion = async () => {
    setConfirmOpen(false)
    if (saving || !prioridad || !tipo) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      let updated = averia
      if (prioridad !== toPrioridadValue(averia.prioridad)) {
        updated = await patchFontaneroAveriaPrioridad(averia.id, prioridad)
      }
      if (tipo !== toTipoValue(updated.tipoAveria)) {
        updated = await patchFontaneroAveriaClasificacion(averia.id, tipo)
      }
      onUpdated(updated, AVERIAS_FONTANERO_CALIFICAR_SUCCESS)
    } catch (caught) {
      if (isAbortError(caught)) {
        return
      }
      if (getHttpErrorStatus(caught) === 401) {
        onUnauthorized()
        return
      }
      setError(parseCalificacionError(caught))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="averias-admin__gestion-controls averias-fontanero__calificar"
      onSubmit={handleSubmit}
    >
      <p className="averias-admin__estado-label">{AVERIAS_FONTANERO_CALIFICAR_TITULO}</p>
      <p className="averias-admin__hint">{AVERIAS_FONTANERO_CALIFICAR_HINT}</p>
      <label className="gallery-admin__field" htmlFor={PRIORIDAD_SELECT_ID}>
        <span>Prioridad</span>
        <select
          id={PRIORIDAD_SELECT_ID}
          name="prioridad"
          value={prioridad}
          disabled={saving}
          required
          onChange={(event) => setPrioridad(toPrioridadValue(event.target.value))}
        >
          <option value="" disabled>
            Seleccione
          </option>
          {PRIORIDAD_AVERIA_FONTANERO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="gallery-admin__field" htmlFor={TIPO_SELECT_ID}>
        <span>Tipo</span>
        <select
          id={TIPO_SELECT_ID}
          name="clasificacion"
          value={tipo}
          disabled={saving}
          required
          onChange={(event) => setTipo(toTipoValue(event.target.value))}
        >
          <option value="" disabled>
            Seleccione
          </option>
          {TIPO_AVERIA_FONTANERO_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      {error ? <ActivityFeedback variant="error" message={error} /> : null}
      <button
        ref={guardarRef}
        className="gallery-admin__button"
        type="submit"
        disabled={saving}
      >
        {saving
          ? AVERIAS_FONTANERO_CALIFICAR_LOADING
          : AVERIAS_FONTANERO_CALIFICAR_GUARDAR}
      </button>
      <ConfirmDialog
        isOpen={confirmOpen}
        title={AVERIAS_FONTANERO_CALIFICAR_CONFIRM_TITULO}
        message={`Prioridad: ${prioridadLabel}. Tipo: ${tipoLabel}. ¿Acepta los cambios?`}
        confirmLabel={AVERIAS_FONTANERO_CALIFICAR_CONFIRM_ACEPTAR}
        cancelLabel="Cancelar"
        returnFocusRef={guardarRef}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void guardarCalificacion()}
      />
    </form>
  )
}

export default AveriasFontaneroClasificacionForm
