import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { Alert } from '../../../shared/ui/Alert'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { hoyEnAsada } from '../../../shared/utils/fechaAsada'
import DocumentoActividadUploader from '../../actividades-fontanero/components/DocumentoActividadUploader'
import { useAuth } from '../../auth/components/AuthContext'
import { resolveAuthUserDisplayName } from '../../auth/utils/authUserDisplay'
import {
  esNoAutenticado,
  getHttpStatus,
} from '../../recursos-humanos/colaboradorForm'
import { FONTANERO_MI_SALDO_PATH } from '../../recursos-humanos/recursosHumanosPaths'
import type { BalanceVacaciones } from '../../recursos-humanos/types'
import { getBalanceVacacionesPropio } from '../../recursos-humanos/vacacionesApi'
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

  const hoy = hoyEnAsada()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.fechaInicio)) {
    errors.fechaInicio = 'Indique la fecha de inicio.'
  } else if (values.fechaInicio < hoy) {
    errors.fechaInicio = 'La fecha de inicio no puede ser anterior a hoy.'
  } else if (esFeriadoCostaRica(values.fechaInicio)) {
    errors.fechaInicio = 'La fecha de inicio no puede ser un feriado.'
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.fechaFin)) {
    errors.fechaFin = 'Indique la fecha de fin.'
  } else if (values.fechaFin < hoy) {
    errors.fechaFin = 'La fecha de fin no puede ser anterior a hoy.'
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
    const correoSesion = user?.email?.trim().toLowerCase() || ''
    if (!correoSesion) return
    setValues((prev) => (prev.correo.trim() ? prev : { ...prev, correo: correoSesion }))
  }, [user?.email])

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
    if (excedeSaldo) {
      setSubmitError(
        'El periodo supera el saldo disponible. Reduzca las fechas o espere a que le acrediten más días.',
      )
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

  const labelClass = 'text-[0.78rem] font-bold text-sigasj-ink'
  const controlClass =
    'box-border min-h-11 w-full appearance-none rounded-xl border border-sigasj-border bg-white px-3.5 py-2.5 text-[0.95rem] leading-normal text-sigasj-ink shadow-none outline-none transition placeholder:text-sigasj-muted focus:border-sigasj-primary focus:shadow-none focus:outline-none focus:ring-0 disabled:bg-sigasj-surface-soft disabled:text-sigasj-muted disabled:opacity-100'
  const controlErrorClass =
    'box-border min-h-11 w-full appearance-none rounded-xl border border-red-400 bg-white px-3.5 py-2.5 text-[0.95rem] leading-normal text-sigasj-ink shadow-none outline-none transition placeholder:text-sigasj-muted focus:border-red-500 focus:shadow-none focus:outline-none focus:ring-0 disabled:opacity-60'

  return (
    <div className="admin-content-modern grid w-full min-w-0 gap-4">
      <PageHeader
        title={titulo}
        description={
          esVacaciones
            ? 'Solicite el disfrute de vacaciones. Los feriados no se eligen ni se descuentan. Administración aprueba antes de afectar el saldo.'
            : 'Solicite un permiso laboral. Puede ser de un solo día. No descuenta vacaciones.'
        }
        actions={
          <Button
            to={FONTANERO_MIS_SOLICITUDES_PATH}
            variant="secondary"
            size="sm"
            leftIcon={<IconArrowLeft size={16} aria-hidden="true" />}
          >
            Mis solicitudes
          </Button>
        }
      />

      {esVacaciones ? (
        <Alert tone={excedeSaldo ? 'warning' : 'info'}>
          {balance ? (
            <p className="m-0 font-semibold">
              Saldo disponible:{' '}
              <span className="font-extrabold tabular-nums text-sigasj-ink">
                {balance.diasDisponibles} día
                {balance.diasDisponibles === 1 ? '' : 's'}
              </span>
              {diasSolicitados > 0 ? (
                <>
                  {' '}
                  · Periodo:{' '}
                  <span className="tabular-nums">
                    {diasSolicitados} día{diasSolicitados === 1 ? '' : 's'}
                  </span>
                </>
              ) : null}{' '}
              <Link
                to={FONTANERO_MI_SALDO_PATH}
                className="font-bold text-sigasj-primary underline-offset-2 hover:underline"
              >
                Ver saldo
              </Link>
            </p>
          ) : (
            <p className="m-0 font-semibold">
              {balanceError ?? 'Consultando saldo…'}{' '}
              <Link
                to={FONTANERO_MI_SALDO_PATH}
                className="font-bold text-sigasj-primary underline-offset-2 hover:underline"
              >
                Ver saldo
              </Link>
            </p>
          )}
          {feriadosEnRango.length > 0 ? (
            <p className="mb-0 mt-2 text-sm font-semibold text-sigasj-muted">
              Feriados excluidos: {feriadosEnRango.map(formatearFeriado).join(', ')}.
            </p>
          ) : null}
          {excedeSaldo ? (
            <p className="mb-0 mt-2 font-semibold text-amber-900">
              El periodo supera el saldo ({balance?.diasDisponibles} día
              {balance?.diasDisponibles === 1 ? '' : 's'}). Ajuste las fechas.
            </p>
          ) : null}
        </Alert>
      ) : (
        <Alert tone="info">
          No elija feriados. Explique el motivo y, si aplica, adjunte un
          respaldo (constancia, cita, etc.).
        </Alert>
      )}

      <form
        className="grid gap-4"
        noValidate
        onSubmit={(event) => void submit(event)}
        aria-busy={saving}
        aria-label={titulo}
      >
        {submitError ? <Alert tone="danger">{submitError}</Alert> : null}

        <Card padded className="!grid !gap-5 !p-5 sm:!p-6">
          <h2 className="m-0 text-[1.05rem] font-extrabold tracking-tight text-sigasj-ink">
            {esVacaciones ? 'Datos de vacaciones' : 'Datos del permiso'}
          </h2>

          <div className="grid items-start gap-4 md:grid-cols-2">
            <label className="grid min-w-0 gap-1.5">
              <span className={labelClass}>Solicitante</span>
              <input
                className={controlClass}
                value={nombre}
                readOnly
                disabled
                aria-label="Solicitante"
              />
            </label>

            <label className="grid min-w-0 gap-1.5">
              <span className={labelClass}>
                Correos para aviso <span className="text-sigasj-error">*</span>
              </span>
              <input
                id="correoAviso"
                name="correo"
                type="text"
                autoComplete="off"
                spellCheck={false}
                className={errors.correo ? controlErrorClass : controlClass}
                placeholder="Ej. administracion@asadasanjuan.cr"
                value={values.correo}
                required
                disabled={saving}
                aria-invalid={Boolean(errors.correo)}
                aria-describedby={
                  errors.correo ? 'correoAviso-error' : 'correoAviso-ayuda'
                }
                onChange={(event) => update('correo', event.target.value)}
              />
              {errors.correo ? (
                <small
                  id="correoAviso-error"
                  className="font-semibold text-sigasj-error"
                  role="alert"
                >
                  {errors.correo}
                </small>
              ) : (
                <small
                  id="correoAviso-ayuda"
                  className="font-semibold text-sigasj-muted"
                >
                  El aviso se envía al aprobar. Separe varios correos con coma.
                </small>
              )}
            </label>
          </div>

          <div className="grid gap-3.5">
            <div className="grid gap-3.5 sm:grid-cols-2 sm:items-start">
              <FechaFeriadoPicker
                label="Fecha de inicio"
                value={values.fechaInicio}
                required
                compacto
                sinMensajes
                bloquearFeriados
                min={hoyEnAsada()}
                error={errors.fechaInicio}
                onChange={(iso) => update('fechaInicio', iso)}
              />
              <FechaFeriadoPicker
                label="Fecha de fin"
                value={values.fechaFin}
                required
                compacto
                sinMensajes
                bloquearFeriados
                min={
                  values.fechaInicio && values.fechaInicio > hoyEnAsada()
                    ? values.fechaInicio
                    : hoyEnAsada()
                }
                error={errors.fechaFin}
                onChange={(iso) => update('fechaFin', iso)}
              />
            </div>
            {errors.fechaInicio ? (
              <small className="font-semibold text-sigasj-error" role="alert">
                {errors.fechaInicio}
              </small>
            ) : null}
            {errors.fechaFin ? (
              <small className="font-semibold text-sigasj-error" role="alert">
                {errors.fechaFin}
              </small>
            ) : (
              <small className="font-semibold text-sigasj-muted">
                {esVacaciones
                  ? 'Feriados en ámbar: no se seleccionan ni se descuentan del saldo.'
                  : 'Puede ser el mismo día de inicio. Los feriados aparecen en ámbar.'}
              </small>
            )}
          </div>

          {esVacaciones ? null : (
            <label className="grid min-w-0 gap-1.5">
              <span className={labelClass}>
                Motivo <span className="text-sigasj-error">*</span>
              </span>
              <textarea
                id="motivoPermiso"
                name="motivo"
                className={`min-h-[6.5rem] resize-y ${errors.motivo ? controlErrorClass : controlClass}`}
                maxLength={500}
                placeholder="Ej. Cita médica, trámite personal, asunto familiar"
                value={values.motivo}
                required
                disabled={saving}
                aria-invalid={Boolean(errors.motivo)}
                onChange={(event) => update('motivo', event.target.value)}
              />
              {errors.motivo ? (
                <small className="font-semibold text-sigasj-error" role="alert">
                  {errors.motivo}
                </small>
              ) : (
                <small className="font-semibold text-sigasj-muted">
                  Máximo 500 caracteres.
                </small>
              )}
            </label>
          )}
        </Card>

        {esVacaciones ? null : (
          <Card padded className="!grid !gap-3 !p-5 sm:!p-6">
            <h2 className="m-0 text-[1.05rem] font-extrabold tracking-tight text-sigasj-ink">
              Respaldo (opcional)
            </h2>
            <p className="m-0 text-sm font-semibold text-sigasj-muted">
              PDF, JPG, JPEG o PNG · máximo 10 MB por archivo. Constancia
              médica, cita u otro documento.
            </p>
            <DocumentoActividadUploader
              files={documentos}
              onChange={setDocumentos}
              multiple
              buttonLabel="Adjuntar archivos"
              helpText=""
              listLabel="Archivos adjuntos"
              dropHint="Arrastre los archivos aquí o use el botón para seleccionarlos."
            />
          </Card>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            to={FONTANERO_MIS_SOLICITUDES_PATH}
            variant="secondary"
            leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="lg"
            loading={saving}
            disabled={
              saving ||
              excedeSaldo ||
              (esVacaciones && !balance && !balanceError)
            }
            leftIcon={<IconDeviceFloppy size={18} aria-hidden="true" />}
          >
            {saving
              ? 'Enviando solicitud…'
              : esVacaciones
                ? 'Enviar solicitud de vacaciones'
                : 'Enviar solicitud de permiso'}
          </Button>
        </div>
      </form>
    </div>
  )
}
