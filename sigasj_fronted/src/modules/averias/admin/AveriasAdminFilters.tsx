import { IconFilterOff, IconSearch } from '@tabler/icons-react'
import {
  AdminFilterField,
  AdminFilters,
  Button,
  adminFilterControlClassName,
} from '../../../shared/ui'
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
  total: number
  loading?: boolean
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

const AveriasAdminFilters = ({
  search,
  estado,
  prioridad,
  fechaDesde,
  fechaHasta,
  total,
  loading = false,
  onSearchChange,
  onEstadoChange,
  onPrioridadChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onClear,
  hasActiveFilters,
}: AveriasAdminFiltersProps) => (
  <AdminFilters
    aria-label="Búsqueda y filtros"
    summary={
      <div className="flex w-full flex-col items-stretch gap-2 max-[760px]:text-left min-[761px]:w-auto min-[761px]:flex-row min-[761px]:items-center min-[761px]:justify-end">
        <span className="inline-flex items-center gap-1.5">
          <strong className="text-sigasj-ink">{loading ? '…' : total}</strong>
          <span>{total === 1 ? 'avería' : 'averías'}</span>
        </span>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full min-[761px]:w-auto"
            leftIcon={<IconFilterOff size={16} aria-hidden="true" />}
            onClick={onClear}
          >
            Limpiar filtros
          </Button>
        ) : null}
      </div>
    }
  >
    <div className="col-span-full grid min-w-0 gap-3 max-[760px]:grid-cols-1 min-[761px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))] xl:items-end">
      <AdminFilterField
        label="Buscar"
        className="max-[760px]:col-span-1 min-[761px]:col-span-2 lg:col-span-3 xl:col-span-1"
      >
        <span className="relative block">
          <IconSearch
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sigasj-muted"
            size={17}
            aria-hidden="true"
          />
          <input
            id={SEARCH_INPUT_ID}
            name="search"
            type="search"
            className={`${adminFilterControlClassName} pl-9`}
            maxLength={150}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Código o reportante..."
          />
        </span>
      </AdminFilterField>

      <AdminFilterField label="Estado">
        <select
          id={ESTADO_FILTER_ID}
          name="estado"
          className={adminFilterControlClassName}
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
      </AdminFilterField>

      <AdminFilterField label="Prioridad">
        <select
          id={PRIORIDAD_FILTER_ID}
          name="prioridad"
          className={adminFilterControlClassName}
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
      </AdminFilterField>

      <AdminFilterField label="Desde">
        <input
          id={FECHA_DESDE_ID}
          name="fechaDesde"
          type="date"
          className={adminFilterControlClassName}
          max={fechaHasta || undefined}
          value={fechaDesde}
          onChange={(event) => onFechaDesdeChange(event.target.value)}
        />
      </AdminFilterField>

      <AdminFilterField label="Hasta">
        <input
          id={FECHA_HASTA_ID}
          name="fechaHasta"
          type="date"
          className={adminFilterControlClassName}
          min={fechaDesde || undefined}
          value={fechaHasta}
          onChange={(event) => onFechaHastaChange(event.target.value)}
        />
      </AdminFilterField>
    </div>

    {fechaDesde && fechaHasta && fechaDesde > fechaHasta ? (
      <p className="col-span-full m-0 text-sm font-semibold text-red-700" role="alert">
        La fecha «Desde» no puede ser posterior a «Hasta».
      </p>
    ) : null}
  </AdminFilters>
)

export default AveriasAdminFilters