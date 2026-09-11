import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PROVEEDORES_PATH } from '../inventarioPaths'
import ProveedorForm from './ProveedorForm'
import { getProveedor, updateProveedor } from './proveedoresApi'
import { proveedorError } from './proveedorUtils'
import type { Proveedor, ProveedorFormValues, ProveedorPayload } from './types'

const formValues = (item: Proveedor): ProveedorFormValues => ({ nombre: item.nombre, razonSocial: item.razonSocial ?? '', identificacion: item.identificacion ?? '', telefono: item.telefono ?? '', correo: item.correo ?? '', direccion: item.direccion ?? '', personaContacto: item.personaContacto ?? '' })

export default function ProveedorEditPage() {
  const { id } = useParams(); const location = useLocation(); const navigate = useNavigate()
  const initial = (location.state as { proveedor?: Proveedor } | null)?.proveedor
  const numericId = Number(id)
  const invalidId = !Number.isInteger(numericId) || numericId <= 0
  const [proveedor, setProveedor] = useState<Proveedor | null>(initial ?? null)
  const [loading, setLoading] = useState(!initial && !invalidId)
  const [error, setError] = useState<string | null>(invalidId ? 'El identificador del proveedor no es válido.' : null)
  useEffect(() => {
    if (initial || invalidId) return
    let cancelled = false
    getProveedor(numericId).then((data) => { if (!cancelled) setProveedor(data) }).catch((caught) => { if (!cancelled) setError(proveedorError(caught, 'No fue posible cargar el proveedor.')) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [initial, invalidId, numericId])
  const save = async (payload: ProveedorPayload) => {
    try { await updateProveedor(numericId, payload); navigate(PROVEEDORES_PATH, { replace: true, state: { success: 'Cambios del proveedor guardados correctamente.' } }) }
    catch (caught) { throw new Error(proveedorError(caught, 'No fue posible guardar los cambios.'), { cause: caught }) }
  }
  return <main className="materials-admin materials-admin--form"><header className="materials-admin__header"><div><p className="materials-admin__eyebrow">Inventario · Proveedores</p><h1>Editar proveedor</h1><p>Actualice la información comercial y de contacto.</p></div></header>{loading && <div className="materials-admin__state" role="status"><span className="materials-admin__spinner" />Cargando proveedor…</div>}{!loading && error && <div className="materials-admin__error" role="alert"><p>{error}</p><Link className="materials-admin__secondary" to={PROVEEDORES_PATH}>Volver al listado</Link></div>}{!loading && proveedor && <ProveedorForm mode="edit" initialValues={formValues(proveedor)} onSubmit={save} />}</main>
}
