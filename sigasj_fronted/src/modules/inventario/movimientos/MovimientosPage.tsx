import { useEffect, useState } from 'react'
import { IconArrowLeft, IconArrowsExchange, IconCalendar, IconEye, IconHistory, IconPackage, IconRefresh, IconTrash } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
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
        <div>
          <p className="material-request__eyebrow !mb-2 !text-xs !font-black !tracking-[0.12em] !text-cyan-700">Inventario · Administración</p>
          <h1 className="!text-3xl !font-black !tracking-tight !text-slate-900" id="movimientos-title">Historial de movimientos</h1>
          <p className="!mt-2 !text-base !text-slate-500">Consulte las entradas y salidas registradas sobre los materiales de bodega.</p>
        </div>
        <Link className="material-tracking__detail-link group !inline-flex !items-center !gap-2.5 !rounded-2xl !border !border-blue-200 !bg-white !px-5 !py-3 !font-extrabold !text-blue-700 !shadow-[0_8px_20px_rgba(37,99,235,0.12)] !transition-all !duration-300 !ease-out hover:!-translate-y-1 hover:!scale-[1.02] hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.2)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" to={MATERIALES_PATH}><IconArrowLeft className="!transition-transform !duration-300 group-hover:!-translate-x-1.5 motion-reduce:!transform-none" size={19} aria-hidden="true" />Volver al catálogo</Link>
      </header>

      <div className="material-tracking__filters !grid !grid-cols-1 !items-end !gap-5 !rounded-3xl !border-blue-100 !bg-linear-to-br !from-white !via-blue-50/30 !to-sky-50/60 !p-6 !shadow-[0_12px_32px_rgba(30,90,156,0.09)] md:!grid-cols-2 xl:!grid-cols-4 [&>label]:!w-full [&>label]:!justify-items-start [&>label]:!text-left [&>label>span:first-child]:!ml-1 [&>label>span:first-child]:!w-auto [&>label>span:first-child]:!justify-self-start [&>label>span:first-child]:!text-left [&_.provider-admin__control]:!w-full [&_.provider-admin__control]:!rounded-2xl [&_.provider-admin__control]:!border [&_.provider-admin__control]:!border-blue-100 [&_.provider-admin__control]:!bg-white [&_.provider-admin__control]:!shadow-[0_7px_18px_rgba(37,99,235,0.08)] [&_.provider-admin__control]:!transition-all [&_.provider-admin__control]:!duration-300 hover:[&_.provider-admin__control]:!border-blue-300 hover:[&_.provider-admin__control]:!shadow-[0_10px_24px_rgba(37,99,235,0.14)] focus-within:[&_.provider-admin__control]:!border-blue-400 focus-within:[&_.provider-admin__control]:!ring-4 focus-within:[&_.provider-admin__control]:!ring-blue-100">
        <InventoryFormField label="Tipo" icon={<IconArrowsExchange size={20} aria-hidden="true" />}>
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
        </InventoryFormField>

        <InventoryFormField label="Material" icon={<IconPackage size={20} aria-hidden="true" />}>
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
        </InventoryFormField>

        <InventoryFormField label="Desde" icon={<IconCalendar size={20} aria-hidden="true" />}>
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

        <InventoryFormField label="Hasta" icon={<IconCalendar size={20} aria-hidden="true" />}>
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
          <button type="button" className="material-tracking__filter-action group sm:!col-span-2 xl:!col-span-4 xl:!ml-auto !rounded-2xl !border-blue-200 !bg-white !px-5 !font-extrabold !text-blue-700 !shadow-[0_7px_18px_rgba(37,99,235,0.1)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_11px_24px_rgba(37,99,235,0.18)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" onClick={clearFilters}>
            <IconTrash className="!transition-transform !duration-300 group-hover:!rotate-6 group-hover:!scale-110 motion-reduce:!transform-none" size={17} aria-hidden="true" /> Limpiar filtros
          </button>
        ) : null}
      </div>

      {!loading && !error ? (
        <p className="!m-0 !inline-flex !w-fit !items-center !gap-2.5 !rounded-2xl !border !border-cyan-200 !bg-linear-to-r !from-cyan-50 !to-blue-50 !px-4 !py-2.5 !font-bold !text-cyan-800 !shadow-[0_7px_18px_rgba(8,145,178,0.1)]" role="status"><IconHistory size={19} aria-hidden="true" />{total} {total === 1 ? 'movimiento registrado' : 'movimientos registrados'}</p>
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
        <div className="material-tracking__table-wrap !overflow-hidden !rounded-3xl !border-blue-100 !bg-white !shadow-[0_14px_34px_rgba(30,90,156,0.1)]">
          <table className="[&_thead]:!bg-linear-to-r [&_thead]:!from-slate-50 [&_thead]:!to-blue-50/70 [&_th]:!bg-transparent [&_th]:!py-4 [&_th]:!font-extrabold [&_th]:!tracking-[0.06em] [&_tbody_tr]:!transition-colors [&_tbody_tr]:!duration-200 hover:[&_tbody_tr]:!bg-blue-50/50 [&_td]:!py-4">
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
                    <span className={`material-tracking__badge !inline-flex !items-center !gap-2 !rounded-full !px-3.5 !py-2 !font-extrabold !shadow-sm ${movimiento.tipo === 'ENTRADA' ? '!border-emerald-200 !bg-emerald-50 !text-emerald-700' : '!border-rose-200 !bg-rose-50 !text-rose-700'}`} data-status={movimiento.tipo}>
                      <span className={`size-2 rounded-full ${movimiento.tipo === 'ENTRADA' ? 'bg-emerald-500' : 'bg-rose-500'}`} aria-hidden="true" />
                      {formatMovimientoTipo(movimiento.tipo)}
                    </span>
                  </td>
                  <td data-label="Cantidad">{formatMovimientoCantidad(movimiento)}</td>
                  <td data-label="Responsable">{getMovimientoResponsable(movimiento)}</td>
                  <td data-label="Referencia">{getMovimientoReferencia(movimiento)}</td>
                  <td data-label="Acciones">
                    <Link className="material-tracking__detail-link group !gap-2 !rounded-xl !border-blue-100 !bg-blue-50/70 !px-3.5 !py-2 !text-blue-700 !shadow-none !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-blue-300 hover:!bg-blue-100 hover:!shadow-[0_7px_16px_rgba(37,99,235,0.14)] motion-reduce:!transform-none motion-reduce:!transition-none" to={movimientoDetailPath(movimiento.id)}>
                      <IconEye className="!transition-transform !duration-300 group-hover:!scale-110" size={17} aria-hidden="true" /> Ver detalle
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
