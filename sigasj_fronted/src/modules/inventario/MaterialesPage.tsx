import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  IconAlertTriangle,
  IconBox,
  IconCheck,
  IconCircleCheck,
  IconClipboardList,
  IconPackage,
  IconPlus,
  IconX,
} from '@tabler/icons-react'
import { useAuth } from '../auth/components/AuthContext'
import {
  InternalAdminRoleName,
  normalizeInternalRole,
} from '../auth/utils/internalRoles'
import {
  MATERIAL_NEW_PATH,
  materialEditPath,
  SOLICITUDES_REVISION_PATH,
} from './inventarioPaths'
import { parseMaterialEstadoError } from './materialEstadoError'
import { updateMaterialEstado } from './materialesApi'
import MaterialStateAction from './MaterialStateAction'
import type { Material } from './types'
import { useMateriales } from './useMateriales'
import { useCategorias } from './categorias/useCategorias'
import { useProveedores } from './proveedores/useProveedores'
import { getReporteInventarioAdmin } from './reportes/reportesApi'
import { getSolicitudesMaterialesAdmin } from './solicitudes-materiales/solicitudesMaterialesApi'
import { getMovimientosAdmin } from './movimientos/movimientosApi'
import type { MovimientoInventario } from './movimientos/types'
import { formatCantidadUnidad, pluralizeUnidad } from './unidadMedidaUtils'

const PAGE_SIZE = 10

type StockTone = 'ok' | 'low' | 'out' | 'inactive'

function stockTone(material: Material): StockTone {
  if (!material.activo) return 'inactive'
  if (material.stockActual <= 0) return 'out'
  if (material.stockActual <= material.stockMinimo) return 'low'
  return 'ok'
}

function stockLabel(tone: StockTone): string {
  if (tone === 'out') return 'Agotado'
  if (tone === 'low') return 'Stock bajo'
  if (tone === 'inactive') return 'Inactivo'
  return 'Disponible'
}

function materialCode(id: number): string {
  return `MAT-${String(id).padStart(3, '0')}`
}

/** Quita sufijos de semillas QA/demo para lectura en catálogo. */
function displayLabel(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback
  return (
    value
      .replace(/\s+QA\s+\d{8,}$/i, '')
      .replace(/\s+Demo\s+\d{10,}$/i, '')
      .replace(/\s+\d{10,}$/g, '')
      .replace(/\s+QA$/i, '')
      .trim() || value
  )
}

function formatMoveDate(iso: string): string {
  const day = iso.slice(0, 10)
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  if (!match) return day
  return `${match[3]}/${match[2]}/${match[1]}`
}

