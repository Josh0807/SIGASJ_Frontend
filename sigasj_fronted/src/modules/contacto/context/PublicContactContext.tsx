import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_CONTACTO, type ContactoPublico } from '../types/contacto.types'
import { fetchPublicContacto } from '../services/contactService'

type PublicContactContextValue = {
  contacto: ContactoPublico
  loading: boolean
  error: string | null
  fromApi: boolean
}

const PublicContactContext = createContext<PublicContactContextValue | null>(null)

export function PublicContactProvider({ children }: { children: ReactNode }) {
  const [contacto, setContacto] = useState<ContactoPublico>(DEFAULT_CONTACTO)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fromApi, setFromApi] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchPublicContacto()

        if (!cancelled) {
          setContacto(data)
          setFromApi(true)
        }
      } catch {
        if (!cancelled) {
          setContacto(DEFAULT_CONTACTO)
          setFromApi(false)
          setError(
            'No fue posible cargar el contacto actualizado. Se muestran valores por defecto.',
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({ contacto, loading, error, fromApi }),
    [contacto, loading, error, fromApi],
  )

  return (
    <PublicContactContext.Provider value={value}>
      {children}
    </PublicContactContext.Provider>
  )
}

export function usePublicContact(): PublicContactContextValue {
  const context = useContext(PublicContactContext)

  if (!context) {
    throw new Error('usePublicContact debe usarse dentro de PublicContactProvider')
  }

  return context
}
