import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AdminLayout from '../../shared/layouts/AdminLayout'
import ProtectedRoute from '../../modules/auth/components/ProtectedRoute'
import {
  ADMIN_CHILD_ROUTES,
  ADMIN_HOME_PATH,
  ADMIN_ROUTE_SEGMENT,
} from './privateRoutes'
import { PUBLIC_ROUTES } from './publicRoutes'

const PublicRouteLayout = () => <Outlet />

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
      <Route path={ADMIN_ROUTE_SEGMENT} element={<AdminLayout />}>
        <Route index element={<Navigate to={ADMIN_HOME_PATH} replace />} />
        {ADMIN_CHILD_ROUTES.map(({ segment, element }) => (
          <Route path={segment} element={element} key={segment} />
        ))}
        <Route path="*" element={<Navigate to={ADMIN_HOME_PATH} replace />} />
      </Route>
    </Route>
  </Routes>
)

export default AppRoutes