export default function MaterialesPage() {
  const location = useLocation()
  const routeState = location.state as
    | { success?: string; warning?: string }
    | null
  const routeSuccess = routeState?.success
  const routeWarning = routeState?.warning

  const [searchInput, setSearchInput] = useState('')
  const [nombre, setNombre] = useState('')
  const [activo, setActivo] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [proveedorId, setProveedorId] = useState('')
  const [page, setPage] = useState(1)
  const [changingId, setChangingId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [moves, setMoves] = useState<MovimientoInventario[]>([])
  const [movesLoading, setMovesLoading] = useState(false)
  const [movesError, setMovesError] = useState<string | null>(null)
  const [kpi, setKpi] = useState<{
    total: number | null
    activos: number | null
    stockBajo: number | null
    solicitudes: number | null
    loading: boolean
    error: string | null
  }>({
    total: null,
    activos: null,
    stockBajo: null,
    solicitudes: null,
    loading: false,
    error: null,
  })
  const [actionMessage, setActionMessage] = useState<{
    kind: 'success' | 'error' | 'warning'
    text: string
  } | null>(() => {
    if (routeSuccess) return { kind: 'success', text: routeSuccess }
    if (routeWarning) return { kind: 'warning', text: routeWarning }
    return null
  })

  const latestSearch = useRef('')
  const { user, logout } = useAuth()
  const currentRole = normalizeInternalRole(user?.role)
  const canManage = currentRole === InternalAdminRoleName.Administradora
  const canViewMoves =
    currentRole === InternalAdminRoleName.Administradora ||
    currentRole === InternalAdminRoleName.Secretaria
  const canCreate = canManage
  const isNarrow =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches
  const [isMobile, setIsMobile] = useState(isNarrow)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)')
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const value = searchInput.trim()
      if (value !== latestSearch.current) {
        latestSearch.current = value
        setNombre(value)
        setPage(1)
      }
    }, 400)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const { result, loading, error, refetch } = useMateriales({
    nombre: nombre || undefined,
    activo: activo === '' ? undefined : activo === 'true',
    idCategoria: categoriaId ? Number(categoriaId) : undefined,
    idProveedor: proveedorId ? Number(proveedorId) : undefined,
    page,
    limit: PAGE_SIZE,
  })

  const {
    result: categorias,
    loading: categoriasLoading,
    error: categoriasError,
    refetch: refetchCategorias,
  } = useCategorias({ page: 1, limit: 100 })

  const {
    result: proveedores,
    loading: proveedoresLoading,
    error: proveedoresError,
    refetch: refetchProveedores,
  } = useProveedores({ page: 1, limit: 100 })

  const filtered = Boolean(
    searchInput.trim() || activo || categoriaId || proveedorId,
  )

  useEffect(() => {
    if (!canManage && currentRole !== InternalAdminRoleName.Secretaria) {
      setKpi({
        total: null,
        activos: null,
        stockBajo: null,
        solicitudes: null,
        loading: false,
        error: null,
      })
      return
    }
    let cancelled = false
    setKpi((prev) => ({ ...prev, loading: true, error: null }))
    ;(async () => {
      try {
        const reporte = await getReporteInventarioAdmin()
        let solicitudes: number | null = null
        if (canManage) {
          try {
            const pending = await getSolicitudesMaterialesAdmin({
              estado: 'PENDIENTE',
              page: 1,
              limit: 1,
            })
            solicitudes = Array.isArray(pending)
              ? pending.length
              : (pending.total ?? pending.data?.length ?? null)
          } catch {
            solicitudes = null
          }
        }
        if (cancelled) return
        setKpi({
          total: reporte.indicadores.totalMateriales,
          activos: reporte.indicadores.materialesActivos,
          stockBajo: reporte.indicadores.materialesStockBajo,
          solicitudes,
          loading: false,
          error: null,
        })
      } catch {
        if (cancelled) return
        setKpi({
          total: null,
          activos: null,
          stockBajo: null,
          solicitudes: null,
          loading: false,
          error: 'No fue posible cargar los indicadores.',
        })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [canManage, currentRole])

  const selected = useMemo(
    () => result.data.find((item) => item.id === selectedId) ?? null,
    [result.data, selectedId],
  )

  useEffect(() => {
    if (!selected || !canViewMoves) {
      setMoves([])
      setMovesError(null)
      setMovesLoading(false)
      return
    }
    let cancelled = false
    setMovesLoading(true)
    setMovesError(null)
    getMovimientosAdmin({ idMaterial: selected.id, page: 1, limit: 5 })
      .then((response) => {
        if (cancelled) return
        setMoves(response.data)
        setMovesLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setMoves([])
        setMovesLoading(false)
        setMovesError('No fue posible cargar los movimientos.')
      })
    return () => {
      cancelled = true
    }
  }, [selected, canViewMoves])

  useEffect(() => {
    if (selectedId == null) return
    if (!result.data.some((item) => item.id === selectedId)) {
      setSelectedId(null)
      setDetailOpen(false)
    }
  }, [result.data, selectedId])

  const handleStateChange = async (material: Material, nextActivo: boolean) => {
    if (changingId !== null) return
    setChangingId(material.id)
    setActionMessage(null)
    try {
      await updateMaterialEstado(material.id, nextActivo)
      setActionMessage({
        kind: 'success',
        text: `El material «${material.nombre}» fue ${nextActivo ? 'reactivado' : 'desactivado'} correctamente.`,
      })
      refetch()
    } catch (caught) {
      const parsed = parseMaterialEstadoError(caught)
      setActionMessage({ kind: 'error', text: parsed.message })
      if (parsed.status === 404) refetch()
      if (parsed.status === 401) logout()
    } finally {
      setChangingId(null)
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    latestSearch.current = ''
    setNombre('')
    setActivo('')
    setCategoriaId('')
    setProveedorId('')
    setPage(1)
  }

  const openDetail = (material: Material) => {
    setSelectedId(material.id)
    setDetailOpen(true)
  }

  const closeDetail = () => {
    setDetailOpen(false)
    setSelectedId(null)
  }

  const showKpis = canManage || currentRole === InternalAdminRoleName.Secretaria
  const from = result.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, result.total)

  const detailPanel =
    selected && detailOpen ? (
      <aside className="inv-detail" aria-label="Detalle del material">
        <div className="inv-detail__head">
          <div>
            <h2>{displayLabel(selected.nombre, selected.nombre)}</h2>
            <p className="inv-detail__meta">
              {materialCode(selected.id)} · {selected.unidadMedida}
            </p>
          </div>
          <button
            type="button"
            className="inv-btn inv-btn--secondary"
            aria-label="Cerrar detalle"
            onClick={closeDetail}
          >
            <IconX size={18} aria-hidden="true" />
          </button>
        </div>
        <span className={`inv-badge inv-badge--${stockTone(selected) === 'ok' ? 'ok' : stockTone(selected) === 'low' ? 'low' : stockTone(selected) === 'out' ? 'out' : 'inactive'}`}>
          {stockLabel(stockTone(selected))}
        </span>
        <dl>
          <div>
            <dt>Ubicación</dt>
            <dd>{selected.ubicacion || 'Sin ubicación'}</dd>
          </div>
          <div>
            <dt>Existencia</dt>
            <dd>
              {formatCantidadUnidad(selected.stockActual, selected.unidadMedida)}
            </dd>
          </div>
          <div>
            <dt>Stock mínimo</dt>
            <dd>
              {formatCantidadUnidad(selected.stockMinimo, selected.unidadMedida)}
            </dd>
          </div>
          <div>
            <dt>Categoría</dt>
            <dd>
              {displayLabel(selected.categoria?.nombre, 'Sin categoría')}
            </dd>
          </div>
          {canManage ? (
            <div>
              <dt>Proveedor</dt>
              <dd>
                {displayLabel(selected.proveedor?.nombre, 'Sin proveedor')}
              </dd>
            </div>
          ) : null}
        </dl>

        {canViewMoves ? (
          <div>
            <h3 style={{ margin: '0 0 8px', fontSize: '0.95rem' }}>
              Últimos movimientos
            </h3>
            {movesLoading ? (
              <p className="inv-detail__meta">Cargando movimientos…</p>
            ) : null}
            {movesError ? (
              <p className="inv-detail__meta" role="alert">
                {movesError}
              </p>
            ) : null}
            {!movesLoading && !movesError && moves.length === 0 ? (
              <p className="inv-detail__meta">Sin movimientos registrados.</p>
            ) : null}
            {!movesLoading && moves.length > 0 ? (
              <ul className="inv-moves">
                {moves.map((move) => (
                  <li key={move.id}>
                    <span>
                      {move.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}
                      <small style={{ display: 'block', color: '#5b7390' }}>
                        {formatMoveDate(move.fechaMovimiento)}
                      </small>
                    </span>
                    <strong
                      style={{
                        color: move.tipo === 'ENTRADA' ? '#236c51' : '#b93638',
                      }}
                    >
                      {move.tipo === 'ENTRADA' ? '+' : '-'}
                      {formatCantidadUnidad(move.cantidad, selected.unidadMedida)}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div style={{ display: 'grid', gap: 8 }}>
          {canManage ? (
            <Link
              className="inv-btn inv-btn--primary"
              to={materialEditPath(selected.id)}
              state={{ material: selected }}
            >
              Ver detalle / Editar
            </Link>
          ) : (
            <p className="inv-detail__meta">Consulta en solo lectura.</p>
          )}
          {canManage ? (
            <MaterialStateAction
              material={selected}
              disabled={changingId !== null}
              onChange={handleStateChange}
            />
          ) : null}
        </div>
      </aside>
    ) : null

  return (
    <main className="inv-catalog" style={{ display: 'grid', gap: 16 }}>
      <header className="inv-header inv-card">
        <div>
          <h1>Inventario de bodega</h1>
          <p>Control de materiales, existencias y movimientos.</p>
        </div>
        {canCreate ? (
          <Link className="inv-btn inv-btn--primary" to={MATERIAL_NEW_PATH}>
            <IconPlus size={18} aria-hidden="true" />
            Nuevo material
          </Link>
        ) : null}
      </header>

      {showKpis ? (
        <section className="inv-kpis" aria-label="Indicadores de inventario">
          <article className="inv-kpi">
            <div className="inv-kpi__top">
              <p className="inv-kpi__label">Materiales registrados</p>
              <span className="inv-kpi__icon">
                <IconBox size={18} aria-hidden="true" />
              </span>
            </div>
            <p className="inv-kpi__value">
              {kpi.loading ? '…' : (kpi.total ?? '—')}
            </p>
            {kpi.error ? (
              <p className="inv-kpi__hint">{kpi.error}</p>
            ) : (
              <p className="inv-kpi__hint">Total en catálogo</p>
            )}
          </article>
          <article className="inv-kpi">
            <div className="inv-kpi__top">
              <p className="inv-kpi__label">Activos</p>
              <span className="inv-kpi__icon">
                <IconCircleCheck size={18} aria-hidden="true" />
              </span>
            </div>
            <p className="inv-kpi__value">
              {kpi.loading ? '…' : (kpi.activos ?? '—')}
            </p>
            <p className="inv-kpi__hint">Disponibles para operar</p>
          </article>
          <article className="inv-kpi">
            <div className="inv-kpi__top">
              <p className="inv-kpi__label">Stock bajo</p>
              <span className="inv-kpi__icon">
                <IconAlertTriangle size={18} aria-hidden="true" />
              </span>
            </div>
            <p className="inv-kpi__value">
              {kpi.loading ? '…' : (kpi.stockBajo ?? '—')}
            </p>
            <p className="inv-kpi__hint">Según stock mínimo</p>
          </article>
          <article className="inv-kpi inv-kpi--accent">
            <div className="inv-kpi__top">
              <p className="inv-kpi__label">Solicitudes pendientes</p>
              <span className="inv-kpi__icon">
                <IconClipboardList size={18} aria-hidden="true" />
              </span>
            </div>
            <p className="inv-kpi__value">
              {canManage
                ? kpi.loading
                  ? '…'
                  : (kpi.solicitudes ?? '—')
                : '—'}
            </p>
            <p className="inv-kpi__hint">
              {canManage ? (
                <Link
                  to={SOLICITUDES_REVISION_PATH}
                  style={{ color: 'inherit', textDecoration: 'underline' }}
                >
                  Revisar solicitudes
                </Link>
              ) : (
                'Consulta administrativa'
              )}
            </p>
          </article>
        </section>
      ) : null}

      {actionMessage ? (
        <div
          className="inv-card"
          style={{
            display: 'flex',
            gap: 12,
            padding: 16,
            alignItems: 'flex-start',
            borderColor:
              actionMessage.kind === 'success'
                ? '#c5d9c8'
                : actionMessage.kind === 'warning'
                  ? '#f5d9a8'
                  : '#f0c4c4',
          }}
          role={actionMessage.kind === 'error' ? 'alert' : 'status'}
        >
          <span>
            {actionMessage.kind === 'success' ? (
              <IconCheck size={22} aria-hidden="true" />
            ) : actionMessage.kind === 'warning' ? (
              <IconAlertTriangle size={22} aria-hidden="true" />
            ) : (
              <IconX size={22} aria-hidden="true" />
            )}
          </span>
          <div>
            <strong>
              {actionMessage.kind === 'success'
                ? 'Operación completada'
                : actionMessage.kind === 'warning'
                  ? 'Atención'
                  : 'No se pudo completar'}
            </strong>
            <p style={{ margin: '4px 0 0' }}>{actionMessage.text}</p>
          </div>
        </div>
      ) : null}

      <div
        className={`inv-workspace${detailOpen && selected && !isMobile ? '' : ' is-single'}`}
      >
        <section className="inv-panel" aria-label="Catálogo de materiales">
          <div className="inv-panel__heading">
            <div>
              <h2>Catálogo de materiales</h2>
              <p>
                {loading
                  ? 'Cargando listado…'
                  : error
                    ? 'No se pudo cargar el listado'
                    : `${result.total} material${result.total === 1 ? '' : 'es'} en esta consulta`}
              </p>
            </div>
          </div>

          <div className="inv-filters">
            <label>
              Buscar material o código
              <input
                type="search"
                value={searchInput}
                maxLength={150}
                placeholder="Buscar material o código…"
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </label>
            <label>
              Categoría
              <select
                value={categoriaId}
                disabled={categoriasLoading}
                onChange={(event) => {
                  setCategoriaId(event.target.value)
                  setPage(1)
                }}
              >
                <option value="">Todas las categorías</option>
                {categorias.data.map((item) => (
                  <option key={item.id} value={item.id}>
                    {displayLabel(item.nombre, item.nombre)}
                    {item.activo ? '' : ' (inactiva)'}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Estado
              <select
                value={activo}
                onChange={(event) => {
                  setActivo(event.target.value)
                  setPage(1)
                }}
              >
                <option value="">Todos los estados</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </label>
            {canManage ? (
              <label>
                Proveedor
                <select
                  value={proveedorId}
                  disabled={proveedoresLoading}
                  onChange={(event) => {
                    setProveedorId(event.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">Todos los proveedores</option>
                  {proveedores.data.map((item) => (
                    <option key={item.id} value={item.id}>
                      {displayLabel(item.nombre, item.nombre)}
                      {item.activo ? '' : ' (inactivo)'}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {filtered ? (
              <button
                type="button"
                className="inv-btn inv-btn--secondary"
                onClick={clearFilters}
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>

          {categoriasError ? (
            <div className="inv-error" role="alert">
              No fue posible cargar el filtro de categorías.{' '}
              <button type="button" className="inv-btn inv-btn--secondary" onClick={refetchCategorias}>
                Reintentar
              </button>
            </div>
          ) : null}
          {canManage && proveedoresError ? (
            <div className="inv-error" role="alert">
              No fue posible cargar el filtro de proveedores.{' '}
              <button type="button" className="inv-btn inv-btn--secondary" onClick={refetchProveedores}>
                Reintentar
              </button>
            </div>
          ) : null}

          {loading ? (
            <div className="inv-state" role="status">
              Cargando materiales…
            </div>
          ) : null}

          {!loading && error ? (
            <div className="inv-error" role="alert">
              <p>{error}</p>
              <button type="button" className="inv-btn inv-btn--primary" onClick={refetch}>
                Reintentar
              </button>
            </div>
          ) : null}

          {!loading && !error && result.data.length === 0 ? (
            <div className="inv-empty">
              <h2 style={{ margin: '0 0 8px', color: '#123f70' }}>
                {filtered ? 'No hay coincidencias' : 'Aún no hay materiales'}
              </h2>
              <p style={{ margin: '0 0 12px' }}>
                {filtered
                  ? 'Pruebe con otros términos o limpie los filtros.'
                  : 'Los materiales registrados aparecerán aquí.'}
              </p>
              {filtered ? (
                <button
                  type="button"
                  className="inv-btn inv-btn--secondary"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </button>
              ) : canCreate ? (
                <Link className="inv-btn inv-btn--primary" to={MATERIAL_NEW_PATH}>
                  <IconPlus size={18} aria-hidden="true" />
                  Nuevo material
                </Link>
              ) : null}
            </div>
          ) : null}

          {!loading && !error && result.data.length > 0 ? (
            <>
              <div className="inv-table-wrap">
                <table className="inv-table inv-table--materials">
                  <caption className="visually-hidden">
                    Listado de materiales
                  </caption>
                  <colgroup>
                    <col className="inv-col-code" />
                    <col className="inv-col-material" />
                    <col className="inv-col-category" />
                    <col className="inv-col-location" />
                    <col className="inv-col-stock" />
                    <col className="inv-col-min" />
                    <col className="inv-col-status" />
                    <col className="inv-col-actions" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col">Código</th>
                      <th scope="col">Material</th>
                      <th scope="col">Categoría</th>
                      <th scope="col">Ubicación</th>
                      <th scope="col">Existencia</th>
                      <th scope="col">Mínimo</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((material) => {
                      const tone = stockTone(material)
                      const selectedRow = material.id === selectedId
                      const nombre = displayLabel(material.nombre, material.nombre)
                      const categoria = displayLabel(
                        material.categoria?.nombre,
                        'Sin categoría',
                      )
                      const ubicacion = material.ubicacion || 'Sin ubicación'
                      return (
                        <tr
                          key={material.id}
                          className={selectedRow ? 'is-selected' : undefined}
                          onClick={() => openDetail(material)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              openDetail(material)
                            }
                          }}
                          tabIndex={0}
                          aria-selected={selectedRow}
                        >
                          <td data-label="Código">
                            <code className="inv-code">{materialCode(material.id)}</code>
                          </td>
                          <td data-label="Material">
                            <div className="inv-material-cell">
                              <span className="inv-material-cell__icon" aria-hidden="true">
                                <IconPackage size={16} />
                              </span>
                              <div className="inv-material-cell__text">
                                <strong className="inv-truncate" title={nombre}>
                                  {nombre}
                                </strong>
                                <small>{material.unidadMedida}</small>
                              </div>
                            </div>
                          </td>
                          <td data-label="Categoría">
                            <span className="inv-truncate" title={categoria}>
                              {categoria}
                            </span>
                          </td>
                          <td data-label="Ubicación">
                            <span className="inv-truncate" title={ubicacion}>
                              {ubicacion}
                            </span>
                          </td>
                          <td data-label="Existencia" className="inv-num">
                            <strong>
                              {material.stockActual}{' '}
                              <span className="inv-unit">
                                {pluralizeUnidad(
                                  material.unidadMedida,
                                  material.stockActual,
                                )}
                              </span>
                            </strong>
                          </td>
                          <td data-label="Mínimo" className="inv-num">
                            {material.stockMinimo}
                          </td>
                          <td data-label="Estado">
                            <span
                              className={`inv-badge inv-badge--${tone === 'ok' ? 'ok' : tone === 'low' ? 'low' : tone === 'out' ? 'out' : 'inactive'}`}
                            >
                              {stockLabel(tone)}
                            </span>
                          </td>
                          <td
                            data-label="Acciones"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {canManage ? (
                              <div className="inv-row-actions">
                                <Link
                                  className="inv-btn inv-btn--secondary inv-row-action"
                                  to={materialEditPath(material.id)}
                                  state={{ material }}
                                >
                                  Editar
                                </Link>
                                <MaterialStateAction
                                  material={material}
                                  disabled={changingId !== null}
                                  onChange={handleStateChange}
                                />
                              </div>
                            ) : (
                              <span className="inv-muted-text">Solo lectura</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {result.totalPages > 0 ? (
                <nav className="inv-pagination" aria-label="Paginación de materiales">
                  <span>
                    Mostrando {from}–{to} de {result.total} materiales
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="inv-btn inv-btn--secondary"
                      disabled={page <= 1}
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                    >
                      Anterior
                    </button>
                    <span style={{ alignSelf: 'center' }}>
                      {page} / {result.totalPages}
                    </span>
                    <button
                      type="button"
                      className="inv-btn inv-btn--secondary"
                      disabled={page >= result.totalPages}
                      onClick={() =>
                        setPage((value) => Math.min(result.totalPages, value + 1))
                      }
                    >
                      Siguiente
                    </button>
                  </div>
                </nav>
              ) : null}
            </>
          ) : null}
        </section>

        {!isMobile && detailOpen && selected ? detailPanel : null}
      </div>

      {isMobile && detailOpen && selected ? (
        <div className="inv-detail-drawer" role="dialog" aria-modal="true">
          {detailPanel}
        </div>
      ) : null}
    </main>
  )
}
