import { IconFilterOff, IconSearch } from '@tabler/icons-react'
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

const labelClass = 'text-[0.78rem] font-bold text-[#163f6b]'
const inputClass =
  'min-h-11 w-full rounded-2xl border border-[#d7e5f1] bg-[#fbfdff] px-3.5 text-sm text-[#1a2f42] outline-none transition placeholder:text-[#5b7390]/70 hover:border-[#b9d0e6] focus:border-[#1e5a9c] focus:bg-white focus:ring-2 focus:ring-[#bfe3fa]'

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
    <section
      className="grid gap-3 rounded-3xl border border-[#d7e5f1] bg-white p-4 shadow-[0_4px_14px_rgba(30,90,156,0.05)] sm:p-5"
      aria-label="Filtros del historial"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-slate-500">
            Filtros
          </p>
          <p className="m-0 text-sm text-slate-500">
            Consulte por código, estado, tipo, fontanero, sector o rango de fechas.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 text-sm font-bold text-slate-600 transition hover:border-blue-300 hover:text-[#1e5a9c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e5a9c] disabled:cursor-not-allowed disabled:opacity-45"
          onClick={onClear}
          disabled={!hasActiveFilters}
        >
          <IconFilterOff size={17} aria-hidden="true" />
          Limpiar<span className="sr-only"> filtros</span>
        </button>
      </div>

      <form
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="grid min-w-0 gap-1.5 sm:col-span-2" htmlFor="averias-historial-codigo">
          <span className={labelClass}>Código de seguimiento</span>
          <span className="relative block">
            <IconSearch
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
              aria-hidden="true"
            />
            <input
              id="averias-historial-codigo"
              name="codigoSeguimiento"
              type="search"
              className={`${inputClass} pl-10`}
              maxLength={40}
              value={codigoSeguimiento}
              onChange={(event) => onCodigoChange(event.target.value)}
              placeholder="Ej. AV-2026-0042"
            />
          </span>
        </label>

        <label className="grid min-w-0 gap-1.5" htmlFor="averias-historial-estado">
          <span className={labelClass}>Estado</span>
          <select
            id="averias-historial-estado"
            name="estado"
            className={inputClass}
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

        <label className="grid min-w-0 gap-1.5" htmlFor="averias-historial-prioridad">
          <span className={labelClass}>Prioridad</span>
          <select
            id="averias-historial-prioridad"
            name="prioridad"
            className={inputClass}
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

        <label className="grid min-w-0 gap-1.5" htmlFor="averias-historial-tipo">
          <span className={labelClass}>Tipo</span>
          <select
            id="averias-historial-tipo"
            name="tipo"
            className={inputClass}
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

        <label className="grid min-w-0 gap-1.5" htmlFor="averias-historial-fontanero">
          <span className={labelClass}>Fontanero</span>
          <select
            id="averias-historial-fontanero"
            name="fontaneroId"
            className={inputClass}
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

        <label className="grid min-w-0 gap-1.5" htmlFor="averias-historial-sector">
          <span className={labelClass}>Sector o comunidad</span>
          <input
            id="averias-historial-sector"
            name="sector"
            type="search"
            className={inputClass}
            maxLength={150}
            value={sector}
            onChange={(event) => onSectorChange(event.target.value)}
            placeholder="Ej. San Juan"
          />
        </label>

        <label className="grid min-w-0 gap-1.5" htmlFor="averias-historial-fecha-desde">
          <span className={labelClass}>Desde</span>
          <input
            id="averias-historial-fecha-desde"
            name="fechaDesde"
            type="date"
            className={inputClass}
            max={fechaHasta || undefined}
            value={fechaDesde}
            onChange={(event) => onFechaDesdeChange(event.target.value)}
          />
        </label>

        <label className="grid min-w-0 gap-1.5" htmlFor="averias-historial-fecha-hasta">
          <span className={labelClass}>Hasta</span>
          <input
            id="averias-historial-fecha-hasta"
            name="fechaHasta"
            type="date"
            className={inputClass}
            min={fechaDesde || undefined}
            value={fechaHasta}
            onChange={(event) => onFechaHastaChange(event.target.value)}
          />
        </label>
      </form>
    </section>
  )
}

export default AveriasHistorialFilters
