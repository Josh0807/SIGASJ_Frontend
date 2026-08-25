import type { ReactElement } from 'react'
import type { AdminNavIconName } from '../../modules/admin-panel/components/AdminNavIcon'
import { ADMIN_MODULE_ACCESS } from '../../modules/auth/config/adminNavigation.config'
import type { InternalAdminRole } from '../../modules/auth/utils/internalRoles'
import { ADMIN_BASE_PATH, ADMIN_ROUTE_SEGMENT } from './adminPaths'
import AdminDashboard from '../../modules/dashboard/AdminDashboard'
import GalleryAdminPage from '../../modules/galeria/admin/GalleryAdminPage'
import ComunicadosAdminPage from '../../modules/comunicados/admin/ComunicadosAdminPage'
import ContactoAdminPage from '../../modules/contacto/admin/ContactoAdminPage'
import TransparenciaAdminPage from '../../modules/transparencia/admin/TransparenciaAdminPage'
import ProfilePage from '../../modules/auth/pages/ProfilePage'
import AbonadosAdminPage from '../../modules/abonados/admin/AbonadosAdminPage'
import PrivateModulePlaceholder from '../../shared/components/PrivateModulePlaceholder'

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
  dashboard: <AdminDashboard />,
  usuarios: <PrivateModulePlaceholder title="Gestión de usuarios" />,
  abonados: <AbonadosAdminPage />,
  inventario: <PrivateModulePlaceholder title="Gestión de inventario" />,
  solicitudes: <PrivateModulePlaceholder title="Gestión de solicitudes" />,
  lecturas: <PrivateModulePlaceholder title="Gestión de lecturas" />,
  averias: <PrivateModulePlaceholder title="Gestión de averías" />,
  reportes: <PrivateModulePlaceholder title="Gestión de reportes" />,
  galeria: <GalleryAdminPage />,
  comunicados: <ComunicadosAdminPage />,
  contacto: <ContactoAdminPage />,
  transparencia: <TransparenciaAdminPage />,
  perfil: <ProfilePage />,
  menu: <PrivateModulePlaceholder title="Menú" />,
  menuClose: <PrivateModulePlaceholder title="Cerrar menú" />,
}

export { ADMIN_BASE_PATH, ADMIN_ROUTE_SEGMENT }
export const ADMIN_HOME_SEGMENT = 'dashboard'
export const ADMIN_HOME_PATH = `${ADMIN_BASE_PATH}/${ADMIN_HOME_SEGMENT}`
export const ADMIN_PROFILE_SEGMENT = 'perfil'
export const ADMIN_PROFILE_TITLE = 'Mi perfil'
export const ADMIN_PROFILE_PATH = `${ADMIN_BASE_PATH}/${ADMIN_PROFILE_SEGMENT}`

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

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_CHILD_ROUTES.filter(
  ({ availableInNav }) => availableInNav,
).map(({ path, title, icon }) => ({ path, title, icon }))
