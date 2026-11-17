import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  IconAlignLeft,
  IconArrowLeft,
  IconArrowRight,
  IconCircleCheck,
  IconClipboardList,
  IconDeviceFloppy,
  IconMinus,
  IconNote,
  IconPackage,
  IconPlus,
  IconUser,
} from '@tabler/icons-react'
import { useSearchParams } from 'react-router-dom'
import { AdminShell, Alert, Button, Card, PageHeader } from '../../../shared/ui'
import { useAuth } from '../../auth/components/AuthContext'
import { resolveAuthUserDisplayName } from '../../auth/utils/authUserDisplay'
import { getMateriales } from '../materialesApi'
import type { Material } from '../types'
import { InventoryFormField, InventoryFormHeading } from '../InventoryFormField'
import { createSolicitudMateriales } from './solicitudesMaterialesApi'
import {
  createEmptyMaterialRow,
  hasSolicitudMaterialesErrors,
  solicitudMaterialesErrorMessage,
  toSolicitudMaterialesPayload,
  validateSolicitudMateriales,
} from './solicitudMaterialesUtils'
import type { SolicitudMaterialFormErrors, SolicitudMateriales } from './types'
import { SOLICITUDES_MATERIALES_PATH } from '../inventarioPaths'
import { readSafeAveriaReturnPath } from '../../averias/inventario/averiaInventarioPaths'
import InventarioModuleMenu from '../InventarioModuleMenu'

const EMPTY_ERRORS: SolicitudMaterialFormErrors = { rows: {} }

