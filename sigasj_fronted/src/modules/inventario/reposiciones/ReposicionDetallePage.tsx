import { useEffect, useMemo, useState } from 'react'
import { IconArrowLeft, IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import { REPOSICIONES_PATH } from '../inventarioPaths'
import { getProveedores } from '../proveedores/proveedoresApi'
import {
  getReposicionAdmin,
  patchReposicionEstadoAdmin,
  registrarCompraReposicionAdmin,
} from './reposicionesApi'
import {
  etiquetaAccionReposicion,
  formatReposicionEstado,
  formatReposicionFecha,
  formatReposicionOrigen,
  getHttpErrorStatus,
  getReposicionCodigo,
  getReposicionProveedorNombre,
  getReposicionResponsable,
  puedeConfirmarRecepcion,
  puedeRegistrarCompra,
  reposicionErrorMessage,
  siguienteEstadoReposicion,
  toIsoFechaCompra,
} from './reposicionesUtils'
import type { EstadoReposicion, ReposicionMaterial } from './types'

type CompraItemDraft = {
  idMaterial: number
  cantidad: number
  observacion: string
}

type ConfirmAction = 'compra' | 'recepcion' | 'estado' | null

export default function ReposicionDetallePage() {
  const { id } = useParams<{ id: string }>()
  const reposicionId = Number(id)
  const navigate = useNavigate()
  const [reposicion, setReposicion] = useState<ReposicionMaterial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [proveedoresLoading, setProveedoresLoading] = useState(false)
  const [proveedoresError, setProveedoresError] = useState('')
  const [proveedorId, setProveedorId] = useState('')
  const [fechaCompra, setFechaCompra] = useState('')
  const [referenciaCompra, setReferenciaCompra] = useState('')
  const [observacionCompra, setObservacionCompra] = useState('')
  const [compraItems, setCompraItems] = useState<CompraItemDraft[]>([])
  const [proveedores, setProveedores] = useState<{ id: number; nombre: string; activo: boolean }[]>([])
  const [busy, setBusy] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)

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
        setCompraItems(
          (response.detalles ?? []).map((detalle) => ({
            idMaterial: detalle.idMaterial,
            cantidad: detalle.cantidad,
            observacion: '',
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

  const mostrarCompra = reposicion ? puedeRegistrarCompra(String(reposicion.estado)) : false
  const mostrarRecepcion = reposicion ? puedeConfirmarRecepcion(String(reposicion.estado)) : false
  const accionEstado = reposicion ? etiquetaAccionReposicion(String(reposicion.estado)) : null
  const siguienteEstado = reposicion ? siguienteEstadoReposicion(String(reposicion.estado)) : null

  useEffect(() => {
    if (!mostrarCompra) return
    let active = true
    setProveedoresLoading(true)
    void getProveedores({ activo: true, page: 1, limit: 100 })
      .then((response) => {
        if (!active) return
        setProveedores(response.data.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          activo: item.activo,
        })))
        setProveedoresError('')
      })
      .catch(() => {
        if (!active) return
        setProveedoresError('No fue posible cargar los proveedores.')
      })
      .finally(() => { if (active) setProveedoresLoading(false) })
    return () => { active = false }
  }, [mostrarCompra])

  const retry = () => {
    setError('')
    setSuccess('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  const updateCantidad = (idMaterial: number, cantidad: number) => {
    setCompraItems((items) => items.map((item) => (
      item.idMaterial === idMaterial ? { ...item, cantidad } : item
    )))
  }

  const updateObservacionItem = (idMaterial: number, observacion: string) => {
    setCompraItems((items) => items.map((item) => (
      item.idMaterial === idMaterial ? { ...item, observacion } : item
    )))
  }

  const compraValida = useMemo(() => {
    if (!proveedorId || !fechaCompra) return false
    return compraItems.every((item) => Number.isInteger(item.cantidad) && item.cantidad > 0)
  }, [compraItems, fechaCompra, proveedorId])

  const confirmarCompra = async () => {
    if (!reposicion || busy || !compraValida) return
    setBusy(true)
    setConfirmAction(null)
    setError('')
    setSuccess('')
    try {
      const updated = await registrarCompraReposicionAdmin(reposicion.id, {
        idProveedor: Number(proveedorId),
        fechaCompra: toIsoFechaCompra(fechaCompra),
        ...(referenciaCompra.trim() ? { referenciaCompra: referenciaCompra.trim() } : {}),
        ...(observacionCompra.trim() ? { observacion: observacionCompra.trim() } : {}),
        detalles: compraItems.map((item) => ({
          idMaterial: item.idMaterial,
          cantidad: item.cantidad,
          ...(item.observacion.trim() ? { observacion: item.observacion.trim() } : {}),
        })),
      })
      setReposicion(updated)
      setSuccess('La compra quedó registrada. La reposición pasó a pendiente de recepción y las existencias no se modificaron.')
    } catch (requestError) {
      if (getHttpErrorStatus(requestError) === 401) {
        navigate('/login', { replace: true })
        return
      }
      setError(reposicionErrorMessage(requestError, 'compra'))
      if ([400, 404, 409].includes(getHttpErrorStatus(requestError) ?? 0)) {
        setLoading(true)
        setReloadKey((value) => value + 1)
      }
    } finally {
      setBusy(false)
    }
  }

  const confirmarRecepcion = async () => {
    if (!reposicion || busy) return
    setBusy(true)
    setConfirmAction(null)
    setError('')
    setSuccess('')
    try {
      const updated = await patchReposicionEstadoAdmin(reposicion.id, 'RECIBIDA')
      setReposicion(updated)
      setSuccess('La recepción quedó registrada. Revise las existencias al registrar la entrada en bodega si aún no se reflejó el stock.')
    } catch (requestError) {
      if (getHttpErrorStatus(requestError) === 401) {
        navigate('/login', { replace: true })
        return
      }
      setError(reposicionErrorMessage(requestError, 'recepcion'))
    } finally {
      setBusy(false)
    }
  }

  const confirmarCambioEstado = async () => {
    if (!reposicion || busy || !siguienteEstado) return
    setBusy(true)
    setConfirmAction(null)
    setError('')
    setSuccess('')
    try {
      const updated = await patchReposicionEstadoAdmin(
        reposicion.id,
        siguienteEstado as EstadoReposicion,
      )
      setReposicion(updated)
      setSuccess(
        siguienteEstado === 'EN_GESTION'
          ? 'La reposición quedó en gestión.'
          : 'La reposición se marcó como completada.',
      )
    } catch (requestError) {
      if (getHttpErrorStatus(requestError) === 401) {
        navigate('/login', { replace: true })
        return
      }
      setError(reposicionErrorMessage(requestError, 'estado'))
    } finally {
      setBusy(false)
    }
  }

  const onConfirmDialog = () => {
    if (confirmAction === 'compra') void confirmarCompra()
    if (confirmAction === 'recepcion') void confirmarRecepcion()
    if (confirmAction === 'estado') void confirmarCambioEstado()
  }

  return (
    <section className="material-detail" aria-labelledby="reposicion-detail-title">
      <Link className="material-detail__back" to={REPOSICIONES_PATH}>
        <IconArrowLeft size={18} aria-hidden="true" /> Volver a reposiciones
      </Link>
      {loading ? (
        <div className="material-tracking__state" role="status">
          <span className="material-request__spinner" />Cargando reposición…
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
              <p className="material-request__eyebrow">Inventario · Reposición</p>
              <h1 id="reposicion-detail-title">{getReposicionCodigo(reposicion)}</h1>
              <p>Generada el {formatReposicionFecha(reposicion.fechaGeneracion)}</p>
            </div>
            <span className="material-tracking__badge" data-status={String(reposicion.estado).toUpperCase()}>
              {formatReposicionEstado(String(reposicion.estado))}
            </span>
          </header>
          <dl className="material-detail__summary">
            <div><dt>Origen</dt><dd>{formatReposicionOrigen(String(reposicion.origen))}</dd></div>
            <div><dt>Responsable</dt><dd>{getReposicionResponsable(reposicion)}</dd></div>
            <div><dt>Proveedor</dt><dd>{getReposicionProveedorNombre(reposicion)}</dd></div>
            {reposicion.idAlertaReposicion ? (
              <div><dt>Alerta relacionada</dt><dd>#{reposicion.idAlertaReposicion}</dd></div>
            ) : null}
            {reposicion.idSolicitudMaterial ? (
              <div><dt>Solicitud relacionada</dt><dd>#{reposicion.idSolicitudMaterial}</dd></div>
            ) : null}
            {reposicion.fechaCompra ? (
              <div><dt>Fecha de compra</dt><dd>{formatReposicionFecha(reposicion.fechaCompra)}</dd></div>
            ) : null}
            {reposicion.fechaRecepcion ? (
              <div><dt>Fecha de recepción</dt><dd>{formatReposicionFecha(reposicion.fechaRecepcion)}</dd></div>
            ) : null}
            {reposicion.observacion ? (
              <div className="material-detail__summary-wide"><dt>Observación</dt><dd>{reposicion.observacion}</dd></div>
            ) : null}
          </dl>
          {accionEstado ? (
            <div className="material-review__actions">
              <button
                type="button"
                className="material-review__approve"
                disabled={busy}
                onClick={() => setConfirmAction('estado')}
              >
                {busy ? 'Procesando…' : accionEstado}
              </button>
            </div>
          ) : null}
          <div className="material-detail__materials">
            <h2>Materiales a reponer</h2>
            <div className="material-tracking__table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Cantidad</th>
                    <th>Existencia</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {(reposicion.detalles ?? []).map((detalle) => (
                    <tr key={detalle.id}>
                      <td data-label="Material">
                        <strong>{detalle.material?.nombre ?? `Material #${detalle.idMaterial}`}</strong>
                      </td>
                      <td data-label="Cantidad">
                        {detalle.cantidad} {detalle.material?.unidadMedida ?? ''}
                      </td>
                      <td data-label="Existencia">{detalle.material?.stockActual ?? '—'}</td>
                      <td data-label="Nota">{detalle.observacion || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!reposicion.detalles?.length ? (
              <p className="material-detail__no-materials">No se recibió información de materiales para esta reposición.</p>
            ) : null}
          </div>
          {mostrarCompra ? (
            <section className="material-detail__materials" aria-labelledby="reposicion-compra-title">
              <h2 id="reposicion-compra-title">Registrar compra</h2>
              <p>Complete los datos de la compra. El registro no modificará las existencias del inventario.</p>
              <div className="material-tracking__filters">
                <label htmlFor="reposicion-proveedor">
                  <span>Proveedor</span>
                  <select
                    id="reposicion-proveedor"
                    value={proveedorId}
                    disabled={busy || proveedoresLoading}
                    onChange={(event) => setProveedorId(event.target.value)}
                  >
                    <option value="">Seleccione un proveedor</option>
                    {proveedores.map((proveedor) => (
                      <option key={proveedor.id} value={proveedor.id}>{proveedor.nombre}</option>
                    ))}
                  </select>
                </label>
                <label htmlFor="reposicion-fecha-compra">
                  <span>Fecha de compra</span>
                  <input
                    id="reposicion-fecha-compra"
                    type="date"
                    value={fechaCompra}
                    disabled={busy}
                    onChange={(event) => setFechaCompra(event.target.value)}
                  />
                </label>
                <label htmlFor="reposicion-referencia">
                  <span>Referencia (factura u orden)</span>
                  <input
                    id="reposicion-referencia"
                    type="text"
                    maxLength={100}
                    value={referenciaCompra}
                    disabled={busy}
                    onChange={(event) => setReferenciaCompra(event.target.value)}
                  />
                </label>
              </div>
              {proveedoresError ? (
                <div className="material-tracking__state material-tracking__state--error" role="alert">{proveedoresError}</div>
              ) : null}
              <div className="material-tracking__table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Cantidad comprada</th>
                      <th>Observación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compraItems.map((item) => {
                      const detalle = reposicion.detalles?.find((entry) => entry.idMaterial === item.idMaterial)
                      return (
                        <tr key={item.idMaterial}>
                          <td data-label="Material">
                            <strong>{detalle?.material?.nombre ?? `Material #${item.idMaterial}`}</strong>
                          </td>
                          <td data-label="Cantidad comprada">
                            <input
                              type="number"
                              min={1}
                              value={item.cantidad}
                              disabled={busy}
                              onChange={(event) => updateCantidad(item.idMaterial, Number(event.target.value))}
                            />
                          </td>
                          <td data-label="Observación">
                            <input
                              type="text"
                              maxLength={255}
                              value={item.observacion}
                              disabled={busy}
                              onChange={(event) => updateObservacionItem(item.idMaterial, event.target.value)}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <label className="material-review__motivo">
                <span>Observación general de la compra</span>
                <textarea
                  value={observacionCompra}
                  maxLength={2000}
                  disabled={busy}
                  onChange={(event) => setObservacionCompra(event.target.value)}
                />
              </label>
              <div className="material-review__actions">
                <button
                  type="button"
                  className="material-review__approve"
                  disabled={busy || !compraValida}
                  onClick={() => setConfirmAction('compra')}
                >
                  {busy ? 'Registrando…' : 'Registrar compra'}
                </button>
              </div>
            </section>
          ) : null}
          {mostrarRecepcion ? (
            <section className="material-detail__materials" aria-labelledby="reposicion-recepcion-title">
              <h2 id="reposicion-recepcion-title">Confirmar recepción</h2>
              <p>Confirme que los materiales comprados llegaron a bodega. Esta acción actualiza el estado de la reposición.</p>
              <div className="material-review__actions">
                <button
                  type="button"
                  className="material-review__approve"
                  disabled={busy}
                  onClick={() => setConfirmAction('recepcion')}
                >
                  {busy ? 'Procesando…' : 'Confirmar recepción'}
                </button>
              </div>
            </section>
          ) : null}
          {!mostrarCompra && !mostrarRecepcion && !accionEstado ? (
            <aside className="material-detail__notice">
              <strong>Reposición procesada</strong>
              <span>Esta reposición ya no admite nuevas acciones desde este flujo.</span>
            </aside>
          ) : null}
        </>
      ) : null}
      <ConfirmDialog
        isOpen={confirmAction === 'compra'}
        title="Registrar compra"
        message="¿Confirma registrar esta compra? Las existencias del inventario no se modificarán hasta confirmar la recepción."
        confirmLabel="Registrar compra"
        onCancel={() => setConfirmAction(null)}
        onConfirm={onConfirmDialog}
      />
      <ConfirmDialog
        isOpen={confirmAction === 'recepcion'}
        title="Confirmar recepción"
        message="¿Confirma que los materiales de esta reposición fueron recibidos en bodega?"
        confirmLabel="Confirmar recepción"
        onCancel={() => setConfirmAction(null)}
        onConfirm={onConfirmDialog}
      />
      <ConfirmDialog
        isOpen={confirmAction === 'estado'}
        title={siguienteEstado === 'COMPLETADA' ? 'Completar reposición' : 'Actualizar reposición'}
        message={
          siguienteEstado === 'COMPLETADA'
            ? '¿Marca esta reposición como completada?'
            : '¿Pone esta reposición en gestión?'
        }
        confirmLabel={accionEstado ?? 'Confirmar'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={onConfirmDialog}
      />
    </section>
  )
}
