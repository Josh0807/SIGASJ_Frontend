import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import { InternalAdminRoleName, normalizeInternalRole } from '../../auth/utils/internalRoles'
import { UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/routePaths'
import CategoriaForm from './CategoriaForm'
import { getCategoria, updateCategoria } from './categoriasApi'
import { categoriaError } from './categoriaUtils'
import type { Categoria, CategoriaFormValues } from './types'

export default function CategoriaEditPage() {
  const { user } = useAuth()
  const isAdmin = normalizeInternalRole(user?.role) === InternalAdminRoleName.Administradora
  const idValue = Number(useParams().id)
  const id = Number.isInteger(idValue) && idValue > 0 ? idValue : null
  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (!isAdmin || id === null) return
    let cancelled = false
    getCategoria(id).then((data) => { if (!cancelled) setCategoria(data) }).catch((caught) => { if (!cancelled) setError(categoriaError(caught).message) })
    return () => { cancelled = true }
  }, [id, isAdmin])
  if (!isAdmin) return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  if (id === null) return <Navigate to="/admin/inventario/categorias" replace />
  if (error) return <main className="materials-admin"><div className="materials-admin__error" role="alert">{error}</div></main>
  if (!categoria) return <main className="materials-admin"><div className="materials-admin__state" role="status"><span className="materials-admin__spinner" />Cargando categoría…</div></main>
  const submit = async (values: CategoriaFormValues) => { try { await updateCategoria(id, { nombre: values.nombre.trim(), descripcion: values.descripcion.trim() || null }) } catch (caught) { const parsed = categoriaError(caught); const next = new Error(parsed.message, { cause: caught }) as Error & { fieldError?: string }; next.fieldError = parsed.nombre; throw next } }
  return <main className="materials-admin materials-admin--form"><header className="materials-admin__header"><div><p className="materials-admin__eyebrow">Inventario · Categorías</p><h1>Editar categoría</h1><p>Actualice la información descriptiva de la categoría.</p></div></header><CategoriaForm mode="edit" initialValues={{ nombre: categoria.nombre, descripcion: categoria.descripcion ?? '' }} onSubmit={submit} /></main>
}
