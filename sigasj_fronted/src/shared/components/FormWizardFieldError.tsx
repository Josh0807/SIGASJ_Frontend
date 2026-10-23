import { useFormWizardField } from './formWizardValidation'

type FormWizardFieldErrorProps = {
  name: string
  className?: string
}

const FormWizardFieldError = ({
  name,
  className = '',
}: FormWizardFieldErrorProps) => {
  const { error, errorId } = useFormWizardField(name)
  if (!error) return null

  return (
    <p
      className={[
        'mb-0 mt-1.5 text-sm font-semibold text-red-700',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      id={errorId}
      role="alert"
    >
      {error}
    </p>
  )
}

export default FormWizardFieldError
