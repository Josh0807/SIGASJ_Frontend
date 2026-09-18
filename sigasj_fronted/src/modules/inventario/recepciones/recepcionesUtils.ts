import { getHttpErrorStatus } from '../reposiciones/reposicionesUtils'
import type { RecepcionItemPayload } from './types'

export const recepcionItemsValidos = (items: RecepcionItemPayload[]) =>
  items.length > 0 && items.every(
    (item) => Number.isInteger(item.cantidad) && item.cantidad > 0 && item.idMaterial > 0,
  )

export const recepcionErrorMessage = (error: unknown) => {
  const status = getHttpErrorStatus(error)
  if (status === 403) return 'No tiene permiso para registrar recepciones.'
  if (status === 401) return 'Su sesión expiró. Inicie sesión de nuevo.'
  if (status === 404) return 'La reposición ya no está disponible.'
  if (status === 409) return 'Esta reposición ya fue recibida.'
  if (status === 400) {
    return 'No fue posible registrar la recepción. Revise cantidades y el estado de la reposición.'
  }
  return 'No fue posible registrar la recepción de materiales.'
}

export { getHttpErrorStatus }
