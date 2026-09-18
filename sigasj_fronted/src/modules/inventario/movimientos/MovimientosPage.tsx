import { useEffect, useState } from 'react'
import { IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { MATERIALES_PATH, movimientoDetailPath } from '../inventarioPaths'
import { useMateriales } from '../useMateriales'
import { getMovimientosAdmin } from './movimientosApi'
import {
  formatMovimientoCantidad,
  formatMovimientoFecha,
  formatMovimientoTipo,
  getHttpErrorStatus,
  getMovimientoMaterialNombre,
  getMovimientoReferencia,
  getMovimientoResponsable,
  movimientoErrorMessage,
  normalizeMovimientosList,
} from './movimientosUtils'
import type { MovimientoInventario, TipoMovimientoInventario } from './types'

const TIPOS_FILTRO: { value: TipoMovimientoInventario | ''; label: string }[] = [
  { value: '', label: 'Todos los tipos' },
  { value: 'ENTRADA', label: 'Entradas' },
  { value: 'SALIDA', label: 'Salidas' },
]

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
  const [tipo, setTipo] = useState<TipoMovimientoInventario | ''>('')
  const [materialId, setMaterialId] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const navigate = useNavigate()
  const { result: materialesResult, loading: materialesLoading } = useMateriales({
    page: 1,
    limit: 100,
    activo: true,
  })

  useEffect(() => {
    let active = true
    setLoading(true)
    void getMovimientosAdmin({
      ...(tipo ? { tipo } : {}),
      ...(materialId ? { idMaterial: Number(materialId) } : {}),
      ...(fechaDesde ? { fechaDesde } : {}),
      ...(fechaHasta ? { fechaHasta } : {}),
      page,
      limit: 10,
    })
      .then((response) => {
        if (!active) return
        const items = normalizeMovimientosList(response)
        setMovimientos(items)
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
        setError(movimientoErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [tipo, materialId, fechaDesde, fechaHasta, navigate, page, reloadKey])

  const retry = () => {
    setError('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  const clearFilters = () => {
    setTipo('')
    setMaterialId('')
    setFechaDesde('')
    setFechaHasta('')
    setPage(1)
  }

  const filtered = Boolean(tipo || materialId || fechaDesde || fechaHasta)

  return (
    <section className="material-tracking" aria-labelledby="movimientos-title">
      <header className="material-tracking__header">
        <div>
          <p className="material-request__eyebrow">Inventario · Administración</p>
          <h1 id="movimientos-title">Historial de movimientos</h1>
          <p>Consulte las entradas y salidas registradas sobre los materiales de bodega.</p>
        </div>
        <Link className="material-tracking__detail-link" to={MATERIALES_PATH}>Volver al catálogo</Link>
      </header>

      <div className="material-tracking__filters">
        <label htmlFor="movimiento-tipo-filtro">Tipo</label>
        <select
          id="movimiento-tipo-filtro"
          value={tipo}
          onChange={(event) => {
            setTipo(event.target.value as TipoMovimientoInventario | '')
            setPage(1)
          }}
        >
          {TIPOS_FILTRO.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>

        <label htmlFor="movimiento-material-filtro">Material</label>
        <select
          id="movimiento-material-filtro"
          value={materialId}
          disabled={materialesLoading}
          onChange={(event) => {
            setMaterialId(event.target.value)
            setPage(1)
          }}
        >
          <option value="">Todos los materiales</option>
          {materialesResult.data.map((material) => (
            <option key={material.id} value={material.id}>{material.nombre}</option>
          ))}
        </select>

        <label htmlFor="movimiento-desde-filtro">Desde</label>
        <input
          id="movimiento-desde-filtro"
          type="date"
          value={fechaDesde}
          onChange={(event) => {
            setFechaDesde(event.target.value)
            setPage(1)
          }}
        />

        <label htmlFor="movimiento-hasta-filtro">Hasta</label>
        <input
          id="movimiento-hasta-filtro"
          type="date"
          value={fechaHasta}
          onChange={(event) => {
            setFechaHasta(event.target.value)
            setPage(1)
          }}
        />

        {filtered ? (
          <button type="button" className="material-tracking__filter-action" onClick={clearFilters}>
            Limpiar filtros
          </button>
        ) : null}
      </div>

      {!loading && !error ? (
        <p role="status">{total} {total === 1 ? 'movimiento registrado' : 'movimientos registrados'}</p>
      ) : null}

      {loading ? (
        <div className="material-tracking__state" role="status">
          <span className="material-tracking__spinner" aria-hidden="true" />
          Cargando historial…
        </div>
      ) : null}

      {!loading && error ? (
        <div className="material-tracking__error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={retry}>
            <IconRefresh size={16} aria-hidden="true" />
            Reintentar
          </button>
        </div>
      ) : null}

      {!loading && !error && movimientos.length === 0 ? (
        <div className="material-tracking__empty">
          <h2>{filtered ? 'No hay coincidencias' : 'Aún no hay movimientos'}</h2>
          <p>
            {filtered
              ? 'Pruebe con otros filtros o limpie la búsqueda.'
              : 'Las entradas y salidas registradas aparecerán aquí.'}
          </p>
        </div>
      ) : null}

      {!loading && !error && movimientos.length > 0 ? (
        <div className="material-tracking__table-wrap">
          <table>
            <caption className="visually-hidden">Historial de movimientos de inventario</caption>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Material</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Responsable</th>
                <th>Referencia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((movimiento) => (
                <tr key={movimiento.id}>
                  <td data-label="Fecha">{formatMovimientoFecha(movimiento.fechaMovimiento)}</td>
                  <td data-label="Material">{getMovimientoMaterialNombre(movimiento)}</td>
                  <td data-label="Tipo">
                    <span className="material-tracking__badge" data-status={movimiento.tipo}>
                      {formatMovimientoTipo(movimiento.tipo)}
                    </span>
                  </td>
                  <td data-label="Cantidad">{formatMovimientoCantidad(movimiento)}</td>
                  <td data-label="Responsable">{getMovimientoResponsable(movimiento)}</td>
                  <td data-label="Referencia">{getMovimientoReferencia(movimiento)}</td>
                  <td data-label="Acciones">
                    <Link className="material-tracking__detail-link" to={movimientoDetailPath(movimiento.id)}>
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
        <nav className="material-tracking__pagination" aria-label="Paginación del historial">
          <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          >
            Siguiente
          </button>
        </nav>
      ) : null}
    </section>
  )
}
