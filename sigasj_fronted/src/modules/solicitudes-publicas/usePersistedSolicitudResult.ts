import { useState } from 'react'

export type SolicitudRegistrationResult = {
  codigoSeguimiento: string
  estado: string
  fechaIngreso: string
}

const storageKey = (formKey: string) => `sigasj:solicitud-confirmada:${formKey}`

export const readPersistedSolicitudResult = (formKey: string): SolicitudRegistrationResult | null => {
  try {
    const stored = window.sessionStorage.getItem(storageKey(formKey))
    if (!stored) return null
    const parsed = JSON.parse(stored) as Partial<SolicitudRegistrationResult>
    if (typeof parsed.codigoSeguimiento !== 'string' || !parsed.codigoSeguimiento) return null
    return {
      codigoSeguimiento: parsed.codigoSeguimiento,
      estado: typeof parsed.estado === 'string' ? parsed.estado : 'PENDIENTE',
      fechaIngreso: typeof parsed.fechaIngreso === 'string' ? parsed.fechaIngreso : '',
    }
  } catch {
    return null
  }
}

export const persistSolicitudResult = (formKey: string, response: SolicitudRegistrationResult) => {
  const safeResult: SolicitudRegistrationResult = {
    codigoSeguimiento: response.codigoSeguimiento,
    estado: response.estado,
    fechaIngreso: response.fechaIngreso,
  }
  try {
    window.sessionStorage.setItem(storageKey(formKey), JSON.stringify(safeResult))
  } catch {
    // La confirmación continúa visible aunque el navegador bloquee el almacenamiento.
  }
  return safeResult
}

export const usePersistedSolicitudResult = (formKey: string) => {
  const [result, setResultState] = useState<SolicitudRegistrationResult | null>(() => readPersistedSolicitudResult(formKey))

  const setResult = (response: SolicitudRegistrationResult) => {
    const safeResult = persistSolicitudResult(formKey, response)
    setResultState(safeResult)
  }

  return [result, setResult] as const
}
