import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  IconAlertTriangle,
  IconAlignLeft,
  IconArrowLeft,
  IconCheck,
  IconCircleCheckFilled,
  IconDeviceFloppy,
  IconNumbers,
  IconPackage,
  IconShieldCheck,
  IconTruckReturn,
  IconUser,
} from '@tabler/icons-react'
import { useSearchParams } from 'react-router-dom'
import { focusFirstInvalidInventoryField } from '../focusFirstInvalidInventoryField'
import { InventoryFormField, InventoryFormHeading } from '../InventoryFormField'
import { useAuth } from '../../auth/components/AuthContext'
import { resolveAuthUserDisplayName } from '../../auth/utils/authUserDisplay'
import { Alert, Badge, Button, PageHeader } from '../../../shared/ui'
import { MATERIALES_PATH } from '../inventarioPaths'
import { readSafeAveriaReturnPath } from '../../averias/inventario/averiaInventarioPaths'
import { useMateriales } from '../useMateriales'
import { consultarDisponibilidad, registrarSalida } from './salidasApi'
import {
  parseRelatedId,
  salidaError,
  toSalidaPayload,
  validateSalida,
  type SalidaFormErrors,
} from './salidaUtils'
import type { DisponibilidadMaterial, SalidaFormValues } from './types'

const EMPTY_VALUES: SalidaFormValues = {
  materialId: '',
  cantidad: '',
  observacion: '',
}

type Availability =
  | { kind: 'checking' }
  | { kind: 'valid'; data: DisponibilidadMaterial }
  | { kind: 'invalid'; message: string }
  | null

