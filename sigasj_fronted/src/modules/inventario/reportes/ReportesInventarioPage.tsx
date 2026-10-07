import type { FormEvent } from 'react'
import { useState } from 'react'
import { IconArrowsExchange, IconCalendar, IconCategory, IconEraser, IconPackage, IconSearch } from '@tabler/icons-react'
import IndicatorCard from '../../../shared/components/IndicatorCard'
import { InventoryFormField } from '../InventoryFormField'
import {
  formatMovimientoCantidad,
  formatMovimientoFecha,
  formatMovimientoTipo,
  getMovimientoMaterialNombre,
  getMovimientoResponsable,
} from '../movimientos/movimientosUtils'
import type { TipoMovimientoInventario } from '../movimientos/types'
import { useCategorias } from '../categorias/useCategorias'
import { useMateriales } from '../useMateriales'
import type { ReporteInventarioFilters } from './types'
import { useReporteInventario } from './useReporteInventario'

const EMPTY = ''

type DraftFilters = {
  fechaDesde: string
  fechaHasta: string
  materialId: string
  categoriaId: string
  tipo: TipoMovimientoInventario | ''
}

const EMPTY_DRAFT: DraftFilters = {
  fechaDesde: EMPTY,
  fechaHasta: EMPTY,
  materialId: EMPTY,
  categoriaId: EMPTY,
  tipo: EMPTY,
}

const toAppliedFilters = (draft: DraftFilters): ReporteInventarioFilters => ({
  fechaDesde: draft.fechaDesde.trim() || undefined,
  fechaHasta: draft.fechaHasta.trim() || undefined,
  idMaterial: draft.materialId ? Number(draft.materialId) : undefined,
  idCategoria: draft.categoriaId ? Number(draft.categoriaId) : undefined,
  tipo: draft.tipo || undefined,
})

