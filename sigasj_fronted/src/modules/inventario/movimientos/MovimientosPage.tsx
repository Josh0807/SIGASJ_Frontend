import { useEffect, useState } from 'react'
import { IconArrowLeft, IconArrowsExchange, IconEye, IconRefresh, IconTrash } from '@tabler/icons-react'
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
    <section className="material-tracking !mx-auto !w-full !max-w-[1480px] !gap-6" aria-labelledby="movimientos-title">
      <header className="material-tracking__header !items-center !rounded-[24px] !border-sky-100 !bg-white !p-8 !shadow-[0_12px_32px_rgba(30,90,156,0.08)]">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-cyan-50 text-cyan-700"><IconArrowsExchange size={25} aria-hidden="true" /></span>
          <div>
          <p className="material-request__eyebrow !mb-2 !text-xs !font-black !tracking-[0.12em] !text-cyan-700">Inventario · Administración</p>
          <h1 className="!text-3xl !font-black !tracking-tight !text-slate-900" id="movimientos-title">Historial de movimientos</h1>
          <p className="!mt-2 !text-base !text-slate-500">Consulte las entradas y salidas registradas sobre los materiales de bodega.</p>
          </div>
        </div>
        <Link className="material-tracking__detail-link !gap-2" to={MATERIALES_PATH}><IconArrowLeft size={18} aria-hidden="true" />Volver al catálogo</Link>
      </header>

      <div className="material-tracking__filters !grid !grid-cols-1 !gap-4 !p-6 sm:!grid-cols-2 xl:!grid-cols-4">
        <label className="!grid !gap-2" htmlFor="movimiento-tipo-filtro"><span className="!m-0 !text-sm !font-extrabold !text-slate-700">Tipo</span>
        <select
          className="!m-0 !w-full !min-w-0"
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
        </select></label>

        <label className="!grid !gap-2" htmlFor="movimiento-material-filtro"><span className="!m-0 !text-sm !font-extrabold !text-slate-700">Material</span>
        <select
          className="!m-0 !w-full !min-w-0"
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
        </select></label>

        <label className="!grid !gap-2" htmlFor="movimiento-desde-filtro"><span className="!m-0 !text-sm !font-extrabold !text-slate-700">Desde</span>
        <input
          className="!m-0 !w-full !min-w-0"
          id="movimiento-desde-filtro"
          type="date"
          value={fechaDesde}
          onChange={(event) => {
            setFechaDesde(event.target.value)
            setPage(1)
          }}
        /></label>

        <label className="!grid !gap-2" htmlFor="movimiento-hasta-filtro"><span className="!m-0 !text-sm !font-extrabold !text-slate-700">Hasta</span>
        <input
          className="!m-0 !w-full !min-w-0"
          id="movimiento-hasta-filtro"
          type="date"
          value={fechaHasta}
          onChange={(event) => {
            setFechaHasta(event.target.value)
            setPage(1)
          }}
        /></label>

        {filtered ? (
          <button type="button" className="material-tracking__filter-action sm:!col-span-2 xl:!col-span-4 xl:!ml-auto" onClick={clearFilters}>
            <IconTrash size={17} aria-hidden="true" /> Limpiar filtros
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
                    <Link className="material-tracking__detail-link !gap-2" to={movimientoDetailPath(movimiento.id)}>
                      <IconEye size={17} aria-hidden="true" /> Ver detalle
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
