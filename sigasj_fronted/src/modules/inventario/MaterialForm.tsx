import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  IconAlertTriangle,
  IconAlignLeft,
  IconArrowLeft,
  IconBuildingStore,
  IconCalendarTime,
  IconCurrencyDollar,
  IconDeviceFloppy,
  IconMapPin,
  IconPackage,
  IconRulerMeasure,
  IconStack2,
  IconTag,
  IconToggleRight,
  IconTruckDelivery,
} from '@tabler/icons-react'
import { Link } from 'react-router-dom'
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
  currentCategoria?: {
    id: number
    nombre: string
    activo: boolean
    requiereFechaVencimiento?: boolean
  } | null
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
  precioUnitario: '',
  fechaVencimiento: '',
  cantidadInicial: '',
  requiereFechaVencimiento: false,
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

  const categoriaSeleccionada = categoryOptions.find(
    (item) => String(item.id) === values.categoriaId,
  )
  const requiereVencimientoPorCategoria = Boolean(
    categoriaSeleccionada?.requiereFechaVencimiento,
  )

  const update = (field: keyof MaterialFormValues, value: string | boolean) => {
    setValues((current) => {
      const next = { ...current, [field]: value }
      if (field === 'categoriaId') {
        const cat = categoryOptions.find((item) => String(item.id) === value)
        const requiere = Boolean(cat?.requiereFechaVencimiento)
        next.requiereFechaVencimiento = requiere
        if (!requiere) next.fechaVencimiento = ''
      }
      return next
    })
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === 'categoriaId'
        ? { fechaVencimiento: undefined, requiereFechaVencimiento: undefined }
        : {}),
    }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    const payload: MaterialFormValues = {
      ...values,
      requiereFechaVencimiento: requiereVencimientoPorCategoria,
      fechaVencimiento: requiereVencimientoPorCategoria
        ? values.fechaVencimiento
        : '',
    }
    const nextErrors = validateMaterial(payload)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setSubmitError('Revise los campos señalados.')
      focusFirstInvalidInventoryField(event.currentTarget)
      return
    }
    submitting.current = true
    setSaving(true)
    setSubmitError(null)
    try {
      await onSubmit(payload)
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
      <form className="materials-admin__form provider-admin__form w-full max-w-3xl" noValidate onSubmit={handleSubmit}>
        <div className="provider-admin__form-heading">
          <span>
            <IconPackage size={25} aria-hidden="true" />
          </span>
          <div>
            <h2>{mode === 'create' ? 'Información del material' : 'Ficha del material'}</h2>
            <p>Los campos marcados con * son obligatorios. Categoría y proveedor son requeridos.</p>
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
          'Stock mínimo de alerta *',
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
          'precioUnitario',
          'Precio unitario',
          <IconCurrencyDollar size={20} aria-hidden="true" />,
          <input
            value={values.precioUnitario}
            type="number"
            min="0"
            step="0.01"
            placeholder="Ej. 1250.00"
            aria-invalid={Boolean(errors.precioUnitario)}
            onChange={(e) => update('precioUnitario', e.target.value)}
          />,
        )}
        {field(
          'categoriaId',
          'Categoría *',
          <IconTag size={20} aria-hidden="true" />,
          <select
            value={values.categoriaId}
            disabled={loadingCategorias}
            aria-invalid={Boolean(errors.categoriaId)}
            onChange={(e) => update('categoriaId', e.target.value)}
          >
            <option value="">Seleccione una categoría</option>
            {categoryOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
                {item.activo ? '' : ' (inactiva · actual)'}
                {item.requiereFechaVencimiento ? ' · con vencimiento' : ''}
              </option>
            ))}
          </select>,
        )}
        {values.categoriaId ? (
          <div
            className={`materials-admin__form-full rounded-xl border px-4 py-3.5 ${
              requiereVencimientoPorCategoria
                ? 'border-amber-200 bg-amber-50'
                : 'border-slate-200 bg-[#f4f8fc]'
            }`}
            role="status"
          >
            <p
              className={`m-0 flex items-start gap-2 text-sm font-bold leading-snug ${
                requiereVencimientoPorCategoria
                  ? 'text-amber-950'
                  : 'text-[#163f6b]'
              }`}
            >
              <IconCalendarTime size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
              {requiereVencimientoPorCategoria
                ? 'Esta categoría exige fecha de vencimiento'
                : 'Esta categoría no usa fecha de vencimiento'}
            </p>
            <p
              className={`mb-0 mt-1.5 text-sm leading-6 ${
                requiereVencimientoPorCategoria
                  ? 'text-amber-900/85'
                  : 'text-[#526d8c]'
              }`}
            >
              {requiereVencimientoPorCategoria
                ? 'En ASADA caducan o pierden potencia: hipoclorito, cloro, desinfectantes, reactivos de laboratorio y pegamentos/solventes. Indique la fecha del envase.'
                : 'Tubería PVC, codos, uniones, válvulas, medidores, herramientas y accesorios metálicos no caducan; no se solicita fecha.'}
            </p>
          </div>
        ) : null}
        {requiereVencimientoPorCategoria
          ? field(
              'fechaVencimiento',
              'Fecha de vencimiento *',
              <IconCalendarTime size={20} aria-hidden="true" />,
              <input
                value={values.fechaVencimiento}
                type="date"
                aria-invalid={Boolean(errors.fechaVencimiento)}
                onChange={(e) => update('fechaVencimiento', e.target.value)}
              />,
            )
          : null}
        <p className="provider-admin__form-note materials-admin__form-full">
          {mode === 'create'
            ? 'El stock mínimo es el umbral de alerta. La existencia física inicia en 0 y solo cambia con entradas o salidas de bodega. El vencimiento lo define la categoría del material.'
            : 'El stock mínimo es el umbral de alerta. La existencia física no se edita aquí. El vencimiento lo define la categoría.'}
        </p>
        {field(
          'proveedorId',
          'Proveedor principal *',
          <IconBuildingStore size={20} aria-hidden="true" />,
          <select
            value={values.proveedorId}
            disabled={loadingProveedores}
            aria-invalid={Boolean(errors.proveedorId)}
            onChange={(e) => update('proveedorId', e.target.value)}
          >
            <option value="">Seleccione un proveedor</option>
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
        {mode === 'create' && (
          <div className="materials-admin__form-full" style={{ borderTop: '1px solid var(--color-border, #e2e8f0)', paddingTop: '1.25rem', display: 'grid', gap: '0.5rem' }}>
            <div className="provider-admin__form-heading" style={{ marginBottom: 0 }}>
              <span><IconTruckDelivery size={25} aria-hidden="true" /></span>
              <div>
                <h2 style={{ margin: 0 }}>Existencia inicial <span style={{ fontWeight: 400, fontSize: '0.85em', opacity: 0.65 }}>(opcional)</span></h2>
                <p style={{ margin: 0 }}>Si ya tiene unidades en bodega, ingréselas aquí para no tener que ir a "Registrar entrada" por separado.</p>
              </div>
            </div>
            {field(
              'cantidadInicial',
              'Cantidad inicial en bodega',
              <IconStack2 size={20} aria-hidden="true" />,
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={values.cantidadInicial}
                placeholder="Ej. 10 — déjelo vacío si es 0"
                aria-invalid={Boolean(errors.cantidadInicial)}
                onChange={(e) => update('cantidadInicial', e.target.value)}
              />,
            )}
          </div>
        )}
        <div className="materials-admin__form-actions">
          <button type="submit" className="materials-admin__primary group !rounded-2xl !border-0 !bg-linear-to-r !from-blue-700 !via-blue-600 !to-sky-500 !px-6 !py-3.5 !font-extrabold !text-white !shadow-[0_11px_26px_rgba(37,99,235,0.3)] !transition-all !duration-300 !ease-out hover:!-translate-y-1 hover:!scale-[1.02] hover:!from-blue-800 hover:!to-cyan-500 hover:!shadow-[0_17px_34px_rgba(37,99,235,0.4)] active:!translate-y-0 active:!scale-[0.97] disabled:!transform-none disabled:!opacity-60 motion-reduce:!transform-none motion-reduce:!transition-none" disabled={saving}>
            <IconDeviceFloppy className="!transition-transform !duration-300 group-hover:!scale-110 group-hover:!-rotate-6 motion-reduce:!transform-none" size={19} aria-hidden="true" />
            {saving ? 'Guardando…' : mode === 'create' ? 'Registrar material' : 'Guardar cambios'}
          </button>
          <Link className="materials-admin__secondary group !rounded-2xl !border !border-blue-200 !bg-white !px-6 !py-3.5 !font-extrabold !text-blue-900 !shadow-[0_8px_20px_rgba(37,99,235,0.12)] !transition-all !duration-300 !ease-out hover:!-translate-y-1 hover:!scale-[1.02] hover:!border-blue-400 hover:!bg-blue-50 hover:!text-blue-700 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.2)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" to={MATERIALES_PATH}>
            <IconArrowLeft className="!transition-transform !duration-300 group-hover:!-translate-x-1.5 motion-reduce:!transform-none" size={19} aria-hidden="true" />
            Volver al catálogo
          </Link>
        </div>
      </form>
    </>
  )
}
