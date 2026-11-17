import type { FormEvent } from 'react'
import { useState } from 'react'
import {
  IconAlertTriangle,
  IconCalendarX,
  IconCategory,
  IconEraser,
  IconPackage,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import IndicatorCard from '../../../shared/components/IndicatorCard'
import {
  AdminFilterField,
  AdminFilters,
  AdminShell,
  Alert,
  Button,
  EmptyState,
  PageHeader,
  adminFilterControlClassName,
  adminFilterSelectClassName,
} from '../../../shared/ui'
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
  const [reportGeneratedAt] = useState(() => Date.now())
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
    <AdminShell
      className="inv-reportes"
      aria-labelledby="reportes-inventario-title"
    >
      <PageHeader
        id="reportes-inventario-title"
        eyebrow="Inventario · Administración"
        title="Reportes de inventario"
        description="Consulte indicadores y movimientos del inventario. Los cálculos provienen del servidor."
      />

      <form
        aria-label="Filtros del reporte de inventario"
        onSubmit={handleConsultar}
        noValidate
      >
        <AdminFilters
          className="!grid-cols-1"
          summary={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="submit"
                disabled={loading}
                leftIcon={<IconSearch size={18} aria-hidden="true" />}
              >
                {loading ? 'Consultando…' : 'Consultar'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleLimpiar}
                disabled={
                  loading ||
                  (!hasActiveDraft && Object.keys(applied).length === 0)
                }
                leftIcon={<IconEraser size={18} aria-hidden="true" />}
              >
                Limpiar filtros
              </Button>
            </div>
          }
        >
          <AdminFilterField label="Fecha inicial">
            <input
              id="reporte-fecha-desde"
              type="date"
              className={adminFilterControlClassName}
              value={draft.fechaDesde}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fechaDesde: event.target.value,
                }))
              }
            />
          </AdminFilterField>

          <AdminFilterField label="Fecha final">
            <input
              id="reporte-fecha-hasta"
              type="date"
              className={adminFilterControlClassName}
              value={draft.fechaHasta}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  fechaHasta: event.target.value,
                }))
              }
            />
          </AdminFilterField>

          <AdminFilterField label="Material">
            <select
              id="reporte-material"
              className={adminFilterSelectClassName}
              value={draft.materialId}
              disabled={materialesLoading}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  materialId: event.target.value,
                }))
              }
            >
              <option value="">Todos los materiales</option>
              {(materialesResult?.data ?? []).map((material) => (
                <option key={material.id} value={material.id}>
                  {material.nombre}
                </option>
              ))}
            </select>
          </AdminFilterField>

          <AdminFilterField label="Categoría">
            <select
              id="reporte-categoria"
              className={adminFilterSelectClassName}
              value={draft.categoriaId}
              disabled={categoriasLoading}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  categoriaId: event.target.value,
                }))
              }
            >
              <option value="">Todas las categorías</option>
              {(categoriasResult?.data ?? []).map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </AdminFilterField>

          <AdminFilterField label="Tipo de movimiento">
            <select
              id="reporte-tipo"
              className={adminFilterSelectClassName}
              value={draft.tipo}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  tipo: event.target.value as TipoMovimientoInventario | '',
                }))
              }
            >
              <option value="">Todos los tipos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SALIDA">Salidas</option>
            </select>
          </AdminFilterField>
        </AdminFilters>
      </form>

        {filterError ? (
          <Alert tone="danger" title="No se pudo consultar el reporte">
            <p className="m-0 mb-3">{filterError}</p>
            <Button
              size="sm"
              onClick={() => {
                setClientError('')
                refetch()
              }}
              leftIcon={<IconRefresh size={16} aria-hidden="true" />}
            >
              {ADMIN_COPY.retry}
            </Button>
          </Alert>
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
            <IndicatorCard
              title="Valor total estimado"
              value={loading ? null : reporte.indicadores.valorTotalInventario != null ? `₡${Number(reporte.indicadores.valorTotalInventario).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : null}
              isLoading={loading}
              description="Suma de stock × precio unitario (materiales con precio registrado)"
              fallbackText="Sin precios"
              badgeText="Valor"
              badgeType="info"
            />
            <IndicatorCard
              title="Próximos a vencer"
              value={loading ? null : reporte.indicadores.materialesPorVencer ?? 0}
              isLoading={loading}
              description="Materiales con vencimiento en los próximos 90 días"
              badgeText="Vencimiento"
              badgeType={reporte.indicadores.materialesPorVencer ? 'warning' : 'success'}
            />
          </div>
        </section>

        {showEmpty ? (
          <EmptyState
            icon={<IconPackage size={30} aria-hidden="true" />}
            title="No se encontraron datos"
            description="No hay información de inventario para los criterios seleccionados."
          />
        ) : null}

        {!loading && reporte.porCategoria.length > 0 ? (
          <section className="material-tracking__table-wrap inventario-reportes__category-summary" aria-labelledby="reporte-categorias-title">
            <header className="inventario-reportes__category-heading">
              <span className="inventario-reportes__category-icon" aria-hidden="true">
                <IconCategory size={26} />
              </span>
              <div>
                <h2 className="!m-0 !text-xl !font-extrabold !leading-[1.35] !tracking-[-0.015em] !text-[#1e5a9c]" id="reporte-categorias-title">Resumen por categoría</h2>
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

        {!loading && reporte.proximosVencer && reporte.proximosVencer.length > 0 ? (
          <section className="material-tracking__table-wrap inventario-reportes__category-summary" aria-labelledby="reporte-vencimiento-title">
            <header className="inventario-reportes__category-heading">
              <span className="inventario-reportes__category-icon" aria-hidden="true" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' }}>
                <IconCalendarX size={26} />
              </span>
              <div>
                <h2 className="!m-0 !text-xl !font-extrabold !leading-[1.35] !tracking-[-0.015em] !text-[#1e5a9c]" id="reporte-vencimiento-title">Materiales próximos a vencer</h2>
                <p className="!mt-1.5 !mb-0 !text-[0.9375rem] !font-normal !leading-6 !text-slate-500">Materiales con fecha de vencimiento en los próximos 90 días — revise existencias de químicos.</p>
              </div>
            </header>
            <div className="inventario-reportes__category-table">
              <table>
                <caption className="visually-hidden">Materiales próximos a vencer</caption>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Existencia</th>
                    <th>Unidad</th>
                    <th>Vence</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.proximosVencer.map((item) => {
                    const dias = Math.ceil((new Date(item.fechaVencimiento).getTime() - reportGeneratedAt) / 86_400_000)
                    const urgente = dias <= 30
                    return (
                      <tr key={item.id}>
                        <td data-label="Material"><strong>{item.nombre}</strong></td>
                        <td data-label="Existencia"><span className="inventario-reportes__metric-badge is-total">{item.stockActual} {item.unidadMedida}</span></td>
                        <td data-label="Unidad">{item.unidadMedida}</td>
                        <td data-label="Vence">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${urgente ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                            {urgente && <IconAlertTriangle size={13} aria-hidden="true" />}
                            {new Date(item.fechaVencimiento).toLocaleDateString('es-CR', { timeZone: 'UTC' })}
                            {' '}({dias} día{dias === 1 ? '' : 's'})
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {!loading && reporte.movimientos.length > 0 ? (
          <section className="inv-panel" aria-labelledby="reporte-movimientos-title">
            <div className="inv-panel__heading">
              <div>
                <h2 id="reporte-movimientos-title">Movimientos del periodo</h2>
                <p>Detalle de entradas y salidas según los filtros aplicados.</p>
              </div>
            </div>
            <div className="inv-table-wrap">
              <table className="inv-table">
                <caption className="visually-hidden">Movimientos del reporte</caption>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Material</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.movimientos.map((movimiento) => (
                    <tr key={movimiento.id}>
                      <td data-label="Fecha">{formatMovimientoFecha(movimiento.fechaMovimiento)}</td>
                      <td data-label="Material">
                        <strong>{getMovimientoMaterialNombre(movimiento)}</strong>
                      </td>
                      <td data-label="Tipo">
                        <span
                          className={
                            movimiento.tipo === 'ENTRADA'
                              ? 'inv-badge inv-badge--ok'
                              : 'inv-badge inv-badge--low'
                          }
                        >
                          {formatMovimientoTipo(movimiento.tipo)}
                        </span>
                      </td>
                      <td data-label="Cantidad">
                        <strong>{formatMovimientoCantidad(movimiento)}</strong>
                      </td>
                      <td data-label="Responsable">
                        {getMovimientoResponsable(movimiento)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
    </AdminShell>
  )
}
