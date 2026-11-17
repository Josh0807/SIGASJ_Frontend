import { useRef, useState, type FormEvent } from 'react'
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
import { Alert, Button, Card } from '../../shared/ui'
import { InventoryFormField, InventoryFormHeading } from './InventoryFormField'
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

  return (
    <>
      {submitError ? (
        <Alert tone="danger" title="No se pudo guardar">
          {submitError}
        </Alert>
      ) : null}
      <Card as="section" padded className="!p-5 sm:!p-6 lg:!p-8">
        <form
          className="grid w-full gap-x-7 gap-y-6 lg:grid-cols-2"
          noValidate
          onSubmit={handleSubmit}
        >
          <InventoryFormHeading
            icon={<IconPackage size={25} aria-hidden="true" />}
            title={mode === 'create' ? 'Información del material' : 'Ficha del material'}
            description="Los campos marcados con * son obligatorios. Categoría y proveedor son requeridos."
          />
          <InventoryFormField
            label="Nombre *"
            icon={<IconPackage size={20} aria-hidden="true" />}
            error={errors.nombre}
          >
            <input
              autoFocus={mode === 'create'}
              value={values.nombre}
              maxLength={150}
              placeholder="Ej. Válvula de 1/2 pulgada"
              aria-invalid={Boolean(errors.nombre)}
              onChange={(e) => update('nombre', e.target.value)}
            />
          </InventoryFormField>
          <InventoryFormField
            label="Unidad de medida *"
            icon={<IconRulerMeasure size={20} aria-hidden="true" />}
            error={errors.unidadMedida}
          >
            <input
              value={values.unidadMedida}
              maxLength={50}
              placeholder="Ej. unidad, metro, litro"
              aria-invalid={Boolean(errors.unidadMedida)}
              onChange={(e) => update('unidadMedida', e.target.value)}
            />
          </InventoryFormField>
          <InventoryFormField
            label="Descripción"
            icon={<IconAlignLeft size={20} aria-hidden="true" />}
            error={errors.descripcion}
            full
            multiline
          >
            <textarea
              value={values.descripcion}
              maxLength={1000}
              placeholder="Detalle opcional del material y su uso en bodega"
              aria-invalid={Boolean(errors.descripcion)}
              onChange={(e) => update('descripcion', e.target.value)}
            />
          </InventoryFormField>
          <InventoryFormField
            label="Ubicación"
            icon={<IconMapPin size={20} aria-hidden="true" />}
            error={errors.ubicacion}
          >
            <input
              value={values.ubicacion}
              maxLength={150}
              placeholder="Ej. Estante A-3"
              aria-invalid={Boolean(errors.ubicacion)}
              onChange={(e) => update('ubicacion', e.target.value)}
            />
          </InventoryFormField>
          <InventoryFormField
            label="Stock mínimo de alerta *"
            icon={<IconAlertTriangle size={20} aria-hidden="true" />}
            error={errors.stockMinimo}
          >
            <input
              value={values.stockMinimo}
              type="number"
              min="0"
              step="1"
              placeholder="0"
              aria-invalid={Boolean(errors.stockMinimo)}
              onChange={(e) => update('stockMinimo', e.target.value)}
            />
          </InventoryFormField>
          <InventoryFormField
            label="Precio unitario"
            icon={<IconCurrencyDollar size={20} aria-hidden="true" />}
            error={errors.precioUnitario}
          >
            <input
              value={values.precioUnitario}
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej. 1250.00"
              aria-invalid={Boolean(errors.precioUnitario)}
              onChange={(e) => update('precioUnitario', e.target.value)}
            />
          </InventoryFormField>
          <InventoryFormField
            label="Categoría *"
            icon={<IconTag size={20} aria-hidden="true" />}
            error={errors.categoriaId}
          >
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
            </select>
          </InventoryFormField>
          {values.categoriaId ? (
            <div
              className={`col-span-full rounded-xl border px-4 py-3.5 ${
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
        {requiereVencimientoPorCategoria ? (
          <InventoryFormField
            label="Fecha de vencimiento *"
            icon={<IconCalendarTime size={20} aria-hidden="true" />}
            error={errors.fechaVencimiento}
          >
            <input
              value={values.fechaVencimiento}
              type="date"
              aria-invalid={Boolean(errors.fechaVencimiento)}
              onChange={(e) => update('fechaVencimiento', e.target.value)}
            />
          </InventoryFormField>
        ) : null}
        <p className="col-span-full text-sm leading-6 text-slate-500">
          {mode === 'create'
            ? 'El stock mínimo es el umbral de alerta. La existencia física inicia en 0 y solo cambia con entradas o salidas de bodega. El vencimiento lo define la categoría del material.'
            : 'El stock mínimo es el umbral de alerta. La existencia física no se edita aquí. El vencimiento lo define la categoría.'}
        </p>
        <InventoryFormField
          label="Proveedor principal *"
          icon={<IconBuildingStore size={20} aria-hidden="true" />}
          error={errors.proveedorId}
        >
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
          </select>
        </InventoryFormField>
        {loadingCategorias ? (
          <p className="col-span-full text-sm text-slate-500" role="status">
            Cargando categorías disponibles…
          </p>
        ) : null}
        {categoriasError ? (
          <Alert className="col-span-full" tone="danger" title="No fue posible cargar las categorías">
            <div className="mt-2">
              <Button type="button" variant="secondary" size="sm" onClick={refetchCategorias}>
                Reintentar
              </Button>
            </div>
          </Alert>
        ) : null}
        {loadingProveedores ? (
          <p className="col-span-full text-sm text-slate-500" role="status">
            Cargando proveedores disponibles…
          </p>
        ) : null}
        {proveedoresError ? (
          <Alert className="col-span-full" tone="danger" title="No fue posible cargar los proveedores">
            <div className="mt-2">
              <Button type="button" variant="secondary" size="sm" onClick={refetchProveedores}>
                Reintentar
              </Button>
            </div>
          </Alert>
        ) : null}
        {mode === 'edit' ? (
          <InventoryFormField
            label="Estado"
            icon={<IconToggleRight size={20} aria-hidden="true" />}
          >
            <select
              value={String(values.activo)}
              onChange={(e) => update('activo', e.target.value === 'true')}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </InventoryFormField>
        ) : null}
        {mode === 'edit' ? (
          <InventoryFormField
            label="Existencia actual"
            icon={<IconStack2 size={20} aria-hidden="true" />}
            full
            hint={
              <small className="text-sm text-slate-500">
                Solo cambia mediante entradas y salidas de inventario.
              </small>
            }
          >
            <input value={stockActual ?? 0} disabled readOnly />
          </InventoryFormField>
        ) : null}
        {mode === 'create' ? (
          <div className="col-span-full grid gap-6 border-t border-slate-100 pt-6">
            <InventoryFormHeading
              className="border-0 pb-0"
              icon={<IconTruckDelivery size={25} aria-hidden="true" />}
              title="Existencia inicial (opcional)"
              description='Si ya tiene unidades en bodega, ingréselas aquí para no tener que ir a "Registrar entrada" por separado.'
            />
            <InventoryFormField
              label="Cantidad inicial en bodega"
              icon={<IconStack2 size={20} aria-hidden="true" />}
              error={errors.cantidadInicial}
              full
            >
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={values.cantidadInicial}
                placeholder="Ej. 10 — déjelo vacío si es 0"
                aria-invalid={Boolean(errors.cantidadInicial)}
                onChange={(e) => update('cantidadInicial', e.target.value)}
              />
            </InventoryFormField>
          </div>
        ) : null}
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
            {saving ? 'Guardando…' : mode === 'create' ? 'Registrar material' : 'Guardar cambios'}
          </Button>
          <Button
            to={MATERIALES_PATH}
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
            leftIcon={<IconArrowLeft size={19} aria-hidden="true" />}
          >
            Volver al catálogo
          </Button>
        </div>
        </form>
      </Card>
    </>
  )
}
