import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createPublicAveria } from '../services/averiasApi'
import type { PublicAveriaConfirmation } from '../types/publicAveriaApi'
import {
  EMPTY_PUBLIC_AVERIA_FORM,
  PUBLIC_AVERIA_FIELD_ORDER,
  type PublicAveriaFormErrors,
  type PublicAveriaFormValues,
} from '../types/publicAveriaForm'
import { parsePublicAveriaSubmitError } from '../utils/parsePublicAveriaSubmitError'
import { toCreatePublicAveriaPayload } from '../utils/toCreatePublicAveriaPayload'
import { validatePublicAveriaForm } from '../utils/validatePublicAveriaForm'

const fieldId = (prefix: string, name: string) => `${prefix}-${name}`

export default function ReportarAveriaForm() {
  const idPrefix = useId()
  const confirmationRef = useRef<HTMLDivElement>(null)
  const submittingRef = useRef(false)
  const mountedRef = useRef(true)
  const [values, setValues] = useState<PublicAveriaFormValues>(EMPTY_PUBLIC_AVERIA_FORM)
  const [errors, setErrors] = useState<PublicAveriaFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedReport, setSubmittedReport] = useState<PublicAveriaConfirmation | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const update = (name: keyof PublicAveriaFormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submittingRef.current) {
      return
    }

    setFormError(null)
    const nextErrors = validatePublicAveriaForm(values)
    setErrors(nextErrors)

    const firstInvalid = PUBLIC_AVERIA_FIELD_ORDER.find((name) => nextErrors[name])
    if (firstInvalid) {
      document.getElementById(fieldId(idPrefix, firstInvalid))?.focus()
      return
    }

    submittingRef.current = true
    setIsSubmitting(true)

    try {
      const confirmation = await createPublicAveria(toCreatePublicAveriaPayload(values))
      if (!mountedRef.current) {
        return
      }

      setSubmittedReport(confirmation)
      setValues(EMPTY_PUBLIC_AVERIA_FORM)
      setErrors({})
      setFormError(null)
      queueMicrotask(() => confirmationRef.current?.focus())
    } catch (error) {
      if (!mountedRef.current) {
        return
      }
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      const parsed = parsePublicAveriaSubmitError(error)
      setErrors(parsed.fieldErrors)
      setFormError(parsed.formMessage)

      const firstInvalidField = PUBLIC_AVERIA_FIELD_ORDER.find((name) => parsed.fieldErrors[name])
      if (firstInvalidField) {
        document.getElementById(fieldId(idPrefix, firstInvalidField))?.focus()
      }
    } finally {
      submittingRef.current = false
      if (mountedRef.current) {
        setIsSubmitting(false)
      }
    }
  }

  const errorId = (name: keyof PublicAveriaFormValues) =>
    errors[name] ? `${fieldId(idPrefix, name)}-error` : undefined

  const formErrorId = formError ? `${idPrefix}-form-error` : undefined

  const requiredLabel = (text: string) => (
    <span className="public-averia-form__label-row">
      <span>{text}</span>
      <span className="public-averia-form__required" aria-hidden="true">
        *
      </span>
    </span>
  )

  const optionalLabel = (text: string) => (
    <span className="public-averia-form__label-row">
      <span>{text}</span>
      <span className="public-averia-form__optional">Opcional</span>
    </span>
  )

  return (
    <form
      className="public-averia-form"
      noValidate
      onSubmit={handleSubmit}
      aria-busy={isSubmitting ? true : undefined}
      aria-describedby={formErrorId}
      data-submitting={isSubmitting ? 'true' : 'false'}
    >
      {submittedReport ? (
        <div
          ref={confirmationRef}
          className="public-averia-form__success"
          role="status"
          tabIndex={-1}
        >
          <p className="public-averia-form__success-title">{submittedReport.message}</p>
          <p className="public-averia-form__success-label">Código de seguimiento</p>
          <p className="public-averia-form__code">{submittedReport.codigoSeguimiento}</p>
          <p>Conserve este código para identificar su reporte.</p>
        </div>
      ) : null}

      {formError ? (
        <p id={formErrorId} className="receipt-query-page__error-alert public-averia-form__form-error" role="alert">
          {formError}
        </p>
      ) : null}

      {isSubmitting ? (
        <p className="visually-hidden" role="status">
          Enviando reporte...
        </p>
      ) : null}

      <fieldset className="public-averia-form__fieldset" disabled={isSubmitting}>
        <section className="public-averia-form__section" aria-labelledby={`${idPrefix}-reportante`}>
          <h2 id={`${idPrefix}-reportante`}>Datos del Reportante</h2>
          <div className="public-averia-form__grid public-averia-form__grid--pair">
            <div className="public-averia-form__field">
              <label htmlFor={fieldId(idPrefix, 'nombreReportante')}>
                {requiredLabel('Nombre completo')}
              </label>
              <input
                id={fieldId(idPrefix, 'nombreReportante')}
                name="nombreReportante"
                type="text"
                autoComplete="name"
                maxLength={150}
                required
                aria-required="true"
                aria-invalid={Boolean(errors.nombreReportante)}
                aria-describedby={errorId('nombreReportante')}
                value={values.nombreReportante}
                onChange={(event) => update('nombreReportante', event.target.value)}
              />
              {errors.nombreReportante ? (
                <small id={errorId('nombreReportante')} className="public-averia-form__error" role="alert">
                  {errors.nombreReportante}
                </small>
              ) : null}
            </div>

            <div className="public-averia-form__field">
              <label htmlFor={fieldId(idPrefix, 'identificacionReportante')}>
                {optionalLabel('Número de cédula o identificación')}
              </label>
              <input
                id={fieldId(idPrefix, 'identificacionReportante')}
                name="identificacionReportante"
                type="text"
                inputMode="text"
                maxLength={50}
                aria-invalid={Boolean(errors.identificacionReportante)}
                aria-describedby={errorId('identificacionReportante')}
                value={values.identificacionReportante}
                onChange={(event) => update('identificacionReportante', event.target.value)}
              />
              {errors.identificacionReportante ? (
                <small
                  id={errorId('identificacionReportante')}
                  className="public-averia-form__error"
                  role="alert"
                >
                  {errors.identificacionReportante}
                </small>
              ) : null}
            </div>

            <div className="public-averia-form__field">
              <label htmlFor={fieldId(idPrefix, 'telefonoReportante')}>
                {requiredLabel('Número telefónico de contacto')}
              </label>
              <input
                id={fieldId(idPrefix, 'telefonoReportante')}
                name="telefonoReportante"
                type="tel"
                autoComplete="tel"
                maxLength={50}
                required
                aria-required="true"
                aria-invalid={Boolean(errors.telefonoReportante)}
                aria-describedby={errorId('telefonoReportante')}
                value={values.telefonoReportante}
                onChange={(event) => update('telefonoReportante', event.target.value)}
              />
              {errors.telefonoReportante ? (
                <small id={errorId('telefonoReportante')} className="public-averia-form__error" role="alert">
                  {errors.telefonoReportante}
                </small>
              ) : null}
            </div>

            <div className="public-averia-form__field">
              <label htmlFor={fieldId(idPrefix, 'correoReportante')}>
                {optionalLabel('Correo electrónico')}
              </label>
              <input
                id={fieldId(idPrefix, 'correoReportante')}
                name="correoReportante"
                type="email"
                autoComplete="email"
                maxLength={150}
                aria-invalid={Boolean(errors.correoReportante)}
                aria-describedby={errorId('correoReportante')}
                value={values.correoReportante}
                onChange={(event) => update('correoReportante', event.target.value)}
              />
              {errors.correoReportante ? (
                <small id={errorId('correoReportante')} className="public-averia-form__error" role="alert">
                  {errors.correoReportante}
                </small>
              ) : null}
            </div>
          </div>
        </section>

        <section className="public-averia-form__section" aria-labelledby={`${idPrefix}-averia`}>
          <h2 id={`${idPrefix}-averia`}>Información de la avería</h2>
          <div className="public-averia-form__stack">
            <div className="public-averia-form__field">
              <label htmlFor={fieldId(idPrefix, 'ubicacion')}>
                {requiredLabel('Dirección o ubicación exacta')}
              </label>
              <textarea
                id={fieldId(idPrefix, 'ubicacion')}
                name="ubicacion"
                rows={3}
                maxLength={500}
                required
                aria-required="true"
                aria-invalid={Boolean(errors.ubicacion)}
                aria-describedby={errorId('ubicacion')}
                placeholder="Ej. 200 metros al norte de la escuela, frente a la pulpería"
                value={values.ubicacion}
                onChange={(event) => update('ubicacion', event.target.value)}
              />
              {errors.ubicacion ? (
                <small id={errorId('ubicacion')} className="public-averia-form__error" role="alert">
                  {errors.ubicacion}
                </small>
              ) : null}
            </div>

            <div className="public-averia-form__field">
              <label htmlFor={fieldId(idPrefix, 'sectorComunidad')}>
                {requiredLabel('Sector o comunidad')}
              </label>
              <input
                id={fieldId(idPrefix, 'sectorComunidad')}
                name="sectorComunidad"
                type="text"
                maxLength={150}
                required
                aria-required="true"
                aria-invalid={Boolean(errors.sectorComunidad)}
                aria-describedby={errorId('sectorComunidad')}
                value={values.sectorComunidad}
                onChange={(event) => update('sectorComunidad', event.target.value)}
              />
              {errors.sectorComunidad ? (
                <small id={errorId('sectorComunidad')} className="public-averia-form__error" role="alert">
                  {errors.sectorComunidad}
                </small>
              ) : null}
            </div>

            <div className="public-averia-form__field">
              <label htmlFor={fieldId(idPrefix, 'descripcion')}>
                {requiredLabel('Descripción detallada del problema')}
              </label>
              <textarea
                id={fieldId(idPrefix, 'descripcion')}
                name="descripcion"
                rows={6}
                maxLength={4000}
                required
                aria-required="true"
                aria-invalid={Boolean(errors.descripcion)}
                aria-describedby={errorId('descripcion')}
                placeholder="Indique qué ocurre, dónde se observa y cualquier referencia útil."
                value={values.descripcion}
                onChange={(event) => update('descripcion', event.target.value)}
              />
              {errors.descripcion ? (
                <small id={errorId('descripcion')} className="public-averia-form__error" role="alert">
                  {errors.descripcion}
                </small>
              ) : null}
            </div>
          </div>
        </section>

        <div className="public-averia-form__actions">
          <button
            type="submit"
            className="receipt-query-page__button receipt-query-page__button--primary public-averia-form__submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting ? true : undefined}
          >
            {isSubmitting ? (
              <>
                <span
                  className="receipt-query-page__spinner public-averia-form__submit-spinner"
                  aria-hidden="true"
                />
                Enviando reporte...
              </>
            ) : (
              'Enviar reporte'
            )}
          </button>
        </div>
      </fieldset>
    </form>
  )
}
