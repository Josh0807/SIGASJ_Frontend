import { type FormEvent, useEffect, useState } from 'react'
import { IconFileText } from '@tabler/icons-react'
import { AdminFileControl, Button, Card } from '../../../shared/ui'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import type { TransparenciaFormValues } from './types'
import {
  describeTransparenciaFile,
  formatTransparenciaMaxSizeLabel,
  validateTransparenciaFile,
} from './validateTransparenciaFile'
import { isTransparenciaImageType } from './types'
import type { TransparencyFileType } from '../types/types'

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
  const [valuesSource, setValuesSource] = useState(initialValues)
  const [modeSource, setModeSource] = useState(mode)

  if (initialValues !== valuesSource || mode !== modeSource) {
    setValuesSource(initialValues)
    setModeSource(mode)
    setValues(initialValues)
    setFile(null)
    setFileError(null)
    setFormError(null)
    setSelectedFileLabel(null)
  }

  if ((!file || !file.type.startsWith('image/')) && previewUrl !== null) {
    setPreviewUrl(null)
  }

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      return undefined
    }

    const objectUrl = URL.createObjectURL(file)
    const cancelScheduled = runAfterEffect(() => setPreviewUrl(objectUrl))

    return () => {
      cancelScheduled()
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  const imagePreview =
    previewUrl ??
    (currentFileUrl && currentFileType && isTransparenciaImageType(currentFileType)
      ? currentFileUrl
      : null)

  const showPdfPlaceholder =
    !imagePreview &&
    ((file && file.type === 'application/pdf') ||
      (!file && currentFileType === 'pdf' && Boolean(currentFileUrl)))

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
    <Card as="div" padded className="min-w-0 w-full">
    <form
      className="gallery-admin__form gallery-admin__form--editor admin-modern-form w-full !max-w-none"
      onSubmit={handleSubmit}
    >
      <div className="gallery-admin__form-grid">
        <div className="gallery-admin__form-fields">
          <label className="gallery-admin__field">
            <span>Nombre *</span>
            <input
              type="text"
              maxLength={200}
              required
              value={values.nombre}
              placeholder="Ej. Informe de calidad del agua"
              onChange={(event) =>
                setValues((current) => ({ ...current, nombre: event.target.value }))
              }
            />
          </label>

          <label className="gallery-admin__field">
            <span>Descripción breve *</span>
            <textarea
              maxLength={500}
              rows={4}
              required
              value={values.descripcionBreve}
              placeholder="Resumen visible en la sección pública"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  descripcionBreve: event.target.value,
                }))
              }
            />
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
                <strong>Visible en la sección pública</strong>
                <small>Si se desactiva, no se muestra en la landing.</small>
              </span>
            </label>
          </div>
        </div>

        <aside className="gallery-admin__media-card" aria-label="Archivo de la publicación">
          <div className="gallery-admin__media-preview">
            {imagePreview ? (
              <img src={imagePreview} alt="Vista previa del archivo" />
            ) : showPdfPlaceholder ? (
              <div className="gallery-admin__media-empty">
                <IconFileText size={34} aria-hidden="true" />
                <span>Documento PDF</span>
              </div>
            ) : (
              <div className="gallery-admin__media-empty">
                <IconFileText size={34} aria-hidden="true" />
                <span>Sin archivo seleccionado</span>
              </div>
            )}
          </div>

          <AdminFileControl
            accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
            label={mode === 'create' ? 'Archivo *' : 'Reemplazar archivo (opcional)'}
            fileName={selectedFileLabel}
            hint={`Máximo ${formatTransparenciaMaxSizeLabel()}. Formatos: PDF, JPG, JPEG, PNG.`}
            onFileChange={onFileChange}
          />

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
              ? 'Guardar publicación'
              : 'Guardar cambios'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
    </Card>
  )
}

export default TransparenciaAdminForm
