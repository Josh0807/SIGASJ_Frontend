import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type {
  RequestService,
  RequestServiceIcon,
  RequestsSectionProps,
} from '../props/RequestsSectionProps'
import { SERVICE_REQUEST_ROUTES } from '../config/serviceRequestRoutes'

const defaultServices: RequestService[] = [
  {
    id: 'constancia-servicio',
    name: 'Solicitud de constancia de servicio',
    description: 'Solicita una constancia que acredite la información de tu servicio de agua.',
    formHref: SERVICE_REQUEST_ROUTES.serviceRecord,
    icon: 'service-record',
  },
  {
    id: 'afiliacion',
    name: 'Formulario de afiliación',
    description: 'Completa la solicitud para iniciar tu proceso de afiliación con la ASADA.',
    formHref: SERVICE_REQUEST_ROUTES.affiliation,
    icon: 'affiliation',
  },
  {
    id: 'arreglo-pago',
    name: 'Solicitud de arreglo de pago',
    description: 'Solicita una alternativa para regularizar el pago pendiente de tu servicio.',
    formHref: SERVICE_REQUEST_ROUTES.paymentPlan,
    icon: 'payment-plan',
  },
  {
    id: 'cambio-titular',
    name: 'Cambio de titular de servicio',
    description: 'Gestiona el cambio de la persona titular asociada a un servicio existente.',
    formHref: SERVICE_REQUEST_ROUTES.accountChange,
    icon: 'account-change',
  },
]

const iconPaths: Record<RequestServiceIcon, ReactNode> = {
  'service-record': (
    <>
      <path d="M6 3h9l3 3v15H6Z" />
      <path d="M15 3v4h4M9 11h6M9 15h6" />
    </>
  ),
  affiliation: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.5-3.2 2.3-5 5.5-5 1.6 0 2.9.5 3.8 1.3M17 12v6M14 15h6" />
    </>
  ),
  'payment-plan': (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18M7 15h3M15 13v4M13 15h4" />
    </>
  ),
  'account-change': (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.5-3.2 2.3-5 5.5-5 1.7 0 3 .5 3.9 1.4M16 13h5m-2-2 2 2-2 2" />
    </>
  ),
}

const ServiceIcon = ({ type, name }: { type: RequestServiceIcon; name: string }) => (
  <svg
    className="requests-section__icon"
    viewBox="0 0 24 24"
    role="img"
    aria-label={`Ícono de ${name}`}
    focusable="false"
  >
    {iconPaths[type]}
  </svg>
)

const RequestsSection = ({
  id = 'solicitudes-servicio',
  title = 'Solicitudes de servicio',
  description = 'Conoce los servicios disponibles y accede al formulario de la solicitud que necesitas.',
  services = defaultServices,
}: RequestsSectionProps) => (
  <section className="landing-section requests-section" id={id} aria-labelledby={`${id}-title`}>
    <div className="requests-section__content">
      <header className="requests-section__heading">
        <p className="requests-section__eyebrow">Trámites en línea</p>
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{description}</p>
      </header>

      <div className="requests-section__grid">
        {services.map(({ id: serviceId, name, description: serviceDescription, formHref, icon }) => (
          <article className="requests-section__card" key={serviceId}>
            <ServiceIcon type={icon} name={name} />
            <h3>{name}</h3>
            <p>{serviceDescription}</p>
            <Link className="requests-section__button" to={formHref}>
              Realizar solicitud
            </Link>
          </article>
        ))}
      </div>
    </div>
  </section>
)

export default RequestsSection
