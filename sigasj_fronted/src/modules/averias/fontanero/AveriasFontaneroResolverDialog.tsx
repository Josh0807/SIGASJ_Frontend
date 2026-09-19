import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { clearAccessToken } from '../../auth/utils/authStorage'
import { extractHttpErrorMessage, getHttpErrorStatus } from '../../actividades-fontanero/utils/httpErrorStatus'
import ActivityFeedback from '../../actividades-fontanero/components/ActivityFeedback'
import { isAbortError } from '../admin/averiaAdminError'
import { resolverFontaneroAveria } from '../services/averiasFontaneroApi'
import {
  AVERIAS_FONTANERO_DETAIL_NOT_FOUND,
  AVERIAS_FONTANERO_RESOLVER_CANCEL,
  AVERIAS_FONTANERO_RESOLVER_CONFIRM,
  AVERIAS_FONTANERO_RESOLVER_ERROR,
  AVERIAS_FONTANERO_RESOLVER_FIELD_LABEL,
  AVERIAS_FONTANERO_RESOLVER_FORBIDDEN,
  AVERIAS_FONTANERO_RESOLVER_HINT,
  AVERIAS_FONTANERO_RESOLVER_LOADING,
  AVERIAS_FONTANERO_RESOLVER_SUCCESS,
  AVERIAS_FONTANERO_RESOLVER_TITLE,
  OBSERVACION_FINAL_MAX_LENGTH,
  OBSERVACION_FINAL_VACIA,
  type AveriaFontaneroDetail,
} from './types'

type AveriasFontaneroResolverDialogProps = {
  averiaId: number
  isOpen: boolean
  onCancel: () => void
  onResolved: (averia: AveriaFontaneroDetail, message: string) => void
  onUnauthorized: () => void
}

const parseResolverError = (error: unknown): string => {
  const status = getHttpErrorStatus(error)
  if (status === 403) {
    return AVERIAS_FONTANERO_RESOLVER_FORBIDDEN
  }
  if (status === 404) {
    return AVERIAS_FONTANERO_DETAIL_NOT_FOUND
  }
  if (status === 400) {
    return extractHttpErrorMessage(error, AVERIAS_FONTANERO_RESOLVER_ERROR)
  }
  return AVERIAS_FONTANERO_RESOLVER_ERROR
}

const AveriasFontaneroResolverDialog = ({
  averiaId,
  isOpen,
  onCancel,
  onResolved,
  onUnauthorized,
}: AveriasFontaneroResolverDialogProps) => {
  const titleId = useId()
  const hintId = useId()
  const fieldId = useId()
  const errorId = useId()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const submittingRef = useRef(false)
  const [observacionFinal, setObservacionFinal] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      submittingRef.current = false
      setObservacionFinal('')
      setFieldError(null)
      setSubmitError(null)
      setSubmitting(false)
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    textareaRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const getFocusableActions = useCallback((): HTMLElement[] => {
    const items: Array<HTMLElement | null> = [
      textareaRef.current,
      cancelRef.current,
      confirmRef.current,
    ]
    return items.filter((item): item is HTMLElement => item instanceof HTMLElement)
  }, [])

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (!submittingRef.current) {
        onCancel()
      }
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const focusables = getFocusableActions()
    if (focusables.length === 0) {
      return
    }

    const currentIndex = focusables.findIndex(
      (item) => item === document.activeElement,
    )
    const nextIndex = event.shiftKey
      ? currentIndex <= 0
        ? focusables.length - 1
        : currentIndex - 1
      : currentIndex < 0 || currentIndex >= focusables.length - 1
        ? 0
        : currentIndex + 1

    event.preventDefault()
    focusables[nextIndex]?.focus()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current) {
      return
    }

    const trimmed = observacionFinal.trim()
    if (!trimmed) {
      setFieldError(OBSERVACION_FINAL_VACIA)
      textareaRef.current?.focus()
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setFieldError(null)
    setSubmitError(null)

    try {
      const result = await resolverFontaneroAveria(averiaId, trimmed)
      onResolved(result.data, result.message || AVERIAS_FONTANERO_RESOLVER_SUCCESS)
    } catch (caught) {
      if (isAbortError(caught)) {
        return
      }
      if (getHttpErrorStatus(caught) === 401) {
        clearAccessToken()
        onUnauthorized()
        return
      }
      setSubmitError(parseResolverError(caught))
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="confirm-dialog"
      role="presentation"
      onClick={() => {
        if (!submittingRef.current) {
          onCancel()
        }
      }}
    >
      <div
        className="confirm-dialog__panel averias-fontanero__resolver-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={hintId}
        onKeyDown={handleDialogKeyDown}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="confirm-dialog__title">
          {AVERIAS_FONTANERO_RESOLVER_TITLE}
        </h2>
        <p id={hintId} className="confirm-dialog__message">
          {AVERIAS_FONTANERO_RESOLVER_HINT}
        </p>
        <form className="averias-fontanero__resolver-form" onSubmit={handleSubmit}>
          <label htmlFor={fieldId} className="averias-fontanero__resolver-label">
            {AVERIAS_FONTANERO_RESOLVER_FIELD_LABEL}
          </label>
          <textarea
            ref={textareaRef}
            id={fieldId}
            name="observacionFinal"
            aria-required="true"
            maxLength={OBSERVACION_FINAL_MAX_LENGTH}
            rows={5}
            value={observacionFinal}
            disabled={submitting}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? errorId : undefined}
            onChange={(event) => {
              setObservacionFinal(event.target.value)
              if (fieldError) {
                setFieldError(null)
              }
            }}
          />
          {fieldError ? (
            <p id={errorId} className="averias-fontanero__resolver-error" role="alert">
              {fieldError}
            </p>
          ) : null}
          {submitError ? (
            <ActivityFeedback variant="error" message={submitError} />
          ) : null}
          {submitting ? (
            <p role="status" aria-live="polite">
              {AVERIAS_FONTANERO_RESOLVER_LOADING}
            </p>
          ) : null}
          <div className="confirm-dialog__actions">
            <button
              ref={cancelRef}
              type="button"
              className="confirm-dialog__button confirm-dialog__button--secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              {AVERIAS_FONTANERO_RESOLVER_CANCEL}
            </button>
            <button
              ref={confirmRef}
              type="submit"
              className="confirm-dialog__button confirm-dialog__button--danger"
              disabled={submitting}
            >
              {AVERIAS_FONTANERO_RESOLVER_CONFIRM}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AveriasFontaneroResolverDialog
