import { useEffect, useState } from 'react'
import { IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
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
        <Link className="material-tracking__detail-link" to={MATERIALES_PATH}>Volver al catálogo</Link>
      </header>

      <div className="material-tracking__filters">
        <label htmlFor="reposicion-estado-filtro">Estado</label>
        <select
          id="reposicion-estado-filtro"
          value={estado}
          onChange={(event) => changeEstado(event.target.value as EstadoReposicion | '')}
        >
          {ESTADOS_FILTRO.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>
        <label htmlFor="reposicion-origen-filtro">Origen</label>
        <select
          id="reposicion-origen-filtro"
          value={origen}
          onChange={(event) => changeOrigen(event.target.value as OrigenReposicion | '')}
        >
          {ORIGENES_FILTRO.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>
        {!loading && !error ? (
          <span role="status">{total} {total === 1 ? 'reposición' : 'reposiciones'}</span>
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
