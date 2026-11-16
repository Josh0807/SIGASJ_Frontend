import { type FormEvent, useEffect, useState } from 'react'
import { IconPhoto, IconUpload } from '@tabler/icons-react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import { validateGalleryImageFile } from '../../galeria/admin/validateGalleryImageFile'
import type { ComunicadoFormValues } from './types'

type ComunicadosAdminFormProps = {
  mode: 'create' | 'edit'
  initialValues: ComunicadoFormValues
  currentImageUrl?: string | null
  submitting?: boolean
  onSubmit: (values: ComunicadoFormValues, file: File | null) => Promise<void>
  onCancel: () => void
}

const ComunicadosAdminForm = ({
  mode,
  initialValues,
  currentImageUrl,
  submitting = false,
  onSubmit,
  onCancel,
}: ComunicadosAdminFormProps) => {
  const [values, setValues] = useState(initialValues)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [tituloError, setTituloError] = useState<string | null>(null)
  const [selectedFileLabel, setSelectedFileLabel] = useState<string | null>(null)
  const [valuesSource, setValuesSource] = useState(initialValues)
  const [modeSource, setModeSource] = useState(mode)

  if (initialValues !== valuesSource || mode !== modeSource) {
    setValuesSource(initialValues)
    setModeSource(mode)
    setValues(initialValues)
    setFile(null)
    setFormError(null)
    setTituloError(null)
    setSelectedFileLabel(null)
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

  const previewSource = previewUrl ?? currentImageUrl ?? null

  const onFileChange = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null)
      setSelectedFileLabel(null)
      return
    }

    const validationError = validateGalleryImageFile(nextFile)
    if (validationError) {
      setFormError(validationError)
      setFile(null)
      setSelectedFileLabel(null)
      return
    }

    setFormError(null)
    setFile(nextFile)
    setSelectedFileLabel(nextFile.name)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setTituloError(null)

    if (!values.titulo.trim()) {
      setTituloError('El título es obligatorio.')
      return
    }

    try {
      await onSubmit(
        {
          ...values,
          titulo: values.titulo.trim(),
          descripcion: values.descripcion.trim(),
          contenido: values.contenido.trim(),
          tipo: values.tipo.trim(),
        },
        file,
      )
    } catch {
      setFormError('No fue posible guardar el comunicado.')
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
            <span>Título *</span>
            <input
              type="text"
              maxLength={200}
              required
              aria-invalid={Boolean(tituloError)}
              aria-describedby={tituloError ? 'comunicado-titulo-error' : undefined}
              value={values.titulo}
              placeholder="Ej. Asamblea general de asociados"
              onChange={(event) => {
                setTituloError(null)
                setValues((current) => ({ ...current, titulo: event.target.value }))
              }}
            />
            {tituloError ? (
              <small
                id="comunicado-titulo-error"
                className="gallery-admin__form-error"
                role="alert"
              >
                {tituloError}
              </small>
            ) : null}
          </label>

          <label className="gallery-admin__field">
            <span>Descripción</span>
            <textarea
              maxLength={500}
              rows={3}
              value={values.descripcion}
              placeholder="Resumen corto del aviso"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  descripcion: event.target.value,
                }))
              }
            />
          </label>

          <label className="gallery-admin__field">
            <span>Contenido</span>
            <textarea
              rows={6}
              value={values.contenido}
              placeholder="Detalle completo del comunicado"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  contenido: event.target.value,
                }))
              }
            />
          </label>

          <div className="gallery-admin__field-row gallery-admin__field-row--split">
            <label className="gallery-admin__field">
              <span>Tipo</span>
              <input
                type="text"
                maxLength={80}
                value={values.tipo}
                placeholder="Ej. Comunicado"
                onChange={(event) =>
                  setValues((current) => ({ ...current, tipo: event.target.value }))
                }
              />
            </label>

            <label className="gallery-admin__field">
              <span>Prioridad</span>
              <select
                value={values.prioridad}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    prioridad: event.target.value as ComunicadoFormValues['prioridad'],
                  }))
                }
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </label>
          </div>

          <div className="gallery-admin__field-row gallery-admin__field-row--split">
            <label className="gallery-admin__field">
              <span>Fecha de publicación</span>
              <input
                type="date"
                value={values.fechaPublicacion}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    fechaPublicacion: event.target.value,
                  }))
                }
              />
            </label>

            <label className="gallery-admin__field">
              <span>Fecha de expiración</span>
              <input
                type="date"
                value={values.fechaExpiracion}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    fechaExpiracion: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="gallery-admin__field-row gallery-admin__field-row--checks">
            <label className="gallery-admin__checkbox gallery-admin__checkbox--card">
              <input
                type="checkbox"
                checked={values.estado === 'Activo'}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    estado: event.target.checked ? 'Activo' : 'Inactivo',
                  }))
                }
              />
              <span>
                <strong>Activo</strong>
                <small>El comunicado queda habilitado en el panel.</small>
              </span>
            </label>

            <label className="gallery-admin__checkbox gallery-admin__checkbox--card">
              <input
                type="checkbox"
                checked={values.esPublico}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    esPublico: event.target.checked,
                  }))
                }
              />
              <span>
                <strong>Visible en la landing</strong>
                <small>Si se desactiva, no se muestra al público.</small>
              </span>
            </label>
          </div>
        </div>

        <aside className="gallery-admin__media-card" aria-label="Imagen del comunicado">
          <div className="gallery-admin__media-preview">
            {previewSource ? (
              <img src={previewSource} alt="Vista previa del comunicado" />
            ) : (
              <div className="gallery-admin__media-empty">
                <IconPhoto size={34} aria-hidden="true" />
                <span>Sin imagen seleccionada</span>
              </div>
            )}
          </div>

          <label className="gallery-admin__field gallery-admin__field--file">
            <span>
              {mode === 'create' ? 'Imagen (opcional)' : 'Reemplazar imagen (opcional)'}
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
              {selectedFileLabel
                ? selectedFileLabel
                : 'Formatos: JPG, PNG o WebP. Máximo según política de la galería.'}
            </small>
          </label>
        </aside>
      </div>

      {formError ? (
        <p className="gallery-admin__form-error" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="gallery-admin__form-actions">
        <button
          type="submit"
          className="gallery-admin__button gallery-admin__button--primary"
          disabled={submitting}
        >
          {submitting
            ? 'Guardando…'
            : mode === 'create'
              ? 'Guardar comunicado'
              : 'Guardar cambios'}
        </button>
        <button type="button" className="gallery-admin__button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default ComunicadosAdminForm
