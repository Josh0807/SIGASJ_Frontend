import { Navigate, useNavigate } from 'react-router-dom'
import MaterialForm from './MaterialForm'
import { MATERIALES_PATH } from './inventarioPaths'
import { materialApiError } from './materialFormUtils'
import { createMaterial } from './materialesApi'
import type { MaterialFormValues } from './types'
import { useAuth } from '../auth/components/AuthContext'
import {
  InternalAdminRoleName,
  normalizeInternalRole,
} from '../auth/utils/internalRoles'
import { UNAUTHORIZED_ROUTE_PATH } from '../../app/router/routePaths'
import { registrarEntrada } from './entradas/entradasApi'
import { AdminShell, PageHeader } from '../../shared/ui'

export default function MaterialCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const role = normalizeInternalRole(user?.role)
  const allowed =
    role === InternalAdminRoleName.Administradora ||
    role === InternalAdminRoleName.SuperAdmin
  if (!allowed) {
    return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  }

  const submit = async (values: MaterialFormValues) => {
    let material: { id: number } | undefined
    try {
      material = await createMaterial({
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim() || null,
        unidadMedida: values.unidadMedida.trim(),
        ubicacion: values.ubicacion.trim() || null,
        stockMinimo: Number(values.stockMinimo),
        idCategoria: Number(values.categoriaId),
        idProveedor: Number(values.proveedorId),
        precioUnitario: values.precioUnitario
          ? Number(values.precioUnitario)
          : null,
        fechaVencimiento: values.requiereFechaVencimiento
          ? values.fechaVencimiento || null
          : null,
        requiereFechaVencimiento: values.requiereFechaVencimiento,
      })
    } catch (error) {
      throw new Error(materialApiError(error), { cause: error })
    }

    const cantidadInicial = values.cantidadInicial
      ? Number(values.cantidadInicial)
      : 0
    if (cantidadInicial > 0 && material) {
      try {
        await registrarEntrada({
          idMaterial: material.id,
          cantidad: cantidadInicial,
          idProveedor: values.proveedorId ? Number(values.proveedorId) : null,
          precioUnitario: values.precioUnitario
            ? Number(values.precioUnitario)
            : null,
          observacion: 'Existencia inicial al registrar el material.',
        })
        navigate(MATERIALES_PATH, {
          replace: true,
          state: {
            success: `Material registrado y existencia inicial de ${cantidadInicial} unidad(es) aplicada correctamente.`,
          },
        })
      } catch {
        navigate(MATERIALES_PATH, {
          replace: true,
          state: {
            warning:
              'Material registrado correctamente, pero no fue posible aplicar la existencia inicial. Regístrela en "Registrar entrada".',
          },
        })
      }
      return
    }

    navigate(MATERIALES_PATH, {
      replace: true,
      state: {
        success:
          'Material registrado correctamente. La existencia inicia en 0 hasta registrar una entrada.',
      },
    })
  }

  return (
    <AdminShell aria-labelledby="material-create-title">
      <PageHeader
        id="material-create-title"
        eyebrow="Inventario · Materiales"
        title="Registrar material"
        description="Complete la ficha del catálogo. La existencia física se actualiza solo con entradas y salidas."
      />
      <MaterialForm mode="create" onSubmit={submit} />
    </AdminShell>
  )
}
