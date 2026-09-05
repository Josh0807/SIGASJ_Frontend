import { Navigate, Route, Routes } from 'react-router-dom'
import ActividadesFontaneroStubPage from '../pages/ActividadesFontaneroStubPage'
import ActividadesAdminHomePage from './ActividadesAdminHomePage'
import { ACTIVIDADES_ADMIN_PATHS } from './actividadesAdminPaths'

const ActividadesAdminRoutes = () => (
  <Routes>
    <Route index element={<ActividadesAdminHomePage />} />
    <Route
      path="dashboard"
      element={
        <ActividadesFontaneroStubPage
          title="Dashboard de actividades"
          description="Resumen administrativo de actividades reportadas, en revisión y con corrección pendiente."
          backPath={ACTIVIDADES_ADMIN_PATHS.home}
          backLabel="Volver a actividades del Fontanero"
        />
      }
    />
    <Route
      path="reportes"
      element={
        <ActividadesFontaneroStubPage
          title="Reportes de actividades"
          description="Consulte reportes e historial administrativo del registro de actividades."
          backPath={ACTIVIDADES_ADMIN_PATHS.home}
          backLabel="Volver a actividades del Fontanero"
        />
      }
    />
    <Route
      path="*"
      element={<Navigate to={ACTIVIDADES_ADMIN_PATHS.home} replace />}
    />
  </Routes>
)

export default ActividadesAdminRoutes
