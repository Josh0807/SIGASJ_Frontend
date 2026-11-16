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
import { FieldCaption } from '../PublicFormFieldChrome'
import SignaturePad from '../arreglo-pago/SignaturePad'
import {
  CEDULA_FISICA_MAX_LENGTH,
  TELEFONO_CR_MAX_LENGTH,
  limitarCedulaFisica,
  limitarTelefonoCr,
} from '../identificacionCostaRica'
import { usePersistedSolicitudResult } from '../usePersistedSolicitudResult'
import ServicioExistenteDocumentUpload from './ServicioExistenteDocumentUpload'
import { getServicioExistenteErrorMessage, registrarServicioExistente } from './servicioExistenteApi'
import {
  servicioDocumentosFirmaSchema,
  servicioInmuebleSchema,
  servicioMotivoSchema,
  servicioNotificacionesSchema,
  servicioSolicitanteSchema,
  servicioUbicacionSchema,
} from './servicioExistenteSchemas'
import {
  CALIDADES_TITULAR,
  MEDIOS_NOTIFICACION,
  MOTIVOS,
  NATURALEZAS_INMUEBLE,
  TIPOS_SERVICIO,
  type DocumentoAdjunto,
  type ServicioExistenteFormValues,
} from './types'

const initialValues: ServicioExistenteFormValues = {
  tipoServicio: '', nis: '', propietarioInmueble: '', nombreSolicitante: '',
  identificacionSolicitante: '', correoElectronico: '', telefono: '',
  naturalezaInmueble: '', calidadTitular: '', folioReal: '', planoCatastrado: '',
  planoAgrimensura: '', provincia: '', canton: '', distrito: '', direccionExacta: '',
  motivo: '', otroMotivo: '', tramitePorRealizar: '', medioNotificacionPrincipal: '',
  medioNotificacionSecundario: '', documentos: [], firma: '',
}

type Update = <K extends keyof ServicioExistenteFormValues>(key: K, value: ServicioExistenteFormValues[K]) => void

const Field = ({ name, label, value, update, type = 'text', optional = false, multiline = false, maxLength = 200, placeholder }: {
  name: keyof ServicioExistenteFormValues; label: string; value: string; update: (value: string) => void
  type?: 'text' | 'email' | 'tel'; optional?: boolean; multiline?: boolean; maxLength?: number; placeholder?: string
}) => {
  const field = useFormWizardField(name)
  const common = { name, value, maxLength, placeholder, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(event.target.value), className: 'min-h-12 w-full rounded-xl border border-sigasj-border-strong bg-sigasj-surface px-4 py-3 font-medium text-sigasj-text outline-none focus:border-sigasj-primary focus:ring-3 focus:ring-sigasj-mist', ...field.inputProps }
  return (
    <label className="grid min-w-0 gap-2 font-bold text-sigasj-ink">
      <FieldCaption label={label} required={!optional} />
      {multiline ? <textarea {...common} rows={4} /> : <input {...common} type={type} />}
      <FormWizardFieldError name={name} />
    </label>
  )
}

const Select = ({ name, label, value, options, update, optional = false }: {
  name: keyof ServicioExistenteFormValues; label: string; value: string; options: readonly string[]; update: (value: string) => void; optional?: boolean
}) => {
  const field = useFormWizardField(name)
  return (
    <label className="grid min-w-0 gap-2 font-bold text-sigasj-ink">
      <FieldCaption label={label} required={!optional} />
      <select className="min-h-12 w-full rounded-xl border border-sigasj-border-strong bg-sigasj-surface px-4 font-medium text-sigasj-text outline-none focus:border-sigasj-primary focus:ring-3 focus:ring-sigasj-mist" name={name} value={value} onChange={(event) => update(event.target.value)} {...field.inputProps}>
        <option value="">Seleccione una opción…</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
      <FormWizardFieldError name={name} />
    </label>
  )
}

