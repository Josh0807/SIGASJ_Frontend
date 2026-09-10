import { Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import { InternalAdminRoleName, normalizeInternalRole } from '../../auth/utils/internalRoles'
import { UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/routePaths'
import CategoriaForm from './CategoriaForm'
import { createCategoria } from './categoriasApi'
import { categoriaError } from './categoriaUtils'
import type { CategoriaFormValues } from './types'

export default function CategoriaCreatePage() {
  const { user } = useAuth()
  if (normalizeInternalRole(user?.role) !== InternalAdminRoleName.Administradora) return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  const submit = async (values: CategoriaFormValues) => { try { await createCategoria({ nombre: values.nombre.trim(), descripcion: values.descripcion.trim() || null }) } catch (caught) { const parsed = categoriaError(caught); const error = new Error(parsed.message, { cause: caught }) as Error & { fieldError?: string }; error.fieldError = parsed.nombre; throw error } }
  return <main className="materials-admin materials-admin--form"><header className="materials-admin__header"><div><p className="materials-admin__eyebrow">Inventario · Categorías</p><h1>Nueva categoría</h1><p>Registre una clasificación para los materiales de bodega.</p></div></header><CategoriaForm mode="create" onSubmit={submit} /></main>
}
