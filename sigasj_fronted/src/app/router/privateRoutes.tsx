import { lazy, Suspense, type ReactElement } from 'react'
import type { AdminNavIconName } from '../../modules/admin-panel/components/AdminNavIcon'
import { ADMIN_MODULE_ACCESS } from '../../modules/auth/config/adminNavigation.config'
import type { InternalAdminRole } from '../../modules/auth/utils/internalRoles'
import { ADMIN_BASE_PATH, ADMIN_ROUTE_SEGMENT } from './adminPaths'
import AdminDashboard from '../../modules/dashboard/AdminDashboard'
import ProfilePage from '../../modules/auth/pages/ProfilePage'
import PrivateModulePlaceholder from '../../shared/components/PrivateModulePlaceholder'

const GalleryAdminPage = lazy(() => import('../../modules/galeria/admin/GalleryAdminPage'))
const ComunicadosAdminPage = lazy(
  () => import('../../modules/comunicados/admin/ComunicadosAdminPage'),
)
const ContactoAdminPage = lazy(() => import('../../modules/contacto/admin/ContactoAdminPage'))
const TransparenciaAdminPage = lazy(
  () => import('../../modules/transparencia/admin/TransparenciaAdminPage'),
)
const ProyectosAdminRoutes = lazy(
  () => import('../../modules/proyectos/admin/ProyectosAdminRoutes'),
)
const ActividadesFontaneroRoutes = lazy(
  () => import('../../modules/actividades-fontanero/ActividadesFontaneroRoutes'),
)
const ActividadesAdminRoutes = lazy(
  () => import('../../modules/actividades-fontanero/admin/ActividadesAdminRoutes'),
)
const InventarioRoutes = lazy(() => import('../../modules/inventario/InventarioRoutes'))
const AveriasAdminRoutes = lazy(() => import('../../modules/averias/admin/AveriasAdminRoutes'))
const AsociadosRoutes = lazy(() => import('../../modules/asociados/AsociadosRoutes'))
const RecursosHumanosRoutes = lazy(
  () => import('../../modules/recursos-humanos/RecursosHumanosRoutes'),
)
const SolicitudesAdminRoutes = lazy(
  () => import('../../modules/solicitudes-publicas/admin/SolicitudesAdminRoutes'),
)

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

type AdminRoutableIconName = Exclude<AdminNavIconName, 'menu' | 'menuClose'>

const ModuleFallback = () => (
  <p className="gallery-admin__empty" role="status">
    Cargando módulo…
  </p>
)

const lazyModule = (element: ReactElement) => (
  <Suspense fallback={<ModuleFallback />}>{element}</Suspense>
)

const ADMIN_MODULE_ELEMENTS: Record<AdminRoutableIconName, ReactElement> = {
  dashboard: <AdminDashboard />,
  usuarios: <PrivateModulePlaceholder title="Gestión de usuarios" />,
  abonados: lazyModule(<AsociadosRoutes />),
  inventario: lazyModule(<InventarioRoutes />),
  solicitudes: lazyModule(<SolicitudesAdminRoutes />),
  lecturas: lazyModule(<RecursosHumanosRoutes />),
  averias: lazyModule(<AveriasAdminRoutes />),
  actividades: lazyModule(<ActividadesFontaneroRoutes />),
  'actividades-fontanero': lazyModule(<ActividadesAdminRoutes />),
  reportes: <PrivateModulePlaceholder title="Gestión de reportes" />,
  proyectos: lazyModule(<ProyectosAdminRoutes />),
  galeria: lazyModule(<GalleryAdminPage />),
  comunicados: lazyModule(<ComunicadosAdminPage />),
  contacto: lazyModule(<ContactoAdminPage />),
  transparencia: lazyModule(<TransparenciaAdminPage />),
  perfil: <ProfilePage />,
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
    element: ADMIN_MODULE_ELEMENTS[module.segment as AdminRoutableIconName],
  }),
)

export const PRIVATE_ROUTE_PATHS = PRIVATE_ROUTES.map(({ path }) => path)

export const ADMIN_CHILD_ROUTES = PRIVATE_ROUTES

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_CHILD_ROUTES.filter(
  ({ availableInNav }) => availableInNav,
).map(({ path, title, icon }) => ({ path, title, icon }))
