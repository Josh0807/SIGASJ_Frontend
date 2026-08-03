import type { ContactSectionProps } from '../Props/ContactSectionProps'

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
          <div className="contact-section__card">
            {phonePrimary ? (
              <div className="contact-section__item">
                <span className="contact-section__icon" aria-hidden="true">
                  📞
                </span>
                <div>
                  <h3>Teléfono principal</h3>
                  <a className="contact-section__link" href={`tel:${phonePrimary}`}>
                    {phonePrimary}
                  </a>
                </div>
              </div>
            ) : null}

            {phoneNumbers && phoneNumbers.length > 0 ? (
              <div className="contact-section__item">
                <span className="contact-section__icon" aria-hidden="true">
                  ☎️
                </span>
                <div>
                  <h3>Teléfonos adicionales</h3>
                  <ul className="contact-section__list">
                    {phoneNumbers.map((phone) => (
                      <li key={phone}>
                        <a className="contact-section__link" href={`tel:${phone}`}>
                          {phone}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {email ? (
              <div className="contact-section__item">
                <span className="contact-section__icon" aria-hidden="true">
                  ✉️
                </span>
                <div>
                  <h3>Correo electrónico</h3>
                  <a className="contact-section__link" href={`mailto:${email}`}>
                    {email}
                  </a>
                </div>
              </div>
            ) : null}

            {attentionHours ? (
              <div className="contact-section__item">
                <span className="contact-section__icon" aria-hidden="true">
                  🕒
                </span>
                <div>
                  <h3>Horario de atención</h3>
                  <p>{attentionHours}</p>
                </div>
              </div>
            ) : null}

            {address ? (
              <div className="contact-section__item">
                <span className="contact-section__icon" aria-hidden="true">
                  📍
                </span>
                <div>
                  <h3>Dirección física</h3>
                  <address>{address}</address>
                </div>
              </div>
            ) : null}
          </div>

          <div className="contact-section__card contact-section__card--map">
            {resolvedMapUrl ? (
              <a className="contact-section__map-link" href={resolvedMapUrl} target="_blank" rel="noreferrer noopener">
                Abrir mapa en Google Maps
              </a>
            ) : null}

            <div className="contact-section__map-placeholder">¡Próximamente se colocará el mapa!</div>

            {locationReference ? <p className="contact-section__reference">Referencia: {locationReference}</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
