import { Route, Routes } from 'react-router-dom'
import FormulariosOficialesAdminPage from '../formularios-oficiales/FormulariosOficialesAdminPage'
import SolicitudesAdminHomePage from './SolicitudesAdminHomePage'

const SolicitudesAdminRoutes = () => (
  <Routes>
    <Route index element={<SolicitudesAdminHomePage />} />
    <Route path="formularios-oficiales" element={<FormulariosOficialesAdminPage />} />
  </Routes>
)

export default SolicitudesAdminRoutes
