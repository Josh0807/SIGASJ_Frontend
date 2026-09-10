import { useState } from 'react'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import type { Material } from './types'

type Props = { material: Material; disabled: boolean; onChange: (material: Material, activo: boolean) => Promise<void> }

export default function MaterialStateAction({ material, disabled, onChange }: Props) {
  const [confirming, setConfirming] = useState(false)
  const handleClick = () => material.activo ? setConfirming(true) : void onChange(material, true)
  return <><button type="button" className={`materials-admin__state-action ${material.activo ? 'is-deactivate' : 'is-reactivate'}`} disabled={disabled} onClick={handleClick}>{disabled ? 'Procesando…' : material.activo ? 'Desactivar' : 'Reactivar'}</button><ConfirmDialog isOpen={confirming} title="Desactivar material" message={`¿Está segura de desactivar «${material.nombre}»? Dejará de estar disponible para nuevas salidas y solicitudes, pero se conservará su historial.`} confirmLabel="Desactivar material" confirmDanger onCancel={() => setConfirming(false)} onConfirm={() => { setConfirming(false); void onChange(material, false) }} /></>
}
