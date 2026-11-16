import { useEffect, useState } from 'react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import {
  IconArrowLeft,
  IconArrowsExchange,
  IconCalendar,
  IconEye,
  IconHistory,
  IconPackage,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import {
  Alert,
  Button,
  EmptyState,
  MetricPill,
  PageHeader,
} from '../../../shared/ui'
import { InventoryFormField } from '../InventoryFormField'
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
    const cancelScheduled = runAfterEffect(() => {
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
    })
    return () => {
      active = false
      cancelScheduled()
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
    <section
      className="inv-movimientos"
      style={{ display: 'grid', gap: 14 }}
      aria-labelledby="movimientos-title"
    >
      <PageHeader
        eyebrow="Inventario · Administración"
        title={<span id="movimientos-title">Historial de movimientos</span>}
        description="Consulte las entradas y salidas registradas sobre los materiales de bodega."
        actions={
          <Button
            to={MATERIALES_PATH}
            variant="secondary"
            leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
          >
            Volver al catálogo
          </Button>
        }
      />

      <section className="inv-panel" aria-label="Filtros de movimientos">
        <div className="inv-filters inv-filters--wrap">
          <InventoryFormField
            label="Tipo"
            icon={<IconArrowsExchange size={18} aria-hidden="true" />}
          >
            <select
              id="movimiento-tipo-filtro"
              value={tipo}
              onChange={(event) => {
                setTipo(event.target.value as TipoMovimientoInventario | '')
                setPage(1)
              }}
            >
              {TIPOS_FILTRO.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </InventoryFormField>

          <InventoryFormField
            label="Material"
            icon={<IconPackage size={18} aria-hidden="true" />}
          >
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
                <option key={material.id} value={material.id}>
                  {material.nombre}
                </option>
              ))}
            </select>
          </InventoryFormField>

          <InventoryFormField
            label="Desde"
            icon={<IconCalendar size={18} aria-hidden="true" />}
          >
            <input
              id="movimiento-desde-filtro"
              type="date"
              value={fechaDesde}
              onChange={(event) => {
                setFechaDesde(event.target.value)
                setPage(1)
              }}
            />
          </InventoryFormField>

          <InventoryFormField
            label="Hasta"
            icon={<IconCalendar size={18} aria-hidden="true" />}
          >
            <input
              id="movimiento-hasta-filtro"
              type="date"
              value={fechaHasta}
              onChange={(event) => {
                setFechaHasta(event.target.value)
                setPage(1)
              }}
            />
          </InventoryFormField>

          {filtered ? (
            <Button
              type="button"
              variant="secondary"
              onClick={clearFilters}
              leftIcon={<IconTrash size={17} aria-hidden="true" />}
            >
              Limpiar filtros
            </Button>
          ) : null}

          {!loading && !error ? (
            <MetricPill
              label={total === 1 ? 'movimiento' : 'movimientos'}
              value={total}
              role="status"
            />
          ) : null}
        </div>
      </section>

      {loading ? (
        <div className="inv-state" role="status">
          {ADMIN_COPY.loading('historial')}
        </div>
      ) : null}

      {error ? (
        <Alert
          tone="danger"
          title="No se pudo cargar el historial"
          icon={<IconRefresh size={18} aria-hidden="true" />}
        >
          <p className="m-0 mb-3">{error}</p>
          <Button
            size="sm"
            onClick={retry}
            leftIcon={<IconRefresh size={16} aria-hidden="true" />}
          >
            {ADMIN_COPY.retry}
          </Button>
        </Alert>
      ) : null}

      {!loading && !error && movimientos.length === 0 ? (
        <EmptyState
          icon={<IconHistory size={30} aria-hidden="true" />}
          title={filtered ? 'No hay coincidencias' : 'Aún no hay movimientos'}
          description={
            filtered
              ? 'Pruebe con otros filtros o limpie la búsqueda.'
              : 'Las entradas y salidas registradas aparecerán aquí.'
          }
          actions={
            filtered ? (
              <Button
                type="button"
                variant="secondary"
                onClick={clearFilters}
                leftIcon={<IconTrash size={17} aria-hidden="true" />}
              >
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {!loading && !error && movimientos.length > 0 ? (
        <section className="inv-panel" aria-label="Listado de movimientos">
          <div className="inv-table-wrap">
            <table className="inv-table">
              <caption className="visually-hidden">
                Historial de movimientos de inventario
              </caption>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Material</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Responsable</th>
                  <th>Referencia</th>
                  <th>
                    <span className="visually-hidden">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((movimiento) => (
                  <tr key={movimiento.id}>
                    <td data-label="Fecha">
                      {formatMovimientoFecha(movimiento.fechaMovimiento)}
                    </td>
                    <td data-label="Material">
                      <strong>{getMovimientoMaterialNombre(movimiento)}</strong>
                    </td>
                    <td data-label="Tipo">
                      <span
                        className={
                          movimiento.tipo === 'ENTRADA'
                            ? 'inv-badge inv-badge--ok'
                            : 'inv-badge inv-badge--low'
                        }
                      >
                        {formatMovimientoTipo(movimiento.tipo)}
                      </span>
                    </td>
                    <td data-label="Cantidad">
                      <strong>{formatMovimientoCantidad(movimiento)}</strong>
                    </td>
                    <td data-label="Responsable">
                      {getMovimientoResponsable(movimiento)}
                    </td>
                    <td data-label="Referencia">
                      {getMovimientoReferencia(movimiento)}
                    </td>
                    <td data-label="Acciones">
                      <Button
                        className="inv-row-action"
                        size="sm"
                        to={movimientoDetailPath(movimiento.id)}
                        leftIcon={<IconEye size={16} aria-hidden="true" />}
                      >
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!loading && !error && totalPages > 1 ? (
        <nav className="inv-pagination" aria-label="Paginación del historial">
          <button
            type="button"
            className="inv-btn inv-btn--secondary"
            disabled={page <= 1}
            onClick={() => {
              setLoading(true)
              setPage((value) => Math.max(1, value - 1))
            }}
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            className="inv-btn inv-btn--secondary"
            disabled={page >= totalPages}
            onClick={() => {
              setLoading(true)
              setPage((value) => Math.min(totalPages, value + 1))
            }}
          >
            Siguiente
          </button>
        </nav>
      ) : null}
    </section>
  )
}
