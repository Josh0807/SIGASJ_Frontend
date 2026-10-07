import { useCallback, useEffect, useState } from 'react'
import { isAbortError } from '../admin/averiaAdminError'
import { parseAveriaAdminMutationError } from '../admin/parseAveriaAdminMutationError'
import {
  AVERIAS_ADMIN_FONTANEROS_LOAD_ERROR,
  buildAveriaAsignacionSuccessMessage,
  type AveriaDetail,
  type AveriaFontaneroAsignable,
} from '../admin/types'
import {
  getAdminAveriaAyudantes,
  getAdminAveriaFontaneros,
  patchAdminAveriaAsignacion,
  patchAdminAveriaEstado,
} from '../services/averiasAdminApi'

function parseUsuarioId(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') {
    return null
  }
  const parsed = Number.parseInt(trimmed, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export type AveriaAsignacionFeedback = {
  variant: 'success' | 'error'
  message: string
}

export function useAveriaAdminAsignacion(
  onUpdated: (averia: AveriaDetail) => void,
  options: { loadFontaneros: boolean } = { loadFontaneros: false },
) {
  const { loadFontaneros } = options
  const [fontaneros, setFontaneros] = useState<AveriaFontaneroAsignable[]>([])
  const [ayudantes, setAyudantes] = useState<AveriaFontaneroAsignable[]>([])
  const [listLoading, setListLoading] = useState(loadFontaneros)
  const [listError, setListError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const [selectedFontaneroId, setSelectedFontaneroId] = useState<number | null>(
    null,
  )
  const [selectedAyudanteId, setSelectedAyudanteId] = useState<number | null>(
    null,
  )
  const [assigning, setAssigning] = useState(false)
  const [feedback, setFeedback] = useState<AveriaAsignacionFeedback | null>(
    null,
  )

  const refetchFontaneros = useCallback(() => {
    setReloadTrigger((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!loadFontaneros) {
      return
    }

    const controller = new AbortController()
    let cancelled = false

    const load = async () => {
      setListLoading(true)
      setListError(null)

      try {
        const [resultFontaneros, resultAyudantes] = await Promise.all([
          getAdminAveriaFontaneros(controller.signal),
          getAdminAveriaAyudantes(controller.signal).catch((caught) => {
            if (isAbortError(caught)) {
              throw caught
            }
            return { data: [] as AveriaFontaneroAsignable[] }
          }),
        ])
        if (!cancelled) {
          setFontaneros(resultFontaneros.data ?? [])
          setAyudantes(resultAyudantes.data ?? [])
        }
      } catch (caught) {
        if (cancelled || isAbortError(caught)) {
          return
        }
        setFontaneros([])
        setAyudantes([])
        setListError(AVERIAS_ADMIN_FONTANEROS_LOAD_ERROR)
      } finally {
        if (!cancelled) {
          setListLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [loadFontaneros, reloadTrigger])

  const clearFeedback = useCallback(() => {
    setFeedback(null)
  }, [])

  const assignFontanero = useCallback(
    async (
      averiaId: number,
      fontaneroId: number,
      estadoActual?: string,
      ayudanteId?: number | null,
    ) => {
      setAssigning(true)
      setFeedback(null)

      try {
        if (estadoActual === 'RECIBIDA') {
          await patchAdminAveriaEstado(averiaId, 'EN_REVISION')
        }
        const updated = await patchAdminAveriaAsignacion(
          averiaId,
          fontaneroId,
          ayudanteId,
        )
        onUpdated(updated)
        const fontaneroForMessage = updated.fontanero ?? { id: fontaneroId }
        const ayudanteForMessage =
          updated.ayudante ?? (ayudanteId != null ? { id: ayudanteId } : null)
        setFeedback({
          variant: 'success',
          message: buildAveriaAsignacionSuccessMessage(
            fontaneroForMessage,
            ayudanteForMessage,
          ),
        })
        setSelectedFontaneroId(null)
        setSelectedAyudanteId(null)
      } catch (error) {
        setFeedback({
          variant: 'error',
          message: parseAveriaAdminMutationError(error),
        })
        throw error
      } finally {
        setAssigning(false)
      }
    },
    [onUpdated],
  )

  const selectFontaneroIdFromString = useCallback((value: string) => {
    clearFeedback()
    setSelectedFontaneroId(parseUsuarioId(value))
  }, [clearFeedback])

  const selectAyudanteIdFromString = useCallback((value: string) => {
    clearFeedback()
    setSelectedAyudanteId(parseUsuarioId(value))
  }, [clearFeedback])

  return {
    fontaneros: loadFontaneros ? fontaneros : [],
    ayudantes: loadFontaneros ? ayudantes : [],
    listLoading: loadFontaneros && listLoading,
    listError: loadFontaneros ? listError : null,
    refetchFontaneros,
    selectedFontaneroId,
    selectFontaneroIdFromString,
    selectedAyudanteId,
    selectAyudanteIdFromString,
    assigning,
    feedback,
    clearFeedback,
    assignFontanero,
  }
}
