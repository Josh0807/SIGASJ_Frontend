import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react'
import {
  ESTADO_PROYECTO_OPTIONS,
  PROYECTO_ESTADO_UPDATE_PENDING,
  type EstadoProyecto,
} from '../types/estadoProyecto'
import { type ProyectoFormValues } from './types'
import {
  parseProyectoSubmitError,
  PROYECTO_SAVE_FALLBACK_ERROR,
  type ProyectoFormField,
} from './proyectoSubmitError'
import {
  PROYECTO_DURACION_MAX_LENGTH,
  PROYECTO_ENCARGADO_MAX_LENGTH,
  PROYECTO_NOMBRE_MAX_LENGTH,
  getProyectoFormValidationError,
  validateProyectoImagenFile,
} from './validateProyectoForm'

type ProyectosAdminFormProps = {
  mode: 'create' | 'edit'
  initialValues: ProyectoFormValues
  onSubmit: (
    values: ProyectoFormValues,
    imagenFile?: File | null,
    removeImagen?: boolean,
  ) => Promise<void>
  onCancel: () => void
}

const NOMBRE_INPUT_ID = 'proyectos-form-nombre'
const DESCRIPCION_INPUT_ID = 'proyectos-form-descripcion'
const ENCARGADO_INPUT_ID = 'proyectos-form-encargado'
const DURACION_INPUT_ID = 'proyectos-form-duracion'
const ESTADO_INPUT_ID = 'proyectos-form-estado'
const IMAGEN_INPUT_ID = 'proyectos-form-imagen-principal'
const ESTADO_PENDING_HINT_ID = 'proyectos-form-estado-pending'
const FORM_ERROR_ID = 'proyectos-form-error'

const FIELD_ERROR_IDS: Record<ProyectoFormField, string> = {
  nombre: 'proyectos-form-nombre-error',
  descripcion: 'proyectos-form-descripcion-error',
  encargadoRealizacion: 'proyectos-form-encargado-error',
  duracion: 'proyectos-form-duracion-error',
  estado: 'proyectos-form-estado-error',
  imagenPrincipalUrl: 'proyectos-form-imagen-error',
  imagenPrincipal: 'proyectos-form-imagen-error',
}

