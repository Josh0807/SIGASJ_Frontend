import type { ReactElement } from 'react'
import type { AdminNavIconName } from '../features/admin/AdminNavIcon'
import GalleryAdminPage from '../features/gallery/admin/GalleryAdminPage'
import TransparenciaAdminPage from '../features/transparencia/admin/TransparenciaAdminPage'
import PrivateModulePlaceholder from './PrivateModulePlaceholder'

export type PrivateRouteDefinition = {
  segment: string
  path: string
  title: string
  icon: AdminNavIconName
  availableInNav: boolean
  element: ReactElement
}

export type AdminNavItem = {
  path: string
  title: string
  icon: AdminNavIconName
}

type AdminChildRouteOptions = {
  availableInNav?: boolean
}

export const ADMIN_ROUTE_SEGMENT = 'admin'
export const ADMIN_BASE_PATH = `/${ADMIN_ROUTE_SEGMENT}`
export const ADMIN_HOME_SEGMENT = 'dashboard'
export const ADMIN_HOME_PATH = `${ADMIN_BASE_PATH}/${ADMIN_HOME_SEGMENT}`

const adminChildRoute = (
  segment: AdminNavIconName,
  title: string,
  element: ReactElement,
  options: AdminChildRouteOptions = {},
): PrivateRouteDefinition => ({
  segment,
  path: `${ADMIN_BASE_PATH}/${segment}`,
  title,
  icon: segment,
  availableInNav: options.availableInNav ?? true,
  element,
})

export const PRIVATE_ROUTES: PrivateRouteDefinition[] = [
  adminChildRoute(
    'dashboard',
    'Dashboard',
    <PrivateModulePlaceholder title="Dashboard administrativo" />,
  ),
  adminChildRoute(
    'usuarios',
    'Gestión de usuarios',
    <PrivateModulePlaceholder title="Gestión de usuarios" />,
  ),
  adminChildRoute(
    'abonados',
    'Gestión de abonados',
    <PrivateModulePlaceholder title="Gestión de abonados" />,
  ),
  adminChildRoute(
    'inventario',
    'Gestión de inventario',
    <PrivateModulePlaceholder title="Gestión de inventario" />,
  ),
  adminChildRoute(
    'solicitudes',
    'Gestión de solicitudes',
    <PrivateModulePlaceholder title="Gestión de solicitudes" />,
  ),
  adminChildRoute(
    'lecturas',
    'Gestión de lecturas',
    <PrivateModulePlaceholder title="Gestión de lecturas" />,
  ),
  adminChildRoute(
    'averias',
    'Gestión de averías',
    <PrivateModulePlaceholder title="Gestión de averías" />,
  ),
  adminChildRoute(
    'reportes',
    'Gestión de reportes',
    <PrivateModulePlaceholder title="Gestión de reportes" />,
  ),
  adminChildRoute(
    'galeria',
    'Galería de fotografías',
    <GalleryAdminPage />,
  ),
  adminChildRoute(
    'transparencia',
    'Transparencia y calidad del agua',
    <TransparenciaAdminPage />,
  ),
]

export const PRIVATE_ROUTE_PATHS = PRIVATE_ROUTES.map(({ path }) => path)

export const ADMIN_CHILD_ROUTES = PRIVATE_ROUTES

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_CHILD_ROUTES.filter(
  ({ availableInNav }) => availableInNav,
).map(({ path, title, icon }) => ({ path, title, icon }))
