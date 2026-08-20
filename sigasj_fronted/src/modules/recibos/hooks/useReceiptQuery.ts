import { useEffect, useState } from 'react'
import { consultarRecibo, ReceiptNotFoundError, ReceiptServiceError } from '../services/receiptsApi'
import type { ReciboConsultaData } from '../types/receipt.types'

export type UseReceiptQueryResult = {
  data: ReciboConsultaData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useReceiptQuery(numeroPaja: number | null): UseReceiptQueryResult {
  const [data, setData] = useState<ReciboConsultaData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState<number>(0)

  const refetch = () => setReloadTrigger((prev) => prev + 1)

  useEffect(() => {
    if (numeroPaja === null || isNaN(numeroPaja) || numeroPaja <= 0) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    consultarRecibo(numeroPaja)
      .then((resData) => {
        if (isMounted) {
          setData(resData)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setData(null)
          setLoading(false)
          if (err instanceof ReceiptNotFoundError || err instanceof ReceiptServiceError) {
            setError(err.message)
          } else {
            setError('No fue posible consultar el recibo en este momento. Intente nuevamente más tarde.')
          }
        }
      })

    return () => {
      isMounted = false
    }
  }, [numeroPaja, reloadTrigger])

  return { data, loading, error, refetch }
}
