import ActividadSpecificField from './ActividadSpecificField'
import type { FormularioActividadProps } from './formulariosActividadRegistry'

const TomaPresionForm = ({ values, errors, onChange, disabled }: FormularioActividadProps) => (
  <fieldset className="actividad-registro-form__section actividad-formulario-especifico !gap-5 !rounded-3xl !border !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/60 !p-5 !shadow-sm md:!p-7" disabled={disabled}>
    <legend className="actividad-registro-form__legend">Toma de presión</legend>
    <ActividadSpecificField field="presionMedida" label="Presión medida" unit="PSI" type="number" value={values.presionMedida} error={errors.presionMedida} onChange={onChange} />
  </fieldset>
)
export default TomaPresionForm
