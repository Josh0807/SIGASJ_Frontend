import { getAccessToken } from '../../auth/utils/authStorage'
import { fetchWithAuth } from '../../../services/http/httpClient'
import type { DocumentoMovimiento } from './documentosTypes'

const documentosPath = (movimientoId: number) => `/inventario/entradas/${movimientoId}/documentos`

export function adjuntarDocumentoEntrada(movimientoId: number, file: File) {
  const body = new FormData()
  body.append('archivo', file)
  return fetchWithAuth<DocumentoMovimiento>(documentosPath(movimientoId), { method: 'POST', body })
}

export const getDocumentosEntrada = (movimientoId: number) => fetchWithAuth<DocumentoMovimiento[]>(documentosPath(movimientoId))

export async function abrirDocumentoEntrada(rutaReferenciaArchivo: string) {
  if (!/^\/api\/v1\/inventario\/(?:entradas|movimientos)\/\d+\/documentos\/[A-Za-z0-9._-]+$/.test(rutaReferenciaArchivo) || rutaReferenciaArchivo.includes('..')) throw new Error('La referencia del documento no es válida.')
  const base = (import.meta.env?.VITE_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '')
  const origin = base.replace(/\/api\/v1$/, '')
  const url = `${origin}${rutaReferenciaArchivo}`
  const token = getAccessToken()
  const response = await fetch(url, { headers: token?.trim() ? { Authorization: `Bearer ${token.trim()}` } : {} })
  if (!response.ok) throw new Error(`HTTP ${response.status}: No fue posible abrir el documento.`)
  const blobUrl = URL.createObjectURL(await response.blob())
  window.open(blobUrl, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
}
