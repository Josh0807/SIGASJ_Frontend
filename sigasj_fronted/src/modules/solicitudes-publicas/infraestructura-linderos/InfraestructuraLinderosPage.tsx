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
import InfraestructuraDocumentUpload from './InfraestructuraDocumentUpload'
import type { DocumentoAdjunto } from './documentoAdjunto'
import SignaturePad from '../arreglo-pago/SignaturePad'
import {
  CEDULA_FISICA_MAX_LENGTH,
  TELEFONO_CR_MAX_LENGTH,
  limitarCedulaFisica,
  limitarTelefonoCr,
} from '../identificacionCostaRica'
import { usePersistedSolicitudResult } from '../usePersistedSolicitudResult'
import {
  getInfraestructuraLinderosErrorMessage,
  registrarInfraestructuraLinderos,
} from './infraestructuraLinderosApi'
import {
  infraestructuraDocumentosSchema,
  infraestructuraInmuebleSchema,
  infraestructuraNotificacionesSchema,
  infraestructuraPropositoSchema,
  infraestructuraServicioTitularSchema,
} from './infraestructuraLinderosSchemas'
import {
  CALIDADES_TITULAR,
  MEDIOS_NOTIFICACION,
  PROPOSITOS,
  TIPOS_PERSONA,
  type CalidadTitular,
  type InfraestructuraLinderosFormValues,
  type MedioNotificacion,
  type Proposito,
  type TipoPersona,
} from './types'

const initialValues: InfraestructuraLinderosFormValues = {
  nis: '',
  tipoPersona: '',
  nombreFisica: '',
  apellidosFisica: '',
  identificacionFisica: '',
  telefonoFisica: '',
  razonSocial: '',
  cedulaJuridica: '',
  nombreRepresentante: '',
  identificacionRepresentante: '',
  telefonoRepresentante: '',
  calidadTitular: '',
  provincia: '',
  canton: '',
  distrito: '',
  direccionExacta: '',
  folioReal: '',
  planoCatastrado: '',
  planoAgrimensura: '',
  proposito: '',
  medioNotificacionPrincipal: '',
  valorNotificacionPrincipal: '',
  medioNotificacionSecundario: '',
  valorNotificacionSecundario: '',
  firma: '',
  documentos: [],
}

type TextFieldProps = {
  name: keyof InfraestructuraLinderosFormValues
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'tel' | 'email'
  maxLength?: number
  placeholder?: string
  hint?: string
  required?: boolean
}

