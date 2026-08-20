import { fetchWithAuth } from '../../../services/http/httpClient'
import type { ReciboConsultaData } from '../types/receipt.types'

export class ReceiptNotFoundError extends Error {
  constructor(message = 'No se encontró información asociada al número de paja ingresado.') {
    super(message)
    this.name = 'ReceiptNotFoundError'
  }
}

export class ReceiptServiceError extends Error {
  constructor(message = 'No fue posible consultar el recibo en este momento. Intente nuevamente más tarde.') {
    super(message)
    this.name = 'ReceiptServiceError'
  }
}

/**
 * Consulta la información del recibo a través del Backend público de SIGASJ.
 * Soporta cualquier estructura devuelta por NestJS (Objetos envueltos, Arrays directos u Objetos de recibos).
 */
export async function consultarRecibo(numeroPaja: number): Promise<ReciboConsultaData> {
  let raw: unknown = null
  let lastError: Error | null = null

  const candidates = [
    `/v1/public/recibos/${numeroPaja}`,
    `/public/recibos/${numeroPaja}`,
    `/recibos/${numeroPaja}`,
  ]

  for (const endpoint of candidates) {
    try {
      raw = await fetchWithAuth<unknown>(endpoint)
      if (raw !== null && raw !== undefined) break
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  if (raw === null || raw === undefined) {
    const message = lastError ? lastError.message : ''
    if (message.includes('404')) {
      throw new ReceiptNotFoundError()
    }
    throw new ReceiptServiceError(
      message
        ? `No fue posible consultar el recibo en este momento. (${message})`
        : undefined,
    )
  }

  let payload: unknown = raw

  // 1. Desenvolver si viene en { success: true, data: ... } o { data: ... }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>
    if ('success' in obj && obj.success === false) {
      throw new ReceiptNotFoundError(
        (obj.error as string) || 'No se encontró información asociada al número de paja ingresado.',
      )
    }
    if ('data' in obj && obj.data) {
      payload = obj.data
    }
  }

  // CASO 1: El payload es un ARRAY directo de recibos [ { abonado: '...', total: 12500 }, ... ]
  if (Array.isArray(payload)) {
    const items = payload as Record<string, unknown>[]
    if (items.length === 0) {
      return {
        numeroPaja,
        abonado: '',
        tieneRecibosPendientes: false,
        recibos: [],
      }
    }

    const first = items[0] || {}
    const abonadoName =
      first.abonado ??
      first.nombreAbonado ??
      first.nombre ??
      first.cliente ??
      first.propietario ??
      first.nombreCompleto ??
      ''

    return {
      numeroPaja: Number(first.numeroPaja ?? first.paja ?? numeroPaja),
      abonado: String(abonadoName).trim(),
      tieneRecibosPendientes: true,
      recibos: items,
    }
  }

  // CASO 2: El payload es un OBJETO { abonado: '...', recibos: [ ... ] }
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>

    const abonadoName =
      obj.abonado ??
      obj.nombreAbonado ??
      obj.nombre ??
      obj.cliente ??
      obj.propietario ??
      obj.nombreCompleto ??
      ''

    const rawRecibos = Array.isArray(obj.recibos)
      ? obj.recibos
      : Array.isArray(obj.items)
      ? obj.items
      : Array.isArray(obj.recibosPendientes)
      ? obj.recibosPendientes
      : []

    let finalAbonado = String(abonadoName).trim()
    if (!finalAbonado && rawRecibos.length > 0 && typeof rawRecibos[0] === 'object' && rawRecibos[0]) {
      const firstItem = rawRecibos[0] as Record<string, unknown>
      finalAbonado = String(
        firstItem.abonado ??
          firstItem.nombreAbonado ??
          firstItem.nombre ??
          firstItem.cliente ??
          ''
      ).trim()
    }

    const tienePendientes =
      typeof obj.tieneRecibosPendientes === 'boolean'
        ? (obj.tieneRecibosPendientes as boolean)
        : rawRecibos.length > 0

    return {
      numeroPaja: Number(obj.numeroPaja ?? obj.paja ?? numeroPaja),
      abonado: finalAbonado,
      tieneRecibosPendientes: tienePendientes,
      mensaje: (obj.mensaje as string) ?? undefined,
      recibos: rawRecibos as ReciboConsultaData['recibos'],
    }
  }

  throw new ReceiptNotFoundError()
}
