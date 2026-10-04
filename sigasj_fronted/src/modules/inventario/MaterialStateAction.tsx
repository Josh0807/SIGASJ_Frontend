import { useState } from 'react'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import type { Material } from './types'
import { IconBan, IconRefresh } from '@tabler/icons-react'

type Props = { material: Material; disabled: boolean; onChange: (material: Material, activo: boolean) => Promise<void> }

export default function MaterialStateAction({ material, disabled, onChange }: Props) {
  const [confirming, setConfirming] = useState(false)
  const handleClick = () => material.activo ? setConfirming(true) : void onChange(material, true)
  return <><button type="button" className={`materials-admin__state-action !inline-flex !min-h-11 !items-center !justify-center !gap-2 !rounded-xl !px-4 !text-sm !font-extrabold !shadow-none !transition hover:!-translate-y-0.5 focus-visible:!outline-2 focus-visible:!outline-offset-2 ${material.activo ? 'is-deactivate !border-rose-200 !bg-rose-50 !text-rose-700 hover:!border-rose-300 hover:!bg-rose-100 focus-visible:!outline-rose-600' : 'is-reactivate !border-emerald-200 !bg-emerald-50 !text-emerald-700 hover:!border-emerald-300 hover:!bg-emerald-100 focus-visible:!outline-emerald-600'}`} disabled={disabled} onClick={handleClick}>{material.activo ? <IconBan size={17} stroke={2} aria-hidden="true" /> : <IconRefresh size={17} stroke={2} aria-hidden="true" />}{disabled ? 'Procesando…' : material.activo ? 'Desactivar' : 'Reactivar'}</button><ConfirmDialog isOpen={confirming} title="Desactivar material" message={`¿Está segura de desactivar «${material.nombre}»? Dejará de estar disponible para nuevas salidas y solicitudes, pero se conservará su historial.`} confirmLabel="Desactivar material" confirmDanger onCancel={() => setConfirming(false)} onConfirm={() => { setConfirming(false); void onChange(material, false) }} /></>
}
