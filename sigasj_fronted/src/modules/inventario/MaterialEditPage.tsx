import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import MaterialForm from './MaterialForm'
import { MATERIALES_PATH } from './inventarioPaths'
import { materialApiError } from './materialFormUtils'
import { updateMaterial } from './materialesApi'
import type { Material, MaterialFormValues } from './types'
import { useMaterial } from './useMaterial'
import { useAuth } from '../auth/components/AuthContext'
import { InternalAdminRoleName, normalizeInternalRole } from '../auth/utils/internalRoles'
import { UNAUTHORIZED_ROUTE_PATH } from '../../app/router/routePaths'
import { AdminShell, Alert, Button, PageHeader } from '../../shared/ui'

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
      <AdminShell aria-labelledby="material-edit-title">
        <PageHeader
          id="material-edit-title"
          eyebrow="Inventario · Materiales"
          title="Editar material"
          description="Actualice la ficha. La existencia no se modifica aquí; solo con entradas y salidas."
        />
        <Alert tone="info">Cargando material…</Alert>
      </AdminShell>
    )
  }
  if (error || !material) {
    return (
      <AdminShell aria-labelledby="material-edit-title">
        <PageHeader
          id="material-edit-title"
          eyebrow="Inventario · Materiales"
          title="Editar material"
          description="Actualice la ficha. La existencia no se modifica aquí; solo con entradas y salidas."
        />
        <Alert tone="danger">
          <p className="m-0 mb-3">{error ?? 'El material no existe.'}</p>
          <Button to={MATERIALES_PATH} variant="secondary" size="sm">
            Volver al catálogo
          </Button>
        </Alert>
      </AdminShell>
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
    requiereFechaVencimiento: material.requiereFechaVencimiento ?? false,
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
        fechaVencimiento: values.requiereFechaVencimiento ? values.fechaVencimiento || null : null,
        requiereFechaVencimiento: values.requiereFechaVencimiento,
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
    <AdminShell aria-labelledby="material-edit-title">
      <PageHeader
        id="material-edit-title"
        eyebrow="Inventario · Materiales"
        title="Editar material"
        description="Actualice la ficha. La existencia no se modifica aquí; solo con entradas y salidas."
      />
      <MaterialForm
        mode="edit"
        initialValues={initialValues}
        stockActual={material.stockActual}
        currentCategoria={material.categoria}
        currentProveedor={material.proveedor}
        onSubmit={submit}
      />
    </AdminShell>
  )
}
