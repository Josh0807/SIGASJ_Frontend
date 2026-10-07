import { useEffect, useRef, useState } from 'react'
import { IconBuildingWarehouse, IconLayersSubtract, IconPackage, IconPlus, IconRefresh, IconSearch } from '@tabler/icons-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import { InternalAdminRoleName, normalizeInternalRole } from '../../auth/utils/internalRoles'
import { MATERIALES_PATH, PROVEEDOR_NEW_PATH, proveedorEditPath } from '../inventarioPaths'
import { InventoryFormField } from '../InventoryFormField'
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
  return <main className="materials-admin providers-admin sigasj-stack">
    <header className="materials-admin__header providers-admin__header"><div><p className="materials-admin__eyebrow"><IconBuildingWarehouse size={18} aria-hidden="true" />Inventario · Administración</p><h1>Proveedores de materiales</h1><p>Registre y mantenga actualizados los datos de contacto de sus proveedores.</p></div><div className="materials-admin__header-actions"><span className="materials-admin__count group !rounded-2xl !border !border-cyan-200 !bg-linear-to-r !from-cyan-600 !to-blue-600 !px-4 !py-3 !font-extrabold !text-white !shadow-[0_10px_24px_rgba(8,145,178,0.25)] !transition-all !duration-300 hover:!-translate-y-1 hover:!shadow-[0_15px_30px_rgba(8,145,178,0.34)] motion-reduce:!transform-none motion-reduce:!transition-none"><IconBuildingWarehouse className="!transition-transform !duration-300 group-hover:!scale-110" size={18} aria-hidden="true" />{result.total} proveedores</span><Link className="materials-admin__secondary group !rounded-2xl !border-2 !border-blue-200 !bg-white !px-5 !py-3 !font-extrabold !text-blue-700 !shadow-[0_8px_20px_rgba(37,99,235,0.12)] !transition-all !duration-300 hover:!-translate-y-1 hover:!scale-[1.02] hover:!border-blue-500 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.22)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" to={MATERIALES_PATH}><IconPackage className="!transition-transform !duration-300 group-hover:!-rotate-6 group-hover:!scale-110" size={20} aria-hidden="true" />Materiales</Link>{canManage && <Link className="materials-admin__primary group !rounded-2xl !border-0 !bg-linear-to-r !from-blue-700 !via-blue-600 !to-sky-500 !px-5 !py-3 !font-extrabold !text-white !shadow-[0_11px_26px_rgba(37,99,235,0.3)] !transition-all !duration-300 hover:!-translate-y-1 hover:!scale-[1.03] hover:!from-blue-800 hover:!to-cyan-500 hover:!shadow-[0_17px_34px_rgba(37,99,235,0.4)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" to={PROVEEDOR_NEW_PATH}><IconPlus className="!rounded-full !bg-white/20 !p-0.5 !transition-transform !duration-300 group-hover:!rotate-90 group-hover:!scale-110 motion-reduce:!transform-none" size={22} aria-hidden="true" />Nuevo proveedor</Link>}</div></header>
    <section className="materials-admin__filters providers-admin__filters !rounded-[22px] !border-sky-100 !bg-white !p-6 !shadow-[0_12px_30px_rgba(30,90,156,0.08)] [&_input]:!min-h-14 [&_input]:!rounded-2xl [&_input]:!border-sky-200 [&_input]:!shadow-sm [&_select]:!min-h-14 [&_select]:!rounded-2xl [&_select]:!border-sky-200 [&_select]:!shadow-sm" aria-label="Búsqueda y filtros">
      <InventoryFormField label="Buscar por nombre" icon={<IconSearch size={21} aria-hidden="true" />}>
        <input type="search" value={searchInput} maxLength={150} placeholder="Ej. Ferretería Central" onChange={(event) => setSearchInput(event.target.value)} />
      </InventoryFormField>
      <InventoryFormField label="Estado" icon={<IconLayersSubtract size={21} aria-hidden="true" />}>
        <select value={activo} onChange={(event) => { setActivo(event.target.value); setPage(1) }}>
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </InventoryFormField>
      <button type="button" className="materials-admin__secondary providers-admin__clear group !min-h-14 !rounded-2xl !border-slate-200 !bg-white !px-5 !font-extrabold !text-slate-600 !shadow-sm !transition-all !duration-300 enabled:hover:!-translate-y-0.5 enabled:hover:!border-blue-300 enabled:hover:!bg-blue-50 enabled:hover:!text-blue-700 enabled:hover:!shadow-md active:!translate-y-0 disabled:!cursor-not-allowed disabled:!opacity-50 motion-reduce:!transform-none motion-reduce:!transition-none" onClick={clearFilters} disabled={!filtered}><IconRefresh className="!transition-transform !duration-300 group-enabled:group-hover:!rotate-180 motion-reduce:!transform-none" size={20} aria-hidden="true" />Limpiar filtros</button>
    </section>
    {feedback && <div className={`${feedback.kind === 'success' ? 'materials-admin__success !border-emerald-200 !bg-linear-to-r !from-emerald-50 !to-teal-50 !text-emerald-700 !shadow-[0_8px_22px_rgba(16,185,129,0.1)]' : 'materials-admin__error'} !rounded-2xl !px-5 !py-4 !font-semibold`} role={feedback.kind === 'error' ? 'alert' : 'status'}>{feedback.text}</div>}
    {loading && <div className="materials-admin__state" role="status"><span className="materials-admin__spinner" />Cargando proveedores…</div>}
    {!loading && error && <div className="materials-admin__error" role="alert"><p>{error}</p><button type="button" onClick={refetch}>Reintentar</button></div>}
    {!loading && !error && result.data.length === 0 && <div className="materials-admin__empty providers-admin__empty"><span className="providers-admin__empty-icon" aria-hidden="true"><IconPackage size={62} stroke={1.65} /></span><h2>{filtered ? 'No hay coincidencias' : 'Aún no hay proveedores'}</h2><p>{filtered ? 'Pruebe con otro nombre o limpie los filtros.' : 'Los proveedores registrados aparecerán aquí.'}</p></div>}
    {!loading && !error && result.data.length > 0 && <ProveedorTable proveedores={result.data} canManage={canManage} changingId={changingId} onStateChange={changeState} />}
    {!loading && !error && result.totalPages > 1 && <nav className="materials-admin__pagination" aria-label="Paginación de proveedores"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Anterior</button><span>Página {page} de {result.totalPages}</span><button type="button" disabled={page >= result.totalPages} onClick={() => setPage((value) => Math.min(result.totalPages, value + 1))}>Siguiente</button></nav>}
  </main>
}

