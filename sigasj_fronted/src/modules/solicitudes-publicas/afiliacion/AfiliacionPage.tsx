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
import SignaturePad from '../arreglo-pago/SignaturePad'
import {
  getAfiliacionErrorMessage,
  registrarAfiliacion,
} from './afiliacionApi'
import {
  afiliacionAbonadoInmuebleSchema,
  afiliacionFirmaSchema,
  afiliacionPersonalesSchema,
  afiliacionRecomendacion1Schema,
  afiliacionRecomendacion2Schema,
} from './afiliacionSchemas'
import type { AfiliacionFormValues, AfiliacionResponse } from './types'

const initialValues = (): AfiliacionFormValues => ({
  fechaSolicitud: hoyEnAsada(),
  nombre: '',
  identificacion: '',
  vecinoDe: '',
  estadoCivil: '',
  telefono: '',
  correoElectronico: '',
  numeroAbonado: '',
  numeroPlano: '',
  folioReal: '',
  firmaSolicitante: '',
  recomendacion1Nombre: '',
  recomendacion1Identificacion: '',
  recomendacion1NumeroAbonado: '',
  recomendacion1Firma: '',
  recomendacion2Nombre: '',
  recomendacion2Identificacion: '',
  recomendacion2NumeroAbonado: '',
  recomendacion2Firma: '',
})

