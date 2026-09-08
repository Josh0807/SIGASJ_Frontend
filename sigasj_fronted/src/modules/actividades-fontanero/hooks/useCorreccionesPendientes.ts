import { useEffect, useState } from 'react'
import {
  getCorreccionesPendientes,
  type ActividadFontaneroListado,
} from '../services/actividadesFontaneroApi'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { getHttpErrorStatus } from '../utils/httpErrorStatus'

export type CorreccionesPendientesState = {
  actividades: ActividadFontaneroRegistrada[]
  total: number
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  isUnauthorized: boolean
  isForbidden: boolean
  refetch: () => void
}

export function useCorreccionesPendientes(): CorreccionesPendientesState {
  const [actividades, setActividades] = useState<ActividadFontaneroRegistrada[]>(
    [],
  )
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const [isForbidden, setIsForbidden] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    const applyResult = (result: ActividadFontaneroListado) => {
      setActividades(result.data)
      setTotal(result.total)
    }

    const load = async () => {
      setIsLoading(true)
      setIsError(false)
      setIsUnauthorized(false)
      setIsForbidden(false)

      try {
        const result = await getCorreccionesPendientes()
        if (!cancelled) {
          applyResult(result)
        }
      } catch (error) {
        if (cancelled) {
          return
        }
        const status = getHttpErrorStatus(error)
        setActividades([])
        setTotal(0)
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

  useEffect(() => {
    const handleUpdated = () => setReloadKey((value) => value + 1)
    window.addEventListener('actividades-fontanero:updated', handleUpdated)
    return () => {
      window.removeEventListener('actividades-fontanero:updated', handleUpdated)
    }
  }, [])

  return {
    actividades,
    total,
    isLoading,
    isError,
    isEmpty: !isLoading && !isError && actividades.length === 0,
    isUnauthorized,
    isForbidden,
    refetch: () => setReloadKey((value) => value + 1),
  }
}
