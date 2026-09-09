import { Navigate, Route, Routes } from 'react-router-dom'
import ActividadesAdminDashboardPage from './ActividadesAdminDashboardPage'
import ActividadesAdminRevisionPage from './ActividadesAdminRevisionPage'
import ActividadesAdminReportesPage from './ActividadesAdminReportesPage'
import { ACTIVIDADES_ADMIN_PATHS } from './actividadesAdminPaths'

const ActividadesAdminRoutes = () => (
  <Routes>
    <Route index element={<ActividadesAdminRevisionPage />} />
    <Route path="dashboard" element={<ActividadesAdminDashboardPage />} />
    <Route path="reportes" element={<ActividadesAdminReportesPage />} />
    <Route
      path="*"
      element={<Navigate to={ACTIVIDADES_ADMIN_PATHS.home} replace />}
    />
  </Routes>
)

export default ActividadesAdminRoutes
