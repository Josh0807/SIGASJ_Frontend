import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { IconArrowLeft, IconBuilding, IconBuildingStore, IconDeviceFloppy, IconId, IconMail, IconMapPin, IconPhone, IconUser } from '@tabler/icons-react'
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
  const field = (name: keyof ProveedorFormValues, label: string, icon: ReactNode, input: ReactNode, full = false) => <label className={full ? 'materials-admin__form-full' : undefined}><span>{label}</span><span className="provider-admin__control">{icon}{input}</span>{errors[name] && <small className="materials-admin__field-error" role="alert">{errors[name]}</small>}</label>
  return <>{submitError && <div className="materials-admin__error" role="alert">{submitError}</div>}<form className="materials-admin__form provider-admin__form w-full max-w-3xl" noValidate onSubmit={submit}>
    <div className="provider-admin__form-heading"><span><IconBuildingStore size={25} aria-hidden="true" /></span><div><h2>Información del proveedor</h2><p>Los campos marcados con * son obligatorios.</p></div></div>
    {field('nombre', 'Nombre *', <IconBuildingStore size={20} aria-hidden="true" />, <input autoFocus autoComplete="organization" value={values.nombre} maxLength={150} placeholder="Ej. Ferretería Central" aria-invalid={Boolean(errors.nombre)} onChange={(e) => update('nombre', e.target.value)} />)}
    {field('razonSocial', 'Razón social', <IconBuilding size={20} aria-hidden="true" />, <input autoComplete="organization" value={values.razonSocial} maxLength={200} placeholder="Nombre legal de la empresa" onChange={(e) => update('razonSocial', e.target.value)} />)}
    {field('identificacion', 'Identificación', <IconId size={20} aria-hidden="true" />, <input value={values.identificacion} maxLength={50} placeholder="Cédula física o jurídica" aria-invalid={Boolean(errors.identificacion)} onChange={(e) => update('identificacion', e.target.value)} />)}
    {field('telefono', 'Teléfono', <IconPhone size={20} aria-hidden="true" />, <input type="tel" autoComplete="tel" value={values.telefono} maxLength={30} placeholder="Ej. 2222-2222" aria-invalid={Boolean(errors.telefono)} onChange={(e) => update('telefono', e.target.value)} />)}
    {field('correo', 'Correo electrónico', <IconMail size={20} aria-hidden="true" />, <input type="email" autoComplete="email" value={values.correo} maxLength={150} placeholder="correo@empresa.com" aria-invalid={Boolean(errors.correo)} onChange={(e) => update('correo', e.target.value)} />)}
    {field('personaContacto', 'Persona de contacto', <IconUser size={20} aria-hidden="true" />, <input autoComplete="name" value={values.personaContacto} maxLength={150} placeholder="Nombre del contacto principal" onChange={(e) => update('personaContacto', e.target.value)} />)}
    {field('direccion', 'Dirección', <IconMapPin size={20} aria-hidden="true" />, <textarea autoComplete="street-address" value={values.direccion} maxLength={500} placeholder="Dirección física del proveedor" onChange={(e) => update('direccion', e.target.value)} />, true)}
    <div className="materials-admin__form-actions"><button type="submit" className="materials-admin__primary" disabled={saving}><IconDeviceFloppy size={19} aria-hidden="true" />{saving ? 'Guardando…' : mode === 'create' ? 'Registrar proveedor' : 'Guardar cambios'}</button><Link className="materials-admin__secondary" to={PROVEEDORES_PATH}><IconArrowLeft size={19} aria-hidden="true" />Cancelar</Link></div>
  </form></>
}
