import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MATERIALES_PATH } from './inventarioPaths'
import { validateMaterial, type MaterialFormErrors } from './materialFormUtils'
import type { MaterialFormValues } from './types'
import { useCategorias } from './categorias/useCategorias'
import { materialCategoryOptions } from './materialCategoryOptions'

type Props = {
  mode: 'create' | 'edit'
  initialValues?: MaterialFormValues
  stockActual?: number
  currentCategoria?: { id: number; nombre: string; activo: boolean } | null
  onSubmit: (values: MaterialFormValues) => Promise<void>
}

const EMPTY_VALUES: MaterialFormValues = { nombre: '', descripcion: '', unidadMedida: '', ubicacion: '', stockMinimo: '0', activo: true, categoriaId: '' }

export default function MaterialForm({ mode, initialValues = EMPTY_VALUES, stockActual, currentCategoria, onSubmit }: Props) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<MaterialFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const submitting = useRef(false)
  const { result: categorias, loading: loadingCategorias, error: categoriasError, refetch: refetchCategorias } = useCategorias({ activo: true, page: 1, limit: 100 })
  const categoryOptions = materialCategoryOptions(categorias.data, currentCategoria)
  const update = (field: keyof MaterialFormValues, value: string | boolean) => { setValues((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })); setSuccess(false) }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = validateMaterial(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) { setSubmitError('Revise los campos señalados.'); return }
    submitting.current = true; setSaving(true); setSubmitError(null); setSuccess(false)
    try { await onSubmit(values); setSuccess(true) }
    catch (error) { setSubmitError(error instanceof Error ? error.message : 'No fue posible guardar el material.') }
    finally { submitting.current = false; setSaving(false) }
  }

  const field = (name: keyof MaterialFormValues, label: string, input: ReactNode) => <label><span>{label}</span>{input}{errors[name] && <small className="materials-admin__field-error" role="alert">{errors[name]}</small>}</label>
  return <>
    {submitError && <div className="materials-admin__error" role="alert">{submitError}</div>}
    {success && <div className="materials-admin__success" role="status">{mode === 'create' ? 'Material registrado correctamente.' : 'Cambios guardados correctamente.'}</div>}
    <form className="materials-admin__form" noValidate onSubmit={handleSubmit}>
      {field('nombre', 'Nombre *', <input value={values.nombre} maxLength={150} aria-invalid={Boolean(errors.nombre)} onChange={(e) => update('nombre', e.target.value)} />)}
      {field('unidadMedida', 'Unidad de medida *', <input value={values.unidadMedida} maxLength={50} aria-invalid={Boolean(errors.unidadMedida)} onChange={(e) => update('unidadMedida', e.target.value)} />)}
      {field('descripcion', 'Descripción', <textarea value={values.descripcion} maxLength={1000} aria-invalid={Boolean(errors.descripcion)} onChange={(e) => update('descripcion', e.target.value)} />)}
      {field('ubicacion', 'Ubicación', <input value={values.ubicacion} maxLength={150} aria-invalid={Boolean(errors.ubicacion)} onChange={(e) => update('ubicacion', e.target.value)} />)}
      {field('stockMinimo', 'Stock mínimo *', <input value={values.stockMinimo} type="number" min="0" step="1" aria-invalid={Boolean(errors.stockMinimo)} onChange={(e) => update('stockMinimo', e.target.value)} />)}
      {field('categoriaId', 'Categoría', <select value={values.categoriaId} disabled={loadingCategorias} onChange={(e) => update('categoriaId', e.target.value)}><option value="">Sin categoría</option>{categoryOptions.map((item) => <option key={item.id} value={item.id}>{item.nombre}{item.activo ? '' : ' (inactiva · actual)'}</option>)}</select>)}
      {loadingCategorias && <p className="materials-admin__category-state" role="status">Cargando categorías disponibles…</p>}
      {categoriasError && <div className="materials-admin__category-error" role="alert">No fue posible cargar las categorías. <button type="button" onClick={refetchCategorias}>Reintentar</button></div>}
      {mode === 'edit' && field('activo', 'Estado', <select value={String(values.activo)} onChange={(e) => update('activo', e.target.value === 'true')}><option value="true">Activo</option><option value="false">Inactivo</option></select>)}
      {mode === 'edit' && <label><span>Existencia actual</span><input value={stockActual ?? 0} disabled readOnly /><small>Solo cambia mediante entradas y salidas de inventario.</small></label>}
      <div className="materials-admin__form-actions"><Link className="materials-admin__secondary" to={MATERIALES_PATH}>Volver al catálogo</Link><button type="submit" className="materials-admin__primary" disabled={saving}>{saving ? 'Guardando…' : mode === 'create' ? 'Registrar material' : 'Guardar cambios'}</button></div>
    </form>
  </>
}
