import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  IconAlertTriangle,
  IconAlignLeft,
  IconArrowLeft,
  IconBuildingStore,
  IconDeviceFloppy,
  IconMapPin,
  IconPackage,
  IconRulerMeasure,
  IconStack2,
  IconTag,
  IconToggleRight,
} from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import FormSuccessResult from '../../shared/components/FormSuccessResult'
import { MATERIALES_PATH } from './inventarioPaths'
import { focusFirstInvalidInventoryField } from './focusFirstInvalidInventoryField'
import { validateMaterial, type MaterialFormErrors } from './materialFormUtils'
import type { MaterialFormValues } from './types'
import { useCategorias } from './categorias/useCategorias'
import { materialCategoryOptions } from './materialCategoryOptions'
import { useProveedores } from './proveedores/useProveedores'

type Props = {
  mode: 'create' | 'edit'
  initialValues?: MaterialFormValues
  stockActual?: number
  currentCategoria?: { id: number; nombre: string; activo: boolean } | null
  currentProveedor?: { id: number; nombre: string; activo: boolean } | null
  onSubmit: (values: MaterialFormValues) => Promise<void>
}

const EMPTY_VALUES: MaterialFormValues = {
  nombre: '',
  descripcion: '',
  unidadMedida: '',
  ubicacion: '',
  stockMinimo: '0',
  activo: true,
  categoriaId: '',
  proveedorId: '',
}

