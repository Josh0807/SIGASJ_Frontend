import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { IconPlus, IconTrash } from '@tabler/icons-react'
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

const EMPTY_ERRORS: SolicitudMaterialFormErrors = { rows: {} }

export default function SolicitudMaterialesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const averiaValue = searchParams.get('idAveria') ?? searchParams.get('averiaId')
  const parsedAveria = averiaValue ? Number(averiaValue) : undefined
  const idAveria = parsedAveria && Number.isInteger(parsedAveria) && parsedAveria > 0 ? parsedAveria : undefined
  const referenciaAveria = searchParams.get('referencia')?.trim()
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
    return <section className="material-request material-request--success" aria-labelledby="solicitud-title">
      <div className="material-request__success" role="status">
        <span className="material-request__eyebrow">Solicitud registrada</span>
        <h1 id="solicitud-title">{created.codigo}</h1>
        <p>La solicitud quedó en estado <strong>{created.estado}</strong>. El inventario no fue modificado.</p>
        {created.idAveria ? <p>Avería relacionada: <strong>#{created.idAveria}</strong></p> : null}
        <div className="material-request__success-actions">
          <Link className="material-request__primary" to={SOLICITUDES_MATERIALES_PATH}>Ver mis solicitudes</Link>
          <button className="material-request__add" type="button" onClick={() => setCreated(null)}>Crear otra solicitud</button>
        </div>
      </div>
    </section>
  }

  return <section className="material-request" aria-labelledby="solicitud-title">
    <header className="material-request__header">
      <div>
        <p className="material-request__eyebrow">Inventario · Fontanero</p>
        <h1 id="solicitud-title">Nueva solicitud de materiales</h1>
        <p>Seleccione los materiales requeridos. Esta solicitud no descuenta ni reserva existencias.</p>
      </div>
      <div className="material-request__identity">
        <span>Solicitante</span>
        <strong>{resolveAuthUserDisplayName(user)}</strong>
        <small>Obtenido de la sesión activa</small>
      </div>
    </header>

    {idAveria ? <aside className="material-request__averia" aria-label="Avería relacionada">
      <span>Avería relacionada</span>
      <strong>{referenciaAveria || `Avería #${idAveria}`}</strong>
      <small>Identificador #{idAveria}</small>
    </aside> : null}

    <form className="material-request__form" onSubmit={submit} noValidate>
      {(submitError || hasSolicitudMaterialesErrors(errors)) ? <div className="material-request__alert" ref={errorSummaryRef} tabIndex={-1} role="alert">
        <strong>No se pudo enviar la solicitud.</strong>
        <span>{submitError || errors.form || 'Revise los campos marcados.'}</span>
      </div> : null}

      <div className="material-request__section-heading">
        <div><h2>Materiales requeridos</h2><p>Agregue uno o varios materiales y su cantidad.</p></div>
        <button type="button" className="material-request__add" onClick={() => setRows((current) => [...current, createEmptyMaterialRow()])} disabled={loading || materials.length === 0 || selectedIds.size >= materials.length}>
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
          return <fieldset className="material-request__row" key={row.key} disabled={submitting || loading || Boolean(loadError)}>
            <legend>Material {index + 1}</legend>
            <label className="material-request__material-field">Material <span aria-hidden="true">*</span>
              <select value={row.materialId} onChange={(event) => updateRow(row.key, 'materialId', event.target.value)} aria-invalid={Boolean(rowErrors.materialId)} aria-describedby={rowErrors.materialId ? `${row.key}-material-error` : undefined}>
                <option value="">Seleccione un material</option>
                {materials.map((material) => <option key={material.id} value={material.id} disabled={selectedIds.has(String(material.id)) && row.materialId !== String(material.id)}>{material.nombre} · {material.unidadMedida}</option>)}
              </select>
              {rowErrors.materialId ? <small id={`${row.key}-material-error`} className="material-request__field-error">{rowErrors.materialId}</small> : null}
            </label>
            <label>Cantidad <span aria-hidden="true">*</span>
              <div className="material-request__quantity"><input type="number" min="1" step="1" inputMode="numeric" value={row.cantidad} onChange={(event) => updateRow(row.key, 'cantidad', event.target.value)} aria-invalid={Boolean(rowErrors.cantidad)} aria-describedby={rowErrors.cantidad ? `${row.key}-cantidad-error` : undefined} /><span>{selectedMaterial?.unidadMedida || 'unidad'}</span></div>
              {rowErrors.cantidad ? <small id={`${row.key}-cantidad-error`} className="material-request__field-error">{rowErrors.cantidad}</small> : null}
            </label>
            <label className="material-request__note-field">Nota del material <small>(opcional)</small>
              <input maxLength={255} value={row.observacion} onChange={(event) => updateRow(row.key, 'observacion', event.target.value)} placeholder="Ej. Para tubería principal" aria-invalid={Boolean(rowErrors.observacion)} />
              {rowErrors.observacion ? <small className="material-request__field-error">{rowErrors.observacion}</small> : null}
            </label>
            <button type="button" className="material-request__remove" onClick={() => removeRow(row.key)} aria-label={`Eliminar material ${index + 1}`} disabled={submitting} title="Eliminar material"><IconTrash size={19} aria-hidden="true" /><span>Eliminar</span></button>
          </fieldset>
        })}
      </div>

      {rows.length === 0 ? <button type="button" className="material-request__empty-add" onClick={() => setRows([createEmptyMaterialRow()])}><IconPlus size={19} aria-hidden="true" /> Agregar el primer material</button> : null}

      <label className="material-request__motive">Observación general <small>(opcional)</small>
        <textarea value={motivo} onChange={(event) => { setMotivo(event.target.value); setErrors((current) => ({ ...current, motivo: undefined })) }} maxLength={1000} placeholder="Describa para qué necesita estos materiales." aria-invalid={Boolean(errors.motivo)} />
        <span className="material-request__counter">{motivo.length}/1000</span>
        {errors.motivo ? <small className="material-request__field-error">{errors.motivo}</small> : null}
      </label>

      <footer className="material-request__actions">
        <p><strong>Importante:</strong> enviar esta solicitud no modifica el stock.</p>
        <button className="material-request__primary" type="submit" disabled={submitting || loading || Boolean(loadError) || materials.length === 0}>{submitting ? 'Enviando…' : 'Enviar solicitud'}</button>
      </footer>
    </form>
  </section>
}
