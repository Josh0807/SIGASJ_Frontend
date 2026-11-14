import { ZONA_HORARIA_ASADA } from '../../../shared/utils/fechaAsada'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import {
  IconAlertTriangle,
  IconCalendar,
  IconPrinter,
  IconPackages,
  IconSearch,
  IconX,
} from '@tabler/icons-react'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'
import { getMaterialesParaImpresion } from '../materialesApi'
import type { Material, MaterialesQuery } from '../types'
import { useCategorias } from '../categorias/useCategorias'
import { useProveedores } from '../proveedores/useProveedores'

type DraftFilters = {
  nombre: string
  activo: string
  categoriaId: string
  proveedorId: string
}

const EMPTY_DRAFT: DraftFilters = {
  nombre: '',
  activo: '',
  categoriaId: '',
  proveedorId: '',
}

const toQuery = (draft: DraftFilters): Omit<MaterialesQuery, 'page' | 'limit'> => ({
  nombre: draft.nombre.trim() || undefined,
  activo: draft.activo === '' ? undefined : draft.activo === 'true',
  idCategoria: draft.categoriaId ? Number(draft.categoriaId) : undefined,
  idProveedor: draft.proveedorId ? Number(draft.proveedorId) : undefined,
})

const formatPrintDate = (value: Date) =>
  value.toLocaleString('es-CR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: ZONA_HORARIA_ASADA,
  })