export default function SolicitudMaterialesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const averiaValue = searchParams.get('idAveria') ?? searchParams.get('averiaId')
  const parsedAveria = averiaValue ? Number(averiaValue) : undefined
  const idAveria =
    parsedAveria && Number.isInteger(parsedAveria) && parsedAveria > 0
      ? parsedAveria
      : undefined
  const referenciaAveria = searchParams.get('referencia')?.trim()
  const returnToAveria = readSafeAveriaReturnPath(searchParams.get('from'))
  const [materials, setMaterials] = useState<Material[]>([])
  const [rows, setRows] = useState([createEmptyMaterialRow()])
  const [motivo, setMotivo] = useState('')
  const [errors, setErrors] = useState<SolicitudMaterialFormErrors>(EMPTY_ERRORS)
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<SolicitudMateriales | null>(null)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const submissionLockRef = useRef(false)

  const loadMaterials = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const response = await getMateriales({ activo: true, page: 1, limit: 100 })
      setMaterials(response.data.filter((material) => material.activo))
    } catch {
      setLoadError('No fue posible consultar los materiales activos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    void getMateriales({ activo: true, page: 1, limit: 100 })
      .then((response) => {
        if (active) setMaterials(response.data.filter((material) => material.activo))
      })
      .catch(() => {
        if (active) setLoadError('No fue posible consultar los materiales activos.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const selectedIds = useMemo(
    () => new Set(rows.map((row) => row.materialId).filter(Boolean)),
    [rows],
  )

  const updateRow = (
    key: string,
    field: 'materialId' | 'cantidad' | 'observacion',
    value: string,
  ) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, [field]: value } : row)),
    )
    setErrors((current) => ({
      ...current,
      form: undefined,
      rows: {
        ...current.rows,
        [key]: { ...current.rows[key], [field]: undefined },
      },
    }))
  }

  const stepCantidad = (key: string, delta: number) => {
    const row = rows.find((item) => item.key === key)
    const actual = Number.parseInt(row?.cantidad ?? '', 10)
    const base = Number.isInteger(actual) && actual > 0 ? actual : 0
    const siguiente = Math.max(1, base + delta)
    updateRow(key, 'cantidad', String(siguiente))
  }

  const removeRow = (key: string) => {
    setRows((current) => current.filter((row) => row.key !== key))
    setErrors((current) => {
      const nextRows = { ...current.rows }
      delete nextRows[key]
      return { ...current, rows: nextRows }
    })
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submissionLockRef.current) return
    const nextErrors = validateSolicitudMateriales(rows, motivo)
    setErrors(nextErrors)
    setSubmitError('')
    if (hasSolicitudMaterialesErrors(nextErrors)) {
      requestAnimationFrame(() => errorSummaryRef.current?.focus())
      return
    }
    submissionLockRef.current = true
    setSubmitting(true)
    try {
      const response = await createSolicitudMateriales(
        toSolicitudMaterialesPayload(rows, motivo, idAveria),
      )
      setCreated(response)
      setRows([createEmptyMaterialRow()])
      setMotivo('')
      setErrors(EMPTY_ERRORS)
    } catch (error) {
      setSubmitError(solicitudMaterialesErrorMessage(error))
      requestAnimationFrame(() => errorSummaryRef.current?.focus())
    } finally {
      submissionLockRef.current = false
      setSubmitting(false)
    }
  }

  if (created) {
    return (
      <AdminShell
        className="mx-auto max-w-4xl gap-5 sm:gap-6"
        aria-labelledby="solicitud-title"
      >
        <PageHeader
          id="solicitud-title"
          eyebrow="Solicitud registrada"
          title={created.codigo}
          description="El inventario no fue modificado."
        />
        <Alert
          tone="success"
          icon={<IconCircleCheck size={22} aria-hidden="true" />}
          title="Solicitud enviada"
        >
          La solicitud quedó en estado{' '}
          <strong className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-extrabold text-amber-700">
            {created.estado}
          </strong>
          .
          {created.idAveria ? (
            <p className="m-0 mt-2">
              Avería relacionada: <strong>#{created.idAveria}</strong>
            </p>
          ) : null}
        </Alert>
        <div className="flex flex-wrap gap-2">
          {returnToAveria ? (
            <Button to={returnToAveria} variant="primary">
              Volver a la avería
            </Button>
          ) : null}
          <Button
            to={SOLICITUDES_MATERIALES_PATH}
            variant="primary"
            rightIcon={<IconArrowRight size={19} aria-hidden="true" />}
          >
            Ver mis solicitudes
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setCreated(null)}
            leftIcon={<IconPlus size={19} aria-hidden="true" />}
          >
            Crear otra solicitud
          </Button>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell className="gap-5 sm:gap-6" aria-labelledby="solicitud-title">
      <PageHeader
        id="solicitud-title"
        eyebrow="Inventario · Fontanero"
        title="Nueva solicitud de materiales"
        description="Seleccione los materiales requeridos. Esta solicitud no descuenta ni reserva existencias."
        actions={
          <Button
            to={SOLICITUDES_MATERIALES_PATH}
            variant="secondary"
            leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
          >
            Mis solicitudes
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <Card padded className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eaf6ff] text-[#1e5a9c]">
            <IconUser size={20} stroke={2} aria-hidden="true" />
          </span>
          <div className="min-w-0 grid gap-0.5">
            <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.06em] text-sigasj-muted">
              Solicitante
            </span>
            <strong className="truncate text-base font-extrabold text-sigasj-ink">
              {resolveAuthUserDisplayName(user)}
            </strong>
            <small className="text-xs font-medium text-sigasj-muted">
              Obtenido de la sesión activa
            </small>
          </div>
        </Card>
        <InventarioModuleMenu inline />
      </div>

      {idAveria ? (
        <Card
          padded
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
          aria-label="Avería relacionada"
        >
          <div className="grid gap-1">
            <span className="text-xs font-extrabold uppercase tracking-[0.09em] text-[#1e5a9c]">
              Avería relacionada
            </span>
            <strong className="text-xl font-black tracking-tight text-[#1e5a9c]">
              {referenciaAveria || `Avería #${idAveria}`}
            </strong>
            <small className="text-sm font-medium text-slate-500">
              Identificador #{idAveria}
            </small>
          </div>
          {returnToAveria ? (
            <Button to={returnToAveria} variant="secondary">
              Volver a la avería
            </Button>
          ) : null}
        </Card>
      ) : null}

      <Card as="section" padded className="!p-5 sm:!p-6 lg:!p-8">
        <form className="grid w-full gap-6" onSubmit={submit} noValidate>
          <InventoryFormHeading
            icon={<IconClipboardList size={24} aria-hidden="true" />}
            title="Detalle de la solicitud"
            description="Agregue materiales y una observación. Enviar no modifica el stock."
          />

          {submitError || hasSolicitudMaterialesErrors(errors) ? (
            <Alert
              ref={errorSummaryRef}
              tabIndex={-1}
              tone="danger"
              title="No se pudo enviar la solicitud."
              className="col-span-full"
            >
              {submitError || errors.form || 'Revise los campos marcados.'}
            </Alert>
          ) : null}

          <div className="col-span-full flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="m-0 text-base font-extrabold text-[#1e5a9c]">
                Materiales requeridos
              </h3>
              <p className="m-0 mt-0.5 text-sm text-slate-600">
                Agregue uno o varios materiales y su cantidad.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() =>
                setRows((current) => [...current, createEmptyMaterialRow()])
              }
              disabled={
                loading ||
                materials.length === 0 ||
                selectedIds.size >= materials.length
              }
              leftIcon={<IconPlus size={19} aria-hidden="true" />}
            >
              Agregar material
            </Button>
          </div>

          {loading ? (
            <Alert tone="info" className="col-span-full" role="status">
              Consultando materiales activos…
            </Alert>
          ) : null}
          {loadError ? (
            <Alert tone="danger" className="col-span-full" role="alert">
              <span className="grid gap-3">
                <span>{loadError}</span>
                <span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => void loadMaterials()}
                  >
                    Reintentar
                  </Button>
                </span>
              </span>
            </Alert>
          ) : null}
          {!loading && !loadError && materials.length === 0 ? (
            <Alert tone="warning" className="col-span-full">
              No hay materiales activos disponibles.
            </Alert>
          ) : null}

          <div className="col-span-full grid gap-4">
            {rows.map((row, index) => {
              const selectedMaterial = materials.find(
                (material) => String(material.id) === row.materialId,
              )
              const rowErrors = errors.rows[row.key] ?? {}
              return (
                <fieldset
                  key={row.key}
                  disabled={submitting || loading || Boolean(loadError)}
                  className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-3 lg:p-5"
                >
                  <div className="col-span-full flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#cfe4f7] bg-[#eaf6ff] px-3 py-1 text-xs font-extrabold text-[#1e5a9c]">
                      <IconPackage size={14} aria-hidden="true" />
                      Material {index + 1}
                    </span>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeRow(row.key)}
                      disabled={submitting}
                      aria-label={`Eliminar material ${index + 1}`}
                      title="Eliminar material"
                    >
                      Eliminar
                    </Button>
                  </div>

                  <InventoryFormField
                    label="Material *"
                    icon={<IconPackage size={20} aria-hidden="true" />}
                    error={rowErrors.materialId}
                  >
                    <select
                      value={row.materialId}
                      onChange={(event) =>
                        updateRow(row.key, 'materialId', event.target.value)
                      }
                      aria-invalid={Boolean(rowErrors.materialId)}
                      aria-describedby={
                        rowErrors.materialId
                          ? `${row.key}-material-error`
                          : undefined
                      }
                    >
                      <option value="">Seleccione un material</option>
                      {materials.map((material) => (
                        <option
                          key={material.id}
                          value={material.id}
                          disabled={
                            selectedIds.has(String(material.id)) &&
                            row.materialId !== String(material.id)
                          }
                        >
                          {material.nombre} · {material.unidadMedida}
                        </option>
                      ))}
                    </select>
                  </InventoryFormField>

                  <label className="grid min-w-0 gap-2.5">
                    <span className="text-sm font-bold text-[#163f6b]">Cantidad *</span>
                    <div className="flex min-h-14 items-center gap-1 rounded-xl border border-slate-200 bg-white px-1 sm:px-2">
                      <button
                        type="button"
                        className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        aria-label={`Disminuir cantidad del material ${index + 1}`}
                        onClick={() => stepCantidad(row.key, -1)}
                      >
                        <IconMinus size={16} aria-hidden="true" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        className="min-w-0 flex-1 border-0 bg-transparent py-3 text-center text-slate-800 outline-none"
                        value={row.cantidad}
                        onChange={(event) =>
                          updateRow(row.key, 'cantidad', event.target.value)
                        }
                        aria-invalid={Boolean(rowErrors.cantidad)}
                        aria-describedby={
                          rowErrors.cantidad
                            ? `${row.key}-cantidad-error`
                            : undefined
                        }
                      />
                      <button
                        type="button"
                        className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                        aria-label={`Aumentar cantidad del material ${index + 1}`}
                        onClick={() => stepCantidad(row.key, 1)}
                      >
                        <IconPlus size={16} aria-hidden="true" />
                      </button>
                      <span className="shrink-0 pr-2 text-sm font-medium text-slate-500">
                        {selectedMaterial?.unidadMedida || 'unidad'}
                      </span>
                    </div>
                    {rowErrors.cantidad ? (
                      <small
                        id={`${row.key}-cantidad-error`}
                        className="font-semibold text-red-600"
                        role="alert"
                      >
                        {rowErrors.cantidad}
                      </small>
                    ) : null}
                  </label>

                  <InventoryFormField
                    label="Nota del material (opcional)"
                    icon={<IconNote size={20} aria-hidden="true" />}
                    error={rowErrors.observacion}
                  >
                    <input
                      maxLength={255}
                      value={row.observacion}
                      onChange={(event) =>
                        updateRow(row.key, 'observacion', event.target.value)
                      }
                      placeholder="Ej. Para tubería principal"
                      aria-invalid={Boolean(rowErrors.observacion)}
                    />
                  </InventoryFormField>
                </fieldset>
              )
            })}
          </div>

          {rows.length === 0 ? (
            <Button
              type="button"
              variant="secondary"
              className="col-span-full w-full sm:w-auto"
              onClick={() => setRows([createEmptyMaterialRow()])}
              leftIcon={<IconPlus size={19} aria-hidden="true" />}
            >
              Agregar el primer material
            </Button>
          ) : null}

          <InventoryFormField
            label="Observación general (opcional)"
            icon={<IconAlignLeft size={20} aria-hidden="true" />}
            error={errors.motivo}
            full
            multiline
            hint={
              <span className="text-xs font-medium text-slate-500">
                {motivo.length}/1000
              </span>
            }
          >
            <textarea
              value={motivo}
              onChange={(event) => {
                setMotivo(event.target.value)
                setErrors((current) => ({ ...current, motivo: undefined }))
              }}
              maxLength={1000}
              placeholder="Describa para qué necesita estos materiales."
              aria-invalid={Boolean(errors.motivo)}
            />
          </InventoryFormField>

          <div className="col-span-full flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="m-0 rounded-xl border border-amber-100 bg-amber-50/80 px-3.5 py-2.5 text-sm text-amber-900">
              <strong>Importante:</strong> enviar esta solicitud no modifica el stock.
            </p>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={
                  submitting || loading || Boolean(loadError) || materials.length === 0
                }
                loading={submitting}
                leftIcon={<IconDeviceFloppy size={19} aria-hidden="true" />}
              >
                {submitting ? 'Enviando…' : 'Enviar solicitud'}
              </Button>
              <Button
                to={SOLICITUDES_MATERIALES_PATH}
                variant="secondary"
                leftIcon={<IconArrowLeft size={19} aria-hidden="true" />}
              >
                Volver a mis solicitudes
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </AdminShell>
  )
}