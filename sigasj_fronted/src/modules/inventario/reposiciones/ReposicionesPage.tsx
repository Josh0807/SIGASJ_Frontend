import { useEffect, useState } from 'react'
import { IconArrowLeft, IconBox, IconFilter, IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { InventoryFormField } from '../InventoryFormField'
import { MATERIALES_PATH, reposicionDetailPath } from '../inventarioPaths'
import { getReposicionesAdmin } from './reposicionesApi'
import {
  formatReposicionEstado,
  formatReposicionFecha,
  formatReposicionOrigen,
  getHttpErrorStatus,
  getReposicionCodigo,
  getReposicionProveedorNombre,
  getReposicionResponsable,
  normalizeReposicionesList,
  reposicionErrorMessage,
  resumenMaterialesReposicion,
} from './reposicionesUtils'
import type { EstadoReposicion, OrigenReposicion, ReposicionMaterial } from './types'

const ESTADOS_FILTRO: { value: EstadoReposicion | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_GESTION', label: 'En gestión' },
  { value: 'COMPRA_REGISTRADA', label: 'Compra registrada' },
  { value: 'PENDIENTE_RECEPCION', label: 'Pendiente de recepción' },
  { value: 'RECIBIDA', label: 'Recibida' },
  { value: 'COMPLETADA', label: 'Completada' },
]

const ORIGENES_FILTRO: { value: OrigenReposicion | ''; label: string }[] = [
  { value: '', label: 'Todos los orígenes' },
  { value: 'ALERTA_STOCK_MINIMO', label: 'Stock mínimo' },
  { value: 'SOLICITUD_APROBADA', label: 'Solicitud aprobada' },
  { value: 'ADMINISTRATIVA', label: 'Administrativa' },
]

export default function ReposicionesPage() {
  const [reposiciones, setReposiciones] = useState<ReposicionMaterial[]>([])
  const [estado, setEstado] = useState<EstadoReposicion | ''>('')
  const [origen, setOrigen] = useState<OrigenReposicion | ''>('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    setLoading(true)
    void getReposicionesAdmin({
      ...(estado ? { estado } : {}),
      ...(origen ? { origen } : {}),
      page,
      limit: 10,
    })
      .then((response) => {
        if (!active) return
        const items = normalizeReposicionesList(response)
        setReposiciones(items)
        setTotal(Array.isArray(response) ? items.length : response.total ?? items.length)
        setTotalPages(Array.isArray(response) ? 1 : Math.max(response.totalPages ?? 1, 1))
        setError('')
      })
      .catch((requestError) => {
        if (!active) return
        if (getHttpErrorStatus(requestError) === 401) {
          navigate('/login', { replace: true })
          return
        }
        setError(reposicionErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [estado, origen, navigate, page, reloadKey])

  const retry = () => {
    setError('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  const changeEstado = (value: EstadoReposicion | '') => {
    setEstado(value)
    setPage(1)
  }

  const changeOrigen = (value: OrigenReposicion | '') => {
    setOrigen(value)
    setPage(1)
  }

  return (
    <section className="material-tracking" aria-labelledby="reposiciones-title">
      <header className="material-tracking__header">
        <div>
          <p className="material-request__eyebrow">Inventario · Administración</p>
          <h1 id="reposiciones-title">Reposiciones de materiales</h1>
          <p>Consulte y gestione las reposiciones generadas por alertas, solicitudes o acciones administrativas.</p>
        </div>
        <Link className="material-tracking__detail-link group !inline-flex !items-center !gap-2.5 !rounded-2xl !border !border-blue-200 !bg-white !px-5 !py-3 !font-extrabold !text-blue-700 !shadow-[0_8px_20px_rgba(37,99,235,0.12)] !transition-all !duration-300 !ease-out hover:!-translate-y-1 hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.2)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" to={MATERIALES_PATH}><IconArrowLeft className="!transition-transform !duration-300 group-hover:!-translate-x-1 motion-reduce:!transform-none" size={19} aria-hidden="true" />Volver al catálogo</Link>
      </header>

      <div className="material-tracking__filters !flex !items-end !justify-between !gap-5 !overflow-hidden !rounded-3xl !border-blue-100 !bg-linear-to-r !from-white !via-blue-50/35 !to-sky-50/70 !p-6 !shadow-[0_12px_32px_rgba(30,90,156,0.09)] [&>label]:!w-full [&>label]:!max-w-[470px] [&>label]:!justify-items-start [&>label]:!text-left [&>label>span:first-child]:!ml-1 [&>label>span:first-child]:!w-auto [&>label>span:first-child]:!justify-self-start [&>label>span:first-child]:!text-left [&_.provider-admin__control]:!w-full [&_.provider-admin__control]:!rounded-2xl [&_.provider-admin__control]:!border [&_.provider-admin__control]:!border-blue-100 [&_.provider-admin__control]:!bg-white [&_.provider-admin__control]:!shadow-[0_7px_18px_rgba(37,99,235,0.08)] [&_.provider-admin__control]:!transition-all [&_.provider-admin__control]:!duration-300 hover:[&_.provider-admin__control]:!border-blue-300 hover:[&_.provider-admin__control]:!shadow-[0_10px_24px_rgba(37,99,235,0.14)] focus-within:[&_.provider-admin__control]:!border-blue-400 focus-within:[&_.provider-admin__control]:!ring-4 focus-within:[&_.provider-admin__control]:!ring-blue-100 max-[850px]:!grid max-[850px]:!grid-cols-1 max-[850px]:!items-stretch max-[850px]:[&>label]:!max-w-none">
        <InventoryFormField label="Estado" icon={<IconFilter size={20} aria-hidden="true" />}>
        <select
          id="reposicion-estado-filtro"
          value={estado}
          onChange={(event) => changeEstado(event.target.value as EstadoReposicion | '')}
        >
          {ESTADOS_FILTRO.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>
        </InventoryFormField>
        <InventoryFormField label="Origen" icon={<IconBox size={20} aria-hidden="true" />}>
        <select
          id="reposicion-origen-filtro"
          value={origen}
          onChange={(event) => changeOrigen(event.target.value as OrigenReposicion | '')}
        >
          {ORIGENES_FILTRO.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>
        </InventoryFormField>
        {!loading && !error ? (
          <span className="!m-0 !inline-flex !min-h-12 !shrink-0 !items-center !gap-2.5 !rounded-2xl !border !border-orange-200 !bg-linear-to-r !from-orange-50 !to-amber-50 !px-5 !py-3 !font-extrabold !text-orange-700 !shadow-[0_7px_18px_rgba(234,88,12,0.12)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!shadow-[0_11px_24px_rgba(234,88,12,0.18)] motion-reduce:!transform-none motion-reduce:!transition-none max-[850px]:!w-fit" role="status"><IconBox size={19} aria-hidden="true" />{total} {total === 1 ? 'reposición' : 'reposiciones'}</span>
        ) : null}
      </div>

      {loading ? (
        <div className="material-tracking__state" role="status">
          <span className="material-request__spinner" />Cargando reposiciones…
        </div>
      ) : null}
      {error ? (
        <div className="material-tracking__state material-tracking__state--error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={retry}>
            <IconRefresh size={18} aria-hidden="true" /> Reintentar
          </button>
        </div>
      ) : null}
      {!loading && !error && reposiciones.length === 0 ? (
        <div className="material-tracking__empty">
          <h2>{estado || origen ? 'No hay reposiciones con esos filtros' : 'No hay reposiciones registradas'}</h2>
          <p>
            {estado || origen
              ? 'Pruebe con otros filtros o consulte todos los registros.'
              : 'Cuando se genere una reposición, aparecerá en este listado.'}
          </p>
        </div>
      ) : null}

      {!loading && !error && reposiciones.length > 0 ? (
        <div className="material-tracking__table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha</th>
                <th>Origen</th>
                <th>Proveedor</th>
                <th>Materiales</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th><span className="visually-hidden">Detalle</span></th>
              </tr>
            </thead>
            <tbody>
              {reposiciones.map((reposicion) => (
                <tr key={reposicion.id}>
                  <td data-label="Código"><strong>{getReposicionCodigo(reposicion)}</strong></td>
                  <td data-label="Fecha">{formatReposicionFecha(reposicion.fechaGeneracion)}</td>
                  <td data-label="Origen">{formatReposicionOrigen(String(reposicion.origen))}</td>
                  <td data-label="Proveedor">{getReposicionProveedorNombre(reposicion)}</td>
                  <td data-label="Materiales">{resumenMaterialesReposicion(reposicion.detalles ?? [])}</td>
                  <td data-label="Estado">
                    <span className="material-tracking__badge" data-status={String(reposicion.estado).toUpperCase()}>
                      {formatReposicionEstado(String(reposicion.estado))}
                    </span>
                  </td>
                  <td data-label="Responsable">{getReposicionResponsable(reposicion)}</td>
                  <td data-label="Detalle">
                    <Link className="material-tracking__detail-link" to={reposicionDetailPath(reposicion.id)}>
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && !error && totalPages > 1 ? (
        <nav className="material-tracking__pagination" aria-label="Paginación de reposiciones">
          <button type="button" disabled={page <= 1} onClick={() => { setLoading(true); setPage((value) => value - 1) }}>Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => { setLoading(true); setPage((value) => value + 1) }}>Siguiente</button>
        </nav>
      ) : null}
    </section>
  )
}
