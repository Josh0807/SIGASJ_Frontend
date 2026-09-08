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

type ActividadRegistroFormShellProps = {
  tipo: TipoActividadFontaneroCatalogo
  onSubmit?: (values: ActividadRegistroFormValues) => Promise<ActividadFontaneroRegistrada | void>
  onCatalogStale?: () => void
}

const ActividadRegistroFormShell = ({
  tipo,
  onSubmit,
  onCatalogStale,
}: ActividadRegistroFormShellProps) => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [values, setValues] = useState<ActividadRegistroFormValues>(
    ACTIVIDAD_REGISTRO_FORM_INITIAL,
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
      setValues(ACTIVIDAD_REGISTRO_FORM_INITIAL)
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
      className="actividades-fontanero-registro"
      aria-labelledby="actividad-registro-title"
    >
      <header className="actividades-fontanero-registro__header">
        <p className="actividades-fontanero-registro__eyebrow">Registro de Actividades</p>
        <h1 id="actividad-registro-title">Registrar: {tipo.nombre}</h1>
        <p className="actividades-fontanero-registro__intro">
          Complete la información general y los campos del formulario correspondiente.
        </p>
      </header>

      {isSuccess ? (
        <div
          className="actividades-fontanero-registro__success"
          role="status"
          data-testid="actividad-registro-exito"
        >
          <p>
            La actividad <strong>{tipo.nombre}</strong> fue registrada correctamente
            {registrada?.id ? (
              <>
                {' '}
                (registro #{registrada.id})
              </>
            ) : null}
            .
          </p>
          <Link
            to={ACTIVIDADES_FONTANERO_PATHS.nueva}
            className="actividades-fontanero-registro__link"
          >
            Registrar otra actividad
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
              />
            </div>
          </fieldset>

          <FormularioEspecifico
            values={values}
            errors={errors}
            disabled={isSubmitting}
            onChange={updateField}
            onFilesChange={(files) => {
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
              to={ACTIVIDADES_FONTANERO_PATHS.nueva}
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
              {isSubmitting ? 'Registrando…' : 'Registrar actividad'}
            </button>
          </div>
        </form>
      )}

      {!isSuccess ? (
        <Link
          to={ACTIVIDADES_FONTANERO_PATHS.nueva}
          className="actividades-fontanero-registro__back"
        >
          Cambiar tipo de actividad
        </Link>
      ) : null}
    </section>
  )
}

export default ActividadRegistroFormShell
