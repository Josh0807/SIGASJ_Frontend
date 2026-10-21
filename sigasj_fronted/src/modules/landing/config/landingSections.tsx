import { lazy, type ComponentType } from 'react'

export type LandingSectionDefinition = {
  id: string
  title: string
  Component: ComponentType
}

const AboutSection = lazy(() => import('../components/AboutSection'))
const AnnouncementsSection = lazy(
  () => import('../../comunicados/components/AnnouncementsSection'),
)
const GallerySection = lazy(() => import('../../galeria/public/GallerySection'))
const LandingContactBlock = lazy(() => import('../components/LandingContactBlock'))
const ProjectsPreview = lazy(() => import('../components/ProjectsPreview'))
const ReportFaultSection = lazy(() => import('../components/ReportFaultSection'))
const ComplaintsSection = lazy(() => import('../components/ComplaintsSection'))
const RequestsSection = lazy(() => import('../components/RequestsSection'))
const TransparencySection = lazy(
  () => import('../../transparencia/public/TransparencySection'),
)

export const LANDING_SECTIONS: LandingSectionDefinition[] = [
  {
    id: 'sobre-nosotros',
    title: 'Sobre nosotros',
    Component: AboutSection,
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
    id: 'solicitudes-servicio',
    title: 'Solicitudes de servicio',
    Component: RequestsSection,
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
    Component: LandingContactBlock,
  },
]

export const LANDING_SECTION_IDS = LANDING_SECTIONS.map(({ id }) => id)
