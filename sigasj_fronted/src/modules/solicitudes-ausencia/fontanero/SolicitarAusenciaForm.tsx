import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ADMIN_BASE_PATH } from '../../../app/router/adminPaths'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { useAuth } from '../../auth/components/AuthContext'
import { resolveAuthUserDisplayName } from '../../auth/utils/authUserDisplay'
import {
  esNoAutenticado,
  getHttpStatus,
} from '../../recursos-humanos/colaboradorForm'
import { FONTANERO_MI_SALDO_PATH } from '../../recursos-humanos/recursosHumanosPaths'
import type { BalanceVacaciones } from '../../recursos-humanos/types'
import { getBalanceVacacionesPropio } from '../../recursos-humanos/vacacionesApi'
import ActividadRegistroFieldError from '../../actividades-fontanero/components/ActividadRegistroFieldError'
import DocumentoActividadUploader from '../../actividades-fontanero/components/DocumentoActividadUploader'
import { hoyEnAsada } from '../../../shared/utils/fechaAsada'
import { normalizarCorreosAviso, validarListaCorreosAviso } from '../correosAviso'
import {
  diasAusenciaSinFeriados,
  esFeriadoCostaRica,
  formatearFeriado,
  listarFeriadosEnRango,
} from '../feriadosCostaRica'
import FechaFeriadoPicker from '../FechaFeriadoPicker'
import { crearMiSolicitudAusencia } from '../solicitudesAusenciaApi'
import {
  FONTANERO_MIS_SOLICITUDES_PATH,
  FONTANERO_SOLICITAR_PERMISO_TITLE,
  FONTANERO_SOLICITAR_VACACIONES_TITLE,
  misSolicitudAusenciaDetailPath,
} from '../solicitudesAusenciaPaths'
import type { TipoSolicitudAusencia } from '../types'

type FormValues = {
  correo: string
  fechaInicio: string
  fechaFin: string
  motivo: string
}

type FormErrors = Partial<Record<keyof FormValues | 'documentos', string>>

const fechaInicioPorDefecto = () => {
  const hoy = hoyEnAsada()
  return esFeriadoCostaRica(hoy) ? '' : hoy
}