const ServicioExistentePage = () => {
  const [values, setValues] = useState(initialValues)
  const [result, setResult, resetResult] = usePersistedSolicitudResult('servicio-existente')
  const [submitError, setSubmitError] = useState('')
  const requestDate = useMemo(() => hoyEnAsada(), [])

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [result])

  const update: Update = (key, value) => setValues((previous) => ({ ...previous, [key]: value }))
  const onDocumentsChange = (next: DocumentoAdjunto[] | ((previous: DocumentoAdjunto[]) => DocumentoAdjunto[])) => setValues((previous) => ({ ...previous, documentos: typeof next === 'function' ? next(previous.documentos) : next }))

  const handleSubmit = async () => {
    setSubmitError('')
    try { setResult(await registrarServicioExistente(values)); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    catch (error) { setSubmitError(getServicioExistenteErrorMessage(error)) }
  }

  const handleNuevaSolicitud = () => {
    setValues({ ...initialValues, documentos: [] })
    setSubmitError('')
    resetResult()
  }

  const field = (
    name: keyof ServicioExistenteFormValues,
    label: string,
    options: Partial<React.ComponentProps<typeof Field>> = {},
  ) => (
    <Field
      name={name}
      label={label}
      value={String(values[name])}
      update={(value) => {
        if (name === 'identificacionSolicitante') {
          update(name, limitarCedulaFisica(value) as never)
          return
        }
        if (name === 'telefono') {
          update(name, limitarTelefonoCr(value) as never)
          return
        }
        update(name, value as never)
      }}
      {...options}
    />
  )
  const select = (name: keyof ServicioExistenteFormValues, label: string, options: readonly string[], optional = false) => <Select name={name} label={label} value={String(values[name])} options={options} optional={optional} update={(value) => update(name, value as never)} />

  const review = <FormReview sections={[
    { id: 'servicio', title: 'Servicio y solicitante', stepIndex: 0, items: [
      { label: 'Tipo de servicio', value: values.tipoServicio }, { label: 'NIS', value: values.nis },
      { label: 'Propietario del inmueble', value: values.propietarioInmueble }, { label: 'Solicitante', value: values.nombreSolicitante },
      { label: 'Identificación', value: values.identificacionSolicitante }, { label: 'Correo', value: values.correoElectronico }, { label: 'Teléfono', value: values.telefono },
    ]},
    { id: 'inmueble', title: 'Datos del inmueble', stepIndex: 1, items: [
      { label: 'Naturaleza', value: values.naturalezaInmueble }, { label: 'Calidad del titular', value: values.calidadTitular },
      { label: 'Folio real', value: values.folioReal || 'No indicado' }, { label: 'Plano catastrado', value: values.planoCatastrado || 'No indicado' }, { label: 'Plano de agrimensura', value: values.planoAgrimensura || 'No indicado' },
    ]},
    { id: 'ubicacion', title: 'Ubicación', stepIndex: 2, items: [
      { label: 'Provincia', value: values.provincia }, { label: 'Cantón', value: values.canton }, { label: 'Distrito', value: values.distrito }, { label: 'Dirección exacta', value: values.direccionExacta },
    ]},
    { id: 'motivo', title: 'Motivo y trámite', stepIndex: 3, items: [
      { label: 'Motivo', value: values.motivo === 'Otro' ? values.otroMotivo : values.motivo }, { label: 'Trámite por realizar', value: values.tramitePorRealizar },
    ]},
    { id: 'notificaciones', title: 'Notificaciones', stepIndex: 4, items: [
      { label: 'Medio principal', value: values.medioNotificacionPrincipal }, { label: 'Medio secundario', value: values.medioNotificacionSecundario || 'No indicado' },
    ]},
    { id: 'firma', title: 'Documentos y firma', stepIndex: 5, items: [
      { label: 'Firma', value: values.firma ? 'Firma registrada' : 'Sin firma' }, { label: 'Fecha de solicitud', value: formatearFechaAsada(requestDate) },
    ]},
  ]} documentsStepIndex={5} documents={values.documentos.filter((document) => document.estado === 'cargado').map((document) => ({ id: String(document.id ?? document.localId), name: document.nombreOriginal, size: document.tamanio, type: document.tipoArchivo }))} />

  const steps = [
    { id: 'servicio-solicitante', title: 'Servicio y solicitante', description: 'Datos del servicio, propietario y persona solicitante.', content: <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">{select('tipoServicio', 'Tipo de servicio', TIPOS_SERVICIO)}{field('nis', 'NIS', { maxLength: 50 })}{field('propietarioInmueble', 'Propietario del inmueble')}{field('nombreSolicitante', 'Nombre completo del solicitante')}{field('identificacionSolicitante', 'Número de identificación', { maxLength: CEDULA_FISICA_MAX_LENGTH, placeholder: 'Ej. 1-2345-6789' })}{field('correoElectronico', 'Correo electrónico', { type: 'email' })}{field('telefono', 'Teléfono', { type: 'tel', maxLength: TELEFONO_CR_MAX_LENGTH, placeholder: 'Ej. 8888-1234' })}</div>, validation: { schema: servicioSolicitanteSchema, getValues: () => values } },
    { id: 'inmueble', title: 'Datos del inmueble', description: 'Condición del inmueble y referencias registrales.', content: <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">{select('naturalezaInmueble', 'Naturaleza del inmueble', NATURALEZAS_INMUEBLE)}{select('calidadTitular', 'Calidad del titular', CALIDADES_TITULAR)}{field('folioReal', 'Folio real', { optional: true, maxLength: 50 })}{field('planoCatastrado', 'Plano catastrado', { optional: true, maxLength: 50 })}{field('planoAgrimensura', 'Plano de agrimensura', { optional: true, maxLength: 50 })}</div>, validation: { schema: servicioInmuebleSchema, getValues: () => values } },
    { id: 'ubicacion', title: 'Ubicación', description: 'Localización exacta de la propiedad.', content: <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">{field('provincia', 'Provincia', { maxLength: 80 })}{field('canton', 'Cantón', { maxLength: 80 })}{field('distrito', 'Distrito', { maxLength: 80 })}<div className="col-span-2 max-[680px]:col-span-1">{field('direccionExacta', 'Dirección exacta', { multiline: true, maxLength: 500 })}</div></div>, validation: { schema: servicioUbicacionSchema, getValues: () => values } },
    { id: 'motivo', title: 'Motivo y trámite', description: 'Indica para qué se requiere la constancia y el trámite específico.', content: <div className="grid gap-5">{select('motivo', 'Motivo de la constancia', MOTIVOS)}{values.motivo === 'Otro' ? field('otroMotivo', 'Especifique el motivo', { maxLength: 300 }) : null}{field('tramitePorRealizar', 'Trámite por realizar', { multiline: true, maxLength: 1000, placeholder: 'Ej.: tipo de remodelación, construcción o trámite bancario…' })}</div>, validation: { schema: servicioMotivoSchema, getValues: () => values } },
    { id: 'notificaciones', title: 'Notificaciones', description: 'Selecciona un medio principal y, si deseas, uno secundario diferente.', content: <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">{select('medioNotificacionPrincipal', 'Medio principal', MEDIOS_NOTIFICACION)}{select('medioNotificacionSecundario', 'Medio secundario', MEDIOS_NOTIFICACION, true)}</div>, validation: { schema: servicioNotificacionesSchema, getValues: () => values } },
    { id: 'documentos-firma', title: 'Documentos y firma', description: 'Adjunta los documentos aplicables y firma la solicitud.', content: <div className="grid gap-7"><ServicioExistenteDocumentUpload calidadTitular={values.calidadTitular} documentos={values.documentos} onChange={onDocumentsChange} error={<DocumentError />} /><SignaturePad value={values.firma} onChange={(signature) => update('firma', signature)} optional={false} /></div>, validation: { schema: servicioDocumentosFirmaSchema, getValues: () => ({ documentos: values.documentos, calidadTitular: values.calidadTitular, firma: values.firma }) } },
    { id: 'revision', title: 'Revisión', description: 'Verifica toda la información antes de enviar.', content: review },
  ]

  return (
    <PublicFormPage
      returnTo="/#solicitudes-servicio"
      eyebrow="Trámite digital"
      title="Constancia de Servicio Existente"
      description="Completa los siete pasos para solicitar una constancia que acredite la existencia del servicio."
      ariaLabel="Formulario público de constancia de servicio existente"
      maxWidth="xl"
    >
{result ? <FormSuccessResult className="mx-auto w-full !max-w-[760px] text-center [&_.form-success-result__actions]:justify-center" icon={<IconCircleCheckFilled size={42} />} title="Solicitud registrada correctamente" description="Guarda este código para consultar el avance del trámite." highlightLabel="Código de seguimiento" highlightValue={result.codigoSeguimiento} meta={[{ label: 'Estado', value: result.estado || 'PENDIENTE' }, { label: 'Fecha de ingreso', value: formatearFechaAsada(result.fechaIngreso) }]} actions={<><Link className="landing-lift-button landing-lift-button--solid group inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-sigasj-primary bg-sigasj-primary px-6 font-semibold text-white no-underline" to={`/solicitudes/seguimiento?codigo=${encodeURIComponent(result.codigoSeguimiento)}`}>Consultar seguimiento <IconArrowRight size={19} /></Link><button className="transparency-motion-button inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-6 font-semibold text-sigasj-primary-hover" type="button" onClick={handleNuevaSolicitud}>Realizar otra solicitud</button><Link className="transparency-motion-button inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-sigasj-border-strong bg-sigasj-surface px-6 font-semibold text-sigasj-primary-hover no-underline" to="/"><IconHome size={19} /> Volver al inicio</Link></>} /> : <>{submitError ? <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800" role="alert">{submitError}</p> : null}<FormWizard steps={steps} completeLabel="Enviar solicitud" onComplete={handleSubmit} confirmation={{ title: 'Confirmar solicitud', message: 'Confirma que los datos, documentos y firma son correctos antes de registrar la solicitud.' }} /></>}</PublicFormPage>
  )
}

const DocumentError = () => {
  return <FormWizardFieldError name="documentos" />
}

export default ServicioExistentePage
