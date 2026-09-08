import type { ActividadRegistroFormField } from '../types/actividadRegistroForm'
import type { ActividadRegistroFormErrors } from '../utils/validateActividadRegistroForm'

const FIELD_LABELS: Partial<Record<ActividadRegistroFormField, string>> = {
  fechaActividad: 'Fecha de la actividad',
  titulo: 'Título o resumen',
  descripcion: 'Descripción',
  ubicacion: 'Ubicación',
  observaciones: 'Observaciones',
  ubicacionFuga: 'Ubicación de la fuga',
  presionMedida: 'Presión medida',
  resultadoVisita: 'Resultado de la visita',
  cantidadCloro: 'Cantidad de cloro',
  caudal: 'Caudal',
  documentos: 'Documentos',
}

type ActividadRegistroValidationSummaryProps = {
  errors: ActividadRegistroFormErrors
  generalMessage?: string | null
}

const ActividadRegistroValidationSummary = ({
  errors,
  generalMessage,
}: ActividadRegistroValidationSummaryProps) => {
  const entries = Object.entries(errors).filter(
    (entry): entry is [ActividadRegistroFormField, string] =>
      typeof entry[1] === 'string' && entry[1].trim().length > 0,
  )

  if (entries.length === 0 && !generalMessage) {
    return null
  }

  const focusField = (field: ActividadRegistroFormField) => {
    const element = document.getElementById(field)
    element?.focus()
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div
      className="actividad-registro-form__error-summary"
      role="alert"
      aria-live="polite"
      data-testid="formulario-errores-resumen"
    >
      <p className="actividad-registro-form__error-summary-title">
        {generalMessage ??
          (entries.length === 1
            ? 'Hay un campo que requiere su atención.'
            : `Hay ${entries.length} campos que requieren su atención.`)}
      </p>
      {entries.length > 0 ? (
        <ul className="actividad-registro-form__error-summary-list">
          {entries.map(([field, message]) => (
            <li key={field}>
              <button
                type="button"
                className="actividad-registro-form__error-summary-link"
                onClick={() => focusField(field)}
              >
                <strong>{FIELD_LABELS[field] ?? field}:</strong> {message}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default ActividadRegistroValidationSummary