const formatPrecio = (value: number | null | undefined) => {
  if (value == null) return '—'
  return `₡${Number(value).toLocaleString('es-CR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const formatVencimiento = (iso: string | null | undefined) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CR', { timeZone: 'UTC' })
}

const materialCode = (id: number) => `MAT-${String(id).padStart(3, '0')}`

/** Limpia sufijos de semillas QA (p. ej. "Tubo PVC QA 1794…") para lectura. */
const displayMaterialName = (nombre: string) =>
  nombre.replace(/\s+QA\s+\d{8,}$/i, '').replace(/\s+QA$/i, '').trim() || nombre

const displayCategoryName = (nombre: string | null | undefined) => {
  if (!nombre) return 'Sin categoría'
  return nombre.replace(/\s+QA\s+\d{8,}$/i, '').trim() || nombre
}

const displayProviderName = (nombre: string | null | undefined) => {
  if (!nombre) return 'Sin proveedor'
  return nombre.replace(/\s+QA\s+\d{8,}$/i, '').trim() || nombre
}

export default function ImprimirInventarioPage() {
  const [draft, setDraft] = useState<DraftFilters>(EMPTY_DRAFT)
  const [applied, setApplied] = useState<DraftFilters>(EMPTY_DRAFT)
  const [materials, setMaterials] = useState<Material[]>([])
  const [total, setTotal] = useState(0)
  const [truncated, setTruncated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [printedAt, setPrintedAt] = useState(() => new Date())
  const { result: categoriasResult, loading: categoriasLoading } = useCategorias({
    page: 1,
    limit: 100,
  })
  const { result: proveedoresResult, loading: proveedoresLoading } = useProveedores({
    page: 1,
    limit: 100,
  })

  const query = useMemo(() => toQuery(applied), [applied])

  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Inventario de bodega — ASADA San Juan'
    return () => {
      document.title = previousTitle
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const cancelScheduled = runAfterEffect(() => {
      setLoading(true)
      setError('')
      getMaterialesParaImpresion(query)
        .then((result) => {
          if (cancelled) return
          setMaterials(result.data)
          setTotal(result.total)
          setTruncated(result.truncated)
        })
        .catch(() => {
          if (cancelled) return
          setMaterials([])
          setTotal(0)
          setError(
            'No fue posible cargar el inventario para imprimir. Intente nuevamente.',
          )
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    })
    return () => {
      cancelled = true
      cancelScheduled()
    }
  }, [query])

  const lowStock = materials.filter(
    (item) => item.stockActual <= item.stockMinimo,
  ).length
  const hasActiveDraft =
    draft.nombre.trim() !== '' ||
    draft.activo !== '' ||
    draft.categoriaId !== '' ||
    draft.proveedorId !== ''
  const hasAppliedFilters =
    applied.nombre.trim() !== '' ||
    applied.activo !== '' ||
    applied.categoriaId !== '' ||
    applied.proveedorId !== ''

  const handleConsultar = (event: FormEvent) => {
    event.preventDefault()
    setApplied({ ...draft, nombre: draft.nombre.trim() })
  }

  const handleLimpiar = () => {
    setDraft(EMPTY_DRAFT)
    setApplied(EMPTY_DRAFT)
  }

  const handleImprimir = () => {
    setPrintedAt(new Date())
    window.setTimeout(() => window.print(), 0)
  }

  const categoriaNombre = categoriasResult.data.find(
    (item) => String(item.id) === applied.categoriaId,
  )?.nombre
  const proveedorNombre = proveedoresResult.data.find(
    (item) => String(item.id) === applied.proveedorId,
  )?.nombre

  const filterSummary = [
    applied.nombre.trim() ? `Nombre: ${applied.nombre.trim()}` : null,
    applied.activo === 'true'
      ? 'Estado: Activos'
      : applied.activo === 'false'
        ? 'Estado: Inactivos'
        : null,
    categoriaNombre ? `Categoría: ${categoriaNombre}` : null,
    proveedorNombre ? `Proveedor: ${proveedorNombre}` : null,
  ].filter(Boolean)

  return (
    <main className="inventario-print" style={{ display: 'grid', gap: 14 }}>
      <header className="inv-header inv-card inventario-print__controls">
        <div>
          <h1>Imprimir inventario</h1>
          <p>
            Genere un listado imprimible de materiales, existencias y ubicación
            para archivo de la ASADA.
          </p>
        </div>
        <button
          type="button"
          className="inv-btn inv-btn--primary inventario-print__action"
          onClick={handleImprimir}
          disabled={loading || Boolean(error) || materials.length === 0}
        >
          <IconPrinter size={18} aria-hidden="true" />
          Imprimir
        </button>
      </header>

      <form
        className="inv-panel inventario-print__controls"
        aria-label="Filtros del listado a imprimir"
        onSubmit={handleConsultar}
      >
        <div className="inv-filters">
          <label>
            Buscar material
            <input
              type="search"
              value={draft.nombre}
              maxLength={150}
              placeholder="Ej. Tubo PVC"
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  nombre: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Estado
            <select
              value={draft.activo}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  activo: event.target.value,
                }))
              }
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </label>
          <label>
            Categoría
            <select
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
              {categoriasResult.data.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                  {item.activo ? '' : ' (inactiva)'}
                </option>
              ))}
            </select>
          </label>
          <label>
            Proveedor
            <select
              value={draft.proveedorId}
              disabled={proveedoresLoading}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  proveedorId: event.target.value,
                }))
              }
            >
              <option value="">Todos los proveedores</option>
              {proveedoresResult.data.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                  {item.activo ? '' : ' (inactivo)'}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="inv-panel__toolbar" style={{ marginTop: 4 }}>
          <button
            type="submit"
            className="inv-btn inv-btn--primary"
            disabled={loading}
          >
            <IconSearch size={18} aria-hidden="true" />
            {loading ? 'Consultando…' : 'Consultar'}
          </button>
          <button
            type="button"
            className="inv-btn inv-btn--secondary"
            onClick={handleLimpiar}
            disabled={loading || (!hasActiveDraft && !hasAppliedFilters)}
          >
            <IconX size={18} aria-hidden="true" />
            Limpiar filtros
          </button>
        </div>
      </form>

      {error ? (
        <div className="inv-error inventario-print__controls" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="inv-btn inv-btn--primary"
            onClick={() => setApplied((current) => ({ ...current }))}
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {!loading && !error && truncated ? (
        <div className="inv-error inventario-print__controls" role="alert">
          <IconAlertTriangle size={18} aria-hidden="true" />
          Se muestran {materials.length} de {total} materiales (máx. 5000).
          Aplique filtros para acotar antes de imprimir.
        </div>
      ) : null}

      {loading ? (
        <div
          className="inv-state inventario-print__controls"
          role="status"
        >
          Cargando inventario…
        </div>
      ) : null}

      {!loading && !error && materials.length === 0 ? (
        <div className="inv-empty">
          <h2 style={{ margin: '0 0 8px', color: 'var(--inv-ink, #123f70)' }}>
            {hasAppliedFilters ? 'No hay coincidencias' : 'Aún no hay materiales'}
          </h2>
          <p style={{ margin: 0 }}>
            {hasAppliedFilters
              ? 'Ajuste los filtros para generar el listado a imprimir.'
              : 'Registre materiales en el catálogo para poder imprimir el inventario.'}
          </p>
        </div>
      ) : null}

      {!loading && !error && materials.length > 0 ? (
        <section
          className="inventario-print__sheet inv-print-sheet"
          aria-label="Vista previa del inventario"
        >
          <header className="inv-print-sheet__top">
            <div className="inv-print-sheet__brand">
              <img src={asadaLogo} alt="" className="inv-print-sheet__logo" />
              <div className="inv-print-sheet__titles">
                <p className="inv-print-sheet__org">ASADA San Juan</p>
                <h2>Inventario de bodega</h2>
                <p className="inv-print-sheet__tag">
                  Listado de materiales y existencias
                </p>
              </div>
            </div>

            <div className="inv-print-sheet__meta" aria-label="Resumen del listado">
              <article>
                <IconCalendar size={16} aria-hidden="true" />
                <div>
                  <small>Generado</small>
                  <strong>{formatPrintDate(printedAt)}</strong>
                </div>
              </article>
              <article>
                <IconPackages size={16} aria-hidden="true" />
                <div>
                  <small>Materiales</small>
                  <strong>
                    {total} registrado{total === 1 ? '' : 's'}
                  </strong>
                </div>
              </article>
              <article className={lowStock > 0 ? 'is-warn' : 'is-ok'}>
                <IconAlertTriangle size={16} aria-hidden="true" />
                <div>
                  <small>Stock bajo</small>
                  <strong>
                    {lowStock} con stock bajo
                  </strong>
                  {truncated ? (
                    <span className="inv-print-sheet__hint">
                      de {materials.length} mostrados
                    </span>
                  ) : null}
                </div>
              </article>
            </div>
          </header>

          {filterSummary.length > 0 ? (
            <p className="inv-print-sheet__filters">
              <strong>Filtros:</strong> {filterSummary.join(' · ')}
            </p>
          ) : null}

          <div className="inv-table-wrap inventario-print__table-wrap inv-print-sheet__table">
            <table className="inv-table">
              <caption className="visually-hidden">
                Listado imprimible de materiales
              </caption>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Material</th>
                  <th>Categoría</th>
                  <th>Proveedor</th>
                  <th>Unidad</th>
                  <th>Ubicación</th>
                  <th>Existencia</th>
                  <th>Mínimo</th>
                  <th>Precio</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => {
                  const low = material.stockActual <= material.stockMinimo
                  const isSeedDesc =
                    material.descripcion?.toLowerCase().includes('prueba automática') ||
                    material.descripcion?.toLowerCase().includes('auditoría de inventario')
                  return (
                    <tr key={material.id}>
                      <td data-label="Código">
                        <code>{materialCode(material.id)}</code>
                      </td>
                      <td data-label="Material">
                        <strong>{displayMaterialName(material.nombre)}</strong>
                        {material.descripcion && !isSeedDesc ? (
                          <small className="inv-print-sheet__desc">
                            {material.descripcion}
                          </small>
                        ) : null}
                      </td>
                      <td data-label="Categoría">
                        {displayCategoryName(material.categoria?.nombre)}
                      </td>
                      <td data-label="Proveedor">
                        {displayProviderName(material.proveedor?.nombre)}
                      </td>
                      <td data-label="Unidad">{material.unidadMedida}</td>
                      <td data-label="Ubicación">
                        {material.ubicacion || 'Sin ubicación'}
                      </td>
                      <td data-label="Existencia">
                        <span
                          className={`inv-badge ${low ? 'inv-badge--low' : 'inv-badge--ok'}`}
                        >
                          {material.stockActual}
                        </span>
                      </td>
                      <td data-label="Mínimo">{material.stockMinimo}</td>
                      <td data-label="Precio">
                        {formatPrecio(material.precioUnitario)}
                      </td>
                      <td data-label="Vencimiento">
                        {formatVencimiento(material.fechaVencimiento)}
                      </td>
                      <td data-label="Estado">
                        <span
                          className={`inv-badge ${material.activo ? 'inv-badge--ok' : 'inv-badge--inactive'}`}
                        >
                          {material.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <footer className="inv-print-sheet__footer">
            Documento generado por SIGASJ · ASADA San Juan
          </footer>
        </section>
      ) : null}
    </main>
  )
}
