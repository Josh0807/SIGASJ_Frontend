import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_CONTACTO_UBICACION,
  getPublicContacto,
  type ContactoUbicacion,
} from '../../contacto/services/contactoApi'

export function usePublicContacto() {
  const [contacto, setContacto] = useState<ContactoUbicacion>(
    DEFAULT_CONTACTO_UBICACION,
  )

  const load = useCallback(async () => {
    try {
      setContacto(await getPublicContacto())
    } catch {
      setContacto(DEFAULT_CONTACTO_UBICACION)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { contacto, retry: load }
}
