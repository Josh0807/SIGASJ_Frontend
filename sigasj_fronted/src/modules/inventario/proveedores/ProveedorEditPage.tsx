import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AdminShell, Alert, Button, PageHeader } from '../../../shared/ui'
import { PROVEEDORES_PATH } from '../inventarioPaths'
import ProveedorForm from './ProveedorForm'
import { getProveedor, updateProveedor } from './proveedoresApi'
import { proveedorError } from './proveedorUtils'
import type { Proveedor, ProveedorFormValues, ProveedorPayload } from './types'

const formValues = (item: Proveedor): ProveedorFormValues => ({
  nombre: item.nombre,
  razonSocial: item.razonSocial ?? '',
  identificacion: item.identificacion ?? '',
  telefono: item.telefono ?? '',
  correo: item.correo ?? '',
  direccion: item.direccion ?? '',
  personaContacto: item.personaContacto ?? '',
})

export default function ProveedorEditPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const initial = (location.state as { proveedor?: Proveedor } | null)?.proveedor
  const numericId = Number(id)
  const invalidId = !Number.isInteger(numericId) || numericId <= 0
  const [proveedor, setProveedor] = useState<Proveedor | null>(initial ?? null)
  const [loading, setLoading] = useState(!initial && !invalidId)
  const [error, setError] = useState<string | null>(
    invalidId ? 'El identificador del proveedor no es válido.' : null,
  )

  useEffect(() => {
    if (initial || invalidId) return
    let cancelled = false
    getProveedor(numericId)
      .then((data) => {
        if (!cancelled) setProveedor(data)
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(
            proveedorError(caught, 'No fue posible cargar el proveedor.'),
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [initial, invalidId, numericId])

  const save = async (payload: ProveedorPayload) => {
    try {
      await updateProveedor(numericId, payload)
      navigate(PROVEEDORES_PATH, {
        replace: true,
        state: { success: 'Cambios del proveedor guardados correctamente.' },
      })
    } catch (caught) {
      throw new Error(
        proveedorError(caught, 'No fue posible guardar los cambios.'),
        { cause: caught },
      )
    }
  }

  return (
    <AdminShell aria-labelledby="proveedor-edit-title">
      <PageHeader
        id="proveedor-edit-title"
        eyebrow="Inventario · Proveedores"
        title="Editar proveedor"
        description="Actualice la información comercial y de contacto."
      />
      {loading ? (
        <Alert tone="info">Cargando proveedor…</Alert>
      ) : null}
      {!loading && error ? (
        <Alert tone="danger">
          <p className="m-0 mb-3">{error}</p>
          <Button to={PROVEEDORES_PATH} variant="secondary" size="sm">
            Volver al listado
          </Button>
        </Alert>
      ) : null}
      {!loading && proveedor ? (
        <ProveedorForm
          mode="edit"
          initialValues={formValues(proveedor)}
          onSubmit={save}
        />
      ) : null}
    </AdminShell>
  )
}
