import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AdminLayout from '../features/admin/AdminLayout'
import ProtectedRoute from '../features/auth/ProtectedRoute'
import {
  ADMIN_CHILD_ROUTES,
  ADMIN_HOME_PATH,
  ADMIN_ROUTE_SEGMENT,
} from './privateRoutes'
import { PUBLIC_ROUTES } from './publicRoutes'

const PublicRouteLayout = () => <Outlet />

const AdminProtectedLayout = () => (
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
)

const AppRoutes = () => (
  <Routes>
    <Route element={<PublicRouteLayout />}>
      {PUBLIC_ROUTES.map(({ path, element }) => (
        <Route path={path} element={element} key={path} />
      ))}
    </Route>

    <Route path="dashboard" element={<Navigate to={ADMIN_HOME_PATH} replace />} />

    <Route path={ADMIN_ROUTE_SEGMENT} element={<AdminProtectedLayout />}>
      <Route index element={<Navigate to={ADMIN_HOME_PATH} replace />} />
      {ADMIN_CHILD_ROUTES.map(({ segment, element }) => (
        <Route path={segment} element={element} key={segment} />
      ))}
    </Route>
  </Routes>
)

export default AppRoutes
