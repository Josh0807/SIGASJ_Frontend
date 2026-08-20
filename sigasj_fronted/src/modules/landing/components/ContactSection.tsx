import type { ReactNode } from 'react'
import whatsappLogo from '../../../assets/LogoWhatsApp.png'
import {
  buildGoogleMapsEmbedUrl,
  buildGoogleMapsSearchUrl,
  gmailComposeHref,
  telHrefFromPhone,
  whatsappHrefFromPhone,
} from '../../contacto/types/contacto.types'
import type { ContactIconProps, ContactIconType } from '../types/ContactIconProps'
import type { ContactSectionProps } from '../types/ContactSectionProps'

const iconPaths: Record<ContactIconType, ReactNode> = {
  phone: <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.1.36 2.27.54 3.46.54A1.14 1.14 0 0 1 21 16.64v3.22A1.14 1.14 0 0 1 19.86 21C10.55 21 3 13.45 3 4.14A1.14 1.14 0 0 1 4.14 3h3.22A1.14 1.14 0 0 1 8.5 4.14c0 1.2.18 2.36.54 3.46a1 1 0 0 1-.24 1Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  map: <><path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2Z" /><path d="M8 4v13M16 7v13" /></>,
}

const ContactIcon = ({ type }: ContactIconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {iconPaths[type]}
  </svg>
)

