import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import { Alert, AdminShell, Button, Card, PageHeader } from '../../../shared/ui'
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

  const loadContacto = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      setValues(await getAdminContacto())
    } catch {
      setError(ADMIN_COPY.loadError('la información de contacto'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void loadContacto())
    return () => window.cancelAnimationFrame(frame)
  }, [loadContacto])

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
          : ADMIN_COPY.actionError('guardar', 'los cambios'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminShell aria-labelledby="contacto-admin-title">
      <PageHeader
        id="contacto-admin-title"
        title="Contacto y ubicación"
        description="Teléfono, correo, horario y ubicación en el sitio público."
      />

      {loading ? (
        <Alert tone="info">{ADMIN_COPY.loading('información de contacto')}</Alert>
      ) : (
        <Card as="div" padded className="min-w-0">
          <form
            className="admin-modern-form grid w-full gap-4 !max-w-none"
            onSubmit={handleSubmit}
          >
            <h2 className="m-0 text-lg font-extrabold text-sigasj-ink">Contacto</h2>

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

            <h2 className="m-0 text-lg font-extrabold text-sigasj-ink">Ubicación</h2>

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

            <div className="gallery-admin__field-row max-[900px]:!grid-cols-1">
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
              <Alert tone="danger" role="alert">
                {error}
              </Alert>
            ) : null}
            {success ? (
              <Alert tone="success">{success}</Alert>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </AdminShell>
  )
}

export default ContactoAdminPage
