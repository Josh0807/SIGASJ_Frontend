import { useRef, useState, type FormEvent } from 'react'
import { IconAlignLeft, IconArrowLeft, IconDeviceFloppy, IconTag } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import FormSuccessResult from '../../../shared/components/FormSuccessResult'
import { CATEGORIAS_PATH } from '../inventarioPaths'
import { focusFirstInvalidInventoryField } from '../focusFirstInvalidInventoryField'
import { InventoryFormField, InventoryFormHeading } from '../InventoryFormField'
import { validateCategoria, type CategoriaErrors } from './categoriaUtils'
import type { CategoriaFormValues } from './types'

type Props = { mode: 'create' | 'edit'; initialValues?: CategoriaFormValues; onSubmit: (values: CategoriaFormValues) => Promise<void> }

export default function CategoriaForm({ mode, initialValues = { nombre: '', descripcion: '' }, onSubmit }: Props) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<CategoriaErrors>({})
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)
  const change = (field: keyof CategoriaFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setMessage(null)
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting.current) return
    const validation = validateCategoria(values)
    setErrors(validation)
    if (Object.keys(validation).length) {
      setMessage({ error: true, text: 'Revise los campos señalados.' })
      focusFirstInvalidInventoryField(event.currentTarget)
      return
    }
    submitting.current = true
    setSaving(true)
    setMessage(null)
    try {
      await onSubmit(values)
      setMessage({ error: false, text: mode === 'create' ? 'Categoría registrada correctamente.' : 'Cambios guardados correctamente.' })
    } catch (caught) {
      const parsed = caught as Error & { fieldError?: string }
      setMessage({ error: true, text: parsed.message })
      if (parsed.fieldError) setErrors({ nombre: parsed.fieldError })
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <>
      {message ? (
        message.error ? (
          <div className="materials-admin__error" role="alert">{message.text}</div>
        ) : (
          <FormSuccessResult
            className="materials-admin__success"
            title={message.text}
            description="Puede volver al listado o seguir editando esta ficha."
            actions={
              <Link className="materials-admin__secondary" to={CATEGORIAS_PATH}>
                <IconArrowLeft size={19} aria-hidden="true" />
                Volver al listado
              </Link>
            }
          />
        )
      ) : null}
      <form className="materials-admin__form provider-admin__form category-admin__form w-full max-w-3xl" noValidate onSubmit={submit}>
        <InventoryFormHeading
          icon={<IconTag size={25} aria-hidden="true" />}
          title={mode === 'create' ? 'Información de la categoría' : 'Ficha de la categoría'}
          description="Los campos marcados con * son obligatorios."
        />
        <InventoryFormField
          label="Nombre *"
          icon={<IconTag size={20} aria-hidden="true" />}
          error={errors.nombre}
          full
        >
          <input
            value={values.nombre}
            maxLength={100}
            placeholder="Ej. Tubería y accesorios"
            aria-invalid={Boolean(errors.nombre)}
            onChange={(event) => change('nombre', event.target.value)}
          />
        </InventoryFormField>
        <InventoryFormField
          label="Descripción"
          icon={<IconAlignLeft size={20} aria-hidden="true" />}
          error={errors.descripcion}
          full
          hint={<small>{values.descripcion.length}/500 caracteres</small>}
        >
          <textarea
            value={values.descripcion}
            maxLength={500}
            placeholder="Uso de esta clasificación en bodega"
            aria-invalid={Boolean(errors.descripcion)}
            onChange={(event) => change('descripcion', event.target.value)}
          />
        </InventoryFormField>
        <div className="materials-admin__form-actions">
          <button type="submit" className="materials-admin__primary" disabled={saving}>
            <IconDeviceFloppy size={19} aria-hidden="true" />
            {saving ? 'Guardando…' : mode === 'create' ? 'Registrar categoría' : 'Guardar cambios'}
          </button>
          <Link className="materials-admin__secondary" to={CATEGORIAS_PATH}>
            <IconArrowLeft size={19} aria-hidden="true" />
            Volver al listado
          </Link>
        </div>
      </form>
    </>
  )
}