const ContactSection = ({
  id = 'contacto',
  title = 'Contacto',
  description = 'Estamos para atenderte con información, orientación y atención a tus solicitudes.',
  phonePrimary = '8560-7584',
  phoneNumbers,
  email = 'asadasanjuan24@gmail.com',
  attentionHours = 'Lunes a Sábado: 7:00 a.m. a 11:30 a.m.',
  address = 'Costado norte de la Plaza de Deportes, San Juan, Santa Cruz.',
  locationReference,
  mapUrl,
  mapLatitude,
  mapLongitude,
  mapZoom = 18,
  mapDescription = 'Encuentra nuestra oficina en San Juan de Santa Cruz.',
  loading = false,
  embeddedMap,
  showMapEmbed = false,
  layout = 'standalone',
}: ContactSectionProps) => {
  const mapOptions = {
    latitude: mapLatitude,
    longitude: mapLongitude,
    address,
    locationReference,
    zoom: mapZoom,
  }
  const resolvedMapUrl = mapUrl ?? buildGoogleMapsSearchUrl(mapOptions)
  const mapEmbedUrl = buildGoogleMapsEmbedUrl(mapOptions)
  const whatsappUrl = phonePrimary ? whatsappHrefFromPhone(phonePrimary) : undefined
  const isHub = layout === 'hub'
  const RootTag = isHub ? 'div' : 'section'
  const sectionTitleId = `${id}-title`
  const mapTitleId = `${id}-map-title`
  const channelsTitleId = `${id}-channels-title`

  return (
    <RootTag
      className={`contact-section${isHub ? ' contact-section--hub' : ' landing-section'}`}
      id={id}
      aria-labelledby={sectionTitleId}
    >
      <div className="contact-section__content">
        {!isHub ? (
          <header className="landing-section__heading">
            <p className="landing-eyebrow">Canal de atención</p>
            <h2 id={sectionTitleId}>{title}</h2>
            <p className="landing-section__lead">{description}</p>
          </header>
        ) : (
          <header className="landing-section__subheading">
            <h3 id={sectionTitleId}>Información de contacto</h3>
            <p className="landing-section__lead">{description}</p>
          </header>
        )}

        {loading ? (
          <div className="contact-section__loading" aria-live="polite">
            Cargando información de contacto…
          </div>
        ) : (
          <div className="contact-section__grid">
            <div
              className="contact-section__card contact-section__card--details"
              aria-labelledby={channelsTitleId}
            >
              <h4 id={channelsTitleId} className="contact-section__panel-title">
                Canales de atención
              </h4>

              {phonePrimary || email ? (
                <div className="contact-section__actions" aria-label="Accesos rápidos de contacto">
                  {phonePrimary && whatsappUrl ? (
                    <a
                      className="contact-section__action contact-section__action--whatsapp"
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={whatsappLogo} alt="" aria-hidden="true" />
                      WhatsApp
                    </a>
                  ) : null}
                  {phonePrimary ? (
                    <a
                      className="contact-section__action contact-section__action--call"
                      href={telHrefFromPhone(phonePrimary)}
                    >
                      <ContactIcon type="phone" />
                      Llamar
                    </a>
                  ) : null}
                  {email ? (
                    <a
                      className="contact-section__action contact-section__action--mail"
                      href={gmailComposeHref(email)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ContactIcon type="mail" />
                      Correo
                    </a>
                  ) : null}
                </div>
              ) : null}

              <div className="contact-section__tiles">
                {phonePrimary ? (
                  <article className="contact-section__tile">
                    <span className="contact-section__icon"><ContactIcon type="phone" /></span>
                    <div>
                      <p className="contact-section__field-label">Teléfono</p>
                      <a className="contact-section__link" href={telHrefFromPhone(phonePrimary)}>
                        {phonePrimary}
                      </a>
                    </div>
                  </article>
                ) : null}

                {email ? (
                  <article className="contact-section__tile">
                    <span className="contact-section__icon"><ContactIcon type="mail" /></span>
                    <div>
                      <p className="contact-section__field-label">Correo</p>
                      <a
                        className="contact-section__link"
                        href={gmailComposeHref(email)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {email}
                      </a>
                    </div>
                  </article>
                ) : null}

                {attentionHours ? (
                  <article className="contact-section__tile contact-section__tile--wide">
                    <span className="contact-section__icon"><ContactIcon type="clock" /></span>
                    <div>
                      <p className="contact-section__field-label">Horario de atención</p>
                      <p className="contact-section__field-value">{attentionHours}</p>
                    </div>
                  </article>
                ) : null}
              </div>

              {phoneNumbers?.length ? (
                <div className="contact-section__extras">
                  <p className="contact-section__field-label">Teléfonos adicionales</p>
                  <ul className="contact-section__list">
                    {phoneNumbers.map((phone) => (
                      <li key={phone} className="contact-section__list-item">
                        <a className="contact-section__link" href={telHrefFromPhone(phone)}>
                          {phone}
                        </a>
                        <a
                          className="contact-section__list-whatsapp"
                          href={whatsappHrefFromPhone(phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp ${phone}`}
                        >
                          WhatsApp
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div
              className="contact-section__card contact-section__card--map"
              aria-labelledby={mapTitleId}
            >
              <div className="contact-section__map-heading">
                <span className="contact-section__icon"><ContactIcon type="map" /></span>
                <div>
                  <h4 id={mapTitleId} className="contact-section__panel-title">
                    Ubicación de la oficina
                  </h4>
                  <p>{mapDescription}</p>
                </div>
              </div>

              {(showMapEmbed && embeddedMap) || mapEmbedUrl ? (
                <div className="contact-section__map-shell">
                  <div className="contact-section__map-embed">
                    {showMapEmbed && embeddedMap ? embeddedMap : (
                      <iframe
                        src={mapEmbedUrl}
                        title="Mapa de la oficina de ASADA San Juan de Santa Cruz"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    )}
                  </div>

                  <div className="contact-section__map-caption">
                    <div className="contact-section__map-caption-text">
                      <strong>ASADA San Juan de Santa Cruz</strong>
                      {address ? <p>{address}</p> : null}
                      {locationReference ? (
                        <span className="contact-section__map-caption-ref">
                          {locationReference}
                        </span>
                      ) : null}
                    </div>
                    {resolvedMapUrl ? (
                      <a
                        className="contact-section__map-open"
                        href={resolvedMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir en Maps <span aria-hidden="true">&#8599;</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="contact-section__map-placeholder">
                  <ContactIcon type="location" />
                  <span>Consulta la ubicación exacta en Google Maps.</span>
                  {resolvedMapUrl ? (
                    <a
                      className="contact-section__map-link"
                      href={resolvedMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver ubicación <span aria-hidden="true">&#8599;</span>
                    </a>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </RootTag>
  )
}

export default ContactSection
