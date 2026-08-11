import type { ReactElement } from 'react'
import GalleryAdminPage from '../features/galeria/pages/GalleryAdminPage'
import TransparenciaAdminPage from '../features/transparencia/pages/TransparenciaAdminPage'
import PrivateModulePlaceholder from './PrivateModulePlaceholder'

export type PrivateRouteDefinition = {
  path: string
  element: ReactElement
  title: string
}

export const PRIVATE_ROUTES: PrivateRouteDefinition[] = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    element: (
      <PrivateModulePlaceholder title="Dashboard administrativo" />
    ),
  },
  {
    path: '/admin/usuarios',
    title: 'Gestión de usuarios',
    element: (
      <PrivateModulePlaceholder title="Gestión de usuarios" />
    ),
  },
  {
    path: '/admin/abonados',
    title: 'Gestión de abonados',
    element: (
      <PrivateModulePlaceholder title="Gestión de abonados" />
    ),
  },
  {
    path: '/admin/inventario',
    title: 'Gestión de inventario',
    element: (
      <PrivateModulePlaceholder title="Gestión de inventario" />
    ),
  },
  {
    path: '/admin/solicitudes',
    title: 'Gestión de solicitudes',
    element: (
      <PrivateModulePlaceholder title="Gestión de solicitudes" />
    ),
  },
  {
    path: '/admin/lecturas',
    title: 'Gestión de lecturas',
    element: (
      <PrivateModulePlaceholder title="Gestión de lecturas" />
    ),
  },
  {
    path: '/admin/averias',
    title: 'Gestión de averías',
    element: (
      <PrivateModulePlaceholder title="Gestión de averías" />
    ),
  },
  {
    path: '/admin/reportes',
    title: 'Gestión de reportes',
    element: (
      <PrivateModulePlaceholder title="Gestión de reportes" />
    ),
  },
  {
    path: '/admin/galeria',
    title: 'Galería de fotografías',
    element: <GalleryAdminPage />,
  },
  {
    path: '/admin/transparencia',
    title: 'Transparencia y calidad del agua',
    element: <TransparenciaAdminPage />,
  },
]

export const PRIVATE_ROUTE_PATHS = PRIVATE_ROUTES.map(({ path }) => path)