export default function MaterialForm({
  mode,
  initialValues = EMPTY_VALUES,
  stockActual,
  currentCategoria,
  currentProveedor,
  onSubmit,
}: Props) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<MaterialFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const submitting = useRef(false)
  const { result: categorias, loading: loadingCategorias, error: categoriasError, refetch: refetchCategorias } =
    useCategorias({ activo: true, page: 1, limit: 100 })
  const categoryOptions = materialCategoryOptions(categorias.data, currentCategoria)
  const { result: proveedores, loading: loadingProveedores, error: proveedoresError, refetch: refetchProveedores } =
    useProveedores({ activo: true, page: 1, limit: 100 })
  const providerOptions =
    currentProveedor && !proveedores.data.some((item) => item.id === currentProveedor.id)
      ? [currentProveedor, ...proveedores.data]
      : proveedores.data

  const update = (field: keyof MaterialFormValues, value: string | boolean) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSuccess(false)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = validateMaterial(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setSubmitError('Revise los campos señalados.')
      focusFirstInvalidInventoryField(event.currentTarget)
      return
    }
    submitting.current = true
    setSaving(true)
    setSubmitError(null)
    setSuccess(false)
    try {
      await onSubmit(values)
      setSuccess(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No fue posible guardar el material.')
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  const field = (
    name: keyof MaterialFormValues,
    label: string,
    icon: ReactNode,
    input: ReactNode,
    full = false,
  ) => (
    <label className={full ? 'materials-admin__form-full' : undefined}>
      <span>{label}</span>
      <span className="provider-admin__control">
        {icon}
        {input}
      </span>
      {errors[name] && (
        <small className="materials-admin__field-error" role="alert">
          {errors[name]}
        </small>
      )}
    </label>
  )

  return (
    <>
      {submitError && (
        <div className="materials-admin__error" role="alert">
          {submitError}
        </div>
      )}
      {success && (
        <FormSuccessResult
          className="materials-admin__success"
          title={mode === 'create' ? 'Material registrado correctamente.' : 'Cambios guardados correctamente.'}
          description={
            mode === 'create'
              ? 'El material ya está disponible en el catálogo de bodega.'
              : 'La ficha del material se actualizó con la información enviada.'
          }
          actions={
            <Link className="materials-admin__secondary" to={MATERIALES_PATH}>
              <IconArrowLeft size={19} aria-hidden="true" />
              Volver al catálogo
            </Link>
          }
        />
      )}
      <form className="materials-admin__form provider-admin__form w-full max-w-3xl" noValidate onSubmit={handleSubmit}>
        <div className="provider-admin__form-heading">
          <span>
            <IconPackage size={25} aria-hidden="true" />
          </span>
          <div>
            <h2>{mode === 'create' ? 'Información del material' : 'Ficha del material'}</h2>
            <p>Los campos marcados con * son obligatorios.</p>
          </div>
        </div>
        {field(
          'nombre',
          'Nombre *',
          <IconPackage size={20} aria-hidden="true" />,
          <input
            autoFocus={mode === 'create'}
            value={values.nombre}
            maxLength={150}
            placeholder="Ej. Válvula de 1/2 pulgada"
            aria-invalid={Boolean(errors.nombre)}
            onChange={(e) => update('nombre', e.target.value)}
          />,
        )}
        {field(
          'unidadMedida',
          'Unidad de medida *',
          <IconRulerMeasure size={20} aria-hidden="true" />,
          <input
            value={values.unidadMedida}
            maxLength={50}
            placeholder="Ej. unidad, metro, litro"
            aria-invalid={Boolean(errors.unidadMedida)}
            onChange={(e) => update('unidadMedida', e.target.value)}
          />,
        )}
        {field(
          'descripcion',
          'Descripción',
          <IconAlignLeft size={20} aria-hidden="true" />,
          <textarea
            value={values.descripcion}
            maxLength={1000}
            placeholder="Detalle opcional del material y su uso en bodega"
            aria-invalid={Boolean(errors.descripcion)}
            onChange={(e) => update('descripcion', e.target.value)}
          />,
          true,
        )}
        {field(
          'ubicacion',
          'Ubicación',
          <IconMapPin size={20} aria-hidden="true" />,
          <input
            value={values.ubicacion}
            maxLength={150}
            placeholder="Ej. Estante A-3"
            aria-invalid={Boolean(errors.ubicacion)}
            onChange={(e) => update('ubicacion', e.target.value)}
          />,
        )}
        {field(
          'stockMinimo',
          'Stock mínimo *',
          <IconAlertTriangle size={20} aria-hidden="true" />,
          <input
            value={values.stockMinimo}
            type="number"
            min="0"
            step="1"
            placeholder="0"
            aria-invalid={Boolean(errors.stockMinimo)}
            onChange={(e) => update('stockMinimo', e.target.value)}
          />,
        )}
        {field(
          'categoriaId',
          'Categoría',
          <IconTag size={20} aria-hidden="true" />,
          <select
            value={values.categoriaId}
            disabled={loadingCategorias}
            onChange={(e) => update('categoriaId', e.target.value)}
          >
            <option value="">Sin categoría</option>
            {categoryOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
                {item.activo ? '' : ' (inactiva · actual)'}
              </option>
            ))}
          </select>,
        )}
        {field(
          'proveedorId',
          'Proveedor principal',
          <IconBuildingStore size={20} aria-hidden="true" />,
          <select
            value={values.proveedorId}
            disabled={loadingProveedores}
            aria-invalid={Boolean(errors.proveedorId)}
            onChange={(e) => update('proveedorId', e.target.value)}
          >
            <option value="">Sin proveedor</option>
            {providerOptions.map((item) => (
              <option
                key={item.id}
                value={item.id}
                disabled={!item.activo && item.id !== currentProveedor?.id}
              >
                {item.nombre}
                {item.activo ? '' : ' (inactivo · actual)'}
              </option>
            ))}
          </select>,
        )}
        {loadingCategorias && (
          <p className="provider-admin__form-note" role="status">
            Cargando categorías disponibles…
          </p>
        )}
        {categoriasError && (
          <div className="materials-admin__category-error materials-admin__form-full" role="alert">
            No fue posible cargar las categorías.{' '}
            <button type="button" onClick={refetchCategorias}>
              Reintentar
            </button>
          </div>
        )}
        {loadingProveedores && (
          <p className="provider-admin__form-note" role="status">
            Cargando proveedores disponibles…
          </p>
        )}
        {proveedoresError && (
          <div className="materials-admin__category-error materials-admin__form-full" role="alert">
            No fue posible cargar los proveedores.{' '}
            <button type="button" onClick={refetchProveedores}>
              Reintentar
            </button>
          </div>
        )}
        {mode === 'edit' &&
          field(
            'activo',
            'Estado',
            <IconToggleRight size={20} aria-hidden="true" />,
            <select
              value={String(values.activo)}
              onChange={(e) => update('activo', e.target.value === 'true')}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>,
          )}
        {mode === 'edit' && (
          <label className="materials-admin__form-full">
            <span>Existencia actual</span>
            <span className="provider-admin__control">
              <IconStack2 size={20} aria-hidden="true" />
              <input value={stockActual ?? 0} disabled readOnly />
            </span>
            <small>Solo cambia mediante entradas y salidas de inventario.</small>
          </label>
        )}
        <div className="materials-admin__form-actions">
          <button type="submit" className="materials-admin__primary" disabled={saving}>
            <IconDeviceFloppy size={19} aria-hidden="true" />
            {saving ? 'Guardando…' : mode === 'create' ? 'Registrar material' : 'Guardar cambios'}
          </button>
          <Link className="materials-admin__secondary" to={MATERIALES_PATH}>
            <IconArrowLeft size={19} aria-hidden="true" />
            Volver al catálogo
          </Link>
        </div>
      </form>
    </>
  )
}
