import DocumentoActividadUploader from '../DocumentoActividadUploader'
import type { FormularioActividadProps } from './formulariosActividadRegistry'

const IncapacidadVacacionesForm = ({ values, errors, onFilesChange, disabled }: FormularioActividadProps) => (
  <fieldset className="actividad-registro-form__section actividad-formulario-especifico !gap-5 !rounded-3xl !border !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/60 !p-5 !shadow-sm md:!p-7" disabled={disabled}>
    <legend className="actividad-registro-form__legend">Incapacidad o vacaciones</legend>
    <div className="actividad-registro-form__field">
      <label className="actividad-registro-form__label" htmlFor="documentos">
        Documentos de respaldo <span className="actividad-registro-form__required" aria-hidden="true">*</span>
      </label>
      <DocumentoActividadUploader files={values.documentos} onChange={onFilesChange} error={errors.documentos} disabled={disabled} multiple />
    </div>
  </fieldset>
)

export default IncapacidadVacacionesForm
