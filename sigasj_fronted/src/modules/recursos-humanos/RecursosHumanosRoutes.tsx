import { Navigate, Route, Routes } from 'react-router-dom'
import ColaboradorDetallePage from './ColaboradorDetallePage'
import ColaboradorFormPage from './ColaboradorFormPage'
import ColaboradoresPage from './ColaboradoresPage'

export default function RecursosHumanosRoutes() {
  return (
    <Routes>
      <Route index element={<ColaboradoresPage />} />
      <Route path="nuevo" element={<ColaboradorFormPage />} />
      <Route path=":id" element={<ColaboradorDetallePage />} />
      <Route path=":id/editar" element={<ColaboradorFormPage />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  )
}
