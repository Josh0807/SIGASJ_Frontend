import { useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import type { Categoria } from './types'

export default function CategoriaStateAction({ categoria, disabled, onChange }: { categoria: Categoria; disabled: boolean; onChange: (categoria: Categoria, activo: boolean) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  return <><button type="button" className={`materials-admin__state-action ${categoria.activo ? 'is-deactivate' : 'is-reactivate'}`} disabled={disabled} onClick={() => categoria.activo ? setOpen(true) : void onChange(categoria, true)}>{disabled ? 'Procesando…' : categoria.activo ? 'Desactivar' : 'Reactivar'}</button><ConfirmDialog isOpen={open} title="Desactivar categoría" message={`¿Está segura de desactivar «${categoria.nombre}»? No se eliminará y seguirá disponible en registros históricos.`} confirmLabel="Desactivar categoría" confirmDanger onCancel={() => setOpen(false)} onConfirm={() => { setOpen(false); void onChange(categoria, false) }} /></>
}
