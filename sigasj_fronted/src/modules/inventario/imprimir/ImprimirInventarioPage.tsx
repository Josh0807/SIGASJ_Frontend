import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  IconAlertTriangle,
  IconCalendar,
  IconCategory,
  IconEraser,
  IconFilter,
  IconPrinter,
  IconPackages,
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
          <div className="actividades-admin-reportes__actions [&>button]:inline-flex [&>button]:items-center [&>button]:justify-center [&>button]:gap-2.5">
            <button
              type="submit"
              className="group relative isolate overflow-hidden gallery-admin__button gallery-admin__button--primary !min-h-14 !rounded-2xl !border-0 !bg-gradient-to-r !from-blue-700 !via-blue-600 !to-cyan-500 !px-7 !text-white !shadow-[0_10px_24px_rgba(29,78,216,0.28)] transform-gpu transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:!shadow-[0_16px_32px_rgba(29,78,216,0.36)] active:translate-y-0 active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-none motion-reduce:transform-none motion-reduce:transition-none"
              disabled={loading}
            >
              <span className="absolute inset-0 -translate-x-[140%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[140%] motion-reduce:hidden" aria-hidden="true" />
              <IconSearch className="relative transition-transform duration-300 group-hover:scale-110" size={20} aria-hidden="true" />
              <span className="relative">{loading ? 'Consultando…' : 'Consultar'}</span>
            </button>
            <button
              type="button"
              className="group gallery-admin__button gallery-admin__filter-reset !min-h-14 !rounded-2xl !border !border-blue-200 !bg-white/90 !px-7 !text-blue-700 !shadow-[0_8px_20px_rgba(15,71,139,0.10)] backdrop-blur-sm transform-gpu transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(15,71,139,0.18)] active:translate-y-0 active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-none motion-reduce:transform-none motion-reduce:transition-none"
              onClick={handleLimpiar}
              disabled={loading || (!hasActiveDraft && !hasAppliedFilters)}
            >
              <IconEraser className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transform-none" size={20} aria-hidden="true" />
              <span>Limpiar filtros</span>
            </button>
            <button
              type="button"
              className="group relative isolate overflow-hidden gallery-admin__button gallery-admin__button--primary inventario-print__action !min-h-14 !rounded-2xl !border-0 !bg-gradient-to-r !from-sky-600 !via-blue-600 !to-indigo-700 !px-7 !text-white !shadow-[0_10px_24px_rgba(30,64,175,0.28)] transform-gpu transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:!shadow-[0_16px_32px_rgba(30,64,175,0.36)] active:translate-y-0 active:scale-[0.97] focus-visible:ring-4 focus-visible:ring-blue-200 focus-visible:ring-offset-2 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:shadow-none motion-reduce:transform-none motion-reduce:transition-none"
              onClick={handleImprimir}
              disabled={loading || Boolean(error) || materials.length === 0}
            >
              <span className="absolute inset-0 -translate-x-[140%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[140%] motion-reduce:hidden" aria-hidden="true" />
              <IconPrinter className="relative transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none" size={20} aria-hidden="true" />
              <span className="relative">Imprimir</span>
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
          <section className="inventario-print__sheet !overflow-hidden !rounded-3xl !border-blue-100 !p-0 !shadow-[0_18px_45px_rgba(18,63,112,0.12)]" aria-label="Vista previa del inventario">
            <header className="inventario-print__letterhead !mb-0 !gap-5 !border-b-blue-100 !bg-gradient-to-br !from-white !via-blue-50/80 !to-cyan-50/70 !px-7 !py-6">
              <span className="grid size-20 shrink-0 place-items-center rounded-2xl border border-blue-100 bg-white p-2 shadow-lg shadow-blue-900/10">
                <img className="!size-full !rounded-xl" src={asadaLogo} alt="" />
              </span>
              <div>
                <p className="!text-xs !font-bold !uppercase !tracking-[0.16em] !text-blue-600">ASADA San Juan</p>
                <h2 className="!my-1 !text-2xl !font-extrabold !tracking-tight !text-slate-800">Inventario de bodega</h2>
                <p className="!text-sm !text-slate-600">Listado actualizado de materiales y existencias</p>
              </div>
            </header>
            <div className="inventario-print__meta !m-0 grid gap-3 !px-7 !py-5 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <IconCalendar className="shrink-0 text-blue-600" size={22} aria-hidden="true" />
                <div><small className="block font-bold uppercase tracking-wide text-slate-500">Generado</small><strong className="text-slate-700">{formatPrintDate(printedAt)}</strong></div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3">
                <IconPackages className="shrink-0 text-blue-600" size={22} aria-hidden="true" />
                <div><small className="block font-bold uppercase tracking-wide text-blue-500">Materiales</small><strong className="text-blue-800">{total} registrado{total === 1 ? '' : 's'}</strong></div>
              </div>
              <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${lowStock > 0 ? 'border-amber-200 bg-amber-50/90' : 'border-emerald-200 bg-emerald-50/80'}`}>
                <IconAlertTriangle className={`shrink-0 ${lowStock > 0 ? 'text-amber-600' : 'text-emerald-600'}`} size={22} aria-hidden="true" />
                <div><small className="block font-bold uppercase tracking-wide text-slate-500">Stock bajo</small><strong className={lowStock > 0 ? 'text-amber-800' : 'text-emerald-800'}>{lowStock} con stock bajo</strong></div>
              </div>
              {filterSummary.length > 0 ? <p className="!m-0 text-sm text-slate-500 sm:col-span-3"><strong>Filtros:</strong> {filterSummary.join(' · ')}</p> : null}
            </div>
            <div className="materials-admin__table-wrap inventario-print__table-wrap !mx-7 !mb-7 !overflow-hidden !rounded-2xl !border-blue-100 !shadow-sm">
              <table className="w-full">
                <caption className="visually-hidden">Listado imprimible de materiales</caption>
                <thead>
                  <tr>
                    <th className="!bg-slate-50 !py-4 !text-xs !tracking-wider !text-slate-600">Material</th>
                    <th className="!bg-slate-50 !py-4 !text-xs !tracking-wider !text-slate-600">Categoría</th>
                    <th className="!bg-slate-50 !py-4 !text-xs !tracking-wider !text-slate-600">Proveedor</th>
                    <th className="!bg-slate-50 !py-4 !text-xs !tracking-wider !text-slate-600">Unidad</th>
                    <th className="!bg-slate-50 !py-4 !text-xs !tracking-wider !text-slate-600">Ubicación</th>
                    <th className="!bg-slate-50 !py-4 !text-xs !tracking-wider !text-slate-600">Existencia</th>
                    <th className="!bg-slate-50 !py-4 !text-xs !tracking-wider !text-slate-600">Stock mínimo</th>
                    <th className="!bg-slate-50 !py-4 !text-xs !tracking-wider !text-slate-600">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <tr className="transition-colors duration-200 odd:bg-white even:bg-slate-50/40 hover:!bg-blue-50/70" key={material.id}>
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
                        <span className={`inline-grid min-w-10 place-items-center rounded-full px-3 py-1 font-extrabold ${material.stockActual <= material.stockMinimo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{material.stockActual}</span>
                      </td>
                      <td data-label="Stock mínimo">{material.stockMinimo}</td>
                      <td data-label="Estado"><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${material.activo ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'}`}><span className={`size-2 rounded-full ${material.activo ? 'bg-emerald-500' : 'bg-slate-400'}`} aria-hidden="true" />{material.activo ? 'Activo' : 'Inactivo'}</span></td>
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
