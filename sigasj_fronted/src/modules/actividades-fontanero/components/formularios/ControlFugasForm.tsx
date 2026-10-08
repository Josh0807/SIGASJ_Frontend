import ActividadSpecificField from './ActividadSpecificField'
import type { FormularioActividadProps } from './formulariosActividadRegistry'

const ControlFugasForm = ({ values, errors, onChange, disabled }: FormularioActividadProps) => (
  <fieldset className="actividad-registro-form__section actividad-formulario-especifico !gap-5 !rounded-3xl !border !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/60 !p-5 !shadow-sm md:!p-7" disabled={disabled}>
    <legend className="actividad-registro-form__legend">Formulario: Control de Fugas</legend>
    <ActividadSpecificField field="ubicacionFuga" label="Ubicación de la fuga" value={values.ubicacionFuga} error={errors.ubicacionFuga} onChange={onChange} />
  </fieldset>
)
export default ControlFugasForm
