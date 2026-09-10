import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/components/AuthContext'
import { InternalAdminRoleName, normalizeInternalRole } from '../auth/utils/internalRoles'
import { CATEGORIAS_PATH, MATERIAL_NEW_PATH, materialEditPath } from './inventarioPaths'
import { parseMaterialEstadoError } from './materialEstadoError'
import { updateMaterialEstado } from './materialesApi'
import MaterialStateAction from './MaterialStateAction'
import type { Material } from './types'
import { useMateriales } from './useMateriales'
import { useCategorias } from './categorias/useCategorias'

const PAGE_SIZE = 10

export default function MaterialesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [nombre, setNombre] = useState('')
  const [activo, setActivo] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [page, setPage] = useState(1)
  const [changingId, setChangingId] = useState<number | null>(null)
  const [actionMessage, setActionMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const latestSearch = useRef('')
  const { user, logout } = useAuth()
  const canManage = normalizeInternalRole(user?.role) === InternalAdminRoleName.Administradora

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const value = searchInput.trim()
      if (value !== latestSearch.current) { latestSearch.current = value; setNombre(value); setPage(1) }
    }, 400)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const { result, loading, error, refetch } = useMateriales({ nombre: nombre || undefined, activo: activo === '' ? undefined : activo === 'true', idCategoria: categoriaId ? Number(categoriaId) : undefined, page, limit: PAGE_SIZE })
  const { result: categorias, loading: categoriasLoading, error: categoriasError, refetch: refetchCategorias } = useCategorias({ page: 1, limit: 100 })
  const filtered = Boolean(searchInput.trim() || activo || categoriaId)

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

  const clearFilters = () => { setSearchInput(''); latestSearch.current = ''; setNombre(''); setActivo(''); setCategoriaId(''); setPage(1) }

  return <main className="materials-admin">
    <header className="materials-admin__header"><div><p className="materials-admin__eyebrow">Inventario · Bodega</p><h1>Catálogo de materiales</h1><p>Consulte existencias, ubicación y niveles mínimos de los materiales registrados.</p></div><div className="materials-admin__header-actions"><span className="materials-admin__count">{result.total} materiales</span><Link className="materials-admin__secondary" to={CATEGORIAS_PATH}>Categorías</Link>{canManage && <Link className="materials-admin__primary" to={MATERIAL_NEW_PATH}>Nuevo material</Link>}</div></header>
    <section className="materials-admin__filters materials-admin__filters--category" aria-label="Búsqueda y filtros"><label><span>Buscar por nombre</span><input type="search" value={searchInput} maxLength={150} placeholder="Ej. Tubo PVC" onChange={(event) => setSearchInput(event.target.value)} /></label><label><span>Estado</span><select value={activo} onChange={(event) => { setActivo(event.target.value); setPage(1) }}><option value="">Todos</option><option value="true">Activos</option><option value="false">Inactivos</option></select></label><label><span>Categoría</span><select value={categoriaId} disabled={categoriasLoading} onChange={(event) => { setCategoriaId(event.target.value); setPage(1) }}><option value="">Todas las categorías</option>{categorias.data.map((item) => <option key={item.id} value={item.id}>{item.nombre}{item.activo ? '' : ' (inactiva)'}</option>)}</select></label>{filtered && <button type="button" className="materials-admin__secondary" onClick={clearFilters}>Limpiar filtros</button>}{categoriasError && <div className="materials-admin__category-error" role="alert">No fue posible cargar el filtro de categorías. <button type="button" onClick={refetchCategorias}>Reintentar</button></div>}</section>
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
  return <div className="materials-admin__table-wrap"><table><caption className="visually-hidden">Listado de materiales</caption><thead><tr><th>Material</th><th>Categoría</th><th>Unidad</th><th>Ubicación</th><th>Existencia</th><th>Stock mínimo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{materials.map((material) => <tr key={material.id}><td data-label="Material"><strong>{material.nombre}</strong>{material.descripcion && <small>{material.descripcion}</small>}</td><td data-label="Categoría">{material.categoria?.nombre ?? 'Sin categoría'}</td><td data-label="Unidad">{material.unidadMedida}</td><td data-label="Ubicación">{material.ubicacion || 'Sin ubicación'}</td><td data-label="Existencia" className={material.stockActual <= material.stockMinimo ? 'is-low' : ''}>{material.stockActual}</td><td data-label="Stock mínimo">{material.stockMinimo}</td><td data-label="Estado"><span className={`materials-admin__badge ${material.activo ? 'is-active' : 'is-inactive'}`}>{material.activo ? 'Activo' : 'Inactivo'}</span></td><td data-label="Acciones"><div className="materials-admin__row-actions">{canManage ? <><Link className="materials-admin__action" to={materialEditPath(material.id)} state={{ material }}>Ver / Editar</Link><MaterialStateAction material={material} disabled={changingId !== null} onChange={onStateChange} /></> : <span>Solo lectura</span>}</div></td></tr>)}</tbody></table></div>
}
