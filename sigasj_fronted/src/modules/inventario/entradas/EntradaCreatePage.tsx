import { useRef, useState, type FormEvent } from 'react'
import {
  IconAlertTriangle,
  IconAlignLeft,
  IconArrowLeft,
  IconBuildingStore,
  IconCheck,
  IconCurrencyDollar,
  IconDeviceFloppy,
  IconNumbers,
  IconPackage,
  IconRulerMeasure,
  IconTrendingUp,
  IconTruckDelivery,
} from '@tabler/icons-react'
import { AdminShell, Alert, Button, Card, PageHeader } from '../../../shared/ui'
import { focusFirstInvalidInventoryField } from '../focusFirstInvalidInventoryField'
import { InventoryFormField, InventoryFormHeading } from '../InventoryFormField'
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

const EMPTY_VALUES: EntradaFormValues = {
  materialId: '',
  cantidad: '',
  proveedorId: '',
  observacion: '',
  precioUnitario: '',
}

export default function EntradaCreatePage() {
  const { logout } = useAuth()
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState<EntradaFormErrors>({})
  const [saving, setSaving] = useState(false)
  const [documents, setDocuments] = useState<SelectedDocument[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentoMovimiento[]>([])
  const [pendingMovementId, setPendingMovementId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error'
    text: string
    stock?: { previous: number; current: number }
    movementId?: number
  } | null>(null)
  const submitting = useRef(false)
  const {
    result: materiales,
    loading: loadingMateriales,
    error: materialesError,
    refetch: refetchMateriales,
  } = useMateriales({ activo: true, page: 1, limit: 100 })
  const {
    result: proveedores,
    loading: loadingProveedores,
    error: proveedoresError,
    refetch: refetchProveedores,
  } = useProveedores({ activo: true, page: 1, limit: 100 })
  const selectedMaterial = materiales.data.find(
    (item) => String(item.id) === values.materialId,
  )
  const update = (name: keyof EntradaFormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setFeedback(null)
  }

  async function uploadDocuments(movementId: number, pending: SelectedDocument[]) {
    const results = await Promise.allSettled(
      pending.map((item) => adjuntarDocumentoEntrada(movementId, item.file)),
    )
    const uploaded = results.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : [],
    )
    const failed = pending.filter((_, index) => results[index]?.status === 'rejected')
    setUploadedDocuments((current) => [...current, ...uploaded])
    setDocuments(failed)
    setPendingMovementId(failed.length ? movementId : null)
    const reasons = results.flatMap((result) =>
      result.status === 'rejected' ? [result.reason] : [],
    )
    if (
      reasons.some((reason) =>
        /^HTTP 401:/.test(reason instanceof Error ? reason.message : ''),
      )
    ) {
      logout()
    }
    return { uploaded, failed, reasons }
  }

  async function retryDocuments() {
    if (!pendingMovementId || saving || !documents.length) return
    setSaving(true)
    setFeedback(null)
    try {
      const result = await uploadDocuments(pendingMovementId, documents)
      const detail =
        result.reasons[0] instanceof Error
          ? result.reasons[0].message.replace(/^HTTP \d+:\s*/, '')
          : ''
      setFeedback(
        result.failed.length
          ? {
              kind: 'error',
              text: `${result.failed.length} archivo(s) todavía no pudieron cargarse.${detail ? ` ${detail}` : ''} La entrada ya está registrada; puede reintentar sin duplicarla.`,
            }
          : {
              kind: 'success',
              text: 'Todos los documentos pendientes se adjuntaron a la entrada correcta.',
            },
      )
    } finally {
      setSaving(false)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current || pendingMovementId) return
    const nextErrors = validateEntrada(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setFeedback({ kind: 'error', text: 'Revise los campos señalados.' })
      focusFirstInvalidInventoryField(event.currentTarget)
      return
    }
    submitting.current = true
    setSaving(true)
    setFeedback(null)
    try {
      const response = await registrarEntrada(toEntradaPayload(values))
      const result = documents.length
        ? await uploadDocuments(response.movimiento.id, documents)
        : { uploaded: [], failed: [], reasons: [] }
      const uploadDetail =
        result.reasons[0] instanceof Error
          ? result.reasons[0].message.replace(/^HTTP \d+:\s*/, '')
          : ''
      setFeedback(
        result.failed.length
          ? {
              kind: 'error',
              text: `La entrada se registró correctamente, pero ${result.failed.length} archivo(s) no pudieron adjuntarse.${uploadDetail ? ` ${uploadDetail}` : ''} Reintente la carga sin volver a registrar la entrada.`,
              stock: {
                previous: response.stockAnterior,
                current: response.stockActual,
              },
              movementId: response.movimiento.id,
            }
          : {
              kind: 'success',
              text: `${response.mensaje}${result.uploaded.length ? ` Se adjuntaron ${result.uploaded.length} documento(s).` : ''}`,
              stock: {
                previous: response.stockAnterior,
                current: response.stockActual,
              },
              movementId: response.movimiento.id,
            },
      )
      setValues(EMPTY_VALUES)
    } catch (caught) {
      setFeedback({ kind: 'error', text: entradaError(caught) })
      if (/^HTTP 401:/.test(caught instanceof Error ? caught.message : '')) logout()
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <AdminShell
      className="inventory-entry inventory-module-shell inventory-bodega gap-5 sm:gap-6"
      aria-labelledby="entrada-create-title"
    >
      <PageHeader
        id="entrada-create-title"
        eyebrow="Inventario · Movimientos"
        title="Registrar entrada de materiales"
        description="Registre los materiales recibidos en bodega. Las existencias serán calculadas y actualizadas por el servidor."
      />

      {feedback ? (
        <Alert
          tone={feedback.kind === 'success' ? 'success' : 'danger'}
          icon={
            feedback.kind === 'success' ? (
              <IconCheck size={20} stroke={3} aria-hidden="true" />
            ) : (
              <IconAlertTriangle size={20} aria-hidden="true" />
            )
          }
          title={
            feedback.kind === 'success'
              ? 'Entrada registrada correctamente'
              : 'No se pudo completar la entrada'
          }
        >
          <span>{feedback.text}</span>
          {feedback.movementId ? (
            <p className="m-0 mt-1 text-sm opacity-80">
              Movimiento ENTRADA #{feedback.movementId}
            </p>
          ) : null}
          {feedback.stock ? (
            <p className="m-0 mt-1 inline-flex flex-wrap items-center gap-2 font-semibold">
              <IconTrendingUp size={18} aria-hidden="true" />
              Stock anterior: {feedback.stock.previous} → Stock actualizado:{' '}
              {feedback.stock.current}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            {feedback.kind === 'success' ? (
              <Button to={MATERIALES_PATH} size="sm">
                Ver inventario actualizado
              </Button>
            ) : null}
            {pendingMovementId && documents.length > 0 ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={saving}
                loading={saving}
                onClick={() => void retryDocuments()}
              >
                {saving ? 'Cargando documentos…' : 'Reintentar documentos pendientes'}
              </Button>
            ) : null}
          </div>
        </Alert>
      ) : null}

      {uploadedDocuments.length > 0 ? (
        <Card as="section" padded className="!p-5" aria-label="Documentos adjuntos">
          <h2 className="m-0 text-base font-extrabold text-[#073b73]">
            Documentos adjuntos
          </h2>
          <ul className="m-0 mt-3 grid list-none gap-2 p-0">
            {uploadedDocuments.map((document) => (
              <li
                key={document.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <span className="font-semibold text-[#163f6b]">
                  {document.nombreOriginal}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => void abrirDocumentoEntrada(document.rutaReferenciaArchivo)}
                >
                  Ver documento
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card as="section" padded className="!p-5 sm:!p-6 lg:!p-8">
        <form
          className="grid w-full gap-x-7 gap-y-6 lg:grid-cols-2 lg:gap-y-7"
          noValidate
          onSubmit={submit}
        >
          <InventoryFormHeading
            icon={<IconTruckDelivery size={25} aria-hidden="true" />}
            title="Datos de la entrada"
            description="Indique el material recibido. Las existencias las actualiza el servidor."
          />
          <InventoryFormField
            label="Material recibido *"
            icon={<IconPackage size={20} aria-hidden="true" />}
            error={errors.materialId}
          >
            <select
              value={values.materialId}
              disabled={loadingMateriales || Boolean(materialesError)}
              aria-invalid={Boolean(errors.materialId)}
              onChange={(event) => update('materialId', event.target.value)}
            >
              <option value="">Seleccione un material</option>
              {materiales.data.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </InventoryFormField>
          <InventoryFormField
            label="Unidad de medida"
            icon={<IconRulerMeasure size={20} aria-hidden="true" />}
            hint={
              <small className="text-slate-500">
                Se obtiene automáticamente del catálogo.
              </small>
            }
          >
            <input
              value={selectedMaterial?.unidadMedida ?? 'Seleccione un material'}
              readOnly
              disabled
              aria-label="Unidad de medida del material"
            />
          </InventoryFormField>
          {loadingMateriales ? (
            <p className="col-span-full m-0 text-sm text-slate-500" role="status">
              Cargando materiales disponibles…
            </p>
          ) : null}
          {materialesError ? (
            <Alert className="col-span-full" tone="danger" role="alert">
              <div className="grid gap-3">
                <p className="m-0 font-semibold">{materialesError}</p>
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={refetchMateriales}
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            </Alert>
          ) : null}
          {!loadingMateriales && !materialesError && materiales.data.length === 0 ? (
            <Alert className="col-span-full" tone="warning" role="alert">
              No hay materiales activos disponibles para registrar una entrada.
            </Alert>
          ) : null}
          <InventoryFormField
            label="Cantidad recibida *"
            icon={<IconNumbers size={20} aria-hidden="true" />}
            error={errors.cantidad}
          >
            <input
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={values.cantidad}
              aria-invalid={Boolean(errors.cantidad)}
              onChange={(event) => update('cantidad', event.target.value)}
            />
          </InventoryFormField>
          <InventoryFormField
            label="Proveedor"
            icon={<IconBuildingStore size={20} aria-hidden="true" />}
            error={errors.proveedorId}
          >
            <select
              value={values.proveedorId}
              disabled={loadingProveedores || Boolean(proveedoresError)}
              aria-invalid={Boolean(errors.proveedorId)}
              onChange={(event) => update('proveedorId', event.target.value)}
            >
              <option value="">Sin proveedor</option>
              {proveedores.data.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </InventoryFormField>
          {loadingProveedores ? (
            <p className="col-span-full m-0 text-sm text-slate-500" role="status">
              Cargando proveedores disponibles…
            </p>
          ) : null}
          {proveedoresError ? (
            <Alert className="col-span-full" tone="warning" role="alert">
              <div className="grid gap-3">
                <p className="m-0 font-semibold">
                  No fue posible cargar proveedores. Puede registrar la entrada sin
                  proveedor.
                </p>
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={refetchProveedores}
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            </Alert>
          ) : null}
          <InventoryFormField
            label="Precio unitario"
            icon={<IconCurrencyDollar size={20} aria-hidden="true" />}
            error={errors.precioUnitario}
            hint={
              <small className="text-slate-500">
                Opcional — precio pagado por unidad en esta compra.
              </small>
            }
          >
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={values.precioUnitario}
              aria-invalid={Boolean(errors.precioUnitario)}
              placeholder="Ej. 1250.00"
              onChange={(event) => update('precioUnitario', event.target.value)}
            />
          </InventoryFormField>
          <InventoryFormField
            label="Observaciones"
            icon={<IconAlignLeft size={20} aria-hidden="true" />}
            error={errors.observacion}
            full
            multiline
            hint={
              <small className="text-slate-500">
                {values.observacion.length}/1000 caracteres
              </small>
            }
          >
            <textarea
              value={values.observacion}
              maxLength={1000}
              aria-invalid={Boolean(errors.observacion)}
              placeholder="Ej. Entrega parcial según orden de compra"
              onChange={(event) => update('observacion', event.target.value)}
            />
          </InventoryFormField>
          <div className="col-span-full">
            <DocumentosEntradaField
              documents={documents}
              disabled={saving}
              onChange={(next) => {
                setDocuments(next)
                if (pendingMovementId && next.length === 0) setPendingMovementId(null)
              }}
              onErrors={(messages) => {
                if (messages.length) {
                  setFeedback({ kind: 'error', text: messages.join(' ') })
                }
              }}
            />
          </div>
          <div
            className="col-span-full rounded-xl border border-slate-200 bg-[#f4f8fc] px-4 py-3.5"
            role="note"
          >
            <strong className="block text-sm font-extrabold text-[#163f6b]">
              Control de existencias
            </strong>
            <span className="mt-1 block text-sm leading-6 text-slate-600">
              El stock actual no se edita en este formulario. El backend sumará la
              cantidad de forma transaccional y conservará el movimiento.
            </span>
          </div>
          <div className="col-span-full mt-1 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              disabled={
                saving ||
                pendingMovementId !== null ||
                loadingMateriales ||
                Boolean(materialesError) ||
                materiales.data.length === 0
              }
              loading={saving}
              leftIcon={<IconDeviceFloppy size={19} aria-hidden="true" />}
            >
              {saving
                ? documents.length
                  ? 'Registrando y adjuntando…'
                  : 'Registrando entrada…'
                : pendingMovementId
                  ? 'Documentos pendientes'
                  : 'Registrar entrada'}
            </Button>
            <Button
              to={MATERIALES_PATH}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              leftIcon={<IconArrowLeft size={19} aria-hidden="true" />}
            >
              Volver al catálogo
            </Button>
          </div>
        </form>
      </Card>
    </AdminShell>
  )
}
