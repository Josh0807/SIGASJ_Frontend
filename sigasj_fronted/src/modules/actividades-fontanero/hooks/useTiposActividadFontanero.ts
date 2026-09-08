import { useEffect, useRef, useState } from 'react'
import {
  getTiposActividadFontanero,
  type TipoActividadFontanero,
} from '../services/actividadesFontaneroApi'
import { getHttpErrorStatus, sortTiposActividad } from '../utils/httpErrorStatus'

export type TiposActividadFontaneroState = {
  tipos: TipoActividadFontanero[]
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  isUnauthorized: boolean
  isForbidden: boolean
  refetch: () => void
}

export function useTiposActividadFontanero(): TiposActividadFontaneroState {
  const [tipos, setTipos] = useState<TipoActividadFontanero[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isEmpty, setIsEmpty] = useState(false)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [isForbidden, setIsForbidden] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const hasLoaded = useRef(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      // Un refresco por ID obsoleto debe conservar montado el formulario y sus archivos.
      setIsLoading(!hasLoaded.current)
      setIsError(false)
      setIsEmpty(false)
      setIsUnauthorized(false)
      setIsForbidden(false)

      try {
        const result = await getTiposActividadFontanero()
        if (cancelled) {
          return
        }
        const data = sortTiposActividad(
          Array.isArray(result.data) ? result.data : [],
        )
        setTipos(data)
        hasLoaded.current = true
        setIsEmpty(data.length === 0)
      } catch (error) {
        if (cancelled) {
          return
        }
        const status = getHttpErrorStatus(error)
        setTipos([])
        setIsEmpty(false)
        setIsUnauthorized(status === 401)
        setIsForbidden(status === 403)
        setIsError(status !== 401 && status !== 403)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  return {
    tipos,
    isLoading,
    isError,
    isEmpty,
    isUnauthorized,
    isForbidden,
    refetch: () => setReloadKey((value) => value + 1),
  }
}
