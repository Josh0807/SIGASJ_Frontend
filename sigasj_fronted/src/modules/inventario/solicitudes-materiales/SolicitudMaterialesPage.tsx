import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { IconAlignLeft, IconArrowLeft, IconArrowRight, IconCircleCheck, IconClipboardList, IconDeviceFloppy, IconMinus, IconNote, IconPackage, IconPlus, IconTrash, IconUser } from '@tabler/icons-react'
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
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
  const idAveria = parsedAveria && Number.isInteger(parsedAveria) && parsedAveria > 0 ? parsedAveria : undefined
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
    return () => { active = false }
  }, [])

  const selectedIds = useMemo(
    () => new Set(rows.map((row) => row.materialId).filter(Boolean)),
    [rows],
  )

  const updateRow = (key: string, field: 'materialId' | 'cantidad' | 'observacion', value: string) => {
    setRows((current) => current.map((row) => row.key === key ? { ...row, [field]: value } : row))
    setErrors((current) => ({ ...current, form: undefined, rows: { ...current.rows, [key]: { ...current.rows[key], [field]: undefined } } }))
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
      const response = await createSolicitudMateriales(toSolicitudMaterialesPayload(rows, motivo, idAveria))
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
    return <section className="material-request material-request--success !mx-auto !w-full !max-w-4xl" aria-labelledby="solicitud-title">
      <div className="material-request__success !relative !isolate !overflow-hidden !rounded-[28px] !border-emerald-100 !bg-linear-to-br !from-white !via-emerald-50/45 !to-cyan-50/70 !p-10 !shadow-[0_20px_50px_rgba(15,118,110,0.14)] before:!absolute before:!-right-20 before:!-top-20 before:!-z-10 before:!size-64 before:!rounded-full before:!bg-emerald-200/25 max-[640px]:!p-6" role="status">
        <span className="!grid !size-16 !place-items-center !rounded-2xl !bg-linear-to-br !from-emerald-500 !to-teal-600 !text-white !shadow-[0_12px_28px_rgba(5,150,105,0.3)]"><IconCircleCheck size={34} stroke={2.2} aria-hidden="true" /></span>
        <span className="material-request__eyebrow !mb-0 !mt-2 !text-emerald-700">Solicitud registrada</span>
        <h1 className="!text-[clamp(2rem,5vw,3rem)] !font-black !tracking-[-0.035em] !text-[#062e63]" id="solicitud-title">{created.codigo}</h1>
        <p className="!text-lg !text-slate-600">La solicitud quedó en estado <strong className="!inline-flex !rounded-full !border !border-amber-200 !bg-amber-50 !px-3 !py-1 !text-sm !font-extrabold !text-amber-700 !shadow-sm">{created.estado}</strong>. El inventario no fue modificado.</p>
        {created.idAveria ? <p>Avería relacionada: <strong>#{created.idAveria}</strong></p> : null}
        <div className="material-request__success-actions">
          {returnToAveria ? <Link className="material-request__primary group !rounded-2xl !border-0 !bg-linear-to-r !from-blue-700 !to-sky-500 !px-6 !py-3.5 !font-extrabold !text-white !shadow-[0_10px_24px_rgba(37,99,235,0.28)] !transition-all !duration-300 hover:!-translate-y-1 hover:!shadow-[0_16px_32px_rgba(37,99,235,0.38)] motion-reduce:!transform-none motion-reduce:!transition-none" to={returnToAveria}>Volver a la avería</Link> : null}
          <Link className="material-request__primary group !rounded-2xl !border-0 !bg-linear-to-r !from-blue-700 !via-blue-600 !to-cyan-500 !px-6 !py-3.5 !font-extrabold !text-white !shadow-[0_10px_24px_rgba(37,99,235,0.28)] !transition-all !duration-300 hover:!-translate-y-1 hover:!scale-[1.02] hover:!shadow-[0_16px_32px_rgba(37,99,235,0.38)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" to={SOLICITUDES_MATERIALES_PATH}>Ver mis solicitudes<IconArrowRight className="!transition-transform !duration-300 group-hover:!translate-x-1" size={19} aria-hidden="true" /></Link>
          <button className="material-request__add group !rounded-2xl !border !border-blue-200 !bg-white !px-6 !py-3.5 !font-extrabold !text-blue-700 !shadow-[0_8px_20px_rgba(37,99,235,0.12)] !transition-all !duration-300 hover:!-translate-y-1 hover:!scale-[1.02] hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.2)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" type="button" onClick={() => setCreated(null)}><IconPlus className="!transition-transform !duration-300 group-hover:!rotate-90" size={19} aria-hidden="true" />Crear otra solicitud</button>
        </div>
      </div>
    </section>
  }

  return <section className="material-request !max-w-none !gap-8" aria-labelledby="solicitud-title">
    <header className="material-request__header material-request__header--new-request material-request__header--rail-fixed !relative !block !min-h-[280px] !rounded-[26px] !border-sky-100 !bg-white !p-8 !shadow-[0_14px_38px_rgba(30,90,156,0.08)] min-[900px]:!pr-[384px] max-[899px]:!min-h-0 max-[899px]:!p-6">
      <div>
        <p className="material-request__eyebrow inventory-page-eyebrow">Inventario · Fontanero</p>
        <h1 className="inventory-page-title" id="solicitud-title">Nueva solicitud de materiales</h1>
        <p className="inventory-page-subtitle">Seleccione los materiales requeridos. Esta solicitud no descuenta ni reserva existencias.</p>
      </div>
      <div className="material-request__right-rail !grid !min-w-0 !gap-4 min-[900px]:!absolute min-[900px]:!top-8 min-[900px]:!right-8 min-[900px]:!w-[320px] max-[899px]:!mt-6 max-[899px]:!w-full">
        <InventarioModuleMenu inline />
        <div className="material-request__identity material-request__identity--new-request group !relative !inset-auto !m-0 !w-full !min-w-0 !max-w-none !overflow-hidden !rounded-[22px] !border !border-blue-200/70 !bg-linear-to-br !from-white !via-blue-50 !to-sky-100 !p-4 !shadow-[0_12px_30px_rgba(37,99,235,0.14)] !transition-all !duration-300 before:!absolute before:!-right-8 before:!-top-8 before:!size-24 before:!rounded-full before:!bg-blue-300/20 hover:!-translate-y-1 hover:!shadow-[0_18px_38px_rgba(37,99,235,0.2)] motion-reduce:!transform-none motion-reduce:!transition-none">
          <span className="!flex !items-center !gap-3 !text-blue-700">
            <span className="!grid !size-10 !place-items-center !rounded-xl !bg-linear-to-br !from-blue-600 !to-cyan-500 !text-white !shadow-[0_8px_18px_rgba(37,99,235,0.28)] !transition-transform !duration-300 group-hover:!rotate-3 group-hover:!scale-105 motion-reduce:!transform-none"><IconUser size={20} stroke={2} aria-hidden="true" /></span>
            Solicitante
          </span>
          <strong className="!mt-2 !text-xl !font-black !tracking-[-0.015em] !text-[#062e63]">{resolveAuthUserDisplayName(user)}</strong>
          <small className="!flex !items-center !gap-2 !text-sm !font-medium !text-slate-500 before:!size-2 before:!rounded-full before:!bg-emerald-500 before:!shadow-[0_0_0_4px_rgba(16,185,129,0.12)]">Obtenido de la sesión activa</small>
        </div>
      </div>
    </header>

    {idAveria ? <aside className="material-request__averia !grid !grid-cols-1 !gap-2 !overflow-hidden !rounded-[24px] !border !border-blue-100 !bg-linear-to-br !from-white !via-blue-50/50 !to-sky-100/70 !p-6 !shadow-[0_12px_32px_rgba(30,90,156,0.10)] md:!grid-cols-[minmax(0,1fr)_auto] md:!items-center" aria-label="Avería relacionada">
      <div className="!grid !gap-1">
        <span className="!text-xs !font-extrabold !uppercase !tracking-[0.09em] !text-blue-600">Avería relacionada</span>
        <strong className="!text-xl !font-black !tracking-[-0.015em] !text-[#062e63]">{referenciaAveria || `Avería #${idAveria}`}</strong>
        <small className="!text-sm !font-medium !text-slate-500">Identificador #{idAveria}</small>
      </div>
      {returnToAveria ? <Link className="material-request__add group !inline-flex !min-h-12 !items-center !justify-center !rounded-2xl !border !border-blue-200 !bg-white !px-6 !font-extrabold !text-blue-700 !no-underline !shadow-[0_8px_20px_rgba(37,99,235,0.13)] !transition-all !duration-300 hover:!-translate-y-1 hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.22)] active:!translate-y-0 active:!scale-[0.97]" to={returnToAveria}>Volver a la avería</Link> : null}
    </aside> : null}

    <form className="material-request__form provider-admin__form !w-full !max-w-none !rounded-[26px] !border-sky-100 !bg-white !p-8 !shadow-[0_16px_42px_rgba(30,90,156,0.09)]" onSubmit={submit} noValidate>
      <div className="provider-admin__form-heading !border-b !border-slate-100 !pb-6">
        <span className="!grid !size-14 !place-items-center !rounded-2xl !bg-linear-to-br !from-blue-600 !to-cyan-500 !text-white !shadow-[0_10px_22px_rgba(37,99,235,0.28)]"><IconClipboardList size={25} aria-hidden="true" /></span>
        <div>
          <h2>Detalle de la solicitud</h2>
          <p>Agregue materiales y una observación. Enviar no modifica el stock.</p>
        </div>
      </div>
      {(submitError || hasSolicitudMaterialesErrors(errors)) ? <div className="material-request__alert" ref={errorSummaryRef} tabIndex={-1} role="alert">
        <strong>No se pudo enviar la solicitud.</strong>
        <span>{submitError || errors.form || 'Revise los campos marcados.'}</span>
      </div> : null}

      <div className="material-request__section-heading !items-center !rounded-2xl !bg-slate-50/80 !p-5">
        <div><h2>Materiales requeridos</h2><p>Agregue uno o varios materiales y su cantidad.</p></div>
        <button type="button" className="material-request__add !min-h-12 !rounded-2xl !border-0 !bg-linear-to-r !from-blue-600 !to-sky-500 !px-5 !font-extrabold !text-white !shadow-[0_9px_20px_rgba(37,99,235,0.24)] !transition-all !duration-300 hover:!-translate-y-1 hover:!from-blue-700 hover:!to-cyan-500 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.34)] active:!translate-y-0 active:!scale-[0.98] motion-reduce:!transform-none motion-reduce:!transition-none" onClick={() => setRows((current) => [...current, createEmptyMaterialRow()])} disabled={loading || materials.length === 0 || selectedIds.size >= materials.length}>
          <IconPlus size={19} aria-hidden="true" /> Agregar material
        </button>
      </div>

      {loading ? <div className="material-request__state" role="status"><span className="material-request__spinner" />Consultando materiales activos…</div> : null}
      {loadError ? <div className="material-request__alert" role="alert"><span>{loadError}</span><button type="button" onClick={() => void loadMaterials()}>Reintentar</button></div> : null}
      {!loading && !loadError && materials.length === 0 ? <div className="material-request__state">No hay materiales activos disponibles.</div> : null}

      <div className="material-request__rows">
        {rows.map((row, index) => {
          const selectedMaterial = materials.find((material) => String(material.id) === row.materialId)
          const rowErrors = errors.rows[row.key] ?? {}
          return <fieldset className="material-request__row !rounded-[22px] !border-sky-100 !bg-linear-to-br !from-white !to-sky-50/40 !shadow-[0_8px_24px_rgba(30,90,156,0.06)]" key={row.key} disabled={submitting || loading || Boolean(loadError)}>
            <legend className="material-request__row-top">
              <span className="!rounded-full !bg-blue-50 !px-3 !py-1 !text-xs !font-extrabold !text-blue-700">Material {index + 1}</span>
              <button type="button" className="material-request__remove" onClick={() => removeRow(row.key)} aria-label={`Eliminar material ${index + 1}`} disabled={submitting} title="Eliminar material"><IconTrash size={18} aria-hidden="true" /><span>Eliminar</span></button>
            </legend>
            <label className="material-request__material-field"><span className="!inline-flex !items-center !gap-1">Material <strong className="!text-rose-500" aria-hidden="true">*</strong></span>
              <span className="provider-admin__control">
                <IconPackage size={20} aria-hidden="true" />
                <select value={row.materialId} onChange={(event) => updateRow(row.key, 'materialId', event.target.value)} aria-invalid={Boolean(rowErrors.materialId)} aria-describedby={rowErrors.materialId ? `${row.key}-material-error` : undefined}>
                  <option value="">Seleccione un material</option>
                  {materials.map((material) => <option key={material.id} value={material.id} disabled={selectedIds.has(String(material.id)) && row.materialId !== String(material.id)}>{material.nombre} · {material.unidadMedida}</option>)}
                </select>
              </span>
              {rowErrors.materialId ? <small id={`${row.key}-material-error`} className="material-request__field-error">{rowErrors.materialId}</small> : null}
            </label>
            <label className="material-request__quantity-field"><span className="!inline-flex !items-center !gap-1">Cantidad <strong className="!text-rose-500" aria-hidden="true">*</strong></span>
              <div className="material-request__quantity">
                <button type="button" className="material-request__step" aria-label={`Disminuir cantidad del material ${index + 1}`} onClick={() => stepCantidad(row.key, -1)}>
                  <IconMinus size={16} aria-hidden="true" />
                </button>
                <input type="number" min="1" step="1" inputMode="numeric" value={row.cantidad} onChange={(event) => updateRow(row.key, 'cantidad', event.target.value)} aria-invalid={Boolean(rowErrors.cantidad)} aria-describedby={rowErrors.cantidad ? `${row.key}-cantidad-error` : undefined} />
                <button type="button" className="material-request__step" aria-label={`Aumentar cantidad del material ${index + 1}`} onClick={() => stepCantidad(row.key, 1)}>
                  <IconPlus size={16} aria-hidden="true" />
                </button>
                <span className="material-request__unit">{selectedMaterial?.unidadMedida || 'unidad'}</span>
              </div>
              {rowErrors.cantidad ? <small id={`${row.key}-cantidad-error`} className="material-request__field-error">{rowErrors.cantidad}</small> : null}
            </label>
            <label className="material-request__note-field"><span className="!inline-flex !items-baseline !gap-2">Nota del material <small className="!font-medium !text-slate-500">(opcional)</small></span>
              <span className="provider-admin__control">
                <IconNote size={20} aria-hidden="true" />
                <input maxLength={255} value={row.observacion} onChange={(event) => updateRow(row.key, 'observacion', event.target.value)} placeholder="Ej. Para tubería principal" aria-invalid={Boolean(rowErrors.observacion)} />
              </span>
              {rowErrors.observacion ? <small className="material-request__field-error">{rowErrors.observacion}</small> : null}
            </label>
          </fieldset>
        })}
      </div>

      {rows.length === 0 ? <button type="button" className="material-request__empty-add" onClick={() => setRows([createEmptyMaterialRow()])}><IconPlus size={19} aria-hidden="true" /> Agregar el primer material</button> : null}

      <label className="material-request__motive materials-admin__form-full">Observación general <small>(opcional)</small>
        <span className="provider-admin__control">
          <IconAlignLeft size={20} aria-hidden="true" />
          <textarea value={motivo} onChange={(event) => { setMotivo(event.target.value); setErrors((current) => ({ ...current, motivo: undefined })) }} maxLength={1000} placeholder="Describa para qué necesita estos materiales." aria-invalid={Boolean(errors.motivo)} />
        </span>
        <span className="material-request__counter">{motivo.length}/1000</span>
        {errors.motivo ? <small className="material-request__field-error">{errors.motivo}</small> : null}
      </label>

      <footer className="material-request__actions materials-admin__form-actions">
        <p><strong>Importante:</strong> enviar esta solicitud no modifica el stock.</p>
        <div className="!ml-auto !flex !flex-wrap !items-center !justify-end !gap-3 max-[700px]:!ml-0 max-[700px]:!w-full max-[700px]:!flex-col [&>*]:max-[700px]:!w-full">
          <button className="material-request__primary materials-admin__primary group !rounded-2xl !bg-linear-to-r !from-blue-600 !to-sky-500 !shadow-[0_10px_24px_rgba(37,99,235,0.28)] !transition-all !duration-300 !ease-out hover:!-translate-y-1 hover:!scale-[1.02] hover:!from-blue-700 hover:!to-cyan-500 hover:!shadow-[0_16px_32px_rgba(37,99,235,0.38)] active:!translate-y-0 active:!scale-[0.97] disabled:!translate-y-0 disabled:!scale-100 motion-reduce:!transform-none motion-reduce:!transition-none" type="submit" disabled={submitting || loading || Boolean(loadError) || materials.length === 0}>
            <IconDeviceFloppy className="!transition-transform !duration-300 group-hover:!-rotate-6 group-hover:!scale-110 group-active:!rotate-0 motion-reduce:!transform-none" size={19} aria-hidden="true" />
            {submitting ? 'Enviando…' : 'Enviar solicitud'}
          </button>
          <Link className="materials-admin__secondary group !rounded-2xl !border !border-blue-200 !bg-white !px-5 !py-3 !font-extrabold !text-blue-700 !shadow-[0_8px_20px_rgba(37,99,235,0.12)] !transition-all !duration-300 hover:!-translate-y-1 hover:!scale-[1.02] hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.2)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" to={SOLICITUDES_MATERIALES_PATH}><IconArrowLeft className="!transition-transform !duration-300 group-hover:!-translate-x-1.5 motion-reduce:!transform-none" size={19} aria-hidden="true" />Volver a mis solicitudes</Link>
        </div>
      </footer>
    </form>
  </section>
}
