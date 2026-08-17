import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AdminLayout from '../features/admin/AdminLayout'
import { AdminAreaGate } from '../features/auth/AuthorizedRoute'
import AuthorizedRoute from '../features/auth/AuthorizedRoute'
import { getDefaultAdminHomePath } from '../features/auth/adminNavigation'
import ProtectedRoute from '../features/auth/ProtectedRoute'
import { useAuth } from '../features/auth/AuthContext'
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
