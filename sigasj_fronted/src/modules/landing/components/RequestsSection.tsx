import { IconArrowRight } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { RequestService, RequestServiceIcon, RequestsSectionProps } from '../types/RequestsSectionProps'
import { SERVICE_REQUEST_ROUTES } from '../config/serviceRequestRoutes'

const defaultServices: RequestService[] = [
  { id: 'constancia-servicio', name: 'Solicitud de constancia de servicio', description: 'Solicita una constancia que acredite la información de tu servicio de agua.', formHref: SERVICE_REQUEST_ROUTES.serviceRecord, icon: 'service-record' },
  { id: 'afiliacion', name: 'Formulario de afiliación', description: 'Completa la solicitud para iniciar tu proceso de afiliación con la ASADA.', formHref: SERVICE_REQUEST_ROUTES.affiliation, icon: 'affiliation' },
  { id: 'arreglo-pago', name: 'Solicitud de arreglo de pago', description: 'Solicita una alternativa para regularizar el pago pendiente de tu servicio.', formHref: SERVICE_REQUEST_ROUTES.paymentPlan, icon: 'payment-plan' },
  { id: 'cambio-titular', name: 'Cambio de titular de servicio', description: 'Gestiona el cambio de la persona titular asociada a un servicio existente.', formHref: SERVICE_REQUEST_ROUTES.accountChange, icon: 'account-change' },
]

const iconPaths: Record<RequestServiceIcon, ReactNode> = {
  'service-record': <><path d="M6 3h9l3 3v15H6Z" /><path d="M15 3v4h4M9 11h6M9 15h6" /></>,
  affiliation: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-3.2 2.3-5 5.5-5 1.6 0 2.9.5 3.8 1.3M17 12v6M14 15h6" /></>,
  'payment-plan': <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18M7 15h3M15 13v4M13 15h4" /></>,
  'account-change': <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-3.2 2.3-5 5.5-5 1.7 0 3 .5 3.9 1.4M16 13h5m-2-2 2 2-2 2" /></>,
}

const ServiceIcon = ({ type, name, decorative = false }: { type: RequestServiceIcon; name: string; decorative?: boolean }) => (
  <svg
    className={decorative ? 'h-24 w-24 fill-none stroke-current stroke-[1.4]' : 'h-9 w-9 fill-none stroke-current stroke-[1.8]'}
    viewBox="0 0 24 24"
    role={decorative ? undefined : 'img'}
    aria-label={decorative ? undefined : `Ícono de ${name}`}
    aria-hidden={decorative || undefined}
    focusable="false"
    strokeLinecap="round"
    strokeLinejoin="round"
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
  <section className="relative isolate min-h-0 overflow-hidden bg-[linear-gradient(135deg,#fbfdff_0%,#edf8ff_55%,#e4f5ff_100%)] px-6 py-14 max-[640px]:px-4 max-[640px]:py-10" id={id} aria-labelledby={`${id}-title`}>
    <div className="pointer-events-none absolute -left-48 top-20 -z-10 h-[430px] w-[390px] rotate-[-18deg] rounded-[45%] bg-sky-200/35" aria-hidden="true" />
    <div className="pointer-events-none absolute -right-44 top-20 -z-10 h-52 w-[520px] -rotate-[18deg] rounded-[50%] border-[44px] border-sky-300/20" aria-hidden="true" />
    <div className="pointer-events-none absolute -bottom-28 left-1/4 -z-10 h-48 w-[760px] rotate-3 rounded-[50%] border-[46px] border-sky-300/15" aria-hidden="true" />

    <div className="mx-auto w-full max-w-[1180px]">
      <header className="max-w-[840px]">
        <p className="mb-2 flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.28em] text-[#1476cf] before:h-0.5 before:w-9 before:bg-[#1476cf]">Trámites en línea</p>
        <h2 id={`${id}-title`} className="m-0 text-[clamp(2.2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.04em] text-[#092e67]">{title}</h2>
        <p className="mb-0 mt-4 text-base leading-7 text-[#526d8c]">{description}</p>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-5 max-[760px]:grid-cols-1">
        {services.map(({ id: serviceId, name, description: serviceDescription, formHref, icon }) => (
          <article className="requests-motion-card relative flex min-h-[255px] flex-col overflow-hidden rounded-[22px] border border-white bg-white/90 px-8 py-6 shadow-[0_12px_28px_rgba(39,112,166,0.12)] backdrop-blur-sm focus-within:ring-3 focus-within:ring-sky-300/50 max-[640px]:min-h-0 max-[640px]:px-5" key={serviceId}>
            <div className="relative z-10 grid size-16 place-items-center rounded-[18px] bg-gradient-to-br from-[#edf8ff] to-[#dceffd] text-[#1476cf]">
              <ServiceIcon type={icon} name={name} />
            </div>
            <h3 className="relative z-10 mb-0 mt-4 text-xl font-extrabold leading-tight text-[#073b79]">{name}</h3>
            <p className="relative z-10 mb-5 mt-2 max-w-[430px] text-[0.95rem] leading-6 text-[#526d8c]">{serviceDescription}</p>
            <Link className="requests-motion-button relative z-10 mt-auto flex min-h-11 w-full items-center justify-center gap-8 rounded-[10px] bg-gradient-to-r from-[#0872d3] to-[#2f91da] px-6 text-sm font-bold text-white no-underline shadow-[0_8px_18px_rgba(8,114,211,0.2)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400" to={formHref}>
              Realizar solicitud <IconArrowRight size={20} aria-hidden="true" />
            </Link>

            <span className="pointer-events-none absolute right-9 top-14 text-sky-300/35" aria-hidden="true"><ServiceIcon type={icon} name={name} decorative /></span>
            <span className="pointer-events-none absolute -right-16 -bottom-20 h-28 w-72 -rotate-6 rounded-[50%] bg-sky-200/35" aria-hidden="true" />
            <span className="pointer-events-none absolute -right-20 -bottom-24 h-28 w-80 rotate-3 rounded-[50%] border-[18px] border-sky-300/15" aria-hidden="true" />
          </article>
        ))}
      </div>
    </div>
  </section>
)

export default RequestsSection
