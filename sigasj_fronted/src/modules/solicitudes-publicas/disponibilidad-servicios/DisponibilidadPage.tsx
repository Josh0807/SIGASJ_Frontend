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
  CEDULA_FISICA_MAX_LENGTH,
  TELEFONO_CR_MAX_LENGTH,
  limitarCedulaFisica,
  limitarTelefonoCr,
} from '../identificacionCostaRica'
import { usePersistedSolicitudResult } from '../usePersistedSolicitudResult'
import DisponibilidadDocumentUpload from './DisponibilidadDocumentUpload'
import type { DocumentoAdjunto } from './documentoAdjunto'
import {
  getDisponibilidadErrorMessage,
  registrarDisponibilidadServicios,
} from './disponibilidadApi'
import {
  disponibilidadDocumentosSchema,
  disponibilidadFirmaSchema,
  disponibilidadInmuebleSchema,
  disponibilidadNaturalezaCalidadSchema,
  disponibilidadNotificacionesSchema,
  disponibilidadPropositoSchema,
  disponibilidadProyectoSchema,
  disponibilidadSolicitanteSchema,
} from './disponibilidadSchemas'
import {
  CALIDADES_TITULAR,
  MEDIOS_NOTIFICACION,
  NATURALEZAS_INMUEBLE,
  PROPOSITOS,
  REQUISITOS_POR_PROPOSITO,
  TIPOS_PERSONA,
  type CalidadTitular,
  type DisponibilidadFormValues,
  type MedioNotificacion,
  type NaturalezaInmueble,
  type Proposito,
  type TipoPersona,
} from './types'

const initialValues: DisponibilidadFormValues = {
  tipoPersona: '',
  nombreFisica: '',
  primerApellidoFisica: '',
  segundoApellidoFisica: '',
  identificacionFisica: '',
  telefonoFisica: '',
  razonSocial: '',
  identificacionJuridica: '',
  nombreRepresentante: '',
  identificacionRepresentante: '',
  telefonoRepresentante: '',
  medioNotificacionPrincipal: '',
  valorNotificacionPrincipal: '',
  medioNotificacionSecundario: '',
  valorNotificacionSecundario: '',
  provincia: '',
  canton: '',
  distrito: '',
  direccionExacta: '',
  folioReal: '',
  planoCatastrado: '',
  planoAgrimensura: '',
  nis: '',
  naturalezaInmueble: '',
  calidadTitular: '',
  proposito: '',
  numeroDisponibilidadAnterior: '',
  descripcionProyecto: '',
  cantidadDormitorios: '',
  unidadesHabitacionales: '',
  areaConstruccion: '',
  niveles: '',
  caudalRequerido: '',
  autorizacionInspeccion: false,
  firma: '',
  documentos: [],
}

type TextFieldProps = {
  name: keyof DisponibilidadFormValues
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'tel' | 'email'
  maxLength?: number
  placeholder?: string
  hint?: string
  required?: boolean
  inputMode?: 'decimal' | 'numeric'
}