export default function ReportesInventarioPage() {
  const [draft, setDraft] = useState<DraftFilters>(EMPTY_DRAFT)
  const [applied, setApplied] = useState<ReporteInventarioFilters>({})
  const [clientError, setClientError] = useState('')
  const { reporte, loading, error, refetch } = useReporteInventario(applied)
  const { result: materialesResult, loading: materialesLoading } = useMateriales({
    page: 1,
    limit: 100,
  })
  const { result: categoriasResult, loading: categoriasLoading } = useCategorias({
    page: 1,
    limit: 100,
  })

  const rangeInvalid =
    Boolean(draft.fechaDesde && draft.fechaHasta) &&
    draft.fechaDesde > draft.fechaHasta

  const filterError = clientError || error

  const handleConsultar = (event: FormEvent) => {
    event.preventDefault()
    setClientError('')

    if (rangeInvalid) {
      setClientError('La fecha inicial no puede ser posterior a la fecha final.')
      return
    }

    const next = toAppliedFilters(draft)
    const unchanged =
      next.fechaDesde === applied.fechaDesde &&
      next.fechaHasta === applied.fechaHasta &&
      next.idMaterial === applied.idMaterial &&
      next.idCategoria === applied.idCategoria &&
      next.tipo === applied.tipo

    if (unchanged) {
      refetch()
      return
    }

    setApplied(next)
  }

  const handleLimpiar = () => {
    setDraft(EMPTY_DRAFT)
    setClientError('')
    setApplied({})
  }

  const hasActiveDraft =
    draft.fechaDesde !== EMPTY ||
    draft.fechaHasta !== EMPTY ||
    draft.materialId !== EMPTY ||
    draft.categoriaId !== EMPTY ||
    draft.tipo !== EMPTY

  const showEmpty =
    !loading &&
    !filterError &&
    reporte.indicadores.totalMateriales === 0 &&
    reporte.movimientos.length === 0

  return (
    <main className="gallery-admin inventario-reportes">
      <div className="gallery-admin__shell sigasj-stack">
        <header className="materials-admin__header">
          <div>
            <p className="materials-admin__eyebrow">Inventario · Administración</p>
            <h1>Reportes de inventario</h1>
            <p>
              Consulte indicadores y movimientos del inventario. Los cálculos provienen del servidor.
            </p>
          </div>
        </header>

        <form
          className="gallery-admin__filters"
          aria-label="Filtros del reporte de inventario"
          onSubmit={handleConsultar}
          noValidate
        >
          <InventoryFormField label="Fecha inicial" icon={<IconCalendar size={20} aria-hidden="true" />}>
            <input
              id="reporte-fecha-desde"
              type="date"
              value={draft.fechaDesde}
              onChange={(event) =>
                setDraft((current) => ({ ...current, fechaDesde: event.target.value }))
              }
            />
          </InventoryFormField>

          <InventoryFormField label="Fecha final" icon={<IconCalendar size={20} aria-hidden="true" />}>
            <input
              id="reporte-fecha-hasta"
              type="date"
              value={draft.fechaHasta}
              onChange={(event) =>
                setDraft((current) => ({ ...current, fechaHasta: event.target.value }))
              }
            />
          </InventoryFormField>

          <InventoryFormField label="Material" icon={<IconPackage size={20} aria-hidden="true" />}>
            <select
              id="reporte-material"
              value={draft.materialId}
              disabled={materialesLoading}
              onChange={(event) =>
                setDraft((current) => ({ ...current, materialId: event.target.value }))
              }
            >
              <option value="">Todos los materiales</option>
              {(materialesResult?.data ?? []).map((material) => (
                <option key={material.id} value={material.id}>{material.nombre}</option>
              ))}
            </select>
          </InventoryFormField>

          <InventoryFormField label="Categoría" icon={<IconCategory size={20} aria-hidden="true" />}>
            <select
              id="reporte-categoria"
              value={draft.categoriaId}
              disabled={categoriasLoading}
              onChange={(event) =>
                setDraft((current) => ({ ...current, categoriaId: event.target.value }))
              }
            >
              <option value="">Todas las categorías</option>
              {(categoriasResult?.data ?? []).map((categoria) => (
                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
              ))}
            </select>
          </InventoryFormField>

          <InventoryFormField label="Tipo de movimiento" icon={<IconArrowsExchange size={20} aria-hidden="true" />}>
            <select
              id="reporte-tipo"
              value={draft.tipo}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  tipo: event.target.value as TipoMovimientoInventario | '',
                }))
              }
            >
              <option value="">Todos los tipos</option>
              <option value="SALIDA">Salidas</option>
            </select>
          </InventoryFormField>

          <div className="actividades-admin-reportes__actions [&>button]:inline-flex [&>button]:items-center [&>button]:justify-center [&>button]:gap-2.5">
            <button
              type="submit"
              className="group relative isolate overflow-hidden gallery-admin__button gallery-admin__button--primary !min-h-14 !rounded-2xl !border-0 !bg-gradient-to-r !from-blue-700 !via-blue-600 !to-cyan-500 !px-7 !text-white !shadow-[0_10px_24px_rgba(29,78,216,0.25)] transform-gpu transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:!shadow-[0_16px_30px_rgba(29,78,216,0.34)] active:translate-y-0 active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2 disabled:hover:translate-y-0 disabled:hover:scale-100 motion-reduce:transform-none motion-reduce:transition-none"
              disabled={loading}
            >
              <span className="absolute inset-0 -translate-x-[140%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[140%] motion-reduce:hidden" aria-hidden="true" />
              <IconSearch className="relative transition-transform duration-300 group-hover:scale-110" size={20} aria-hidden="true" />
              <span className="relative">{loading ? 'Consultando…' : 'Consultar'}</span>
            </button>
            <button
              type="button"
              className="group gallery-admin__button gallery-admin__filter-reset !min-h-14 !rounded-2xl !border !border-blue-200 !bg-white/90 !px-7 !text-blue-700 !shadow-[0_8px_20px_rgba(15,71,139,0.10)] backdrop-blur-sm transform-gpu transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(15,71,139,0.18)] active:translate-y-0 active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2 disabled:hover:translate-y-0 disabled:hover:scale-100 motion-reduce:transform-none motion-reduce:transition-none"
              onClick={handleLimpiar}
              disabled={loading || (!hasActiveDraft && Object.keys(applied).length === 0)}
            >
              <IconEraser className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transform-none" size={20} aria-hidden="true" />
              <span>Limpiar filtros</span>
            </button>
          </div>
        </form>

        {filterError ? (
          <div className="material-tracking__state material-tracking__state--error" role="alert">
            <p>{filterError}</p>
            <button
              type="button"
              onClick={() => {
                setClientError('')
                refetch()
              }}
            >
              Reintentar
            </button>
          </div>
        ) : null}

        <section className="actividades-admin-reportes__indicators" aria-label="Indicadores del reporte">
          <div className="admin-dashboard__indicators-grid">
            <IndicatorCard
              title="Total de materiales"
              value={loading ? null : reporte.indicadores.totalMateriales}
              isLoading={loading}
              description="Registrados según filtros"
              badgeText="Materiales"
              badgeType="info"
            />
            <IndicatorCard
              title="Stock bajo"
              value={loading ? null : reporte.indicadores.materialesStockBajo}
              isLoading={loading}
              description="Existencia en o bajo el mínimo"
              badgeText="Alerta"
              badgeType="warning"
            />
            <IndicatorCard
              title="Entradas registradas"
              value={loading ? null : reporte.indicadores.entradasRegistradas}
              isLoading={loading}
              description="Movimientos ENTRADA del periodo"
              badgeText="Entradas"
              badgeType="success"
            />
            <IndicatorCard
              title="Salidas registradas"
              value={loading ? null : reporte.indicadores.salidasRegistradas}
              isLoading={loading}
              description="Movimientos SALIDA del periodo"
              badgeText="Salidas"
              badgeType="alert"
            />
          </div>
        </section>

        {showEmpty ? (
          <div className="material-tracking__empty" role="status">
            <h2>No se encontraron datos</h2>
            <p>No hay información de inventario para los criterios seleccionados.</p>
          </div>
        ) : null}

        {!loading && reporte.porCategoria.length > 0 ? (
          <section className="material-tracking__table-wrap inventario-reportes__category-summary" aria-labelledby="reporte-categorias-title">
            <header className="inventario-reportes__category-heading">
              <span className="inventario-reportes__category-icon" aria-hidden="true">
                <IconCategory size={26} />
              </span>
              <div>
                <h2 className="!m-0 !text-xl !font-extrabold !leading-[1.35] !tracking-[-0.015em] !text-[#062e63]" id="reporte-categorias-title">Resumen por categoría</h2>
                <p className="!mt-1.5 !mb-0 !text-[0.9375rem] !font-normal !leading-6 !text-slate-500">Distribución de materiales y alertas de existencias por clasificación.</p>
              </div>
            </header>
            <div className="inventario-reportes__category-table">
            <table>
              <caption className="visually-hidden">Materiales por categoría</caption>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Materiales</th>
                  <th>Stock bajo</th>
                </tr>
              </thead>
              <tbody>
                {reporte.porCategoria.map((item) => (
                  <tr key={`${item.idCategoria ?? 'sin'}-${item.nombre}`}>
                    <td data-label="Categoría"><strong>{item.nombre}</strong></td>
                    <td data-label="Materiales"><span className="inventario-reportes__metric-badge is-total">{item.totalMateriales}</span></td>
                    <td data-label="Stock bajo"><span className={`inventario-reportes__metric-badge ${item.materialesStockBajo > 0 ? 'is-warning' : 'is-ok'}`}>{item.materialesStockBajo}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </section>
        ) : null}

        {!loading && reporte.movimientos.length > 0 ? (
          <section className="material-tracking !mx-0 !max-w-none space-y-5" aria-labelledby="reporte-movimientos-title">
            <header className="material-tracking__header !items-center !rounded-3xl !border-blue-100 !bg-gradient-to-br !from-white !via-blue-50/70 !to-cyan-50/70 !p-7 !shadow-[0_14px_36px_rgba(18,63,112,0.10)]">
              <div className="flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/20" aria-hidden="true">
                  <IconArrowsExchange size={28} />
                </span>
                <div>
                  <h2 className="!m-0 !text-xl !font-extrabold !leading-[1.35] !tracking-[-0.015em] !text-[#062e63]" id="reporte-movimientos-title">Movimientos del periodo</h2>
                  <p className="!mt-1.5 !mb-0 !text-[0.9375rem] !font-normal !leading-6 !text-slate-500">Detalle de entradas y salidas según los filtros aplicados.</p>
                </div>
              </div>
            </header>
            <div className="material-tracking__table-wrap !overflow-hidden !rounded-3xl !border-blue-100 !bg-white !shadow-[0_14px_36px_rgba(18,63,112,0.10)]">
              <table className="w-full border-separate border-spacing-0">
                <caption className="visually-hidden">Movimientos del reporte</caption>
                <thead>
                  <tr>
                    <th className="!bg-slate-50/90 !px-5 !py-4 !text-xs !font-extrabold !tracking-wider !text-slate-600">Fecha</th>
                    <th className="!bg-slate-50/90 !px-5 !py-4 !text-xs !font-extrabold !tracking-wider !text-slate-600">Material</th>
                    <th className="!bg-slate-50/90 !px-5 !py-4 !text-xs !font-extrabold !tracking-wider !text-slate-600">Tipo</th>
                    <th className="!bg-slate-50/90 !px-5 !py-4 !text-xs !font-extrabold !tracking-wider !text-slate-600">Cantidad</th>
                    <th className="!bg-slate-50/90 !px-5 !py-4 !text-xs !font-extrabold !tracking-wider !text-slate-600">Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.movimientos.map((movimiento) => (
                  <tr className="group transition-colors duration-200 hover:!bg-blue-50/60" key={movimiento.id}>
                      <td className="!px-5 !py-4 text-slate-500" data-label="Fecha">{formatMovimientoFecha(movimiento.fechaMovimiento)}</td>
                      <td className="!px-5 !py-4 !font-semibold !text-slate-800" data-label="Material">{getMovimientoMaterialNombre(movimiento)}</td>
                      <td data-label="Tipo">
                        <span className={`material-tracking__badge !inline-flex !items-center !gap-2 !px-3.5 !py-2 !shadow-sm ${movimiento.tipo === 'ENTRADA' ? '!border-emerald-200 !bg-emerald-50 !text-emerald-700' : '!border-rose-200 !bg-rose-50 !text-rose-700'}`} data-status={movimiento.tipo}>
                          <span className={`size-2 rounded-full ${movimiento.tipo === 'ENTRADA' ? 'bg-emerald-500' : 'bg-rose-500'}`} aria-hidden="true" />
                          {formatMovimientoTipo(movimiento.tipo)}
                        </span>
                      </td>
                      <td className="!px-5 !py-4 !font-bold !text-blue-700" data-label="Cantidad">{formatMovimientoCantidad(movimiento)}</td>
                      <td className="!px-5 !py-4 !text-slate-700" data-label="Responsable">{getMovimientoResponsable(movimiento)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}
