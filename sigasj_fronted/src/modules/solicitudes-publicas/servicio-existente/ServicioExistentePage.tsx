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
  const common = { name, value, maxLength, placeholder, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(event.target.value), className: 'min-h-12 w-full rounded-xl border border-sky-200 bg-white px-4 py-3 font-medium text-slate-800 outline-none focus:border-sky-500 focus:ring-3 focus:ring-sky-200', ...field.inputProps }
  return <label className="grid min-w-0 gap-2 font-bold text-[#173f6e]">{label} {optional ? <span className="font-medium text-[#607a98]">(opcional)</span> : <span className="sr-only">obligatorio</span>}{multiline ? <textarea {...common} rows={4} /> : <input {...common} type={type} />}<FormWizardFieldError name={name} /></label>
}

const Select = ({ name, label, value, options, update, optional = false }: {
  name: keyof ServicioExistenteFormValues; label: string; value: string; options: readonly string[]; update: (value: string) => void; optional?: boolean
}) => {
  const field = useFormWizardField(name)
  return <label className="grid min-w-0 gap-2 font-bold text-[#173f6e]">{label} {optional ? <span className="font-medium text-[#607a98]">(opcional)</span> : <span className="sr-only">obligatorio</span>}<select className="min-h-12 w-full rounded-xl border border-sky-200 bg-white px-4 font-medium text-slate-800 outline-none focus:border-sky-500 focus:ring-3 focus:ring-sky-200" name={name} value={value} onChange={(event) => update(event.target.value)} {...field.inputProps}><option value="">Seleccione una opción…</option>{options.map((option) => <option key={option}>{option}</option>)}</select><FormWizardFieldError name={name} /></label>
}

