import type { ReactNode } from 'react'
import type { ZodType } from 'zod'

export type FormWizardStepValidation = {
  schema: ZodType
  getValues: () => unknown
}

export type FormWizardStep = {
  id: string
  title: string
  description?: string
  content: ReactNode
  canAdvance?: boolean
  validationMessage?: string
  validation?: FormWizardStepValidation
}

export type FormWizardProps = {
  steps: readonly FormWizardStep[]
  initialStep?: number
  previousLabel?: string
  nextLabel?: string
  completeLabel?: string
  isCompleting?: boolean
  confirmation?: false | {
    title?: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
  }
  className?: string
  onStepChange?: (stepIndex: number, step: FormWizardStep) => void
  onComplete?: () => void | Promise<void>
}
