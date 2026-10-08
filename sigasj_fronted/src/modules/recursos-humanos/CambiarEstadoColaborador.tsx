import { IconUserCheck, IconUserOff } from '@tabler/icons-react'
import { useRef, useState } from 'react'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import { cambiarEstadoColaborador } from './colaboradoresApi'
import { colaboradorErrorMessage, esNoAutenticado, nombreCompleto } from './colaboradorForm'
import type { Colaborador } from './types'

type Props = {
  colaborador: Colaborador
  onCambiado: (actualizado: Colaborador) => void
  onError: (mensaje: string) => void
  onNoAutenticado: () => void
  compacto?: boolean
}

export default function CambiarEstadoColaborador({
  colaborador,
  onCambiado,
  onError,
  onNoAutenticado,
  compacto = false,
}: Props) {
  const [abierto, setAbierto] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const botonRef = useRef<HTMLButtonElement>(null)
  const enviando = useRef(false)
  const inactivar = colaborador.activo
  const nombre = nombreCompleto(colaborador)

  const confirmar = async () => {
    setAbierto(false)
    if (enviando.current) return
    enviando.current = true
    setGuardando(true)
    try {
      const actualizado = await cambiarEstadoColaborador(colaborador.id, !inactivar)
      onCambiado({ ...colaborador, ...actualizado, activo: !inactivar })
    } catch (error) {
      if (esNoAutenticado(error)) {
        onNoAutenticado()
        return
      }
      onError(colaboradorErrorMessage(error, 'No fue posible cambiar el estado del colaborador.'))
    } finally {
      enviando.current = false
      setGuardando(false)
    }
  }

  const Icono = inactivar ? IconUserOff : IconUserCheck
  const etiqueta = inactivar ? 'Inactivar' : 'Activar'
  const tono = inactivar
    ? 'border-red-200 text-red-700 hover:border-red-400 hover:bg-red-50'
    : 'border-emerald-200 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50'

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border bg-white font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 ${compacto ? 'min-h-9 px-3 py-1.5 text-sm' : 'min-h-12 px-5 py-3'} ${tono}`}
        onClick={() => {
          if (!enviando.current) setAbierto(true)
        }}
        disabled={guardando}
        aria-label={`${etiqueta} a ${nombre}`}
      >
        <Icono size={compacto ? 16 : 19} aria-hidden="true" />
        {guardando ? 'Guardando…' : etiqueta}
      </button>
      <ConfirmDialog
        isOpen={abierto}
        title={inactivar ? 'Inactivar colaborador' : 'Activar colaborador'}
        message={
          inactivar
            ? `${nombre} quedará inactivo y dejará de aparecer como personal disponible. ¿Desea continuar?`
            : `${nombre} volverá a quedar activo. ¿Desea continuar?`
        }
        confirmLabel={etiqueta}
        confirmDanger={inactivar}
        onCancel={() => setAbierto(false)}
        onConfirm={() => void confirmar()}
        returnFocusRef={botonRef}
      />
    </>
  )
}
