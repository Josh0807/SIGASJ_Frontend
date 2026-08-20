import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ContactAdminForm from './ContactAdminForm'
import {
  formValuesToUpdatePayload,
  type ContactoFormValues,
  type ContactoPublico,
} from '../types/contacto.types'
import {
  fetchAdminContacto,
  updateAdminContacto,
} from '../services/contactService'

const formatUpdatedAt = (value: string | null | undefined) => {
  if (!value) {
    return 'Sin registro previo'
  }

  return new Date(value).toLocaleString('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const ContactAdminPage = () => {
  const [contacto, setContacto] = useState<ContactoPublico | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const loadContacto = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    try {
      const data = await fetchAdminContacto()
      setContacto(data)
    } catch {
      setLoadError('No fue posible cargar los datos de contacto.')
      setContacto(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadContacto()
  }, [loadContacto])

  useEffect(() => {
    if (!saveMessage) {
      return
    }

    const timer = window.setTimeout(() => setSaveMessage(null), 5000)
    return () => window.clearTimeout(timer)
  }, [saveMessage])

  const handleSubmit = async (values: ContactoFormValues) => {
    setSubmitting(true)
    setSaveMessage(null)
    setSaveError(null)

    try {
      const updated = await updateAdminContacto(formValuesToUpdatePayload(values))
      setContacto(updated)
      setSaveMessage('Contacto y ubicación actualizados correctamente.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'No fue posible guardar los cambios.'

      setSaveError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const additionalPhonesCount = contacto?.telefonosAdicionales.length ?? 0

  return (
    <main className="contact-admin" aria-labelledby="contact-admin-title">
      <div className="contact-admin__shell">
        <header className="contact-admin__header">
          <div>
            <p className="contact-admin__eyebrow">Panel administrativo</p>
            <h1 id="contact-admin-title">Contacto y ubicación</h1>
            <p className="contact-admin__intro">
              Edita teléfonos, correo, horarios, dirección y mapa. Los cambios se publican
              de inmediato en la landing pública, el footer y los métodos de pago.
            </p>
          </div>

          <div className="contact-admin__header-actions">
            <Link className="contact-admin__link" to="/#contacto" target="_blank">
              Ver landing
            </Link>
            <Link className="contact-admin__link" to="/admin/galeria">
              Ir a galería
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="contact-admin__skeleton" aria-live="polite" aria-busy="true">
            <div className="contact-admin__skeleton-stats" />
            <div className="contact-admin__skeleton-panel" />
          </div>
        ) : null}

        {loadError ? (
          <div className="contact-admin__alert contact-admin__alert--error" role="alert">
            <p>{loadError}</p>
            <button
              type="button"
              className="contact-admin__button contact-admin__button--primary"
              onClick={() => void loadContacto()}
            >
              Reintentar
            </button>
          </div>
        ) : null}

        {saveMessage ? (
          <div className="contact-admin__alert contact-admin__alert--success" role="status">
            {saveMessage}
          </div>
        ) : null}

        {saveError ? (
          <div className="contact-admin__alert contact-admin__alert--error" role="alert">
            {saveError}
          </div>
        ) : null}

        {contacto ? (
          <>
            <div className="contact-admin__stats">
              <article className="contact-admin__stat">
                <span className="contact-admin__stat-label">Teléfono principal</span>
                <strong className="contact-admin__stat-value">{contacto.telefono}</strong>
              </article>
              <article className="contact-admin__stat">
                <span className="contact-admin__stat-label">Canales activos</span>
                <strong className="contact-admin__stat-value">
                  {2 + additionalPhonesCount}
                </strong>
                <span className="contact-admin__stat-note">
                  WhatsApp, correo{additionalPhonesCount ? ` + ${additionalPhonesCount} tel.` : ''}
                </span>
              </article>
              <article className="contact-admin__stat">
                <span className="contact-admin__stat-label">Última actualización</span>
                <strong className="contact-admin__stat-value contact-admin__stat-value--date">
                  {formatUpdatedAt(contacto.actualizadoEn)}
                </strong>
              </article>
            </div>

            {isDirty ? (
              <p className="contact-admin__dirty-note" role="status">
                Hay cambios pendientes de guardar. Usa la barra inferior o el botón «Guardar cambios».
              </p>
            ) : null}

            <ContactAdminForm
              initialContacto={contacto}
              submitting={submitting}
              onSubmit={handleSubmit}
              onDirtyChange={setIsDirty}
            />
          </>
        ) : null}
      </div>
    </main>
  )
}

export default ContactAdminPage
