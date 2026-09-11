import { useNavigate } from 'react-router-dom'
import { PROVEEDORES_PATH } from '../inventarioPaths'
import ProveedorForm from './ProveedorForm'
import { createProveedor } from './proveedoresApi'
import { proveedorError } from './proveedorUtils'
import type { ProveedorPayload } from './types'

export default function ProveedorCreatePage() {
  const navigate = useNavigate()
  const save = async (payload: ProveedorPayload) => {
    try { await createProveedor(payload); navigate(PROVEEDORES_PATH, { replace: true, state: { success: 'Proveedor registrado correctamente.' } }) }
    catch (caught) { throw new Error(proveedorError(caught, 'No fue posible registrar el proveedor.'), { cause: caught }) }
  }
  return <main className="materials-admin materials-admin--form"><header className="materials-admin__header"><div><p className="materials-admin__eyebrow">Inventario · Proveedores</p><h1>Registrar proveedor</h1><p>Complete el nombre y los datos de contacto disponibles.</p></div></header><ProveedorForm mode="create" onSubmit={save} /></main>
}
