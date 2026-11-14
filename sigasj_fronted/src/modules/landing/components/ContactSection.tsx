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
  <svg
    className="size-5 stroke-current"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
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

const ContactRow = ({
  icon,
  label,
  children,
}: {
  icon: ContactIconType
  label: string
  children: ReactNode
}) => (
  <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-4 py-5 first:pt-0 last:pb-0">
    <span className="grid size-11 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
      <ContactIcon type={icon} />
    </span>
    <div className="min-w-0">
      <p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-sigasj-muted">
        {label}
      </p>
      <div className="mt-1.5 text-[0.98rem] leading-6 text-sigasj-text">{children}</div>
    </div>
  </div>
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

  const linkClass =
    'font-semibold text-sigasj-primary no-underline transition-colors hover:text-sigasj-primary-hover'

  return (
    <section
      className="public-section bg-white"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="public-container">
        <header className="mx-auto flex w-full max-w-[40rem] flex-col items-center text-center">
          <p className="mb-2 inline-block text-[13px] font-semibold uppercase tracking-[0.12em] text-sigasj-primary [margin-inline-end:-0.12em]">
            Canal de atención
          </p>
          <h2 id={`${id}-title`} className="public-section-title w-full text-center">
            {title}
          </h2>
          <p className="mb-0 mt-4 w-full max-w-[32rem] text-pretty text-center text-base leading-[1.65] text-sigasj-muted">
            {description}
          </p>
        </header>

        <div className="mt-12 grid grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] items-stretch gap-10 max-[960px]:grid-cols-1 max-[960px]:gap-8">
          <div className="flex min-w-0 flex-col justify-center divide-y divide-sigasj-border">
            {phonePrimary ? (
              <ContactRow icon="phone" label="Teléfono principal">
                <a
                  className={linkClass}
                  href={whatsappHref(phonePrimary)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Contactar por WhatsApp al ${phonePrimary}`}
                >
                  {phonePrimary}
                </a>
              </ContactRow>
            ) : null}

            {phoneNumbers?.length ? (
              <ContactRow icon="phone" label="Teléfonos adicionales">
                <ul className="m-0 list-none space-y-1 p-0">
                  {phoneNumbers.map((phone) => (
                    <li key={phone}>
                      <a className={linkClass} href={phoneHref(phone)}>
                        {phone}
                      </a>
                    </li>
                  ))}
                </ul>
              </ContactRow>
            ) : null}

            {email ? (
              <ContactRow icon="mail" label="Correo electrónico">
                <a
                  className={`${linkClass} break-all`}
                  href={gmailComposeHref(email)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Enviar un correo a ${email}`}
                >
                  {email}
                </a>
              </ContactRow>
            ) : null}

            {attentionHours ? (
              <ContactRow icon="clock" label="Horario de atención">
                <p className="m-0 text-sigasj-text">{attentionHours}</p>
              </ContactRow>
            ) : null}

            {address ? (
              <ContactRow icon="location" label="Dirección física">
                <address className="m-0 not-italic text-sigasj-text">{address}</address>
              </ContactRow>
            ) : null}

            {locationReference ? (
              <p className="mb-0 mt-4 text-sm text-sigasj-muted">
                Referencia: {locationReference}
              </p>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-[13px] bg-sigasj-surface-soft max-[960px]:min-h-[260px]">
              {(showMapEmbed && embeddedMap) || mapEmbedUrl ? (
                <>
                  {showMapEmbed && embeddedMap ? (
                    embeddedMap
                  ) : (
                    <iframe
                      className="absolute inset-0 h-full w-full border-0"
                      src={mapEmbedUrl}
                      title="Mapa de la oficina de ASADA San Juan de Santa Cruz"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  )}
                  {resolvedMapUrl ? (
                    <a
                      className="absolute inset-0 z-10"
                      href={resolvedMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir esta ubicación en Google Maps"
                    />
                  ) : null}
                </>
              ) : (
                <div className="grid h-full min-h-[280px] place-items-center gap-3 px-6 text-center text-sigasj-muted">
                  <ContactIcon type="location" />
                  <span>Consulta la ubicación exacta en Google Maps.</span>
                </div>
              )}
            </div>

            {resolvedMapUrl ? (
              <a
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-sigasj-primary px-5 text-sm font-semibold text-white no-underline transition-colors hover:bg-sigasj-primary-hover"
                href={resolvedMapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver ubicación
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
