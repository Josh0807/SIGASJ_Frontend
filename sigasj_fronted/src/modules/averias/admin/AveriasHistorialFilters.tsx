import { ESTADO_AVERIA_OPTIONS } from './estadoAveria'
import { TIPO_AVERIA_OPTIONS } from './tipoAveria'
import {
  EMPTY_FILTER,
  getFontaneroAsignableLabel,
  PRIORIDAD_FILTER_OPTIONS,
  PRIORIDAD_FILTER_UNASSIGNED,
  type AveriaFontaneroAsignable,
} from './types'

type AveriasHistorialFiltersProps = {
  codigoSeguimiento: string
  estado: string
  prioridad: string
  tipo: string
  fontaneroId: string
  sector: string
  fechaDesde: string
  fechaHasta: string
  fontaneros: AveriaFontaneroAsignable[]
  onCodigoChange: (value: string) => void
  onEstadoChange: (value: string) => void
  onPrioridadChange: (value: string) => void
  onTipoChange: (value: string) => void
  onFontaneroChange: (value: string) => void
  onSectorChange: (value: string) => void
  onFechaDesdeChange: (value: string) => void
  onFechaHastaChange: (value: string) => void
  onClear: () => void
  hasActiveFilters: boolean
}

const AveriasHistorialFilters = ({
  codigoSeguimiento,
  estado,
  prioridad,
  tipo,
  fontaneroId,
  sector,
  fechaDesde,
  fechaHasta,
  fontaneros,
  onCodigoChange,
  onEstadoChange,
  onPrioridadChange,
  onTipoChange,
  onFontaneroChange,
  onSectorChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onClear,
  hasActiveFilters,
}: AveriasHistorialFiltersProps) => {
  const fontaneroConocido = fontaneros.some(
    (fontanero) => String(fontanero.id) === fontaneroId,
  )

  return (
    <section className="gallery-admin__filters w-full" aria-label="Filtros del historial">
      <form
        className="sigasj-filter-search"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="gallery-admin__field" htmlFor="averias-historial-codigo">
          <span>Código de seguimiento</span>
          <input
            id="averias-historial-codigo"
            name="codigoSeguimiento"
            type="search"
            maxLength={40}
            value={codigoSeguimiento}
            onChange={(event) => onCodigoChange(event.target.value)}
            placeholder="Ej. AV-2026-0042"
          />
        </label>
      </form>
      <label className="gallery-admin__field" htmlFor="averias-historial-estado">
        <span>Estado</span>
        <select
          id="averias-historial-estado"
          name="estado"
          value={estado}
          onChange={(event) => onEstadoChange(event.target.value)}
        >
          <option value={EMPTY_FILTER}>Todos</option>
          {ESTADO_AVERIA_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="gallery-admin__field" htmlFor="averias-historial-prioridad">
        <span>Prioridad</span>
        <select
          id="averias-historial-prioridad"
          name="prioridad"
          value={prioridad}
          onChange={(event) => onPrioridadChange(event.target.value)}
        >
          <option value={EMPTY_FILTER}>Todas</option>
          {PRIORIDAD_FILTER_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
          <option value={PRIORIDAD_FILTER_UNASSIGNED}>Sin prioridad</option>
        </select>
      </label>
      <label className="gallery-admin__field" htmlFor="averias-historial-tipo">
        <span>Tipo</span>
        <select
          id="averias-historial-tipo"
          name="tipo"
          value={tipo}
          onChange={(event) => onTipoChange(event.target.value)}
        >
          <option value={EMPTY_FILTER}>Todos</option>
          {TIPO_AVERIA_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="gallery-admin__field" htmlFor="averias-historial-fontanero">
        <span>Fontanero</span>
        <select
          id="averias-historial-fontanero"
          name="fontaneroId"
          value={fontaneroId}
          onChange={(event) => onFontaneroChange(event.target.value)}
        >
          <option value={EMPTY_FILTER}>Todos</option>
          {fontaneroId && !fontaneroConocido ? (
            <option value={fontaneroId}>Fontanero #{fontaneroId}</option>
          ) : null}
          {fontaneros.map((fontanero) => (
            <option value={String(fontanero.id)} key={fontanero.id}>
              {getFontaneroAsignableLabel(fontanero)}
            </option>
          ))}
        </select>
      </label>
      <label className="gallery-admin__field" htmlFor="averias-historial-sector">
        <span>Sector o comunidad</span>
        <input
          id="averias-historial-sector"
          name="sector"
          type="search"
          maxLength={150}
          value={sector}
          onChange={(event) => onSectorChange(event.target.value)}
          placeholder="Ej. San Juan"
        />
      </label>
      <label className="gallery-admin__field" htmlFor="averias-historial-fecha-desde">
        <span>Desde</span>
        <input
          id="averias-historial-fecha-desde"
          name="fechaDesde"
          type="date"
          value={fechaDesde}
          onChange={(event) => onFechaDesdeChange(event.target.value)}
        />
      </label>
      <label className="gallery-admin__field" htmlFor="averias-historial-fecha-hasta">
        <span>Hasta</span>
        <input
          id="averias-historial-fecha-hasta"
          name="fechaHasta"
          type="date"
          value={fechaHasta}
          onChange={(event) => onFechaHastaChange(event.target.value)}
        />
      </label>
      {hasActiveFilters ? (
        <p className="gallery-admin__filter-reset">
          <button type="button" className="gallery-admin__button" onClick={onClear}>
            Limpiar filtros
          </button>
        </p>
      ) : null}
    </section>
  )
}

export default AveriasHistorialFilters
