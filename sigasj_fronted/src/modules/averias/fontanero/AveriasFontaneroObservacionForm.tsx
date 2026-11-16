import { useId, useRef, useState, type FormEvent } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { clearAccessToken } from '../../auth/utils/authStorage'
import ActivityFeedback from '../../actividades-fontanero/components/ActivityFeedback'
import {
  extractHttpErrorMessage,
  getHttpErrorStatus,
} from '../../actividades-fontanero/utils/httpErrorStatus'
import { Button } from '../../../shared/ui'
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
      className="averias-fontanero__observacion-form mt-2 grid gap-3 rounded-2xl border border-sigasj-border bg-white p-4"
      onSubmit={handleSubmit}
    >
      <label
        htmlFor={fieldId}
        className="averias-fontanero__resolver-label text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted"
      >
        {AVERIAS_FONTANERO_OBSERVACION_NUEVA_LABEL}
      </label>
      <textarea
        className="box-border min-h-32 w-full resize-y rounded-xl border border-sigasj-border bg-[color-mix(in_srgb,var(--color-sigasj-ice)_45%,white)] px-4 py-3 text-[0.95rem] font-medium leading-relaxed text-sigasj-ink outline-none transition placeholder:text-sigasj-muted focus:border-sigasj-primary focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-sigasj-primary)_22%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
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
      <div className="flex flex-wrap items-center justify-end gap-3">
        <p
          className="m-0 text-xs font-bold tabular-nums text-sigasj-muted"
          aria-live="polite"
        >
          {observacion.length}/{OBSERVACION_AVERIA_MAX_LENGTH}
        </p>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={submitting}
          loading={submitting}
          leftIcon={
            submitting ? undefined : <IconPlus size={16} aria-hidden="true" />
          }
        >
          {submitting
            ? AVERIAS_FONTANERO_OBSERVACION_LOADING
            : AVERIAS_FONTANERO_OBSERVACION_GUARDAR}
        </Button>
      </div>
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
        <p className="sr-only" role="status" aria-live="polite">
          {AVERIAS_FONTANERO_OBSERVACION_LOADING}
        </p>
      ) : null}
    </form>
  )
}

export default AveriasFontaneroObservacionForm
