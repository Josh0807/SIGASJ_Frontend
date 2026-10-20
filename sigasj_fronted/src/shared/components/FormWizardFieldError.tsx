import { createContext, useContext, useId } from 'react'
import type { FormValidationErrors } from '../utils/formValidationSchemas'

type FormWizardValidationContextValue = {
  errors: FormValidationErrors
}

export const FormWizardValidationContext = createContext<FormWizardValidationContextValue>({
  errors: {},
})

export const useFormWizardField = (name: string) => {
  const { errors } = useContext(FormWizardValidationContext)
  const generatedId = useId().replace(/:/g, '')
  const error = errors[name]
  const errorId = error ? `wizard-field-${generatedId}-error` : undefined

  return {
    error,
    errorId,
    inputProps: {
      'aria-invalid': error ? true : undefined,
      'aria-describedby': errorId,
    },
  }
}

type FormWizardFieldErrorProps = {
  name: string
  className?: string
}

const FormWizardFieldError = ({ name, className = '' }: FormWizardFieldErrorProps) => {
  const { error, errorId } = useFormWizardField(name)
  if (!error) return null

  return (
    <p
      className={['mb-0 mt-1.5 text-sm font-semibold text-red-700', className].filter(Boolean).join(' ')}
      id={errorId}
      role="alert"
    >
      {error}
    </p>
  )
}

export default FormWizardFieldError
