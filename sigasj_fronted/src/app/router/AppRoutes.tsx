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
      <Route
        path={ADMIN_ROUTE_SEGMENT}
        element={
          <AdminAreaGate>
            <AdminLayout />
          </AdminAreaGate>
        }
      >
        <Route index element={<AdminIndexRedirect />} />
        {ADMIN_CHILD_ROUTES.map(({ segment, element, path }) => (
          <Route
            path={segment}
            element={
              <AuthorizedRoute requiredPath={path}>{element}</AuthorizedRoute>
            }
            key={segment}
          />
        ))}
        <Route path="*" element={<AdminFallbackRedirect />} />
      </Route>
    </Route>
  </Routes>
)

export default AppRoutes
