import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MATERIALES_PATH } from '../inventarioPaths'
import { useMateriales } from '../useMateriales'
import { useProveedores } from '../proveedores/useProveedores'
import { entradaError, toEntradaPayload, validateEntrada, type EntradaFormErrors } from './entradaUtils'
import { registrarEntrada } from './entradasApi'
import type { EntradaFormValues } from './types'
import { useAuth } from '../../auth/components/AuthContext'
import DocumentosEntradaField from './DocumentosEntradaField'
import { abrirDocumentoEntrada, adjuntarDocumentoEntrada } from './documentosApi'
import type { DocumentoMovimiento, SelectedDocument } from './documentosTypes'

const EMPTY_VALUES: EntradaFormValues = { materialId: '', cantidad: '', proveedorId: '', observacion: '' }

export default function EntradaCreatePage() {
  const { logout } = useAuth()
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState<EntradaFormErrors>({})
  const [saving, setSaving] = useState(false)
  const [documents, setDocuments] = useState<SelectedDocument[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentoMovimiento[]>([])
  const [pendingMovementId, setPendingMovementId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string; stock?: { previous: number; current: number }; movementId?: number } | null>(null)
  const submitting = useRef(false)
  const { result: materiales, loading: loadingMateriales, error: materialesError, refetch: refetchMateriales } = useMateriales({ activo: true, page: 1, limit: 100 })
  const { result: proveedores, loading: loadingProveedores, error: proveedoresError, refetch: refetchProveedores } = useProveedores({ activo: true, page: 1, limit: 100 })
  const selectedMaterial = materiales.data.find((item) => String(item.id) === values.materialId)
  const update = (name: keyof EntradaFormValues, value: string) => { setValues((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: undefined })); setFeedback(null) }

  async function uploadDocuments(movementId: number, pending: SelectedDocument[]) {
    const results = await Promise.allSettled(pending.map((item) => adjuntarDocumentoEntrada(movementId, item.file)))
    const uploaded = results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : [])
    const failed = pending.filter((_, index) => results[index]?.status === 'rejected')
    setUploadedDocuments((current) => [...current, ...uploaded])
    setDocuments(failed)
    setPendingMovementId(failed.length ? movementId : null)
    const reasons = results.flatMap((result) => result.status === 'rejected' ? [result.reason] : [])
    if (reasons.some((reason) => /^HTTP 401:/.test(reason instanceof Error ? reason.message : ''))) logout()
    return { uploaded, failed, reasons }
  }

  async function retryDocuments() {
    if (!pendingMovementId || saving || !documents.length) return
    setSaving(true); setFeedback(null)
    try {
      const result = await uploadDocuments(pendingMovementId, documents)
      const detail = result.reasons[0] instanceof Error ? result.reasons[0].message.replace(/^HTTP \d+:\s*/, '') : ''
      setFeedback(result.failed.length ? { kind: 'error', text: `${result.failed.length} archivo(s) todavía no pudieron cargarse.${detail ? ` ${detail}` : ''} La entrada ya está registrada; puede reintentar sin duplicarla.` } : { kind: 'success', text: 'Todos los documentos pendientes se adjuntaron a la entrada correcta.' })
    } finally { setSaving(false) }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current || pendingMovementId) return
    const nextErrors = validateEntrada(values); setErrors(nextErrors)
    if (Object.keys(nextErrors).length) { setFeedback({ kind: 'error', text: 'Revise los campos señalados.' }); return }
    submitting.current = true; setSaving(true); setFeedback(null)
    try {
      const response = await registrarEntrada(toEntradaPayload(values))
      const result = documents.length ? await uploadDocuments(response.movimiento.id, documents) : { uploaded: [], failed: [], reasons: [] }
      const uploadDetail = result.reasons[0] instanceof Error ? result.reasons[0].message.replace(/^HTTP \d+:\s*/, '') : ''
      setFeedback(result.failed.length ? { kind: 'error', text: `La entrada se registró correctamente, pero ${result.failed.length} archivo(s) no pudieron adjuntarse.${uploadDetail ? ` ${uploadDetail}` : ''} Reintente la carga sin volver a registrar la entrada.`, stock: { previous: response.stockAnterior, current: response.stockActual }, movementId: response.movimiento.id } : { kind: 'success', text: `${response.mensaje}${result.uploaded.length ? ` Se adjuntaron ${result.uploaded.length} documento(s).` : ''}`, stock: { previous: response.stockAnterior, current: response.stockActual }, movementId: response.movimiento.id })
      setValues(EMPTY_VALUES)
    } catch (caught) {
      setFeedback({ kind: 'error', text: entradaError(caught) })
      if (/^HTTP 401:/.test(caught instanceof Error ? caught.message : '')) logout()
    }
    finally { submitting.current = false; setSaving(false) }
  }

  return <main className="materials-admin materials-admin--form inventory-entry">
    <header className="materials-admin__header"><div><p className="materials-admin__eyebrow">Inventario · Movimientos</p><h1>Registrar entrada de materiales</h1><p>Registre los materiales recibidos en bodega. Las existencias serán calculadas y actualizadas por el servidor.</p></div></header>
    {feedback && <div className={feedback.kind === 'success' ? 'materials-admin__success inventory-entry__success' : 'materials-admin__error inventory-entry__success'} role={feedback.kind === 'error' ? 'alert' : 'status'}>{feedback.movementId && <strong>Movimiento ENTRADA #{feedback.movementId}</strong>}<span>{feedback.text}</span>{feedback.stock && <strong>Stock anterior: {feedback.stock.previous} → Stock actualizado: {feedback.stock.current}</strong>}{feedback.kind === 'success' && <Link to={MATERIALES_PATH}>Ver inventario actualizado</Link>}{pendingMovementId && documents.length > 0 && <button type="button" className="materials-admin__secondary" disabled={saving} onClick={() => void retryDocuments()}>{saving ? 'Cargando documentos…' : 'Reintentar documentos pendientes'}</button>}</div>}
    {uploadedDocuments.length > 0 && <section className="inventory-entry__uploaded" aria-label="Documentos adjuntos"><h2>Documentos adjuntos</h2><ul>{uploadedDocuments.map((document) => <li key={document.id}><span>{document.nombreOriginal}</span><button type="button" onClick={() => void abrirDocumentoEntrada(document.rutaReferenciaArchivo)}>Ver documento</button></li>)}</ul></section>}
    <form className="materials-admin__form inventory-entry__form" noValidate onSubmit={submit}>
      <label><span>Material recibido *</span><select value={values.materialId} disabled={loadingMateriales || Boolean(materialesError)} aria-invalid={Boolean(errors.materialId)} onChange={(event) => update('materialId', event.target.value)}><option value="">Seleccione un material</option>{materiales.data.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select>{errors.materialId && <small className="materials-admin__field-error" role="alert">{errors.materialId}</small>}</label>
      <label><span>Unidad de medida</span><input value={selectedMaterial?.unidadMedida ?? 'Seleccione un material'} readOnly disabled aria-label="Unidad de medida del material" /><small>Se obtiene automáticamente del catálogo.</small></label>
      {loadingMateriales && <p className="materials-admin__category-state" role="status">Cargando materiales disponibles…</p>}
      {materialesError && <div className="materials-admin__category-error" role="alert">{materialesError} <button type="button" onClick={refetchMateriales}>Reintentar</button></div>}
      {!loadingMateriales && !materialesError && materiales.data.length === 0 && <div className="materials-admin__category-error" role="alert">No hay materiales activos disponibles para registrar una entrada.</div>}
      <label><span>Cantidad recibida *</span><input type="number" inputMode="numeric" min="1" step="1" value={values.cantidad} aria-invalid={Boolean(errors.cantidad)} onChange={(event) => update('cantidad', event.target.value)} />{errors.cantidad && <small className="materials-admin__field-error" role="alert">{errors.cantidad}</small>}</label>
      <label><span>Proveedor</span><select value={values.proveedorId} disabled={loadingProveedores || Boolean(proveedoresError)} aria-invalid={Boolean(errors.proveedorId)} onChange={(event) => update('proveedorId', event.target.value)}><option value="">Sin proveedor</option>{proveedores.data.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select>{errors.proveedorId && <small className="materials-admin__field-error" role="alert">{errors.proveedorId}</small>}</label>
      {loadingProveedores && <p className="materials-admin__category-state" role="status">Cargando proveedores disponibles…</p>}
      {proveedoresError && <div className="materials-admin__category-error" role="alert">No fue posible cargar proveedores. Puede registrar la entrada sin proveedor. <button type="button" onClick={refetchProveedores}>Reintentar</button></div>}
      <label className="materials-admin__form-full"><span>Observaciones</span><textarea value={values.observacion} maxLength={1000} aria-invalid={Boolean(errors.observacion)} placeholder="Ej. Entrega parcial según orden de compra" onChange={(event) => update('observacion', event.target.value)} />{errors.observacion && <small className="materials-admin__field-error" role="alert">{errors.observacion}</small>}<small>{values.observacion.length}/1000 caracteres</small></label>
      <DocumentosEntradaField documents={documents} disabled={saving} onChange={(next) => { setDocuments(next); if (pendingMovementId && next.length === 0) setPendingMovementId(null) }} onErrors={(messages) => { if (messages.length) setFeedback({ kind: 'error', text: messages.join(' ') }) }} />
      <div className="inventory-entry__notice materials-admin__form-full" role="note"><strong>Control de existencias</strong><span>El stock actual no se edita en este formulario. El backend sumará la cantidad de forma transaccional y conservará el movimiento.</span></div>
      <div className="materials-admin__form-actions"><Link className="materials-admin__secondary" to={MATERIALES_PATH}>Volver al catálogo</Link><button type="submit" className="materials-admin__primary" disabled={saving || pendingMovementId !== null || loadingMateriales || Boolean(materialesError) || materiales.data.length === 0}>{saving ? documents.length ? 'Registrando y adjuntando…' : 'Registrando entrada…' : pendingMovementId ? 'Documentos pendientes' : 'Registrar entrada'}</button></div>
    </form>
  </main>
}
