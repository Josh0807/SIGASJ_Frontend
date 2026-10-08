import {
  IconArrowLeft,
  IconAt,
  IconBriefcase,
  IconDeviceFloppy,
  IconId,
  IconKey,
  IconRefresh,
  IconUser,
  IconUsers,
} from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { useAuth } from '../auth/components/AuthContext'
import {
  actualizarColaborador,
  getColaborador,
  getCuentasUsuario,
  registrarColaborador,
} from './colaboradoresApi'
import {
  CARGOS_SUGERIDOS,
  EMPTY_COLABORADOR_VALUES,
  colaboradorErrorMessage,
  esNoAutenticado,
  esReintentable,
  toColaboradorFormValues,
  toColaboradorPayload,
  validateColaborador,
  type ColaboradorFormErrors,
} from './colaboradorForm'
import { RRHH_PATH, RRHH_TITLE, colaboradorDetailPath } from './recursosHumanosPaths'
import type { ColaboradorFormValues, CuentaUsuario } from './types'

type TextField = Exclude<keyof ColaboradorFormValues, 'usuarioId'>

const fields: Array<{
  name: TextField
  label: string
  placeholder: string
  maxLength: number
  type?: 'email'
  autoComplete: string
  icon: typeof IconUser
  list?: string
}> = [
  { name: 'nombre', label: 'Nombre', placeholder: 'Ej. Juan', maxLength: 100, autoComplete: 'given-name', icon: IconUser },
  { name: 'apellidos', label: 'Apellidos', placeholder: 'Ej. Pérez Rodríguez', maxLength: 100, autoComplete: 'family-name', icon: IconUsers },
  { name: 'cedula', label: 'Cédula', placeholder: 'Ej. 1-1111-1111', maxLength: 14, autoComplete: 'off', icon: IconId },
  { name: 'correoElectronico', label: 'Correo electrónico', placeholder: 'nombre@ejemplo.com', maxLength: 150, type: 'email', autoComplete: 'email', icon: IconAt },
  { name: 'cargo', label: 'Cargo', placeholder: 'Ej. Fontanero', maxLength: 100, autoComplete: 'organization-title', icon: IconBriefcase, list: 'rrhh-cargos-form' },
]

const ROLES_PERSONAL = ['ADMINISTRADORA', 'SECRETARIA', 'FONTANERO', 'AYUDANTE']

