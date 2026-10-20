import { IconArrowRight, IconDownload, IconFiles, IconProgressCheck } from '@tabler/icons-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { RequestService, RequestServiceIcon, RequestsSectionProps } from '../types/RequestsSectionProps'
import { OTHER_FORMS_ROUTE, REQUEST_TRACKING_ROUTE, SERVICE_REQUEST_ROUTES } from '../config/serviceRequestRoutes'
import { downloadFormularioOficial } from '../../solicitudes-publicas/formularios-oficiales/formulariosOficialesApi'

const defaultServices: RequestService[] = [
  { id: 'arreglo-pago', name: 'Solicitud de Arreglo de Pago Domiciliar', description: 'Permite solicitar un convenio de pago para regularizar saldos pendientes del servicio de agua.', formHref: SERVICE_REQUEST_ROUTES.paymentPlan, downloadSlug: 'arreglo-pago', icon: 'payment-plan' },
  { id: 'cambio-titular', name: 'Cambio de Nombre del Titular del Servicio', description: 'Permite solicitar el cambio de la persona titular asociada al servicio de agua.', formHref: SERVICE_REQUEST_ROUTES.accountChange, downloadSlug: 'cambio-titular', icon: 'account-change' },
  { id: 'infraestructura-linderos', name: 'Constancia de Infraestructura Frente a Linderos de un Inmueble', description: 'Permite solicitar una constancia sobre la infraestructura de la ASADA frente a los linderos de un inmueble.', formHref: SERVICE_REQUEST_ROUTES.boundaryInfrastructure, downloadSlug: 'infraestructura-linderos', icon: 'boundary-infrastructure' },
  { id: 'afiliacion', name: 'Solicitud de Afiliación', description: 'Permite iniciar el proceso de afiliación a la ASADA mediante la solicitud oficial.', formHref: SERVICE_REQUEST_ROUTES.affiliation, downloadSlug: 'afiliacion', icon: 'affiliation' },
  { id: 'disponibilidad-servicios', name: 'Constancia de Disponibilidad de Servicios', description: 'Permite solicitar una constancia sobre la disponibilidad de los servicios brindados por la ASADA.', formHref: SERVICE_REQUEST_ROUTES.serviceAvailability, downloadSlug: 'disponibilidad-servicios', icon: 'service-availability' },
  { id: 'servicio-existente', name: 'Constancia de Servicio Existente', description: 'Permite solicitar una constancia que acredite la existencia de un servicio de agua.', formHref: SERVICE_REQUEST_ROUTES.existingService, downloadSlug: 'servicio-existente', icon: 'service-record' },
  { id: 'otros-formularios', name: 'Otros Formularios', description: 'Consulta y descarga otros documentos oficiales publicados por la Administración de la ASADA.', viewHref: OTHER_FORMS_ROUTE, badge: 'Solo descarga', icon: 'downloadable-forms' },
  { id: 'seguimiento', name: 'Seguimiento de Solicitudes', description: 'Consulta el avance de tu solicitud utilizando el código de seguimiento que recibiste al enviarla.', viewHref: REQUEST_TRACKING_ROUTE, badge: 'Consulta pública', icon: 'request-tracking' },
]

