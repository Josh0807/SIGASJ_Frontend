import { Navigate, Route, Routes } from 'react-router-dom'
import AsociadosPage from './AsociadosPage'
import RegistrarAsociadoPage from './RegistrarAsociadoPage'

export default function AsociadosRoutes() {
  return <Routes><Route index element={<AsociadosPage />} /><Route path="nuevo" element={<RegistrarAsociadoPage />} /><Route path="registrar" element={<Navigate to="../nuevo" replace />} /><Route path="*" element={<Navigate to="." replace />} /></Routes>
}
