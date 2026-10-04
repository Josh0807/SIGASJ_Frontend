import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/components/AuthContext'
import { InternalAdminRoleName, normalizeInternalRole } from '../auth/utils/internalRoles'
import { materialEditPath } from './inventarioPaths'
import { parseMaterialEstadoError } from './materialEstadoError'
import { updateMaterialEstado } from './materialesApi'
import MaterialStateAction from './MaterialStateAction'
import type { Material } from './types'
import { useMateriales } from './useMateriales'
import { useCategorias } from './categorias/useCategorias'
import { useProveedores } from './proveedores/useProveedores'
import { IconCategory, IconCircleCheckFilled, IconCircleXFilled, IconFilter, IconPencil, IconSearch, IconTruck } from '@tabler/icons-react'

const PAGE_SIZE = 10

export default function MaterialesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [nombre, setNombre] = useState('')
  const [activo, setActivo] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [proveedorId, setProveedorId] = useState('')
  const [page, setPage] = useState(1)
  const [changingId, setChangingId] = useState<number | null>(null)
  const [actionMessage, setActionMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const latestSearch = useRef('')
  const { user, logout } = useAuth()
  const currentRole = normalizeInternalRole(user?.role)
  const canManage = currentRole === InternalAdminRoleName.Administradora

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const value = searchInput.trim()
      if (value !== latestSearch.current) { latestSearch.current = value; setNombre(value); setPage(1) }
    }, 400)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const { result, loading, error, refetch } = useMateriales({ nombre: nombre || undefined, activo: activo === '' ? undefined : activo === 'true', idCategoria: categoriaId ? Number(categoriaId) : undefined, idProveedor: proveedorId ? Number(proveedorId) : undefined, page, limit: PAGE_SIZE })
  const { result: categorias, loading: categoriasLoading, error: categoriasError, refetch: refetchCategorias } = useCategorias({ page: 1, limit: 100 })
  const { result: proveedores, loading: proveedoresLoading, error: proveedoresError, refetch: refetchProveedores } = useProveedores({ page: 1, limit: 100 })
  const filtered = Boolean(searchInput.trim() || activo || categoriaId || proveedorId)

  const handleStateChange = async (material: Material, nextActivo: boolean) => {
    if (changingId !== null) return
    setChangingId(material.id); setActionMessage(null)
    try {
      await updateMaterialEstado(material.id, nextActivo)
      setActionMessage({ kind: 'success', text: `El material «${material.nombre}» fue ${nextActivo ? 'reactivado' : 'desactivado'} correctamente.` })
      refetch()
    } catch (caught) {
      const parsed = parseMaterialEstadoError(caught)
      setActionMessage({ kind: 'error', text: parsed.message })
      if (parsed.status === 404) refetch()
      if (parsed.status === 401) logout()
    } finally { setChangingId(null) }
  }

  const clearFilters = () => { setSearchInput(''); latestSearch.current = ''; setNombre(''); setActivo(''); setCategoriaId(''); setProveedorId(''); setPage(1) }

  return <main className="materials-admin sigasj-stack !gap-6">
    <header className="materials-admin__header !flex !min-h-[220px] !items-center !rounded-[24px] !border-sky-100 !bg-white !p-8 lg:!pr-[310px]"><div><p className="materials-admin__eyebrow !mb-4 !text-sm !font-extrabold !tracking-[0.12em] !text-blue-600">Inventario · Bodega</p><div className="flex flex-wrap items-center gap-4"><h1 className="!m-0 !text-4xl !font-black !tracking-tight !text-[#062e63]">Catálogo de materiales</h1><span className="materials-admin__count !rounded-full !border-0 !bg-blue-50 !px-4 !py-2 !text-sm !font-extrabold !text-blue-700">{result.total} materiales</span></div><p className="!mt-4 !max-w-xl !text-lg !leading-8 !text-slate-500">Consulte existencias, ubicación y niveles mínimos de los materiales registrados.</p></div></header>
    <section className="materials-admin__filters materials-admin__filters--inventory !gap-5 !rounded-[22px] !border-sky-100 !bg-white !p-7" aria-label="Búsqueda y filtros"><label><span className="!flex !items-center !gap-2"><span className="grid size-8 place-items-center rounded-lg bg-sky-50 text-blue-600"><IconSearch size={18} aria-hidden="true" /></span>Buscar por nombre</span><input className="!min-h-[56px] !rounded-xl !border-slate-200 !px-5 !text-base" type="search" value={searchInput} maxLength={150} placeholder="Ej. Tubo PVC" onChange={(event) => setSearchInput(event.target.value)} /></label><label><span className="!flex !items-center !gap-2"><span className="grid size-8 place-items-center rounded-lg bg-sky-50 text-blue-600"><IconFilter size={18} aria-hidden="true" /></span>Estado</span><select className="!min-h-[56px] !rounded-xl !border-slate-200 !px-5 !text-base" value={activo} onChange={(event) => { setActivo(event.target.value); setPage(1) }}><option value="">Todos</option><option value="true">Activos</option><option value="false">Inactivos</option></select></label><label><span className="!flex !items-center !gap-2"><span className="grid size-8 place-items-center rounded-lg bg-sky-50 text-blue-600"><IconCategory size={18} aria-hidden="true" /></span>Categoría</span><select className="!min-h-[56px] !rounded-xl !border-slate-200 !px-5 !text-base" value={categoriaId} disabled={categoriasLoading} onChange={(event) => { setCategoriaId(event.target.value); setPage(1) }}><option value="">Todas las categorías</option>{categorias.data.map((item) => <option key={item.id} value={item.id}>{item.nombre}{item.activo ? '' : ' (inactiva)'}</option>)}</select></label><label><span className="!flex !items-center !gap-2"><span className="grid size-8 place-items-center rounded-lg bg-sky-50 text-blue-600"><IconTruck size={18} aria-hidden="true" /></span>Proveedor</span><select className="!min-h-[56px] !rounded-xl !border-slate-200 !px-5 !text-base" value={proveedorId} disabled={proveedoresLoading} onChange={(event) => { setProveedorId(event.target.value); setPage(1) }}><option value="">Todos los proveedores</option>{proveedores.data.map((item) => <option key={item.id} value={item.id}>{item.nombre}{item.activo ? '' : ' (inactivo)'}</option>)}</select></label>{filtered && <button type="button" className="materials-admin__secondary" onClick={clearFilters}>Limpiar filtros</button>}{categoriasError && <div className="materials-admin__category-error" role="alert">No fue posible cargar el filtro de categorías. <button type="button" onClick={refetchCategorias}>Reintentar</button></div>}{proveedoresError && <div className="materials-admin__category-error" role="alert">No fue posible cargar el filtro de proveedores. <button type="button" onClick={refetchProveedores}>Reintentar</button></div>}</section>
    {actionMessage && <div className={actionMessage.kind === 'success' ? 'materials-admin__success' : 'materials-admin__error'} role={actionMessage.kind === 'error' ? 'alert' : 'status'}>{actionMessage.text}</div>}
    {loading && <div className="materials-admin__state" role="status"><span className="materials-admin__spinner" />Cargando materiales…</div>}
    {!loading && error && <div className="materials-admin__error" role="alert"><p>{error}</p><button type="button" onClick={refetch}>Reintentar</button></div>}
    {!loading && !error && result.data.length === 0 && <div className="materials-admin__empty"><h2>{filtered ? 'No hay coincidencias' : 'Aún no hay materiales'}</h2><p>{filtered ? 'Pruebe con otros términos o limpie los filtros.' : 'Los materiales registrados aparecerán aquí.'}</p></div>}
    {!loading && !error && result.data.length > 0 && <MaterialTable materials={result.data} canManage={canManage} changingId={changingId} onStateChange={handleStateChange} />}
    {!loading && !error && result.totalPages > 0 && <nav className="materials-admin__pagination" aria-label="Paginación de materiales"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Anterior</button><span>Página {page} de {result.totalPages}</span><button type="button" disabled={page >= result.totalPages} onClick={() => setPage((value) => Math.min(result.totalPages, value + 1))}>Siguiente</button></nav>}
  </main>
}

