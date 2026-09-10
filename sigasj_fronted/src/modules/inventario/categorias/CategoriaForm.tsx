import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIAS_PATH } from '../inventarioPaths'
import { validateCategoria, type CategoriaErrors } from './categoriaUtils'
import type { CategoriaFormValues } from './types'

type Props = { mode: 'create' | 'edit'; initialValues?: CategoriaFormValues; onSubmit: (values: CategoriaFormValues) => Promise<void> }
export default function CategoriaForm({ mode, initialValues = { nombre: '', descripcion: '' }, onSubmit }: Props) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<CategoriaErrors>({})
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)
  const change = (field: keyof CategoriaFormValues, value: string) => { setValues((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })); setMessage(null) }
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (submitting.current) return
    const validation = validateCategoria(values); setErrors(validation)
    if (Object.keys(validation).length) { setMessage({ error: true, text: 'Revise los campos señalados.' }); return }
    submitting.current = true; setSaving(true); setMessage(null)
    try { await onSubmit(values); setMessage({ error: false, text: mode === 'create' ? 'Categoría registrada correctamente.' : 'Cambios guardados correctamente.' }) }
    catch (caught) { const parsed = caught as Error & { fieldError?: string }; setMessage({ error: true, text: parsed.message }); if (parsed.fieldError) setErrors({ nombre: parsed.fieldError }) }
    finally { submitting.current = false; setSaving(false) }
  }
  return <>{message && <div className={message.error ? 'materials-admin__error' : 'materials-admin__success'} role={message.error ? 'alert' : 'status'}>{message.text}</div>}<form className="materials-admin__form category-admin__form" noValidate onSubmit={submit}><label><span>Nombre *</span><input value={values.nombre} maxLength={100} aria-invalid={Boolean(errors.nombre)} onChange={(event) => change('nombre', event.target.value)} />{errors.nombre && <small className="materials-admin__field-error">{errors.nombre}</small>}</label><label><span>Descripción</span><textarea value={values.descripcion} maxLength={500} aria-invalid={Boolean(errors.descripcion)} onChange={(event) => change('descripcion', event.target.value)} />{errors.descripcion && <small className="materials-admin__field-error">{errors.descripcion}</small>}</label><div className="materials-admin__form-actions"><Link className="materials-admin__secondary" to={CATEGORIAS_PATH}>Volver al listado</Link><button type="submit" className="materials-admin__primary" disabled={saving}>{saving ? 'Guardando…' : mode === 'create' ? 'Registrar categoría' : 'Guardar cambios'}</button></div></form></>
}
