import { useEffect, useState } from 'react'
import { IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { MATERIALES_PATH, recepcionDetailPath } from '../inventarioPaths'
import { getReposicionesAdmin } from '../reposiciones/reposicionesApi'
import {
  formatReposicionEstado,
  formatReposicionFecha,
  getHttpErrorStatus,
  getReposicionCodigo,
  getReposicionProveedorNombre,
  normalizeReposicionesList,
  reposicionErrorMessage,
  resumenMaterialesReposicion,
} from '../reposiciones/reposicionesUtils'
import type { ReposicionMaterial } from '../reposiciones/types'

export default function RecepcionesPage() {
  const [reposiciones, setReposiciones] = useState<ReposicionMaterial[]>([])
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
      estado: 'PENDIENTE_RECEPCION',
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
  }, [navigate, page, reloadKey])

  const retry = () => {
    setError('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  return (
    <section className="material-tracking" aria-labelledby="recepciones-title">
      <header className="material-tracking__header">
        <div>
          <p className="material-request__eyebrow">Inventario · Administración</p>
          <h1 id="recepciones-title">Recepción de materiales</h1>
          <p>Consulte las compras pendientes de entrega y registre la recepción física en bodega.</p>
        </div>
        <Link className="material-tracking__detail-link" to={MATERIALES_PATH}>Volver al catálogo</Link>
      </header>

      {!loading && !error ? (
        <p role="status">{total} {total === 1 ? 'compra pendiente' : 'compras pendientes'} de recepción</p>
      ) : null}

      {loading ? (
        <div className="material-tracking__state" role="status">
          <span className="material-request__spinner" />Cargando compras pendientes…
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
          <h2>No hay compras pendientes de recepción</h2>
          <p>Cuando una reposición quede en espera de entrega, aparecerá aquí para confirmar la recepción.</p>
        </div>
      ) : null}

      {!loading && !error && reposiciones.length > 0 ? (
        <div className="material-tracking__table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reposición</th>
                <th>Proveedor</th>
                <th>Fecha de compra</th>
                <th>Materiales</th>
                <th>Estado</th>
                <th><span className="visually-hidden">Recepción</span></th>
              </tr>
            </thead>
            <tbody>
              {reposiciones.map((reposicion) => (
                <tr key={reposicion.id}>
                  <td data-label="Reposición"><strong>{getReposicionCodigo(reposicion)}</strong></td>
                  <td data-label="Proveedor">{getReposicionProveedorNombre(reposicion)}</td>
                  <td data-label="Fecha de compra">{formatReposicionFecha(reposicion.fechaCompra)}</td>
                  <td data-label="Materiales">{resumenMaterialesReposicion(reposicion.detalles ?? [])}</td>
                  <td data-label="Estado">
                    <span className="material-tracking__badge" data-status={String(reposicion.estado).toUpperCase()}>
                      {formatReposicionEstado(String(reposicion.estado))}
                    </span>
                  </td>
                  <td data-label="Recepción">
                    <Link className="material-tracking__detail-link" to={recepcionDetailPath(reposicion.id)}>
                      Registrar recepción
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && !error && totalPages > 1 ? (
        <nav className="material-tracking__pagination" aria-label="Paginación de recepciones">
          <button type="button" disabled={page <= 1} onClick={() => { setLoading(true); setPage((value) => value - 1) }}>Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => { setLoading(true); setPage((value) => value + 1) }}>Siguiente</button>
        </nav>
      ) : null}
    </section>
  )
}
