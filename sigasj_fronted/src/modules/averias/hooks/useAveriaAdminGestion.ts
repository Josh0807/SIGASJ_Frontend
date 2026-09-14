import { useCallback, useState } from 'react'
import { parseAveriaAdminMutationError } from '../admin/parseAveriaAdminMutationError'
import type { EstadoAveria } from '../admin/estadoAveria'
import type { PrioridadAveria } from '../admin/prioridadAveria'
import type { TipoAveria } from '../admin/tipoAveria'
import type { AveriaDetail } from '../admin/types'
import {
  patchAdminAveriaClasificacion,
  patchAdminAveriaEstado,
  patchAdminAveriaPrioridad,
} from '../services/averiasAdminApi'

export type AveriaGestionField = 'estado' | 'prioridad' | 'clasificacion'

export type AveriaGestionFeedback = {
  variant: 'success' | 'error'
  message: string
}

export function useAveriaAdminGestion(
  onUpdated: (averia: AveriaDetail) => void,
) {
  const [pendingField, setPendingField] = useState<AveriaGestionField | null>(
    null,
  )
  const [feedback, setFeedback] = useState<AveriaGestionFeedback | null>(null)

  const runPatch = useCallback(
    async (
      field: AveriaGestionField,
      action: () => Promise<AveriaDetail>,
      successMessage: string,
    ) => {
      setPendingField(field)
      setFeedback(null)

      try {
        const updated = await action()
        onUpdated(updated)
        setFeedback({ variant: 'success', message: successMessage })
      } catch (error) {
        setFeedback({
          variant: 'error',
          message: parseAveriaAdminMutationError(error),
        })
        throw error
      } finally {
        setPendingField(null)
      }
    },
    [onUpdated],
  )

  const updateEstado = useCallback(
    (id: number, estado: EstadoAveria) =>
      runPatch(
        'estado',
        () => patchAdminAveriaEstado(id, estado),
        'Estado actualizado correctamente.',
      ),
    [runPatch],
  )

  const updatePrioridad = useCallback(
    (id: number, prioridad: PrioridadAveria) =>
      runPatch(
        'prioridad',
        () => patchAdminAveriaPrioridad(id, prioridad),
        'Prioridad actualizada correctamente.',
      ),
    [runPatch],
  )

  const updateClasificacion = useCallback(
    (id: number, clasificacion: TipoAveria) =>
      runPatch(
        'clasificacion',
        () => patchAdminAveriaClasificacion(id, clasificacion),
        'Clasificación actualizada correctamente.',
      ),
    [runPatch],
  )

  const clearFeedback = useCallback(() => {
    setFeedback(null)
  }, [])

  return {
    pendingField,
    feedback,
    clearFeedback,
    updateEstado,
    updatePrioridad,
    updateClasificacion,
  }
}
