import type { ReactElement } from 'react'
import type { AdminNavIconName } from '../features/admin/AdminNavIcon'
import { ADMIN_MODULE_ACCESS } from '../features/auth/adminNavigation.config'
import type { InternalAdminRole } from '../features/auth/auth.types'
import GalleryAdminPage from '../features/gallery/admin/GalleryAdminPage'
import TransparenciaAdminPage from '../features/transparencia/admin/TransparenciaAdminPage'
import PrivateModulePlaceholder from './PrivateModulePlaceholder'

export type PrivateRouteDefinition = {
  segment: string
  path: string
  title: string
  icon: AdminNavIconName
  availableInNav: boolean
  allowedRoles: readonly InternalAdminRole[]
  requiredPermissions: readonly string[]
  element: ReactElement
}

export type AdminNavItem = {
  path: string
  title: string
  icon: AdminNavIconName
}

const ADMIN_MODULE_ELEMENTS: Record<AdminNavIconName, ReactElement> = {
  dashboard: <PrivateModulePlaceholder title="Dashboard administrativo" />,
  usuarios: <PrivateModulePlaceholder title="Gestión de usuarios" />,
  abonados: <PrivateModulePlaceholder title="Gestión de abonados" />,
  inventario: <PrivateModulePlaceholder title="Gestión de inventario" />,
  solicitudes: <PrivateModulePlaceholder title="Gestión de solicitudes" />,
  lecturas: <PrivateModulePlaceholder title="Gestión de lecturas" />,
  averias: <PrivateModulePlaceholder title="Gestión de averías" />,
  reportes: <PrivateModulePlaceholder title="Gestión de reportes" />,
  galeria: <GalleryAdminPage />,
  transparencia: <TransparenciaAdminPage />,
}

export const ADMIN_ROUTE_SEGMENT = 'admin'
export const ADMIN_BASE_PATH = `/${ADMIN_ROUTE_SEGMENT}`
export const ADMIN_HOME_SEGMENT = 'dashboard'
export const ADMIN_HOME_PATH = `${ADMIN_BASE_PATH}/${ADMIN_HOME_SEGMENT}`

export const PRIVATE_ROUTES: PrivateRouteDefinition[] = ADMIN_MODULE_ACCESS.map(
  (module) => ({
    segment: module.segment,
    path: `${ADMIN_BASE_PATH}/${module.segment}`,
    title: module.title,
    icon: module.segment,
    availableInNav: module.availableInNav,
    allowedRoles: module.allowedRoles,
    requiredPermissions: module.requiredPermissions,
    element: ADMIN_MODULE_ELEMENTS[module.segment],
  }),
)

export const PRIVATE_ROUTE_PATHS = PRIVATE_ROUTES.map(({ path }) => path)

export const ADMIN_CHILD_ROUTES = PRIVATE_ROUTES

/** Menú completo sin filtrar por rol (solo referencia / compatibilidad). */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_CHILD_ROUTES.filter(
  ({ availableInNav }) => availableInNav,
).map(({ path, title, icon }) => ({ path, title, icon }))
