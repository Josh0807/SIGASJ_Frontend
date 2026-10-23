import { useLayoutEffect, useMemo, useState } from 'react'
import { IconArrowRight, IconCircleCheckFilled, IconHome } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import FormReview from '../../../shared/components/FormReview'
import FormSuccessResult from '../../../shared/components/FormSuccessResult'
import FormWizard from '../../../shared/components/FormWizard'
import FormWizardFieldError from '../../../shared/components/FormWizardFieldError'
import { useFormWizardField } from '../../../shared/components/formWizardValidation'
import { formatearFechaAsada, hoyEnAsada } from '../../../shared/utils/fechaAsada'
import Footer from '../../landing/components/Footer'
import PublicReceiptNavbar from '../../recibos/components/PublicReceiptNavbar'
import DocumentRequirements from '../DocumentRequirements'
import SignaturePad from '../arreglo-pago/SignaturePad'
import {
  getCambioTitularErrorMessage,
  registrarCambioTitular,
} from './cambioTitularApi'
import {
  cambioTitularDocumentosSchema,
  cambioTitularNotificacionesSchema,
  cambioTitularPropietarioInmuebleSchema,
  cambioTitularServicioSchema,
  cambioTitularSolicitanteSchema,
} from './cambioTitularSchemas'
import {
  CALIDADES_TITULAR,
  MEDIOS_NOTIFICACION,
  NATURALEZAS_INMUEBLE,
  type CalidadTitular,
  type CambioTitularFormValues,
  type CambioTitularResponse,
  type MedioNotificacion,
  type NaturalezaInmueble,
} from './types'

const initialValues: CambioTitularFormValues = {
  nombreSolicitante: '',
  identificacionSolicitante: '',
  telefono: '',
  nombrePropietarioRegistral: '',
  identificacionPropietario: '',
  folioReal: '',
  planoCatastrado: '',
  planoAgrimensura: '',
  naturalezaInmueble: '',
  calidadTitular: '',
  nis: '',
  facturaANombreDe: '',
  medioNotificacionPrincipal: '',
  medioNotificacionSecundario: '',
  firma: '',
  documentos: [],
}

type TextFieldProps = {
  name: keyof CambioTitularFormValues
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'tel'
  maxLength?: number
  placeholder?: string
  hint?: string
  required?: boolean
}

type UpdateFormValue = <Key extends keyof CambioTitularFormValues>(
  key: Key,
  value: CambioTitularFormValues[Key],
) => void

const TextField = ({
  name,
  label,
  value,
  onChange,
  type = 'text',
  maxLength,
  placeholder,
  hint,
  required = true,
}: TextFieldProps) => {
  const field = useFormWizardField(name)
  return (
    <label className="grid min-w-0 gap-2 font-bold text-[#173f6e]">
      {label}{' '}
      {required ? (
        <span className="sr-only">obligatorio</span>
      ) : (
        <span className="font-medium text-[#607a98]">(opcional)</span>
      )}
      {hint ? (
        <span className="text-sm font-medium text-[#607a98]">{hint}</span>
      ) : null}
      <input
        className="min-h-12 w-full rounded-xl border border-sky-200 bg-white px-4 font-medium text-slate-800 outline-none transition focus:border-sky-500 focus:ring-3 focus:ring-sky-200"
        name={name}
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        {...field.inputProps}
      />
      <FormWizardFieldError name={name} />
    </label>
  )
}

const DocumentsAndSignatureFields = ({
  values,
  update,
}: {
  values: CambioTitularFormValues
  update: UpdateFormValue
}) => {
  const documentos = useFormWizardField('documentos')
  return (
    <div className="grid gap-7">
      <DocumentRequirements
        slug="cambio-titular"
        files={values.documentos}
        onFilesChange={(files) => update('documentos', files)}
        inputProps={documentos.inputProps}
        error={<FormWizardFieldError name="documentos" />}
      />
      <SignaturePad
        value={values.firma}
        onChange={(value) => update('firma', value)}
      />
    </div>
  )
}

