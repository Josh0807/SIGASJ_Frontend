import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import { InternalAdminRoleName, normalizeInternalRole } from '../../auth/utils/internalRoles'
import { MATERIALES_PATH, PROVEEDOR_NEW_PATH, proveedorEditPath } from '../inventarioPaths'
import ProveedorStateAction from './ProveedorStateAction'
import { updateProveedorEstado } from './proveedoresApi'
import { proveedorError } from './proveedorUtils'
import type { Proveedor } from './types'
import { useProveedores } from './useProveedores'

const PAGE_SIZE = 10

export default function ProveedoresPage() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const canManage = normalizeInternalRole(user?.role) === InternalAdminRoleName.Administradora
  const [searchInput, setSearchInput] = useState('')
  const [nombre, setNombre] = useState('')
  const [activo, setActivo] = useState('')
  const [page, setPage] = useState(1)
  const [changingId, setChangingId] = useState<number | null>(null)
  const routeSuccess = (location.state as { success?: string } | null)?.success
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(() => routeSuccess ? { kind: 'success', text: routeSuccess } : null)
  const latestSearch = useRef('')
  useEffect(() => {
    const timer = window.setTimeout(() => { const value = searchInput.trim(); if (value !== latestSearch.current) { latestSearch.current = value; setNombre(value); setPage(1) } }, 400)
    return () => window.clearTimeout(timer)
  }, [searchInput])
  useEffect(() => { if (routeSuccess) navigate(location.pathname, { replace: true, state: null }) }, [location.pathname, navigate, routeSuccess])
  const { result, loading, error, refetch } = useProveedores({ nombre: nombre || undefined, activo: activo === '' ? undefined : activo === 'true', page, limit: PAGE_SIZE })
  const filtered = Boolean(searchInput.trim() || activo)

  async function changeState(proveedor: Proveedor, nextActivo: boolean) {
    if (!canManage || changingId !== null) return
    setChangingId(proveedor.id); setFeedback(null)
    try {
      await updateProveedorEstado(proveedor.id, nextActivo)
      setFeedback({ kind: 'success', text: `El proveedor «${proveedor.nombre}» fue ${nextActivo ? 'activado' : 'desactivado'} correctamente.` })
      refetch()
    } catch (caught) {
      const message = proveedorError(caught)
      setFeedback({ kind: 'error', text: message })
      if (/HTTP 401/.test(caught instanceof Error ? caught.message : '')) logout()
      if (/HTTP 404/.test(caught instanceof Error ? caught.message : '')) refetch()
    } finally { setChangingId(null) }
  }

  const clearFilters = () => { setSearchInput(''); latestSearch.current = ''; setNombre(''); setActivo(''); setPage(1) }
  return <main className="materials-admin providers-admin">
    <header className="materials-admin__header"><div><p className="materials-admin__eyebrow">Inventario · Administración</p><h1>Proveedores de materiales</h1><p>Registre y mantenga actualizados los datos de contacto de sus proveedores.</p></div><div className="materials-admin__header-actions"><span className="materials-admin__count">{result.total} proveedores</span><Link className="materials-admin__secondary" to={MATERIALES_PATH}>Materiales</Link>{canManage && <Link className="materials-admin__primary" to={PROVEEDOR_NEW_PATH}>Nuevo proveedor</Link>}</div></header>
    <section className="materials-admin__filters" aria-label="Búsqueda y filtros"><label><span>Buscar por nombre</span><input type="search" value={searchInput} maxLength={150} placeholder="Ej. Ferretería Central" onChange={(event) => setSearchInput(event.target.value)} /></label><label><span>Estado</span><select value={activo} onChange={(event) => { setActivo(event.target.value); setPage(1) }}><option value="">Todos</option><option value="true">Activos</option><option value="false">Inactivos</option></select></label>{filtered && <button type="button" className="materials-admin__secondary" onClick={clearFilters}>Limpiar filtros</button>}</section>
    {feedback && <div className={feedback.kind === 'success' ? 'materials-admin__success' : 'materials-admin__error'} role={feedback.kind === 'error' ? 'alert' : 'status'}>{feedback.text}</div>}
    {loading && <div className="materials-admin__state" role="status"><span className="materials-admin__spinner" />Cargando proveedores…</div>}
    {!loading && error && <div className="materials-admin__error" role="alert"><p>{error}</p><button type="button" onClick={refetch}>Reintentar</button></div>}
    {!loading && !error && result.data.length === 0 && <div className="materials-admin__empty"><h2>{filtered ? 'No hay coincidencias' : 'Aún no hay proveedores'}</h2><p>{filtered ? 'Pruebe con otro nombre o limpie los filtros.' : 'Los proveedores registrados aparecerán aquí.'}</p>{canManage && !filtered && <Link className="materials-admin__primary" to={PROVEEDOR_NEW_PATH}>Registrar primer proveedor</Link>}</div>}
    {!loading && !error && result.data.length > 0 && <ProveedorTable proveedores={result.data} canManage={canManage} changingId={changingId} onStateChange={changeState} />}
    {!loading && !error && result.totalPages > 1 && <nav className="materials-admin__pagination" aria-label="Paginación de proveedores"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Anterior</button><span>Página {page} de {result.totalPages}</span><button type="button" disabled={page >= result.totalPages} onClick={() => setPage((value) => Math.min(result.totalPages, value + 1))}>Siguiente</button></nav>}
  </main>
}

function ProveedorTable({ proveedores, canManage, changingId, onStateChange }: { proveedores: Proveedor[]; canManage: boolean; changingId: number | null; onStateChange: (proveedor: Proveedor, activo: boolean) => Promise<void> }) {
  return <div className="materials-admin__table-wrap"><table><caption className="visually-hidden">Listado de proveedores</caption><thead><tr><th>Proveedor</th><th>Identificación</th><th>Teléfono</th><th>Correo</th><th>Contacto</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{proveedores.map((item) => <tr key={item.id}><td data-label="Proveedor"><strong>{item.nombre}</strong>{item.razonSocial && <small>{item.razonSocial}</small>}</td><td data-label="Identificación">{item.identificacion || 'No indicada'}</td><td data-label="Teléfono">{item.telefono || 'No indicado'}</td><td data-label="Correo">{item.correo ? <a href={`mailto:${item.correo}`}>{item.correo}</a> : 'No indicado'}</td><td data-label="Contacto">{item.personaContacto || 'No indicado'}</td><td data-label="Estado"><span className={`materials-admin__badge ${item.activo ? 'is-active' : 'is-inactive'}`}>{item.activo ? 'Activo' : 'Inactivo'}</span></td><td data-label="Acciones"><div className="materials-admin__row-actions">{canManage ? <><Link className="materials-admin__action" to={proveedorEditPath(item.id)} state={{ proveedor: item }}>Editar</Link><ProveedorStateAction proveedor={item} disabled={changingId !== null} onChange={onStateChange} /></> : <span>Solo lectura</span>}</div></td></tr>)}</tbody></table></div>
}
