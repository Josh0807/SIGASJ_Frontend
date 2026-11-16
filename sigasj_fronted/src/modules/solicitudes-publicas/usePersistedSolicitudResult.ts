import { useCallback, useState } from 'react'

export type SolicitudRegistrationResult = {
  codigoSeguimiento: string
  estado: string
  fechaIngreso: string
}

const storageKey = (formKey: string) => `sigasj:solicitud-confirmada:${formKey}`
const historyStateKey = 'sigasjSolicitudConfirmation'

type StoredSolicitudResult = SolicitudRegistrationResult & { visitId: string }
type ConfirmationHistoryState = { formKey: string; visitId: string }

const currentConfirmationEntry = (): ConfirmationHistoryState | null => {
  const state = window.history.state as Record<string, unknown> | null
  const marker = state?.[historyStateKey]
  if (!marker || typeof marker !== 'object') return null
  const value = marker as Partial<ConfirmationHistoryState>
  return typeof value.formKey === 'string' && typeof value.visitId === 'string'
    ? { formKey: value.formKey, visitId: value.visitId }
    : null
}

export const clearPersistedSolicitudResult = (formKey: string) => {
  try {
    window.sessionStorage.removeItem(storageKey(formKey))
  } catch {
    // El formulario puede reiniciarse aunque el almacenamiento esté bloqueado.
  }
  const state = (window.history.state ?? {}) as Record<string, unknown>
  const marker = currentConfirmationEntry()
  if (marker?.formKey === formKey) {
    const { [historyStateKey]: _removed, ...nextState } = state
    void _removed
    window.history.replaceState(nextState, '')
  }
}

export const readPersistedSolicitudResult = (formKey: string): SolicitudRegistrationResult | null => {
  try {
    const stored = window.sessionStorage.getItem(storageKey(formKey))
    if (!stored) return null
    const parsed = JSON.parse(stored) as Partial<StoredSolicitudResult>
    if (typeof parsed.codigoSeguimiento !== 'string' || !parsed.codigoSeguimiento) return null
    const entry = currentConfirmationEntry()
    if (
      typeof parsed.visitId !== 'string' ||
      entry?.formKey !== formKey ||
      entry.visitId !== parsed.visitId
    ) {
      clearPersistedSolicitudResult(formKey)
      return null
    }
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
  const visitId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  try {
    const state = (window.history.state ?? {}) as Record<string, unknown>
    window.history.replaceState({
      ...state,
      [historyStateKey]: { formKey, visitId },
    }, '')
    window.sessionStorage.setItem(storageKey(formKey), JSON.stringify({ ...safeResult, visitId }))
  } catch {
    // La confirmación continúa visible aunque el navegador bloquee el almacenamiento.
  }
  return safeResult
}

export const usePersistedSolicitudResult = (formKey: string) => {
  const [result, setResultState] = useState<SolicitudRegistrationResult | null>(() => readPersistedSolicitudResult(formKey))

  const setResult = useCallback((response: SolicitudRegistrationResult) => {
    const safeResult = persistSolicitudResult(formKey, response)
    setResultState(safeResult)
  }, [formKey])

  const resetResult = useCallback(() => {
    clearPersistedSolicitudResult(formKey)
    setResultState(null)
  }, [formKey])

  return [result, setResult, resetResult] as const
}
