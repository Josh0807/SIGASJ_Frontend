import { getApiBaseUrl } from '../../../shared/api/config'
import type {
  TransparencyFileType,
  TransparencyPublication,
} from '../types'

export type PublicTransparenciaDto = Record<string, unknown>

export type PublicTransparenciaResponse =
  | PublicTransparenciaDto[]
  | {
      data?: PublicTransparenciaDto[]
      total?: number
    }

const asTrimmedString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed || undefined
}

const asId = (value: unknown): string | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return asTrimmedString(value)
}

const asFileType = (value: unknown): TransparencyFileType | undefined => {
  const normalized = asTrimmedString(value)?.toLowerCase()

  if (
    normalized === 'pdf' ||
    normalized === 'jpg' ||
    normalized === 'jpeg' ||
    normalized === 'png'
  ) {
    return normalized
  }

  return undefined
}

export function extractPublicTransparenciaPayload(
  payload: PublicTransparenciaResponse,
): PublicTransparenciaDto[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload.data)) {
    return payload.data
  }

  return []
}

export function resolveTransparenciaFileUrl(archivoUrl: string): string {
  if (/^https?:\/\//i.test(archivoUrl) || archivoUrl.startsWith('data:')) {
    return archivoUrl
  }

  try {
    const base = getApiBaseUrl()
    return archivoUrl.startsWith('/')
      ? `${base}${archivoUrl}`
      : `${base}/${archivoUrl}`
  } catch {
    return archivoUrl
  }
}

export function mapPublicTransparenciaPublication(
  item: PublicTransparenciaDto,
): TransparencyPublication | null {
  const id = asId(item.id ?? item.idPublicacionTransparencia)
  const name = asTrimmedString(item.nombre ?? item.name)
  const description = asTrimmedString(
    item.descripcion ?? item.descripcionBreve ?? item.description,
  )
  const archivoUrl = asTrimmedString(
    item.archivoUrl ?? item.fileUrl ?? item.archivo,
  )
  const fileType = asFileType(item.tipo ?? item.tipoArchivo ?? item.type)

  if (!id || !name || !description || !archivoUrl || !fileType) {
    return null
  }

  return {
    id,
    name,
    description,
    fileUrl: resolveTransparenciaFileUrl(archivoUrl),
    fileType,
  }
}
