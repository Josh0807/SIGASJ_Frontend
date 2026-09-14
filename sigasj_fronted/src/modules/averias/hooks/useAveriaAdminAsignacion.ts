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
  getAdminAveriaFontaneros,
  patchAdminAveriaAsignacion,
} from '../services/averiasAdminApi'

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
  const [listLoading, setListLoading] = useState(loadFontaneros)
  const [listError, setListError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const [selectedFontaneroId, setSelectedFontaneroId] = useState<number | null>(
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
        const result = await getAdminAveriaFontaneros(controller.signal)
        if (!cancelled) {
          setFontaneros(result.data ?? [])
        }
      } catch (caught) {
        if (cancelled || isAbortError(caught)) {
          return
        }
        setFontaneros([])
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
    async (averiaId: number, fontaneroId: number) => {
      setAssigning(true)
      setFeedback(null)

      try {
        const updated = await patchAdminAveriaAsignacion(averiaId, fontaneroId)
        onUpdated(updated)
        const fontaneroForMessage = updated.fontanero ?? { id: fontaneroId }
        setFeedback({
          variant: 'success',
          message: buildAveriaAsignacionSuccessMessage(fontaneroForMessage),
        })
        setSelectedFontaneroId(null)
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
    const trimmed = value.trim()
    if (trimmed === '') {
      setSelectedFontaneroId(null)
      return
    }
    const parsed = Number.parseInt(trimmed, 10)
    setSelectedFontaneroId(Number.isFinite(parsed) && parsed > 0 ? parsed : null)
  }, [clearFeedback])

  return {
    fontaneros: loadFontaneros ? fontaneros : [],
    listLoading: loadFontaneros && listLoading,
    listError: loadFontaneros ? listError : null,
    refetchFontaneros,
    selectedFontaneroId,
    selectFontaneroIdFromString,
    assigning,
    feedback,
    clearFeedback,
    assignFontanero,
  }
}