function ProveedorTable({ proveedores, canManage, changingId, onStateChange }: { proveedores: Proveedor[]; canManage: boolean; changingId: number | null; onStateChange: (proveedor: Proveedor, activo: boolean) => Promise<void> }) {
  return <div className="materials-admin__table-wrap overflow-x-auto !rounded-[22px] !border-sky-100 !bg-white !shadow-[0_14px_34px_rgba(30,90,156,0.09)]"><table><caption className="visually-hidden">Listado de proveedores</caption><thead className="!bg-slate-50/90"><tr><th>Proveedor</th><th>Identificación</th><th>Teléfono</th><th>Correo</th><th>Contacto</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{proveedores.map((item) => <tr className="!transition-colors !duration-200 hover:!bg-blue-50/50" key={item.id}><td data-label="Proveedor"><strong className="!text-[#062e63]">{item.nombre}</strong>{item.razonSocial && <small>{item.razonSocial}</small>}</td><td data-label="Identificación">{item.identificacion || 'No indicada'}</td><td data-label="Teléfono">{item.telefono || 'No indicado'}</td><td data-label="Correo">{item.correo ? <a className="!font-semibold !text-sky-700 hover:!text-blue-800" href={`mailto:${item.correo}`}>{item.correo}</a> : 'No indicado'}</td><td data-label="Contacto">{item.personaContacto || 'No indicado'}</td><td data-label="Estado"><span className={`materials-admin__badge ${item.activo ? 'is-active !border !border-emerald-200 !bg-emerald-50 !text-emerald-700' : 'is-inactive !border !border-slate-200 !bg-slate-100 !text-slate-600'} !rounded-full !px-3 !py-1.5 !font-extrabold !shadow-sm`}>{item.activo ? 'Activo' : 'Inactivo'}</span></td><td data-label="Acciones"><div className="materials-admin__row-actions !flex-nowrap !gap-2">{canManage ? <><Link className="materials-admin__action !inline-flex !min-h-12 !items-center !justify-center !rounded-xl !border-0 !bg-linear-to-r !from-blue-700 !to-sky-500 !px-5 !font-extrabold !text-white !shadow-[0_8px_18px_rgba(37,99,235,0.24)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!from-blue-800 hover:!to-cyan-500 hover:!text-white hover:!shadow-[0_12px_24px_rgba(37,99,235,0.34)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" to={proveedorEditPath(item.id)} state={{ proveedor: item }}>Editar</Link><ProveedorStateAction proveedor={item} disabled={changingId !== null} onChange={onStateChange} /></> : <span>Solo lectura</span>}</div></td></tr>)}</tbody></table></div>
}
