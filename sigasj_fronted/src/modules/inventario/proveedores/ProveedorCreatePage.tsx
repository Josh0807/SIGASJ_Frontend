import { useNavigate } from 'react-router-dom'
import { AdminShell, PageHeader } from '../../../shared/ui'
import { PROVEEDORES_PATH } from '../inventarioPaths'
import ProveedorForm from './ProveedorForm'
import { createProveedor } from './proveedoresApi'
import { proveedorError } from './proveedorUtils'
import type { ProveedorPayload } from './types'

export default function ProveedorCreatePage() {
  const navigate = useNavigate()
  const save = async (payload: ProveedorPayload) => {
    try {
      await createProveedor(payload)
      navigate(PROVEEDORES_PATH, {
        replace: true,
        state: { success: 'Proveedor registrado correctamente.' },
      })
    } catch (caught) {
      throw new Error(
        proveedorError(caught, 'No fue posible registrar el proveedor.'),
        { cause: caught },
      )
    }
  }

  return (
    <AdminShell aria-labelledby="proveedor-create-title">
      <PageHeader
        id="proveedor-create-title"
        eyebrow="Inventario · Proveedores"
        title="Registrar proveedor"
        description="Complete el nombre y los datos de contacto disponibles."
      />
      <ProveedorForm mode="create" onSubmit={save} />
    </AdminShell>
  )
}
