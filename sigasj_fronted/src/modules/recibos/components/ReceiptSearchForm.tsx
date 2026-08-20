import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

export type ReceiptSearchFormProps = {
  initialValue?: string | number
  onSearch: (numeroPaja: number) => void
  loading?: boolean
  className?: string
}

export const ReceiptSearchForm = ({
  initialValue = '',
  onSearch,
  loading = false,
  className = '',
}: ReceiptSearchFormProps) => {
  const [numeroPajaInput, setNumeroPajaInput] = useState<string>(
    initialValue ? String(initialValue) : '',
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    setNumeroPajaInput(initialValue ? String(initialValue) : '')
    setValidationError(null)
  }, [initialValue])


  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidationError(null)

    const trimmed = numeroPajaInput.trim()
    if (!trimmed) {
      setValidationError('El número de paja es obligatorio.')
      return
    }

    const num = Number(trimmed)
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
      setValidationError('Ingrese un número de paja válido.')
      return
    }

    onSearch(num)
  }

  return (
    <form
      className={`receipt-search-form ${className}`}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Formulario de consulta de recibos"
    >
      <div className="receipt-search-form__field">
        <label htmlFor="numeroPajaInput" className="receipt-search-form__label">
          Número de paja
        </label>
        <div className="receipt-search-form__input-group">
          <input
            id="numeroPajaInput"
            name="numeroPaja"
            type="number"
            min="1"
            step="1"
            placeholder="Coloca tu número de paja aquí"
            className={`receipt-search-form__input ${
              validationError ? 'receipt-search-form__input--error' : ''
            }`}
            value={numeroPajaInput}
            onChange={(e) => {
              setNumeroPajaInput(e.target.value)
              if (validationError) setValidationError(null)
            }}
            disabled={loading}
            aria-invalid={Boolean(validationError)}
            aria-describedby={validationError ? 'paja-input-error' : undefined}
          />
          <button
            type="submit"
            className="receipt-search-form__button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Consultando recibo...' : 'Consultar'}
          </button>
        </div>
        {validationError ? (
          <p id="paja-input-error" className="receipt-search-form__error" role="alert">
            {validationError}
          </p>
        ) : null}
      </div>
    </form>
  )
}

export default ReceiptSearchForm
