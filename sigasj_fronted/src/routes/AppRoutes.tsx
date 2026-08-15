import { Route, Routes } from 'react-router-dom'
import AdminLayout from '../features/admin/AdminLayout'
import ProtectedRoute from '../features/auth/ProtectedRoute'
import { PRIVATE_ROUTES } from './privateRoutes'
import { PUBLIC_ROUTES } from './publicRoutes'

const AdminProtectedLayout = () => (
  <ProtectedRoute>
    <AdminLayout />
  </ProtectedRoute>
)

const AppRoutes = () => (
  <Routes>
    {PUBLIC_ROUTES.map(({ path, element }) => (
      <Route path={path} element={element} key={path} />
    ))}

    <Route element={<AdminProtectedLayout />}>
      {PRIVATE_ROUTES.map(({ path, element }) => (
        <Route path={path.replace(/^\//, '')} element={element} key={path} />
      ))}
    </Route>
  </Routes>
)

export default AppRoutes
