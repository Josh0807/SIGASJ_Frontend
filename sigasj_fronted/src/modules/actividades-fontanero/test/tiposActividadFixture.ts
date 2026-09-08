import type { TipoActividadFontaneroCatalogo } from '../types/tipoActividadFontanero'

export const TIPOS_ACTIVIDAD_BACKEND: TipoActividadFontaneroCatalogo[] = [
  ['CONTROL_FUGAS', 'Control de Fugas'],
  ['TOMA_PRESION', 'Toma de presión'],
  ['VISITA_CAMPO', 'Visita de Campo'],
  ['CONTROL_CLOROS', 'Control de Cloros'],
  ['CONTROL_OPERATIVO', 'Control Operativo'],
  ['INCAPACIDAD_VACACIONES', 'Incapacidad o vacaciones'],
].map(([codigo, nombre], index) => ({
  id: 71 + index * 13,
  codigo: codigo as TipoActividadFontaneroCatalogo['codigo'],
  nombre,
  descripcion: `Descripción de ${nombre}`,
  orden: index + 1,
}))

export const respuestaTiposActividad = {
  data: TIPOS_ACTIVIDAD_BACKEND,
  total: TIPOS_ACTIVIDAD_BACKEND.length,
}
