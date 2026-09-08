import type { ComponentType } from 'react'
import type { ActividadRegistroFormField, ActividadRegistroFormValues } from '../../types/actividadRegistroForm'
import type { TipoActividadFontaneroCodigo } from '../../types/tipoActividadFontanero'
import type { ActividadRegistroFormErrors } from '../../utils/validateActividadRegistroForm'
import ControlClorosForm from './ControlClorosForm'
import ControlFugasForm from './ControlFugasForm'
import ControlOperativoForm from './ControlOperativoForm'
import IncapacidadVacacionesForm from './IncapacidadVacacionesForm'
import TomaPresionForm from './TomaPresionForm'
import VisitaCampoForm from './VisitaCampoForm'

export type FormularioActividadProps = {
  values: ActividadRegistroFormValues
  errors: ActividadRegistroFormErrors
  onChange: (field: ActividadRegistroFormField, value: string) => void
  onFilesChange: (files: File[]) => void
  disabled: boolean
}

export const FORMULARIOS_ACTIVIDAD: Record<TipoActividadFontaneroCodigo, ComponentType<FormularioActividadProps>> = {
  CONTROL_FUGAS: ControlFugasForm,
  TOMA_PRESION: TomaPresionForm,
  VISITA_CAMPO: VisitaCampoForm,
  CONTROL_CLOROS: ControlClorosForm,
  CONTROL_OPERATIVO: ControlOperativoForm,
  INCAPACIDAD_VACACIONES: IncapacidadVacacionesForm,
}
