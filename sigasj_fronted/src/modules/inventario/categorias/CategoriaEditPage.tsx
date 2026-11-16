import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import {
  InternalAdminRoleName,
  normalizeInternalRole,
} from '../../auth/utils/internalRoles'
import { UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/routePaths'
import { AdminShell, Alert, PageHeader } from '../../../shared/ui'
import CategoriaForm from './CategoriaForm'
import { getCategoria, updateCategoria } from './categoriasApi'
import { categoriaError } from './categoriaUtils'
import type { Categoria, CategoriaFormValues } from './types'

export default function CategoriaEditPage() {
  const { user } = useAuth()
  const role = normalizeInternalRole(user?.role)
  const isAdmin =
    role === InternalAdminRoleName.Administradora ||
    role === InternalAdminRoleName.SuperAdmin
  const idValue = Number(useParams().id)
  const id = Number.isInteger(idValue) && idValue > 0 ? idValue : null
  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin || id === null) return
    let cancelled = false
    getCategoria(id)
      .then((data) => {
        if (!cancelled) setCategoria(data)
      })
      .catch((caught) => {
        if (!cancelled) setError(categoriaError(caught).message)
      })
    return () => {
      cancelled = true
    }
  }, [id, isAdmin])

  if (!isAdmin) return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  if (id === null) return <Navigate to="/admin/inventario/categorias" replace />

  if (error) {
    return (
      <AdminShell>
        <Alert tone="danger">{error}</Alert>
      </AdminShell>
    )
  }

  if (!categoria) {
    return (
      <AdminShell>
        <Alert tone="info">Cargando categoría…</Alert>
      </AdminShell>
    )
  }

  const submit = async (values: CategoriaFormValues) => {
    try {
      await updateCategoria(id, {
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim() || null,
        requiereFechaVencimiento: values.requiereFechaVencimiento,
      })
    } catch (caught) {
      const parsed = categoriaError(caught)
      const next = new Error(parsed.message, { cause: caught }) as Error & {
        fieldError?: string
      }
      next.fieldError = parsed.nombre
      throw next
    }
  }

  return (
    <AdminShell aria-labelledby="categoria-edit-title">
      <PageHeader
        id="categoria-edit-title"
        eyebrow="Inventario · Categorías"
        title="Editar categoría"
        description="Actualice la información descriptiva de la categoría."
      />
      <CategoriaForm
        mode="edit"
        initialValues={{
          nombre: categoria.nombre,
          descripcion: categoria.descripcion ?? '',
          requiereFechaVencimiento: Boolean(categoria.requiereFechaVencimiento),
        }}
        onSubmit={submit}
      />
    </AdminShell>
  )
}
