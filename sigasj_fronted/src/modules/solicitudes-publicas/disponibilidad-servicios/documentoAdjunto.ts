/** Tipos de adjunto alineados a Backend `TipoDocumentoSolicitud`. */
export const TIPOS_DOCUMENTO_DISP = [
  'identificacion',
  'plano-catastrado',
  'poder',
  'plano-agrimensura',
] as const

export type TipoDocumentoDisp = (typeof TIPOS_DOCUMENTO_DISP)[number]

export type DocumentoAdjuntoEstado = 'subiendo' | 'cargado' | 'error'

export type DocumentoAdjunto = {
  localId: string
  tipoDocumento: TipoDocumentoDisp
  nombreOriginal: string
  tamanio: number
  tipoArchivo: string
  estado: DocumentoAdjuntoEstado
  id?: number
  tokenReclamo?: string
  errorMessage?: string
}

export const ETIQUETAS_TIPO_DOCUMENTO: Record<TipoDocumentoDisp, string> = {
  identificacion: 'Documento de identificación',
  'plano-catastrado': 'Plano catastrado',
  poder: 'Poder, autorización o aval autenticado',
  'plano-agrimensura': 'Plano de agrimensura',
}

export const DESCRIPCIONES_TIPO_DOCUMENTO: Record<TipoDocumentoDisp, string> = {
  identificacion:
    'Documento de identificación vigente del propietario o de su representante legal.',
  'plano-catastrado':
    'Plano catastrado del inmueble o derecho. Formatos: PDF, JPG o PNG.',
  poder:
    'Poder, autorización o aval autenticado cuando gestiona una persona distinta al propietario.',
  'plano-agrimensura':
    'Plano de agrimensura con normativa y sello del CFIA cuando no hay plano catastrado o el propósito lo exige.',
}

const PROPOSITOS_REQUIEREN_PLANO = new Set([
  'Fraccionamiento',
  'Urbanización',
  'Propiedades en derechos',
  'Estación de combustible',
])

/**
 * Documentos estrictamente obligatorios (todos deben estar cargados).
 * El plano “OR” se valida aparte en `requiereAlgunPlanoAdjunto`.
 */
export const tiposEstrictosDisponibilidad = (params: {
  proposito: string
  calidadTitular: string
  planoCatastrado: string
}): TipoDocumentoDisp[] => {
  const required: TipoDocumentoDisp[] = ['identificacion']
  const proposito = params.proposito.trim()
  const calidad = params.calidadTitular.trim()
  const tieneCatastrado = Boolean(params.planoCatastrado.trim())

  if (calidad === 'Representante legal' || proposito === 'Estación de combustible') {
    required.push('poder')
  }

  if (proposito === 'Estación de combustible') {
    required.push('plano-catastrado')
  }

  if (!tieneCatastrado && PROPOSITOS_REQUIEREN_PLANO.has(proposito)) {
    required.push('plano-agrimensura')
  }

  if (!tieneCatastrado && !required.includes('plano-agrimensura')) {
    required.push('plano-agrimensura')
  }

  return [...new Set(required)]
}

export const requiereAlgunPlanoAdjunto = (proposito: string) =>
  PROPOSITOS_REQUIEREN_PLANO.has(proposito.trim())

/** Marca visual “Obligatorio / Si aplica” en el uploader. */
export const tiposRequeridosDisponibilidad = (params: {
  proposito: string
  calidadTitular: string
  planoCatastrado: string
}): TipoDocumentoDisp[] => {
  const marked = new Set(tiposEstrictosDisponibilidad(params))
  if (requiereAlgunPlanoAdjunto(params.proposito)) {
    marked.add('plano-catastrado')
    marked.add('plano-agrimensura')
  }
  return [...marked]
}

export const referenciasCargadas = (docs: DocumentoAdjunto[]) =>
  docs
    .filter(
      (doc): doc is DocumentoAdjunto & { id: number; tokenReclamo: string } =>
        doc.estado === 'cargado' &&
        typeof doc.id === 'number' &&
        Boolean(doc.tokenReclamo),
    )
    .map((doc) => ({
      id: doc.id,
      tokenReclamo: doc.tokenReclamo,
      tipoDocumento: doc.tipoDocumento,
      nombreOriginal: doc.nombreOriginal,
    }))
