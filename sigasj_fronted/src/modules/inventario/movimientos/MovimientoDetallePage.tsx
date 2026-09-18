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
    <section className="material-detail" aria-labelledby="movimiento-detalle-title">
      <header className="material-detail__header">
        <div>
          <p className="material-request__eyebrow">Inventario · Historial</p>
          <h1 id="movimiento-detalle-title">Detalle del movimiento</h1>
          <p>Consulta de solo lectura sobre la operación registrada en bodega.</p>
        </div>
        <Link className="material-detail__back" to={MOVIMIENTOS_PATH}>
          <IconArrowLeft size={16} aria-hidden="true" />
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
        <article>
          <dl className="material-detail__summary">
            <div>
              <dt>Identificador</dt>
              <dd>MOV-{String(movimiento.id).padStart(5, '0')}</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>
                <span className="material-tracking__badge" data-status={movimiento.tipo}>
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