const iconPaths: Record<RequestServiceIcon, ReactNode> = {
  'service-record': <><path d="M6 3h9l3 3v15H6Z" /><path d="M15 3v4h4M9 11h6M9 15h6" /></>,
  affiliation: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-3.2 2.3-5 5.5-5 1.6 0 2.9.5 3.8 1.3M17 12v6M14 15h6" /></>,
  'payment-plan': <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18M7 15h3M15 13v4M13 15h4" /></>,
  'account-change': <><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-3.2 2.3-5 5.5-5 1.7 0 3 .5 3.9 1.4M16 13h5m-2-2 2 2-2 2" /></>,
  'boundary-infrastructure': <><path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6" /><path d="M2 9h3M19 9h3" /></>,
  'service-availability': <><path d="M12 3s5 5.4 5 10a5 5 0 0 1-10 0c0-4.6 5-10 5-10Z" /><path d="m9.5 13 1.7 1.7 3.5-3.5" /></>,
  'downloadable-forms': <><path d="M6 3h9l3 3v15H6Z" /><path d="M15 3v4h4M12 10v7m-3-3 3 3 3-3" /></>,
  'request-tracking': <><path d="M9 11l3 3 8-8" /><path d="M20 12a8 8 0 1 1-5-7.4" /></>,
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
}: RequestsSectionProps) => {
  const [downloadingSlug, setDownloadingSlug] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const handleDownload = async (slug: string) => {
    if (downloadingSlug) return
    setDownloadingSlug(slug)
    setDownloadError(null)
    try {
      await downloadFormularioOficial(slug)
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'No fue posible descargar el formulario oficial.')
    } finally {
      setDownloadingSlug(null)
    }
  }

  return (
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

      {downloadError ? <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800" role="alert">{downloadError}</p> : null}

      <div className="mt-8 grid grid-cols-2 gap-5 max-[760px]:grid-cols-1">
        {services.map(({ id: serviceId, name, description: serviceDescription, formHref, downloadSlug, viewHref, badge, icon }) => (
          <article className="requests-motion-card relative flex min-h-[255px] flex-col overflow-hidden rounded-[22px] border border-white bg-white/90 px-8 py-6 shadow-[0_12px_28px_rgba(39,112,166,0.12)] backdrop-blur-sm focus-within:ring-3 focus-within:ring-sky-300/50 max-[640px]:min-h-0 max-[640px]:px-5" key={serviceId}>
            <div className="relative z-10 grid size-16 place-items-center rounded-[18px] bg-gradient-to-br from-[#edf8ff] to-[#dceffd] text-[#1476cf]">
              <ServiceIcon type={icon} name={name} />
            </div>
            <h3 className="relative z-10 mb-0 mt-4 text-xl font-extrabold leading-tight text-[#073b79]">{name}</h3>
            {badge ? <span className="relative z-10 mt-3 w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-amber-800">{badge}</span> : null}
            <p className="relative z-10 mb-5 mt-2 max-w-[430px] text-[0.95rem] leading-6 text-[#526d8c]">{serviceDescription}</p>
            {viewHref ? (
              <Link className="requests-motion-button relative z-10 mt-auto flex min-h-11 w-full items-center justify-center gap-3 rounded-[10px] border-2 border-[#1476cf] bg-white px-4 text-center text-sm font-bold text-[#0b65b5] no-underline shadow-[0_6px_14px_rgba(8,114,211,0.12)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400" to={viewHref}>
                {serviceId === 'seguimiento' ? 'Consultar solicitud' : 'Ver formularios'}
                {serviceId === 'seguimiento' ? <IconProgressCheck className="shrink-0" size={19} aria-hidden="true" /> : <IconFiles className="shrink-0" size={19} aria-hidden="true" />}
              </Link>
            ) : (
            <div className="relative z-10 mt-auto grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
              <Link className="requests-motion-button flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#0872d3] to-[#2f91da] px-4 text-center text-sm font-bold text-white no-underline shadow-[0_8px_18px_rgba(8,114,211,0.2)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400" to={formHref!}>
                Realizar solicitud <IconArrowRight className="shrink-0" size={19} aria-hidden="true" />
              </Link>
              <button className="requests-motion-button flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border-2 border-[#1476cf] bg-white px-4 text-center text-sm font-bold text-[#0b65b5] shadow-[0_6px_14px_rgba(8,114,211,0.12)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:cursor-wait disabled:opacity-65" type="button" disabled={Boolean(downloadingSlug)} onClick={() => downloadSlug && void handleDownload(downloadSlug)}>
                {downloadingSlug === downloadSlug ? 'Descargando…' : 'Descargar formulario'} <IconDownload className="shrink-0" size={19} aria-hidden="true" />
              </button>
            </div>
            )}

            <span className="pointer-events-none absolute right-9 top-14 text-sky-300/35" aria-hidden="true"><ServiceIcon type={icon} name={name} decorative /></span>
            <span className="pointer-events-none absolute -right-16 -bottom-20 h-28 w-72 -rotate-6 rounded-[50%] bg-sky-200/35" aria-hidden="true" />
            <span className="pointer-events-none absolute -right-20 -bottom-24 h-28 w-80 rotate-3 rounded-[50%] border-[18px] border-sky-300/15" aria-hidden="true" />
          </article>
        ))}
      </div>
    </div>
  </section>
  )
}

export default RequestsSection
