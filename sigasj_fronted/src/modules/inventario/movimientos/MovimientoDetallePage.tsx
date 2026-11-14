import { useEffect, useState } from 'react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import {
  IconArrowLeft,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconRefresh,
} from '@tabler/icons-react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Badge,
  Button,
  MetricPill,
  PageHeader,
} from '../../../shared/ui'
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
    const cancelScheduled = runAfterEffect(() => {
      if (!Number.isInteger(movimientoId) || movimientoId <= 0) {
        setError('El movimiento indicado no es válido.')
        setLoading(false)
        return
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
    })

    return () => {
      active = false
      cancelScheduled()
    }
  }, [movimientoId, navigate, reloadKey])

  const retry = () => {
    setError('')
    setReloadKey((value) => value + 1)
  }

  const isEntrada = movimiento?.tipo === 'ENTRADA'
  const codigo = movimiento
    ? `MOV-${String(movimiento.id).padStart(5, '0')}`
    : ''

  return (
    <section
      className="inv-movimiento-detalle"
      style={{ display: 'grid', gap: 14 }}
      aria-labelledby="movimiento-detalle-title"
    >
      <PageHeader
        title={<span id="movimiento-detalle-title">Detalle del movimiento</span>}
        description="Consulta de solo lectura de la operación registrada en bodega."
        actions={
          <Button
            to={MOVIMIENTOS_PATH}
            variant="secondary"
            leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
          >
            Volver al historial
          </Button>
        }
      />

      {loading ? (
        <div className="inv-state" role="status">
          Cargando detalle…
        </div>
      ) : null}

      {!loading && error ? (
        <Alert
          tone="danger"
          title="No se pudo cargar el movimiento"
          icon={<IconRefresh size={18} aria-hidden="true" />}
        >
          <p className="m-0 mb-3">{error}</p>
          <Button
            variant="primary"
            size="sm"
            onClick={retry}
            leftIcon={<IconRefresh size={16} aria-hidden="true" />}
          >
            Reintentar
          </Button>
        </Alert>
      ) : null}

      {!loading && !error && movimiento ? (
        <article className="inv-panel" style={{ gap: 16 }}>
          <div className="inv-move-hero">
            <div>
              <p className="inv-move-hero__id">{codigo}</p>
              <p className="inv-move-hero__meta">
                {getMovimientoMaterialNombre(movimiento)} ·{' '}
                {formatMovimientoFecha(movimiento.fechaMovimiento)}
              </p>
            </div>
            <div className="inv-move-hero__stats">
              <Badge tone={isEntrada ? 'success' : 'danger'}>
                {isEntrada ? (
                  <IconArrowDownLeft size={14} aria-hidden="true" />
                ) : (
                  <IconArrowUpRight size={14} aria-hidden="true" />
                )}
                {formatMovimientoTipo(movimiento.tipo)}
              </Badge>
              <MetricPill
                label="Cantidad"
                value={movimiento.cantidad}
                unit={movimiento.material?.unidadMedida?.trim() || undefined}
                tone={isEntrada ? 'primary' : 'danger'}
                aria-label={`Cantidad: ${formatMovimientoCantidad(movimiento)}`}
              />
            </div>
          </div>

          <dl className="inv-facts">
            <div>
              <dt>Identificador</dt>
              <dd>{codigo}</dd>
            </div>
            <div>
              <dt>Tipo</dt>
              <dd>{formatMovimientoTipo(movimiento.tipo)}</dd>
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
          </dl>

          <p className="inv-note">
            <strong>Motivo u observación</strong>
            {movimiento.observacion?.trim() || 'Sin observación registrada.'}
          </p>

          {movimiento.documentos && movimiento.documentos.length > 0 ? (
            <section aria-labelledby="movimiento-documentos-title">
              <div className="inv-panel__heading">
                <div>
                  <h2 id="movimiento-documentos-title">Documentos de respaldo</h2>
                  <p>{movimiento.documentos.length} archivo(s)</p>
                </div>
              </div>
              <ul className="inv-moves">
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
