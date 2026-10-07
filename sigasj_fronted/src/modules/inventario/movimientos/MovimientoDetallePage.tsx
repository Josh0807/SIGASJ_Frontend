import { useEffect, useState } from 'react'
import { IconArrowLeft, IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MOVIMIENTOS_PATH } from '../inventarioPaths'
import { getMovimientoAdmin } from './movimientosApi'
import {
  formatMovimientoCantidad,
  formatMovimientoFecha,
  formatMovimientoTipo,
  getHttpErrorStatus,
  getMovimientoMaterialNombre,
  getMovimientoReferencia,
  getMovimientoResponsable,
  movimientoErrorMessage,
} from './movimientosUtils'
import type { MovimientoInventario } from './types'

export default function MovimientoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const movimientoId = Number(id)
  const navigate = useNavigate()
  const [movimiento, setMovimiento] = useState<MovimientoInventario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    if (!Number.isInteger(movimientoId) || movimientoId <= 0) {
      queueMicrotask(() => {
        if (active) {
          setError('El movimiento indicado no es válido.')
          setLoading(false)
        }
      })
      return () => {
        active = false
      }
    }

    setLoading(true)
    void getMovimientoAdmin(movimientoId)
      .then((response) => {
        if (!active) return
        setMovimiento(response)
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
  }, [movimientoId, navigate, reloadKey])

  const retry = () => {
    setError('')
    setReloadKey((value) => value + 1)
  }

  return (
    <section className="material-detail !mx-0 !w-full !max-w-none !gap-6" aria-labelledby="movimiento-detalle-title">
      <header className="material-detail__header !w-full !rounded-3xl !border-sky-100 !bg-white !p-8 !shadow-[0_12px_34px_rgba(30,90,156,0.08)]">
        <div>
          <p className="material-request__eyebrow">Inventario · Historial</p>
          <h1 id="movimiento-detalle-title">Detalle del movimiento</h1>
          <p>Consulta de solo lectura sobre la operación registrada en bodega.</p>
        </div>
        <Link className="material-detail__back group !inline-flex !min-h-12 !items-center !gap-2.5 !rounded-2xl !border !border-blue-200 !bg-white !px-5 !py-3 !font-extrabold !text-blue-700 !shadow-[0_8px_20px_rgba(37,99,235,0.12)] !transition-all !duration-300 !ease-out hover:!-translate-y-1 hover:!scale-[1.02] hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.2)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" to={MOVIMIENTOS_PATH}>
          <IconArrowLeft className="!transition-transform !duration-300 group-hover:!-translate-x-1.5 motion-reduce:!transform-none" size={19} aria-hidden="true" />
          Volver al historial
        </Link>
      </header>

      {loading ? (
        <div className="material-tracking__state" role="status">
          <span className="material-tracking__spinner" aria-hidden="true" />
          Cargando detalle…
        </div>
      ) : null}

      {!loading && error ? (
        <div className="material-tracking__state material-tracking__state--error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={retry}>
            <IconRefresh size={16} aria-hidden="true" />
            Reintentar
          </button>
        </div>
      ) : null}

      {!loading && !error && movimiento ? (
        <article className="!w-full">
          <dl className="material-detail__summary !grid !w-full !grid-cols-1 !gap-4 !rounded-3xl !border-blue-100 !bg-linear-to-br !from-white !via-blue-50/25 !to-sky-50/60 !p-7 !shadow-[0_14px_36px_rgba(30,90,156,0.1)] md:!grid-cols-2 xl:!grid-cols-3 [&>div]:!rounded-2xl [&>div]:!border [&>div]:!border-blue-100 [&>div]:!bg-white/90 [&>div]:!p-5 [&>div]:!shadow-[0_6px_16px_rgba(30,90,156,0.06)] [&>div]:!transition-all [&>div]:!duration-300 hover:[&>div]:!-translate-y-0.5 hover:[&>div]:!border-blue-200 hover:[&>div]:!shadow-[0_10px_22px_rgba(30,90,156,0.11)] [&_dt]:!mb-1 [&_dt]:!font-extrabold [&_dt]:!tracking-[0.07em] [&_dt]:!text-slate-500 [&_dd]:!text-lg [&_dd]:!font-extrabold [&_dd]:!text-[#073b73]">
            <div>
              <dt>Identificador</dt>
              <dd>MOV-{String(movimiento.id).padStart(5, '0')}</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>
                <span className={`material-tracking__badge !inline-flex !items-center !gap-2 !rounded-full !px-3.5 !py-2 !text-sm !font-extrabold !shadow-sm ${movimiento.tipo === 'ENTRADA' ? '!border-emerald-200 !bg-emerald-50 !text-emerald-700' : '!border-rose-200 !bg-rose-50 !text-rose-700'}`} data-status={movimiento.tipo}>
                  <span className={`size-2 rounded-full ${movimiento.tipo === 'ENTRADA' ? 'bg-emerald-500' : 'bg-rose-500'}`} aria-hidden="true" />
                  {formatMovimientoTipo(movimiento.tipo)}
                </span>
              </dd>
            </div>
            <div>
              <dt>Material</dt>
              <dd>{getMovimientoMaterialNombre(movimiento)}</dd>
            </div>
            <div>
              <dt>Cantidad</dt>
              <dd>{formatMovimientoCantidad(movimiento)}</dd>
            </div>
            <div>
              <dt>Fecha y hora</dt>
              <dd>{formatMovimientoFecha(movimiento.fechaMovimiento)}</dd>
            </div>
            <div>
              <dt>Responsable</dt>
              <dd>{getMovimientoResponsable(movimiento)}</dd>
            </div>
            <div>
              <dt>Referencia</dt>
              <dd>{getMovimientoReferencia(movimiento)}</dd>
            </div>
            {movimiento.proveedor?.nombre ? (
              <div>
                <dt>Proveedor</dt>
                <dd>{movimiento.proveedor.nombre}</dd>
              </div>
            ) : null}
            {movimiento.observacion ? (
              <div className="material-detail__summary-wide">
                <dt>Motivo u observación</dt>
                <dd>{movimiento.observacion}</dd>
              </div>
            ) : null}
          </dl>

          {movimiento.documentos && movimiento.documentos.length > 0 ? (
            <section className="material-detail__materials" aria-labelledby="movimiento-documentos-title">
              <h2 id="movimiento-documentos-title">Documentos de respaldo</h2>
              <ul>
                {movimiento.documentos.map((documento) => (
                  <li key={documento.id}>{documento.nombreOriginal}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      ) : null}
    </section>
  )
}
