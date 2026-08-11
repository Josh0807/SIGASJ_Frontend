import type { ComponentType } from 'react'
import AboutSection from '../components/AboutSection'
import AnnouncementsSection from '../../announcements/public/AnnouncementsSection'
import GallerySection from '../../gallery/public/GallerySection'
import LandingContactBlock from '../components/LandingContactBlock'
import ProjectsPreview from '../components/ProjectsPreview'
import ReportFaultSection from '../components/ReportFaultSection'
import RequestsSection from '../components/RequestsSection'
import TransparencySection from '../../transparencia/public/TransparencySection'

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
    id: 'transparencia',
    title: 'Transparencia y calidad del agua',
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