const validate = (
  values: FormValues,
  tipo: TipoSolicitudAusencia,
): FormErrors => {
  const errors: FormErrors = {}
  const correoError = validarListaCorreosAviso(values.correo)
  if (correoError) errors.correo = correoError

  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.fechaInicio)) {
    errors.fechaInicio = 'Indique la fecha de inicio.'
  } else if (esFeriadoCostaRica(values.fechaInicio)) {
    errors.fechaInicio = 'La fecha de inicio no puede ser un feriado.'
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.fechaFin)) {
    errors.fechaFin = 'Indique la fecha de fin.'
  } else if (esFeriadoCostaRica(values.fechaFin)) {
    errors.fechaFin = 'La fecha de fin no puede ser un feriado.'
  }

  if (
    values.fechaInicio &&
    values.fechaFin &&
    values.fechaFin < values.fechaInicio
  ) {
    errors.fechaFin = 'La fecha de fin no puede ser anterior al inicio.'
  } else if (
    values.fechaInicio &&
    values.fechaFin &&
    diasAusenciaSinFeriados(values.fechaInicio, values.fechaFin) < 1
  ) {
    errors.fechaFin =
      'El periodo no incluye días hábiles: solo hay feriados en ese rango.'
  }

  if (tipo === 'PERMISO') {
    if (!values.motivo.trim()) {
      errors.motivo = 'Indique el motivo del permiso.'
    } else if (values.motivo.trim().length > 500) {
      errors.motivo = 'El motivo no puede superar 500 caracteres.'
    }
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
    const message = error instanceof Error ? error.message : ''
    const detail = message.replace(/^HTTP\s+\d{3}:\s*/i, '')
    if (/colaborador/i.test(detail)) {
      return 'No hay un colaborador activo vinculado a su cuenta. Pida a Administración que asocie su usuario.'
    }
    return 'No tiene permiso para enviar esta solicitud.'
  }
  if (status === 409) {
    const message = error instanceof Error ? error.message : ''
    const detail = message.replace(/^HTTP\s+\d{3}:\s*/i, '').trim()
    return (
      textoErrorBackend(detail) ||
      'Ya existe una solicitud o un registro de RRHH en ese periodo.'
    )
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

type SolicitarAusenciaFormProps = {
  tipo: TipoSolicitudAusencia
}

export default function SolicitarAusenciaForm({
  tipo,
}: SolicitarAusenciaFormProps) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const esVacaciones = tipo === 'VACACIONES'
  const titulo = esVacaciones
    ? FONTANERO_SOLICITAR_VACACIONES_TITLE
    : FONTANERO_SOLICITAR_PERMISO_TITLE
  const [values, setValues] = useState<FormValues>(() => ({
    correo: '',
    fechaInicio: fechaInicioPorDefecto(),
    fechaFin: '',
    motivo: '',
  }))
  const [documentos, setDocumentos] = useState<File[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [balance, setBalance] = useState<BalanceVacaciones | null>(null)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const submitting = useRef(false)
  const nombre = resolveAuthUserDisplayName(user)
  const feriadosEnRango = listarFeriadosEnRango(
    values.fechaInicio,
    values.fechaFin,
  )
  const diasSolicitados = diasAusenciaSinFeriados(
    values.fechaInicio,
    values.fechaFin,
  )
  const excedeSaldo =
    esVacaciones &&
    balance != null &&
    diasSolicitados > 0 &&
    diasSolicitados > balance.diasDisponibles

  useEffect(() => {
    if (!esVacaciones) return
    const controller = new AbortController()
    getBalanceVacacionesPropio(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setBalance(data)
        setBalanceError(null)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setBalance(null)
        const status = getHttpStatus(error)
        setBalanceError(
          status === 403
            ? 'No hay un colaborador activo vinculado a su cuenta. Sin ese vínculo no se puede consultar el saldo ni enviar la solicitud.'
            : 'No fue posible consultar su saldo de vacaciones.',
        )
      })
    return () => controller.abort()
  }, [esVacaciones])

  const update = (name: keyof FormValues, value: string) => {
    if (
      (name === 'fechaInicio' || name === 'fechaFin') &&
      value &&
      esFeriadoCostaRica(value)
    ) {
      setValues((current) => ({ ...current, [name]: '' }))
      setErrors((current) => ({
        ...current,
        [name]: 'Ese día es feriado en Costa Rica. Elija otra fecha.',
      }))
      setSubmitError(null)
      return
    }
    setValues((current) => {
      const next = { ...current, [name]: value }
      if (name === 'fechaInicio' && next.fechaFin && next.fechaFin < value) {
        next.fechaFin = ''
      }
      return next
    })
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitError(null)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = validate(values, tipo)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setSubmitError('Revise los campos señalados.')
      return
    }
    submitting.current = true
    setSaving(true)
    setSubmitError(null)
    try {
      const creada = await crearMiSolicitudAusencia({
        tipo,
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin,
        correo: normalizarCorreosAviso(values.correo),
        motivo: esVacaciones ? null : values.motivo.trim(),
        documentos: esVacaciones ? [] : documentos,
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
    <section className="actividades-fontanero-home actividades-fontanero-registro mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6">
      <header className="actividades-fontanero-home__welcome !rounded-[26px] !border-sky-100 !bg-linear-to-br !from-white !via-white !to-blue-50/70 !p-8 !shadow-[0_16px_42px_rgba(15,63,110,0.1)]">
        <div className="actividades-fontanero-home__welcome-content">
          <span className="actividades-fontanero-home__eyebrow !text-sm !font-extrabold !tracking-[0.12em] !text-blue-600">
            Módulo operativo · Fontanero
          </span>
          <h1 className="!text-4xl !font-black !tracking-[-0.025em] !text-[#062e63]">
            {titulo}
          </h1>
          <p className="actividades-fontanero-home__welcome-text">
            {esVacaciones
              ? 'Solicite el disfrute de vacaciones. Los feriados no se seleccionan ni se descuentan del saldo. La Administración aprueba antes de afectar el saldo.'
              : 'Solicite un permiso laboral. Adjunte el respaldo si lo tiene (constancia, cita, etc.). No descuenta vacaciones.'}
          </p>
        </div>
        <Link
          to={`${ADMIN_BASE_PATH}/dashboard`}
          className="actividades-fontanero-home__back-link !inline-flex !min-h-11 !items-center !rounded-xl !border !border-blue-200 !bg-white !px-4 !font-extrabold !text-blue-700 !shadow-sm !transition-all !duration-300 hover:!-translate-y-0.5 hover:!border-blue-400 hover:!bg-blue-50 hover:!no-underline hover:!shadow-md active:!translate-y-0"
        >
          Volver al dashboard
        </Link>
      </header>

      {esVacaciones ? (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/80 px-5 py-4 text-slate-700">
          {balance ? (
            <p className="m-0 font-semibold">
              Saldo actual:{' '}
              <span className="text-[#062e63]">
                {balance.diasDisponibles} día(s) disponibles
              </span>
              {diasSolicitados > 0 ? (
                <> · Este periodo cubre {diasSolicitados} día(s) hábiles.</>
              ) : null}{' '}
              <Link to={FONTANERO_MI_SALDO_PATH} className="font-bold text-blue-800">
                Ver detalle de saldo
              </Link>
            </p>
          ) : (
            <p className="m-0 font-semibold">
              {balanceError ?? 'Consultando saldo de vacaciones…'}{' '}
              <Link to={FONTANERO_MI_SALDO_PATH} className="font-bold text-blue-800">
                Ver mi saldo de vacaciones
              </Link>
            </p>
          )}
          {feriadosEnRango.length > 0 ? (
            <p className="mt-2 m-0 text-sm font-semibold text-slate-600">
              Se excluyen feriados:{' '}
              {feriadosEnRango.map(formatearFeriado).join(', ')}.
            </p>
          ) : null}
          {excedeSaldo ? (
            <p className="mt-2 m-0 font-semibold text-amber-800" role="status">
              El periodo supera el saldo disponible. Puede enviarla; la
              Administración no podrá aprobarla si no hay días suficientes.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="m-0 rounded-2xl border border-sky-100 bg-sky-50/80 px-5 py-4 font-semibold text-slate-700">
          El permiso puede ser de un solo día. No elija feriados. Explique el
          motivo y, si aplica, adjunte un respaldo.
        </p>
      )}

      <form
        className="actividad-registro-form !gap-7 !rounded-[28px] !border-blue-100 !bg-white/90 !p-5 !shadow-[0_14px_38px_rgba(30,90,156,0.08)] md:!p-8"
        noValidate
        onSubmit={(event) => void submit(event)}
        aria-busy={saving}
        aria-label={titulo}
      >
        {submitError ? (
          <div className="actividad-registro-form__error-summary" role="alert">
            <p className="actividad-registro-form__error-summary-title">
              {submitError}
            </p>
          </div>
        ) : null}

        <fieldset
          className="actividad-registro-form__section !grid !grid-cols-1 !gap-5 !rounded-3xl !border !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/50 !p-5 md:!grid-cols-2 md:!p-7"
          disabled={saving}
        >
          <legend className="actividad-registro-form__legend">
            {esVacaciones ? 'Datos de vacaciones' : 'Datos del permiso'}
          </legend>

          <div className="actividad-registro-form__field">
            <span className="actividad-registro-form__label">Solicitante</span>
            <input
              className="actividad-registro-form__input"
              value={nombre}
              readOnly
              disabled
            />
          </div>

          <div
            className={`actividad-registro-form__field${
              errors.correo ? ' actividad-registro-form__field--invalid' : ''
            }`}
          >
            <label className="actividad-registro-form__label" htmlFor="correoAviso">
              Correos para aviso{' '}
              <span className="actividad-registro-form__required" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="correoAviso"
              name="correo"
              type="text"
              inputMode="email"
              autoComplete="off"
              className={`actividad-registro-form__input${
                errors.correo ? ' actividad-registro-form__input--error' : ''
              }`}
              placeholder="uno@correo.cr, otro@correo.cr"
              value={values.correo}
              required
              aria-invalid={Boolean(errors.correo)}
              onChange={(event) => update('correo', event.target.value)}
            />
            {errors.correo ? (
              <ActividadRegistroFieldError id="correo-error" message={errors.correo} />
            ) : (
              <small className="text-slate-500">
                El aviso se envía cuando la Administradora aprueba, no al
                registrar. Separe varios correos con coma.
              </small>
            )}
          </div>

          <FechaFeriadoPicker
            label="Fecha de inicio"
            value={values.fechaInicio}
            required
            error={errors.fechaInicio}
            onChange={(iso) => update('fechaInicio', iso)}
          />

          <FechaFeriadoPicker
            label="Fecha de fin"
            value={values.fechaFin}
            required
            min={values.fechaInicio || undefined}
            error={errors.fechaFin}
            onChange={(iso) => update('fechaFin', iso)}
          />
          {errors.fechaFin ? null : (
            <small className="text-slate-500 md:col-span-2">
              {esVacaciones
                ? 'Los feriados nacionales se marcan en el calendario y no se cuentan.'
                : 'Puede ser el mismo día de inicio. Los feriados se marcan en el calendario.'}
            </small>
          )}

          {esVacaciones ? null : (
            <div
              className={`actividad-registro-form__field md:!col-span-2${
                errors.motivo ? ' actividad-registro-form__field--invalid' : ''
              }`}
            >
              <label className="actividad-registro-form__label" htmlFor="motivoPermiso">
                Motivo{' '}
                <span className="actividad-registro-form__required" aria-hidden="true">
                  *
                </span>
              </label>
              <textarea
                id="motivoPermiso"
                name="motivo"
                className={`actividad-registro-form__textarea${
                  errors.motivo ? ' actividad-registro-form__input--error' : ''
                }`}
                maxLength={500}
                placeholder="Ej. Cita médica, trámite personal, asunto familiar"
                value={values.motivo}
                required
                aria-invalid={Boolean(errors.motivo)}
                onChange={(event) => update('motivo', event.target.value)}
              />
              {errors.motivo ? (
                <ActividadRegistroFieldError id="motivo-error" message={errors.motivo} />
              ) : null}
            </div>
          )}
        </fieldset>

        {esVacaciones ? null : (
          <fieldset className="actividad-registro-form__section !gap-4 !rounded-3xl !border !border-blue-100 !bg-gradient-to-br !from-white !to-sky-50/60 !p-5 md:!p-7">
            <legend className="actividad-registro-form__legend">
              Respaldo del permiso
            </legend>
            <p className="actividad-formulario-especifico__hint !mt-0">
              Opcional. PDF, JPG o PNG (máximo 10 MB). Constancia médica, cita u
              otro documento de respaldo.
            </p>
            <DocumentoActividadUploader
              files={documentos}
              onChange={setDocumentos}
              multiple
              buttonLabel="Adjuntar archivos"
              helpText="Formatos permitidos: PDF, JPG, JPEG y PNG. Máximo 10 MB por archivo."
              listLabel="Archivos adjuntos"
              dropHint="Arrastre los archivos aquí o use el botón para seleccionarlos."
            />
          </fieldset>
        )}

        <div className="actividad-registro-form__actions">
          <button
            type="submit"
            className="actividad-registro-form__button actividad-registro-form__button--adjuntar !min-h-12 !gap-2 !rounded-2xl !border-0 !px-7 !font-extrabold"
            disabled={saving}
          >
            <IconDeviceFloppy size={20} aria-hidden="true" />
            {saving
              ? 'Enviando solicitud…'
              : esVacaciones
                ? 'Enviar solicitud de vacaciones'
                : 'Enviar solicitud de permiso'}
          </button>
          <Link
            className="actividad-registro-form__button actividad-registro-form__button--secondary !min-h-12 !rounded-2xl !px-6 !font-extrabold !no-underline"
            to={FONTANERO_MIS_SOLICITUDES_PATH}
          >
            <IconArrowLeft size={18} aria-hidden="true" />
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  )
}
