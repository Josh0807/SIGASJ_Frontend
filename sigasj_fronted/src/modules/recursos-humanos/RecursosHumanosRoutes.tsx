import { Navigate, Route, Routes } from 'react-router-dom'
import ColaboradorDetallePage from './ColaboradorDetallePage'
import ColaboradorFormPage from './ColaboradorFormPage'
import ColaboradorHistorialPage from './ColaboradorHistorialPage'
import ColaboradoresPage from './ColaboradoresPage'
import IncapacidadDetallePage from './IncapacidadDetallePage'
import IncapacidadFormPage from './IncapacidadFormPage'
import IncapacidadesPage from './IncapacidadesPage'
import PermisoDetallePage from './PermisoDetallePage'
import PermisoFormPage from './PermisoFormPage'
import PermisosPage from './PermisosPage'
import SolicitudAusenciaDetallePage from '../solicitudes-ausencia/admin/SolicitudAusenciaDetallePage'
import SolicitudesAusenciaAdminGate from '../solicitudes-ausencia/admin/SolicitudesAusenciaAdminGate'
import SolicitudesAusenciaPage from '../solicitudes-ausencia/admin/SolicitudesAusenciaPage'
import VacacionesPage from './VacacionesPage'

export default function RecursosHumanosRoutes() {
  return (
    <Routes>
      <Route index element={<ColaboradoresPage />} />
      <Route path="nuevo" element={<ColaboradorFormPage />} />
      <Route path="vacaciones" element={<VacacionesPage />} />
      <Route
        path="solicitudes-ausencia"
        element={
          <SolicitudesAusenciaAdminGate>
            <SolicitudesAusenciaPage />
          </SolicitudesAusenciaAdminGate>
        }
      />
      <Route
        path="solicitudes-ausencia/:id"
        element={
          <SolicitudesAusenciaAdminGate>
            <SolicitudAusenciaDetallePage />
          </SolicitudesAusenciaAdminGate>
        }
      />
      <Route path="permisos" element={<PermisosPage />} />
      <Route path="permisos/nuevo" element={<PermisoFormPage />} />
      <Route path="permisos/:id" element={<PermisoDetallePage />} />
      <Route path="permisos/:id/editar" element={<PermisoFormPage />} />
      <Route path="incapacidades" element={<IncapacidadesPage />} />
      <Route path="incapacidades/nuevo" element={<IncapacidadFormPage />} />
      <Route path="incapacidades/:id" element={<IncapacidadDetallePage />} />
      <Route path="incapacidades/:id/editar" element={<IncapacidadFormPage />} />
      <Route path=":id/historial" element={<ColaboradorHistorialPage />} />
      <Route path=":id" element={<ColaboradorDetallePage />} />
      <Route path=":id/editar" element={<ColaboradorFormPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  )
}
