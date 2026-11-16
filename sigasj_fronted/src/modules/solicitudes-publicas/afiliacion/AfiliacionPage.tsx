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
import SignaturePad from '../arreglo-pago/SignaturePad'
import SolicitudDocumentUpload from '../SolicitudDocumentUpload'
import { usePersistedSolicitudResult } from '../usePersistedSolicitudResult'
import {
  CEDULA_FISICA_MAX_LENGTH,
  TELEFONO_CR_MAX_LENGTH,
  limitarCedulaFisica,
  limitarTelefonoCr,
} from '../identificacionCostaRica'
import { FieldCaption } from '../PublicFormFieldChrome'
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
import type { AfiliacionFormValues } from './types'

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
  documentos: [],
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
    <label className="grid min-w-0 gap-2 font-bold text-sigasj-ink">
      <FieldCaption
        label={label}
        required={required}
        hint={hint}
      />
      <input
        className="min-h-12 w-full rounded-xl border border-sigasj-border-strong bg-sigasj-surface px-4 font-medium text-sigasj-text outline-none transition focus:border-sigasj-primary focus:ring-3 focus:ring-sigasj-mist"
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
  const [result, setResult, resetResult] = usePersistedSolicitudResult('afiliacion')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const requestDateLabel = useMemo(() => formatearFechaAsada(hoyEnAsada()), [])

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [result])

  const update: UpdateFormValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const onDocumentosChange = (next: AfiliacionFormValues['documentos'] | ((previous: AfiliacionFormValues['documentos']) => AfiliacionFormValues['documentos'])) => {
    setValues((current) => ({
      ...current,
      documentos: typeof next === 'function' ? next(current.documentos) : next,
    }))
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

  const handleNuevaSolicitud = () => {
    setValues(initialValues())
    setSubmitError(null)
    resetResult()
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
        maxLength={CEDULA_FISICA_MAX_LENGTH}
        placeholder="1-1234-0567"
        onChange={(value) => update('identificacion', limitarCedulaFisica(value))}
        hint="Cédula física: máximo 9 dígitos (puede usar guiones)."
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
        maxLength={TELEFONO_CR_MAX_LENGTH}
        placeholder="8888-1234"
        onChange={(value) => update('telefono', limitarTelefonoCr(value))}
        hint="Exactamente 8 dígitos."
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
          maxLength={CEDULA_FISICA_MAX_LENGTH}
          onChange={(value) =>
            update('recomendacion1Identificacion', limitarCedulaFisica(value))
          }
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
        optional
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
          maxLength={CEDULA_FISICA_MAX_LENGTH}
          onChange={(value) =>
            update('recomendacion2Identificacion', limitarCedulaFisica(value))
          }
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
        optional
        value={values.recomendacion2Firma}
        onChange={(value) => update('recomendacion2Firma', value)}
      />
    </div>
  )

  const firmaStep = (
    <div className="grid gap-5">
      <p className="m-0 text-sm font-medium leading-6 text-[#526d8c]">
        La firma identifica a la persona solicitante. Puede dibujarla en
        pantalla o cargar una imagen PNG/JPG de su firma.
      </p>
      <SignaturePad
        label="Firma del solicitante"
        value={values.firmaSolicitante}
        onChange={(value) => update('firmaSolicitante', value)}
      />
      <SolicitudDocumentUpload
        title="Documentos complementarios"
        description="Opcional. Puede adjuntar documentos adicionales que ayuden a revisar la solicitud."
        documentos={values.documentos}
        onChange={onDocumentosChange}
        options={[{
          type: 'otro',
          label: 'Documento complementario',
          description: 'Información adicional relacionada con la solicitud de afiliación.',
          required: false,
        }]}
        error={<FormWizardFieldError name="documentos" />}
      />
    </div>
  )

  const reviewStep = (
    <FormReview
      emptyDocumentsMessage="No se adjuntaron documentos complementarios."
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
                : 'Firma pendiente',
            },
          ],
        },
      ]}
      documentsStepIndex={4}
      documents={values.documentos.map((documento) => ({
        id: documento.localId,
        name: documento.nombreOriginal,
        size: documento.tamanio,
        type: documento.tipoArchivo || 'Archivo',
      }))}
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
      description: 'Firma digital obligatoria del solicitante.',
      content: firmaStep,
      validation: {
        schema: afiliacionFirmaSchema,
          getValues: () => ({ firmaSolicitante: values.firmaSolicitante, documentos: values.documentos }),
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
    <PublicFormPage
      returnTo="/#solicitudes-servicio"
      eyebrow="Trámite digital"
      title="Solicitud de Afiliación"
      description={`Completa los seis pasos para solicitar tu incorporación como asociado ante la ASADA. Fecha de referencia del día: ${requestDateLabel}.`}
      ariaLabel="Formulario público de afiliación"
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
                    className="landing-lift-button landing-lift-button--solid group inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-sigasj-primary bg-sigasj-primary px-6 font-semibold text-white no-underline"
                    to={`/solicitudes/seguimiento?codigo=${encodeURIComponent(result.codigoSeguimiento)}`}
                  >
                    Consultar seguimiento{' '}
                    <IconArrowRight
                      className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
                      size={19}
                      aria-hidden="true"
                    />
                  </Link>
                  <button className="transparency-motion-button inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-6 font-semibold text-sigasj-primary-hover" type="button" onClick={handleNuevaSolicitud}>
                    Realizar otra solicitud
                  </button>
                  <Link
                    className="transparency-motion-button inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-6 font-semibold text-sigasj-primary-hover no-underline"
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
    </PublicFormPage>
  )
}

export default AfiliacionPage
