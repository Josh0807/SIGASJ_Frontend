import type { ReactNode } from 'react'
import type { ContactIconProps, ContactIconType } from '../props/ContactIconProps'
import type { ContactSectionProps } from '../props/ContactSectionProps'

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

const phoneHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`

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
  embeddedMap,
  showMapEmbed = false,
}: ContactSectionProps) => {
  const resolvedMapUrl =
    mapUrl ??
    (address || locationReference
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [address, locationReference].filter(Boolean).join(' '),
        )}`
      : undefined)

  return (
    <section className="landing-section contact-section" id={id} aria-labelledby={`${id}-title`}>
      <div className="contact-section__content">
        <div className="contact-section__intro">
          <p className="contact-section__eyebrow">Canal de atención</p>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{description}</p>
        </div>

        <div className="contact-section__grid">
          <div className="contact-section__card contact-section__card--details">
            {phonePrimary ? (
              <div className="contact-section__item">
                <span className="contact-section__icon"><ContactIcon type="phone" /></span>
                <div className="contact-section__item-content">
                  <h3>Teléfono principal:</h3>
                  <a className="contact-section__link" href={phoneHref(phonePrimary)}>{phonePrimary}</a>
                </div>
              </div>
            ) : null}

            {phoneNumbers?.length ? (
              <div className="contact-section__item">
                <span className="contact-section__icon"><ContactIcon type="phone" /></span>
                <div className="contact-section__item-content">
                  <h3>Teléfonos adicionales</h3>
                  <ul className="contact-section__list">
                    {phoneNumbers.map((phone) => <li key={phone}><a className="contact-section__link" href={phoneHref(phone)}>{phone}</a></li>)}
                  </ul>
                </div>
              </div>
            ) : null}

            {email ? (
              <div className="contact-section__item">
                <span className="contact-section__icon"><ContactIcon type="mail" /></span>
                <div className="contact-section__item-content">
                  <h3>Correo electrónico:</h3>
                  <a className="contact-section__link" href={`mailto:${email}`}>{email}</a>
                </div>
              </div>
            ) : null}

            {attentionHours ? (
              <div className="contact-section__item">
                <span className="contact-section__icon"><ContactIcon type="clock" /></span>
                <div className="contact-section__item-content"><h3>Horario de atención:</h3><p>{attentionHours}</p></div>
              </div>
            ) : null}

            {address ? (
              <div className="contact-section__item">
                <span className="contact-section__icon"><ContactIcon type="location" /></span>
                <div className="contact-section__item-content"><h3>Dirección física:</h3><address>{address}</address></div>
              </div>
            ) : null}
          </div>

          <div className="contact-section__card contact-section__card--map">
            <div className="contact-section__map-heading">
              <span className="contact-section__icon"><ContactIcon type="map" /></span>
              <div><h3>Ubicación</h3><p>Encuentra nuestra oficina en San Juan de Santa Cruz.</p></div>
            </div>

            {showMapEmbed && embeddedMap ? (
              <div className="contact-section__map-embed">{embeddedMap}</div>
            ) : (
              <div className="contact-section__map-placeholder">
                <ContactIcon type="location" />
                <span>Consulta la ubicación exacta en Google Maps.</span>
              </div>
            )}

            {resolvedMapUrl ? (
              <a className="contact-section__map-link" href={resolvedMapUrl} target="_blank" rel="noopener noreferrer">
                Ver ubicación <span aria-hidden="true">&#8599;</span>
              </a>
            ) : null}

            {locationReference ? <p className="contact-section__reference">Referencia: {locationReference}</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
