import { type FormEvent, useEffect, useState } from 'react'
import type { TransparenciaFormValues } from './types'
import {
  describeTransparenciaFile,
  formatTransparenciaMaxSizeLabel,
  validateTransparenciaFile,
} from './validateTransparenciaFile'
import { isTransparenciaImageType } from './types'
import type { TransparencyFileType } from '../types'

type TransparenciaAdminFormProps = {
  mode: 'create' | 'edit'
  initialValues: TransparenciaFormValues
  currentFileUrl?: string
  currentFileType?: TransparencyFileType
  submitting?: boolean
  onSubmit: (values: TransparenciaFormValues, file: File | null) => Promise<void>
  onCancel: () => void
}

const TransparenciaAdminForm = ({
  mode,
  initialValues,
  currentFileUrl,
  currentFileType,
  submitting = false,
  onSubmit,
  onCancel,
}: TransparenciaAdminFormProps) => {
  const [values, setValues] = useState(initialValues)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedFileLabel, setSelectedFileLabel] = useState<string | null>(
    null,
  )

  useEffect(() => {
    setValues(initialValues)
    setFile(null)
    setFileError(null)
    setFormError(null)
    setSelectedFileLabel(null)
  }, [initialValues, mode])

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const previewSource =
    previewUrl ??
    (currentFileUrl && currentFileType && isTransparenciaImageType(currentFileType)
      ? currentFileUrl
      : null)

  const onFileChange = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null)
      setFileError(null)
      setSelectedFileLabel(null)
      return
    }

    const validationError = validateTransparenciaFile(nextFile)
    if (validationError) {
      setFile(null)
      setFileError(validationError)
      setSelectedFileLabel(null)
      return
    }

    setFile(nextFile)
    setFileError(null)
    setSelectedFileLabel(describeTransparenciaFile(nextFile))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!values.nombre.trim()) {
      setFormError('El nombre es obligatorio.')
      return
    }

    if (!values.descripcionBreve.trim()) {
      setFormError('La descripción breve es obligatoria.')
      return
    }

    if (mode === 'create' && !file) {
      setFormError('Debes seleccionar un archivo.')
      return
    }

    try {
      await onSubmit(
        {
          ...values,
          nombre: values.nombre.trim(),
          descripcionBreve: values.descripcionBreve.trim(),
        },
        file,
      )
    } catch {
      setFormError('No fue posible guardar la publicación.')
    }
  }

  return (
    <form className="gallery-admin__form" onSubmit={handleSubmit}>
      <h2>{mode === 'create' ? 'Nueva publicación' : 'Editar publicación'}</h2>

      <label className="gallery-admin__field">
        <span>Nombre *</span>
        <input
          type="text"
          maxLength={200}
          required
          value={values.nombre}
          onChange={(event) =>
            setValues((current) => ({ ...current, nombre: event.target.value }))
          }
        />
      </label>

      <label className="gallery-admin__field">
        <span>Descripción breve *</span>
        <textarea
          maxLength={500}
          rows={3}
          required
          value={values.descripcionBreve}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              descripcionBreve: event.target.value,
            }))
          }
        />
      </label>

      {mode === 'create' ? (
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
            <span>Visible en la sección pública</span>
          </label>
        </div>
      ) : null}

      <label className="gallery-admin__field">
        <span>
          {mode === 'create' ? 'Archivo *' : 'Reemplazar archivo (opcional)'}
        </span>
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        <small>
          Máximo {formatTransparenciaMaxSizeLabel()}. Formatos: PDF, JPG, JPEG,
          PNG.
        </small>
      </label>

      {selectedFileLabel ? (
        <p className="gallery-admin__field">
          <span>Archivo seleccionado</span>
          <strong>{selectedFileLabel}</strong>
        </p>
      ) : null}

      {fileError ? (
        <p className="gallery-admin__form-error" role="alert">
          {fileError}
        </p>
      ) : null}

      {previewSource ? (
        <div className="gallery-admin__preview">
          <img src={previewSource} alt="Vista previa del archivo" />
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

export default TransparenciaAdminForm
