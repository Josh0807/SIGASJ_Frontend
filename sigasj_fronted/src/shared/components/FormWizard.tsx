import { IconArrowRight, IconCheck, IconChevronLeft } from '@tabler/icons-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { FormWizardProps } from '../props/FormWizardProps'
import { zodIssuesToFieldErrors, type FormValidationErrors } from '../utils/formValidationSchemas'
import { FormWizardValidationContext } from './formWizardValidation'
import { FormWizardNavigationContext } from './FormWizardNavigation'
import ConfirmDialog from './ConfirmDialog'

export type { FormWizardProps, FormWizardStep } from '../props/FormWizardProps'

const clampStep = (step: number, total: number) =>
  Math.min(Math.max(0, step), Math.max(0, total - 1))

const FormWizard = ({
  steps,
  initialStep = 0,
  previousLabel = 'Anterior',
  nextLabel = 'Siguiente',
  completeLabel = 'Finalizar',
  isCompleting = false,
  confirmation = {},
  className = '',
  onStepChange,
  onComplete,
}: FormWizardProps) => {
  const wizardId = useId().replace(/:/g, '')
  const [currentStepIndex, setCurrentStepIndex] = useState(() =>
    clampStep(initialStep, steps.length),
  )
  const [validationErrors, setValidationErrors] = useState<FormValidationErrors>({})
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const titleRefs = useRef<Array<HTMLHeadingElement | null>>([])
  const completeButtonRef = useRef<HTMLButtonElement>(null)
  const wizardRef = useRef<HTMLElement>(null)
  const submittingRef = useRef(false)
  const hasNavigated = useRef(false)

  const safeStepIndex = clampStep(currentStepIndex, steps.length)
  if (safeStepIndex !== currentStepIndex) {
    setCurrentStepIndex(safeStepIndex)
  }

  useEffect(() => {
    if (!hasNavigated.current) return
    titleRefs.current[safeStepIndex]?.focus({ preventScroll: true })

    const wizard = wizardRef.current
    if (!wizard) return
    const currentScroll =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop
    const top = Math.max(
      0,
      Math.round(wizard.getBoundingClientRect().top + currentScroll - 16),
    )
    document.documentElement.scrollTop = top
    document.body.scrollTop = top
  }, [safeStepIndex])

  if (steps.length === 0) return null

  const currentStep = steps[safeStepIndex]
  const isFirstStep = safeStepIndex === 0
  const isLastStep = safeStepIndex === steps.length - 1
  const busy = isCompleting || isSubmitting
  const canAdvance = currentStep.canAdvance !== false && !busy
  const progress = Math.round(((safeStepIndex + 1) / steps.length) * 100)

  const moveTo = (nextIndex: number) => {
    const safeIndex = clampStep(nextIndex, steps.length)
    if (safeIndex === safeStepIndex) return
    hasNavigated.current = true
    setValidationErrors({})
    setCurrentStepIndex(safeIndex)
    onStepChange?.(safeIndex, steps[safeIndex])
  }

  const focusFirstError = (errors: FormValidationErrors) => {
    const firstField = Object.keys(errors)[0]
    if (!firstField) return
    window.requestAnimationFrame(() => {
      const panel = document.querySelector(`[data-wizard-step="${currentStep.id}"]`)
      const field = [...(panel?.querySelectorAll<HTMLElement>('[name]') ?? [])]
        .find((element) => element.getAttribute('name') === firstField)
      field?.focus()
    })
  }

  const validateCurrentStep = () => {
    if (!currentStep.validation) {
      setValidationErrors({})
      return true
    }
    const result = currentStep.validation.schema.safeParse(currentStep.validation.getValues())
    if (result.success) {
      setValidationErrors({})
      return true
    }
    const errors = zodIssuesToFieldErrors(result.error.issues)
    setValidationErrors(errors)
    focusFirstError(errors)
    return false
  }

  const handleNext = () => {
    if (validateCurrentStep()) moveTo(safeStepIndex + 1)
  }

  const handleComplete = () => {
    if (!validateCurrentStep()) return
    if (confirmation === false) {
      void submitOnce()
      return
    }
    setIsConfirmationOpen(true)
  }

  const submitOnce = async () => {
    if (submittingRef.current) return
    submittingRef.current = true
    setIsConfirmationOpen(false)
    setIsSubmitting(true)
    try {
      await onComplete?.()
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <>
    <section
      ref={wizardRef}
      className={[
        'form-wizard overflow-hidden rounded-[24px] border border-sky-100 bg-white shadow-[0_16px_42px_rgba(31,105,165,0.13)]',
        className,
      ].filter(Boolean).join(' ')}
      aria-label="Formulario por pasos"
    >
      <header className="border-b border-sky-100 bg-[linear-gradient(135deg,#f7fcff_0%,#eaf6ff_100%)] px-7 py-6 max-[640px]:px-5">
        <div className="flex items-center justify-between gap-4 text-sm font-bold text-[#315d87]">
          <span aria-live="polite">Paso {safeStepIndex + 1} de {steps.length}</span>
          <span aria-hidden="true">{progress}%</span>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-sky-100"
          role="progressbar"
          aria-label="Progreso del formulario"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={`Paso ${safeStepIndex + 1} de ${steps.length}`}
        >
          <span className="block h-full rounded-full bg-gradient-to-r from-[#0872d3] to-[#42a5e8] transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progress}%` }} />
        </div>

        <ol className="mt-5 grid list-none gap-2 p-0 max-[700px]:grid-cols-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }} aria-label="Pasos del formulario">
          {steps.map((step, index) => {
            const isCurrent = index === safeStepIndex
            const isComplete = index < safeStepIndex
            return (
              <li
                className={`flex min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold ${isCurrent ? 'bg-white text-[#075fae] shadow-sm' : isComplete ? 'text-emerald-700' : 'text-slate-500'}`}
                key={step.id}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs ${isCurrent ? 'bg-[#1476cf] text-white' : isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`} aria-hidden="true">
                  {isComplete ? <IconCheck size={16} stroke={3} /> : index + 1}
                </span>
                <span className="truncate max-[700px]:whitespace-normal">{step.title}</span>
              </li>
            )
          })}
        </ol>
      </header>

      <FormWizardNavigationContext.Provider value={{ currentStepIndex: safeStepIndex, goToStep: moveTo }}>
      <FormWizardValidationContext.Provider value={{ errors: validationErrors }}>
      <div className="px-7 py-8 max-[640px]:px-5 max-[640px]:py-6">
        {steps.map((step, index) => {
          const titleId = `${wizardId}-${step.id}-title`
          const descriptionId = step.description ? `${wizardId}-${step.id}-description` : undefined
          return (
            <section
              key={step.id}
              hidden={index !== safeStepIndex}
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              data-wizard-step={step.id}
            >
              <h2
                className="m-0 text-[clamp(1.5rem,3vw,2rem)] font-extrabold leading-tight text-[#073b79] focus:outline-none"
                id={titleId}
                ref={(node) => { titleRefs.current[index] = node }}
                tabIndex={-1}
              >
                {step.title}
              </h2>
              {step.description ? <p className="mb-0 mt-2 leading-7 text-[#526d8c]" id={descriptionId}>{step.description}</p> : null}
              <div className="mt-6">{step.content}</div>
            </section>
          )
        })}

        {currentStep.canAdvance === false && currentStep.validationMessage ? (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900" id={`${wizardId}-validation-message`} role="status">
            {currentStep.validationMessage}
          </p>
        ) : null}

        <footer className="mt-8 flex items-center justify-between gap-4 border-t border-sky-100 pt-6 max-[480px]:flex-col-reverse max-[480px]:items-stretch">
          <button
            className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-[#1476cf] bg-white px-6 font-bold text-[#0b65b5] transition hover:-translate-y-0.5 hover:bg-sky-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:translate-y-0 disabled:hover:bg-white"
            type="button"
            disabled={isFirstStep || busy}
            onClick={() => moveTo(safeStepIndex - 1)}
          >
            <IconChevronLeft size={20} aria-hidden="true" /> {previousLabel}
          </button>

          {isLastStep ? (
            <button
              ref={completeButtonRef}
              className="flex min-h-[54px] min-w-[240px] cursor-pointer items-center justify-center gap-4 rounded-xl !border-0 bg-gradient-to-r from-[#0872d3] to-[#3298dc] px-8 text-base font-extrabold text-white shadow-[0_10px_22px_rgba(8,114,211,0.22)] transition hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 max-[480px]:w-full max-[480px]:min-w-0"
              type="button"
              disabled={!canAdvance}
              aria-describedby={currentStep.canAdvance === false && currentStep.validationMessage ? `${wizardId}-validation-message` : undefined}
              onClick={handleComplete}
            >
              {busy ? 'Enviando…' : completeLabel}
            </button>
          ) : (
            <button
              className="flex min-h-[54px] min-w-[240px] cursor-pointer items-center justify-center gap-4 rounded-xl !border-0 bg-gradient-to-r from-[#0872d3] to-[#3298dc] px-8 text-base font-extrabold text-white shadow-[0_10px_22px_rgba(8,114,211,0.22)] transition hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 max-[480px]:w-full max-[480px]:min-w-0"
              type="button"
              disabled={!canAdvance}
              aria-describedby={currentStep.canAdvance === false && currentStep.validationMessage ? `${wizardId}-validation-message` : undefined}
              onClick={handleNext}
            >
              {nextLabel} <IconArrowRight className="shrink-0" size={21} stroke={2.5} aria-hidden="true" />
            </button>
          )}
        </footer>
      </div>
      </FormWizardValidationContext.Provider>
      </FormWizardNavigationContext.Provider>
    </section>
      <ConfirmDialog
        isOpen={isConfirmationOpen}
        title={confirmation === false ? '' : (confirmation.title ?? 'Confirmar envío de solicitud')}
        message={confirmation === false ? '' : (confirmation.message ?? 'Verifica que la información sea correcta. Una vez confirmada, la solicitud será registrada.')}
        cancelLabel={confirmation === false ? undefined : confirmation.cancelLabel}
        confirmLabel={confirmation === false ? 'Confirmar' : (confirmation.confirmLabel ?? 'Confirmar y enviar')}
        returnFocusRef={completeButtonRef}
        onCancel={() => setIsConfirmationOpen(false)}
        onConfirm={() => { void submitOnce() }}
      />
    </>
  )
}

export default FormWizard
