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
import SalidaCreatePage from './salidas/SalidaCreatePage'
import SolicitudMaterialesPage from './solicitudes-materiales/SolicitudMaterialesPage'
import SolicitudesMaterialesSeguimientoPage from './solicitudes-materiales/SolicitudesMaterialesSeguimientoPage'
import SolicitudMaterialesDetallePage from './solicitudes-materiales/SolicitudMaterialesDetallePage'
import SolicitudesRevisionPage from './solicitudes-materiales/SolicitudesRevisionPage'
import SolicitudRevisionDetallePage from './solicitudes-materiales/SolicitudRevisionDetallePage'

const adminOnly = [InternalAdminRoleName.Administradora]
const salidaRoles = [InternalAdminRoleName.Administradora, InternalAdminRoleName.Fontanero]
const fontaneroOnly = [InternalAdminRoleName.Fontanero]

export default function InventarioRoutes() {
  return <Routes><Route index element={<Navigate to="materiales" replace />} /><Route path="materiales" element={<MaterialesPage />} /><Route path="materiales/nuevo" element={<MaterialCreatePage />} /><Route path="materiales/:id/editar" element={<MaterialEditPage />} /><Route path="categorias" element={<CategoriasPage />} /><Route path="categorias/nueva" element={<CategoriaCreatePage />} /><Route path="categorias/:id/editar" element={<CategoriaEditPage />} /><Route path="proveedores" element={<ProveedoresPage />} /><Route path="proveedores/nuevo" element={<AuthorizedRoute allowedRoles={adminOnly}><ProveedorCreatePage /></AuthorizedRoute>} /><Route path="proveedores/:id/editar" element={<AuthorizedRoute allowedRoles={adminOnly}><ProveedorEditPage /></AuthorizedRoute>} /><Route path="entradas" element={<AuthorizedRoute allowedRoles={adminOnly}><EntradaCreatePage /></AuthorizedRoute>} /><Route path="salidas" element={<AuthorizedRoute allowedRoles={salidaRoles}><SalidaCreatePage /></AuthorizedRoute>} /><Route path="solicitudes" element={<AuthorizedRoute allowedRoles={adminOnly}><SolicitudesRevisionPage /></AuthorizedRoute>} /><Route path="solicitudes/:id" element={<AuthorizedRoute allowedRoles={adminOnly}><SolicitudRevisionDetallePage /></AuthorizedRoute>} /><Route path="solicitudes-materiales" element={<AuthorizedRoute allowedRoles={fontaneroOnly}><SolicitudesMaterialesSeguimientoPage /></AuthorizedRoute>} /><Route path="solicitudes-materiales/nueva" element={<AuthorizedRoute allowedRoles={fontaneroOnly}><SolicitudMaterialesPage /></AuthorizedRoute>} /><Route path="solicitudes-materiales/:id" element={<AuthorizedRoute allowedRoles={fontaneroOnly}><SolicitudMaterialesDetallePage /></AuthorizedRoute>} /><Route path="*" element={<Navigate to="materiales" replace />} /></Routes>
}
