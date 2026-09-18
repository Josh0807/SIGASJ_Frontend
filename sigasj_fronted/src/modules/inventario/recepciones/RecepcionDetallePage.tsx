import { useEffect, useMemo, useState } from 'react'
import { IconArrowLeft, IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import { RECEPCIONES_PATH } from '../inventarioPaths'
import { getReposicionAdmin } from '../reposiciones/reposicionesApi'
import {
  formatReposicionEstado,
  formatReposicionFecha,
  getHttpErrorStatus,
  getReposicionCodigo,
  getReposicionProveedorNombre,
  puedeConfirmarRecepcion,
  reposicionErrorMessage,
} from '../reposiciones/reposicionesUtils'
import type { ReposicionMaterial } from '../reposiciones/types'
import { registrarRecepcionAdmin } from './recepcionesApi'
import { recepcionErrorMessage, recepcionItemsValidos } from './recepcionesUtils'
import type { RecepcionItemPayload } from './types'

export default function RecepcionDetallePage() {
  const { id } = useParams<{ id: string }>()
  const reposicionId = Number(id)
  const navigate = useNavigate()
  const [reposicion, setReposicion] = useState<ReposicionMaterial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [recepcionItems, setRecepcionItems] = useState<RecepcionItemPayload[]>([])
  const [observacion, setObservacion] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    let active = true
    if (!Number.isInteger(reposicionId) || reposicionId <= 0) {
      queueMicrotask(() => {
        if (active) {
          setError('La reposición indicada no es válida.')
          setLoading(false)
        }
      })
      return () => { active = false }
    }
    void getReposicionAdmin(reposicionId)
      .then((response) => {
        if (!active) return
        setReposicion(response)
        setRecepcionItems(
          (response.detalles ?? []).map((detalle) => ({
            idMaterial: detalle.idMaterial,
            cantidad: detalle.cantidad,
          })),
        )
      })
      .catch((requestError) => {
        if (!active) return
        if (getHttpErrorStatus(requestError) === 401) {
          navigate('/login', { replace: true })
          return
        }
        setError(reposicionErrorMessage(requestError, 'detalle'))
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [navigate, reposicionId, reloadKey])

  const puedeRecibir = reposicion ? puedeConfirmarRecepcion(String(reposicion.estado)) : false
  const recepcionValida = useMemo(() => recepcionItemsValidos(recepcionItems), [recepcionItems])

  const retry = () => {
    setError('')
    setSuccess('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  const updateCantidad = (idMaterial: number, cantidad: number) => {
    setRecepcionItems((items) => items.map((item) => (
      item.idMaterial === idMaterial ? { ...item, cantidad } : item
    )))
  }

  const confirmarRecepcion = async () => {
    if (!reposicion || busy || !recepcionValida || !puedeRecibir) return
    setBusy(true)
    setConfirmOpen(false)
    setError('')
    setSuccess('')
    try {
      const response = await registrarRecepcionAdmin({
        idReposicion: reposicion.id,
        detalles: recepcionItems,
        ...(observacion.trim() ? { observacion: observacion.trim() } : {}),
      })
      setReposicion(response)
      setSuccess(
        response.mensaje
          ?? 'Recepción registrada. El inventario se actualizó con las entradas correspondientes.',
      )
    } catch (requestError) {
      if (getHttpErrorStatus(requestError) === 401) {
        navigate('/login', { replace: true })
        return
      }
      setError(recepcionErrorMessage(requestError))
      if ([400, 404, 409].includes(getHttpErrorStatus(requestError) ?? 0)) {
        setLoading(true)
        setReloadKey((value) => value + 1)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="material-detail" aria-labelledby="recepcion-detail-title">
      <Link className="material-detail__back" to={RECEPCIONES_PATH}>
        <IconArrowLeft size={18} aria-hidden="true" /> Volver a recepciones
      </Link>
      {loading ? (
        <div className="material-tracking__state" role="status">
          <span className="material-request__spinner" />Cargando información de la compra…
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
      {success ? <div className="material-tracking__state" role="status">{success}</div> : null}
      {!loading && reposicion ? (
        <>
          <header className="material-detail__header">
            <div>
              <p className="material-request__eyebrow">Inventario · Recepción</p>
              <h1 id="recepcion-detail-title">{getReposicionCodigo(reposicion)}</h1>
              <p>Compra registrada el {formatReposicionFecha(reposicion.fechaCompra)}</p>
            </div>
            <span className="material-tracking__badge" data-status={String(reposicion.estado).toUpperCase()}>
              {formatReposicionEstado(String(reposicion.estado))}
            </span>
          </header>
          <dl className="material-detail__summary">
            <div><dt>Proveedor</dt><dd>{getReposicionProveedorNombre(reposicion)}</dd></div>
            {reposicion.fechaRecepcion ? (
              <div><dt>Fecha de recepción</dt><dd>{formatReposicionFecha(reposicion.fechaRecepcion)}</dd></div>
            ) : null}
          </dl>
          {puedeRecibir ? (
            <section className="material-detail__materials" aria-labelledby="recepcion-materiales-title">
              <h2 id="recepcion-materiales-title">Materiales a recibir</h2>
              <p>Indique las cantidades recibidas. El sistema generará las entradas de inventario automáticamente.</p>
              <div className="material-tracking__table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Comprado</th>
                      <th>Recibido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recepcionItems.map((item) => {
                      const detalle = reposicion.detalles?.find((entry) => entry.idMaterial === item.idMaterial)
                      return (
                        <tr key={item.idMaterial}>
                          <td data-label="Material">
                            <strong>{detalle?.material?.nombre ?? `Material #${item.idMaterial}`}</strong>
                          </td>
                          <td data-label="Comprado">
                            {detalle?.cantidad ?? '—'} {detalle?.material?.unidadMedida ?? ''}
                          </td>
                          <td data-label="Recibido">
                            <input
                              type="number"
                              min={1}
                              value={item.cantidad}
                              disabled={busy}
                              onChange={(event) => updateCantidad(item.idMaterial, Number(event.target.value))}
                            />
                            {' '}{detalle?.material?.unidadMedida ?? ''}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <label className="material-review__motivo">
                <span>Observación de la recepción</span>
                <textarea
                  value={observacion}
                  maxLength={2000}
                  disabled={busy}
                  onChange={(event) => setObservacion(event.target.value)}
                />
              </label>
              <div className="material-review__actions">
                <button
                  type="button"
                  className="material-review__approve"
                  disabled={busy || !recepcionValida}
                  onClick={() => setConfirmOpen(true)}
                >
                  {busy ? 'Registrando…' : 'Confirmar recepción'}
                </button>
              </div>
            </section>
          ) : (
            <aside className="material-detail__notice">
              <strong>Recepción no disponible</strong>
              <span>Esta reposición ya no está pendiente de recepción o fue procesada previamente.</span>
            </aside>
          )}
        </>
      ) : null}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Confirmar recepción"
        message="¿Confirma que los materiales indicados llegaron a bodega? Se registrarán entradas de inventario y se actualizarán las existencias."
        confirmLabel="Confirmar recepción"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => { void confirmarRecepcion() }}
      />
    </section>
  )
}