type UpdateFormValue = <Key extends keyof DisponibilidadFormValues>(
  key: Key,
  value: DisponibilidadFormValues[Key],
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
  inputMode,
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
        inputMode={inputMode}
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
  name: keyof DisponibilidadFormValues
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
  name: keyof DisponibilidadFormValues
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

const DocumentsAndAuthorizationFields = ({
  values,
  onDocumentosChange,
  update,
}: {
  values: DisponibilidadFormValues
  onDocumentosChange: (
    next:
      | DocumentoAdjunto[]
      | ((prev: DocumentoAdjunto[]) => DocumentoAdjunto[]),
  ) => void
  update: UpdateFormValue
}) => {
  const autorizacionField = useFormWizardField('autorizacionInspeccion')
  return (
    <div className="grid gap-7">
      {values.proposito === 'Estación de combustible' ? (
        <p className="m-0 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-950">
          Propósito <strong>Estación de combustible</strong>: se exige plano
          catastrado (archivo), poder/autorización e identificación. La ASADA
          podrá solicitar documentación especial adicional en revisión.
        </p>
      ) : null}
      <DisponibilidadDocumentUpload
        proposito={values.proposito}
        calidadTitular={values.calidadTitular}
        planoCatastrado={values.planoCatastrado}
        documentos={values.documentos}
        onChange={onDocumentosChange}
        error={<FormWizardFieldError name="documentos" />}
      />
      <fieldset className="m-0 rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_10px_28px_rgba(39,112,166,0.08)]">
        <legend className="px-2 text-base font-extrabold text-[#073b79]">
          Autorización de inspección
        </legend>
        <label className="mt-2 flex cursor-pointer items-start gap-3 text-sm font-medium leading-6 text-[#315d87]">
          <input
            className="mt-1 size-5 shrink-0 accent-[#1476cf]"
            type="checkbox"
            name="autorizacionInspeccion"
            checked={values.autorizacionInspeccion}
            onChange={(event) =>
              update('autorizacionInspeccion', event.target.checked)
            }
            aria-invalid={autorizacionField.inputProps['aria-invalid']}
            aria-describedby={autorizacionField.inputProps['aria-describedby']}
          />
          <span>
            Autorizo a la ASADA a realizar la inspección del inmueble o del
            proyecto relacionado con esta solicitud de disponibilidad de
            servicios, en el horario y condiciones que la Administración
            establezca.
          </span>
        </label>
        <FormWizardFieldError name="autorizacionInspeccion" />
        <p className="mb-0 mt-3 text-xs font-semibold text-[#607a98]">
          Debe indicar Sí o No (checkbox marcado = Sí). El Backend acepta ambos
          valores booleanos.
        </p>
      </fieldset>
    </div>
  )
}

const FirmaFields = ({
  values,
  update,
}: {
  values: DisponibilidadFormValues
  update: UpdateFormValue
}) => (
  <div className="grid gap-5">
    <p className="m-0 rounded-xl border border-sky-100 bg-sky-50/80 p-4 text-sm font-medium leading-6 text-[#3d5f82]">
      La firma del solicitante o propietario queda asociada a esta solicitud;
      la cadena Data URL nunca se muestra de forma directa en la revisión.
    </p>
    <SignaturePad
      value={values.firma}
      onChange={(value) => update('firma', value)}
      label="Firma del solicitante"
      optional
    />
    <FormWizardFieldError name="firma" />
  </div>
)

const DisponibilidadPage = () => {
  const [values, setValues] =
    useState<DisponibilidadFormValues>(initialValues)
  const [result, setResult] = usePersistedSolicitudResult('disponibilidad-servicios')
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
          identificacionJuridica: '',
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
          primerApellidoFisica: '',
          segundoApellidoFisica: '',
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
      setResult(await registrarDisponibilidadServicios(values))
    } catch (error) {
      setSubmitError(getDisponibilidadErrorMessage(error))
    }
  }

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

  const solicitanteStep = (
    <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">
      <SelectField
        name="tipoPersona"
        label="Tipo de persona del solicitante"
        value={values.tipoPersona}
        options={TIPOS_PERSONA}
        placeholder="Seleccione el tipo…"
        onChange={(value) => setTipoPersona(value as '' | TipoPersona)}
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
            name="primerApellidoFisica"
            label="Primer apellido"
            value={values.primerApellidoFisica}
            maxLength={100}
            onChange={(value) => update('primerApellidoFisica', value)}
          />
          <TextField
            name="segundoApellidoFisica"
            label="Segundo apellido"
            value={values.segundoApellidoFisica}
            maxLength={100}
            onChange={(value) => update('segundoApellidoFisica', value)}
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
            name="identificacionJuridica"
            label="Identificación jurídica"
            value={values.identificacionJuridica}
            maxLength={30}
            placeholder="Ej. 3-101-123456"
            hint="Se conservan guiones y ceros iniciales."
            onChange={(value) => update('identificacionJuridica', value)}
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
        name="folioReal"
        label="Folio real"
        value={values.folioReal}
        maxLength={50}
        required={false}
        hint="Opcional si el inmueble no está inscrito."
        onChange={(value) => update('folioReal', value)}
      />
      <TextField
        name="nis"
        label="NIS / número de servicio"
        value={values.nis}
        maxLength={50}
        required={false}
        hint="Opcional: la constancia puede solicitarse antes de existir servicio. Texto (guiones y letras permitidos)."
        onChange={(value) => update('nis', value)}
      />
      <TextField
        name="planoCatastrado"
        label="Código / referencia del plano catastrado"
        value={values.planoCatastrado}
        maxLength={50}
        required={false}
        hint="Referencia textual. El archivo del plano se adjunta en el paso de documentos. Debe indicar plano catastrado o de agrimensura."
        onChange={(value) => update('planoCatastrado', value)}
      />
      <TextField
        name="planoAgrimensura"
        label="Código / referencia del plano de agrimensura"
        value={values.planoAgrimensura}
        maxLength={50}
        required={false}
        hint="Obligatorio si no indica plano catastrado. El archivo se adjunta en documentos."
        onChange={(value) => update('planoAgrimensura', value)}
      />
    </div>
  )

  const naturalezaCalidadStep = (
    <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">
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
        hint="Si es Representante legal, se exigirá poder en documentos."
        onChange={(value) =>
          update('calidadTitular', value as '' | CalidadTitular)
        }
      />
      {values.naturalezaInmueble === 'Sin inscribir' ? (
        <aside
          className="col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 max-[680px]:col-span-1"
          aria-live="polite"
        >
          Para inmuebles sin inscribir, la ASADA podrá requerir declaración
          jurada y documentación del derecho de posesión (revisión
          administrativa). Adjunte lo aplicable en el paso de documentos.
        </aside>
      ) : null}
    </div>
  )

  const propositoStep = (
    <div className="grid gap-5">
      <SelectField
        name="proposito"
        label="Propósito de la solicitud"
        value={values.proposito}
        options={PROPOSITOS}
        placeholder="Seleccione el propósito…"
        hint="Únicas opciones confirmadas en el sistema (lista PDF oficial completa pendiente)."
        onChange={(value) => update('proposito', value as '' | Proposito)}
      />

      {values.proposito ? (
        <aside
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"
          aria-live="polite"
        >
          <strong className="block font-extrabold">
            Para este propósito se requiere:
          </strong>
          <ul className="mb-0 mt-2 list-disc pl-5">
            {REQUISITOS_POR_PROPOSITO[values.proposito].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      ) : null}

      <TextField
        name="numeroDisponibilidadAnterior"
        label="Número de disponibilidad anterior"
        value={values.numeroDisponibilidadAnterior}
        maxLength={50}
        required={false}
        hint="Opcional. La condición exacta de obligatoriedad por propósito no está confirmada en el formulario oficial digitalizado."
        onChange={(value) => update('numeroDisponibilidadAnterior', value)}
      />

      {values.proposito === 'Estación de combustible' &&
      !values.planoCatastrado.trim() ? (
        <TextField
          name="planoCatastrado"
          label="Código / referencia del plano catastrado"
          value={values.planoCatastrado}
          maxLength={50}
          hint="Requerido para Estación de combustible. También puede haberse indicado en el paso del inmueble."
          onChange={(value) => update('planoCatastrado', value)}
        />
      ) : null}
    </div>
  )

  const proyectoStep = (
    <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">
      <div className="col-span-2 max-[680px]:col-span-1">
        <TextAreaField
          name="descripcionProyecto"
          label="Descripción del proyecto"
          value={values.descripcionProyecto}
          maxLength={2000}
          hint="Obligatoria. Describa el proyecto con claridad (no se aceptan solo espacios)."
          onChange={(value) => update('descripcionProyecto', value)}
        />
      </div>
      <TextField
        name="cantidadDormitorios"
        label="Cantidad de dormitorios"
        value={values.cantidadDormitorios}
        required={false}
        inputMode="numeric"
        hint="Entero ≥ 0. Solo se envía si indica un valor."
        onChange={(value) => update('cantidadDormitorios', value)}
      />
      <TextField
        name="unidadesHabitacionales"
        label="Unidades habitacionales"
        value={values.unidadesHabitacionales}
        required={false}
        inputMode="numeric"
        hint="Concepto independiente de dormitorios. Entero ≥ 0."
        onChange={(value) => update('unidadesHabitacionales', value)}
      />
      <TextField
        name="areaConstruccion"
        label="Área de construcción"
        value={values.areaConstruccion}
        required={false}
        inputMode="decimal"
        hint="Número ≥ 0 con hasta 2 decimales. Unidad oficial no confirmada en documento."
        onChange={(value) => update('areaConstruccion', value)}
      />
      <TextField
        name="niveles"
        label="Niveles"
        value={values.niveles}
        required={false}
        inputMode="numeric"
        hint="Entero ≥ 0."
        onChange={(value) => update('niveles', value)}
      />
      <TextField
        name="caudalRequerido"
        label="Caudal requerido"
        value={values.caudalRequerido}
        required={false}
        inputMode="decimal"
        hint="Número ≥ 0 con hasta 4 decimales. Unidad oficial no confirmada."
        onChange={(value) => update('caudalRequerido', value)}
      />
    </div>
  )

  const documentosStep = (
    <DocumentsAndAuthorizationFields
      values={values}
      update={update}
      onDocumentosChange={onDocumentosChange}
    />
  )

  const firmaStep = <FirmaFields values={values} update={update} />

  const titularReviewItems =
    values.tipoPersona === 'Persona jurídica'
      ? [
          { label: 'Tipo de persona', value: values.tipoPersona },
          { label: 'Razón social', value: values.razonSocial },
          {
            label: 'Identificación jurídica',
            value: values.identificacionJuridica,
          },
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
          {
            label: 'Primer apellido',
            value: values.primerApellidoFisica,
          },
          {
            label: 'Segundo apellido',
            value: values.segundoApellidoFisica,
          },
          {
            label: 'Identificación',
            value: values.identificacionFisica,
          },
          { label: 'Teléfono', value: values.telefonoFisica },
        ]

  const proyectoReviewItems = [
    {
      label: 'Descripción del proyecto',
      value: values.descripcionProyecto,
    },
    ...(values.cantidadDormitorios.trim()
      ? [
          {
            label: 'Cantidad de dormitorios',
            value: values.cantidadDormitorios,
          },
        ]
      : []),
    ...(values.unidadesHabitacionales.trim()
      ? [
          {
            label: 'Unidades habitacionales',
            value: values.unidadesHabitacionales,
          },
        ]
      : []),
    ...(values.areaConstruccion.trim()
      ? [{ label: 'Área de construcción', value: values.areaConstruccion }]
      : []),
    ...(values.niveles.trim()
      ? [{ label: 'Niveles', value: values.niveles }]
      : []),
    ...(values.caudalRequerido.trim()
      ? [{ label: 'Caudal requerido', value: values.caudalRequerido }]
      : []),
  ]

  const reviewStep = (
    <FormReview
      sections={[
        {
          id: 'solicitante',
          title: 'Solicitante',
          stepIndex: 0,
          items: [
            ...titularReviewItems,
            {
              label: 'Fecha de solicitud',
              value: formatearFechaAsada(requestDate),
            },
          ],
        },
        {
          id: 'notificaciones',
          title: 'Notificaciones',
          stepIndex: 1,
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
          id: 'inmueble',
          title: 'Inmueble',
          stepIndex: 2,
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
              label: 'Plano catastrado (referencia)',
              value: values.planoCatastrado || 'No indicado',
            },
            {
              label: 'Plano de agrimensura (referencia)',
              value: values.planoAgrimensura || 'No indicado',
            },
            { label: 'NIS', value: values.nis || 'No indicado' },
          ],
        },
        {
          id: 'naturaleza-calidad',
          title: 'Naturaleza y calidad',
          stepIndex: 3,
          items: [
            {
              label: 'Naturaleza del inmueble',
              value: values.naturalezaInmueble,
            },
            { label: 'Calidad del titular', value: values.calidadTitular },
          ],
        },
        {
          id: 'proposito',
          title: 'Propósito',
          stepIndex: 4,
          items: [
            { label: 'Propósito', value: values.proposito },
            ...(values.numeroDisponibilidadAnterior.trim()
              ? [
                  {
                    label: 'Número de disponibilidad anterior',
                    value: values.numeroDisponibilidadAnterior,
                  },
                ]
              : []),
          ],
        },
        {
          id: 'proyecto',
          title: 'Proyecto',
          stepIndex: 5,
          items: proyectoReviewItems,
        },
        {
          id: 'autorizacion',
          title: 'Autorización',
          stepIndex: 6,
          items: [
            {
              label: 'Autorización de inspección',
              value: values.autorizacionInspeccion ? 'Sí' : 'No',
            },
          ],
        },
        {
          id: 'firma',
          title: 'Firma',
          stepIndex: 7,
          items: [
            {
              label: 'Firma del solicitante',
              value: values.firma
                ? 'Firma registrada'
                : 'Firma pendiente',
            },
          ],
        },
      ]}
      documentsStepIndex={6}
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
      id: 'solicitante',
      title: 'Datos del solicitante',
      description:
        'Indica el tipo de persona y los datos oficiales del solicitante.',
      content: solicitanteStep,
      validation: {
        schema: disponibilidadSolicitanteSchema,
        getValues: () => values,
      },
    },
    {
      id: 'notificaciones',
      title: 'Medios de notificación',
      description: 'Elige cómo desea recibir las comunicaciones de la ASADA.',
      content: notificacionesStep,
      validation: {
        schema: disponibilidadNotificacionesSchema,
        getValues: () => values,
      },
    },
    {
      id: 'inmueble',
      title: 'Datos del inmueble',
      description:
        'Ubicación, dirección exacta, folio, NIS y referencias de planos.',
      content: inmuebleStep,
      validation: {
        schema: disponibilidadInmuebleSchema,
        getValues: () => values,
      },
    },
    {
      id: 'naturaleza-calidad',
      title: 'Naturaleza y calidad',
      description: 'Naturaleza del inmueble y calidad del titular.',
      content: naturalezaCalidadStep,
      validation: {
        schema: disponibilidadNaturalezaCalidadSchema,
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
        schema: disponibilidadPropositoSchema,
        getValues: () => values,
      },
    },
    {
      id: 'proyecto',
      title: 'Información del proyecto',
      description:
        'Describe el proyecto. Los campos numéricos son opcionales salvo la descripción.',
      content: proyectoStep,
      validation: {
        schema: disponibilidadProyectoSchema,
        getValues: () => values,
      },
    },
    {
      id: 'documentos',
      title: 'Documentos y autorización',
      description:
        'Adjunta la documentación requerida y confirma la autorización de inspección.',
      content: documentosStep,
      validation: {
        schema: disponibilidadDocumentosSchema,
        getValues: () => ({
          proposito: values.proposito,
          calidadTitular: values.calidadTitular,
          planoCatastrado: values.planoCatastrado,
          documentos: values.documentos,
          autorizacionInspeccion: values.autorizacionInspeccion,
        }),
      },
    },
    {
      id: 'firma',
      title: 'Firma',
      description: 'Agrega la firma del solicitante si corresponde.',
      content: firmaStep,
      validation: {
        schema: disponibilidadFirmaSchema,
        getValues: () => ({ firma: values.firma }),
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
        aria-label="Formulario público de constancia de disponibilidad de servicios"
      >
        <div className="mx-auto w-full max-w-[1050px]">
          <header className="mx-auto mb-10 max-w-[920px] text-center">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.25em] text-[#1476cf]">
              Trámite digital
            </p>
            <h1 className="m-0 text-[clamp(2rem,5vw,3.2rem)] font-extrabold leading-tight tracking-[-0.04em] text-[#092e67]">
              Constancia de Disponibilidad de Servicios
            </h1>
            <p className="mb-0 mt-4 leading-7 text-[#526d8c]">
              Completa los nueve pasos para solicitar la constancia ante la
              ASADA. Los campos se muestran u ocultan según las reglas oficiales
              confirmadas.
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
                  title: 'Confirmar solicitud de disponibilidad',
                  message:
                    'Confirma que los datos, el propósito, el proyecto, los documentos y la autorización son correctos antes de registrar la solicitud.',
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

export default DisponibilidadPage
