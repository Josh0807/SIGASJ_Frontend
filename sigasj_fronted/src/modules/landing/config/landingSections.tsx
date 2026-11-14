import { lazy, type ComponentType } from 'react'

export type LandingSectionDefinition = {
  id: string
  title: string
  Component: ComponentType
}

const InstitutionalNoticeSection = lazy(
  () => import('../components/InstitutionalNoticeSection'),
)
const QuickAccessSection = lazy(() => import('../components/QuickAccessSection'))
const AboutSection = lazy(() => import('../components/AboutSection'))
const RequestsSection = lazy(() => import('../components/RequestsSection'))
const ReceiptPaymentSection = lazy(
  () => import('../components/ReceiptPaymentSection'),
)
const ReportFaultSection = lazy(() => import('../components/ReportFaultSection'))
const ComplaintsSection = lazy(() => import('../components/ComplaintsSection'))
const AnnouncementsSection = lazy(
  () => import('../../comunicados/components/AnnouncementsSection'),
)
const TransparencySection = lazy(
  () => import('../../transparencia/public/TransparencySection'),
)
const ProjectsPreview = lazy(() => import('../components/ProjectsPreview'))
const GallerySection = lazy(() => import('../../galeria/public/GallerySection'))
const ContactOnlyBlock = lazy(() => import('../components/ContactOnlyBlock'))

/**
 * Orden institucional de la Landing pública (guía ASADA 2026):
 * Aviso → Accesos → Sobre ASADA → Trámites/recibos → Comunicados →
 * Transparencia → Proyectos → Galería → Contacto.
 */
export const LANDING_SECTIONS: LandingSectionDefinition[] = [
  {
    id: 'aviso-institucional',
    title: 'Aviso institucional',
    Component: InstitutionalNoticeSection,
  },
  {
    id: 'accesos-rapidos',
    title: 'Accesos rápidos',
    Component: QuickAccessSection,
  },
  {
    id: 'sobre-nosotros',
    title: 'Sobre nosotros',
    Component: AboutSection,
  },
  {
    id: 'solicitudes-servicio',
    title: 'Solicitudes de servicio',
    Component: RequestsSection,
  },
  {
    id: 'pagos',
    title: 'Recibos y pagos',
    Component: ReceiptPaymentSection,
  },
  {
    id: 'reporte-averias',
    title: 'Reporte de averías',
    Component: ReportFaultSection,
  },
  {
    id: 'quejas',
    title: 'Quejas',
    Component: ComplaintsSection,
  },
  {
    id: 'comunicados',
    title: 'Comunicados',
    Component: AnnouncementsSection,
  },
  {
    id: 'transparencia',
    title: 'Transparencia',
    Component: TransparencySection,
  },
  {
    id: 'proyectos',
    title: 'Proyectos destacados',
    Component: ProjectsPreview,
  },
  {
    id: 'galeria',
    title: 'Galería',
    Component: GallerySection,
  },
  {
    id: 'contacto',
    title: 'Contacto',
    Component: ContactOnlyBlock,
  },
]

export const LANDING_SECTION_IDS = LANDING_SECTIONS.map(({ id }) => id)
