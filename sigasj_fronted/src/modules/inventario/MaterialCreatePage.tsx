import { Navigate, useNavigate } from 'react-router-dom'
import MaterialForm from './MaterialForm'
import { MATERIALES_PATH } from './inventarioPaths'
import { materialApiError } from './materialFormUtils'
import { createMaterial } from './materialesApi'
import type { MaterialFormValues } from './types'
import { useAuth } from '../auth/components/AuthContext'
import { InternalAdminRoleName, normalizeInternalRole } from '../auth/utils/internalRoles'
import { UNAUTHORIZED_ROUTE_PATH } from '../../app/router/routePaths'
import { registrarEntrada } from './entradas/entradasApi'

export default function MaterialCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  if (normalizeInternalRole(user?.role) !== InternalAdminRoleName.Administradora) {
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
        precioUnitario: values.precioUnitario ? Number(values.precioUnitario) : null,
        fechaVencimiento: values.fechaVencimiento || null,
      })
    } catch (error) {
      throw new Error(materialApiError(error), { cause: error })
    }

    const cantidadInicial = values.cantidadInicial ? Number(values.cantidadInicial) : 0
    if (cantidadInicial > 0 && material) {
      try {
        await registrarEntrada({
          idMaterial: material.id,
          cantidad: cantidadInicial,
          idProveedor: values.proveedorId ? Number(values.proveedorId) : null,
          precioUnitario: values.precioUnitario ? Number(values.precioUnitario) : null,
          observacion: 'Existencia inicial al registrar el material.',
        })
        navigate(MATERIALES_PATH, {
          replace: true,
          state: { success: `Material registrado y existencia inicial de ${cantidadInicial} unidad(es) aplicada correctamente.` },
        })
      } catch {
        navigate(MATERIALES_PATH, {
          replace: true,
          state: { warning: 'Material registrado correctamente, pero no fue posible aplicar la existencia inicial. Regístrela en "Registrar entrada".' },
        })
      }
      return
    }

    navigate(MATERIALES_PATH, {
      replace: true,
      state: { success: 'Material registrado correctamente. La existencia inicia en 0 hasta registrar una entrada.' },
    })
  }

  return (
    <main className="materials-admin materials-admin--form provider-admin-page sigasj-stack">
      <header className="materials-admin__header">
        <div>
          <p className="materials-admin__eyebrow">Inventario · Materiales</p>
          <h1>Registrar material</h1>
          <p>
            Complete la ficha del catálogo. La existencia física se actualiza solo con entradas y salidas.
          </p>
        </div>
      </header>
      <MaterialForm mode="create" onSubmit={submit} />
    </main>
  )
}
