import { createContext, useContext } from 'react'

type FormWizardNavigationValue = {
  currentStepIndex: number
  goToStep: (stepIndex: number) => void
}

export const FormWizardNavigationContext = createContext<FormWizardNavigationValue | null>(null)

export const useFormWizardNavigation = () => {
  const context = useContext(FormWizardNavigationContext)
  if (!context) throw new Error('useFormWizardNavigation debe utilizarse dentro de FormWizard.')
  return context
}
