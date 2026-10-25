import { Route, Routes } from 'react-router-dom'
import AuthorizedRoute from '../../auth/components/AuthorizedRoute'
import FormulariosDescargablesAdminPage from '../formularios-descargables/FormulariosDescargablesAdminPage'
import FormulariosOficialesAdminPage from '../formularios-oficiales/FormulariosOficialesAdminPage'
import SolicitudAdminDetailPage from './SolicitudAdminDetailPage'
import SolicitudesAdminHomePage from './SolicitudesAdminHomePage'
import SolicitudesAdminListPage from './SolicitudesAdminListPage'

const SolicitudesAdminRoutes = () => (
  <Routes>
    <Route index element={<SolicitudesAdminHomePage />} />
    <Route
      path="formularios-oficiales"
      element={
        <AuthorizedRoute allowedRoles={['Administradora', 'Secretaria']}>
          <FormulariosOficialesAdminPage />
        </AuthorizedRoute>
      }
    />
    <Route
      path="formularios-descargables"
      element={
        <AuthorizedRoute allowedRoles={['Administradora', 'Secretaria']}>
          <FormulariosDescargablesAdminPage />
        </AuthorizedRoute>
      }
    />
    <Route path="tramites" element={<SolicitudesAdminListPage />} />
    <Route path=":id" element={<SolicitudAdminDetailPage />} />
  </Routes>
)

export default SolicitudesAdminRoutes
