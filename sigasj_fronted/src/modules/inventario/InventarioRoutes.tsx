import { Navigate, Route, Routes } from 'react-router-dom'
import MaterialesPage from './MaterialesPage'
import MaterialEditPage from './MaterialEditPage'
import MaterialCreatePage from './MaterialCreatePage'
import CategoriasPage from './categorias/CategoriasPage'
import CategoriaCreatePage from './categorias/CategoriaCreatePage'
import CategoriaEditPage from './categorias/CategoriaEditPage'
import AuthorizedRoute from '../auth/components/AuthorizedRoute'
import { InternalAdminRoleName } from '../auth/utils/internalRoles'
import ProveedoresPage from './proveedores/ProveedoresPage'
import ProveedorCreatePage from './proveedores/ProveedorCreatePage'
import ProveedorEditPage from './proveedores/ProveedorEditPage'
import EntradaCreatePage from './entradas/EntradaCreatePage'

const adminOnly = [InternalAdminRoleName.Administradora]

export default function InventarioRoutes() {
  return <Routes><Route index element={<Navigate to="materiales" replace />} /><Route path="materiales" element={<MaterialesPage />} /><Route path="materiales/nuevo" element={<MaterialCreatePage />} /><Route path="materiales/:id/editar" element={<MaterialEditPage />} /><Route path="categorias" element={<CategoriasPage />} /><Route path="categorias/nueva" element={<CategoriaCreatePage />} /><Route path="categorias/:id/editar" element={<CategoriaEditPage />} /><Route path="proveedores" element={<ProveedoresPage />} /><Route path="proveedores/nuevo" element={<AuthorizedRoute allowedRoles={adminOnly}><ProveedorCreatePage /></AuthorizedRoute>} /><Route path="proveedores/:id/editar" element={<AuthorizedRoute allowedRoles={adminOnly}><ProveedorEditPage /></AuthorizedRoute>} /><Route path="entradas" element={<AuthorizedRoute allowedRoles={adminOnly}><EntradaCreatePage /></AuthorizedRoute>} /><Route path="*" element={<Navigate to="materiales" replace />} /></Routes>
}
