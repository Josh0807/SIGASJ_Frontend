import { IconAlertTriangle, IconArrowRight, IconBuildingCommunity, IconClock, IconDownload, IconFiles, IconMapPin, IconProgressCheck, IconX } from '@tabler/icons-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { RequestService, RequestServiceIcon, RequestsSectionProps } from '../types/RequestsSectionProps'
import {
  OTHER_FORMS_ROUTE,
  REQUEST_TRACKING_ROUTE,
  SERVICE_REQUEST_ROUTES,
  isOnlineServiceRequestPath,
} from '../config/serviceRequestRoutes'
import { downloadFormularioOficial, getFormulariosOficialesPublicos } from '../../solicitudes-publicas/formularios-oficiales/formulariosOficialesApi'
import type { FormularioOficial } from '../../solicitudes-publicas/formularios-oficiales/types'

const onlineFormHref = (path: string) =>
  isOnlineServiceRequestPath(path) ? path : undefined

/** Fuente única: disponibilidad online desde `serviceRequestRoutes`. */
const defaultServices: RequestService[] = [
  { id: 'arreglo-pago', name: 'Solicitud de Arreglo de Pago Domiciliar', description: 'Permite solicitar un convenio de pago para regularizar saldos pendientes del servicio de agua.', formHref: onlineFormHref(SERVICE_REQUEST_ROUTES.paymentPlan), downloadSlug: 'arreglo-pago', badge: 'Trámite en línea', icon: 'payment-plan' },
  { id: 'cambio-titular', name: 'Cambio de Nombre del Titular del Servicio', description: 'Permite solicitar el cambio de la persona titular asociada al servicio de agua. Use el trámite en línea o descargue el formulario para entrega presencial.', formHref: onlineFormHref(SERVICE_REQUEST_ROUTES.accountChange), downloadSlug: 'cambio-titular', badge: 'Trámite en línea', icon: 'account-change' },
  { id: 'infraestructura-linderos', name: 'Constancia de Infraestructura Frente a Linderos de un Inmueble', description: 'Permite solicitar una constancia sobre la infraestructura de la ASADA frente a los linderos de un inmueble. Use el trámite en línea o descargue el formulario para entrega presencial.', formHref: onlineFormHref(SERVICE_REQUEST_ROUTES.boundaryInfrastructure), downloadSlug: 'infraestructura-linderos', badge: 'Trámite en línea', icon: 'boundary-infrastructure' },
  { id: 'afiliacion', name: 'Solicitud de Afiliación', description: 'Permite iniciar el proceso de afiliación a la ASADA. Use el trámite en línea o descargue el formulario para entrega presencial.', formHref: onlineFormHref(SERVICE_REQUEST_ROUTES.affiliation), downloadSlug: 'afiliacion', badge: 'Trámite en línea', icon: 'affiliation' },
  { id: 'disponibilidad-servicios', name: 'Constancia de Disponibilidad de Servicios', description: 'Permite solicitar una constancia sobre la disponibilidad de los servicios brindados por la ASADA. Use el trámite en línea o descargue el formulario para entrega presencial.', formHref: onlineFormHref(SERVICE_REQUEST_ROUTES.serviceAvailability), downloadSlug: 'disponibilidad-servicios', badge: 'Trámite en línea', icon: 'service-availability' },
  { id: 'servicio-existente', name: 'Constancia de Servicio Existente', description: 'Solicite en línea una constancia que acredite la existencia de un servicio de agua.', formHref: onlineFormHref(SERVICE_REQUEST_ROUTES.existingService), downloadSlug: 'servicio-existente', badge: 'Trámite en línea', icon: 'service-record' },
  { id: 'otros-formularios', name: 'Otros Formularios', description: 'Consulta y descarga otros documentos oficiales publicados por la Administración de la ASADA.', viewHref: OTHER_FORMS_ROUTE, badge: 'Solo descarga', icon: 'downloadable-forms' },
  { id: 'seguimiento', name: 'Seguimiento de Solicitudes', description: 'Consulta el avance de tu solicitud con el código de seguimiento y la identificación del solicitante.', viewHref: REQUEST_TRACKING_ROUTE, badge: 'Consulta pública', icon: 'request-tracking' },
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
  title = 'Trámites y solicitudes',
  description = 'Conoce los servicios disponibles y accede al formulario de la solicitud que necesitas.',
  services = defaultServices,
}: RequestsSectionProps) => {
  const [downloadingSlug, setDownloadingSlug] = useState<string | null>(null)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [presentialDownload, setPresentialDownload] = useState<{ slug: string; name: string } | null>(null)
  const [officialForms, setOfficialForms] = useState<FormularioOficial[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState(false)

  useEffect(() => {
    let active = true
    void getFormulariosOficialesPublicos()
      .then((items) => {
        if (active) setOfficialForms(items)
      })
      .catch(() => {
        if (active) setCatalogError(true)
      })
      .finally(() => {
        if (active) setCatalogLoading(false)
      })
    return () => { active = false }
  }, [])

  const formsBySlug = useMemo(
    () => new Map(officialForms.map((form) => [form.slug, form])),
    [officialForms],
  )

  const handleDownload = async (slug: string) => {
    if (downloadingSlug) return
    setDownloadingSlug(slug)
    setDownloadError(null)
    try {
      const officialForm = formsBySlug.get(slug)
      if (!catalogError && !officialForm?.tienePdf) {
        throw new Error('El formulario oficial no está disponible en este momento.')
      }
      await downloadFormularioOficial(slug, officialForm?.urlDescarga)
      setPresentialDownload(null)
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'No fue posible descargar el formulario oficial.')
    } finally {
      setDownloadingSlug(null)
    }
  }

  return (
  <section className="public-section public-section--canvas" id={id} aria-labelledby={`${id}-title`}>
    <div className="public-container">
      <header className="max-w-[720px]">
        <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-sigasj-primary">Trámites en línea</p>
        <h2 id={`${id}-title`} className="m-0 font-sigasj-display text-[clamp(1.7rem,3.2vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.02em] text-sigasj-text">{title}</h2>
        <p className="mb-0 mt-4 text-base leading-[1.65] text-sigasj-muted">{description}</p>
      </header>

      {downloadError ? <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800" role="alert">{downloadError}</p> : null}

      <div className="mt-8 grid grid-cols-2 gap-5 max-[760px]:grid-cols-1">
        {services.map(({ id: serviceId, name, description: serviceDescription, formHref, downloadSlug, viewHref, badge, icon }) => {
          const officialForm = downloadSlug ? formsBySlug.get(downloadSlug) : undefined
          const downloadAvailable = catalogError
            ? Boolean(downloadSlug)
            : Boolean(officialForm?.tienePdf)
          const downloadDisabled = catalogLoading || !downloadAvailable || Boolean(downloadingSlug)
          const downloadLabel = catalogLoading
            ? 'Consultando formulario…'
            : downloadAvailable
              ? 'Descargar formulario'
              : 'Formulario no disponible'
          return (
          <article className="relative flex min-h-[240px] flex-col overflow-hidden rounded-[13px] border border-sigasj-border bg-sigasj-surface px-6 py-5 max-[640px]:min-h-0" key={serviceId}>
            <div className="relative z-10 grid size-11 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
              <ServiceIcon type={icon} name={name} />
            </div>
            <h3 className="relative z-10 mb-0 mt-4 font-sigasj-display text-lg font-bold leading-tight text-sigasj-text">{name}</h3>
            {badge ? <span className="relative z-10 mt-3 w-fit rounded-md bg-sigasj-surface-soft px-2 py-1 text-[12px] font-semibold text-sigasj-primary-hover">{badge}</span> : null}
            <p className="relative z-10 mb-5 mt-2 max-w-[430px] text-sm leading-6 text-sigasj-muted">{serviceDescription}</p>
            {viewHref ? (
              <Link className="relative z-10 mt-auto flex min-h-11 w-full items-center justify-center gap-3 rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-4 text-center text-sm font-semibold text-sigasj-primary-hover no-underline transition-colors duration-150 hover:border-sigasj-primary hover:bg-sigasj-surface-soft" to={viewHref}>
                {serviceId === 'seguimiento' ? 'Consultar solicitud' : 'Ver formularios'}
                {serviceId === 'seguimiento' ? <IconProgressCheck className="shrink-0" size={18} aria-hidden="true" /> : <IconFiles className="shrink-0" size={18} aria-hidden="true" />}
              </Link>
            ) : formHref ? (
            <div className="relative z-10 mt-auto grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
              <Link className="flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-sigasj-primary bg-sigasj-primary px-4 text-center text-sm font-semibold text-white no-underline transition-colors duration-150 hover:border-sigasj-primary-hover hover:bg-sigasj-primary-hover" to={formHref}>
                Realizar solicitud <IconArrowRight className="shrink-0" size={18} aria-hidden="true" />
              </Link>
              <button className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-4 text-center text-sm font-semibold text-sigasj-primary-hover transition-colors duration-150 hover:border-sigasj-primary hover:bg-sigasj-surface-soft disabled:cursor-not-allowed disabled:opacity-75" type="button" disabled={downloadDisabled} aria-describedby={!downloadAvailable && !catalogLoading ? `${serviceId}-download-status` : undefined} onClick={() => { if (downloadSlug && downloadAvailable) { setDownloadError(null); setPresentialDownload({ slug: downloadSlug, name }) } }}>
                {downloadLabel} <IconDownload className="shrink-0" size={18} aria-hidden="true" />
              </button>
              {!downloadAvailable && !catalogLoading ? <span className="sr-only" id={`${serviceId}-download-status`}>La ASADA aún no ha publicado el PDF de este trámite.</span> : null}
            </div>
            ) : (
            <div className="relative z-10 mt-auto grid gap-3">
              <button className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-4 text-center text-sm font-semibold text-sigasj-primary-hover transition-colors duration-150 hover:border-sigasj-primary hover:bg-sigasj-surface-soft disabled:cursor-not-allowed disabled:opacity-75" type="button" disabled={downloadDisabled} onClick={() => { if (downloadSlug && downloadAvailable) { setDownloadError(null); setPresentialDownload({ slug: downloadSlug, name }) } }}>
                {downloadLabel} <IconDownload className="shrink-0" size={18} aria-hidden="true" />
              </button>
              <p className="m-0 text-center text-xs font-semibold text-sigasj-muted">El formulario en línea estará disponible próximamente.</p>
            </div>
            )}
          </article>
          )
        })}
      </div>
    </div>
    {presentialDownload && typeof document !== 'undefined' ? createPortal((
      <div className="fixed inset-0 z-[1200] grid place-items-center overflow-y-auto bg-[rgba(10,31,54,0.55)] p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !downloadingSlug) setPresentialDownload(null) }}>
        <section className="w-full max-w-[620px] overflow-hidden rounded-[26px] bg-sigasj-surface shadow-[0_28px_80px_rgba(3,35,72,0.3)]" role="dialog" aria-modal="true" aria-labelledby="presential-download-title">
          <header className="relative bg-gradient-to-br from-sigasj-ink to-sigasj-blue px-7 py-6 pr-16 text-white max-[560px]:px-5">
            <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-white/15"><IconBuildingCommunity size={26} aria-hidden="true" /></span>
            <p className="m-0 text-xs font-extrabold uppercase tracking-[0.18em] text-sigasj-mist">Modalidad presencial</p>
            <h3 className="mb-0 mt-2 text-2xl font-extrabold leading-tight text-white" id="presential-download-title">Descargar formulario oficial</h3>
            <button className="absolute right-5 top-5 grid size-10 cursor-pointer place-items-center rounded-xl border border-white/25 bg-white/10 text-white transition hover:rotate-6 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transform-none" type="button" aria-label="Cerrar" disabled={Boolean(downloadingSlug)} onClick={() => setPresentialDownload(null)}><IconX size={21} aria-hidden="true" /></button>
          </header>
          <div className="grid gap-5 p-7 max-[560px]:p-5">
            <div><strong className="block text-base font-extrabold text-sigasj-ink">{presentialDownload.name}</strong><p className="mb-0 mt-2 text-sm leading-6 text-sigasj-muted">Descarga y completa este formulario. Luego entrégalo presencialmente, junto con los documentos requeridos, en la ventanilla de la ASADA.</p></div>
            <div className="grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
              <div className="flex gap-3 rounded-xl bg-sigasj-surface-soft p-4"><IconClock className="shrink-0 text-sigasj-primary" size={21} aria-hidden="true" /><span><strong className="block text-sm text-sigasj-ink">Horario de atención</strong><small className="mt-1 block leading-5 text-sigasj-muted">Lunes a sábado<br />7:30 a.m. – 11:30 a.m.</small></span></div>
              <div className="flex gap-3 rounded-xl bg-sigasj-surface-soft p-4"><IconMapPin className="shrink-0 text-sigasj-primary" size={21} aria-hidden="true" /><span><strong className="block text-sm text-sigasj-ink">Ventanilla ASADA</strong><small className="mt-1 block leading-5 text-sigasj-muted">San Juan de Santa Cruz, Guanacaste</small></span></div>
            </div>
            <aside className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-sigasj-surface to-orange-50 px-5 py-5 text-center shadow-[0_10px_24px_rgba(217,119,6,0.1)]">
              <span className="mx-auto grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700" aria-hidden="true"><IconAlertTriangle size={22} /></span>
              <strong className="mt-3 block text-sm font-extrabold uppercase tracking-[0.08em] text-amber-900">Importante</strong>
              <p className="mx-auto mb-0 mt-2 max-w-lg text-sm leading-6 text-amber-900">Descargar el formulario no registra una solicitud digital. El trámite se recibe cuando presentas el documento en ventanilla.</p>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" aria-hidden="true" />
            </aside>
            {downloadError ? <p className="m-0 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">{downloadError}</p> : null}
            <footer className="flex justify-center gap-3 max-[480px]:flex-col-reverse"><button className="min-h-12 cursor-pointer rounded-xl border-2 border-sigasj-primary bg-sigasj-surface px-6 font-bold text-sigasj-primary" type="button" disabled={Boolean(downloadingSlug)} onClick={() => setPresentialDownload(null)}>Cancelar</button><button className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r from-sigasj-navy to-sigasj-blue px-6 font-extrabold text-white shadow-[0_10px_22px_rgba(8,114,211,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(8,114,211,0.3)] disabled:cursor-wait disabled:opacity-65 motion-reduce:transform-none" type="button" disabled={Boolean(downloadingSlug)} onClick={() => void handleDownload(presentialDownload.slug)}>{downloadingSlug ? 'Descargando…' : 'Descargar PDF'} <IconDownload size={19} aria-hidden="true" /></button></footer>
          </div>
        </section>
      </div>
    ), document.body) : null}
  </section>
  )
}

export default RequestsSection
