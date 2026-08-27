import { Navigate, Route, Routes } from 'react-router-dom'
import ProyectosAdminCreatePage from './ProyectosAdminCreatePage'
import ProyectosAdminEditPage from './ProyectosAdminEditPage'
import ProyectosAdminPage from './ProyectosAdminPage'
import { PROYECTOS_ADMIN_PATH } from './proyectosAdminPaths'

const ProyectosAdminRoutes = () => (
  <Routes>
    <Route index element={<ProyectosAdminPage />} />
    <Route path="nuevo" element={<ProyectosAdminCreatePage />} />
    <Route path=":id/editar" element={<ProyectosAdminEditPage />} />
    <Route path="*" element={<Navigate to={PROYECTOS_ADMIN_PATH} replace />} />
  </Routes>
)

export default ProyectosAdminRoutes
