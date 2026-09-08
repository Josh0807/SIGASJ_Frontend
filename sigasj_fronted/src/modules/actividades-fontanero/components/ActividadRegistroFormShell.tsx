import { type FormEvent, useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { TipoActividadFontaneroCatalogo } from '../types/tipoActividadFontanero'
import {
  ACTIVIDAD_REGISTRO_FORM_INITIAL,
  type ActividadRegistroFormField,
  type ActividadRegistroFormValues,
} from '../types/actividadRegistroForm'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import {
  hasActividadRegistroFormErrors,
  validateActividadRegistroForm,
  type ActividadRegistroFormErrors,
} from '../utils/validateActividadRegistroForm'
import {
  ACTIVIDAD_REGISTRO_SERVER_ERROR,
  parseActividadRegistroSubmitError,
  toActividadRegistroSubmitMessage,
} from '../utils/actividadRegistroSubmitError'
import { registrarActividad } from '../services/actividadesFontaneroApi'
import { FORMULARIOS_ACTIVIDAD } from './formularios/formulariosActividadRegistry'
import { ACTIVIDADES_FONTANERO_PATHS } from '../actividadesFontaneroPaths'
import { useAuth } from '../../auth/components/AuthContext'

type ActividadRegistroFormShellMode = 'registrar' | 'corregir'

type ActividadRegistroFormShellProps = {
  mode?: ActividadRegistroFormShellMode
  tipo: TipoActividadFontaneroCatalogo
  initialValues?: ActividadRegistroFormValues
  observacionCorreccion?: string | null
  onSubmit?: (values: ActividadRegistroFormValues) => Promise<ActividadFontaneroRegistrada | void>
  onCatalogStale?: () => void
}

const ActividadRegistroFormShell = ({
  mode = 'registrar',
  tipo,
  initialValues,
  observacionCorreccion,
  onSubmit,
  onCatalogStale,
}: ActividadRegistroFormShellProps) => {
  const isCorregirMode = mode === 'corregir'
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [values, setValues] = useState<ActividadRegistroFormValues>(
    initialValues ?? ACTIVIDAD_REGISTRO_FORM_INITIAL,
  )
  const [errors, setErrors] = useState<ActividadRegistroFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [registrada, setRegistrada] = useState<ActividadFontaneroRegistrada | null>(
    null,
  )

  const FormularioEspecifico = FORMULARIOS_ACTIVIDAD[tipo.codigo]

  const updateField = useCallback(
    (field: ActividadRegistroFormField, value: string) => {
      setValues((current) => ({ ...current, [field]: value }))
      setErrors((current) => {
        if (!current[field]) {
          return current
        }
        const next = { ...current }
        delete next[field]
        return next
      })
      setSubmitError(null)
      setIsSuccess(false)
    },
    [],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const nextErrors = validateActividadRegistroForm(values, tipo.codigo)
    setErrors(nextErrors)
    if (hasActividadRegistroFormErrors(nextErrors)) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = onSubmit
        ? await onSubmit(values)
        : await registrarActividad(tipo, values)

      if (result && typeof result === 'object' && 'id' in result) {
        setRegistrada(result)
      }
      setIsSuccess(true)
      if (!isCorregirMode) {
        setValues(ACTIVIDAD_REGISTRO_FORM_INITIAL)
      }
      setErrors({})
      window.dispatchEvent(new CustomEvent('actividades-fontanero:updated'))
    } catch (error) {
      const parsed = parseActividadRegistroSubmitError(error)

      if (parsed.kind === 'validation') {
        setErrors((current) => ({ ...current, ...parsed.fieldErrors }))
        setSubmitError(toActividadRegistroSubmitMessage(error))
        return
      }

      const status = parsed.kind
      if (status === 'not-found') onCatalogStale?.()
      if (status === 'unauthorized') {
        logout()
        navigate('/login', { replace: true })
        return
      }
      if (status === 'save') {
        const httpStatus = error instanceof Error ? error.message : ''
        setSubmitError(
          /HTTP 5\d\d/.test(httpStatus)
            ? ACTIVIDAD_REGISTRO_SERVER_ERROR
            : toActividadRegistroSubmitMessage(error),
        )
        return
      }

      setSubmitError(toActividadRegistroSubmitMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      className={`actividades-fontanero-registro${
        isCorregirMode ? ' actividades-fontanero-registro--corregir' : ''
      }`}
      aria-labelledby="actividad-registro-title"
    >
      <header className="actividades-fontanero-registro__header">
        <p className="actividades-fontanero-registro__eyebrow">Registro de Actividades</p>
        <h1 id="actividad-registro-title">
          {isCorregirMode ? `Corregir: ${tipo.nombre}` : `Registrar: ${tipo.nombre}`}
        </h1>
        <p className="actividades-fontanero-registro__intro">
          {isCorregirMode
            ? 'Revise el motivo de corrección, ajuste los campos permitidos y reenvíe la actividad.'
            : 'Complete la información general y los campos del formulario correspondiente.'}
        </p>
      </header>

      {isCorregirMode && observacionCorreccion ? (
        <div
          className="actividades-fontanero-registro__correccion-banner"
          role="note"
          aria-label="Motivo de corrección"
          data-testid="correccion-motivo-banner"
        >
          <p className="actividades-fontanero-registro__correccion-label">
            Motivo de corrección
          </p>
          <p className="actividades-fontanero-registro__correccion-texto">
            {observacionCorreccion}
          </p>
        </div>
      ) : null}

      {isSuccess ? (
        <div
          className="actividades-fontanero-registro__success"
          role="status"
          data-testid="actividad-registro-exito"
        >
          <p>
            {isCorregirMode ? (
              <>
                La actividad <strong>{tipo.nombre}</strong> fue corregida y reenviada
                {registrada?.id ? (
                  <>
                    {' '}
                    (registro #{registrada.id})
                  </>
                ) : null}
                .
              </>
            ) : (
              <>
                La actividad <strong>{tipo.nombre}</strong> fue registrada correctamente
                {registrada?.id ? (
                  <>
                    {' '}
                    (registro #{registrada.id})
                  </>
                ) : null}
                .
              </>
            )}
          </p>
          <Link
            to={isCorregirMode ? ACTIVIDADES_FONTANERO_PATHS.correcciones : ACTIVIDADES_FONTANERO_PATHS.nueva}
            className="actividades-fontanero-registro__link"
          >
            {isCorregirMode
              ? 'Volver a correcciones pendientes'
              : 'Registrar otra actividad'}
          </Link>
        </div>
      ) : (
        <form
          className="actividad-registro-form"
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isSubmitting}
        >
          <fieldset className="actividad-registro-form__section" disabled={isSubmitting}>
            <legend className="actividad-registro-form__legend">Información general</legend>

            <div className="actividad-registro-form__field">
              <label className="actividad-registro-form__label" htmlFor="fechaActividad">
                Fecha de la actividad <span aria-hidden="true">*</span>
              </label>
              <input
                id="fechaActividad"
                name="fechaActividad"
                type="date"
                className={`actividad-registro-form__input${
                  errors.fechaActividad ? ' actividad-registro-form__input--error' : ''
                }`}
                value={values.fechaActividad}
                onChange={(event) => updateField('fechaActividad', event.target.value)}
                aria-invalid={Boolean(errors.fechaActividad)}
                aria-describedby={
                  errors.fechaActividad ? 'fechaActividad-error' : undefined
                }
                readOnly={isCorregirMode}
                disabled={isCorregirMode}
                required
              />
              {errors.fechaActividad ? (
                <p
                  id="fechaActividad-error"
                  className="actividad-registro-form__error"
                  role="alert"
                >
                  {errors.fechaActividad}
                </p>
              ) : null}
            </div>

            <div className="actividad-registro-form__field">
              <label className="actividad-registro-form__label" htmlFor="titulo">
                Título o resumen <span aria-hidden="true">*</span>
              </label>
              <input
                id="titulo"
                name="titulo"
                type="text"
                maxLength={200}
                className={`actividad-registro-form__input${
                  errors.titulo ? ' actividad-registro-form__input--error' : ''
                }`}
                value={values.titulo}
                onChange={(event) => updateField('titulo', event.target.value)}
                aria-invalid={Boolean(errors.titulo)}
                aria-describedby={errors.titulo ? 'titulo-error' : undefined}
                required
              />
              {errors.titulo ? (
                <p id="titulo-error" className="actividad-registro-form__error" role="alert">
                  {errors.titulo}
                </p>
              ) : null}
            </div>

            <div className="actividad-registro-form__field">
              <label className="actividad-registro-form__label" htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                className="actividad-registro-form__textarea"
                value={values.descripcion}
                onChange={(event) => updateField('descripcion', event.target.value)}
              />
            </div>

            <div className="actividad-registro-form__field">
              <label className="actividad-registro-form__label" htmlFor="ubicacion">
                Ubicación
              </label>
              <input
                id="ubicacion"
                name="ubicacion"
                type="text"
                maxLength={200}
                className={`actividad-registro-form__input${
                  errors.ubicacion ? ' actividad-registro-form__input--error' : ''
                }`}
                value={values.ubicacion}
                onChange={(event) => updateField('ubicacion', event.target.value)}
                aria-invalid={Boolean(errors.ubicacion)}
                aria-describedby={errors.ubicacion ? 'ubicacion-error' : undefined}
              />
              {errors.ubicacion ? (
                <p
                  id="ubicacion-error"
                  className="actividad-registro-form__error"
                  role="alert"
                >
                  {errors.ubicacion}
                </p>
              ) : null}
            </div>

            <div className="actividad-registro-form__field">
              <label className="actividad-registro-form__label" htmlFor="observaciones">
                Observaciones
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                rows={3}
                className="actividad-registro-form__textarea"
                value={values.observaciones}
                onChange={(event) => updateField('observaciones', event.target.value)}
                readOnly={isCorregirMode}
                disabled={isCorregirMode}
              />
            </div>
          </fieldset>

          <FormularioEspecifico
            values={values}
            errors={errors}
            disabled={isSubmitting}
            onChange={updateField}
            onFilesChange={(files) => {
              if (isCorregirMode) {
                return
              }
              setValues((current) => ({ ...current, documentos: files }))
              setErrors((current) => {
                const next = { ...current }
                delete next.documentos
                return next
              })
              setSubmitError(null)
            }}
          />

          {submitError ? (
            <p className="actividad-registro-form__submit-error" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="actividad-registro-form__actions">
            <Link
              to={
                isCorregirMode
                  ? ACTIVIDADES_FONTANERO_PATHS.correcciones
                  : ACTIVIDADES_FONTANERO_PATHS.nueva
              }
              className="actividad-registro-form__button actividad-registro-form__button--secondary"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="actividad-registro-form__button actividad-registro-form__button--primary"
              disabled={isSubmitting}
              aria-disabled={isSubmitting}
            >
              {isSubmitting
                ? isCorregirMode
                  ? 'Reenviando…'
                  : 'Registrando…'
                : isCorregirMode
                  ? 'Reenviar actividad corregida'
                  : 'Registrar actividad'}
            </button>
          </div>
        </form>
      )}

      {!isSuccess ? (
        <Link
          to={
            isCorregirMode
              ? ACTIVIDADES_FONTANERO_PATHS.correcciones
              : ACTIVIDADES_FONTANERO_PATHS.nueva
          }
          className="actividades-fontanero-registro__back"
        >
          {isCorregirMode
            ? 'Volver a correcciones pendientes'
            : 'Cambiar tipo de actividad'}
        </Link>
      ) : null}
    </section>
  )
}

export default ActividadRegistroFormShell
