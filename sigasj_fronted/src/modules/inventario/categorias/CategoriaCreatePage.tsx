import { Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import {
  InternalAdminRoleName,
  normalizeInternalRole,
} from '../../auth/utils/internalRoles'
import { UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/routePaths'
import { AdminShell, PageHeader } from '../../../shared/ui'
import CategoriaForm from './CategoriaForm'
import { createCategoria } from './categoriasApi'
import { categoriaError } from './categoriaUtils'
import type { CategoriaFormValues } from './types'

export default function CategoriaCreatePage() {
  const { user } = useAuth()
  const role = normalizeInternalRole(user?.role)
  const allowed =
    role === InternalAdminRoleName.Administradora ||
    role === InternalAdminRoleName.SuperAdmin
  if (!allowed) {
    return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  }

  const submit = async (values: CategoriaFormValues) => {
    try {
      await createCategoria({
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim() || null,
        requiereFechaVencimiento: values.requiereFechaVencimiento,
      })
    } catch (caught) {
      const parsed = categoriaError(caught)
      const error = new Error(parsed.message, { cause: caught }) as Error & {
        fieldError?: string
      }
      error.fieldError = parsed.nombre
      throw error
    }
  }

  return (
    <AdminShell aria-labelledby="categoria-create-title">
      <PageHeader
        id="categoria-create-title"
        eyebrow="Inventario · Categorías"
        title="Nueva categoría"
        description="Registre una clasificación para los materiales de bodega."
      />
      <CategoriaForm mode="create" onSubmit={submit} />
    </AdminShell>
  )
}
