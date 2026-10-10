import { Navigate, Route, Routes } from 'react-router-dom'
import AsociadoDetallePage from './AsociadoDetallePage'
import AsociadosPage from './AsociadosPage'
import RegistrarAsociadoPage from './RegistrarAsociadoPage'
import EditarAsociadoPage from './EditarAsociadoPage'

export default function AsociadosRoutes() {
  return <Routes><Route index element={<AsociadosPage />} /><Route path="nuevo" element={<RegistrarAsociadoPage />} /><Route path="registrar" element={<Navigate to="../nuevo" replace />} /><Route path=":id/editar" element={<EditarAsociadoPage />} /><Route path=":id" element={<AsociadoDetallePage />} /><Route path="*" element={<Navigate to="." replace />} /></Routes>
}
