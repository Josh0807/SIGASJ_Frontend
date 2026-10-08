import { useId, useRef, useState, type FormEvent } from 'react'
import { clearAccessToken } from '../../auth/utils/authStorage'
import ActivityFeedback from '../../actividades-fontanero/components/ActivityFeedback'
import {
  extractHttpErrorMessage,
  getHttpErrorStatus,
} from '../../actividades-fontanero/utils/httpErrorStatus'
import { isAbortError } from '../admin/averiaAdminError'
import { createFontaneroObservacion } from '../services/averiasFontaneroApi'
import {
  AVERIAS_FONTANERO_DETAIL_NOT_FOUND,
  AVERIAS_FONTANERO_OBSERVACION_ERROR,
  AVERIAS_FONTANERO_OBSERVACION_FORBIDDEN,
  AVERIAS_FONTANERO_OBSERVACION_GUARDAR,
  AVERIAS_FONTANERO_OBSERVACION_LOADING,
  AVERIAS_FONTANERO_OBSERVACION_NUEVA_LABEL,
  AVERIAS_FONTANERO_OBSERVACION_PLACEHOLDER,
  AVERIAS_FONTANERO_OBSERVACION_SUCCESS,
  AVERIAS_FONTANERO_OBSERVACION_VACIA,
  OBSERVACION_AVERIA_MAX_LENGTH,
  type AveriaObservacionItem,
} from './types'

type AveriasFontaneroObservacionFormProps = {
  averiaId: number
  onCreated: (observacion: AveriaObservacionItem, message: string) => void
  onUnauthorized: () => void
}

const parseObservacionError = (error: unknown): string => {
  const status = getHttpErrorStatus(error)
  if (status === 403) {
    return AVERIAS_FONTANERO_OBSERVACION_FORBIDDEN
  }
  if (status === 404) {
    return AVERIAS_FONTANERO_DETAIL_NOT_FOUND
  }
  if (status === 400) {
    return extractHttpErrorMessage(error, AVERIAS_FONTANERO_OBSERVACION_VACIA)
  }
  return AVERIAS_FONTANERO_OBSERVACION_ERROR
}

const AveriasFontaneroObservacionForm = ({
  averiaId,
  onCreated,
  onUnauthorized,
}: AveriasFontaneroObservacionFormProps) => {
  const fieldId = useId()
  const errorId = useId()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const submittingRef = useRef(false)
  const [observacion, setObservacion] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current) {
      return
    }

    const trimmed = observacion.trim()
    if (!trimmed) {
      setFieldError(AVERIAS_FONTANERO_OBSERVACION_VACIA)
      setSuccessMessage(null)
      textareaRef.current?.focus()
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setFieldError(null)
    setSubmitError(null)
    setSuccessMessage(null)

    try {
      const result = await createFontaneroObservacion(averiaId, trimmed)
      setObservacion('')
      setSuccessMessage(result.message || AVERIAS_FONTANERO_OBSERVACION_SUCCESS)
      onCreated(result.data, result.message || AVERIAS_FONTANERO_OBSERVACION_SUCCESS)
    } catch (caught) {
      if (isAbortError(caught)) {
        return
      }
      if (getHttpErrorStatus(caught) === 401) {
        clearAccessToken()
        onUnauthorized()
        return
      }
      setSubmitError(parseObservacionError(caught))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <form
      className="averias-fontanero__observacion-form !mt-6 !grid !gap-4 !rounded-3xl !border !border-blue-100 !bg-linear-to-br !from-white !to-blue-50/70 !p-6 !shadow-[0_10px_28px_rgba(30,90,156,0.09)]"
      onSubmit={handleSubmit}
    >
      <label htmlFor={fieldId} className="averias-fontanero__resolver-label !text-xs !font-extrabold !uppercase !tracking-[0.08em] !text-blue-600">
        {AVERIAS_FONTANERO_OBSERVACION_NUEVA_LABEL}
      </label>
      <textarea
        className="!box-border !min-h-36 !w-full !resize-y !rounded-2xl !border !border-blue-200 !bg-white !px-5 !py-4 !text-base !font-medium !leading-relaxed !text-[#073b73] !shadow-sm !outline-none !transition-all !duration-200 placeholder:!text-slate-400 hover:!border-blue-300 focus:!border-blue-500 focus:!ring-4 focus:!ring-blue-100 disabled:!cursor-not-allowed disabled:!opacity-60"
        ref={textareaRef}
        id={fieldId}
        name="observacion"
        aria-required="true"
        placeholder={AVERIAS_FONTANERO_OBSERVACION_PLACEHOLDER}
        maxLength={OBSERVACION_AVERIA_MAX_LENGTH}
        rows={5}
        value={observacion}
        disabled={submitting}
        aria-invalid={fieldError ? true : undefined}
        aria-describedby={fieldError ? errorId : undefined}
        onChange={(event) => {
          setObservacion(event.target.value)
          if (fieldError) {
            setFieldError(null)
          }
        }}
      />
      <p className="!m-0 !text-right !text-xs !font-bold !text-slate-400" aria-live="polite">
        {observacion.length}/{OBSERVACION_AVERIA_MAX_LENGTH}
      </p>
      {fieldError ? (
        <p id={errorId} className="averias-fontanero__resolver-error" role="alert">
          {fieldError}
        </p>
      ) : null}
      {submitError ? (
        <ActivityFeedback variant="error" message={submitError} />
      ) : null}
      {successMessage ? (
        <ActivityFeedback variant="success" message={successMessage} />
      ) : null}
      {submitting ? (
        <p role="status" aria-live="polite">
          {AVERIAS_FONTANERO_OBSERVACION_LOADING}
        </p>
      ) : null}
      <button
        className="gallery-admin__button !min-h-12 !rounded-2xl !border-0 !bg-linear-to-r !from-blue-600 !to-sky-500 !px-6 !font-extrabold !text-white !shadow-[0_10px_24px_rgba(37,99,235,0.25)] !transition-all !duration-300 hover:!-translate-y-1 hover:!shadow-[0_15px_30px_rgba(37,99,235,0.35)] active:!translate-y-0 active:!scale-[0.97] disabled:!cursor-not-allowed disabled:!opacity-55 disabled:hover:!translate-y-0"
        type="submit"
        disabled={submitting}
      >
        {AVERIAS_FONTANERO_OBSERVACION_GUARDAR}
      </button>
    </form>
  )
}

export default AveriasFontaneroObservacionForm
