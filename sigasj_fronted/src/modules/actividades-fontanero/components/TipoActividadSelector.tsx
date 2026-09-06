import type { TipoActividadFontanero } from '../services/actividadesFontaneroApi'

const SELECT_ID = 'tipo-actividad-fontanero'
const LOADING_ID = `${SELECT_ID}-loading`
const ERROR_ID = `${SELECT_ID}-error`
const EMPTY_ID = `${SELECT_ID}-empty`

export type TipoActividadSelectorProps = {
  tipos: TipoActividadFontanero[]
  value: string
  onChange: (tipoId: string) => void
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  onRetry: () => void
  disabled?: boolean
}

const TipoActividadSelector = ({
  tipos,
  value,
  onChange,
  isLoading,
  isError,
  isEmpty,
  onRetry,
  disabled = false,
}: TipoActividadSelectorProps) => {
  const showSelect = !isLoading && !isError && !isEmpty
  const selectDisabled = disabled || !showSelect

  const describedBy = [
    isLoading ? LOADING_ID : null,
    isError ? ERROR_ID : null,
    isEmpty && !isLoading && !isError ? EMPTY_ID : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="actividades-fontanero-registrar__field-group">
      <label className="actividades-fontanero-registrar__field" htmlFor={showSelect ? SELECT_ID : undefined}>
        <span>Tipo de actividad *</span>
      </label>

      {isLoading ? (
        <p
          id={LOADING_ID}
          className="actividades-fontanero-registrar__hint"
          role="status"
          data-testid="tipos-actividad-loading"
        >
          Cargando tipos de actividad…
        </p>
      ) : null}

      {isError ? (
        <div
          id={ERROR_ID}
          className="actividades-fontanero-registrar__alert"
          role="alert"
        >
          <p>No se pudieron cargar los tipos de actividad.</p>
          <button
            type="button"
            className="actividades-fontanero-registrar__retry"
            onClick={onRetry}
            data-testid="tipos-actividad-reintentar"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {isEmpty && !isLoading && !isError ? (
        <p
          id={EMPTY_ID}
          className="actividades-fontanero-registrar__hint"
          role="status"
          data-testid="tipos-actividad-vacio"
        >
          No hay tipos de actividad disponibles por ahora.
        </p>
      ) : null}

      {showSelect ? (
        <select
          id={SELECT_ID}
          name="tipoActividad"
          className="actividades-fontanero-registrar__select"
          required
          aria-required="true"
          aria-describedby={describedBy || undefined}
          disabled={selectDisabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          data-testid="tipo-actividad-select"
        >
          <option value="">Seleccione un tipo</option>
          {tipos.map((tipo) => (
            <option key={tipo.id} value={String(tipo.id)}>
              {tipo.nombre}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  )
}

export default TipoActividadSelector
