import type { ReactNode } from 'react'
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

const phoneHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`
const whatsappHref = (phone: string) => {
  const digits = phone.replace(/\D/g, '')
  const internationalNumber = digits.length === 8 ? `506${digits}` : digits

  return `https://wa.me/${internationalNumber}`
}

const gmailComposeHref = (email: string) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`

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
  const hasExactCoordinates = mapLatitude !== undefined && mapLongitude !== undefined
  const mapQuery = hasExactCoordinates
    ? `${mapLatitude},${mapLongitude}`
    : [address, locationReference].filter(Boolean).join(' ')
  const mapEmbedUrl = mapQuery
    ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=k&z=${mapZoom}&output=embed`
    : undefined

  return (
    <section className="sigasj-contact-section relative isolate overflow-hidden bg-[linear-gradient(135deg,#fbfdff_0%,#edf8ff_58%,#e5f5ff_100%)] px-6 py-12" id={id} aria-labelledby={`${id}-title`}>
      <div className="sigasj-contact-shell mx-auto w-full max-w-[1120px]">
        <div className="contact-section__intro max-w-[780px]">
          <p className="contact-section__eyebrow mb-2 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.28em] text-[#1476cf] before:h-0.5 before:w-9 before:bg-[#1476cf]">Canal de atención</p>
          <h2 id={`${id}-title`} className="m-0 text-[clamp(2.2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.04em] text-[#092e67]">{title}</h2>
          <p className="mb-0 mt-4 text-base leading-7 text-[#526d8c]">{description}</p>
        </div>

        <div className="sigasj-contact-grid grid grid-cols-[1.08fr_0.92fr] gap-6 max-[950px]:grid-cols-1">
          <div className="sigasj-contact-details grid grid-cols-2 gap-4 rounded-[22px] border border-sky-100 bg-white/95 p-7 shadow-[0_16px_36px_rgba(39,112,166,0.12)] max-[620px]:grid-cols-1 max-[620px]:p-4">
            {phonePrimary ? (
              <div className="sigasj-contact-item">
                <span className="contact-section__icon"><ContactIcon type="phone" /></span>
                <div className="contact-section__item-content">
                  <h3>Teléfono principal:</h3>
                  <a
                    className="contact-section__link"
                    href={whatsappHref(phonePrimary)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Contactar por WhatsApp al ${phonePrimary}`}
                  >
                    {phonePrimary}
                  </a>
                </div>
              </div>
            ) : null}

            {phoneNumbers?.length ? (
              <div className="sigasj-contact-item">
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
              <div className="sigasj-contact-item">
                <span className="contact-section__icon"><ContactIcon type="mail" /></span>
                <div className="contact-section__item-content">
                  <h3>Correo electrónico:</h3>
                  <a
                    className="contact-section__link"
                    href={gmailComposeHref(email)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Enviar un correo a ${email}`}
                  >
                    {email}
                  </a>
                </div>
              </div>
            ) : null}

            {attentionHours ? (
              <div className="sigasj-contact-item">
                <span className="contact-section__icon"><ContactIcon type="clock" /></span>
                <div className="contact-section__item-content"><h3>Horario de atención:</h3><p>{attentionHours}</p></div>
              </div>
            ) : null}

            {address ? (
              <div className="sigasj-contact-item">
                <span className="contact-section__icon"><ContactIcon type="location" /></span>
                <div className="contact-section__item-content"><h3>Dirección física:</h3><address>{address}</address></div>
              </div>
            ) : null}
          </div>

          <div className="sigasj-contact-map rounded-[22px] border border-sky-100 bg-white/95 p-7 shadow-[0_16px_36px_rgba(39,112,166,0.12)] max-[620px]:p-4">
            <div className="contact-section__map-heading">
              <span className="contact-section__icon"><ContactIcon type="map" /></span>
              <div><h3>Ubicación</h3><p>Encuentra nuestra oficina en San Juan de Santa Cruz.</p></div>
            </div>

            {(showMapEmbed && embeddedMap) || mapEmbedUrl ? (
              <div className="contact-section__map-embed sigasj-contact-map-frame">
                {showMapEmbed && embeddedMap ? embeddedMap : (
                  <iframe
                    src={mapEmbedUrl}
                    title="Mapa de la oficina de ASADA San Juan de Santa Cruz"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
                {resolvedMapUrl ? (
                  <a
                    className="contact-section__map-overlay"
                    href={resolvedMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Abrir esta ubicación en Google Maps"
                  />
                ) : null}
              </div>
            ) : (
              <div className="contact-section__map-placeholder">
                <ContactIcon type="location" />
                <span>Consulta la ubicación exacta en Google Maps.</span>
              </div>
            )}

            {resolvedMapUrl ? (
              <a className="sigasj-contact-map-link" href={resolvedMapUrl} target="_blank" rel="noopener noreferrer">
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