export default function SalidaCreatePage() {
  const { user, logout } = useAuth()
  const [searchParams] = useSearchParams()
  const idAveria = parseRelatedId(
    searchParams.get('idAveria') ?? searchParams.get('averiaId'),
  )
  const idSolicitud = parseRelatedId(
    searchParams.get('idSolicitud') ?? searchParams.get('solicitudId'),
  )
  const returnToAveria = readSafeAveriaReturnPath(searchParams.get('from'))
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState<SalidaFormErrors>({})
  const [availability, setAvailability] = useState<Availability>(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error'
    text: string
    stock?: { previous: number; current: number }
    movementId?: number
  } | null>(null)
  const submitting = useRef(false)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const { result: materiales, loading, error, refetch } = useMateriales({
    activo: true,
    page: 1,
    limit: 500,
  })
  const materialListTruncated = materiales.total > materiales.data.length
  const availableMaterials = materiales.data.filter(
    (item) => item.activo && item.stockActual > 0,
  )
  const selectedMaterial = availableMaterials.find(
    (item) => String(item.id) === values.materialId,
  )
  const numericQuantity = Number(values.cantidad)
  const exceedsKnownStock = Boolean(
    selectedMaterial &&
      Number.isFinite(numericQuantity) &&
      numericQuantity > selectedMaterial.stockActual,
  )
  const displayedStock =
    availability?.kind === 'valid' &&
    availability.data.idMaterial === selectedMaterial?.id
      ? availability.data.stockActual
      : selectedMaterial?.stockActual

  useEffect(() => {
    const materialId = Number(values.materialId)
    const cantidad = Number(values.cantidad)
    if (
      !Number.isInteger(materialId) ||
      materialId <= 0 ||
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setAvailability({ kind: 'checking' })
      consultarDisponibilidad(materialId, cantidad, controller.signal)
        .then((data) => {
          const serverApproves = data.disponible !== false
          setAvailability(
            serverApproves
              ? { kind: 'valid', data }
              : {
                  kind: 'invalid',
                  message:
                    data.mensaje ||
                    `No hay stock suficiente. Existencia disponible: ${data.stockActual}.`,
                },
          )
        })
        .catch((caught) => {
          if (controller.signal.aborted) return
          setAvailability({ kind: 'invalid', message: salidaError(caught) })
          if (/^HTTP 401:/.test(caught instanceof Error ? caught.message : ''))
            logout()
          if (
            /^HTTP (400|404):/.test(caught instanceof Error ? caught.message : '')
          )
            refetch()
        })
    }, 350)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
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
    if (Object.keys(nextErrors).length) {
      setFeedback({ kind: 'error', text: 'Revise los campos señalados.' })
      focusFirstInvalidInventoryField(event.currentTarget)
      return
    }
    if (exceedsKnownStock || availability?.kind === 'invalid') {
      setFeedback({
        kind: 'error',
        text:
          availability?.kind === 'invalid'
            ? availability.message
            : 'La cantidad supera la existencia disponible conocida.',
      })
      return
    }
    submitting.current = true
    setSaving(true)
    setFeedback(null)
    try {
      const response = await registrarSalida(
        toSalidaPayload(values, idAveria, idSolicitud),
      )
      const hasStockSummary =
        Number.isFinite(response.stockAnterior) &&
        Number.isFinite(response.stockActual)
      setFeedback({
        kind: 'success',
        text:
          response.mensaje ||
          'La salida de material fue registrada exitosamente.',
        movementId: response.movimiento?.id,
        stock: hasStockSummary
          ? {
              previous: response.stockAnterior,
              current: response.stockActual,
            }
          : undefined,
      })
      setValues(EMPTY_VALUES)
      setAvailability(null)
      refetch()
    } catch (caught) {
      setFeedback({ kind: 'error', text: salidaError(caught) })
      if (/^HTTP 401:/.test(caught instanceof Error ? caught.message : ''))
        logout()
      if (/^HTTP 400:/.test(caught instanceof Error ? caught.message : ''))
        refetch()
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <main
      className="inv-salida materials-admin materials-admin--form"
      style={{ display: 'grid', gap: 14 }}
    >
      <PageHeader
        title="Registrar salida de materiales"
        description="Indique el material retirado de bodega. El servidor validará y actualizará las existencias al confirmar."
        actions={
          <Button
            to={MATERIALES_PATH}
            variant="secondary"
            leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
          >
            Volver al catálogo
          </Button>
        }
      />

      {feedback ? (
        <Alert
          ref={feedbackRef}
          tabIndex={-1}
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
              ? 'Salida registrada correctamente'
              : 'No se pudo registrar la salida'
          }
        >
          <span>{feedback.text}</span>
          {feedback.stock ? (
            <p className="m-0 mt-1">
              Stock anterior: {feedback.stock.previous} → Stock actualizado:{' '}
              {feedback.stock.current}
            </p>
          ) : null}
          {feedback.movementId ? (
            <p className="m-0 mt-1 text-sm opacity-80">
              Movimiento SALIDA #{feedback.movementId}
            </p>
          ) : null}
          {feedback.kind === 'success' ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button to={MATERIALES_PATH} size="sm">
                Ver inventario actualizado
              </Button>
              {returnToAveria ? (
                <Button to={returnToAveria} variant="secondary" size="sm">
                  Volver a la avería
                </Button>
              ) : null}
            </div>
          ) : null}
        </Alert>
      ) : null}

      <form
        className="materials-admin__form provider-admin__form inventory-entry__form w-full max-w-3xl"
        noValidate
        onSubmit={submit}
      >
        <InventoryFormHeading
          icon={<IconTruckReturn size={22} aria-hidden="true" />}
          title="Datos de la salida"
          description="Indique el material retirado. El servidor valida y actualiza las existencias."
        />

        <InventoryFormField
          label="Material a retirar *"
          icon={<IconPackage size={20} aria-hidden="true" />}
          error={errors.materialId}
          full
        >
          <select
            value={values.materialId}
            disabled={loading || Boolean(error)}
            aria-invalid={Boolean(errors.materialId)}
            onChange={(event) => update('materialId', event.target.value)}
          >
            <option value="">Seleccione un material</option>
            {availableMaterials.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </InventoryFormField>

        {loading ? (
          <p className="provider-admin__form-note" role="status">
            Cargando materiales disponibles…
          </p>
        ) : null}

        {error ? (
          <Alert
            className="materials-admin__form-full"
            tone="danger"
            title="No fue posible cargar los materiales"
          >
            <p className="m-0 mb-2">{error}</p>
            <Button type="button" variant="secondary" size="sm" onClick={refetch}>
              Reintentar
            </Button>
          </Alert>
        ) : null}

        {!loading && !error && availableMaterials.length === 0 ? (
          <Alert className="materials-admin__form-full" tone="warning">
            No hay materiales activos con existencias disponibles para retirar.
          </Alert>
        ) : null}

        {materialListTruncated ? (
          <p
            className="provider-admin__form-note materials-admin__form-full"
            role="note"
          >
            Se muestran los primeros {materiales.data.length} materiales. Si no
            encuentra el material, use el buscador del catálogo.
          </p>
        ) : null}

        <div className="materials-admin__form-full inv-stats-row">
          <div className="inv-stat">
            <p className="inv-stat__label">Unidad de medida</p>
            <p className="inv-stat__value">
              {selectedMaterial?.unidadMedida ?? 'Seleccione un material'}
            </p>
          </div>
          <div className="inv-stat">
            <p className="inv-stat__label">Existencia disponible</p>
            <p className="inv-stat__value">
              {displayedStock ?? 'Seleccione un material'}
            </p>
            <p className="inv-stat__hint">
              Referencia informativa; el backend valida nuevamente al registrar.
            </p>
          </div>
        </div>

        <InventoryFormField
          label="Cantidad a retirar *"
          icon={<IconNumbers size={20} aria-hidden="true" />}
          error={errors.cantidad}
          full
        >
          <input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={values.cantidad}
            aria-invalid={Boolean(errors.cantidad) || exceedsKnownStock}
            onChange={(event) => update('cantidad', event.target.value)}
          />
        </InventoryFormField>

        {availability?.kind === 'checking' ? (
          <div className="inv-state materials-admin__form-full" role="status">
            Verificando disponibilidad…
          </div>
        ) : null}

        {availability?.kind === 'invalid' ? (
          <div className="inv-error materials-admin__form-full" role="alert">
            <span
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <IconAlertTriangle size={18} aria-hidden="true" />
              {availability.message}
            </span>
          </div>
        ) : null}

        {availability?.kind === 'valid'
          ? (() => {
              const warning =
                availability.data.esAgotamientoTotal ||
                availability.data.esBajoMinimo
              return (
                <div
                  className="materials-admin__form-full inv-note"
                  role="status"
                  style={
                    warning
                      ? {
                          borderColor:
                            'color-mix(in srgb, var(--inv-warning, #b45309) 30%, var(--inv-border))',
                          background:
                            'color-mix(in srgb, var(--inv-warning, #b45309) 8%, white)',
                        }
                      : {
                          borderColor:
                            'color-mix(in srgb, var(--inv-success, #236c51) 28%, var(--inv-border))',
                          background:
                            'color-mix(in srgb, var(--inv-success, #236c51) 8%, white)',
                        }
                  }
                >
                  <strong
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      textTransform: 'none',
                      letterSpacing: 0,
                      fontSize: '0.95rem',
                    }}
                  >
                    {warning ? (
                      <IconAlertTriangle size={18} aria-hidden="true" />
                    ) : (
                      <IconCircleCheckFilled size={18} aria-hidden="true" />
                    )}
                    {availability.data.esAgotamientoTotal
                      ? 'La salida agotará este material'
                      : availability.data.esBajoMinimo
                        ? 'El material quedará bajo el mínimo'
                        : 'Salida disponible'}
                  </strong>
                  <span>{availability.data.mensaje}</span>
                </div>
              )
            })()
          : null}

        {idAveria || idSolicitud ? (
          <section
            className="inventory-exit__relations materials-admin__form-full inv-note"
            aria-label="Registros relacionados"
          >
            <strong>Origen de la salida</strong>
            {idAveria ? <span>Avería relacionada: #{idAveria}</span> : null}
            {idSolicitud ? (
              <span>Solicitud aprobada relacionada: #{idSolicitud}</span>
            ) : null}
            {returnToAveria ? (
              <Button to={returnToAveria} variant="tertiary" size="sm">
                Volver a la avería
              </Button>
            ) : null}
          </section>
        ) : null}

        <InventoryFormField
          label="Motivo u observación"
          icon={<IconAlignLeft size={20} aria-hidden="true" />}
          error={errors.observacion}
          full
          hint={<small>{values.observacion.length}/1000 caracteres</small>}
        >
          <textarea
            value={values.observacion}
            maxLength={1000}
            aria-invalid={Boolean(errors.observacion)}
            placeholder="Ej. Reparación de fuga en calle central"
            onChange={(event) => update('observacion', event.target.value)}
          />
        </InventoryFormField>

        <div className="materials-admin__form-full inv-actor" role="note">
          <span className="inv-actor__icon">
            <IconUser size={20} aria-hidden="true" />
          </span>
          <div className="inv-actor__copy">
            <p className="inv-actor__label">Responsable de la salida</p>
            <p className="inv-actor__name">{resolveAuthUserDisplayName(user)}</p>
            <p className="inv-actor__hint">
              Identidad verificada desde la sesión activa
            </p>
          </div>
          <Badge tone="success">
            <IconShieldCheck size={14} aria-hidden="true" />
            Verificado
          </Badge>
        </div>

        <div className="materials-admin__form-actions">
          <Button
            type="submit"
            leftIcon={<IconDeviceFloppy size={18} aria-hidden="true" />}
            loading={saving}
            disabled={
              loading ||
              Boolean(error) ||
              availableMaterials.length === 0 ||
              availability?.kind === 'checking'
            }
          >
            {saving ? 'Registrando salida…' : 'Confirmar salida'}
          </Button>
          <Button
            to={MATERIALES_PATH}
            variant="secondary"
            leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
          >
            Volver al catálogo
          </Button>
        </div>
      </form>
    </main>
  )
}
