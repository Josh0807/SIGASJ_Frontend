import { IconUserCheck, IconUserOff } from '@tabler/icons-react'
import { useRef, useState } from 'react'
import ConfirmDialog from '../../shared/components/ConfirmDialog'
import { Button } from '../../shared/ui'
import { cambiarEstadoColaborador } from './colaboradoresApi'
import {
  colaboradorErrorMessage,
  esNoAutenticado,
  nombreCompleto,
} from './colaboradorForm'
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
      const actualizado = await cambiarEstadoColaborador(
        colaborador.id,
        !inactivar,
      )
      onCambiado({ ...colaborador, ...actualizado, activo: !inactivar })
    } catch (error) {
      if (esNoAutenticado(error)) {
        onNoAutenticado()
        return
      }
      onError(
        colaboradorErrorMessage(
          error,
          'No fue posible cambiar el estado del colaborador.',
        ),
      )
    } finally {
      enviando.current = false
      setGuardando(false)
    }
  }

  const Icono = inactivar ? IconUserOff : IconUserCheck
  const etiqueta = inactivar ? 'Inactivar' : 'Activar'

  return (
    <>
      <Button
        ref={botonRef}
        type="button"
        variant={inactivar ? 'danger' : 'secondary'}
        size={compacto ? 'sm' : 'md'}
        leftIcon={<Icono size={compacto ? 16 : 18} aria-hidden="true" />}
        onClick={() => {
          if (!enviando.current) setAbierto(true)
        }}
        disabled={guardando}
        loading={guardando}
        aria-label={`${etiqueta} a ${nombre}`}
      >
        {etiqueta}
      </Button>
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
        onConfirm={() => void confirmar()}
        onCancel={() => setAbierto(false)}
        returnFocusRef={botonRef}
      />
    </>
  )
}
