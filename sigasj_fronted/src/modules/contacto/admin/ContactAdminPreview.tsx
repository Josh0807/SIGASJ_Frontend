import whatsappLogo from '../../../assets/LogoWhatsApp.png'
import {
  buildGoogleMapsEmbedUrl,
  gmailComposeHref,
  telHrefFromPhone,
  whatsappHrefFromPhone,
  type ContactoFormValues,
} from '../types/contacto.types'

type ContactAdminPreviewProps = {
  values: ContactoFormValues
}

const ContactAdminPreview = ({ values }: ContactAdminPreviewProps) => {
  const telefono = values.telefono.trim()
  const email = values.email.trim()
  const lat = values.mapaLatitud.trim()
  const lng = values.mapaLongitud.trim()
  const zoom = Number.parseInt(values.mapaZoom, 10) || 18
  const latNum = lat ? Number(lat) : undefined
  const lngNum = lng ? Number(lng) : undefined
  const mapEmbedUrl = buildGoogleMapsEmbedUrl({
    latitude: latNum,
    longitude: lngNum,
    address: values.direccion.trim() || undefined,
    locationReference: values.referenciaUbicacion.trim() || undefined,
    zoom,
  })

  return (
    <aside className="contact-admin__preview" aria-label="Vista previa del contenido público">
      <header className="contact-admin__preview-header">
        <p className="contact-admin__preview-eyebrow">Vista previa</p>
        <h2>Así lo verán los usuarios</h2>
        <p>Los cambios se reflejan aquí en tiempo real antes de guardar.</p>
      </header>

      <div className="contact-admin__preview-card">
        <h3>Contacto</h3>
        {values.descripcionContacto.trim() ? (
          <p className="contact-admin__preview-description">
            {values.descripcionContacto.trim()}
          </p>
        ) : (
          <p className="contact-admin__preview-muted">Sin descripción configurada.</p>
        )}

        <ul className="contact-admin__preview-list">
          {telefono ? (
            <li>
              <span>Teléfono</span>
              <strong>{telefono}</strong>
            </li>
          ) : null}
          {email ? (
            <li>
              <span>Correo</span>
              <strong>{email}</strong>
            </li>
          ) : null}
          {values.horarioAtencion.trim() ? (
            <li>
              <span>Horario</span>
              <strong>{values.horarioAtencion.trim()}</strong>
            </li>
          ) : null}
          {values.direccion.trim() ? (
            <li>
              <span>Dirección</span>
              <strong>{values.direccion.trim()}</strong>
            </li>
          ) : null}
          {values.regionResumen.trim() ? (
            <li>
              <span>Región (footer)</span>
              <strong>{values.regionResumen.trim()}</strong>
            </li>
          ) : null}
        </ul>

        <div className="contact-admin__preview-actions">
          {telefono ? (
            <>
              <a
                className="contact-admin__preview-chip contact-admin__preview-chip--whatsapp"
                href={whatsappHrefFromPhone(telefono)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={whatsappLogo} alt="" aria-hidden="true" />
                WhatsApp
              </a>
              <a className="contact-admin__preview-chip" href={telHrefFromPhone(telefono)}>
                Llamar
              </a>
            </>
          ) : null}
          {email ? (
            <a
              className="contact-admin__preview-chip"
              href={gmailComposeHref(email)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Correo
            </a>
          ) : null}
        </div>
      </div>

      <div className="contact-admin__preview-card">
        <h3>Mapa embebido</h3>
        {mapEmbedUrl ? (
          <div className="contact-admin__preview-map contact-admin__preview-map--framed">
            <div className="contact-admin__preview-map-embed">
              <iframe
                src={mapEmbedUrl}
                title="Vista previa del mapa"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <p className="contact-admin__preview-muted">
            Agrega latitud y longitud para mostrar el mapa en la landing.
          </p>
        )}
        {values.textoUbicacionMapa.trim() ? (
          <p className="contact-admin__preview-map-text">
            {values.textoUbicacionMapa.trim()}
          </p>
        ) : null}
      </div>

      <div className="contact-admin__preview-tip">
        <strong>Tip:</strong> en el formulario usa «Usar enlace» con Google Maps o
        «Buscar ubicación desde la dirección»; no hace falta escribir coordenadas a mano.
      </div>
    </aside>
  )
}

export default ContactAdminPreview
