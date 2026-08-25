import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AdminLayout from '../../shared/layouts/AdminLayout'
import AuthorizedRoute, {
  AdminAreaGate,
} from '../../modules/auth/components/AuthorizedRoute'
import ProtectedRoute from '../../modules/auth/components/ProtectedRoute'
import { useAuth } from '../../modules/auth/components/AuthContext'
import { getDefaultAdminHomePath } from '../../modules/auth/utils/adminNavigation'
import {
  ADMIN_CHILD_ROUTES,
  ADMIN_HOME_PATH,
  ADMIN_ROUTE_SEGMENT,
} from './privateRoutes'
import { PUBLIC_ROUTES } from './publicRoutes'
import { ABONADO_ROLE } from '../../modules/auth/utils/internalRoles'
import AbonadoRegistroPage from '../../modules/abonados/admin/AbonadoRegistroPage'
import {
  ABONADO_PERSONAL_NAV_ITEMS,
  toAbonadoPersonalRoutePath,
} from '../../modules/auth/utils/abonadoAccess'

const PublicRouteLayout = () => <Outlet />

const AdminIndexRedirect = () => {
  const { user } = useAuth()
  const target = getDefaultAdminHomePath(user) ?? ADMIN_HOME_PATH
  return <Navigate to={target} replace />
}

const AdminFallbackRedirect = () => {
  const { user } = useAuth()
  const fallbackPath = getDefaultAdminHomePath(user) ?? ADMIN_HOME_PATH
  return <Navigate to={fallbackPath} replace />
}

const AppRoutes = () => (
  <Routes>
    <Route element={<PublicRouteLayout />}>
      {PUBLIC_ROUTES.map(({ path, element }) => (
        <Route path={path} element={element} key={path} />
      ))}
    </Route>

    <Route
      element={
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard" element={<Navigate to={ADMIN_HOME_PATH} replace />} />
      {ABONADO_PERSONAL_NAV_ITEMS.map((item) => (
        <Route
          key={item.path}
          path={toAbonadoPersonalRoutePath(item.path)}
          element={
            <AuthorizedRoute
              requiredPath={item.path}
              allowedRoles={[ABONADO_ROLE]}
            >
              <main aria-labelledby="abonado-personal-title">
                <h1 id="abonado-personal-title">{item.title}</h1>
              </main>
            </AuthorizedRoute>
          }
        />
      ))}
      <Route
        path={ADMIN_ROUTE_SEGMENT}
        element={
          <AdminAreaGate>
            <AdminLayout />
          </AdminAreaGate>
        }
      >
        <Route index element={<AdminIndexRedirect />} />
        {ADMIN_CHILD_ROUTES.map(({ segment, element, path, allowedRoles }) => {
          // Autorización de ruta (rol). La visibilidad del menú se resuelve en AdminLayout.
          const authorized = (
            <AuthorizedRoute requiredPath={path} allowedRoles={allowedRoles}>
              {segment === 'abonados' ? <Outlet /> : element}
            </AuthorizedRoute>
          )

          if (segment === 'abonados') {
            return (
              <Route path={segment} element={authorized} key={segment}>
                <Route index element={element} />
                <Route path="nuevo" element={<AbonadoRegistroPage />} />
                <Route path="*" element={element} />
              </Route>
            )
          }

          return (
            <Route path={segment} element={authorized} key={segment} />
          )
        })}
        <Route path="*" element={<AdminFallbackRedirect />} />
      </Route>
    </Route>
  </Routes>
)

export default AppRoutes
