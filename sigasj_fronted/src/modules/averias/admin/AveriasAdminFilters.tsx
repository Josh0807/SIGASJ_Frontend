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
  tipo: string
  fechaDesde: string
  fechaHasta: string
  onSearchChange: (value: string) => void
  onEstadoChange: (value: string) => void
  onPrioridadChange: (value: string) => void
  onTipoChange: (value: string) => void
  onFechaDesdeChange: (value: string) => void
  onFechaHastaChange: (value: string) => void
  onClear: () => void
  hasActiveFilters: boolean
}

const SEARCH_INPUT_ID = 'averias-admin-buscar'
const ESTADO_FILTER_ID = 'averias-admin-estado'
const PRIORIDAD_FILTER_ID = 'averias-admin-prioridad'
const TIPO_FILTER_ID = 'averias-admin-tipo'
const FECHA_DESDE_ID = 'averias-admin-fecha-desde'
const FECHA_HASTA_ID = 'averias-admin-fecha-hasta'

const AveriasAdminFilters = ({
  search,
  estado,
  prioridad,
  tipo,
  fechaDesde,
  fechaHasta,
  onSearchChange,
  onEstadoChange,
  onPrioridadChange,
  onTipoChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onClear,
  hasActiveFilters,
}: AveriasAdminFiltersProps) => (
  <section className="gallery-admin__filters w-full !rounded-[28px] !border-blue-100 !bg-white/90 !p-7 !shadow-[0_14px_38px_rgba(30,90,156,0.08)]" aria-label="Búsqueda y filtros">
    <div className="col-span-full border-b border-blue-100 pb-5">
      <p className="mb-1 text-sm font-black uppercase tracking-[0.12em] text-blue-600">Consulta de averías</p>
      <h2 className="m-0 text-2xl font-black tracking-tight text-[#07376f]">Buscar y filtrar casos</h2>
      <p className="mt-2 text-base leading-relaxed text-slate-500">Utilice uno o varios criterios para localizar las averías registradas.</p>
    </div>
    <form
      className="sigasj-filter-search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
      }}
    >
      <label className="gallery-admin__field" htmlFor={SEARCH_INPUT_ID}>
        <span>Buscar por código o Reportante</span>
        <input
          id={SEARCH_INPUT_ID}
          name="search"
          type="search"
          maxLength={150}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Ej. AV-2026-0001 o María"
        />
      </label>
    </form>
    <label className="gallery-admin__field" htmlFor={ESTADO_FILTER_ID}>
      <span>Estado</span>
      <select
        id={ESTADO_FILTER_ID}
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
    <label className="gallery-admin__field" htmlFor={PRIORIDAD_FILTER_ID}>
      <span>Prioridad</span>
      <select
        id={PRIORIDAD_FILTER_ID}
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
        <option value={PRIORIDAD_FILTER_UNASSIGNED}>Sin asignar</option>
      </select>
    </label>
    <label className="gallery-admin__field" htmlFor={TIPO_FILTER_ID}>
      <span>Tipo</span>
      <input
        id={TIPO_FILTER_ID}
        name="tipo"
        type="text"
        maxLength={80}
        value={tipo}
        onChange={(event) => onTipoChange(event.target.value)}
        placeholder="Ej. TUBERIA"
      />
    </label>
    <label className="gallery-admin__field" htmlFor={FECHA_DESDE_ID}>
      <span>Desde</span>
      <input
        id={FECHA_DESDE_ID}
        name="fechaDesde"
        type="date"
        value={fechaDesde}
        onChange={(event) => onFechaDesdeChange(event.target.value)}
      />
    </label>
    <label className="gallery-admin__field" htmlFor={FECHA_HASTA_ID}>
      <span>Hasta</span>
      <input
        id={FECHA_HASTA_ID}
        name="fechaHasta"
        type="date"
        value={fechaHasta}
        onChange={(event) => onFechaHastaChange(event.target.value)}
      />
    </label>
    {hasActiveFilters ? (
      <p className="gallery-admin__filter-reset">
        <button
          type="button"
          className="gallery-admin__button !rounded-2xl !border-blue-200 !bg-white !px-6 !py-3 !font-bold !text-blue-700 !shadow-md transition hover:-translate-y-0.5 hover:!bg-blue-50"
          onClick={onClear}
        >
          Limpiar filtros
        </button>
      </p>
    ) : null}
  </section>
)

export default AveriasAdminFilters