type TableProps = { materials: Material[]; canManage: boolean; changingId: number | null; onStateChange: (material: Material, activo: boolean) => Promise<void> }

function MaterialTable({ materials, canManage, changingId, onStateChange }: TableProps) {
  return <div className="materials-admin__table-wrap overflow-x-auto !rounded-[22px] !border-sky-100 !bg-white !shadow-[0_12px_30px_rgba(30,90,156,0.07)] [&_thead]:!bg-slate-50/80 [&_th]:!py-5 [&_th]:!text-xs [&_th]:!tracking-[0.04em] [&_td]:!py-5"><table><caption className="visually-hidden">Listado de materiales</caption><thead><tr><th>Material</th><th>Categoría</th><th>Proveedor</th><th>Unidad</th><th>Ubicación</th><th>Existencia</th><th>Stock mínimo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{materials.map((material) => <tr key={material.id}><td data-label="Material"><strong>{material.nombre}</strong>{material.descripcion && <small>{material.descripcion}</small>}</td><td data-label="Categoría">{material.categoria?.nombre ?? 'Sin categoría'}</td><td data-label="Proveedor"><strong>{material.proveedor?.nombre ?? 'Sin proveedor'}</strong>{material.proveedor && !material.proveedor.activo && <small>Proveedor inactivo</small>}</td><td data-label="Unidad">{material.unidadMedida}</td><td data-label="Ubicación">{material.ubicacion || 'Sin ubicación'}</td><td data-label="Existencia" className={material.stockActual <= material.stockMinimo ? 'is-low' : ''}>{material.stockActual}</td><td data-label="Stock mínimo">{material.stockMinimo}</td><td data-label="Estado"><span className={`materials-admin__badge !inline-flex !items-center !gap-1.5 !rounded-full !border !px-3 !py-1.5 !text-xs !font-extrabold !shadow-sm ${material.activo ? 'is-active !border-emerald-200 !bg-emerald-50 !text-emerald-700' : 'is-inactive !border-slate-200 !bg-slate-100 !text-slate-600'}`}>{material.activo ? <IconCircleCheckFilled className="text-emerald-500" size={14} aria-hidden="true" /> : <IconCircleXFilled className="text-slate-400" size={14} aria-hidden="true" />}{material.activo ? 'Activo' : 'Inactivo'}</span></td><td data-label="Acciones"><div className="materials-admin__row-actions !flex-nowrap !items-center !gap-2 max-[760px]:!flex-col">{canManage ? <><Link className="materials-admin__action !inline-flex !min-h-11 !items-center !justify-center !gap-2 !whitespace-nowrap !rounded-xl !border-blue-600 !bg-blue-600 !px-4 !text-sm !font-extrabold !text-white !shadow-[0_7px_16px_rgba(37,99,235,0.2)] !transition hover:!-translate-y-0.5 hover:!bg-blue-700 focus-visible:!outline-2 focus-visible:!outline-offset-2 focus-visible:!outline-blue-700" to={materialEditPath(material.id)} state={{ material }}><IconPencil size={17} stroke={2} aria-hidden="true" />Ver / Editar</Link><MaterialStateAction material={material} disabled={changingId !== null} onChange={onStateChange} /></> : <span>Solo lectura</span>}</div></td></tr>)}</tbody></table></div>
}
