import { useEffect, useMemo, useState } from 'react'
import { IconClipboardList, IconEye, IconFilter, IconPlus, IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { InventoryFormField } from '../InventoryFormField'
import { SOLICITUD_MATERIALES_NEW_PATH, SOLICITUDES_MATERIALES_PATH } from '../inventarioPaths'
import { getMisSolicitudesMateriales } from './solicitudesMaterialesApi'
import {
  formatSolicitudDate,
  formatSolicitudStatus,
  getSolicitudAveriaReference,
  getSolicitudMaterialesCount,
  normalizeSolicitudesMaterialesList,
  getHttpErrorStatus,
} from './solicitudMaterialesUtils'
import type { SolicitudMaterialesListItem } from './types'

const STATUS_OPTIONS = ['TODAS', 'PENDIENTE', 'APROBADA', 'RECHAZADA'] as const
const requestButtonClasses = 'group relative isolate overflow-hidden !rounded-2xl !border-0 !bg-linear-to-r !from-blue-600 !via-blue-600 !to-sky-500 !px-6 !py-3 !font-extrabold !text-white !shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:!from-blue-700 hover:!to-cyan-500 hover:!shadow-[0_16px_32px_rgba(37,99,235,0.36)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 motion-reduce:transform-none motion-reduce:transition-none'

export default function SolicitudesMaterialesSeguimientoPage() {
  const [requests, setRequests] = useState<SolicitudMaterialesListItem[]>([])
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>('TODAS')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    void getMisSolicitudesMateriales({
      ...(status === 'TODAS' ? {} : { estado: status }),
      page,
      limit: 10,
    })
      .then((response) => {
        if (!active) return
        const items = normalizeSolicitudesMaterialesList(response)
        setRequests(items)
        setTotal(Array.isArray(response) ? items.length : response.total ?? items.length)
        setTotalPages(Array.isArray(response) ? 1 : Math.max(response.totalPages ?? 1, 1))
      })
      .catch((requestError) => {
        if (!active) return
        if (getHttpErrorStatus(requestError) === 401) {
          navigate('/login', { replace: true })
          return
        }
        setError(getHttpErrorStatus(requestError) === 403
          ? 'No tiene permiso para consultar solicitudes de materiales.'
          : 'No fue posible consultar sus solicitudes de materiales.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [navigate, page, reloadKey, status])

  const retry = () => {
    setError('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  const filtered = useMemo(() => requests, [requests])

  const changeStatus = (nextStatus: typeof status) => {
    setStatus(nextStatus)
    setPage(1)
    setError('')
    setLoading(true)
  }

  return <section className="material-tracking" aria-labelledby="material-tracking-title">
    <header className="material-tracking__header">
      <div>
        <p className="material-request__eyebrow inventory-page-eyebrow">Inventario · Fontanero</p>
        <h1 className="inventory-page-title" id="material-tracking-title">Mis solicitudes de materiales</h1>
        <p className="inventory-page-subtitle">Consulte el estado y detalle de las solicitudes que ha realizado.</p>
      </div>
      <Link className={`material-request__primary ${requestButtonClasses}`} to={SOLICITUD_MATERIALES_NEW_PATH}><IconPlus className="transition-transform duration-300 group-hover:rotate-90 motion-reduce:transform-none" size={20} aria-hidden="true" /> Nueva solicitud</Link>
    </header>

    <div className="material-tracking__filters !flex !items-end !justify-between !gap-6 !overflow-hidden !rounded-3xl !border-blue-100 !bg-linear-to-r !from-white !via-blue-50/40 !to-indigo-50/60 !p-6 !shadow-[0_12px_32px_rgba(37,99,235,0.09)] [&>label]:!w-full [&>label]:!max-w-2xl [&>label]:!justify-items-start [&>label]:!text-left [&>label>span:first-child]:!ml-1 [&>label>span:first-child]:!w-auto [&>label>span:first-child]:!justify-self-start [&>label>span:first-child]:!text-left [&_.provider-admin__control]:!w-full [&_.provider-admin__control]:!rounded-2xl [&_.provider-admin__control]:!border [&_.provider-admin__control]:!border-blue-100 [&_.provider-admin__control]:!bg-white [&_.provider-admin__control]:!shadow-[0_7px_18px_rgba(37,99,235,0.08)] [&_.provider-admin__control]:!transition-all [&_.provider-admin__control]:!duration-300 hover:[&_.provider-admin__control]:!border-blue-300 hover:[&_.provider-admin__control]:!shadow-[0_10px_24px_rgba(37,99,235,0.14)] focus-within:[&_.provider-admin__control]:!border-blue-400 focus-within:[&_.provider-admin__control]:!ring-4 focus-within:[&_.provider-admin__control]:!ring-blue-100 max-[700px]:!flex-col max-[700px]:!items-stretch">
      <InventoryFormField label="Filtrar por estado" icon={<IconFilter size={20} aria-hidden="true" />}>
      <select id="solicitud-estado" value={status} onChange={(event) => changeStatus(event.target.value as typeof status)}>
        {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option === 'TODAS' ? 'Todos los estados' : formatSolicitudStatus(option)}</option>)}
      </select>
      </InventoryFormField>
      {!loading && !error ? <span className="!m-0 !inline-flex !min-h-12 !shrink-0 !items-center !gap-2.5 !rounded-2xl !border !border-blue-200 !bg-white !px-5 !py-3 !font-extrabold !text-blue-700 !shadow-[0_7px_18px_rgba(37,99,235,0.12)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!shadow-[0_11px_24px_rgba(37,99,235,0.2)] motion-reduce:!transform-none motion-reduce:!transition-none max-[700px]:!w-fit" role="status"><IconClipboardList size={19} aria-hidden="true" />{total} {total === 1 ? 'solicitud' : 'solicitudes'}</span> : null}
    </div>

    {loading ? <div className="material-tracking__state" role="status"><span className="material-request__spinner" />Cargando sus solicitudes…</div> : null}
    {error ? <div className="material-tracking__state material-tracking__state--error" role="alert"><p>{error}</p><button type="button" onClick={retry}><IconRefresh size={18} aria-hidden="true" /> Reintentar</button></div> : null}
    {!loading && !error && requests.length === 0 && status === 'TODAS' ? <div className="material-tracking__empty"><h2>Aún no tiene solicitudes</h2><p>Cuando registre una solicitud podrá consultar aquí su estado.</p><Link className={`material-request__primary ${requestButtonClasses}`} to={SOLICITUD_MATERIALES_NEW_PATH}><IconPlus className="transition-transform duration-300 group-hover:rotate-90 motion-reduce:transform-none" size={20} aria-hidden="true" />Crear primera solicitud</Link></div> : null}
    {!loading && !error && requests.length === 0 && status !== 'TODAS' ? <div className="material-tracking__empty"><h2>No hay resultados</h2><p>No tiene solicitudes con el estado seleccionado.</p><button type="button" onClick={() => changeStatus('TODAS')}>Ver todos los estados</button></div> : null}

    {!loading && !error && filtered.length > 0 ? <div className="material-tracking__table-wrap !overflow-hidden !rounded-3xl !border-blue-100 !bg-white !shadow-[0_14px_34px_rgba(30,90,156,0.1)]">
      <table className="[&_thead]:!bg-linear-to-r [&_thead]:!from-slate-50 [&_thead]:!to-blue-50/80 [&_th]:!bg-transparent [&_th]:!py-4 [&_th]:!font-extrabold [&_th]:!tracking-[0.06em] [&_tbody_tr]:!transition-colors [&_tbody_tr]:!duration-200 hover:[&_tbody_tr]:!bg-blue-50/50 [&_td]:!py-4">
        <thead><tr><th>Solicitud</th><th>Fecha</th><th>Estado</th><th>Materiales</th><th>Avería</th><th><span className="sr-only">Acción</span></th></tr></thead>
        <tbody>{filtered.map((request) => <tr key={request.id}>
          <td data-label="Solicitud"><strong className="!font-black !text-[#073b73]">{request.codigo || `#${request.id}`}</strong></td>
          <td data-label="Fecha">{formatSolicitudDate(request.fechaSolicitud)}</td>
          <td data-label="Estado"><span className="material-tracking__badge !rounded-full !px-3.5 !py-2 !font-extrabold !shadow-sm" data-status={request.estado.toUpperCase()}>{formatSolicitudStatus(request.estado)}</span></td>
          <td data-label="Materiales">{getSolicitudMaterialesCount(request)}</td>
          <td data-label="Avería">{getSolicitudAveriaReference(request)}</td>
          <td data-label="Acción"><Link className="material-tracking__detail-link group !gap-2 !rounded-xl !border-blue-100 !bg-blue-50/70 !px-3.5 !py-2 !text-blue-700 !shadow-none !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-blue-300 hover:!bg-blue-100 hover:!shadow-[0_7px_16px_rgba(37,99,235,0.14)] motion-reduce:!transform-none motion-reduce:!transition-none" to={`${SOLICITUDES_MATERIALES_PATH}/${request.id}`}><IconEye className="!transition-transform !duration-300 group-hover:!scale-110" size={18} aria-hidden="true" /> Ver detalle</Link></td>
        </tr>)}</tbody>
      </table>
    </div> : null}
    {!loading && !error && totalPages > 1 ? <nav className="material-tracking__pagination" aria-label="Paginación de solicitudes">
      <button type="button" disabled={page <= 1} onClick={() => { setLoading(true); setPage((value) => value - 1) }}>Anterior</button>
      <span>Página {page} de {totalPages}</span>
      <button type="button" disabled={page >= totalPages} onClick={() => { setLoading(true); setPage((value) => value + 1) }}>Siguiente</button>
    </nav> : null}
  </section>
}
