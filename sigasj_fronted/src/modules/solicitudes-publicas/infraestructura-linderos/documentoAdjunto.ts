/** Tipos de adjunto alineados a Backend `TipoDocumentoSolicitud`. */
export const TIPOS_DOCUMENTO_INFRA = [
  'identificacion',
  'plano-catastrado',
  'poder',
  'plano-agrimensura',
] as const

export type TipoDocumentoInfra = (typeof TIPOS_DOCUMENTO_INFRA)[number]

export type DocumentoAdjuntoEstado =
  | 'subiendo'
  | 'cargado'
  | 'error'

export type DocumentoAdjunto = {
  localId: string
  tipoDocumento: TipoDocumentoInfra
  nombreOriginal: string
  tamanio: number
  tipoArchivo: string
  estado: DocumentoAdjuntoEstado
  /** Solo cuando estado === 'cargado' */
  id?: number
  tokenReclamo?: string
  errorMessage?: string
}

export const ETIQUETAS_TIPO_DOCUMENTO: Record<TipoDocumentoInfra, string> = {
  identificacion: 'Documento de identificación',
  'plano-catastrado': 'Plano catastrado',
  poder: 'Poder, autorización o aval autenticado',
  'plano-agrimensura': 'Plano de agrimensura',
}

/** Tipos siempre requeridos. */
export const DOCUMENTOS_INFRA_OBLIGATORIOS: readonly TipoDocumentoInfra[] = [
  'identificacion',
  'plano-catastrado',
]

/** Extra cuando propósito = Reunión de fincas. */
export const DOCUMENTOS_INFRA_REUNION: readonly TipoDocumentoInfra[] = [
  'plano-agrimensura',
]

export const tiposRequeridosParaProposito = (
  proposito: string,
): TipoDocumentoInfra[] => {
  const required: TipoDocumentoInfra[] = [...DOCUMENTOS_INFRA_OBLIGATORIOS]
  if (proposito === 'Reunión de fincas') {
    required.push(...DOCUMENTOS_INFRA_REUNION)
  }
  return required
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
