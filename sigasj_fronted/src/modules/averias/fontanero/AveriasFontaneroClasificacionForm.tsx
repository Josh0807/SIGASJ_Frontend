import { useRef, useState, type FormEvent } from 'react'
import { IconDeviceFloppy } from '@tabler/icons-react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import { Alert, Button } from '../../../shared/ui'
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

const labelClass =
  'text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted'
const fieldClass =
  'min-h-11 w-full rounded-xl border border-sigasj-border bg-white px-3.5 text-[0.95rem] font-semibold text-sigasj-ink outline-none transition focus:border-sigasj-primary focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-sigasj-primary)_22%,transparent)] disabled:cursor-not-allowed disabled:opacity-60'

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
  const [prioridad, setPrioridad] = useState<'BAJA' | 'MEDIA' | 'ALTA' | ''>('')
  const [tipo, setTipo] = useState<'TUBO_MADRE' | 'TUBO_MEDIDOR' | ''>('')
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
      className="averias-admin__gestion-controls averias-fontanero__calificar grid gap-4 rounded-2xl border border-sigasj-border bg-white p-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] lg:items-end"
      onSubmit={handleSubmit}
    >
      <div className="min-w-0">
        <p className="averias-admin__estado-label m-0 text-base font-extrabold tracking-tight text-sigasj-ink">
          {AVERIAS_FONTANERO_CALIFICAR_TITULO}
        </p>
        <p className="averias-admin__hint mb-0 mt-1 max-w-xl text-sm font-semibold leading-snug text-sigasj-muted">
          {AVERIAS_FONTANERO_CALIFICAR_HINT}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label
          className="grid min-w-0 flex-1 gap-1.5 sm:min-w-[9rem]"
          htmlFor={PRIORIDAD_SELECT_ID}
        >
          <span className={labelClass}>Prioridad</span>
          <select
            className={fieldClass}
            id={PRIORIDAD_SELECT_ID}
            name="prioridad"
            value={prioridad}
            disabled={saving}
            required
            onChange={(event) =>
              setPrioridad(toPrioridadValue(event.target.value))
            }
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

        <label
          className="grid min-w-0 flex-1 gap-1.5 sm:min-w-[9rem]"
          htmlFor={TIPO_SELECT_ID}
        >
          <span className={labelClass}>Tipo</span>
          <select
            className={fieldClass}
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

        <Button
          ref={guardarRef}
          type="submit"
          variant="primary"
          size="sm"
          className="w-full sm:w-auto"
          disabled={saving}
          loading={saving}
          leftIcon={
            saving ? undefined : <IconDeviceFloppy size={16} aria-hidden="true" />
          }
        >
          {saving
            ? AVERIAS_FONTANERO_CALIFICAR_LOADING
            : AVERIAS_FONTANERO_CALIFICAR_GUARDAR}
        </Button>
      </div>

      {error ? <Alert tone="danger">{error}</Alert> : null}

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
