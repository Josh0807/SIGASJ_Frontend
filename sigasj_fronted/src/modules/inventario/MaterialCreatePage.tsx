import MaterialForm from './MaterialForm'
import { materialApiError } from './materialFormUtils'
import { createMaterial } from './materialesApi'
import type { MaterialFormValues } from './types'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/components/AuthContext'
import { InternalAdminRoleName, normalizeInternalRole } from '../auth/utils/internalRoles'
import { UNAUTHORIZED_ROUTE_PATH } from '../../app/router/routePaths'

export default function MaterialCreatePage() {
  const { user } = useAuth()
  if (normalizeInternalRole(user?.role) !== InternalAdminRoleName.Administradora) return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  const submit = async (values: MaterialFormValues) => {
    try { await createMaterial({ nombre: values.nombre.trim(), descripcion: values.descripcion.trim() || null, unidadMedida: values.unidadMedida.trim(), ubicacion: values.ubicacion.trim() || null, stockMinimo: Number(values.stockMinimo), idCategoria: values.categoriaId ? Number(values.categoriaId) : null }) }
    catch (error) { throw new Error(materialApiError(error), { cause: error }) }
  }
  return <main className="materials-admin materials-admin--form"><header className="materials-admin__header"><div><p className="materials-admin__eyebrow">Inventario · Materiales</p><h1>Registrar material</h1><p>Agregue un nuevo material al catálogo de la bodega.</p></div></header><MaterialForm mode="create" onSubmit={submit} /></main>
}
