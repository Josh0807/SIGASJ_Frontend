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
      className="averias-admin__gestion-controls averias-fontanero__calificar !grid !min-w-0 !grid-cols-1 !gap-5 !rounded-3xl !border !border-blue-100 !bg-linear-to-br !from-white !to-blue-50/70 !p-6 !shadow-[0_10px_28px_rgba(30,90,156,0.10)] md:!grid-cols-2"
      onSubmit={handleSubmit}
    >
      <div className="!col-span-full !border-b !border-blue-100 !pb-4">
        <p className="averias-admin__estado-label !m-0 !text-xl !font-black !tracking-[-0.02em] !text-[#073b73]">{AVERIAS_FONTANERO_CALIFICAR_TITULO}</p>
        <p className="averias-admin__hint !mt-2 !mb-0 !max-w-2xl !text-sm !leading-relaxed !text-slate-500">{AVERIAS_FONTANERO_CALIFICAR_HINT}</p>
      </div>
      <label className="gallery-admin__field !grid !min-w-0 !gap-2" htmlFor={PRIORIDAD_SELECT_ID}>
        <span className="!text-xs !font-extrabold !uppercase !tracking-[0.08em] !text-blue-600">Prioridad</span>
        <select
          className="!box-border !min-h-14 !w-full !min-w-0 !max-w-full !rounded-2xl !border !border-blue-200 !bg-white !px-4 !text-base !font-bold !text-[#073b73] !shadow-sm !outline-none !transition-all !duration-200 hover:!border-blue-300 focus:!border-blue-500 focus:!ring-4 focus:!ring-blue-100 disabled:!cursor-not-allowed disabled:!opacity-60"
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
      <label className="gallery-admin__field !grid !min-w-0 !gap-2" htmlFor={TIPO_SELECT_ID}>
        <span className="!text-xs !font-extrabold !uppercase !tracking-[0.08em] !text-blue-600">Tipo</span>
        <select
          className="!box-border !min-h-14 !w-full !min-w-0 !max-w-full !rounded-2xl !border !border-blue-200 !bg-white !px-4 !text-base !font-bold !text-[#073b73] !shadow-sm !outline-none !transition-all !duration-200 hover:!border-blue-300 focus:!border-blue-500 focus:!ring-4 focus:!ring-blue-100 disabled:!cursor-not-allowed disabled:!opacity-60"
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
        className="gallery-admin__button !min-h-12 !rounded-2xl !border-0 !bg-linear-to-r !from-blue-600 !to-sky-500 !px-6 !font-extrabold !text-white !shadow-[0_10px_24px_rgba(37,99,235,0.25)] !transition-all !duration-300 hover:!-translate-y-1 hover:!shadow-[0_15px_30px_rgba(37,99,235,0.35)] active:!translate-y-0 active:!scale-[0.97] disabled:!cursor-not-allowed disabled:!opacity-55 disabled:hover:!translate-y-0"
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
