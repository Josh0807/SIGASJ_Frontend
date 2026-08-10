import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'
import { PRIVATE_ROUTES } from './privateRoutes'
import { PUBLIC_ROUTES } from './publicRoutes'

const AppRoutes = () => (
  <Routes>
    {PUBLIC_ROUTES.map(({ path, element }) => (
      <Route path={path} element={element} key={path} />
    ))}

    {PRIVATE_ROUTES.map(({ path, element }) => (
      <Route
        path={path}
        element={<ProtectedRoute>{element}</ProtectedRoute>}
        key={path}
      />
    ))}
  </Routes>
)

export default AppRoutes
