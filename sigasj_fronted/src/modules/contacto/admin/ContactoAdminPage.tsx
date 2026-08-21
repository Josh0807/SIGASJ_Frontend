import { type FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  DEFAULT_CONTACTO_UBICACION,
  getAdminContacto,
  updateAdminContacto,
  type ContactoUbicacion,
} from '../services/contactoApi'

const ContactoAdminPage = () => {
  const [values, setValues] = useState<ContactoUbicacion>(DEFAULT_CONTACTO_UBICACION)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        setValues(await getAdminContacto())
      } catch {
        setError('No fue posible cargar la información de contacto.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const saved = await updateAdminContacto({
        ...values,
        telefono: values.telefono.trim(),
        email: values.email.trim(),
        direccion: values.direccion.trim(),
        horarioAtencion: values.horarioAtencion.trim(),
        referenciaUbicacion: values.referenciaUbicacion.trim(),
        mapaUrl: values.mapaUrl.trim(),
      })
      setValues(saved)
      setSuccess('La información de contacto y ubicación se guardó correctamente.')
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : ''
      setError(
        detail.includes('401')
          ? 'La sesión no es válida. Cierre sesión e inicie de nuevo para guardar.'
          : 'No fue posible guardar los cambios.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="gallery-admin">
      <div className="gallery-admin__shell">
        <header className="gallery-admin__header">
          <div>
            <p className="gallery-admin__eyebrow">Panel administrativo</p>
            <h1>Información de Contacto y Ubicación</h1>
            <p>
              Actualice los datos que se muestran en la sección pública de contacto.
            </p>
          </div>
          <div className="gallery-admin__header-actions">
            <Link className="gallery-admin__link" to="/#contacto">
              Ver sitio público
            </Link>
          </div>
        </header>

        {loading ? (
          <p className="gallery-admin__empty" role="status">
            Cargando información…
          </p>
        ) : (
          <form className="gallery-admin__form" onSubmit={handleSubmit}>
            <h2>Contacto</h2>

            <label className="gallery-admin__field">
              <span>Teléfono</span>
              <input
                type="text"
                maxLength={80}
                value={values.telefono}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    telefono: event.target.value,
                  }))
                }
              />
            </label>

            <label className="gallery-admin__field">
              <span>Correo electrónico</span>
              <input
                type="email"
                value={values.email}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </label>

            <label className="gallery-admin__field">
              <span>Horario de atención</span>
              <input
                type="text"
                maxLength={240}
                value={values.horarioAtencion}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    horarioAtencion: event.target.value,
                  }))
                }
              />
            </label>

            <h2>Ubicación</h2>

            <label className="gallery-admin__field">
              <span>Dirección</span>
              <textarea
                rows={3}
                maxLength={240}
                value={values.direccion}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    direccion: event.target.value,
                  }))
                }
              />
            </label>

            <label className="gallery-admin__field">
              <span>Descripción de ubicación</span>
              <input
                type="text"
                maxLength={240}
                value={values.referenciaUbicacion}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    referenciaUbicacion: event.target.value,
                  }))
                }
              />
            </label>

            <label className="gallery-admin__field">
              <span>Enlace del mapa</span>
              <input
                type="url"
                value={values.mapaUrl}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    mapaUrl: event.target.value,
                  }))
                }
              />
            </label>

            <div className="gallery-admin__field-row">
              <label className="gallery-admin__field">
                <span>Latitud</span>
                <input
                  type="number"
                  step="any"
                  value={values.latitud}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      latitud: Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label className="gallery-admin__field">
                <span>Longitud</span>
                <input
                  type="number"
                  step="any"
                  value={values.longitud}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      longitud: Number(event.target.value),
                    }))
                  }
                />
              </label>
            </div>

            {error ? (
              <p className="gallery-admin__form-error" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="gallery-admin__empty" role="status">
                {success}
              </p>
            ) : null}

            <div className="gallery-admin__form-actions">
              <button
                type="submit"
                className="gallery-admin__button gallery-admin__button--primary"
                disabled={submitting}
              >
                {submitting ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}

export default ContactoAdminPage
