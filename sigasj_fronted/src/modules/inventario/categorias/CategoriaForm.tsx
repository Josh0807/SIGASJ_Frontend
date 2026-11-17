import { useRef, useState, type FormEvent } from 'react'
import {
  IconAlignLeft,
  IconArrowLeft,
  IconCalendarTime,
  IconCircleCheckFilled,
  IconDeviceFloppy,
  IconTag,
} from '@tabler/icons-react'
import { Alert, Button, Card } from '../../../shared/ui'
import FormSuccessResult from '../../../shared/components/FormSuccessResult'
import { CATEGORIAS_PATH } from '../inventarioPaths'
import { focusFirstInvalidInventoryField } from '../focusFirstInvalidInventoryField'
import { InventoryFormField, InventoryFormHeading } from '../InventoryFormField'
import { validateCategoria, type CategoriaErrors } from './categoriaUtils'
import type { CategoriaFormValues } from './types'

type Props = {
  mode: 'create' | 'edit'
  initialValues?: CategoriaFormValues
  onSubmit: (values: CategoriaFormValues) => Promise<void>
}

const EMPTY: CategoriaFormValues = {
  nombre: '',
  descripcion: '',
  requiereFechaVencimiento: false,
}

export default function CategoriaForm({
  mode,
  initialValues = EMPTY,
  onSubmit,
}: Props) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<CategoriaErrors>({})
  const [message, setMessage] = useState<{ error: boolean; text: string } | null>(
    null,
  )
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)
  const change = (field: keyof CategoriaFormValues, value: string | boolean) => {
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
      setMessage({
        error: false,
        text:
          mode === 'create'
            ? 'Categoría registrada correctamente.'
            : 'Cambios guardados correctamente.',
      })
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
      {message?.error ? (
        <Alert tone="danger" title="No se pudo guardar">
          {message.text}
        </Alert>
      ) : null}
      {message && !message.error ? (
        <Card as="section" padded className="!p-5 sm:!p-6">
          <FormSuccessResult
            className="!gap-3 !border-0 !bg-transparent !p-0 !shadow-none"
            icon={<IconCircleCheckFilled size={30} />}
            title={message.text}
            description="La categoría ya está disponible para clasificar los materiales del inventario."
            actions={
              <Button
                to={CATEGORIAS_PATH}
                variant="secondary"
                leftIcon={<IconArrowLeft size={19} aria-hidden="true" />}
              >
                Volver al listado
              </Button>
            }
          />
        </Card>
      ) : null}
      <Card as="section" padded className="!p-5 sm:!p-6 lg:!p-8">
        <form
          className="grid w-full gap-x-7 gap-y-6 lg:grid-cols-2"
          noValidate
          onSubmit={submit}
        >
        <InventoryFormHeading
          icon={<IconTag size={25} aria-hidden="true" />}
          title={
            mode === 'create'
              ? 'Información de la categoría'
              : 'Ficha de la categoría'
          }
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
          multiline
          hint={<small className="text-sm text-slate-500">{values.descripcion.length}/500 caracteres</small>}
        >
          <textarea
            value={values.descripcion}
            maxLength={500}
            placeholder="Uso de esta clasificación en bodega"
            aria-invalid={Boolean(errors.descripcion)}
            onChange={(event) => change('descripcion', event.target.value)}
          />
        </InventoryFormField>

        <label className="col-span-full flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-blue-600"
            checked={values.requiereFechaVencimiento}
            onChange={(event) =>
              change('requiereFechaVencimiento', event.target.checked)
            }
          />
          <span className="grid gap-1">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-[#163f6b]">
              <IconCalendarTime size={18} aria-hidden="true" />
              Requiere fecha de vencimiento
            </span>
            <small className="leading-relaxed text-slate-600">
              <strong className="font-semibold text-[#163f6b]">Sí (se vencen):</strong>{' '}
              hipoclorito de sodio/calcio, cloro, desinfectantes, reactivos de
              laboratorio y pegamentos o solventes PVC.
              <br />
              <strong className="font-semibold text-[#163f6b]">No:</strong> tubería
              y accesorios PVC, válvulas, medidores, uniones, codos y
              herramientas. En ASADA el hipoclorito es inestable y debe
              controlarse por fecha del fabricante.
            </small>
          </span>
        </label>

        <div className="col-span-full mt-1 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:gap-4 lg:pt-7">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            disabled={saving}
            loading={saving}
            leftIcon={<IconDeviceFloppy size={19} aria-hidden="true" />}
          >
            {saving
              ? 'Guardando…'
              : mode === 'create'
                ? 'Registrar categoría'
                : 'Guardar cambios'}
          </Button>
          <Button
            to={CATEGORIAS_PATH}
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
            leftIcon={<IconArrowLeft size={19} aria-hidden="true" />}
          >
            Volver al listado
          </Button>
        </div>
        </form>
      </Card>
    </>
  )
}
