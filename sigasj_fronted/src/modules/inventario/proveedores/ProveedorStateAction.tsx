import { useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import type { Proveedor } from './types'

export default function ProveedorStateAction({ proveedor, disabled, onChange }: { proveedor: Proveedor; disabled: boolean; onChange: (proveedor: Proveedor, activo: boolean) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const busy = disabled
  return <><button type="button" className={`materials-admin__state-action ${proveedor.activo ? 'is-deactivate' : 'is-reactivate'}`} disabled={busy} onClick={() => proveedor.activo ? setOpen(true) : void onChange(proveedor, true)}>{busy ? 'Procesando…' : proveedor.activo ? 'Desactivar' : 'Activar'}</button><ConfirmDialog isOpen={open} title="Desactivar proveedor" message={`¿Está segura de desactivar «${proveedor.nombre}»? No se eliminará y seguirá disponible en el historial de inventario y compras.`} confirmLabel="Desactivar proveedor" confirmDanger onCancel={() => setOpen(false)} onConfirm={() => { setOpen(false); void onChange(proveedor, false) }} /></>
}
