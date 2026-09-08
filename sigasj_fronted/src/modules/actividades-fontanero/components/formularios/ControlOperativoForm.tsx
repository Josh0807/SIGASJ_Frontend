import ActividadSpecificField from './ActividadSpecificField'
import type { FormularioActividadProps } from './formulariosActividadRegistry'

const ControlOperativoForm = ({ values, errors, onChange, disabled }: FormularioActividadProps) => (
  <fieldset className="actividad-registro-form__section actividad-formulario-especifico" disabled={disabled}>
    <legend className="actividad-registro-form__legend">Control operativo</legend>
    <ActividadSpecificField field="caudal" label="Caudal" unit="L/s" type="number" value={values.caudal} error={errors.caudal} onChange={onChange} />
  </fieldset>
)
export default ControlOperativoForm
