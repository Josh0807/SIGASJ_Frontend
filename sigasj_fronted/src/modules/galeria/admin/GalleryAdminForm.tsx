import { type FormEvent, useEffect, useState } from 'react'
import { IconPhoto, IconUpload } from '@tabler/icons-react'
import { Button } from '../../../shared/ui'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import type { GalleryFormValues } from './types'
import {
  formatGalleryMaxSizeLabel,
  validateGalleryImageFile,
} from './validateGalleryImageFile'

type GalleryAdminFormProps = {
  mode: 'create' | 'edit'
  initialValues: GalleryFormValues
  currentImageUrl?: string
  submitting?: boolean
  onSubmit: (values: GalleryFormValues, file: File | null) => Promise<void>
  onCancel: () => void
}

const GalleryAdminForm = ({
  mode,
  initialValues,
  currentImageUrl,
  submitting = false,
  onSubmit,
  onCancel,
}: GalleryAdminFormProps) => {
  const [values, setValues] = useState(initialValues)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [altError, setAltError] = useState<string | null>(null)
  const [valuesSource, setValuesSource] = useState(initialValues)
  const [modeSource, setModeSource] = useState(mode)

  if (initialValues !== valuesSource || mode !== modeSource) {
    setValuesSource(initialValues)
    setModeSource(mode)
    setValues(initialValues)
    setFile(null)
    setFileError(null)
    setFormError(null)
    setAltError(null)
  }

  if (!file && previewUrl !== null) {
    setPreviewUrl(null)
  }

  useEffect(() => {
    if (!file) return undefined

    const objectUrl = URL.createObjectURL(file)
    const cancelScheduled = runAfterEffect(() => setPreviewUrl(objectUrl))

    return () => {
      cancelScheduled()
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const previewSource = previewUrl ?? currentImageUrl

  const onFileChange = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null)
      setFileError(null)
      return
    }

    const validationError = validateGalleryImageFile(nextFile)
    if (validationError) {
      setFile(null)
      setFileError(validationError)
      return
    }

    setFile(nextFile)
    setFileError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setAltError(null)

    if (!values.textoAlternativo.trim()) {
      setAltError('El texto alternativo es obligatorio.')
      return
    }

    if (mode === 'create' && !file) {
      setFormError('Debes seleccionar una imagen.')
      return
    }

    try {
      await onSubmit(
        {
          ...values,
          titulo: values.titulo.trim(),
          descripcion: values.descripcion.trim(),
          textoAlternativo: values.textoAlternativo.trim(),
        },
        file,
      )
    } catch {
      setFormError('No fue posible guardar la fotografía.')
    }
  }

  return (
    <form
      className="gallery-admin__form gallery-admin__form--editor admin-modern-form w-full !max-w-none"
      onSubmit={handleSubmit}
    >
      <div className="gallery-admin__form-grid">
        <div className="gallery-admin__form-fields">
          <label className="gallery-admin__field">
            <span>Título (opcional)</span>
            <input
              type="text"
              maxLength={150}
              value={values.titulo}
              placeholder="Ej. Asamblea ordinaria 2026"
              onChange={(event) =>
                setValues((current) => ({ ...current, titulo: event.target.value }))
              }
            />
          </label>

          <label className="gallery-admin__field">
            <span>Descripción (opcional)</span>
            <textarea
              maxLength={500}
              rows={4}
              value={values.descripcion}
              placeholder="Breve contexto de la fotografía"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  descripcion: event.target.value,
                }))
              }
            />
          </label>

          <label className="gallery-admin__field">
            <span>Texto alternativo *</span>
            <input
              type="text"
              maxLength={255}
              required
              aria-invalid={Boolean(altError)}
              aria-describedby={altError ? 'gallery-alt-error' : undefined}
              value={values.textoAlternativo}
              placeholder="Describe la imagen para accesibilidad"
              onChange={(event) => {
                setAltError(null)
                setValues((current) => ({
                  ...current,
                  textoAlternativo: event.target.value,
                }))
              }}
            />
            {altError ? (
              <small id="gallery-alt-error" className="gallery-admin__form-error" role="alert">
                {altError}
              </small>
            ) : null}
          </label>

          <div className="gallery-admin__field-row gallery-admin__field-row--meta">
            <label className="gallery-admin__field gallery-admin__field--orden">
              <span>Orden</span>
              <input
                type="number"
                min={0}
                value={values.ordenVisualizacion}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    ordenVisualizacion: Number(event.target.value) || 0,
                  }))
                }
              />
            </label>

            <label className="gallery-admin__checkbox gallery-admin__checkbox--card">
              <input
                type="checkbox"
                checked={values.activo}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    activo: event.target.checked,
                  }))
                }
              />
              <span>
                <strong>Visible en la galería pública</strong>
                <small>Si se desactiva, no se muestra en la landing.</small>
              </span>
            </label>
          </div>
        </div>

        <aside className="gallery-admin__media-card" aria-label="Imagen de la fotografía">
          <div className="gallery-admin__media-preview">
            {previewSource ? (
              <img src={previewSource} alt="Vista previa de la fotografía" />
            ) : (
              <div className="gallery-admin__media-empty">
                <IconPhoto size={34} aria-hidden="true" />
                <span>Sin imagen seleccionada</span>
              </div>
            )}
          </div>

          <label className="gallery-admin__field gallery-admin__field--file">
            <span>
              {mode === 'create' ? 'Imagen *' : 'Reemplazar imagen (opcional)'}
            </span>
            <span className="gallery-admin__file-control">
              <IconUpload size={18} aria-hidden="true" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
              />
            </span>
            <small>
              {file
                ? file.name
                : `Máximo ${formatGalleryMaxSizeLabel()}. Formatos: JPG, PNG, WebP.`}
            </small>
          </label>

          {fileError ? (
            <p className="gallery-admin__form-error" role="alert">
              {fileError}
            </p>
          ) : null}
        </aside>
      </div>

      {formError ? (
        <p className="gallery-admin__form-error" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="gallery-admin__form-actions">
        <Button type="submit" variant="primary" disabled={submitting} loading={submitting}>
          {submitting
            ? 'Guardando…'
            : mode === 'create'
              ? 'Guardar fotografía'
              : 'Guardar cambios'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export default GalleryAdminForm
