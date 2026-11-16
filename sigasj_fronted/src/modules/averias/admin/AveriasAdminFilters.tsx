import { IconFilterOff, IconSearch } from '@tabler/icons-react'
import { ESTADO_AVERIA_OPTIONS } from './estadoAveria'
import {
  EMPTY_FILTER,
  PRIORIDAD_FILTER_OPTIONS,
  PRIORIDAD_FILTER_UNASSIGNED,
} from './types'

type AveriasAdminFiltersProps = {
  search: string
  estado: string
  prioridad: string
  fechaDesde: string
  fechaHasta: string
  onSearchChange: (value: string) => void
  onEstadoChange: (value: string) => void
  onPrioridadChange: (value: string) => void
  onFechaDesdeChange: (value: string) => void
  onFechaHastaChange: (value: string) => void
  onClear: () => void
  hasActiveFilters: boolean
}

const SEARCH_INPUT_ID = 'averias-admin-buscar'
const ESTADO_FILTER_ID = 'averias-admin-estado'
const PRIORIDAD_FILTER_ID = 'averias-admin-prioridad'
const FECHA_DESDE_ID = 'averias-admin-fecha-desde'
const FECHA_HASTA_ID = 'averias-admin-fecha-hasta'

const labelClass = 'text-[0.78rem] font-bold text-[#163f6b]'
const inputClass =
  'min-h-11 w-full rounded-2xl border border-[#d7e5f1] bg-[#fbfdff] px-3.5 text-sm text-[#1a2f42] outline-none transition placeholder:text-[#5b7390]/70 hover:border-[#b9d0e6] focus:border-[#1e5a9c] focus:bg-white focus:ring-2 focus:ring-[#bfe3fa]'

const AveriasAdminFilters = ({
  search,
  estado,
  prioridad,
  fechaDesde,
  fechaHasta,
  onSearchChange,
  onEstadoChange,
  onPrioridadChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onClear,
  hasActiveFilters,
}: AveriasAdminFiltersProps) => (
  <section
    className="grid gap-3 rounded-3xl border border-[#d7e5f1] bg-white p-4 shadow-[0_4px_14px_rgba(30,90,156,0.05)] sm:p-5"
    aria-label="Búsqueda y filtros"
  >
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div className="min-w-0">
        <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.06em] text-slate-500">
          Filtros
        </p>
        <p className="m-0 text-sm text-slate-500">
          Busque por código o reportante y afine por estado, prioridad o fechas.
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

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))] xl:items-end">
      <label className="grid min-w-0 gap-1.5 sm:col-span-2 lg:col-span-3 xl:col-span-1" htmlFor={SEARCH_INPUT_ID}>
        <span className={labelClass}>Buscar</span>
        <span className="relative block">
          <IconSearch
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
            aria-hidden="true"
          />
          <input
            id={SEARCH_INPUT_ID}
            name="search"
            type="search"
            className={`${inputClass} pl-10`}
            maxLength={150}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Código o reportante..."
          />
        </span>
      </label>

      <label className="grid min-w-0 gap-1.5" htmlFor={ESTADO_FILTER_ID}>
        <span className={labelClass}>Estado</span>
        <select
          id={ESTADO_FILTER_ID}
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

      <label className="grid min-w-0 gap-1.5" htmlFor={PRIORIDAD_FILTER_ID}>
        <span className={labelClass}>Prioridad</span>
        <select
          id={PRIORIDAD_FILTER_ID}
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
          <option value={PRIORIDAD_FILTER_UNASSIGNED}>Sin asignar</option>
        </select>
      </label>

      <label className="grid min-w-0 gap-1.5" htmlFor={FECHA_DESDE_ID}>
        <span className={labelClass}>Desde</span>
        <input
          id={FECHA_DESDE_ID}
          name="fechaDesde"
          type="date"
          className={inputClass}
          max={fechaHasta || undefined}
          value={fechaDesde}
          onChange={(event) => onFechaDesdeChange(event.target.value)}
        />
      </label>

      <label className="grid min-w-0 gap-1.5" htmlFor={FECHA_HASTA_ID}>
        <span className={labelClass}>Hasta</span>
        <input
          id={FECHA_HASTA_ID}
          name="fechaHasta"
          type="date"
          className={inputClass}
          min={fechaDesde || undefined}
          value={fechaHasta}
          onChange={(event) => onFechaHastaChange(event.target.value)}
        />
      </label>
    </div>

    {fechaDesde && fechaHasta && fechaDesde > fechaHasta ? (
      <p className="m-0 text-sm font-semibold text-red-700" role="alert">
        La fecha «Desde» no puede ser posterior a «Hasta».
      </p>
    ) : null}
  </section>
)

export default AveriasAdminFilters
