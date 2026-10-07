import { useEffect, useState } from 'react'
import { IconArrowLeft, IconClipboardCheck, IconEye, IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { MATERIALES_PATH, solicitudRevisionDetailPath } from '../inventarioPaths'
import { getSolicitudesMaterialesAdmin } from './solicitudesMaterialesApi'
import {
  formatSolicitudDate,
  formatSolicitudStatus,
  getHttpErrorStatus,
  getSolicitudAveriaReference,
  getSolicitudFontaneroNombre,
  getSolicitudMaterialesCount,
  normalizeSolicitudesMaterialesList,
} from './solicitudMaterialesUtils'
import type { SolicitudMaterialesListItem } from './types'

export default function SolicitudesRevisionPage() {
  const [requests, setRequests] = useState<SolicitudMaterialesListItem[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    void getSolicitudesMaterialesAdmin({ estado: 'PENDIENTE', page, limit: 10 })
      .then((response) => {
        if (!active) return
        const items = normalizeSolicitudesMaterialesList(response)
        setRequests(items)
        setTotal(Array.isArray(response) ? items.length : response.total ?? items.length)
        setTotalPages(Array.isArray(response) ? 1 : Math.max(response.totalPages ?? 1, 1))
      })
      .catch((requestError) => {
        if (!active) return
        const status = getHttpErrorStatus(requestError)
        if (status === 401) {
          navigate('/login', { replace: true })
          return
        }
        setError(status === 403
          ? 'No tiene permiso para revisar solicitudes de materiales.'
          : 'No fue posible cargar las solicitudes pendientes.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [navigate, page, reloadKey])

  const retry = () => {
    setError('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  return <section className="material-tracking" aria-labelledby="solicitud-revision-title">
    <header className="material-tracking__header">
      <div>
        <p className="material-request__eyebrow">Inventario · Administración</p>
        <h1 id="solicitud-revision-title">Revisión de solicitudes de materiales</h1>
        <p>Consulte las solicitudes pendientes enviadas por los fontaneros y abra el detalle para revisarlas.</p>
      </div>
      <Link className="material-tracking__detail-link group !inline-flex !items-center !gap-2.5 !rounded-2xl !border !border-blue-200 !bg-white !px-5 !py-3 !font-extrabold !text-blue-700 !shadow-[0_8px_20px_rgba(37,99,235,0.12)] !transition-all !duration-300 !ease-out hover:!-translate-y-1 hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.2)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" to={MATERIALES_PATH}><IconArrowLeft className="!transition-transform !duration-300 group-hover:!-translate-x-1 motion-reduce:!transform-none" size={19} aria-hidden="true" />Volver al catálogo</Link>
    </header>

    {!loading && !error ? <div className="material-tracking__filters !flex !items-center !justify-between !gap-5 !overflow-hidden !rounded-3xl !border-indigo-100 !bg-linear-to-r !from-white !via-indigo-50/40 !to-blue-50/70 !p-6 !shadow-[0_12px_32px_rgba(79,70,229,0.1)] max-[640px]:!flex-col max-[640px]:!items-stretch">
      <div className="!flex !items-center !gap-4">
        <span className="!grid !size-12 !shrink-0 !place-items-center !rounded-2xl !bg-linear-to-br !from-indigo-600 !to-blue-500 !text-white !shadow-[0_9px_20px_rgba(79,70,229,0.25)]"><IconClipboardCheck size={24} aria-hidden="true" /></span>
        <div>
          <strong className="!block !text-base !font-extrabold !text-[#073b73]">Solicitudes por revisar</strong>
          <small className="!mt-1 !block !text-sm !text-slate-500">Materiales pendientes de aprobación administrativa.</small>
        </div>
      </div>
      <span className="!m-0 !inline-flex !min-h-12 !shrink-0 !items-center !gap-2.5 !rounded-2xl !border !border-indigo-200 !bg-white !px-5 !py-3 !font-extrabold !text-indigo-700 !shadow-[0_7px_18px_rgba(79,70,229,0.12)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!shadow-[0_11px_24px_rgba(79,70,229,0.2)] motion-reduce:!transform-none motion-reduce:!transition-none max-[640px]:!w-fit" role="status"><span className="!size-2 !rounded-full !bg-indigo-500 !shadow-[0_0_0_5px_rgba(99,102,241,0.12)]" aria-hidden="true" />{total} {total === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}</span>
    </div> : null}

    {loading ? <div className="material-tracking__state" role="status"><span className="material-request__spinner" />Cargando solicitudes pendientes…</div> : null}
    {error ? <div className="material-tracking__state material-tracking__state--error" role="alert"><p>{error}</p><button type="button" onClick={retry}><IconRefresh size={18} aria-hidden="true" /> Reintentar</button></div> : null}
    {!loading && !error && requests.length === 0 ? <div className="material-tracking__empty"><h2>No hay solicitudes pendientes</h2><p>Cuando un fontanero envíe una solicitud de materiales, aparecerá aquí para su revisión.</p></div> : null}

    {!loading && !error && requests.length > 0 ? <div className="material-tracking__table-wrap">
      <table>
        <thead>
          <tr>
            <th>Solicitud</th>
            <th>Fecha</th>
            <th>Fontanero</th>
            <th>Avería</th>
            <th>Estado</th>
            <th>Materiales</th>
            <th><span className="visually-hidden">Acción</span></th>
          </tr>
        </thead>
        <tbody>{requests.map((request) => <tr key={request.id}>
          <td data-label="Solicitud"><strong>{request.codigo || `#${request.id}`}</strong></td>
          <td data-label="Fecha">{formatSolicitudDate(request.fechaSolicitud)}</td>
          <td data-label="Fontanero">{getSolicitudFontaneroNombre(request)}</td>
          <td data-label="Avería">{getSolicitudAveriaReference(request)}</td>
          <td data-label="Estado"><span className="material-tracking__badge" data-status={request.estado.toUpperCase()}>{formatSolicitudStatus(request.estado)}</span></td>
          <td data-label="Materiales">{getSolicitudMaterialesCount(request)}</td>
          <td data-label="Acción">
            <Link
              className="material-tracking__detail-link"
              to={solicitudRevisionDetailPath(request.id)}
              state={{ solicitud: request }}
            >
              <IconEye size={18} aria-hidden="true" /> Ver detalle
            </Link>
          </td>
        </tr>)}</tbody>
      </table>
    </div> : null}

    {!loading && !error && totalPages > 1 ? <nav className="material-tracking__pagination" aria-label="Paginación de solicitudes pendientes">
      <button type="button" disabled={page <= 1} onClick={() => { setLoading(true); setPage((value) => value - 1) }}>Anterior</button>
      <span>Página {page} de {totalPages}</span>
      <button type="button" disabled={page >= totalPages} onClick={() => { setLoading(true); setPage((value) => value + 1) }}>Siguiente</button>
    </nav> : null}
  </section>
}
