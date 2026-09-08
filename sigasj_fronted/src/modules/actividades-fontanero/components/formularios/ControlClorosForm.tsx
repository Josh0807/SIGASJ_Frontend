import ActividadSpecificField from './ActividadSpecificField'
import type { FormularioActividadProps } from './formulariosActividadRegistry'

const ControlClorosForm = ({ values, errors, onChange, disabled }: FormularioActividadProps) => (
  <fieldset className="actividad-registro-form__section actividad-formulario-especifico" disabled={disabled}>
    <legend className="actividad-registro-form__legend">Control de cloros</legend>
    <ActividadSpecificField field="cantidadCloro" label="Cantidad de cloro" unit="mg/L" type="number" value={values.cantidadCloro} error={errors.cantidadCloro} onChange={onChange} />
  </fieldset>
)
export default ControlClorosForm
