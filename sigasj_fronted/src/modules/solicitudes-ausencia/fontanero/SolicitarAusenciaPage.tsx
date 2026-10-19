import {
  IconArrowLeft,
  IconCalendarEvent,
  IconClipboardList,
  IconDeviceFloppy,
  IconMail,
  IconMessage2,
  IconTag,
  IconUser,
} from '@tabler/icons-react'
import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { useAuth } from '../../auth/components/AuthContext'
import { resolveAuthUserDisplayName } from '../../auth/utils/authUserDisplay'
import {
  esNoAutenticado,
  getHttpStatus,
} from '../../recursos-humanos/colaboradorForm'
import { crearMiSolicitudAusencia } from '../solicitudesAusenciaApi'
import {
  FONTANERO_MIS_SOLICITUDES_PATH,
  FONTANERO_SOLICITAR_AUSENCIA_TITLE,
  misSolicitudAusenciaDetailPath,
} from '../solicitudesAusenciaPaths'
import type { TipoSolicitudAusencia } from '../types'

type FormValues = {
  correo: string
  tipo: TipoSolicitudAusencia | ''
  fechaInicio: string
  fechaFin: string
  motivo: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const correoValido = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

const validate = (values: FormValues): FormErrors => {
  const errors: FormErrors = {}
  if (!values.correo.trim()) {
    errors.correo = 'Indique el correo donde desea recibir el aviso.'
  } else if (!correoValido(values.correo)) {
    errors.correo = 'El correo electrónico no es válido.'
  }
  if (values.tipo !== 'PERMISO' && values.tipo !== 'VACACIONES') {
    errors.tipo = 'Seleccione el tipo de solicitud.'
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.fechaInicio)) {
    errors.fechaInicio = 'Indique la fecha de inicio.'
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.fechaFin)) {
    errors.fechaFin = 'Indique la fecha de fin.'
  }
  if (
    values.fechaInicio &&
    values.fechaFin &&
    values.fechaFin < values.fechaInicio
  ) {
    errors.fechaFin = 'La fecha de fin no puede ser anterior al inicio.'
  }
  if (!values.motivo.trim()) {
    errors.motivo = 'Indique el motivo de la solicitud.'
  } else if (values.motivo.trim().length > 500) {
    errors.motivo = 'El motivo no puede superar 500 caracteres.'
  }
  return errors
}

const textoErrorBackend = (detail: string): string | null => {
  if (!detail || detail.length >= 220 || /TypeORM|SQL|stack/i.test(detail)) {
    return null
  }
  try {
    const parsed: unknown = JSON.parse(detail)
    if (typeof parsed === 'string') return parsed
    if (Array.isArray(parsed)) {
      const partes = parsed.filter((m): m is string => typeof m === 'string')
      return partes.length ? partes.join(' ') : null
    }
    if (typeof parsed === 'object' && parsed && 'message' in parsed) {
      const msg = (parsed as { message: unknown }).message
      if (typeof msg === 'string') return msg
      if (Array.isArray(msg)) {
        const partes = msg.filter((m): m is string => typeof m === 'string')
        return partes.length ? partes.join(' ') : null
      }
    }
  } catch {
    return detail
  }
  return detail
}

const mensajeErrorEnvio = (error: unknown): string => {
  const status = getHttpStatus(error)
  if (status === 403) {
    return 'No tiene permiso para solicitar ausencias o no hay un colaborador vinculado a su cuenta.'
  }
  if (status === 400) {
    const message = error instanceof Error ? error.message : ''
    const detail = message.replace(/^HTTP\s+\d{3}:\s*/i, '').trim()
    return (
      textoErrorBackend(detail) ||
      'Revise los datos del formulario e intente nuevamente.'
    )
  }
  return 'No fue posible enviar la solicitud. Intente nuevamente.'
}

/**
 * Formulario nativo Fontanero — mismo patrón visual que Mis solicitudes / Permisos RRHH.
 */
