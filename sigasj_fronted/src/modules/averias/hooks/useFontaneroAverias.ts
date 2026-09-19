import { useCallback, useEffect, useState } from 'react'
import { clearAccessToken } from '../../auth/utils/authStorage'
import {
  isAbortError,
  parseAveriaAdminError,
} from '../admin/averiaAdminError'
import {
  AVERIAS_FONTANERO_LIST_ERROR,
  type AveriaFontaneroListItem,
} from '../fontanero/types'
import { getFontaneroAverias } from '../services/averiasFontaneroApi'

export type UseFontaneroAveriasResult = {
  items: AveriaFontaneroListItem[]
  loading: boolean
  error: string | null
  unauthorized: boolean
  forbidden: boolean
  refetch: () => void
}

export function useFontaneroAverias(
  options: { enabled?: boolean } = {},
): UseFontaneroAveriasResult {
  const enabled = options.enabled ?? true
  const [items, setItems] = useState<AveriaFontaneroListItem[]>([])
  const [fetchLoading, setFetchLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const [unauthorized, setUnauthorized] = useState(false)
  const [forbidden, setForbidden] = useState(false)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const refetch = useCallback(() => {
    setReloadTrigger((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const controller = new AbortController()
    let cancelled = false

    const load = async () => {
      setFetchLoading(true)
      setError(null)
      setUnauthorized(false)
      setForbidden(false)

      try {
        const result = await getFontaneroAverias(controller.signal)
        if (!cancelled) {
          setItems(result.data)
        }
      } catch (caught) {
        if (cancelled || isAbortError(caught)) {
          return
        }

        const parsed = parseAveriaAdminError(caught)
        setItems([])

        if (parsed.kind === 'unauthorized') {
          clearAccessToken()
          setUnauthorized(true)
        } else if (parsed.kind === 'forbidden') {
          setForbidden(true)
        } else {
          setError(AVERIAS_FONTANERO_LIST_ERROR)
        }
      } finally {
        if (!cancelled) {
          setFetchLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [enabled, reloadTrigger])

  return {
    items: enabled ? items : [],
    loading: enabled && fetchLoading,
    error: enabled ? error : null,
    unauthorized: enabled && unauthorized,
    forbidden: enabled && forbidden,
    refetch,
  }
}
