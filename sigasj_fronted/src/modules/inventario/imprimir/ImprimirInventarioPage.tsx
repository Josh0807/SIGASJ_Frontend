import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  IconCategory,
  IconFilter,
  IconPrinter,
  IconSearch,
  IconTruck,
} from '@tabler/icons-react'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'
import { InventoryFormField } from '../InventoryFormField'
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
  })

export default function ImprimirInventarioPage() {
  const [draft, setDraft] = useState<DraftFilters>(EMPTY_DRAFT)
  const [applied, setApplied] = useState<DraftFilters>(EMPTY_DRAFT)
  const [materials, setMaterials] = useState<Material[]>([])
  const [total, setTotal] = useState(0)
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
    setLoading(true)
    setError('')
    getMaterialesParaImpresion(query)
      .then((result) => {
        if (cancelled) return
        setMaterials(result.data)
        setTotal(result.total)
      })
      .catch(() => {
        if (cancelled) return
        setMaterials([])
        setTotal(0)
        setError('No fue posible cargar el inventario para imprimir. Intente nuevamente.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [query])

  const lowStock = materials.filter((item) => item.stockActual <= item.stockMinimo).length
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

  const categoriaNombre =
    categoriasResult.data.find((item) => String(item.id) === applied.categoriaId)?.nombre
  const proveedorNombre =
    proveedoresResult.data.find((item) => String(item.id) === applied.proveedorId)?.nombre

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
    <main className="gallery-admin inventario-print">
      <div className="gallery-admin__shell sigasj-stack">
        <header className="materials-admin__header inventario-print__controls">
          <div>
            <p className="materials-admin__eyebrow">Inventario · Documentos</p>
            <h1>Imprimir inventario</h1>
            <p>
              Genere un listado imprimible de materiales, existencias y ubicación para archivo de la
              ASADA.
            </p>
          </div>
        </header>

        <form
          className="materials-admin__filters materials-admin__filters--inventory inventario-print__controls"
          aria-label="Filtros del listado a imprimir"
          onSubmit={handleConsultar}
        >
          <InventoryFormField label="Buscar por nombre" icon={<IconSearch size={20} aria-hidden="true" />}>
            <input
              type="search"
              value={draft.nombre}
              maxLength={150}
              placeholder="Ej. Tubo PVC"
              onChange={(event) =>
                setDraft((current) => ({ ...current, nombre: event.target.value }))
              }
            />
          </InventoryFormField>
          <InventoryFormField label="Estado" icon={<IconFilter size={20} aria-hidden="true" />}>
            <select
              value={draft.activo}
              onChange={(event) =>
                setDraft((current) => ({ ...current, activo: event.target.value }))
              }
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </InventoryFormField>
          <InventoryFormField label="Categoría" icon={<IconCategory size={20} aria-hidden="true" />}>
            <select
              value={draft.categoriaId}
              disabled={categoriasLoading}
              onChange={(event) =>
                setDraft((current) => ({ ...current, categoriaId: event.target.value }))
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
          </InventoryFormField>
          <InventoryFormField label="Proveedor" icon={<IconTruck size={20} aria-hidden="true" />}>
            <select
              value={draft.proveedorId}
              disabled={proveedoresLoading}
              onChange={(event) =>
                setDraft((current) => ({ ...current, proveedorId: event.target.value }))
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
          </InventoryFormField>
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
              disabled={loading || (!hasActiveDraft && !hasAppliedFilters)}
            >
              Limpiar filtros
            </button>
            <button
              type="button"
              className="gallery-admin__button gallery-admin__button--primary inventario-print__action"
              onClick={handleImprimir}
              disabled={loading || Boolean(error) || materials.length === 0}
            >
              <IconPrinter size={18} aria-hidden="true" />
              Imprimir
            </button>
          </div>
        </form>

        {error ? (
          <div className="material-tracking__state material-tracking__state--error" role="alert">
            <p>{error}</p>
          </div>
        ) : null}

        {loading ? (
          <div className="materials-admin__state inventario-print__controls" role="status">
            <span className="materials-admin__spinner" />
            Cargando inventario…
          </div>
        ) : null}

        {!loading && !error && materials.length === 0 ? (
          <div className="materials-admin__empty">
            <h2>{hasAppliedFilters ? 'No hay coincidencias' : 'Aún no hay materiales'}</h2>
            <p>
              {hasAppliedFilters
                ? 'Ajuste los filtros para generar el listado a imprimir.'
                : 'Registre materiales en el catálogo para poder imprimir el inventario.'}
            </p>
          </div>
        ) : null}

        {!loading && !error && materials.length > 0 ? (
          <section className="inventario-print__sheet" aria-label="Vista previa del inventario">
            <header className="inventario-print__letterhead">
              <img src={asadaLogo} alt="" />
              <div>
                <p>ASADA San Juan</p>
                <h2>Inventario de bodega</h2>
                <p>Listado de materiales y existencias</p>
              </div>
            </header>
            <p className="inventario-print__meta">
              Generado el {formatPrintDate(printedAt)}. {total} material{total === 1 ? '' : 'es'}
              {lowStock > 0 ? ` · ${lowStock} con stock bajo o igual al mínimo` : ''}.
              {filterSummary.length > 0 ? ` Filtros: ${filterSummary.join(' · ')}.` : ''}
            </p>
            <div className="materials-admin__table-wrap inventario-print__table-wrap">
              <table>
                <caption className="visually-hidden">Listado imprimible de materiales</caption>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Categoría</th>
                    <th>Proveedor</th>
                    <th>Unidad</th>
                    <th>Ubicación</th>
                    <th>Existencia</th>
                    <th>Stock mínimo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <tr key={material.id}>
                      <td data-label="Material">
                        <strong>{material.nombre}</strong>
                        {material.descripcion ? <small>{material.descripcion}</small> : null}
                      </td>
                      <td data-label="Categoría">{material.categoria?.nombre ?? 'Sin categoría'}</td>
                      <td data-label="Proveedor">{material.proveedor?.nombre ?? 'Sin proveedor'}</td>
                      <td data-label="Unidad">{material.unidadMedida}</td>
                      <td data-label="Ubicación">{material.ubicacion || 'Sin ubicación'}</td>
                      <td
                        data-label="Existencia"
                        className={material.stockActual <= material.stockMinimo ? 'is-low' : ''}
                      >
                        {material.stockActual}
                      </td>
                      <td data-label="Stock mínimo">{material.stockMinimo}</td>
                      <td data-label="Estado">{material.activo ? 'Activo' : 'Inactivo'}</td>
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