type UpdateFormValue = <Key extends keyof AfiliacionFormValues>(
  key: Key,
  value: AfiliacionFormValues[Key],
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
}: {
  name: keyof AfiliacionFormValues
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'tel' | 'email' | 'date'
  maxLength?: number
  placeholder?: string
  hint?: string
  required?: boolean
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

const AfiliacionPage = () => {
  const [values, setValues] = useState<AfiliacionFormValues>(initialValues)
  const [result, setResult] = useState<AfiliacionResponse | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const requestDateLabel = useMemo(() => hoyEnAsada(), [])

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
      const response = await registrarAfiliacion(values)
      setResult(response)
    } catch (error) {
      setSubmitError(getAfiliacionErrorMessage(error))
    }
  }

  const personalesStep = (
    <div className="grid gap-5 max-[680px]:grid-cols-1 sm:grid-cols-2">
      <TextField
        name="fechaSolicitud"
        label="Fecha de la solicitud"
        type="date"
        value={values.fechaSolicitud}
        onChange={(value) => update('fechaSolicitud', value)}
        hint="Fecha declarada en el formulario (no es la fecha de ingreso del sistema)."
      />
      <TextField
        name="nombre"
        label="Nombre completo"
        value={values.nombre}
        maxLength={150}
        onChange={(value) => update('nombre', value)}
      />
      <TextField
        name="identificacion"
        label="Identificación"
        value={values.identificacion}
        maxLength={30}
        placeholder="1-1234-0567"
        onChange={(value) => update('identificacion', value)}
        hint="Se conserva como texto (ceros iniciales y guiones)."
      />
      <TextField
        name="estadoCivil"
        label="Estado civil"
        value={values.estadoCivil}
        maxLength={40}
        onChange={(value) => update('estadoCivil', value)}
        hint="Indique el estado civil según el formulario oficial (catálogo ASADA pendiente de PDF)."
      />
      <TextField
        name="telefono"
        label="Teléfono"
        type="tel"
        value={values.telefono}
        maxLength={30}
        onChange={(value) => update('telefono', value)}
      />
      <TextField
        name="correoElectronico"
        label="Correo electrónico"
        type="email"
        value={values.correoElectronico}
        maxLength={150}
        onChange={(value) => update('correoElectronico', value)}
      />
      <div className="sm:col-span-2">
        <TextField
          name="vecinoDe"
          label="Vecino de / lugar de residencia"
          value={values.vecinoDe}
          maxLength={200}
          onChange={(value) => update('vecinoDe', value)}
          hint="Dirección o localidad de residencia según el formulario."
        />
      </div>
    </div>
  )

  const abonadoStep = (
    <div className="grid gap-5 max-[680px]:grid-cols-1 sm:grid-cols-2">
      <TextField
        name="numeroAbonado"
        label="Número de abonado"
        value={values.numeroAbonado}
        maxLength={50}
        onChange={(value) => update('numeroAbonado', value)}
        hint="Identificador textual del abonado (no se valida existencia en este paso)."
      />
      <TextField
        name="numeroPlano"
        label="Número de plano"
        value={values.numeroPlano}
        maxLength={50}
        onChange={(value) => update('numeroPlano', value)}
      />
      <TextField
        name="folioReal"
        label="Folio real"
        value={values.folioReal}
        maxLength={50}
        required={false}
        onChange={(value) => update('folioReal', value)}
        hint="Opcional si el inmueble no está inscrito."
      />
    </div>
  )

  const recomendacion1Step = (
    <div className="grid gap-5">
      <p className="m-0 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm font-medium leading-6 text-[#173f6e]">
        Complete los datos del <strong>primer afiliado activo</strong> que
        recomienda esta solicitud. Esta sección es independiente de la segunda
        recomendación.
      </p>
      <div className="grid gap-5 max-[680px]:grid-cols-1 sm:grid-cols-2">
        <TextField
          name="recomendacion1Nombre"
          label="Nombre del recomendante 1"
          value={values.recomendacion1Nombre}
          maxLength={150}
          onChange={(value) => update('recomendacion1Nombre', value)}
        />
        <TextField
          name="recomendacion1Identificacion"
          label="Identificación del recomendante 1"
          value={values.recomendacion1Identificacion}
          maxLength={30}
          onChange={(value) => update('recomendacion1Identificacion', value)}
        />
        <TextField
          name="recomendacion1NumeroAbonado"
          label="Número de abonado del recomendante 1"
          value={values.recomendacion1NumeroAbonado}
          maxLength={50}
          onChange={(value) => update('recomendacion1NumeroAbonado', value)}
        />
      </div>
      <SignaturePad
        label="Firma del recomendante 1"
        value={values.recomendacion1Firma}
        onChange={(value) => update('recomendacion1Firma', value)}
      />
    </div>
  )

  const recomendacion2Step = (
    <div className="grid gap-5">
      <p className="m-0 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm font-medium leading-6 text-[#173f6e]">
        Complete los datos del <strong>segundo afiliado activo</strong> que
        recomienda esta solicitud. No reutilice los datos de la primera
        recomendación.
      </p>
      <div className="grid gap-5 max-[680px]:grid-cols-1 sm:grid-cols-2">
        <TextField
          name="recomendacion2Nombre"
          label="Nombre del recomendante 2"
          value={values.recomendacion2Nombre}
          maxLength={150}
          onChange={(value) => update('recomendacion2Nombre', value)}
        />
        <TextField
          name="recomendacion2Identificacion"
          label="Identificación del recomendante 2"
          value={values.recomendacion2Identificacion}
          maxLength={30}
          onChange={(value) => update('recomendacion2Identificacion', value)}
        />
        <TextField
          name="recomendacion2NumeroAbonado"
          label="Número de abonado del recomendante 2"
          value={values.recomendacion2NumeroAbonado}
          maxLength={50}
          onChange={(value) => update('recomendacion2NumeroAbonado', value)}
        />
      </div>
      <SignaturePad
        label="Firma del recomendante 2"
        value={values.recomendacion2Firma}
        onChange={(value) => update('recomendacion2Firma', value)}
      />
    </div>
  )

  const firmaStep = (
    <div className="grid gap-5">
      <p className="m-0 text-sm font-medium leading-6 text-[#526d8c]">
        La firma del solicitante es opcional según el contrato actual del
        Backend. Puede dibujarla aquí o continuar sin ella.
      </p>
      <SignaturePad
        label="Firma del solicitante"
        value={values.firmaSolicitante}
        onChange={(value) => update('firmaSolicitante', value)}
      />
    </div>
  )

  const reviewStep = (
    <FormReview
      emptyDocumentsMessage="Este trámite no requiere adjuntar documentación adicional."
      sections={[
        {
          id: 'personales',
          title: 'Datos personales',
          stepIndex: 0,
          items: [
            { label: 'Fecha de la solicitud', value: values.fechaSolicitud },
            { label: 'Nombre', value: values.nombre },
            { label: 'Identificación', value: values.identificacion },
            { label: 'Vecino de', value: values.vecinoDe },
            { label: 'Estado civil', value: values.estadoCivil },
            { label: 'Teléfono', value: values.telefono },
            { label: 'Correo electrónico', value: values.correoElectronico },
          ],
        },
        {
          id: 'abonado',
          title: 'Datos del abonado e inmueble',
          stepIndex: 1,
          items: [
            { label: 'Número de abonado', value: values.numeroAbonado },
            { label: 'Número de plano', value: values.numeroPlano },
            {
              label: 'Folio real',
              value: values.folioReal.trim() || 'No indicado',
            },
          ],
        },
        {
          id: 'recomendacion-1',
          title: 'Primera recomendación',
          stepIndex: 2,
          items: [
            { label: 'Nombre', value: values.recomendacion1Nombre },
            {
              label: 'Identificación',
              value: values.recomendacion1Identificacion,
            },
            {
              label: 'Número de abonado',
              value: values.recomendacion1NumeroAbonado,
            },
            {
              label: 'Firma',
              value: values.recomendacion1Firma
                ? 'Firma incorporada'
                : 'No incorporada (opcional)',
            },
          ],
        },
        {
          id: 'recomendacion-2',
          title: 'Segunda recomendación',
          stepIndex: 3,
          items: [
            { label: 'Nombre', value: values.recomendacion2Nombre },
            {
              label: 'Identificación',
              value: values.recomendacion2Identificacion,
            },
            {
              label: 'Número de abonado',
              value: values.recomendacion2NumeroAbonado,
            },
            {
              label: 'Firma',
              value: values.recomendacion2Firma
                ? 'Firma incorporada'
                : 'No incorporada (opcional)',
            },
          ],
        },
        {
          id: 'firma',
          title: 'Firma del solicitante',
          stepIndex: 4,
          items: [
            {
              label: 'Firma',
              value: values.firmaSolicitante
                ? 'Firma incorporada'
                : 'No incorporada (opcional)',
            },
          ],
        },
      ]}
    />
  )

  const steps = [
    {
      id: 'personales',
      title: 'Datos personales',
      description:
        'Indica la fecha del formulario y tus datos de identificación y contacto.',
      content: personalesStep,
      validation: {
        schema: afiliacionPersonalesSchema,
        getValues: () => values,
      },
    },
    {
      id: 'abonado-inmueble',
      title: 'Datos del abonado e inmueble',
      description: 'Número de abonado, plano y folio real del inmueble.',
      content: abonadoStep,
      validation: {
        schema: afiliacionAbonadoInmuebleSchema,
        getValues: () => values,
      },
    },
    {
      id: 'recomendacion-1',
      title: 'Primera recomendación',
      description:
        'Datos del primer afiliado activo que recomienda la solicitud.',
      content: recomendacion1Step,
      validation: {
        schema: afiliacionRecomendacion1Schema,
        getValues: () => values,
      },
    },
    {
      id: 'recomendacion-2',
      title: 'Segunda recomendación',
      description:
        'Datos del segundo afiliado activo que recomienda la solicitud.',
      content: recomendacion2Step,
      validation: {
        schema: afiliacionRecomendacion2Schema,
        getValues: () => values,
      },
    },
    {
      id: 'firma',
      title: 'Firma',
      description: 'Firma digital del solicitante (opcional).',
      content: firmaStep,
      validation: {
        schema: afiliacionFirmaSchema,
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
        aria-label="Formulario público de afiliación"
      >
        <div className="mx-auto w-full max-w-[1050px]">
          <header className="mx-auto mb-10 max-w-[920px] text-center">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.25em] text-[#1476cf]">
              Trámite digital
            </p>
            <h1 className="m-0 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-tight tracking-[-0.04em] text-[#092e67]">
              Solicitud de Afiliación
            </h1>
            <p className="mb-0 mt-4 leading-7 text-[#526d8c]">
              Completa los seis pasos para solicitar tu incorporación como
              asociado ante la ASADA. Fecha de referencia del día:{' '}
              {requestDateLabel}.
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
                  title: 'Confirmar solicitud de afiliación',
                  message:
                    'Confirma que los datos personales, el abonado, ambas recomendaciones y la firma son correctos antes de registrar la solicitud.',
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

export default AfiliacionPage
