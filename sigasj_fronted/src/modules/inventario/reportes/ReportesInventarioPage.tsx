import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import IndicatorCard from '../../../shared/components/IndicatorCard'
import { MATERIALES_PATH } from '../inventarioPaths'
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
        <header className="gallery-admin__header">
          <div>
            <span className="gallery-admin__eyebrow">Inventario · Administración</span>
            <h1>Reportes de inventario</h1>
            <p>
              Consulte indicadores y movimientos del inventario. Los cálculos provienen del servidor.
            </p>
          </div>
          <div className="gallery-admin__header-actions">
            <Link className="gallery-admin__link" to={MATERIALES_PATH}>
              Volver al catálogo
            </Link>
          </div>
        </header>

        <form
          className="gallery-admin__filters"
          aria-label="Filtros del reporte de inventario"
          onSubmit={handleConsultar}
          noValidate
        >
          <label className="gallery-admin__field" htmlFor="reporte-fecha-desde">
            <span>Fecha inicial</span>
            <input
              id="reporte-fecha-desde"
              type="date"
              value={draft.fechaDesde}
              onChange={(event) =>
                setDraft((current) => ({ ...current, fechaDesde: event.target.value }))
              }
            />
          </label>

          <label className="gallery-admin__field" htmlFor="reporte-fecha-hasta">
            <span>Fecha final</span>
            <input
              id="reporte-fecha-hasta"
              type="date"
              value={draft.fechaHasta}
              onChange={(event) =>
                setDraft((current) => ({ ...current, fechaHasta: event.target.value }))
              }
            />
          </label>

          <label className="gallery-admin__field" htmlFor="reporte-material">
            <span>Material</span>
            <select
              id="reporte-material"
              value={draft.materialId}
              disabled={materialesLoading}
              onChange={(event) =>
                setDraft((current) => ({ ...current, materialId: event.target.value }))
              }
            >
              <option value="">Todos</option>
              {(materialesResult?.data ?? []).map((material) => (
                <option key={material.id} value={material.id}>{material.nombre}</option>
              ))}
            </select>
          </label>

          <label className="gallery-admin__field" htmlFor="reporte-categoria">
            <span>Categoría</span>
            <select
              id="reporte-categoria"
              value={draft.categoriaId}
              disabled={categoriasLoading}
              onChange={(event) =>
                setDraft((current) => ({ ...current, categoriaId: event.target.value }))
              }
            >
              <option value="">Todas</option>
              {(categoriasResult?.data ?? []).map((categoria) => (
                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
              ))}
            </select>
          </label>

          <label className="gallery-admin__field" htmlFor="reporte-tipo">
            <span>Tipo de movimiento</span>
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
              <option value="">Todos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SALIDA">Salidas</option>
            </select>
          </label>

          <div className="actividades-admin-reportes__actions">
            <button
              type="submit"
              className="gallery-admin__button gallery-admin__button--primary"
              disabled={loading}
            >
              {loading ? 'Consultando…' : 'Consultar'}
            </button>
            <button
              type="button"
              className="gallery-admin__button gallery-admin__filter-reset"
              onClick={handleLimpiar}
              disabled={loading || (!hasActiveDraft && Object.keys(applied).length === 0)}
            >
              Limpiar filtros
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
          <section className="material-tracking__table-wrap" aria-labelledby="reporte-categorias-title">
            <h2 id="reporte-categorias-title">Resumen por categoría</h2>
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
                    <td data-label="Categoría">{item.nombre}</td>
                    <td data-label="Materiales">{item.totalMateriales}</td>
                    <td data-label="Stock bajo">{item.materialesStockBajo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {!loading && reporte.movimientos.length > 0 ? (
          <section className="material-tracking" aria-labelledby="reporte-movimientos-title">
            <header className="material-tracking__header">
              <div>
                <h2 id="reporte-movimientos-title">Movimientos del periodo</h2>
                <p>Detalle de entradas y salidas según los filtros aplicados.</p>
              </div>
            </header>
            <div className="material-tracking__table-wrap">
              <table>
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
                      <td data-label="Material">{getMovimientoMaterialNombre(movimiento)}</td>
                      <td data-label="Tipo">
                        <span className="material-tracking__badge" data-status={movimiento.tipo}>
                          {formatMovimientoTipo(movimiento.tipo)}
                        </span>
                      </td>
                      <td data-label="Cantidad">{formatMovimientoCantidad(movimiento)}</td>
                      <td data-label="Responsable">{getMovimientoResponsable(movimiento)}</td>
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
