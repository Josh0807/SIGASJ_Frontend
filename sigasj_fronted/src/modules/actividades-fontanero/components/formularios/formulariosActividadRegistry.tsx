import type { ComponentType } from 'react'
import type { TipoActividadFontaneroCatalogo } from '../../types/tipoActividadFontanero'
import FormularioActividadPlaceholder from './FormularioActividadPlaceholder'

export type FormularioActividadProps = {
  tipo: TipoActividadFontaneroCatalogo
}

const withPlaceholder = (): ComponentType<FormularioActividadProps> =>
  FormularioActividadPlaceholder

/** Un formulario por tipo de actividad (placeholders hasta backlogs específicos). */
export const FORMULARIOS_ACTIVIDAD: Record<
  TipoActividadFontaneroCatalogo['codigo'],
  ComponentType<FormularioActividadProps>
> = {
  CONTROL_FUGAS: withPlaceholder(),
  TOMA_PRESION: withPlaceholder(),
  VISITA_CAMPO: withPlaceholder(),
  CONTROL_CLOROS: withPlaceholder(),
  CONTROL_OPERATIVO: withPlaceholder(),
  INCAPACIDAD_VACACIONES: withPlaceholder(),
}
