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
  IconTrash,
  IconUser,
} from '@tabler/icons-react'
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Button } from '../../../shared/ui'
import { useAuth } from '../../auth/components/AuthContext'
import { resolveAuthUserDisplayName } from '../../auth/utils/authUserDisplay'
import { getMateriales } from '../materialesApi'
import type { Material } from '../types'
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
      <section
        className="material-request material-request--success !mx-auto !w-full !max-w-4xl"
        aria-labelledby="solicitud-title"
      >
        <div
          className="material-request__success !relative !isolate !overflow-hidden !rounded-[28px] !border-emerald-100 !bg-linear-to-br !from-white !via-emerald-50/45 !to-cyan-50/70 !p-10 !shadow-[0_20px_50px_rgba(15,118,110,0.14)] before:!absolute before:!-right-20 before:!-top-20 before:!-z-10 before:!size-64 before:!rounded-full before:!bg-emerald-200/25 max-[640px]:!p-6"
          role="status"
        >
          <span className="!grid !size-16 !place-items-center !rounded-2xl !bg-linear-to-br !from-emerald-500 !to-teal-600 !text-white !shadow-[0_12px_28px_rgba(5,150,105,0.3)]">
            <IconCircleCheck size={34} stroke={2.2} aria-hidden="true" />
          </span>
          <span className="material-request__eyebrow !mb-0 !mt-2 !text-emerald-700">
            Solicitud registrada
          </span>
          <h1
            className="!text-[clamp(2rem,5vw,3rem)] !font-black !tracking-[-0.035em] !text-[#1e5a9c]"
            id="solicitud-title"
          >
            {created.codigo}
          </h1>
          <p className="!text-lg !text-slate-600">
            La solicitud quedó en estado{' '}
            <strong className="!inline-flex !rounded-full !border !border-amber-200 !bg-amber-50 !px-3 !py-1 !text-sm !font-extrabold !text-amber-700 !shadow-sm">
              {created.estado}
            </strong>
            . El inventario no fue modificado.
          </p>
          {created.idAveria ? (
            <p>
              Avería relacionada: <strong>#{created.idAveria}</strong>
            </p>
          ) : null}
          <div className="material-request__success-actions">
            {returnToAveria ? (
              <Button to={returnToAveria} variant="primary">
                Volver a la avería
              </Button>
            ) : null}
            <Button
              to={SOLICITUDES_MATERIALES_PATH}
              variant="primary"
              rightIcon={
                <IconArrowRight size={19} aria-hidden="true" />
              }
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
        </div>
      </section>
    )
  }

  return (
    <section
      className="material-request !max-w-none !gap-6"
      aria-labelledby="solicitud-title"
    >
      <header className="material-request__header material-request__header--new-request material-request__header--rail-fixed !relative !block !overflow-hidden !rounded-[1.5rem] !border-[#d7e8f7] !bg-gradient-to-br !from-white !via-[#f7fbff] !to-[#eaf4ff] !p-6 !shadow-[0_14px_32px_rgba(30,90,156,0.1)] min-[900px]:!min-h-[17rem] min-[900px]:!p-8 min-[900px]:!pr-[384px] max-[899px]:!p-5">
        <div
          className="pointer-events-none absolute -left-10 top-[-20%] hidden size-52 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.28)_0%,transparent_70%)] min-[900px]:block"
          aria-hidden="true"
        />

        <div className="relative z-[1] grid max-w-[36rem] gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#1e5a9c] text-white shadow-[0_10px_22px_rgba(30,90,156,0.28)] sm:size-[4.25rem]">
            <IconPackage size={30} stroke={2.2} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="material-request__eyebrow inventory-page-eyebrow !mb-1 !text-[0.72rem] !font-bold !tracking-[0.08em] !text-sigasj-primary">
              Inventario · Fontanero
            </p>
            <h1
              className="inventory-page-title !m-0 !text-[clamp(1.45rem,2.6vw,1.85rem)] !font-black !tracking-[-0.03em] !text-sigasj-ink"
              id="solicitud-title"
            >
              Nueva solicitud de materiales
            </h1>
            <p className="inventory-page-subtitle !mt-2 !max-w-[34rem] !text-[0.95rem] !leading-relaxed !text-slate-600">
              Seleccione los materiales requeridos. Esta solicitud no descuenta ni
              reserva existencias.
            </p>
          </div>
        </div>

        <div className="material-request__right-rail !relative !z-[1] !mt-5 !grid !min-w-0 !gap-4 min-[900px]:!absolute min-[900px]:!top-8 min-[900px]:!right-8 min-[900px]:!mt-0 min-[900px]:!w-[320px]">
          <div className="material-request__identity material-request__identity--new-request !relative !inset-auto !m-0 !flex !w-full !min-w-0 !max-w-none !items-center !gap-3 !overflow-hidden !rounded-2xl !border !border-[#cfe4f7] !bg-white !p-3.5 !shadow-[0_8px_22px_rgba(30,90,156,0.1)]">
            <span className="!grid !size-11 !shrink-0 !place-items-center !rounded-xl !bg-[#1e5a9c] !text-white !shadow-[0_8px_16px_rgba(30,90,156,0.25)]">
              <IconUser size={20} stroke={2} aria-hidden="true" />
            </span>
            <div className="!min-w-0 !grid !gap-0.5">
              <span className="!text-[0.68rem] !font-extrabold !uppercase !tracking-[0.06em] !text-[#1e5a9c]">
                Solicitante
              </span>
              <strong className="!truncate !text-base !font-black !tracking-[-0.015em] !text-[#1e5a9c]">
                {resolveAuthUserDisplayName(user)}
              </strong>
              <small className="!flex !items-center !gap-1.5 !text-xs !font-medium !text-slate-500">
                <span
                  className="!size-1.5 !rounded-full !bg-emerald-500 !shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
                  aria-hidden="true"
                />
                Obtenido de la sesión activa
              </small>
            </div>
          </div>
          <InventarioModuleMenu inline />
        </div>
      </header>

      {idAveria ? (
        <aside
          className="material-request__averia !grid !grid-cols-1 !gap-3 !overflow-hidden !rounded-[1.25rem] !border !border-[#cfe4f7] !bg-gradient-to-br !from-white !via-[#f5faff] !to-[#e8f4ff] !p-5 !shadow-[0_10px_26px_rgba(30,90,156,0.08)] md:!grid-cols-[minmax(0,1fr)_auto] md:!items-center"
          aria-label="Avería relacionada"
        >
          <div className="!grid !gap-1">
            <span className="!text-xs !font-extrabold !uppercase !tracking-[0.09em] !text-[#1e5a9c]">
              Avería relacionada
            </span>
            <strong className="!text-xl !font-black !tracking-[-0.015em] !text-[#1e5a9c]">
              {referenciaAveria || `Avería #${idAveria}`}
            </strong>
            <small className="!text-sm !font-medium !text-slate-500">
              Identificador #{idAveria}
            </small>
          </div>
          {returnToAveria ? (
            <Link
              className="material-request__add group !inline-flex !min-h-11 !items-center !justify-center !rounded-2xl !border !border-[#bfe3fa] !bg-white !px-5 !font-extrabold !text-[#1e5a9c] !no-underline !shadow-sm !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-blue-400 hover:!bg-[#eaf6ff]"
              to={returnToAveria}
            >
              Volver a la avería
            </Link>
          ) : null}
        </aside>
      ) : null}

      <form
        className="material-request__form provider-admin__form !w-full !max-w-none !gap-6 !rounded-[1.5rem] !border-[#d7e8f7] !bg-white !p-6 !shadow-[0_14px_34px_rgba(30,90,156,0.09)] sm:!p-7"
        onSubmit={submit}
        noValidate
      >
        <div className="provider-admin__form-heading !flex !items-start !gap-4 !border-b !border-slate-100 !pb-5">
          <span className="!grid !size-12 !shrink-0 !place-items-center !rounded-2xl !bg-[#1e5a9c] !text-white !shadow-[0_10px_22px_rgba(30,90,156,0.28)] sm:!size-14">
            <IconClipboardList size={24} aria-hidden="true" />
          </span>
          <div className="!min-w-0">
            <h2 className="!m-0 !text-[1.15rem] !font-extrabold !tracking-tight !text-[#1e5a9c]">
              Detalle de la solicitud
            </h2>
            <p className="!m-0 !mt-1 !text-sm !leading-relaxed !text-slate-600">
              Agregue materiales y una observación. Enviar no modifica el stock.
            </p>
          </div>
        </div>

        {submitError || hasSolicitudMaterialesErrors(errors) ? (
          <div
            className="material-request__alert !rounded-2xl"
            ref={errorSummaryRef}
            tabIndex={-1}
            role="alert"
          >
            <strong>No se pudo enviar la solicitud.</strong>
            <span>{submitError || errors.form || 'Revise los campos marcados.'}</span>
          </div>
        ) : null}

        <div className="material-request__section-heading !flex !flex-wrap !items-center !justify-between !gap-3 !rounded-2xl !border !border-[#e8f1f8] !bg-[#f7fbff] !p-4 sm:!p-5">
          <div>
            <h2 className="!m-0 !text-base !font-extrabold !text-[#1e5a9c]">
              Materiales requeridos
            </h2>
            <p className="!m-0 !mt-0.5 !text-sm !text-slate-600">
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
          <div className="material-request__state !rounded-2xl" role="status">
            <span className="material-request__spinner" />
            Consultando materiales activos…
          </div>
        ) : null}
        {loadError ? (
          <div className="material-request__alert !rounded-2xl" role="alert">
            <span>{loadError}</span>
            <button type="button" onClick={() => void loadMaterials()}>
              Reintentar
            </button>
          </div>
        ) : null}
        {!loading && !loadError && materials.length === 0 ? (
          <div className="material-request__state !rounded-2xl">
            No hay materiales activos disponibles.
          </div>
        ) : null}

        <div className="material-request__rows !gap-4">
          {rows.map((row, index) => {
            const selectedMaterial = materials.find(
              (material) => String(material.id) === row.materialId,
            )
            const rowErrors = errors.rows[row.key] ?? {}
            return (
              <fieldset
                className="material-request__row !grid !gap-4 !rounded-[1.25rem] !border !border-[#d7e8f7] !bg-gradient-to-br !from-white !to-[#f5faff] !p-4 !pt-[3.75rem] !shadow-[0_8px_22px_rgba(30,90,156,0.06)] max-[760px]:!grid-cols-1 min-[761px]:!grid-cols-[minmax(0,1.35fr)_minmax(11rem,0.7fr)_minmax(0,1fr)] min-[761px]:!gap-4 min-[761px]:!p-5 min-[761px]:!pt-[4rem]"
                key={row.key}
                disabled={submitting || loading || Boolean(loadError)}
              >
                <legend className="material-request__row-top !border-b !border-[#e8f1f8]">
                  <span className="!inline-flex !items-center !gap-2 !rounded-full !border !border-[#cfe4f7] !bg-[#eaf6ff] !px-3 !py-1 !text-xs !font-extrabold !text-[#1e5a9c]">
                    <IconPackage size={14} aria-hidden="true" />
                    Material {index + 1}
                  </span>
                  <button
                    type="button"
                    className="material-request__remove !rounded-xl"
                    onClick={() => removeRow(row.key)}
                    aria-label={`Eliminar material ${index + 1}`}
                    disabled={submitting}
                    title="Eliminar material"
                  >
                    <IconTrash size={18} aria-hidden="true" />
                    <span>Eliminar</span>
                  </button>
                </legend>

                <label className="material-request__material-field ![grid-column:auto] !grid !gap-1.5 sm:![grid-column:auto]">
                  <span className="!inline-flex !items-center !gap-1 !text-sm !font-bold !text-[#1e5a9c]">
                    Material <strong className="!text-rose-500" aria-hidden="true">*</strong>
                  </span>
                  <span className="provider-admin__control !rounded-xl !border !border-[#cfe4f7] !bg-white !shadow-sm">
                    <IconPackage size={20} aria-hidden="true" />
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
                  </span>
                  {rowErrors.materialId ? (
                    <small
                      id={`${row.key}-material-error`}
                      className="material-request__field-error"
                    >
                      {rowErrors.materialId}
                    </small>
                  ) : null}
                </label>

                <label className="material-request__quantity-field !grid !gap-1.5">
                  <span className="!inline-flex !items-center !gap-1 !text-sm !font-bold !text-[#1e5a9c]">
                    Cantidad <strong className="!text-rose-500" aria-hidden="true">*</strong>
                  </span>
                  <div className="material-request__quantity !rounded-xl !shadow-sm">
                    <button
                      type="button"
                      className="material-request__step"
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
                      className="material-request__step"
                      aria-label={`Aumentar cantidad del material ${index + 1}`}
                      onClick={() => stepCantidad(row.key, 1)}
                    >
                      <IconPlus size={16} aria-hidden="true" />
                    </button>
                    <span className="material-request__unit">
                      {selectedMaterial?.unidadMedida || 'unidad'}
                    </span>
                  </div>
                  {rowErrors.cantidad ? (
                    <small
                      id={`${row.key}-cantidad-error`}
                      className="material-request__field-error"
                    >
                      {rowErrors.cantidad}
                    </small>
                  ) : null}
                </label>

                <label className="material-request__note-field !grid !gap-1.5">
                  <span className="!inline-flex !items-baseline !gap-2 !text-sm !font-bold !text-[#1e5a9c]">
                    Nota del material{' '}
                    <small className="!font-medium !text-slate-500">(opcional)</small>
                  </span>
                  <span className="provider-admin__control !rounded-xl !border !border-[#cfe4f7] !bg-white !shadow-sm">
                    <IconNote size={20} aria-hidden="true" />
                    <input
                      maxLength={255}
                      value={row.observacion}
                      onChange={(event) =>
                        updateRow(row.key, 'observacion', event.target.value)
                      }
                      placeholder="Ej. Para tubería principal"
                      aria-invalid={Boolean(rowErrors.observacion)}
                    />
                  </span>
                  {rowErrors.observacion ? (
                    <small className="material-request__field-error">
                      {rowErrors.observacion}
                    </small>
                  ) : null}
                </label>
              </fieldset>
            )
          })}
        </div>

        {rows.length === 0 ? (
          <button
            type="button"
            className="material-request__empty-add !rounded-2xl"
            onClick={() => setRows([createEmptyMaterialRow()])}
          >
            <IconPlus size={19} aria-hidden="true" /> Agregar el primer material
          </button>
        ) : null}

        <label className="material-request__motive materials-admin__form-full !grid !gap-2 !rounded-2xl !border !border-[#e8f1f8] !bg-[#f7fbff] !p-4 sm:!p-5">
          <span className="!inline-flex !items-baseline !gap-2 !text-sm !font-bold !text-[#1e5a9c]">
            Observación general{' '}
            <small className="!font-medium !text-slate-500">(opcional)</small>
          </span>
          <span className="provider-admin__control !rounded-xl !border !border-[#cfe4f7] !bg-white !shadow-sm">
            <IconAlignLeft size={20} aria-hidden="true" />
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
          </span>
          <span className="material-request__counter">{motivo.length}/1000</span>
          {errors.motivo ? (
            <small className="material-request__field-error">{errors.motivo}</small>
          ) : null}
        </label>

        <footer className="material-request__actions materials-admin__form-actions !flex !flex-col !gap-4 !border-t !border-slate-100 !pt-5 sm:!flex-row sm:!items-center sm:!justify-between">
          <p className="!m-0 !rounded-xl !border !border-amber-100 !bg-amber-50/80 !px-3.5 !py-2.5 !text-sm !text-amber-900">
            <strong>Importante:</strong> enviar esta solicitud no modifica el stock.
          </p>
          <div className="!flex !flex-wrap !items-center !justify-end !gap-3 max-[700px]:!w-full max-[700px]:!flex-col [&>*]:max-[700px]:!w-full">
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
        </footer>
      </form>
    </section>
  )
}
