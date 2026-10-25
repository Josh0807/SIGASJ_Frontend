import { useState } from 'react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import type { FormularioDescargableAdmin } from './types'

type Props = {
  formulario: FormularioDescargableAdmin
  disabled: boolean
  onChange: (
    formulario: FormularioDescargableAdmin,
    activo: boolean,
  ) => Promise<void>
}

const FormularioDescargableEstadoAction = ({
  formulario,
  disabled,
  onChange,
}: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={`min-h-11 rounded-xl px-4 text-sm font-extrabold shadow-sm transition disabled:cursor-wait disabled:opacity-60 ${
          formulario.activo
            ? 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
            : 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
        }`}
        disabled={disabled}
        onClick={() =>
          formulario.activo ? setOpen(true) : void onChange(formulario, true)
        }
      >
        {disabled
          ? 'Procesando…'
          : formulario.activo
            ? 'Inactivar'
            : 'Activar'}
      </button>
      <ConfirmDialog
        isOpen={open}
        title="Inactivar formulario"
        message={`«${formulario.nombre}» dejará de estar disponible públicamente. El registro y el PDF se conservarán. ¿Desea continuar?`}
        confirmLabel="Inactivar formulario"
        confirmDanger
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          void onChange(formulario, false)
        }}
      />
    </>
  )
}

export default FormularioDescargableEstadoAction
