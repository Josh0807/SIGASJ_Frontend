import { Navigate, Route, Routes } from 'react-router-dom'
import MaterialesPage from './MaterialesPage'
import MaterialEditPage from './MaterialEditPage'
import MaterialCreatePage from './MaterialCreatePage'
import CategoriasPage from './categorias/CategoriasPage'
import CategoriaCreatePage from './categorias/CategoriaCreatePage'
import CategoriaEditPage from './categorias/CategoriaEditPage'

export default function InventarioRoutes() {
  return <Routes><Route index element={<Navigate to="materiales" replace />} /><Route path="materiales" element={<MaterialesPage />} /><Route path="materiales/nuevo" element={<MaterialCreatePage />} /><Route path="materiales/:id/editar" element={<MaterialEditPage />} /><Route path="categorias" element={<CategoriasPage />} /><Route path="categorias/nueva" element={<CategoriaCreatePage />} /><Route path="categorias/:id/editar" element={<CategoriaEditPage />} /><Route path="*" element={<Navigate to="materiales" replace />} /></Routes>
}
