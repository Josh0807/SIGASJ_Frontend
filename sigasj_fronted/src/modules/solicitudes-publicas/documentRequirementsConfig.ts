export type SolicitudPublicaSlug =
  | 'arreglo-pago'
  | 'cambio-titular'
  | 'infraestructura-linderos'
  | 'afiliacion'
  | 'disponibilidad-servicios'
  | 'servicio-existente'

export type DocumentRequirementKind = 'required' | 'conditional' | 'special'

export type DocumentRequirement = {
  name: string
  description: string
  kind: DocumentRequirementKind
}

export type DocumentRequirementsConfig = {
  title: string
  description: string
  documents: DocumentRequirement[]
  note?: { title: string; description: string }
  secondaryNote?: string
  allowAttachments: boolean
}

export const DOCUMENT_REQUIREMENTS: Record<SolicitudPublicaSlug, DocumentRequirementsConfig> = {
  'arreglo-pago': {
    title: 'Documentación requerida',
    description: 'Para tramitar el arreglo de pago, adjunta una copia legible del documento de identidad del propietario.',
    documents: [{ name: 'Copia de la cédula del propietario', description: 'Adjunta una copia o fotografía legible de la cédula de identidad del propietario del servicio.', kind: 'required' }],
    allowAttachments: true,
  },
  'cambio-titular': {
    title: 'Documentación requerida',
    description: 'Adjunta la documentación necesaria para acreditar la identidad y, cuando corresponda, la representación o posesión del inmueble.',
    documents: [
      { name: 'Documento de identificación vigente', description: 'Cédula de identidad, cédula de residencia o pasaporte vigente del propietario, poseedor o representante legal, según corresponda.', kind: 'required' },
      { name: 'Poder o autorización', description: 'Si realiza la solicitud como representante o persona autorizada, adjunte el documento que acredite la representación correspondiente.', kind: 'conditional' },
      { name: 'Documento que acredite la posesión de un inmueble sin inscribir', description: 'Si dispone de una resolución judicial o escritura notarial que demuestre el derecho de posesión, adjúntela.', kind: 'conditional' },
    ],
    note: { title: 'Condición importante', description: 'Las facturaciones del servicio relacionadas con el inmueble deben encontrarse al día con la ASADA.' },
    secondaryNote: 'En casos de terrenos sin inscribir, la ASADA puede requerir una declaración jurada con dos testigos según el procedimiento correspondiente.',
    allowAttachments: true,
  },
  'infraestructura-linderos': {
    title: 'Documentación requerida',
    description: 'Adjunta los documentos necesarios para identificar al solicitante y el inmueble asociado a la constancia.',
    documents: [
      { name: 'Documento de identificación', description: 'Adjunta una copia legible de la cédula de identidad o documento válido de identificación.', kind: 'required' },
      { name: 'Plano catastrado', description: 'Adjunta el plano catastrado de la finca o fincas asociadas al trámite.', kind: 'required' },
      { name: 'Poder, autorización o aval autenticado', description: 'Debe adjuntarse cuando la solicitud sea realizada por una persona diferente al propietario registral.', kind: 'conditional' },
      { name: 'Plano de agrimensura', description: "Debe adjuntarse cuando el propósito seleccionado sea 'Reunión de fincas' y contar con el sello del CFIA cuando aplique.", kind: 'conditional' },
    ],
    allowAttachments: true,
  },
  afiliacion: {
    title: 'Requisitos de la solicitud',
    description: 'Este trámite no requiere adjuntar documentación adicional según el formulario oficial. Complete todos los datos solicitados, las dos recomendaciones de afiliados activos y las firmas correspondientes.',
    documents: [],
    allowAttachments: false,
  },
  'disponibilidad-servicios': {
    title: 'Documentación requerida',
    description: 'Los documentos necesarios dependen de la condición del inmueble y del tipo de proyecto. Revise cuidadosamente los requisitos que correspondan a su caso.',
    documents: [
      { name: 'Documento de identificación', description: 'Documento de identificación vigente del propietario del inmueble o de su representante legal.', kind: 'required' },
      { name: 'Poder, autorización o aval autenticado', description: 'Debe adjuntarse cuando la solicitud sea gestionada por una persona diferente al propietario.', kind: 'conditional' },
      { name: 'Plano de agrimensura', description: 'Si la propiedad no cuenta con plano catastrado, debe aportar un plano de agrimensura que cumpla la normativa y el sello del CFIA.', kind: 'conditional' },
      { name: 'Plano catastrado o plano de agrimensura', description: 'Para determinados proyectos de fraccionamiento, urbanización o propiedades registradas en derechos, aporte el plano que identifique el inmueble o derecho.', kind: 'conditional' },
      { name: 'Autorización del ente correspondiente', description: 'Para inmuebles administrados por el Estado o sujetos a un régimen jurídico especial, adjunte la autorización expresa de la institución correspondiente.', kind: 'conditional' },
      { name: 'Documentación de terrenos sin inscribir', description: 'La ASADA podrá requerir la declaración jurada y documentación correspondiente al derecho de posesión.', kind: 'special' },
      { name: 'Requisitos para territorios indígenas', description: 'Cuando corresponda, podrán requerirse declaraciones sobre la posesión y condición dentro de la comunidad.', kind: 'special' },
      { name: 'Documentación especial para estaciones de combustible', description: 'Plano catastrado; nota firmada y poder; lugar y medios de notificación; diseño del sitio con coordenadas; tipo y cantidad de combustible; y criterio de SENARA cuando corresponda.', kind: 'special' },
    ],
    allowAttachments: true,
  },
  'servicio-existente': {
    title: 'Documentación requerida',
    description: 'Adjunta la documentación necesaria para identificar al solicitante y acreditar la representación cuando corresponda.',
    documents: [
      { name: 'Documento de identificación', description: 'Adjunta una copia legible de la cédula de identidad o de otro documento válido de identificación.', kind: 'required' },
      { name: 'Poder especial o autorización', description: 'Debe adjuntarse cuando la solicitud sea realizada por una persona diferente al propietario registral.', kind: 'conditional' },
    ],
    allowAttachments: true,
  },
}
