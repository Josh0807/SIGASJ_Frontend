type FieldConfig = { key: string; label: string }

const commonApplicant: FieldConfig[] = [
  { key: 'nombreSolicitante', label: 'Nombre del solicitante' },
  { key: 'identificacionSolicitante', label: 'Identificación del solicitante' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'correoElectronico', label: 'Correo electrónico' },
]

const formFields: Record<string, FieldConfig[]> = {
  'arreglo-pago': [
    { key: 'nombre', label: 'Nombre completo' }, { key: 'cedula', label: 'Identificación' },
    { key: 'vecinoDe', label: 'Lugar de residencia' }, { key: 'telefono', label: 'Teléfono' },
    { key: 'numeroCuentaServicio', label: 'Cuenta, contrato o NIS' }, { key: 'montoPrimaInicial', label: 'Prima inicial' },
    { key: 'plazoSeleccionado', label: 'Plazo seleccionado' }, { key: 'firma', label: 'Firma del solicitante' },
  ],
  'cambio-titular': [
    ...commonApplicant, { key: 'nombrePropietarioRegistral', label: 'Propietario registral' },
    { key: 'identificacionPropietario', label: 'Identificación del propietario' }, { key: 'nis', label: 'NIS' },
    { key: 'folioReal', label: 'Folio real' }, { key: 'planoCatastrado', label: 'Plano catastrado' },
    { key: 'planoAgrimensura', label: 'Plano de agrimensura' }, { key: 'naturalezaInmueble', label: 'Naturaleza del inmueble' },
    { key: 'calidadTitular', label: 'Calidad del titular' }, { key: 'facturaANombreDe', label: 'Factura a nombre de' },
    { key: 'firma', label: 'Firma del nuevo titular' },
  ],
  'infraestructura-linderos': [
    ...commonApplicant, { key: 'tipoPersona', label: 'Tipo de persona' }, { key: 'proposito', label: 'Propósito' },
    { key: 'nis', label: 'NIS' }, { key: 'folioReal', label: 'Folio real' }, { key: 'planoCatastrado', label: 'Plano catastrado' },
    { key: 'firma', label: 'Firma del solicitante o representante' },
  ],
  afiliacion: [
    { key: 'fechaSolicitud', label: 'Fecha de solicitud' }, { key: 'nombre', label: 'Nombre del solicitante' },
    { key: 'identificacion', label: 'Identificación' }, { key: 'vecinoDe', label: 'Lugar de residencia' },
    { key: 'estadoCivil', label: 'Estado civil' }, { key: 'telefono', label: 'Teléfono' },
    { key: 'correoElectronico', label: 'Correo electrónico' }, { key: 'numeroAbonado', label: 'Número de abonado' },
    { key: 'numeroPlano', label: 'Número de plano' }, { key: 'folioReal', label: 'Folio real' },
    { key: 'recomendacion1Nombre', label: 'Primer recomendante' }, { key: 'recomendacion1Identificacion', label: 'Identificación del primer recomendante' },
    { key: 'recomendacion1NumeroAbonado', label: 'Abonado del primer recomendante' }, { key: 'recomendacion1Firma', label: 'Firma del primer recomendante' },
    { key: 'recomendacion2Nombre', label: 'Segundo recomendante' }, { key: 'recomendacion2Identificacion', label: 'Identificación del segundo recomendante' },
    { key: 'recomendacion2NumeroAbonado', label: 'Abonado del segundo recomendante' }, { key: 'recomendacion2Firma', label: 'Firma del segundo recomendante' },
    { key: 'firmaSolicitante', label: 'Firma del solicitante' },
  ],
  'disponibilidad-servicios': [
    ...commonApplicant, { key: 'tipoPersona', label: 'Tipo de persona' }, { key: 'proposito', label: 'Propósito del proyecto' },
    { key: 'descripcionProyecto', label: 'Descripción del proyecto' }, { key: 'nis', label: 'NIS' },
    { key: 'folioReal', label: 'Folio real' }, { key: 'planoCatastrado', label: 'Plano catastrado' },
    { key: 'calidadTitular', label: 'Calidad del titular' }, { key: 'firma', label: 'Firma del solicitante o propietario' },
  ],
  'constancia-servicio': [
    ...commonApplicant, { key: 'tipoServicio', label: 'Tipo de servicio' }, { key: 'nis', label: 'NIS' },
    { key: 'propietarioInmueble', label: 'Propietario del inmueble' }, { key: 'naturalezaInmueble', label: 'Naturaleza del inmueble' },
    { key: 'calidadTitular', label: 'Calidad del titular' }, { key: 'folioReal', label: 'Folio real' },
    { key: 'provincia', label: 'Provincia' }, { key: 'canton', label: 'Cantón' }, { key: 'distrito', label: 'Distrito' },
    { key: 'direccionExacta', label: 'Dirección exacta' }, { key: 'motivo', label: 'Motivo' },
    { key: 'tramitePorRealizar', label: 'Trámite por realizar' }, { key: 'firma', label: 'Firma del solicitante' },
  ],
  'servicio-existente': [],
}

formFields['servicio-existente'] = formFields['constancia-servicio']

export type PresentedFormField = { key: string; label: string; value: unknown }

export const presentSolicitudForm = (slug: string | undefined, detail: Record<string, unknown> | null): PresentedFormField[] => {
  if (!detail) return []
  const configured = formFields[slug ?? ''] ?? []
  const used = new Set(configured.map(({ key }) => key))
  const preferred = configured.filter(({ key }) => key in detail).map(({ key, label }) => ({ key, label, value: detail[key] }))
  const extras = Object.entries(detail)
    .filter(([key]) => !used.has(key) && !['id', 'solicitudId', 'createdAt', 'updatedAt'].includes(key))
    .map(([key, value]) => ({ key, label: key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replaceAll('_', ' ').replace(/^./, (letter) => letter.toUpperCase()), value }))
  return [...preferred, ...extras]
}