const ProyectosAdminForm = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
}: ProyectosAdminFormProps) => {
  const [values, setValues] = useState(initialValues)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [removeImagen, setRemoveImagen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ProyectoFormField, string>>
  >({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)
  const [valuesSource, setValuesSource] = useState(initialValues)
  const [modeSource, setModeSource] = useState(mode)

  if (initialValues !== valuesSource || mode !== modeSource) {
    setValuesSource(initialValues)
    setModeSource(mode)
    setValues(initialValues)
    setSelectedFile(null)
    setRemoveImagen(false)
    setFormError(null)
    setFieldErrors({})
  }

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [selectedFile])

  const estadoLocked = mode === 'edit' && PROYECTO_ESTADO_UPDATE_PENDING

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }

    const file = files[0]
    const imageError = validateProyectoImagenFile(file)
    if (imageError) {
      setSelectedFile(null)
      setFieldErrors((current) => ({
        ...current,
        imagenPrincipal: imageError,
      }))
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setFieldErrors((current) => {
      const next = { ...current }
      delete next.imagenPrincipal
      return next
    })
    setSelectedFile(file)
    setRemoveImagen(false)
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setRemoveImagen(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setFieldErrors((current) => {
      const next = { ...current }
      delete next.imagenPrincipal
      return next
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmittingRef.current) {
      return
    }

    if (fieldErrors.imagenPrincipal) {
      return
    }

    const currentFileInput = fileInputRef.current?.files?.[0]
    if (currentFileInput) {
      const imageError = validateProyectoImagenFile(currentFileInput)
      if (imageError) {
        setFieldErrors((current) => ({ ...current, imagenPrincipal: imageError }))
        return
      }
    }

    setFormError(null)
    setFieldErrors({})

    const validationError = getProyectoFormValidationError(values)
    if (validationError) {
      setFieldErrors({ [validationError.field]: validationError.message })
      return
    }

    isSubmittingRef.current = true
    setIsSubmitting(true)

    try {
      await onSubmit(
        {
          nombre: values.nombre.trim(),
          descripcion: values.descripcion.trim(),
          encargadoRealizacion: values.encargadoRealizacion.trim(),
          duracion: values.duracion.trim(),
          estado: values.estado,
          imagenPrincipalUrl: values.imagenPrincipalUrl,
        },
        selectedFile,
        removeImagen,
      )
    } catch (error) {
      isSubmittingRef.current = false
      setIsSubmitting(false)

      const parsed = parseProyectoSubmitError(error)
      if (parsed.kind === 'unauthorized' || parsed.kind === 'forbidden') {
        return
      }

      if (parsed.kind === 'not-found') {
        if (mode === 'edit') {
          return
        }
        setFormError(PROYECTO_SAVE_FALLBACK_ERROR)
        return
      }

      if (parsed.kind === 'validation') {
        setFieldErrors(parsed.fieldErrors)
        setFormError(parsed.formMessage)
        return
      }

      setFormError(PROYECTO_SAVE_FALLBACK_ERROR)
    }
  }

  const submitLabel = isSubmitting
    ? mode === 'edit'
      ? 'Actualizando…'
      : 'Guardando…'
    : 'Guardar'

  const describedBy = (
    field: ProyectoFormField,
    extraId?: string,
  ): string | undefined => {
    const ids = [
      extraId,
      fieldErrors[field] ? FIELD_ERROR_IDS[field] : undefined,
    ].filter(Boolean)
    return ids.length > 0 ? ids.join(' ') : undefined
  }

  const fieldAlert = (field: ProyectoFormField) =>
    fieldErrors[field] ? (
      <small
        className="gallery-admin__form-error"
        role="alert"
        id={FIELD_ERROR_IDS[field]}
      >
        {fieldErrors[field]}
      </small>
    ) : null

  const updateField = (field: ProyectoFormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }) as ProyectoFormValues)
    if (fieldErrors[field]) {
      setFieldErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
    }
  }

  return (
    <form
      className="gallery-admin__form proyectos-admin__form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting ? true : undefined}
      aria-describedby={formError ? FORM_ERROR_ID : undefined}
    >
      <h2>{mode === 'create' ? 'Nuevo proyecto' : 'Editar proyecto'}</h2>

      <label className="gallery-admin__field" htmlFor={NOMBRE_INPUT_ID}>
        <span>Nombre del proyecto *</span>
        <input
          id={NOMBRE_INPUT_ID}
          name="nombre"
          type="text"
          autoComplete="off"
          maxLength={PROYECTO_NOMBRE_MAX_LENGTH}
          required
          aria-required="true"
          aria-invalid={fieldErrors.nombre ? true : undefined}
          aria-describedby={describedBy('nombre')}
          value={values.nombre}
          onChange={(event) => updateField('nombre', event.target.value)}
        />
        {fieldAlert('nombre')}
      </label>

      <div className="gallery-admin__field proyectos-admin__cover-field">
        <label htmlFor={IMAGEN_INPUT_ID}>
          <span>Fotografía de portada (Imagen principal)</span>
        </label>
        <div className="proyectos-admin__cover-container">
          {previewUrl ? (
            <div className="proyectos-admin__cover-preview-wrapper">
              <img
                src={previewUrl}
                alt="Vista previa de portada seleccionada"
                className="proyectos-admin__cover-preview"
              />
              <span className="proyectos-admin__cover-badge proyectos-admin__cover-badge--new">
                Nueva portada (sin guardar)
              </span>
            </div>
          ) : !removeImagen && values.imagenPrincipalUrl ? (
            <div className="proyectos-admin__cover-preview-wrapper">
              <img
                src={values.imagenPrincipalUrl}
                alt="Portada actual del proyecto"
                className="proyectos-admin__cover-preview"
              />
              <span className="proyectos-admin__cover-badge">
                Portada actual
              </span>
            </div>
          ) : (
            <div className="proyectos-admin__cover-empty">
              <svg
                className="proyectos-admin__cover-icon"
                aria-hidden="true"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p>No se ha asignado una imagen de portada</p>
              <small>JPG, PNG, WEBP o GIF (Máx. 5 MB)</small>
            </div>
          )}

          <div className="proyectos-admin__cover-controls">
            <input
              ref={fileInputRef}
              id={IMAGEN_INPUT_ID}
              name="imagenPrincipal"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              className="proyectos-admin__file-input"
              aria-invalid={fieldErrors.imagenPrincipal ? true : undefined}
              aria-describedby={describedBy('imagenPrincipal')}
              onChange={handleFileChange}
            />

            {selectedFile || (!removeImagen && values.imagenPrincipalUrl) ? (
              <button
                type="button"
                className="gallery-admin__button gallery-admin__button--danger proyectos-admin__remove-cover-btn"
                onClick={handleRemoveImage}
              >
                Quitar portada
              </button>
            ) : null}
          </div>
        </div>
        {fieldAlert('imagenPrincipal')}
      </div>

      <label className="gallery-admin__field" htmlFor={DESCRIPCION_INPUT_ID}>
        <span>Descripción</span>
        <textarea
          id={DESCRIPCION_INPUT_ID}
          name="descripcion"
          rows={6}
          value={values.descripcion}
          aria-invalid={fieldErrors.descripcion ? true : undefined}
          aria-describedby={describedBy('descripcion')}
          onChange={(event) => updateField('descripcion', event.target.value)}
        />
        {fieldAlert('descripcion')}
      </label>

      <label className="gallery-admin__field" htmlFor={ENCARGADO_INPUT_ID}>
        <span>Encargado de realización *</span>
        <input
          id={ENCARGADO_INPUT_ID}
          name="encargadoRealizacion"
          type="text"
          autoComplete="off"
          maxLength={PROYECTO_ENCARGADO_MAX_LENGTH}
          required
          aria-required="true"
          aria-invalid={fieldErrors.encargadoRealizacion ? true : undefined}
          aria-describedby={describedBy('encargadoRealizacion')}
          value={values.encargadoRealizacion}
          onChange={(event) =>
            updateField('encargadoRealizacion', event.target.value)
          }
        />
        {fieldAlert('encargadoRealizacion')}
      </label>

      <div className="gallery-admin__field-row proyectos-admin__form-row">
        <label className="gallery-admin__field" htmlFor={DURACION_INPUT_ID}>
          <span>Duración *</span>
          <input
            id={DURACION_INPUT_ID}
            name="duracion"
            type="text"
            autoComplete="off"
            maxLength={PROYECTO_DURACION_MAX_LENGTH}
            placeholder="Ej. 8 meses"
            required
            aria-required="true"
            aria-invalid={fieldErrors.duracion ? true : undefined}
            aria-describedby={describedBy('duracion')}
            value={values.duracion}
            onChange={(event) => updateField('duracion', event.target.value)}
          />
          {fieldAlert('duracion')}
        </label>

        <label className="gallery-admin__field" htmlFor={ESTADO_INPUT_ID}>
          <span>Estado *</span>
          <select
            id={ESTADO_INPUT_ID}
            name="estado"
            required
            aria-required="true"
            disabled={estadoLocked}
            aria-invalid={fieldErrors.estado ? true : undefined}
            aria-describedby={describedBy(
              'estado',
              estadoLocked ? ESTADO_PENDING_HINT_ID : undefined,
            )}
            value={values.estado}
            onChange={(event) =>
              updateField('estado', event.target.value as EstadoProyecto | '')
            }
          >
            {mode === 'create' ? (
              <option value="">Seleccione un estado</option>
            ) : null}
            {ESTADO_PROYECTO_OPTIONS.map((estado) => (
              <option value={estado.value} key={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
          {estadoLocked ? (
            <small id={ESTADO_PENDING_HINT_ID}>
              El cambio de estado de ejecución todavía no está disponible.
            </small>
          ) : null}
          {fieldAlert('estado')}
        </label>
      </div>

      {formError ? (
        <p className="gallery-admin__form-error" role="alert" id={FORM_ERROR_ID}>
          {formError}
        </p>
      ) : null}

      <div className="gallery-admin__form-actions proyectos-admin__form-actions">
        <button type="button" className="gallery-admin__button" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="submit"
          className="gallery-admin__button gallery-admin__button--primary"
          disabled={isSubmitting}
          aria-live="polite"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ProyectosAdminForm
