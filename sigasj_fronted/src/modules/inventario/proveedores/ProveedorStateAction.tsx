import { useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import type { Proveedor } from './types'

export default function ProveedorStateAction({ proveedor, disabled, onChange }: { proveedor: Proveedor; disabled: boolean; onChange: (proveedor: Proveedor, activo: boolean) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const busy = disabled
  return <><button type="button" className={`materials-admin__state-action ${proveedor.activo ? 'is-deactivate !border-amber-300 !bg-amber-50 !text-amber-800 hover:!border-amber-400 hover:!bg-amber-100' : 'is-reactivate !border-emerald-300 !bg-emerald-50 !text-emerald-700 hover:!border-emerald-400 hover:!bg-emerald-100'} !min-h-12 !rounded-xl !px-4 !font-extrabold !shadow-sm !transition-all !duration-300 enabled:hover:!-translate-y-0.5 enabled:hover:!shadow-md active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none`} disabled={busy} onClick={() => proveedor.activo ? setOpen(true) : void onChange(proveedor, true)}>{busy ? 'Procesando…' : proveedor.activo ? 'Desactivar' : 'Activar'}</button><ConfirmDialog isOpen={open} title="Desactivar proveedor" message={`¿Está segura de desactivar «${proveedor.nombre}»? No se eliminará y seguirá disponible en el historial de inventario y compras.`} confirmLabel="Desactivar proveedor" confirmDanger onCancel={() => setOpen(false)} onConfirm={() => { setOpen(false); void onChange(proveedor, false) }} /></>
}
