import { Navigate, Route, Routes } from 'react-router-dom'
import ColaboradorDetallePage from './ColaboradorDetallePage'
import ColaboradorFormPage from './ColaboradorFormPage'
import ColaboradoresPage from './ColaboradoresPage'
import PermisoDetallePage from './PermisoDetallePage'
import PermisoFormPage from './PermisoFormPage'
import PermisosPage from './PermisosPage'

export default function RecursosHumanosRoutes() {
  return (
    <Routes>
      <Route index element={<ColaboradoresPage />} />
      <Route path="nuevo" element={<ColaboradorFormPage />} />
      <Route path="permisos" element={<PermisosPage />} />
      <Route path="permisos/nuevo" element={<PermisoFormPage />} />
      <Route path="permisos/:id" element={<PermisoDetallePage />} />
      <Route path="permisos/:id/editar" element={<PermisoFormPage />} />
      <Route path=":id" element={<ColaboradorDetallePage />} />
      <Route path=":id/editar" element={<ColaboradorFormPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  )
}
