import { useLayoutEffect, useMemo, useState } from 'react'
import { IconArrowRight, IconCircleCheckFilled, IconHome } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import FormReview from '../../../shared/components/FormReview'
import FormSuccessResult from '../../../shared/components/FormSuccessResult'
import FormWizard from '../../../shared/components/FormWizard'
import FormWizardFieldError from '../../../shared/components/FormWizardFieldError'
import { useFormWizardField } from '../../../shared/components/formWizardValidation'
import { formatearFechaAsada, hoyEnAsada } from '../../../shared/utils/fechaAsada'
import PublicFormPage from '../../landing/components/PublicFormPage'
import SolicitudDocumentUpload from '../SolicitudDocumentUpload'
import { usePersistedSolicitudResult } from '../usePersistedSolicitudResult'
import { getArregloPagoErrorMessage, registrarArregloPago } from './arregloPagoApi'
import {
  CEDULA_FISICA_MAX_LENGTH,
  TELEFONO_CR_MAX_LENGTH,
  limitarCedulaFisica,
  limitarTelefonoCr,
} from '../identificacionCostaRica'
import { FieldCaption, ReadonlyDateField } from '../PublicFormFieldChrome'
import { arregloPagoApplicantSchema, arregloPagoDocumentsSchema, arregloPagoServiceSchema } from './arregloPagoSchemas'
import SignaturePad from './SignaturePad'
import { PLAZOS_ARREGLO_PAGO, type ArregloPagoFormValues } from './types'

const initialValues: ArregloPagoFormValues = {
  nombre: '',
  cedula: '',
  vecinoDe: '',
  telefono: '',
  numeroCuentaServicio: '',
  montoPrimaInicial: '',
  plazoSeleccionado: '',
  firma: '',
  documentos: [],
}

type TextFieldProps = {
  name: keyof ArregloPagoFormValues
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'tel' | 'number'
  maxLength?: number
  placeholder?: string
}

type UpdateFormValue = <Key extends keyof ArregloPagoFormValues>(
  key: Key,
  value: ArregloPagoFormValues[Key],
) => void

const TextField = ({ name, label, value, onChange, type = 'text', maxLength, placeholder }: TextFieldProps) => {
  const field = useFormWizardField(name)
  return (
    <label className="grid min-w-0 gap-2 font-bold text-sigasj-ink">
      <FieldCaption label={label} required />
      <input className="min-h-12 w-full rounded-xl border border-sigasj-border-strong bg-sigasj-surface px-4 font-medium text-sigasj-text outline-none transition focus:border-sigasj-primary focus:ring-3 focus:ring-sigasj-mist" name={name} type={type} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} {...field.inputProps} />
      <FormWizardFieldError name={name} />
    </label>
  )
}

const currencyFormatter = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 2 })

const ServiceFields = ({ values, update }: { values: ArregloPagoFormValues; update: UpdateFormValue }) => {
  const plazo = useFormWizardField('plazoSeleccionado')
  return (
    <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">
      <TextField name="numeroCuentaServicio" label="Número de cuenta, contrato o NIS" value={values.numeroCuentaServicio} maxLength={50} onChange={(value) => update('numeroCuentaServicio', value)} />
      <TextField name="montoPrimaInicial" label="Prima inicial en colones" type="number" value={values.montoPrimaInicial} placeholder="0" onChange={(value) => update('montoPrimaInicial', value)} />
      <label className="col-span-2 grid gap-2 font-bold text-sigasj-ink max-[680px]:col-span-1">
        <FieldCaption
          label="Plazo del arreglo"
          required
          hint="Ningún plazo se selecciona automáticamente."
        />
        <select className="min-h-12 w-full rounded-xl border border-sigasj-border-strong bg-sigasj-surface px-4 font-medium text-sigasj-text outline-none transition focus:border-sigasj-primary focus:ring-3 focus:ring-sigasj-mist" name="plazoSeleccionado" value={values.plazoSeleccionado} onChange={(event) => update('plazoSeleccionado', event.target.value as ArregloPagoFormValues['plazoSeleccionado'])} {...plazo.inputProps}>
          <option value="">Seleccione un plazo…</option>
          {PLAZOS_ARREGLO_PAGO.map((option) => <option value={option} key={option}>{option}</option>)}
        </select>
        <FormWizardFieldError name="plazoSeleccionado" />
      </label>
    </div>
  )
}