const ServicioExistentePage = () => {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = usePersistedSolicitudResult('servicio-existente')
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

  const field = (name: keyof ServicioExistenteFormValues, label: string, options: Partial<React.ComponentProps<typeof Field>> = {}) => <Field name={name} label={label} value={String(values[name])} update={(value) => update(name, value as never)} {...options} />
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
    { id: 'servicio-solicitante', title: 'Servicio y solicitante', description: 'Datos del servicio, propietario y persona solicitante.', content: <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">{select('tipoServicio', 'Tipo de servicio', TIPOS_SERVICIO)}{field('nis', 'NIS', { maxLength: 50 })}{field('propietarioInmueble', 'Propietario del inmueble')}{field('nombreSolicitante', 'Nombre completo del solicitante')}{field('identificacionSolicitante', 'Número de identificación', { maxLength: 30 })}{field('correoElectronico', 'Correo electrónico', { type: 'email' })}{field('telefono', 'Teléfono', { type: 'tel', maxLength: 30 })}</div>, validation: { schema: servicioSolicitanteSchema, getValues: () => values } },
    { id: 'inmueble', title: 'Datos del inmueble', description: 'Condición del inmueble y referencias registrales.', content: <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">{select('naturalezaInmueble', 'Naturaleza del inmueble', NATURALEZAS_INMUEBLE)}{select('calidadTitular', 'Calidad del titular', CALIDADES_TITULAR)}{field('folioReal', 'Folio real', { optional: true, maxLength: 50 })}{field('planoCatastrado', 'Plano catastrado', { optional: true, maxLength: 50 })}{field('planoAgrimensura', 'Plano de agrimensura', { optional: true, maxLength: 50 })}</div>, validation: { schema: servicioInmuebleSchema, getValues: () => values } },
    { id: 'ubicacion', title: 'Ubicación', description: 'Localización exacta de la propiedad.', content: <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">{field('provincia', 'Provincia', { maxLength: 80 })}{field('canton', 'Cantón', { maxLength: 80 })}{field('distrito', 'Distrito', { maxLength: 80 })}<div className="col-span-2 max-[680px]:col-span-1">{field('direccionExacta', 'Dirección exacta', { multiline: true, maxLength: 500 })}</div></div>, validation: { schema: servicioUbicacionSchema, getValues: () => values } },
    { id: 'motivo', title: 'Motivo y trámite', description: 'Indica para qué se requiere la constancia y el trámite específico.', content: <div className="grid gap-5">{select('motivo', 'Motivo de la constancia', MOTIVOS)}{values.motivo === 'Otro' ? field('otroMotivo', 'Especifique el motivo', { maxLength: 300 }) : null}{field('tramitePorRealizar', 'Trámite por realizar', { multiline: true, maxLength: 1000, placeholder: 'Ej.: tipo de remodelación, construcción o trámite bancario…' })}</div>, validation: { schema: servicioMotivoSchema, getValues: () => values } },
    { id: 'notificaciones', title: 'Notificaciones', description: 'Selecciona un medio principal y, si deseas, uno secundario diferente.', content: <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">{select('medioNotificacionPrincipal', 'Medio principal', MEDIOS_NOTIFICACION)}{select('medioNotificacionSecundario', 'Medio secundario', MEDIOS_NOTIFICACION, true)}</div>, validation: { schema: servicioNotificacionesSchema, getValues: () => values } },
    { id: 'documentos-firma', title: 'Documentos y firma', description: 'Adjunta los documentos aplicables y firma la solicitud.', content: <div className="grid gap-7"><ServicioExistenteDocumentUpload calidadTitular={values.calidadTitular} documentos={values.documentos} onChange={onDocumentsChange} error={<DocumentError />} /><SignaturePad value={values.firma} onChange={(signature) => update('firma', signature)} optional={false} /></div>, validation: { schema: servicioDocumentosFirmaSchema, getValues: () => ({ documentos: values.documentos, calidadTitular: values.calidadTitular, firma: values.firma }) } },
    { id: 'revision', title: 'Revisión', description: 'Verifica toda la información antes de enviar.', content: review },
  ]

  return <><PublicReceiptNavbar returnTo="/#solicitudes-servicio" /><main className="min-h-[65vh] bg-[linear-gradient(135deg,#fbfdff_0%,#edf8ff_55%,#e4f5ff_100%)] px-6 py-12 max-[640px]:px-4 max-[640px]:py-8" aria-label="Formulario público de constancia de servicio existente"><div className="mx-auto w-full max-w-[1050px]"><header className="mx-auto mb-10 max-w-[850px] text-center"><p className="mb-2 text-xs font-extrabold uppercase tracking-[0.25em] text-[#1476cf]">Trámite digital</p><h1 className="m-0 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-tight tracking-[-0.04em] text-[#092e67]">Constancia de Servicio Existente</h1><p className="mb-0 mt-4 leading-7 text-[#526d8c]">Completa los siete pasos para solicitar una constancia que acredite la existencia del servicio.</p></header>{result ? <FormSuccessResult className="mx-auto w-full !max-w-[760px] text-center [&_.form-success-result__actions]:justify-center" icon={<IconCircleCheckFilled size={42} />} title="Solicitud registrada correctamente" description="Guarda este código para consultar el avance del trámite." highlightLabel="Código de seguimiento" highlightValue={result.codigoSeguimiento} meta={[{ label: 'Estado', value: result.estado || 'PENDIENTE' }, { label: 'Fecha de ingreso', value: formatearFechaAsada(result.fechaIngreso) }]} actions={<><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1476cf] px-6 font-extrabold text-white no-underline" to={`/solicitudes/seguimiento?codigo=${encodeURIComponent(result.codigoSeguimiento)}`}>Consultar seguimiento <IconArrowRight size={19} /></Link><Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#1476cf] px-6 font-extrabold text-[#0b65b5] no-underline" to="/"><IconHome size={19} /> Volver al inicio</Link></>} /> : <>{submitError ? <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-800" role="alert">{submitError}</p> : null}<FormWizard steps={steps} completeLabel="Enviar solicitud" onComplete={handleSubmit} confirmation={{ title: 'Confirmar solicitud', message: 'Confirma que los datos, documentos y firma son correctos antes de registrar la solicitud.' }} /></>}</div></main><Footer /></>
}

const DocumentError = () => {
  return <FormWizardFieldError name="documentos" />
}

export default ServicioExistentePage
