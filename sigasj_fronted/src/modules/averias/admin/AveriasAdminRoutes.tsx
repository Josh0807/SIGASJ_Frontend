import { Navigate, Route, Routes } from 'react-router-dom'
import AveriasAdminDetailPage from './AveriasAdminDetailPage'
import AveriasAdminPage from './AveriasAdminPage'
import AveriasHistorialPage from './AveriasHistorialPage'
import AveriasReporteResumenPage from './AveriasReporteResumenPage'
import ImprimirAveriasAtendidasPage from './ImprimirAveriasAtendidasPage'
import { AVERIAS_ADMIN_PATH } from './averiasAdminPaths'

const AveriasAdminRoutes = () => (
  <Routes>
    <Route index element={<AveriasAdminPage />} />
    <Route path="historial" element={<AveriasHistorialPage />} />
    <Route path="reportes/resumen" element={<AveriasReporteResumenPage />} />
    <Route path="reportes/imprimir" element={<ImprimirAveriasAtendidasPage />} />
    <Route path=":id" element={<AveriasAdminDetailPage />} />
    <Route path="*" element={<Navigate to={AVERIAS_ADMIN_PATH} replace />} />
  </Routes>
)

export default AveriasAdminRoutes