const DocumentsAndSignatureFields = ({ values, update, onDocumentosChange }: { values: ArregloPagoFormValues; update: UpdateFormValue; onDocumentosChange: (next: ArregloPagoFormValues['documentos'] | ((previous: ArregloPagoFormValues['documentos']) => ArregloPagoFormValues['documentos'])) => void }) => {
  return (
    <div className="grid gap-7">
      <SolicitudDocumentUpload
        documentos={values.documentos}
        onChange={onDocumentosChange}
        options={[{
          type: 'identificacion',
          label: 'Copia de la cédula del propietario',
          description: 'Adjunta una copia o fotografía legible de la cédula de identidad del propietario del servicio.',
          required: true,
        }]}
        error={<FormWizardFieldError name="documentos" />}
      />
      <SignaturePad value={values.firma} onChange={(value) => update('firma', value)} />
    </div>
  )
}

const ArregloPagoPage = () => {
  const [values, setValues] = useState<ArregloPagoFormValues>(initialValues)
  const [result, setResult] = usePersistedSolicitudResult('arreglo-pago')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const requestDate = useMemo(() => hoyEnAsada(), [])

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [result])

  const update = <Key extends keyof ArregloPagoFormValues>(key: Key, value: ArregloPagoFormValues[Key]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const onDocumentosChange = (next: ArregloPagoFormValues['documentos'] | ((previous: ArregloPagoFormValues['documentos']) => ArregloPagoFormValues['documentos'])) => {
    setValues((current) => ({
      ...current,
      documentos: typeof next === 'function' ? next(current.documentos) : next,
    }))
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    try {
      setResult(await registrarArregloPago(values))
    } catch (error) {
      setSubmitError(getArregloPagoErrorMessage(error))
    }
  }

  const applicantStep = (
    <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">
      <TextField name="nombre" label="Nombre completo" value={values.nombre} maxLength={150} onChange={(value) => update('nombre', value)} />
      <TextField name="cedula" label="Cédula física" value={values.cedula} maxLength={CEDULA_FISICA_MAX_LENGTH} placeholder="Ej. 1-2345-6789" onChange={(value) => update('cedula', limitarCedulaFisica(value))} />
      <TextField name="telefono" label="Teléfono de contacto" type="tel" value={values.telefono} maxLength={TELEFONO_CR_MAX_LENGTH} placeholder="Ej. 8888-1234" onChange={(value) => update('telefono', limitarTelefonoCr(value))} />
      <div className="max-[680px]:col-span-1 col-span-2">
        <TextField name="vecinoDe" label="Vecino de / dirección de residencia" value={values.vecinoDe} maxLength={200} onChange={(value) => update('vecinoDe', value)} />
      </div>
      <ReadonlyDateField value={formatearFechaAsada(requestDate)} />
    </div>
  )

  const serviceStep = <ServiceFields values={values} update={update} />

  const documentsStep = <DocumentsAndSignatureFields values={values} update={update} onDocumentosChange={onDocumentosChange} />

  const reviewStep = (
    <FormReview
      sections={[
        {
          id: 'solicitante',
          title: 'Datos del solicitante',
          stepIndex: 0,
          items: [
            { label: 'Nombre completo', value: values.nombre },
            { label: 'Cédula o identificación', value: values.cedula },
            { label: 'Vecino de', value: values.vecinoDe },
            { label: 'Teléfono', value: values.telefono },
            { label: 'Fecha de solicitud', value: formatearFechaAsada(requestDate) },
          ],
        },
        {
          id: 'servicio',
          title: 'Información del servicio y arreglo',
          stepIndex: 1,
          items: [
            { label: 'Número de cuenta, contrato o NIS', value: values.numeroCuentaServicio },
            { label: 'Prima inicial', value: values.montoPrimaInicial ? currencyFormatter.format(Number(values.montoPrimaInicial.replace(',', '.'))) : '' },
            { label: 'Plazo seleccionado', value: values.plazoSeleccionado },
          ],
        },
        {
          id: 'firma',
          title: 'Firma',
          stepIndex: 2,
          items: [{ label: 'Firma digital', value: values.firma ? 'Firma incorporada' : 'Firma pendiente' }],
        },
      ]}
      documentsStepIndex={2}
      documents={values.documentos.map((documento) => ({ id: documento.localId, name: documento.nombreOriginal, size: documento.tamanio, type: documento.tipoArchivo || 'Archivo' }))}
    />
  )

  const steps = [
    { id: 'solicitante', title: 'Datos del solicitante', description: 'Completa los datos personales de quien solicita el arreglo.', content: applicantStep, validation: { schema: arregloPagoApplicantSchema, getValues: () => values } },
    { id: 'servicio', title: 'Servicio y arreglo', description: 'Indica la cuenta, la prima inicial y el plazo solicitado.', content: serviceStep, validation: { schema: arregloPagoServiceSchema, getValues: () => values } },
    { id: 'documentos', title: 'Documentación y firma', description: 'Adjunta la documentación requerida y agrega tu firma si corresponde.', content: documentsStep, validation: { schema: arregloPagoDocumentsSchema, getValues: () => values } },
    { id: 'revision', title: 'Revisión', description: 'Comprueba toda la información antes de registrar la solicitud.', content: reviewStep },
  ]

  return (
    <PublicFormPage
      returnTo="/#solicitudes-servicio"
      eyebrow="Trámite digital"
      title="Solicitud de Arreglo de Pago Domiciliar"
      description="Completa todos los pasos para solicitar un convenio de pago ante la ASADA."
      ariaLabel="Formulario público de solicitud de arreglo de pago"
      maxWidth="xl"
    >
{result ? (
            <FormSuccessResult
              icon={<IconCircleCheckFilled size={42} />}
              className="mx-auto !max-w-[720px] !gap-5 !rounded-[28px] !border-emerald-200 !bg-[linear-gradient(145deg,#ffffff_0%,#f0fdf8_100%)] !p-8 text-center shadow-[0_24px_60px_rgba(15,118,110,0.15)] max-[560px]:!p-5 [&_.form-success-result__description]:mx-auto [&_.form-success-result__description]:max-w-xl [&_.form-success-result__highlight]:!rounded-2xl [&_.form-success-result__highlight]:!border-emerald-200 [&_.form-success-result__highlight]:!bg-white [&_.form-success-result__highlight]:!px-6 [&_.form-success-result__highlight]:!py-5 [&_.form-success-result__highlight-value]:!text-[clamp(1.55rem,5vw,2.15rem)] [&_.form-success-result__meta-item]:!rounded-2xl [&_.form-success-result__meta-item]:!p-4 [&_.form-success-result__actions]:!mt-1 [&_.form-success-result__actions]:!justify-center"
              titleClassName="!text-2xl !font-bold !text-sigasj-ink"
              title="Solicitud registrada correctamente"
              description="Guarda este código para consultar posteriormente el avance del trámite."
              highlightLabel="Código de seguimiento"
              highlightValue={result.codigoSeguimiento}
              meta={[{ label: 'Estado', value: 'Pendiente' }, { label: 'Fecha de ingreso', value: formatearFechaAsada(result.fechaIngreso) }]}
              actions={<><Link className="landing-lift-button landing-lift-button--solid group inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-sigasj-primary bg-sigasj-primary px-6 font-semibold text-white no-underline" to={`/solicitudes/seguimiento?codigo=${encodeURIComponent(result.codigoSeguimiento)}`}>Consultar seguimiento <IconArrowRight className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none" size={19} aria-hidden="true" /></Link><Link className="transparency-motion-button inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-6 font-semibold text-sigasj-primary-hover no-underline sm:ml-2" to="/"><IconHome size={19} aria-hidden="true" /> Volver al inicio</Link></>}
            />
          ) : (
            <>
              {submitError ? <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800" role="alert">{submitError}</p> : null}
              <FormWizard steps={steps} completeLabel="Enviar solicitud" onComplete={handleSubmit} confirmation={{ title: 'Confirmar solicitud de arreglo de pago', message: 'Confirma que los datos, el plazo y los documentos seleccionados son correctos antes de registrar la solicitud.' }} />
            </>
          )}
    </PublicFormPage>
  )
}

export default ArregloPagoPage
