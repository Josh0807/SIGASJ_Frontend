import { createContext, useContext, useId } from 'react'
import type { FormValidationErrors } from '../utils/formValidationSchemas'

type FormWizardValidationContextValue = {
  errors: FormValidationErrors
}

export const FormWizardValidationContext =
  createContext<FormWizardValidationContextValue>({
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
