import { useCallback, useEffect, useState } from 'react'
import {
  getPublicProyectoDetalle,
  type PublicProyectoDetalle,
} from '../services/proyectosApi'

export function usePublicProyectoDetalle(id: string | undefined) {
  const [status, setStatus] = useState<
    'loading' | 'success' | 'not-found' | 'error'
  >(() => (!id ? 'not-found' : 'loading'))
  const [proyecto, setProyecto] = useState<PublicProyectoDetalle | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchDetalle = useCallback(async () => {
    if (!id) {
      setStatus('not-found')
      setProyecto(null)
      return
    }

    setStatus('loading')
    setError(null)
    try {
      const data = await getPublicProyectoDetalle(id)
      if (!data || data.activo === false) {
        setStatus('not-found')
        setProyecto(null)
      } else {
        setProyecto(data)
        setStatus('success')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (
        msg.includes('404') ||
        msg.includes('403') ||
        msg.toLowerCase().includes('no existe') ||
        msg.toLowerCase().includes('no publicado') ||
        msg.toLowerCase().includes('inactivo')
      ) {
        setStatus('not-found')
      } else {
        setError('No fue posible cargar la información del proyecto.')
        setStatus('error')
      }
    }
  }, [id])

  useEffect(() => {
    if (!id) {
      return
    }

    let isMounted = true

    getPublicProyectoDetalle(id)
      .then((data) => {
        if (!isMounted) return
        if (!data || data.activo === false) {
          setStatus('not-found')
          setProyecto(null)
        } else {
          setProyecto(data)
          setStatus('success')
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        const msg = err instanceof Error ? err.message : String(err)
        if (
          msg.includes('404') ||
          msg.includes('403') ||
          msg.toLowerCase().includes('no existe') ||
          msg.toLowerCase().includes('no publicado') ||
          msg.toLowerCase().includes('inactivo')
        ) {
          setStatus('not-found')
        } else {
          setError('No fue posible cargar la información del proyecto.')
          setStatus('error')
        }
      })

    return () => {
      isMounted = false
    }
  }, [id])

  return {
    status: !id ? 'not-found' : status,
    proyecto,
    error,
    retry: fetchDetalle,
  }
}