type UpdateFormValue = <Key extends keyof InfraestructuraLinderosFormValues>(
  key: Key,
  value: InfraestructuraLinderosFormValues[Key],
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
        <>
          <span className="text-rose-600" aria-hidden="true">
            *
          </span>
          <span className="sr-only">obligatorio</span>
        </>
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

const TextAreaField = ({
  name,
  label,
  value,
  onChange,
  maxLength,
  required = true,
  hint,
}: {
  name: keyof InfraestructuraLinderosFormValues
  label: string
  value: string
  onChange: (value: string) => void
  maxLength?: number
  required?: boolean
  hint?: string
}) => {
  const field = useFormWizardField(name)
  return (
    <label className="grid min-w-0 gap-2 font-bold text-[#173f6e]">
      {label}{' '}
      {required ? (
        <>
          <span className="text-rose-600" aria-hidden="true">
            *
          </span>
          <span className="sr-only">obligatorio</span>
        </>
      ) : (
        <span className="font-medium text-[#607a98]">(opcional)</span>
      )}
      {hint ? (
        <span className="text-sm font-medium text-[#607a98]">{hint}</span>
      ) : null}
      <textarea
        className="min-h-28 w-full rounded-xl border border-sky-200 bg-white px-4 py-3 font-medium text-slate-800 outline-none transition focus:border-sky-500 focus:ring-3 focus:ring-sky-200"
        name={name}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        {...field.inputProps}
      />
      <FormWizardFieldError name={name} />
    </label>
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
  name: keyof InfraestructuraLinderosFormValues
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
        <>
          <span className="text-rose-600" aria-hidden="true">
            *
          </span>
          <span className="sr-only">obligatorio</span>
        </>
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

const valorLabelForMedio = (medio: '' | MedioNotificacion) => {
  if (medio === 'Correo electrónico') return 'Correo electrónico de notificación'
  if (medio === 'Teléfono') return 'Teléfono de notificación'
  if (medio === 'Dirección') return 'Dirección de notificación'
  return 'Destino de la notificación'
}

const valorTypeForMedio = (
  medio: '' | MedioNotificacion,
): 'text' | 'tel' | 'email' => {
  if (medio === 'Correo electrónico') return 'email'
  if (medio === 'Teléfono') return 'tel'
  return 'text'
}

const DocumentsAndSignatureFields = ({
  values,
  onDocumentosChange,
  update,
}: {
  values: InfraestructuraLinderosFormValues
  onDocumentosChange: (
    next:
      | DocumentoAdjunto[]
      | ((prev: DocumentoAdjunto[]) => DocumentoAdjunto[]),
  ) => void
  update: UpdateFormValue
}) => (
  <div className="grid gap-7">
    {values.proposito === 'Reunión de fincas' ? (
      <p className="m-0 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-950">
        Propósito seleccionado: <strong>Reunión de fincas</strong>. Debe cargar
        también el plano de agrimensura (archivo) además de la referencia
        textual.
      </p>
    ) : null}
    <InfraestructuraDocumentUpload
      proposito={values.proposito}
      documentos={values.documentos}
      onChange={onDocumentosChange}
      error={<FormWizardFieldError name="documentos" />}
    />
    <SignaturePad
      value={values.firma}
      onChange={(value) => update('firma', value)}
    />
  </div>
)

const InfraestructuraLinderosPage = () => {
  const [values, setValues] =
    useState<InfraestructuraLinderosFormValues>(initialValues)
  const [result, setResult] = usePersistedSolicitudResult('infraestructura-linderos')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const requestDate = useMemo(() => hoyEnAsada(), [])

  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [result])

  const update: UpdateFormValue = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const setTipoPersona = (tipo: '' | TipoPersona) => {
    setValues((current) => {
      if (tipo === current.tipoPersona) return { ...current, tipoPersona: tipo }
      if (tipo === 'Persona física') {
        return {
          ...current,
          tipoPersona: tipo,
          razonSocial: '',
          cedulaJuridica: '',
          nombreRepresentante: '',
          identificacionRepresentante: '',
          telefonoRepresentante: '',
        }
      }
      if (tipo === 'Persona jurídica') {
        return {
          ...current,
          tipoPersona: tipo,
          nombreFisica: '',
          apellidosFisica: '',
          identificacionFisica: '',
          telefonoFisica: '',
        }
      }
      return { ...current, tipoPersona: tipo }
    })
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    try {
      setResult(await registrarInfraestructuraLinderos(values))
    } catch (error) {
      setSubmitError(getInfraestructuraLinderosErrorMessage(error))
    }
  }

  const titularStep = (
    <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">
      <TextField
        name="nis"
        label="NIS / número de servicio"
        value={values.nis}
        maxLength={50}
        hint="Identificador textual del servicio (admite guiones y letras)."
        onChange={(value) => update('nis', value)}
      />
      <SelectField
        name="tipoPersona"
        label="Tipo de persona del propietario"
        value={values.tipoPersona}
        options={TIPOS_PERSONA}
        placeholder="Seleccione el tipo…"
        onChange={(value) => setTipoPersona(value as '' | TipoPersona)}
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
      <label className="grid gap-2 font-bold text-[#173f6e]">
        Fecha de solicitud
        <input
          className="min-h-12 rounded-xl border border-sky-100 bg-slate-50 px-4 font-semibold text-slate-600"
          value={formatearFechaAsada(requestDate)}
          readOnly
          aria-readonly="true"
        />
      </label>

      {values.tipoPersona === 'Persona física' ? (
        <>
          <TextField
            name="nombreFisica"
            label="Nombre"
            value={values.nombreFisica}
            maxLength={100}
            onChange={(value) => update('nombreFisica', value)}
          />
          <TextField
            name="apellidosFisica"
            label="Apellidos"
            value={values.apellidosFisica}
            maxLength={100}
            onChange={(value) => update('apellidosFisica', value)}
          />
          <TextField
            name="identificacionFisica"
            label="Identificación"
            value={values.identificacionFisica}
            maxLength={CEDULA_FISICA_MAX_LENGTH}
            placeholder="Ej. 1-1234-0567"
            hint="Cédula física: máximo 9 dígitos."
            onChange={(value) =>
              update('identificacionFisica', limitarCedulaFisica(value))
            }
          />
          <TextField
            name="telefonoFisica"
            label="Teléfono"
            type="tel"
            value={values.telefonoFisica}
            maxLength={TELEFONO_CR_MAX_LENGTH}
            placeholder="Ej. 8888-1234"
            hint="Exactamente 8 dígitos."
            onChange={(value) =>
              update('telefonoFisica', limitarTelefonoCr(value))
            }
          />
        </>
      ) : null}

      {values.tipoPersona === 'Persona jurídica' ? (
        <>
          <TextField
            name="razonSocial"
            label="Razón social"
            value={values.razonSocial}
            maxLength={200}
            onChange={(value) => update('razonSocial', value)}
          />
          <TextField
            name="cedulaJuridica"
            label="Cédula jurídica"
            value={values.cedulaJuridica}
            maxLength={30}
            placeholder="Ej. 3-101-123456"
            onChange={(value) => update('cedulaJuridica', value)}
          />
          <TextField
            name="nombreRepresentante"
            label="Nombre del representante legal"
            value={values.nombreRepresentante}
            maxLength={150}
            onChange={(value) => update('nombreRepresentante', value)}
          />
          <TextField
            name="identificacionRepresentante"
            label="Identificación del representante"
            value={values.identificacionRepresentante}
            maxLength={CEDULA_FISICA_MAX_LENGTH}
            placeholder="Ej. 1-1234-0567"
            hint="Cédula física: máximo 9 dígitos."
            onChange={(value) =>
              update('identificacionRepresentante', limitarCedulaFisica(value))
            }
          />
          <TextField
            name="telefonoRepresentante"
            label="Teléfono del representante"
            type="tel"
            value={values.telefonoRepresentante}
            maxLength={TELEFONO_CR_MAX_LENGTH}
            placeholder="Ej. 8888-1234"
            hint="Exactamente 8 dígitos."
            onChange={(value) =>
              update('telefonoRepresentante', limitarTelefonoCr(value))
            }
          />
        </>
      ) : null}
    </div>
  )

  const inmuebleStep = (
    <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">
      <p className="col-span-2 m-0 rounded-xl border border-sky-100 bg-sky-50/80 p-4 text-sm font-medium leading-6 text-[#3d5f82] max-[680px]:col-span-1">
        Provincia, cantón y distrito se capturan como texto libre (sin catálogo
        geográfico en SIGASJ). Verifique que la combinación sea correcta.
      </p>
      <TextField
        name="provincia"
        label="Provincia"
        value={values.provincia}
        maxLength={80}
        onChange={(value) => update('provincia', value)}
      />
      <TextField
        name="canton"
        label="Cantón"
        value={values.canton}
        maxLength={80}
        onChange={(value) => update('canton', value)}
      />
      <TextField
        name="distrito"
        label="Distrito"
        value={values.distrito}
        maxLength={80}
        onChange={(value) => update('distrito', value)}
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
      <div className="col-span-2 max-[680px]:col-span-1">
        <TextAreaField
          name="direccionExacta"
          label="Dirección exacta"
          value={values.direccionExacta}
          maxLength={500}
          onChange={(value) => update('direccionExacta', value)}
        />
      </div>
      <TextField
        name="planoCatastrado"
        label="Código / referencia del plano catastrado"
        value={values.planoCatastrado}
        maxLength={50}
        hint="Referencia textual. El archivo del plano se adjunta en el paso de documentos."
        onChange={(value) => update('planoCatastrado', value)}
      />
      <TextField
        name="planoAgrimensura"
        label="Código / referencia del plano de agrimensura"
        value={values.planoAgrimensura}
        maxLength={50}
        required={false}
        hint="Obligatorio si el propósito es Reunión de fincas (siguiente paso)."
        onChange={(value) => update('planoAgrimensura', value)}
      />
    </div>
  )

  const propositoStep = (
    <div className="grid gap-5">
      <SelectField
        name="proposito"
        label="Propósito de la constancia"
        value={values.proposito}
        options={PROPOSITOS}
        placeholder="Seleccione el propósito…"
        hint="Únicas opciones confirmadas en el sistema. El catálogo completo ASADA se ampliará cuando esté el formulario oficial."
        onChange={(value) => update('proposito', value as '' | Proposito)}
      />

      {values.proposito ? (
        <aside
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"
          aria-live="polite"
        >
          <strong className="block font-extrabold">
            Para este propósito debe adjuntar:
          </strong>
          <ul className="mb-0 mt-2 list-disc pl-5">
            <li>Documento de identificación (siempre)</li>
            <li>Plano catastrado (siempre)</li>
            {values.proposito === 'Reunión de fincas' ? (
              <li>
                Plano de agrimensura con sello del CFIA cuando aplique
                (condicional)
              </li>
            ) : null}
            <li>
              Poder, autorización o aval autenticado (si quien solicita no es el
              propietario registral)
            </li>
          </ul>
        </aside>
      ) : null}

      {values.proposito === 'Reunión de fincas' ? (
        <TextField
          name="planoAgrimensura"
          label="Código / referencia del plano de agrimensura"
          value={values.planoAgrimensura}
          maxLength={50}
          hint="Requerido para Reunión de fincas. También puede haberse indicado en el paso del inmueble."
          onChange={(value) => update('planoAgrimensura', value)}
        />
      ) : null}
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
        onChange={(value) => {
          update(
            'medioNotificacionPrincipal',
            value as '' | MedioNotificacion,
          )
          update('valorNotificacionPrincipal', '')
        }}
      />
      {values.medioNotificacionPrincipal === 'Dirección' ? (
        <div className="col-span-2 max-[680px]:col-span-1">
          <TextAreaField
            name="valorNotificacionPrincipal"
            label={valorLabelForMedio(values.medioNotificacionPrincipal)}
            value={values.valorNotificacionPrincipal}
            maxLength={200}
            required={false}
            onChange={(value) => update('valorNotificacionPrincipal', value)}
          />
        </div>
      ) : (
        <TextField
          name="valorNotificacionPrincipal"
          label={valorLabelForMedio(values.medioNotificacionPrincipal)}
          type={valorTypeForMedio(values.medioNotificacionPrincipal)}
          value={values.valorNotificacionPrincipal}
          maxLength={200}
          required={false}
          onChange={(value) => update('valorNotificacionPrincipal', value)}
        />
      )}
      <SelectField
        name="medioNotificacionSecundario"
        label="Medio de notificación secundario"
        value={values.medioNotificacionSecundario}
        options={MEDIOS_NOTIFICACION}
        placeholder="Ninguno (opcional)"
        required={false}
        onChange={(value) => {
          update(
            'medioNotificacionSecundario',
            value as '' | MedioNotificacion,
          )
          update('valorNotificacionSecundario', '')
        }}
      />
      {values.medioNotificacionSecundario ? (
        values.medioNotificacionSecundario === 'Dirección' ? (
          <div className="col-span-2 max-[680px]:col-span-1">
            <TextAreaField
              name="valorNotificacionSecundario"
              label={valorLabelForMedio(values.medioNotificacionSecundario)}
              value={values.valorNotificacionSecundario}
              maxLength={200}
              required={false}
              onChange={(value) =>
                update('valorNotificacionSecundario', value)
              }
            />
          </div>
        ) : (
          <TextField
            name="valorNotificacionSecundario"
            label={valorLabelForMedio(values.medioNotificacionSecundario)}
            type={valorTypeForMedio(values.medioNotificacionSecundario)}
            value={values.valorNotificacionSecundario}
            maxLength={200}
            required={false}
            onChange={(value) => update('valorNotificacionSecundario', value)}
          />
        )
      ) : null}
    </div>
  )

  const onDocumentosChange = (
    next:
      | DocumentoAdjunto[]
      | ((prev: DocumentoAdjunto[]) => DocumentoAdjunto[]),
  ) => {
    setValues((current) => ({
      ...current,
      documentos:
        typeof next === 'function' ? next(current.documentos) : next,
    }))
  }

  const documentosStep = (
    <DocumentsAndSignatureFields
      values={values}
      update={update}
      onDocumentosChange={onDocumentosChange}
    />
  )

  const titularReviewItems =
    values.tipoPersona === 'Persona jurídica'
      ? [
          { label: 'Tipo de persona', value: values.tipoPersona },
          { label: 'Razón social', value: values.razonSocial },
          { label: 'Cédula jurídica', value: values.cedulaJuridica },
          {
            label: 'Representante legal',
            value: values.nombreRepresentante,
          },
          {
            label: 'Identificación del representante',
            value: values.identificacionRepresentante,
          },
          {
            label: 'Teléfono del representante',
            value: values.telefonoRepresentante,
          },
        ]
      : [
          { label: 'Tipo de persona', value: values.tipoPersona },
          { label: 'Nombre', value: values.nombreFisica },
          { label: 'Apellidos', value: values.apellidosFisica },
          {
            label: 'Identificación',
            value: values.identificacionFisica,
          },
          { label: 'Teléfono', value: values.telefonoFisica },
        ]

  const reviewStep = (
    <FormReview
      sections={[
        {
          id: 'servicio-titular',
          title: 'Servicio y titular',
          stepIndex: 0,
          items: [
            { label: 'NIS / número de servicio', value: values.nis },
            { label: 'Calidad del titular', value: values.calidadTitular },
            ...titularReviewItems,
            {
              label: 'Fecha de solicitud',
              value: formatearFechaAsada(requestDate),
            },
          ],
        },
        {
          id: 'inmueble',
          title: 'Inmueble',
          stepIndex: 1,
          items: [
            { label: 'Provincia', value: values.provincia },
            { label: 'Cantón', value: values.canton },
            { label: 'Distrito', value: values.distrito },
            { label: 'Dirección exacta', value: values.direccionExacta },
            {
              label: 'Folio real',
              value: values.folioReal || 'No indicado',
            },
            {
              label: 'Plano catastrado',
              value: values.planoCatastrado,
            },
            {
              label: 'Plano de agrimensura',
              value: values.planoAgrimensura || 'No indicado',
            },
          ],
        },
        {
          id: 'proposito',
          title: 'Propósito',
          stepIndex: 2,
          items: [{ label: 'Propósito', value: values.proposito }],
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
              label: 'Destino principal',
              value: values.valorNotificacionPrincipal || 'No indicado',
            },
            {
              label: 'Medio secundario',
              value: values.medioNotificacionSecundario || 'No indicado',
            },
            {
              label: 'Destino secundario',
              value: values.valorNotificacionSecundario || 'No indicado',
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
                : 'Firma pendiente',
            },
          ],
        },
      ]}
      documentsStepIndex={4}
      documents={values.documentos
        .filter((doc) => doc.estado === 'cargado')
        .map((doc) => ({
          id: String(doc.id ?? doc.localId),
          name: `${doc.nombreOriginal} (${doc.tipoDocumento})`,
          size: doc.tamanio,
          type: doc.tipoArchivo || 'Archivo',
        }))}
    />
  )

  const steps = [
    {
      id: 'servicio-titular',
      title: 'Datos del servicio y titular',
      description:
        'Indica el NIS y los datos del propietario según el tipo de persona.',
      content: titularStep,
      validation: {
        schema: infraestructuraServicioTitularSchema,
        getValues: () => values,
      },
    },
    {
      id: 'inmueble',
      title: 'Datos del inmueble',
      description:
        'Ubicación, dirección exacta, folio y referencias de planos.',
      content: inmuebleStep,
      validation: {
        schema: infraestructuraInmuebleSchema,
        getValues: () => values,
      },
    },
    {
      id: 'proposito',
      title: 'Propósito',
      description:
        'Selecciona el propósito. Los requisitos documentales se actualizan según tu elección.',
      content: propositoStep,
      validation: {
        schema: infraestructuraPropositoSchema,
        getValues: () => values,
      },
    },
    {
      id: 'notificaciones',
      title: 'Notificaciones',
      description: 'Elige cómo desea recibir las comunicaciones de la ASADA.',
      content: notificacionesStep,
      validation: {
        schema: infraestructuraNotificacionesSchema,
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
        schema: infraestructuraDocumentosSchema,
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
        aria-label="Formulario público de constancia de infraestructura frente a linderos"
      >
        <div className="mx-auto w-full max-w-[1050px]">
          <header className="mx-auto mb-10 max-w-[920px] text-center">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.25em] text-[#1476cf]">
              Trámite digital
            </p>
            <h1 className="m-0 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-tight tracking-[-0.04em] text-[#092e67]">
              Constancia de Infraestructura Frente a Linderos de un Inmueble
            </h1>
            <p className="mb-0 mt-4 leading-7 text-[#526d8c]">
              Completa todos los pasos para solicitar la constancia ante la
              ASADA.
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
                    to={`/solicitudes/seguimiento?codigo=${encodeURIComponent(result.codigoSeguimiento)}`}
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
                  title: 'Confirmar constancia de infraestructura',
                  message:
                    'Confirma que los datos, los documentos y el propósito son correctos antes de registrar la solicitud.',
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

export default InfraestructuraLinderosPage
