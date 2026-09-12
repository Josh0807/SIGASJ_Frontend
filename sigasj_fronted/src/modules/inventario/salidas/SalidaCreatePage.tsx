import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import { resolveAuthUserDisplayName } from '../../auth/utils/authUserDisplay'
import { MATERIALES_PATH } from '../inventarioPaths'
import { useMateriales } from '../useMateriales'
import { consultarDisponibilidad, registrarSalida } from './salidasApi'
import { parseRelatedId, salidaError, toSalidaPayload, validateSalida, type SalidaFormErrors } from './salidaUtils'
import type { DisponibilidadMaterial, SalidaFormValues } from './types'

const EMPTY_VALUES: SalidaFormValues = { materialId: '', cantidad: '', observacion: '' }
type Availability = { kind: 'checking' } | { kind: 'valid'; data: DisponibilidadMaterial } | { kind: 'invalid'; message: string } | null

export default function SalidaCreatePage() {
  const { user, logout } = useAuth()
  const [searchParams] = useSearchParams()
  const idAveria = parseRelatedId(searchParams.get('idAveria') ?? searchParams.get('averiaId'))
  const idSolicitud = parseRelatedId(searchParams.get('idSolicitud') ?? searchParams.get('solicitudId'))
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState<SalidaFormErrors>({})
  const [availability, setAvailability] = useState<Availability>(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string; stock?: { previous: number; current: number }; movementId?: number } | null>(null)
  const submitting = useRef(false)
  const { result: materiales, loading, error, refetch } = useMateriales({ activo: true, page: 1, limit: 100 })
  const availableMaterials = materiales.data.filter((item) => item.activo && item.stockActual > 0)
  const selectedMaterial = availableMaterials.find((item) => String(item.id) === values.materialId)
  const numericQuantity = Number(values.cantidad)
  const exceedsKnownStock = Boolean(selectedMaterial && Number.isFinite(numericQuantity) && numericQuantity > selectedMaterial.stockActual)
  const displayedStock = availability?.kind === 'valid' && availability.data.idMaterial === selectedMaterial?.id
    ? availability.data.stockActual
    : selectedMaterial?.stockActual

  useEffect(() => {
    const materialId = Number(values.materialId)
    const cantidad = Number(values.cantidad)
    if (!Number.isInteger(materialId) || materialId <= 0 || !Number.isInteger(cantidad) || cantidad <= 0) {
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setAvailability({ kind: 'checking' })
      consultarDisponibilidad(materialId, cantidad, controller.signal)
        .then((data) => setAvailability(data.disponible ? { kind: 'valid', data } : { kind: 'invalid', message: data.mensaje }))
        .catch((caught) => {
          if (controller.signal.aborted) return
          setAvailability({ kind: 'invalid', message: salidaError(caught) })
          if (/^HTTP 401:/.test(caught instanceof Error ? caught.message : '')) logout()
          if (/^HTTP (400|404):/.test(caught instanceof Error ? caught.message : '')) refetch()
        })
    }, 350)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [logout, refetch, values.materialId, values.cantidad])

  const update = (name: keyof SalidaFormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    if (name === 'materialId' || name === 'cantidad') setAvailability(null)
    setFeedback(null)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = validateSalida(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) { setFeedback({ kind: 'error', text: 'Revise los campos señalados.' }); return }
    if (exceedsKnownStock || availability?.kind === 'invalid') { setFeedback({ kind: 'error', text: availability?.kind === 'invalid' ? availability.message : 'La cantidad supera la existencia disponible conocida.' }); return }
    submitting.current = true; setSaving(true); setFeedback(null)
    try {
      const response = await registrarSalida(toSalidaPayload(values, idAveria, idSolicitud))
      setFeedback({ kind: 'success', text: response.mensaje, movementId: response.movimiento.id, stock: { previous: response.stockAnterior, current: response.stockActual } })
      setValues(EMPTY_VALUES); setAvailability(null); refetch()
    } catch (caught) {
      setFeedback({ kind: 'error', text: salidaError(caught) })
      if (/^HTTP 401:/.test(caught instanceof Error ? caught.message : '')) logout()
      if (/^HTTP 400:/.test(caught instanceof Error ? caught.message : '')) refetch()
    } finally { submitting.current = false; setSaving(false) }
  }

  return <main className="materials-admin materials-admin--form inventory-exit">
    <header className="materials-admin__header"><div><p className="materials-admin__eyebrow">Inventario · Movimientos</p><h1>Registrar salida de materiales</h1><p>Indique el material retirado de bodega. El servidor validará y actualizará las existencias al confirmar.</p></div></header>
    {feedback && <div className={feedback.kind === 'success' ? 'materials-admin__success inventory-entry__success' : 'materials-admin__error inventory-entry__success'} role={feedback.kind === 'error' ? 'alert' : 'status'}>{feedback.movementId && <strong>Movimiento SALIDA #{feedback.movementId}</strong>}<span>{feedback.text}</span>{feedback.stock && <strong>Stock anterior: {feedback.stock.previous} → Stock actualizado: {feedback.stock.current}</strong>}{feedback.kind === 'success' && <Link to={MATERIALES_PATH}>Ver inventario actualizado</Link>}</div>}
    <form className="materials-admin__form inventory-entry__form" noValidate onSubmit={submit}>
      <label className="materials-admin__form-full"><span>Material a retirar *</span><select value={values.materialId} disabled={loading || Boolean(error)} aria-invalid={Boolean(errors.materialId)} onChange={(event) => update('materialId', event.target.value)}><option value="">Seleccione un material</option>{availableMaterials.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select>{errors.materialId && <small className="materials-admin__field-error" role="alert">{errors.materialId}</small>}</label>
      {loading && <p className="materials-admin__category-state" role="status">Cargando materiales disponibles…</p>}
      {error && <div className="materials-admin__category-error" role="alert">{error} <button type="button" onClick={refetch}>Reintentar</button></div>}
      {!loading && !error && availableMaterials.length === 0 && <div className="materials-admin__category-error" role="alert">No hay materiales activos con existencias disponibles para retirar.</div>}
      <label><span>Unidad de medida</span><input value={selectedMaterial?.unidadMedida ?? 'Seleccione un material'} readOnly aria-label="Unidad de medida del material" /></label>
      <label><span>Existencia disponible</span><input value={displayedStock ?? 'Seleccione un material'} readOnly aria-label="Existencia disponible del material" /><small>Referencia informativa; el backend valida nuevamente al registrar.</small></label>
      <label className="materials-admin__form-full"><span>Cantidad a retirar *</span><input type="number" inputMode="numeric" min="1" step="1" value={values.cantidad} aria-invalid={Boolean(errors.cantidad) || exceedsKnownStock} onChange={(event) => update('cantidad', event.target.value)} />{errors.cantidad && <small className="materials-admin__field-error" role="alert">{errors.cantidad}</small>}{exceedsKnownStock && <small className="inventory-exit__warning" role="alert">La cantidad supera la existencia disponible conocida ({selectedMaterial?.stockActual}).</small>}</label>
      {availability?.kind === 'checking' && <div className="inventory-exit__availability is-checking materials-admin__form-full" role="status">Verificando disponibilidad…</div>}
      {availability?.kind === 'invalid' && <div className="inventory-exit__availability is-error materials-admin__form-full" role="alert">{availability.message}</div>}
      {availability?.kind === 'valid' && <div className={`inventory-exit__availability ${availability.data.esAgotamientoTotal || availability.data.esBajoMinimo ? 'is-warning' : 'is-valid'} materials-admin__form-full`} role="status"><strong>{availability.data.esAgotamientoTotal ? 'Atención: esta salida dejará en 0 las existencias.' : availability.data.esBajoMinimo ? 'El material quedará en o por debajo del stock mínimo.' : 'Cantidad disponible.'}</strong><span>{availability.data.mensaje}</span></div>}
      {(idAveria || idSolicitud) && <section className="inventory-exit__relations materials-admin__form-full" aria-label="Registros relacionados"><strong>Origen de la salida</strong>{idAveria && <span>Avería relacionada: #{idAveria}</span>}{idSolicitud && <span>Solicitud aprobada relacionada: #{idSolicitud}</span>}</section>}
      <label className="materials-admin__form-full"><span>Motivo u observación</span><textarea value={values.observacion} maxLength={1000} aria-invalid={Boolean(errors.observacion)} placeholder="Ej. Reparación de fuga en calle central" onChange={(event) => update('observacion', event.target.value)} />{errors.observacion && <small className="materials-admin__field-error" role="alert">{errors.observacion}</small>}<small>{values.observacion.length}/1000 caracteres</small></label>
      <div className="inventory-exit__responsible materials-admin__form-full" role="note"><strong>Responsable</strong><span>{resolveAuthUserDisplayName(user)} · obtenido de la sesión activa</span></div>
      <div className="inventory-entry__notice materials-admin__form-full" role="note"><strong>Control de existencias</strong><span>No se edita el stock final en este formulario. El backend volverá a validar la disponibilidad y registrará el movimiento de forma transaccional.</span></div>
      <div className="materials-admin__form-actions"><Link className="materials-admin__secondary" to={MATERIALES_PATH}>Volver al catálogo</Link><button type="submit" className="materials-admin__primary" disabled={saving || loading || Boolean(error) || availableMaterials.length === 0 || availability?.kind === 'checking' || availability?.kind === 'invalid' || exceedsKnownStock}>{saving ? 'Registrando salida…' : 'Confirmar salida'}</button></div>
    </form>
  </main>
}
