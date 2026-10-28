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
    ? 'border-rose-200 bg-gradient-to-br from-white to-rose-50 text-rose-700 shadow-[0_5px_14px_rgba(225,29,72,0.1)] hover:border-rose-400 hover:from-rose-50 hover:to-red-100 hover:text-rose-800 hover:shadow-[0_9px_20px_rgba(225,29,72,0.2)]'
    : 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50 text-emerald-700 shadow-[0_5px_14px_rgba(5,150,105,0.1)] hover:border-emerald-400 hover:from-emerald-50 hover:to-teal-100 hover:text-emerald-800 hover:shadow-[0_9px_20px_rgba(5,150,105,0.2)]'

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        className={`group inline-flex items-center justify-center gap-2 rounded-xl border font-extrabold transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:translate-y-0 active:scale-[0.97] disabled:cursor-not-allowed disabled:transform-none disabled:opacity-60 motion-reduce:transform-none motion-reduce:transition-none ${compacto ? 'min-h-10 px-4 py-2 text-sm' : 'min-h-12 rounded-2xl px-5 py-3'} ${tono}`}
        onClick={() => {
          if (!enviando.current) setAbierto(true)
        }}
        disabled={guardando}
        aria-label={`${etiqueta} a ${nombre}`}
      >
        <Icono className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none" size={compacto ? 17 : 20} aria-hidden="true" />
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