const SelectField = <T extends string>({
  name,
  label,
  value,
  onChange,
  options,
  placeholder,
  required = true,
  hint,
}: {
  name: keyof CambioTitularFormValues
  label: string
  value: string
  onChange: (value: T | '') => void
  options: readonly T[]
  placeholder: string
  required?: boolean
  hint?: string
}) => {
  const field = useFormWizardField(name)
  return (
    <label className="grid min-w-0 gap-2 font-bold text-[#173f6e]">
      {label}{' '}
      {required ? (
        <span className="sr-only">obligatorio</span>
      ) : (
        <span className="font-medium text-[#607a98]">(opcional)</span>
      )}
      {hint ? (
        <span className="text-sm font-medium text-[#607a98]">{hint}</span>
      ) : null}
      <select
        className="min-h-12 w-full rounded-xl border border-sky-200 bg-white px-4 font-medium text-slate-800 outline-none transition focus:border-sky-500 focus:ring-3 focus:ring-sky-200"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value as T | '')}
        {...field.inputProps}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
      <FormWizardFieldError name={name} />
    </label>
  )
}

const CambioTitularPage = () => {
  const [values, setValues] = useState<CambioTitularFormValues>(initialValues)
  const [result, setResult] = useState<CambioTitularResponse | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const requestDate = useMemo(() => hoyEnAsada(), [])

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [result])

  const update: UpdateFormValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    try {
      setResult(await registrarCambioTitular(values))
    } catch (error) {
      setSubmitError(getCambioTitularErrorMessage(error))
    }
  }

  const solicitanteStep = (
    <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">
      <TextField
        name="nombreSolicitante"
        label="Nombre completo del solicitante"
        value={values.nombreSolicitante}
        maxLength={150}
        onChange={(value) => update('nombreSolicitante', value)}
      />
      <TextField
        name="identificacionSolicitante"
        label="Identificación del solicitante"
        value={values.identificacionSolicitante}
        maxLength={30}
        placeholder="Ej. 1-1234-0567"
        hint="Cédula, DIMEX u otro documento. Se conservan guiones y ceros."
        onChange={(value) => update('identificacionSolicitante', value)}
      />
      <TextField
        name="telefono"
        label="Teléfono de contacto"
        type="tel"
        value={values.telefono}
        maxLength={30}
        placeholder="Ej. 8888-1234"
        onChange={(value) => update('telefono', value)}
      />
      <label className="grid gap-2 font-bold text-[#173f6e]">
        Fecha de solicitud
        <input
          className="min-h-12 rounded-xl border border-sky-100 bg-slate-50 px-4 font-semibold text-slate-600"
          value={formatearFechaAsada(requestDate)}
          readOnly
          aria-readonly="true"
        />
      </label>
    </div>
  )

  const propietarioInmuebleStep = (
    <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">
      <p className="col-span-2 m-0 rounded-xl border border-sky-100 bg-sky-50/80 p-4 text-sm font-medium leading-6 text-[#3d5f82] max-[680px]:col-span-1">
        Los datos del propietario registral pueden diferir de los del
        solicitante. No se copian automáticamente.
      </p>
      <TextField
        name="nombrePropietarioRegistral"
        label="Nombre del propietario registral"
        value={values.nombrePropietarioRegistral}
        maxLength={150}
        onChange={(value) => update('nombrePropietarioRegistral', value)}
      />
      <TextField
        name="identificacionPropietario"
        label="Identificación del propietario registral"
        value={values.identificacionPropietario}
        maxLength={30}
        onChange={(value) => update('identificacionPropietario', value)}
      />
      <TextField
        name="folioReal"
        label="Folio real"
        value={values.folioReal}
        maxLength={50}
        required={false}
        hint="Opcional si el inmueble no está inscrito."
        onChange={(value) => update('folioReal', value)}
      />
      <TextField
        name="planoCatastrado"
        label="Plano catastrado"
        value={values.planoCatastrado}
        maxLength={50}
        required={false}
        onChange={(value) => update('planoCatastrado', value)}
      />
      <TextField
        name="planoAgrimensura"
        label="Plano de agrimensura"
        value={values.planoAgrimensura}
        maxLength={50}
        required={false}
        onChange={(value) => update('planoAgrimensura', value)}
      />
      <SelectField
        name="naturalezaInmueble"
        label="Naturaleza del inmueble"
        value={values.naturalezaInmueble}
        options={NATURALEZAS_INMUEBLE}
        placeholder="Seleccione la naturaleza…"
        onChange={(value) =>
          update('naturalezaInmueble', value as '' | NaturalezaInmueble)
        }
      />
      <SelectField
        name="calidadTitular"
        label="Calidad del titular"
        value={values.calidadTitular}
        options={CALIDADES_TITULAR}
        placeholder="Seleccione la calidad…"
        onChange={(value) =>
          update('calidadTitular', value as '' | CalidadTitular)
        }
      />
    </div>
  )

  const servicioStep = (
    <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">
      <TextField
        name="nis"
        label="NIS / número de servicio"
        value={values.nis}
        maxLength={50}
        hint="Identificador textual del servicio (admite guiones y letras)."
        onChange={(value) => update('nis', value)}
      />
      <TextField
        name="facturaANombreDe"
        label="Factura a nombre de"
        value={values.facturaANombreDe}
        maxLength={150}
        hint="Nombre que aparece actualmente en la facturación del servicio."
        onChange={(value) => update('facturaANombreDe', value)}
      />
    </div>
  )

  const notificacionesStep = (
    <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">
      <SelectField
        name="medioNotificacionPrincipal"
        label="Medio de notificación principal"
        value={values.medioNotificacionPrincipal}
        options={MEDIOS_NOTIFICACION}
        placeholder="Seleccione un medio…"
        onChange={(value) =>
          update(
            'medioNotificacionPrincipal',
            value as '' | MedioNotificacion,
          )
        }
      />
      <SelectField
        name="medioNotificacionSecundario"
        label="Medio de notificación secundario"
        value={values.medioNotificacionSecundario}
        options={MEDIOS_NOTIFICACION}
        placeholder="Ninguno (opcional)"
        required={false}
        onChange={(value) =>
          update(
            'medioNotificacionSecundario',
            value as '' | MedioNotificacion,
          )
        }
      />
    </div>
  )

  const documentosStep = (
    <DocumentsAndSignatureFields values={values} update={update} />
  )

  const reviewStep = (
    <FormReview
      sections={[
        {
          id: 'solicitante',
          title: 'Datos del solicitante',
          stepIndex: 0,
          items: [
            { label: 'Nombre completo', value: values.nombreSolicitante },
            {
              label: 'Identificación',
              value: values.identificacionSolicitante,
            },
            { label: 'Teléfono', value: values.telefono },
            {
              label: 'Fecha de solicitud',
              value: formatearFechaAsada(requestDate),
            },
          ],
        },
        {
          id: 'propietario-inmueble',
          title: 'Propietario e inmueble',
          stepIndex: 1,
          items: [
            {
              label: 'Propietario registral',
              value: values.nombrePropietarioRegistral,
            },
            {
              label: 'Identificación del propietario',
              value: values.identificacionPropietario,
            },
            {
              label: 'Folio real',
              value: values.folioReal || 'No indicado',
            },
            {
              label: 'Plano catastrado',
              value: values.planoCatastrado || 'No indicado',
            },
            {
              label: 'Plano de agrimensura',
              value: values.planoAgrimensura || 'No indicado',
            },
            {
              label: 'Naturaleza del inmueble',
              value: values.naturalezaInmueble,
            },
            { label: 'Calidad del titular', value: values.calidadTitular },
          ],
        },
        {
          id: 'servicio',
          title: 'Información del servicio',
          stepIndex: 2,
          items: [
            { label: 'NIS / número de servicio', value: values.nis },
            {
              label: 'Factura a nombre de',
              value: values.facturaANombreDe,
            },
          ],
        },
        {
          id: 'notificaciones',
          title: 'Notificaciones',
          stepIndex: 3,
          items: [
            {
              label: 'Medio principal',
              value: values.medioNotificacionPrincipal,
            },
            {
              label: 'Medio secundario',
              value: values.medioNotificacionSecundario || 'No indicado',
            },
          ],
        },
        {
          id: 'firma',
          title: 'Firma',
          stepIndex: 4,
          items: [
            {
              label: 'Firma digital',
              value: values.firma
                ? 'Firma incorporada'
                : 'No incorporada (opcional)',
            },
          ],
        },
      ]}
      documentsStepIndex={4}
      documents={values.documentos.map((file, index) => ({
        id: `${file.name}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type || 'Archivo',
      }))}
    />
  )

  const steps = [
    {
      id: 'solicitante',
      title: 'Datos del solicitante',
      description: 'Completa los datos de quien solicita el cambio de titular.',
      content: solicitanteStep,
      validation: {
        schema: cambioTitularSolicitanteSchema,
        getValues: () => values,
      },
    },
    {
      id: 'propietario-inmueble',
      title: 'Propietario e inmueble',
      description:
        'Indica al propietario registral y los datos del inmueble asociado.',
      content: propietarioInmuebleStep,
      validation: {
        schema: cambioTitularPropietarioInmuebleSchema,
        getValues: () => values,
      },
    },
    {
      id: 'servicio',
      title: 'Información del servicio',
      description: 'Identifica el servicio y a nombre de quién figura la factura.',
      content: servicioStep,
      validation: {
        schema: cambioTitularServicioSchema,
        getValues: () => values,
      },
    },
    {
      id: 'notificaciones',
      title: 'Notificaciones',
      description: 'Elige cómo desea recibir las comunicaciones de la ASADA.',
      content: notificacionesStep,
      validation: {
        schema: cambioTitularNotificacionesSchema,
        getValues: () => values,
      },
    },
    {
      id: 'documentos',
      title: 'Documentos y firma',
      description:
        'Adjunta la documentación requerida y agrega tu firma si corresponde.',
      content: documentosStep,
      validation: {
        schema: cambioTitularDocumentosSchema,
        getValues: () => values,
      },
    },
    {
      id: 'revision',
      title: 'Revisión',
      description:
        'Comprueba toda la información antes de registrar la solicitud.',
      content: reviewStep,
    },
  ]

  return (
    <>
      <PublicReceiptNavbar returnTo="/#solicitudes-servicio" />
      <main
        className="min-h-[65vh] bg-[linear-gradient(135deg,#fbfdff_0%,#edf8ff_55%,#e4f5ff_100%)] px-6 py-12 max-[640px]:px-4 max-[640px]:py-8"
        aria-label="Formulario público de cambio de titular del servicio"
      >
        <div className="mx-auto w-full max-w-[1050px]">
          <header className="mx-auto mb-10 max-w-[920px] text-center">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.25em] text-[#1476cf]">
              Trámite digital
            </p>
            <h1 className="m-0 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-tight tracking-[-0.04em] text-[#092e67]">
              Cambio de Nombre del Titular del Servicio
            </h1>
            <p className="mb-0 mt-4 leading-7 text-[#526d8c]">
              Completa todos los pasos para solicitar el cambio de titular ante
              la ASADA.
            </p>
          </header>

          {result ? (
            <FormSuccessResult
              icon={<IconCircleCheckFilled size={42} />}
              className="mx-auto !max-w-[720px] !gap-5 !rounded-[28px] !border-emerald-200 !bg-[linear-gradient(145deg,#ffffff_0%,#f0fdf8_100%)] !p-8 text-center shadow-[0_24px_60px_rgba(15,118,110,0.15)] max-[560px]:!p-5 [&_.form-success-result__description]:mx-auto [&_.form-success-result__description]:max-w-xl [&_.form-success-result__highlight]:!rounded-2xl [&_.form-success-result__highlight]:!border-emerald-200 [&_.form-success-result__highlight]:!bg-white [&_.form-success-result__highlight]:!px-6 [&_.form-success-result__highlight]:!py-5 [&_.form-success-result__highlight-value]:!text-[clamp(1.55rem,5vw,2.15rem)] [&_.form-success-result__meta-item]:!rounded-2xl [&_.form-success-result__meta-item]:!p-4 [&_.form-success-result__actions]:!mt-1 [&_.form-success-result__actions]:!justify-center"
              titleClassName="!text-2xl !font-black !text-[#073b79]"
              title="Solicitud registrada correctamente"
              description="Guarda este código para consultar posteriormente el avance del trámite."
              highlightLabel="Código de seguimiento"
              highlightValue={result.codigoSeguimiento}
              meta={[
                { label: 'Estado', value: 'Pendiente' },
                {
                  label: 'Fecha de ingreso',
                  value: formatearFechaAsada(result.fechaIngreso),
                },
              ]}
              actions={
                <>
                  <Link
                    className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0872d3] to-[#3298dc] px-6 font-extrabold text-white no-underline shadow-[0_10px_22px_rgba(8,114,211,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(8,114,211,0.3)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 motion-reduce:transform-none"
                    to="/solicitudes/seguimiento"
                  >
                    Consultar seguimiento{' '}
                    <IconArrowRight
                      className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
                      size={19}
                      aria-hidden="true"
                    />
                  </Link>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#1476cf] bg-white px-6 font-extrabold text-[#0b65b5] no-underline transition hover:-translate-y-0.5 hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-400 motion-reduce:transform-none sm:ml-2"
                    to="/"
                  >
                    <IconHome size={19} aria-hidden="true" /> Volver al inicio
                  </Link>
                </>
              }
            />
          ) : (
            <>
              {submitError ? (
                <p
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800"
                  role="alert"
                >
                  {submitError}
                </p>
              ) : null}
              <FormWizard
                steps={steps}
                completeLabel="Enviar solicitud"
                onComplete={handleSubmit}
                confirmation={{
                  title: 'Confirmar cambio de titular',
                  message:
                    'Confirma que los datos, los documentos y la información del servicio son correctos antes de registrar la solicitud.',
                }}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default CambioTitularPage
