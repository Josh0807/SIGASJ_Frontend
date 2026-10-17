import { useEffect, useRef, useState, type FormEvent } from 'react'
import { IconAlertTriangle, IconAlignLeft, IconArrowLeft, IconCheck, IconCircleCheckFilled, IconDeviceFloppy, IconNumbers, IconPackage, IconRulerMeasure, IconShieldCheck, IconStack2, IconTruckReturn, IconUser } from '@tabler/icons-react'
import { Link, useSearchParams } from 'react-router-dom'
import { focusFirstInvalidInventoryField } from '../focusFirstInvalidInventoryField'
import { InventoryFormField, InventoryFormHeading } from '../InventoryFormField'
import { useAuth } from '../../auth/components/AuthContext'
import { resolveAuthUserDisplayName } from '../../auth/utils/authUserDisplay'
import { MATERIALES_PATH } from '../inventarioPaths'
import { readSafeAveriaReturnPath } from '../../averias/inventario/averiaInventarioPaths'
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
  const returnToAveria = readSafeAveriaReturnPath(searchParams.get('from'))
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState<SalidaFormErrors>({})
  const [availability, setAvailability] = useState<Availability>(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string; stock?: { previous: number; current: number }; movementId?: number } | null>(null)
  const submitting = useRef(false)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const { result: materiales, loading, error, refetch } = useMateriales({ activo: true, page: 1, limit: 100 })
  const availableMaterials = materiales.data.filter((item) => item.activo && item.stockActual > 0)
  const selectedMaterial = availableMaterials.find((item) => String(item.id) === values.materialId)
  const numericQuantity = Number(values.cantidad)
  const maximumWithdrawal = selectedMaterial ? Math.max(0, selectedMaterial.stockActual - selectedMaterial.stockMinimo) : null
  const exceedsKnownStock = Boolean(selectedMaterial && Number.isFinite(numericQuantity) && numericQuantity > selectedMaterial.stockActual)
  const violatesMinimumStock = Boolean(selectedMaterial && Number.isFinite(numericQuantity) && maximumWithdrawal !== null && numericQuantity > maximumWithdrawal)
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
        .then((data) => {
          const resultingStock = Number(data.stockResultante)
          const respectsMinimumStock = Number.isFinite(resultingStock) && resultingStock >= Number(data.stockMinimo)
          setAvailability(respectsMinimumStock
            ? { kind: 'valid', data }
            : { kind: 'invalid', message: `La salida dejaría el inventario por debajo del stock mínimo (${data.stockMinimo}). Puede retirar como máximo ${Math.max(0, Number(data.stockActual) - Number(data.stockMinimo))}.` })
        })
        .catch((caught) => {
          if (controller.signal.aborted) return
          setAvailability({ kind: 'invalid', message: salidaError(caught) })
          if (/^HTTP 401:/.test(caught instanceof Error ? caught.message : '')) logout()
          if (/^HTTP (400|404):/.test(caught instanceof Error ? caught.message : '')) refetch()
        })
    }, 350)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [logout, refetch, values.materialId, values.cantidad])

  useEffect(() => {
    if (!feedback) return
    const feedbackElement = feedbackRef.current
    if (!feedbackElement) return
    feedbackElement.focus({ preventScroll: true })
    feedbackElement.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  }, [feedback])

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
    if (Object.keys(nextErrors).length) { setFeedback({ kind: 'error', text: 'Revise los campos señalados.' }); focusFirstInvalidInventoryField(event.currentTarget); return }
    if (exceedsKnownStock || violatesMinimumStock || availability?.kind === 'invalid') {
      setFeedback({
        kind: 'error',
        text: availability?.kind === 'invalid'
          ? availability.message
          : violatesMinimumStock
            ? `Debe conservar el stock mínimo de ${selectedMaterial?.stockMinimo}. Puede retirar como máximo ${maximumWithdrawal}.`
            : 'La cantidad supera la existencia disponible conocida.',
      })
      return
    }
    submitting.current = true; setSaving(true); setFeedback(null)
    try {
      const response = await registrarSalida(toSalidaPayload(values, idAveria, idSolicitud))
      const hasStockSummary = Number.isFinite(response.stockAnterior) && Number.isFinite(response.stockActual)
      setFeedback({
        kind: 'success',
        text: response.mensaje || 'La salida de material fue registrada exitosamente.',
        movementId: response.movimiento?.id,
        stock: hasStockSummary ? { previous: response.stockAnterior, current: response.stockActual } : undefined,
      })
      setValues(EMPTY_VALUES); setAvailability(null); refetch()
    } catch (caught) {
      setFeedback({ kind: 'error', text: salidaError(caught) })
      if (/^HTTP 401:/.test(caught instanceof Error ? caught.message : '')) logout()
      if (/^HTTP 400:/.test(caught instanceof Error ? caught.message : '')) refetch()
    } finally { submitting.current = false; setSaving(false) }
  }

  return <main className="materials-admin materials-admin--form inventory-exit sigasj-stack">
    <header className="materials-admin__header"><div><p className="materials-admin__eyebrow inventory-page-eyebrow">Inventario · Movimientos</p><h1 className="inventory-page-title">Registrar salida de materiales</h1><p className="inventory-page-subtitle">Indique el material retirado de bodega. El servidor validará y actualizará las existencias al confirmar.</p></div></header>
    {feedback && (
      <div
        ref={feedbackRef}
        tabIndex={-1}
        className={`fixed right-4 top-24 z-[100] flex w-[min(440px,calc(100vw-2rem))] items-start gap-4 rounded-2xl border p-5 shadow-2xl backdrop-blur-sm sm:right-6 ${feedback.kind === 'success' ? 'border-emerald-200 bg-emerald-50/95 text-emerald-950' : 'border-rose-200 bg-rose-50/95 text-rose-950'}`}
        role={feedback.kind === 'error' ? 'alert' : 'status'}
      >
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${feedback.kind === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {feedback.kind === 'success' ? <IconCheck size={24} stroke={3} aria-hidden="true" /> : <IconAlertTriangle size={23} aria-hidden="true" />}
        </span>
        <div className="grid min-w-0 flex-1 gap-1.5">
          <strong className="text-base">{feedback.kind === 'success' ? 'Salida registrada correctamente' : 'No se pudo registrar la salida'}</strong>
          <span>{feedback.text}</span>
          {feedback.stock && <span className="font-bold">Stock anterior: {feedback.stock.previous} → Stock actualizado: {feedback.stock.current}</span>}
          {feedback.movementId && <small className="font-semibold opacity-75">Movimiento SALIDA #{feedback.movementId}</small>}
          {feedback.kind === 'success' && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Link className="font-bold underline underline-offset-4" to={MATERIALES_PATH}>Ver inventario actualizado</Link>
              {returnToAveria && <Link className="font-bold underline underline-offset-4" to={returnToAveria}>Volver a la avería</Link>}
            </div>
          )}
        </div>
      </div>
    )}
    <form className="materials-admin__form provider-admin__form inventory-entry__form w-full max-w-3xl" noValidate onSubmit={submit}>
      <InventoryFormHeading icon={<IconTruckReturn size={25} aria-hidden="true" />} title="Datos de la salida" description="Indique el material retirado. El servidor valida y actualiza las existencias." />
      <InventoryFormField label="Material a retirar *" icon={<IconPackage size={20} aria-hidden="true" />} error={errors.materialId} full>
        <select value={values.materialId} disabled={loading || Boolean(error)} aria-invalid={Boolean(errors.materialId)} onChange={(event) => update('materialId', event.target.value)}>
          <option value="">Seleccione un material</option>
          {availableMaterials.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
        </select>
      </InventoryFormField>
      {loading && <p className="provider-admin__form-note" role="status">Cargando materiales disponibles…</p>}
      {error && <div className="materials-admin__category-error materials-admin__form-full" role="alert">{error} <button type="button" onClick={refetch}>Reintentar</button></div>}
      {!loading && !error && availableMaterials.length === 0 && <div className="materials-admin__category-error materials-admin__form-full" role="alert">No hay materiales activos con existencias disponibles para retirar.</div>}
      <InventoryFormField label="Unidad de medida" icon={<IconRulerMeasure size={20} aria-hidden="true" />}>
        <input value={selectedMaterial?.unidadMedida ?? 'Seleccione un material'} readOnly aria-label="Unidad de medida del material" />
      </InventoryFormField>
      <InventoryFormField label="Existencia disponible" icon={<IconStack2 size={20} aria-hidden="true" />} hint={<small>Referencia informativa; el backend valida nuevamente al registrar.</small>}>
        <input value={displayedStock ?? 'Seleccione un material'} readOnly aria-label="Existencia disponible del material" />
      </InventoryFormField>
      <InventoryFormField
        label="Cantidad a retirar *"
        icon={<IconNumbers size={20} aria-hidden="true" />}
        error={errors.cantidad}
        full
        hint={violatesMinimumStock ? <small className="inventory-exit__warning" role="alert">Debe conservar {selectedMaterial?.stockMinimo} como stock mínimo. Retiro máximo permitido: {maximumWithdrawal}.</small> : null}
      >
        <input type="number" inputMode="numeric" min="1" max={maximumWithdrawal ?? undefined} step="1" value={values.cantidad} aria-invalid={Boolean(errors.cantidad) || exceedsKnownStock || violatesMinimumStock} onChange={(event) => update('cantidad', event.target.value)} />
      </InventoryFormField>
      {availability?.kind === 'checking' && <div className="materials-admin__form-full flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 font-semibold text-sky-800 shadow-sm" role="status"><span className="materials-admin__spinner" /> Verificando disponibilidad…</div>}
      {availability?.kind === 'invalid' && <div className="materials-admin__form-full flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-800 shadow-sm" role="alert"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-100"><IconAlertTriangle size={20} aria-hidden="true" /></span><span>{availability.message}</span></div>}
      {availability?.kind === 'valid' && (() => {
        const warning = availability.data.esAgotamientoTotal || availability.data.esBajoMinimo
        return <div className={`materials-admin__form-full flex items-center gap-4 rounded-2xl border px-5 py-4 shadow-sm ${warning ? 'border-amber-200 bg-amber-50 text-amber-950' : 'border-emerald-200 bg-emerald-50 text-emerald-950'}`} role="status">
          <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${warning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-600 text-white'}`}>{warning ? <IconAlertTriangle size={21} aria-hidden="true" /> : <IconCircleCheckFilled size={22} aria-hidden="true" />}</span>
          <div className="grid gap-1"><strong>{availability.data.esAgotamientoTotal ? 'La salida agotará este material' : availability.data.esBajoMinimo ? 'El material quedará bajo el mínimo' : 'Salida disponible'}</strong><span className="text-sm opacity-80">{availability.data.mensaje}</span></div>
        </div>
      })()}
      {(idAveria || idSolicitud) && <section className="inventory-exit__relations materials-admin__form-full" aria-label="Registros relacionados"><strong>Origen de la salida</strong>{idAveria && <span>Avería relacionada: #{idAveria}</span>}{idSolicitud && <span>Solicitud aprobada relacionada: #{idSolicitud}</span>}{returnToAveria && <Link to={returnToAveria}>Volver a la avería</Link>}</section>}
      <InventoryFormField label="Motivo u observación" icon={<IconAlignLeft size={20} aria-hidden="true" />} error={errors.observacion} full hint={<small>{values.observacion.length}/1000 caracteres</small>}>
        <textarea value={values.observacion} maxLength={1000} aria-invalid={Boolean(errors.observacion)} placeholder="Ej. Reparación de fuga en calle central" onChange={(event) => update('observacion', event.target.value)} />
      </InventoryFormField>
      <div className="materials-admin__form-full flex items-center gap-4 rounded-2xl border border-blue-100 bg-linear-to-r from-blue-50 to-sky-50/60 p-5 shadow-sm" role="note">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200"><IconUser size={24} aria-hidden="true" /></span>
        <div className="grid min-w-0 flex-1 gap-1"><span className="text-xs font-extrabold uppercase tracking-[0.12em] text-blue-600">Responsable de la salida</span><strong className="truncate text-base text-slate-900">{resolveAuthUserDisplayName(user)}</strong><small className="text-slate-500">Identidad verificada desde la sesión activa</small></div>
        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 sm:flex"><IconShieldCheck size={16} aria-hidden="true" /> Verificado</span>
      </div>
      <div className="materials-admin__form-actions">
        <button type="submit" className="materials-admin__primary group !rounded-2xl !bg-linear-to-r !from-blue-600 !to-sky-500 !shadow-[0_10px_24px_rgba(37,99,235,0.28)] !transition-all !duration-300 !ease-out hover:!-translate-y-1 hover:!scale-[1.02] hover:!from-blue-700 hover:!to-cyan-500 hover:!shadow-[0_16px_32px_rgba(37,99,235,0.38)] active:!translate-y-0 active:!scale-[0.97] disabled:!translate-y-0 disabled:!scale-100 motion-reduce:!transform-none motion-reduce:!transition-none" disabled={saving || loading || Boolean(error) || availableMaterials.length === 0 || availability?.kind === 'checking'}>
          <IconDeviceFloppy className="!transition-transform !duration-300 group-hover:!-rotate-6 group-hover:!scale-110 group-active:!rotate-0 motion-reduce:!transform-none" size={19} aria-hidden="true" />
          {saving ? 'Registrando salida…' : 'Confirmar salida'}
        </button>
        <Link className="materials-admin__secondary group !rounded-2xl !border-blue-200 !bg-white !shadow-[0_7px_18px_rgba(37,99,235,0.1)] !transition-all !duration-300 !ease-out hover:!-translate-y-1 hover:!scale-[1.02] hover:!border-blue-400 hover:!bg-blue-50 hover:!text-blue-700 hover:!shadow-[0_13px_26px_rgba(37,99,235,0.18)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" to={MATERIALES_PATH}><IconArrowLeft className="!transition-transform !duration-300 group-hover:!-translate-x-1.5 motion-reduce:!transform-none" size={19} aria-hidden="true" />Volver al catálogo</Link>
      </div>
    </form>
  </main>
}
