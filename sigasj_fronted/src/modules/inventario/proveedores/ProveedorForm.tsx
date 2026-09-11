import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PROVEEDORES_PATH } from '../inventarioPaths'
import { toProveedorPayload, validateProveedor, type ProveedorFormErrors } from './proveedorUtils'
import type { ProveedorFormValues, ProveedorPayload } from './types'

const EMPTY_PROVEEDOR_VALUES: ProveedorFormValues = { nombre: '', razonSocial: '', identificacion: '', telefono: '', correo: '', direccion: '', personaContacto: '' }

export default function ProveedorForm({ mode, initialValues = EMPTY_PROVEEDOR_VALUES, onSubmit }: { mode: 'create' | 'edit'; initialValues?: ProveedorFormValues; onSubmit: (payload: ProveedorPayload) => Promise<void> }) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<ProveedorFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)
  const update = (name: keyof ProveedorFormValues, value: string) => { setValues((current) => ({ ...current, [name]: value })); setErrors((current) => ({ ...current, [name]: undefined })); setSubmitError(null) }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (submitting.current) return
    const nextErrors = validateProveedor(values); setErrors(nextErrors)
    if (Object.keys(nextErrors).length) { setSubmitError('Revise los campos señalados.'); return }
    submitting.current = true; setSaving(true); setSubmitError(null)
    try { await onSubmit(toProveedorPayload(values)) } catch (caught) { setSubmitError(caught instanceof Error ? caught.message : 'No fue posible guardar el proveedor.') } finally { submitting.current = false; setSaving(false) }
  }
  const field = (name: keyof ProveedorFormValues, label: string, input: ReactNode, full = false) => <label className={full ? 'materials-admin__form-full' : undefined}><span>{label}</span>{input}{errors[name] && <small className="materials-admin__field-error" role="alert">{errors[name]}</small>}</label>
  return <>{submitError && <div className="materials-admin__error" role="alert">{submitError}</div>}<form className="materials-admin__form provider-admin__form" noValidate onSubmit={submit}>
    {field('nombre', 'Nombre *', <input autoFocus value={values.nombre} maxLength={150} aria-invalid={Boolean(errors.nombre)} onChange={(e) => update('nombre', e.target.value)} />)}
    {field('razonSocial', 'Razón social', <input value={values.razonSocial} maxLength={200} onChange={(e) => update('razonSocial', e.target.value)} />)}
    {field('identificacion', 'Identificación', <input value={values.identificacion} maxLength={50} aria-invalid={Boolean(errors.identificacion)} onChange={(e) => update('identificacion', e.target.value)} />)}
    {field('telefono', 'Teléfono', <input type="tel" value={values.telefono} maxLength={30} aria-invalid={Boolean(errors.telefono)} onChange={(e) => update('telefono', e.target.value)} />)}
    {field('correo', 'Correo electrónico', <input type="email" value={values.correo} maxLength={150} aria-invalid={Boolean(errors.correo)} onChange={(e) => update('correo', e.target.value)} />)}
    {field('personaContacto', 'Persona de contacto', <input value={values.personaContacto} maxLength={150} onChange={(e) => update('personaContacto', e.target.value)} />)}
    {field('direccion', 'Dirección', <textarea value={values.direccion} maxLength={500} onChange={(e) => update('direccion', e.target.value)} />, true)}
    <div className="materials-admin__form-actions"><Link className="materials-admin__secondary" to={PROVEEDORES_PATH}>Cancelar</Link><button type="submit" className="materials-admin__primary" disabled={saving}>{saving ? 'Guardando…' : mode === 'create' ? 'Registrar proveedor' : 'Guardar cambios'}</button></div>
  </form></>
}
