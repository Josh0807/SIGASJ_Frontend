import type { ComponentType } from 'react'
import AnnouncementsSection from '../../comunicados/components/AnnouncementsSection'
import GallerySection from '../../galeria/components/GallerySection'
import AboutSection from '../components/AboutSection'
import LandingContactBlock from '../components/LandingContactBlock'
import ProjectsPreview from '../components/ProjectsPreview'
import ReportFaultSection from '../components/ReportFaultSection'
import RequestsSection from '../components/RequestsSection'

export type LandingSectionDefinition = {
  id: string
  title: string
  Component: ComponentType
}

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
