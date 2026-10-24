import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import MaterialForm from './MaterialForm'
import { MATERIALES_PATH } from './inventarioPaths'
import { materialApiError } from './materialFormUtils'
import { updateMaterial } from './materialesApi'
import type { Material, MaterialFormValues } from './types'
import { useMaterial } from './useMaterial'
import { useAuth } from '../auth/components/AuthContext'
import { InternalAdminRoleName, normalizeInternalRole } from '../auth/utils/internalRoles'
import { UNAUTHORIZED_ROUTE_PATH } from '../../app/router/routePaths'

export default function MaterialEditPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdministradora = normalizeInternalRole(user?.role) === InternalAdminRoleName.Administradora
  const parsedId = Number(useParams().id)
  const validId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null
  const stateMaterial = (useLocation().state as { material?: Material } | null)?.material
  const { material, loading, error } = useMaterial(
    isAdministradora ? validId : null,
    isAdministradora ? stateMaterial : undefined,
  )

  if (!isAdministradora) return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  if (validId === null) return <Navigate to={MATERIALES_PATH} replace />
  if (loading) {
    return (
      <main className="materials-admin">
        <div className="materials-admin__state" role="status">
          <span className="materials-admin__spinner" />
          Cargando material…
        </div>
      </main>
    )
  }
  if (error || !material) {
    return (
      <main className="materials-admin">
        <div className="materials-admin__error" role="alert">
          <p>{error ?? 'El material no existe.'}</p>
          <Link className="materials-admin__secondary" to={MATERIALES_PATH}>
            Volver al catálogo
          </Link>
        </div>
      </main>
    )
  }

  const initialValues: MaterialFormValues = {
    nombre: material.nombre,
    descripcion: material.descripcion ?? '',
    unidadMedida: material.unidadMedida,
    ubicacion: material.ubicacion ?? '',
    stockMinimo: String(material.stockMinimo),
    activo: material.activo,
    categoriaId: material.idCategoria ? String(material.idCategoria) : '',
    proveedorId: material.idProveedor ? String(material.idProveedor) : '',
    precioUnitario: material.precioUnitario != null ? String(material.precioUnitario) : '',
    fechaVencimiento: material.fechaVencimiento ? material.fechaVencimiento.slice(0, 10) : '',
    cantidadInicial: '',
  }

  const submit = async (values: MaterialFormValues) => {
    try {
      await updateMaterial(validId, {
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim() || null,
        unidadMedida: values.unidadMedida.trim(),
        ubicacion: values.ubicacion.trim() || null,
        stockMinimo: Number(values.stockMinimo),
        activo: values.activo,
        idCategoria: Number(values.categoriaId),
        idProveedor: Number(values.proveedorId),
        precioUnitario: values.precioUnitario ? Number(values.precioUnitario) : null,
        fechaVencimiento: values.fechaVencimiento || null,
      })
      navigate(MATERIALES_PATH, {
        replace: true,
        state: { success: 'Cambios del material guardados correctamente.' },
      })
    } catch (caught) {
      throw new Error(materialApiError(caught), { cause: caught })
    }
  }

  return (
    <main className="materials-admin materials-admin--form sigasj-stack">
      <header className="materials-admin__header">
        <div>
          <p className="materials-admin__eyebrow">Inventario · Materiales</p>
          <h1>Editar material</h1>
          <p>Actualice la ficha. La existencia no se modifica aquí; solo con entradas y salidas.</p>
        </div>
      </header>
      <MaterialForm
        mode="edit"
        initialValues={initialValues}
        stockActual={material.stockActual}
        currentCategoria={material.categoria}
        currentProveedor={material.proveedor}
        onSubmit={submit}
      />
    </main>
  )
}