export default function SolicitarAusenciaPage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [values, setValues] = useState<FormValues>(() => ({
    correo: user?.email?.trim() || '',
    tipo: '',
    fechaInicio: '',
    fechaFin: '',
    motivo: '',
  }))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)
  const nombre = resolveAuthUserDisplayName(user)

  const update = (name: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitError(null)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setSubmitError('Revise los campos señalados.')
      event.currentTarget
        .querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus()
      return
    }
    submitting.current = true
    setSaving(true)
    setSubmitError(null)
    try {
      const creada = await crearMiSolicitudAusencia({
        tipo: values.tipo as TipoSolicitudAusencia,
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin,
        correo: values.correo.trim().toLowerCase(),
        motivo: values.motivo.trim(),
      })
      navigate(misSolicitudAusenciaDetailPath(creada.id), { replace: true })
    } catch (error: unknown) {
      if (esNoAutenticado(error)) {
        logout()
        navigate(LOGIN_ROUTE_PATH, { replace: true })
        return
      }
      setSubmitError(mensajeErrorEnvio(error))
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-5 overflow-x-hidden px-4 py-6 sm:px-6">
      <header className="rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
          Fontanero
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="m-0 flex items-center gap-3 text-2xl font-black tracking-tight text-[#062e63] sm:text-4xl">
              <IconClipboardList
                className="shrink-0 text-blue-600"
                size={34}
                aria-hidden="true"
              />
              {FONTANERO_SOLICITAR_AUSENCIA_TITLE}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              Complete el formulario para enviar su solicitud. Quedará pendiente
              de revisión por la Administración; no se considera aprobada al
              enviarla.
            </p>
          </div>
          <Link
            to={FONTANERO_MIS_SOLICITUDES_PATH}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 font-bold text-blue-800 no-underline hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <IconArrowLeft size={18} aria-hidden="true" />
            Ver mis solicitudes
          </Link>
        </div>
      </header>

      {submitError ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-800"
          role="alert"
        >
          {submitError}
        </div>
      ) : null}

      <form
        className="grid w-full gap-7 rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-8 lg:gap-8 lg:p-10"
        noValidate
        onSubmit={(event) => void submit(event)}
        aria-busy={saving}
        aria-label={FONTANERO_SOLICITAR_AUSENCIA_TITLE}
      >
        <div className="grid gap-x-7 gap-y-6 lg:grid-cols-2 lg:gap-y-7">
          <div className="grid min-w-0 gap-2.5">
            <span className="text-sm font-bold text-[#163f6b]">Solicitante</span>
            <div className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 sm:px-5">
              <IconUser className="shrink-0 text-slate-400" size={20} aria-hidden="true" />
              <p className="m-0 truncate font-semibold text-slate-800">{nombre}</p>
            </div>
          </div>

          <label className="grid min-w-0 gap-2.5">
            <span className="text-sm font-bold text-[#163f6b]">
              Correo para aviso <span className="text-red-600">*</span>
            </span>
            <span
              className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5 ${
                errors.correo
                  ? 'border-red-400'
                  : 'border-slate-200 focus-within:border-blue-500'
              }`}
            >
              <IconMail
                className={errors.correo ? 'text-red-500' : 'text-slate-400'}
                size={20}
                aria-hidden="true"
              />
              <input
                type="email"
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-slate-800 outline-none placeholder:text-slate-400"
                autoComplete="email"
                placeholder="ejemplo@correo.com"
                value={values.correo}
                required
                aria-invalid={Boolean(errors.correo)}
                onChange={(event) => update('correo', event.target.value)}
              />
            </span>
            {errors.correo ? (
              <small className="font-semibold text-red-600" role="alert">
                {errors.correo}
              </small>
            ) : (
              <small className="text-slate-500">
                Escriba el correo donde desea recibir el aviso si la solicitud es
                aprobada.
              </small>
            )}
          </label>

          <label className="grid min-w-0 gap-2.5 lg:col-span-2">
            <span className="text-sm font-bold text-[#163f6b]">
              Tipo de solicitud <span className="text-red-600">*</span>
            </span>
            <span
              className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5 ${
                errors.tipo
                  ? 'border-red-400'
                  : 'border-slate-200 focus-within:border-blue-500'
              }`}
            >
              <IconTag
                className={errors.tipo ? 'text-red-500' : 'text-slate-400'}
                size={20}
                aria-hidden="true"
              />
              <select
                className="w-0 min-w-0 flex-1 truncate border-0 bg-transparent py-3 text-slate-800 outline-none"
                value={values.tipo}
                required
                aria-invalid={Boolean(errors.tipo)}
                onChange={(event) => update('tipo', event.target.value)}
              >
                <option value="">Seleccione el tipo</option>
                <option value="PERMISO">Permiso</option>
                <option value="VACACIONES">Vacaciones</option>
              </select>
            </span>
            {errors.tipo ? (
              <small className="font-semibold text-red-600" role="alert">
                {errors.tipo}
              </small>
            ) : null}
          </label>

          <label className="grid min-w-0 gap-2.5">
            <span className="text-sm font-bold text-[#163f6b]">
              Fecha de inicio <span className="text-red-600">*</span>
            </span>
            <span
              className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5 ${
                errors.fechaInicio
                  ? 'border-red-400'
                  : 'border-slate-200 focus-within:border-blue-500'
              }`}
            >
              <IconCalendarEvent
                className={errors.fechaInicio ? 'text-red-500' : 'text-slate-400'}
                size={20}
                aria-hidden="true"
              />
              <input
                type="date"
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-slate-800 outline-none"
                value={values.fechaInicio}
                required
                aria-invalid={Boolean(errors.fechaInicio)}
                onChange={(event) => update('fechaInicio', event.target.value)}
              />
            </span>
            {errors.fechaInicio ? (
              <small className="font-semibold text-red-600" role="alert">
                {errors.fechaInicio}
              </small>
            ) : null}
          </label>

          <label className="grid min-w-0 gap-2.5">
            <span className="text-sm font-bold text-[#163f6b]">
              Fecha de fin <span className="text-red-600">*</span>
            </span>
            <span
              className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5 ${
                errors.fechaFin
                  ? 'border-red-400'
                  : 'border-slate-200 focus-within:border-blue-500'
              }`}
            >
              <IconCalendarEvent
                className={errors.fechaFin ? 'text-red-500' : 'text-slate-400'}
                size={20}
                aria-hidden="true"
              />
              <input
                type="date"
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-slate-800 outline-none"
                value={values.fechaFin}
                required
                aria-invalid={Boolean(errors.fechaFin)}
                onChange={(event) => update('fechaFin', event.target.value)}
              />
            </span>
            {errors.fechaFin ? (
              <small className="font-semibold text-red-600" role="alert">
                {errors.fechaFin}
              </small>
            ) : null}
          </label>

          <label className="grid min-w-0 gap-2.5 lg:col-span-2">
            <span className="text-sm font-bold text-[#163f6b]">
              Motivo <span className="text-red-600">*</span>
            </span>
            <span
              className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5 ${
                errors.motivo
                  ? 'border-red-400'
                  : 'border-slate-200 focus-within:border-blue-500'
              }`}
            >
              <IconMessage2
                className={errors.motivo ? 'text-red-500' : 'text-slate-400'}
                size={20}
                aria-hidden="true"
              />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent py-3 text-slate-800 outline-none placeholder:text-slate-400"
                maxLength={500}
                placeholder="Ej. Cita médica, vacaciones, asunto personal"
                value={values.motivo}
                required
                aria-invalid={Boolean(errors.motivo)}
                onChange={(event) => update('motivo', event.target.value)}
              />
            </span>
            {errors.motivo ? (
              <small className="font-semibold text-red-600" role="alert">
                {errors.motivo}
              </small>
            ) : null}
          </label>
        </div>

        <div className="mt-1 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:gap-4 lg:pt-7">
          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-500 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-7 py-3.5 font-extrabold text-white shadow-[0_11px_26px_rgba(37,99,235,0.3)] transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none sm:w-auto motion-reduce:transform-none"
            disabled={saving}
          >
            <IconDeviceFloppy size={20} aria-hidden="true" />
            {saving ? 'Enviando solicitud…' : 'Enviar solicitud'}
          </button>
          <Link
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-6 py-3.5 font-extrabold text-blue-900 no-underline transition hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-50 hover:no-underline sm:w-auto motion-reduce:transform-none"
            to={FONTANERO_MIS_SOLICITUDES_PATH}
          >
            <IconArrowLeft size={18} aria-hidden="true" />
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
