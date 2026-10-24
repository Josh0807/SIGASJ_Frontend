import { Route, Routes } from 'react-router-dom'
import AuthorizedRoute from '../../auth/components/AuthorizedRoute'
import FormulariosOficialesAdminPage from '../formularios-oficiales/FormulariosOficialesAdminPage'
import SolicitudesAdminHomePage from './SolicitudesAdminHomePage'
import SolicitudAdminDetailPage from './SolicitudAdminDetailPage'

const SolicitudesAdminRoutes = () => (
  <Routes>
    <Route index element={<SolicitudesAdminHomePage />} />
    <Route path=":id" element={<SolicitudAdminDetailPage />} />
    <Route path="formularios-oficiales" element={<AuthorizedRoute allowedRoles={['Administradora', 'Secretaria']}><FormulariosOficialesAdminPage /></AuthorizedRoute>} />
  </Routes>
)

export default SolicitudesAdminRoutes