export default function ColaboradorFormPage() {
  const { id } = useParams()
  const colaboradorId = id ? Number(id) : null
  const modo = id ? 'editar' : 'crear'
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [values, setValues] = useState(EMPTY_COLABORADOR_VALUES)
  const [errors, setErrors] = useState<ColaboradorFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [carga, setCarga] = useState<{
    clave: string
    error: string | null
    reintentable: boolean
  }>({ clave: '', error: null, reintentable: true })
  const [recarga, setRecarga] = useState(0)
  const idValido = colaboradorId === null || (Number.isInteger(colaboradorId) && colaboradorId > 0)
  const clave = `${colaboradorId}:${recarga}`
  const cargando = colaboradorId !== null && idValido && carga.clave !== clave
  const cargaError = !idValido
    ? 'El colaborador indicado no existe o fue eliminado.'
    : cargando
      ? null
      : carga.error
  const [cuentas, setCuentas] = useState<CuentaUsuario[]>([])
  const [cuentasError, setCuentasError] = useState(false)
  const submitting = useRef(false)

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  useEffect(() => {
    if (colaboradorId === null || !idValido) return undefined
    const controller = new AbortController()
    getColaborador(colaboradorId, controller.signal)
      .then((colaborador) => {
        if (controller.signal.aborted) return
        setValues(toColaboradorFormValues(colaborador))
        setCarga({ clave, error: null, reintentable: true })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (esNoAutenticado(error)) {
          salirPorSesion()
          return
        }
        setCarga({
          clave,
          error: colaboradorErrorMessage(error, 'No fue posible cargar el colaborador.'),
          reintentable: esReintentable(error),
        })
      })
    return () => controller.abort()
  }, [clave, colaboradorId, idValido, salirPorSesion])

  useEffect(() => {
    const controller = new AbortController()
    getCuentasUsuario(controller.signal)
      .then((lista) => {
        if (!controller.signal.aborted) setCuentas(lista)
      })
      .catch(() => {
        if (!controller.signal.aborted) setCuentasError(true)
      })
    return () => controller.abort()
  }, [])

  const cuentasVisibles = cuentas.filter(
    (cuenta) =>
      String(cuenta.id) === values.usuarioId ||
      (cuenta.activo && ROLES_PERSONAL.includes(cuenta.rol.toUpperCase())),
  )

  const update = (name: keyof ColaboradorFormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitError(null)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = validateColaborador(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setSubmitError('Revise los campos señalados.')
      event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    submitting.current = true
    setSaving(true)
    setSubmitError(null)
    try {
      const payload = toColaboradorPayload(values, modo)
      if (colaboradorId) {
        await actualizarColaborador(colaboradorId, payload)
        navigate(colaboradorDetailPath(colaboradorId), {
          replace: true,
          state: { success: 'Colaborador actualizado correctamente.' },
        })
      } else {
        await registrarColaborador(payload)
        navigate(RRHH_PATH, {
          replace: true,
          state: { success: 'Colaborador registrado correctamente.' },
        })
      }
    } catch (error) {
      if (esNoAutenticado(error)) {
        salirPorSesion()
        return
      }
      setSubmitError(
        colaboradorErrorMessage(
          error,
          modo === 'editar'
            ? 'No fue posible actualizar el colaborador. Inténtelo nuevamente.'
            : 'No fue posible registrar el colaborador. Inténtelo nuevamente.',
        ),
      )
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  const volverA = colaboradorId ? colaboradorDetailPath(colaboradorId) : RRHH_PATH
  const titulo = modo === 'editar' ? 'Editar colaborador' : 'Registrar colaborador'

  return (
    <main className="grid w-full min-w-0 gap-5 sm:gap-6">
      <header className="rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
          Administración · {RRHH_TITLE}
        </p>
        <h1 className="m-0 text-3xl font-black tracking-tight text-[#062e63] sm:text-4xl">{titulo}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500 sm:text-lg">
          {modo === 'editar'
            ? 'Actualice la información personal, el cargo o la cuenta vinculada del colaborador.'
            : 'Ingrese la información personal y el cargo del nuevo colaborador.'}
        </p>
      </header>

      {cargando ? (
        <div className="grid gap-4 rounded-2xl border border-sky-100 bg-white p-6 sm:rounded-3xl sm:p-8" role="status">
          <span className="sr-only">Cargando colaborador…</span>
          {[0, 1, 2].map((fila) => (
            <div key={fila} className="h-14 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" aria-hidden="true" />
          ))}
        </div>
      ) : cargaError ? (
        <div className="grid place-items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center sm:rounded-3xl" role="alert">
          <p className="m-0 font-semibold text-red-800">{cargaError}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {idValido && carga.reintentable ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 font-bold text-blue-800 transition hover:bg-blue-50"
                onClick={() => setRecarga((n) => n + 1)}
              >
                <IconRefresh size={18} aria-hidden="true" />
                Reintentar
              </button>
            ) : null}
            <Link
              to={RRHH_PATH}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 font-bold text-slate-700 no-underline hover:no-underline"
            >
              <IconArrowLeft size={18} aria-hidden="true" />
              Volver al listado
            </Link>
          </div>
        </div>
      ) : (
        <>
          {submitError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-800" role="alert">
              {submitError}
            </div>
          ) : null}
          <form
            className="grid w-full gap-7 rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-8 lg:gap-8 lg:p-10"
            noValidate
            onSubmit={submit}
            aria-busy={saving}
            aria-label={titulo}
          >
            <div className="flex items-start gap-3 border-b border-slate-100 pb-6 sm:gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700 sm:size-12">
                <IconUser size={25} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold leading-tight tracking-tight text-[#073b73] sm:text-xl">
                  Información del colaborador
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Todos los campos marcados con <span className="font-bold text-red-600">*</span> son obligatorios.
                </p>
              </div>
            </div>

            <div className="grid gap-x-7 gap-y-6 lg:grid-cols-2 lg:gap-y-7">
              {fields.map(({ name, label, icon: Icon, ...input }) => {
                const errorId = `colaborador-${name}-error`
                return (
                  <label className="grid min-w-0 gap-2.5" key={name}>
                    <span className="text-sm font-bold text-[#163f6b]">
                      {label} <span className="text-red-600" aria-hidden="true">*</span>
                      <span className="sr-only"> (obligatorio)</span>
                    </span>
                    <span
                      className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5 ${errors[name] ? 'border-red-400 focus-within:border-red-500' : 'border-slate-200 focus-within:border-blue-500'}`}
                    >
                      <Icon className={errors[name] ? 'text-red-500' : 'text-slate-400'} size={20} aria-hidden="true" />
                      <input
                        className="min-w-0 flex-1 border-0 bg-transparent py-3 text-slate-800 outline-none placeholder:text-slate-400"
                        {...input}
                        value={values[name]}
                        required
                        aria-invalid={Boolean(errors[name])}
                        aria-describedby={errors[name] ? errorId : undefined}
                        onChange={(event) => update(name, event.target.value)}
                      />
                    </span>
                    {errors[name] ? (
                      <small className="font-semibold text-red-600" id={errorId} role="alert">
                        {errors[name]}
                      </small>
                    ) : null}
                  </label>
                )
              })}
              <datalist id="rrhh-cargos-form">
                {CARGOS_SUGERIDOS.map((opcion) => (
                  <option key={opcion} value={opcion} />
                ))}
              </datalist>

              <label className="grid min-w-0 gap-2.5">
                <span className="text-sm font-bold text-[#163f6b]">Cuenta de usuario (opcional)</span>
                <span className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 sm:px-5">
                  <IconKey className="text-slate-400" size={20} aria-hidden="true" />
                  <select
                    className="w-0 min-w-0 flex-1 truncate border-0 bg-transparent py-3 text-slate-800 outline-none"
                    value={values.usuarioId}
                    onChange={(event) => update('usuarioId', event.target.value)}
                  >
                    <option value="">Sin cuenta vinculada</option>
                    {cuentasVisibles.map((cuenta) => (
                      <option key={cuenta.id} value={String(cuenta.id)}>
                        {cuenta.nombre || cuenta.correo} {cuenta.correo ? `· ${cuenta.correo}` : ''}
                      </option>
                    ))}
                  </select>
                </span>
                <small className="text-slate-500">
                  {cuentasError
                    ? 'No fue posible cargar las cuentas de usuario; puede vincularla más tarde.'
                    : 'Vincule la cuenta con la que el colaborador inicia sesión en SIGASJ.'}
                </small>
              </label>
            </div>

            <div className="mt-1 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:gap-4 lg:pt-7">
              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-500 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-7 py-3.5 font-extrabold text-white shadow-[0_11px_26px_rgba(37,99,235,0.3)] transition hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none sm:w-auto motion-reduce:transform-none"
                disabled={saving}
              >
                <IconDeviceFloppy size={20} aria-hidden="true" />
                {saving ? 'Guardando colaborador…' : 'Guardar colaborador'}
              </button>
              <Link
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-6 py-3.5 font-extrabold text-blue-900 no-underline transition hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-50 hover:no-underline sm:w-auto motion-reduce:transform-none"
                to={volverA}
              >
                <IconArrowLeft size={19} aria-hidden="true" />
                Cancelar
              </Link>
            </div>
          </form>
        </>
      )}
    </main>
  )
}
