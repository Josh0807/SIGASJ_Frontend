import { useRef, useState, type FormEvent } from 'react'
import { IconArrowLeft, IconBuilding, IconBuildingStore, IconDeviceFloppy, IconId, IconMail, IconMapPin, IconPhone, IconUser } from '@tabler/icons-react'
import { Alert, Button, Card } from '../../../shared/ui'
import { InventoryFormField, InventoryFormHeading } from '../InventoryFormField'
import { PROVEEDORES_PATH } from '../inventarioPaths'
import { focusFirstInvalidInventoryField } from '../focusFirstInvalidInventoryField'
import { PROVEEDOR_IDENTIFICACION_MAX_LENGTH, PROVEEDOR_TELEFONO_MAX_LENGTH, toProveedorPayload, validateProveedor, type ProveedorFormErrors } from './proveedorUtils'
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
    if (Object.keys(nextErrors).length) { setSubmitError('Revise los campos señalados.'); focusFirstInvalidInventoryField(event.currentTarget); return }
    submitting.current = true; setSaving(true); setSubmitError(null)
    try { await onSubmit(toProveedorPayload(values)) } catch (caught) { setSubmitError(caught instanceof Error ? caught.message : 'No fue posible guardar el proveedor.') } finally { submitting.current = false; setSaving(false) }
  }
  return (
    <>
      {submitError ? (
        <Alert tone="danger" title="No se pudo guardar">
          {submitError}
        </Alert>
      ) : null}
      <Card as="section" padded className="!p-5 sm:!p-6 lg:!p-8">
        <form className="grid w-full gap-x-7 gap-y-6 lg:grid-cols-2" noValidate onSubmit={submit}>
          <InventoryFormHeading
            icon={<IconBuildingStore size={25} aria-hidden="true" />}
            title="Información del proveedor"
            description="Los campos marcados con * son obligatorios."
          />
          <InventoryFormField label="Nombre *" icon={<IconBuildingStore size={20} aria-hidden="true" />} error={errors.nombre}>
            <input autoFocus autoComplete="organization" value={values.nombre} maxLength={150} placeholder="Ej. Ferretería Central" aria-invalid={Boolean(errors.nombre)} onChange={(e) => update('nombre', e.target.value)} />
          </InventoryFormField>
          <InventoryFormField label="Razón social" icon={<IconBuilding size={20} aria-hidden="true" />} error={errors.razonSocial}>
            <input autoComplete="organization" value={values.razonSocial} maxLength={200} placeholder="Nombre legal de la empresa" aria-invalid={Boolean(errors.razonSocial)} onChange={(e) => update('razonSocial', e.target.value)} />
          </InventoryFormField>
          <InventoryFormField label="Identificación" icon={<IconId size={20} aria-hidden="true" />} error={errors.identificacion}>
            <input inputMode="numeric" value={values.identificacion} maxLength={PROVEEDOR_IDENTIFICACION_MAX_LENGTH} placeholder="Cédula física o jurídica" aria-invalid={Boolean(errors.identificacion)} onChange={(e) => update('identificacion', e.target.value)} />
          </InventoryFormField>
          <InventoryFormField label="Teléfono" icon={<IconPhone size={20} aria-hidden="true" />} error={errors.telefono}>
            <input type="tel" inputMode="tel" autoComplete="tel" value={values.telefono} maxLength={PROVEEDOR_TELEFONO_MAX_LENGTH} placeholder="Ej. 2222-2222" aria-invalid={Boolean(errors.telefono)} onChange={(e) => update('telefono', e.target.value)} />
          </InventoryFormField>
          <InventoryFormField label="Correo electrónico" icon={<IconMail size={20} aria-hidden="true" />} error={errors.correo}>
            <input type="email" autoComplete="email" value={values.correo} maxLength={150} placeholder="correo@empresa.com" aria-invalid={Boolean(errors.correo)} onChange={(e) => update('correo', e.target.value)} />
          </InventoryFormField>
          <InventoryFormField label="Persona de contacto" icon={<IconUser size={20} aria-hidden="true" />} error={errors.personaContacto}>
            <input autoComplete="name" value={values.personaContacto} maxLength={150} placeholder="Nombre del contacto principal" aria-invalid={Boolean(errors.personaContacto)} onChange={(e) => update('personaContacto', e.target.value)} />
          </InventoryFormField>
          <InventoryFormField label="Dirección" icon={<IconMapPin size={20} aria-hidden="true" />} error={errors.direccion} full multiline>
            <textarea autoComplete="street-address" value={values.direccion} maxLength={500} placeholder="Dirección física del proveedor" aria-invalid={Boolean(errors.direccion)} onChange={(e) => update('direccion', e.target.value)} />
          </InventoryFormField>
          <div className="col-span-full mt-1 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:gap-4 lg:pt-7">
            <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto" disabled={saving} loading={saving} leftIcon={<IconDeviceFloppy size={19} aria-hidden="true" />}>{saving ? 'Guardando…' : mode === 'create' ? 'Registrar proveedor' : 'Guardar cambios'}</Button>
            <Button to={PROVEEDORES_PATH} variant="secondary" size="lg" className="w-full sm:w-auto" leftIcon={<IconArrowLeft size={19} aria-hidden="true" />}>Cancelar</Button>
          </div>
        </form>
      </Card>
    </>
  )
}