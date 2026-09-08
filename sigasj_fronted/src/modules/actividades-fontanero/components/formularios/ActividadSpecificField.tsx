import type { ChangeEvent } from 'react'
import type { ActividadRegistroFormField } from '../../types/actividadRegistroForm'
import ActividadRegistroFieldError from '../ActividadRegistroFieldError'

type Props = {
  field: ActividadRegistroFormField
  label: string
  value: string
  error?: string
  onChange: (field: ActividadRegistroFormField, value: string) => void
  type?: 'text' | 'number'
  unit?: string
  multiline?: boolean
}

const ActividadSpecificField = ({
  field,
  label,
  value,
  error,
  onChange,
  type = 'text',
  unit,
  multiline = false,
}: Props) => {
  const errorId = `${field}-error`
  const inputClass = `actividad-registro-form__input${
    error ? ' actividad-registro-form__input--error' : ''
  }`
  const common = {
    id: field,
    name: field,
    value,
    required: true,
    'aria-required': true,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(field, event.target.value),
  }

  return (
    <div
      className={`actividad-registro-form__field${
        error ? ' actividad-registro-form__field--invalid' : ''
      }`}
    >
      <label className="actividad-registro-form__label" htmlFor={field}>
        {label} <span className="actividad-registro-form__required" aria-hidden="true">*</span>
        {unit ? <span className="actividad-registro-form__unit"> ({unit})</span> : null}
      </label>
      {multiline ? (
        <textarea {...common} rows={4} className="actividad-registro-form__textarea" />
      ) : (
        <input
          {...common}
          type={type}
          className={inputClass}
          min={type === 'number' ? '0.01' : undefined}
          step={type === 'number' ? 'any' : undefined}
        />
      )}
      {error ? <ActividadRegistroFieldError id={errorId} message={error} /> : null}
    </div>
  )
}

export default ActividadSpecificField
