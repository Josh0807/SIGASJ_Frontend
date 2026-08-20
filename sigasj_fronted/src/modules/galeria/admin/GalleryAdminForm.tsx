import { type FormEvent, useEffect, useState } from 'react'
import type { GalleryFormValues } from './types'
import GalleryImageDropzone from './GalleryImageDropzone'

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
    <form
      className="gallery-admin__form gallery-admin__form--enhanced"
      onSubmit={handleSubmit}
      id="gallery-admin-form"
    >
      <header className="gallery-admin__form-header">
        <div>
          <p className="gallery-admin__form-step">
            {mode === 'create' ? 'Paso único' : 'Edición'}
          </p>
          <h2>
            {mode === 'create' ? 'Nueva fotografía' : 'Editar fotografía'}
          </h2>
          <p className="gallery-admin__form-lead">
            {mode === 'create'
              ? 'Sube una imagen y completa los datos. Solo el texto alternativo es obligatorio además de la foto.'
              : 'Actualiza los datos o reemplaza la imagen. Los cambios se reflejan en la landing pública si la foto está activa.'}
          </p>
        </div>
      </header>

      <div className="gallery-admin__form-layout">
        <section
          className="gallery-admin__form-media"
          aria-label="Imagen de la galería"
        >
          <GalleryImageDropzone
            mode={mode}
            file={file}
            previewSource={previewSource}
            fileError={fileError}
            onFileChange={setFile}
            onFileError={setFileError}
          />
        </section>

        <section
          className="gallery-admin__form-fields"
          aria-label="Información de la fotografía"
        >
          <div className="gallery-admin__form-section">
            <h3 className="gallery-admin__form-section-title">
              Información visible
            </h3>

            <label className="gallery-admin__field">
              <span className="gallery-admin__field-label">
                Título
                <em className="gallery-admin__optional">opcional</em>
              </span>
              <input
                type="text"
                maxLength={150}
                placeholder="Ej. Tanque principal, Asamblea 2026…"
                value={values.titulo}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    titulo: event.target.value,
                  }))
                }
              />
              <small className="gallery-admin__char-count">
                {values.titulo.length}/150
              </small>
            </label>

            <label className="gallery-admin__field">
              <span className="gallery-admin__field-label">
                Descripción
                <em className="gallery-admin__optional">opcional</em>
              </span>
              <textarea
                maxLength={500}
                rows={3}
                placeholder="Breve contexto para visitantes y personal interno…"
                value={values.descripcion}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    descripcion: event.target.value,
                  }))
                }
              />
              <small className="gallery-admin__char-count">
                {values.descripcion.length}/500
              </small>
            </label>

            <label className="gallery-admin__field">
              <span className="gallery-admin__field-label">
                Texto alternativo
                <em className="gallery-admin__required">obligatorio</em>
              </span>
              <input
                type="text"
                maxLength={255}
                required
                placeholder="Describe la imagen para accesibilidad y lectores de pantalla"
                value={values.textoAlternativo}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    textoAlternativo: event.target.value,
                  }))
                }
              />
              <small className="gallery-admin__field-hint">
                Aparece cuando la imagen no carga y ayuda a personas con
                discapacidad visual.
              </small>
            </label>
          </div>

          <div className="gallery-admin__form-section">
            <h3 className="gallery-admin__form-section-title">
              Publicación
            </h3>

            <div className="gallery-admin__field-row gallery-admin__field-row--publish">
              <label className="gallery-admin__field gallery-admin__field--compact">
                <span className="gallery-admin__field-label">Orden en la galería</span>
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
                <small className="gallery-admin__field-hint">
                  Número menor = aparece primero en la landing.
                </small>
              </label>

              <div className="gallery-admin__toggle-field">
                <label className="gallery-admin__toggle">
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
                  <span className="gallery-admin__toggle-track" aria-hidden="true">
                    <span className="gallery-admin__toggle-thumb" />
                  </span>
                  <span className="gallery-admin__toggle-text">
                    <strong>Visible en la galería pública</strong>
                    <small>
                      {values.activo
                        ? 'Los visitantes verán esta foto en la landing.'
                        : 'Queda guardada pero oculta para el público.'}
                    </small>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </section>
      </div>

      {formError ? (
        <p className="gallery-admin__banner gallery-admin__banner--error" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="gallery-admin__form-actions">
        <button
          type="button"
          className="gallery-admin__button"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="gallery-admin__button gallery-admin__button--primary"
          disabled={submitting}
        >
          {submitting ? 'Guardando…' : 'Guardar fotografía'}
        </button>
      </div>
    </form>
  )
}

export default GalleryAdminForm
