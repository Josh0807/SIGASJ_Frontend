import { type FormEvent, useEffect, useState } from 'react'
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

  useEffect(() => {
    setValues(initialValues)
    setFile(null)
    setFileError(null)
    setFormError(null)
  }, [initialValues, mode])

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => {
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

    if (!values.textoAlternativo.trim()) {
      setFormError('El texto alternativo es obligatorio.')
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
    <form className="gallery-admin__form" onSubmit={handleSubmit}>
      <h2>{mode === 'create' ? 'Nueva fotografía' : 'Editar fotografía'}</h2>

      <label className="gallery-admin__field">
        <span>Título (opcional)</span>
        <input
          type="text"
          maxLength={150}
          value={values.titulo}
          onChange={(event) =>
            setValues((current) => ({ ...current, titulo: event.target.value }))
          }
        />
      </label>

      <label className="gallery-admin__field">
        <span>Descripción (opcional)</span>
        <textarea
          maxLength={500}
          rows={3}
          value={values.descripcion}
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
          value={values.textoAlternativo}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              textoAlternativo: event.target.value,
            }))
          }
        />
      </label>

      <div className="gallery-admin__field-row">
        <label className="gallery-admin__field">
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

        <label className="gallery-admin__checkbox">
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
          <span>Visible en la galería pública</span>
        </label>
      </div>

      <label className="gallery-admin__field">
        <span>
          {mode === 'create' ? 'Imagen *' : 'Reemplazar imagen (opcional)'}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        <small>Máximo {formatGalleryMaxSizeLabel()}. Formatos: JPG, PNG, WebP.</small>
      </label>

      {fileError ? (
        <p className="gallery-admin__form-error" role="alert">
          {fileError}
        </p>
      ) : null}

      {previewSource ? (
        <div className="gallery-admin__preview">
          <img src={previewSource} alt="Vista previa de la fotografía" />
        </div>
      ) : null}

      {formError ? (
        <p className="gallery-admin__form-error" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="gallery-admin__form-actions">
        <button type="button" className="gallery-admin__button" onClick={onCancel}>
          Cancelar
        </button>
        <button
          type="submit"
          className="gallery-admin__button gallery-admin__button--primary"
          disabled={submitting}
        >
          {submitting ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default GalleryAdminForm
