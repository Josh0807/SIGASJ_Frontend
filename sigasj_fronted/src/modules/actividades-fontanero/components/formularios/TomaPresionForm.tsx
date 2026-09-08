import ActividadSpecificField from './ActividadSpecificField'
import type { FormularioActividadProps } from './formulariosActividadRegistry'

const TomaPresionForm = ({ values, errors, onChange, disabled }: FormularioActividadProps) => (
  <fieldset className="actividad-registro-form__section actividad-formulario-especifico" disabled={disabled}>
    <legend className="actividad-registro-form__legend">Toma de presión</legend>
    <ActividadSpecificField field="presionMedida" label="Presión medida" unit="PSI" type="number" value={values.presionMedida} error={errors.presionMedida} onChange={onChange} />
  </fieldset>
)
export default TomaPresionForm
