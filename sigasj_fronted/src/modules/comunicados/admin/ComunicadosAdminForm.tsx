import { type FormEvent, useEffect, useState } from 'react'
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

  useEffect(() => {
    setValues(initialValues)
    setFile(null)
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

  const previewSource = previewUrl ?? currentImageUrl ?? undefined

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!values.titulo.trim()) {
      setFormError('El título es obligatorio.')
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
    <form className="gallery-admin__form" onSubmit={handleSubmit}>
      <h2>{mode === 'create' ? 'Nuevo comunicado' : 'Editar comunicado'}</h2>

      <label className="gallery-admin__field">
        <span>Título *</span>
        <input
          type="text"
          maxLength={200}
          required
          value={values.titulo}
          onChange={(event) =>
            setValues((current) => ({ ...current, titulo: event.target.value }))
          }
        />
      </label>

      <label className="gallery-admin__field">
        <span>Descripción</span>
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
        <span>Contenido</span>
        <textarea
          rows={5}
          value={values.contenido}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              contenido: event.target.value,
            }))
          }
        />
      </label>

      <div className="gallery-admin__field-row">
        <label className="gallery-admin__field">
          <span>Tipo</span>
          <input
            type="text"
            maxLength={80}
            value={values.tipo}
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

      <div className="gallery-admin__field-row">
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

      <div className="gallery-admin__field-row">
        <label className="gallery-admin__checkbox">
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
          <span>Activo</span>
        </label>

        <label className="gallery-admin__checkbox">
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
          <span>Visible en la landing pública</span>
        </label>
      </div>

      <label className="gallery-admin__field">
        <span>
          {mode === 'create' ? 'Imagen (opcional)' : 'Reemplazar imagen (opcional)'}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          onChange={(event) => {
            const nextFile = event.target.files?.[0] ?? null
            if (!nextFile) {
              setFile(null)
              return
            }

            const validationError = validateGalleryImageFile(nextFile)
            if (validationError) {
              setFormError(validationError)
              setFile(null)
              return
            }

            setFile(nextFile)
          }}
        />
      </label>

      {previewSource ? (
        <div className="gallery-admin__preview">
          <img src={previewSource} alt="Vista previa del comunicado" />
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

export default ComunicadosAdminForm
