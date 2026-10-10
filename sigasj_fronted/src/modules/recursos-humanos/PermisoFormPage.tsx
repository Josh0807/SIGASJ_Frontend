import {
  IconArrowLeft,
  IconCalendarEvent,
  IconDeviceFloppy,
  IconMessage2,
  IconRefresh,
  IconUser,
} from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { useAuth } from '../auth/components/AuthContext'
import { getColaboradoresOpciones } from './colaboradoresApi'
import { esNoAutenticado, esReintentable, nombreCompleto } from './colaboradorForm'
import {
  EMPTY_PERMISO_VALUES,
  permisoErrorMessage,
  toPermisoFormValues,
  toPermisoPayload,
  validatePermiso,
  type PermisoFormErrors,
} from './permisoForm'
import { actualizarPermiso, getPermiso, registrarPermiso } from './permisosApi'
import {
  PERMISOS_PATH,
  RRHH_TITLE,
  permisoDetailPath,
} from './recursosHumanosPaths'
import type { Colaborador, PermisoFormValues } from './types'

export default function PermisoFormPage() {
  const { id } = useParams()
  const permisoId = id ? Number(id) : null
  const modo = id ? 'editar' : 'crear'
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [values, setValues] = useState(EMPTY_PERMISO_VALUES)
  const [errors, setErrors] = useState<PermisoFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [carga, setCarga] = useState<{
    clave: string
    error: string | null
    reintentable: boolean
  }>({ clave: '', error: null, reintentable: true })
  const [recarga, setRecarga] = useState(0)
  const idValido = permisoId === null || (Number.isInteger(permisoId) && permisoId > 0)
  const clave = `${permisoId}:${recarga}`
  const cargando = permisoId !== null && idValido && carga.clave !== clave
  const cargaError = !idValido
    ? 'El permiso indicado no existe o fue eliminado.'
    : cargando
      ? null
      : carga.error
  const submitting = useRef(false)

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  useEffect(() => {
    const controller = new AbortController()
    getColaboradoresOpciones(controller.signal)
      .then((lista) => {
        if (!controller.signal.aborted) setColaboradores(lista.data)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted && esNoAutenticado(error)) salirPorSesion()
      })
    return () => controller.abort()
  }, [salirPorSesion])

  useEffect(() => {
    if (permisoId === null || !idValido) return undefined
    const controller = new AbortController()
    getPermiso(permisoId, controller.signal)
      .then((permiso) => {
        if (controller.signal.aborted) return
        setValues(toPermisoFormValues(permiso))
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
          error: permisoErrorMessage(error, 'No fue posible cargar el permiso.'),
          reintentable: esReintentable(error),
        })
      })
    return () => controller.abort()
  }, [clave, permisoId, idValido, salirPorSesion])

  const update = (name: keyof PermisoFormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitError(null)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = validatePermiso(values)
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
      const payload = toPermisoPayload(values)
      if (permisoId) {
        await actualizarPermiso(permisoId, payload)
        navigate(permisoDetailPath(permisoId), {
          replace: true,
          state: { success: 'Permiso actualizado correctamente.' },
        })
      } else {
        await registrarPermiso(payload)
        navigate(PERMISOS_PATH, {
          replace: true,
          state: { success: 'Permiso registrado correctamente.' },
        })
      }
    } catch (error) {
      if (esNoAutenticado(error)) {
        salirPorSesion()
        return
      }
      setSubmitError(
        permisoErrorMessage(
          error,
          modo === 'editar'
            ? 'No fue posible actualizar el permiso. Inténtelo nuevamente.'
            : 'No fue posible registrar el permiso. Inténtelo nuevamente.',
        ),
      )
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  const volverA = permisoId ? permisoDetailPath(permisoId) : PERMISOS_PATH
  const titulo = modo === 'editar' ? 'Editar permiso' : 'Registrar permiso'

  return (
    <main className="grid w-full min-w-0 gap-5 sm:gap-6">
      <header className="rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
          Administración · {RRHH_TITLE}
        </p>
        <h1 className="m-0 text-3xl font-black tracking-tight text-[#062e63] sm:text-4xl">{titulo}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500 sm:text-lg">
          {modo === 'editar'
            ? 'Actualice las fechas, el motivo o el colaborador del permiso.'
            : 'Anote el permiso otorgado a un colaborador. Quedará disponible para consultas posteriores.'}
        </p>
      </header>

      {cargando ? (
        <div className="grid gap-4 rounded-2xl border border-sky-100 bg-white p-6 sm:rounded-3xl sm:p-8" role="status">
          <span className="sr-only">Cargando permiso…</span>
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
              to={PERMISOS_PATH}
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
            <div className="grid gap-x-7 gap-y-6 lg:grid-cols-2 lg:gap-y-7">
              <label className="grid min-w-0 gap-2.5 lg:col-span-2">
                <span className="text-sm font-bold text-[#163f6b]">
                  Colaborador <span className="text-red-600">*</span>
                </span>
                <span className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5 ${errors.colaboradorId ? 'border-red-400' : 'border-slate-200 focus-within:border-blue-500'}`}>
                  <IconUser className={errors.colaboradorId ? 'text-red-500' : 'text-slate-400'} size={20} aria-hidden="true" />
                  <select
                    className="w-0 min-w-0 flex-1 truncate border-0 bg-transparent py-3 text-slate-800 outline-none"
                    value={values.colaboradorId}
                    required
                    aria-invalid={Boolean(errors.colaboradorId)}
                    onChange={(event) => update('colaboradorId', event.target.value)}
                  >
                    <option value="">Seleccione un colaborador</option>
                    {colaboradores.map((colaborador) => (
                      <option key={colaborador.id} value={String(colaborador.id)}>
                        {nombreCompleto(colaborador)} · {colaborador.cedula}
                      </option>
                    ))}
                  </select>
                </span>
                {errors.colaboradorId ? (
                  <small className="font-semibold text-red-600" role="alert">{errors.colaboradorId}</small>
                ) : null}
              </label>

              <label className="grid min-w-0 gap-2.5">
                <span className="text-sm font-bold text-[#163f6b]">
                  Fecha de inicio <span className="text-red-600">*</span>
                </span>
                <span className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5 ${errors.fechaInicio ? 'border-red-400' : 'border-slate-200 focus-within:border-blue-500'}`}>
                  <IconCalendarEvent className={errors.fechaInicio ? 'text-red-500' : 'text-slate-400'} size={20} aria-hidden="true" />
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
                  <small className="font-semibold text-red-600" role="alert">{errors.fechaInicio}</small>
                ) : null}
              </label>

              <label className="grid min-w-0 gap-2.5">
                <span className="text-sm font-bold text-[#163f6b]">
                  Fecha de fin <span className="text-red-600">*</span>
                </span>
                <span className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5 ${errors.fechaFin ? 'border-red-400' : 'border-slate-200 focus-within:border-blue-500'}`}>
                  <IconCalendarEvent className={errors.fechaFin ? 'text-red-500' : 'text-slate-400'} size={20} aria-hidden="true" />
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
                  <small className="font-semibold text-red-600" role="alert">{errors.fechaFin}</small>
                ) : null}
              </label>

              <label className="grid min-w-0 gap-2.5 lg:col-span-2">
                <span className="text-sm font-bold text-[#163f6b]">
                  Motivo <span className="text-red-600">*</span>
                </span>
                <span className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5 ${errors.motivo ? 'border-red-400' : 'border-slate-200 focus-within:border-blue-500'}`}>
                  <IconMessage2 className={errors.motivo ? 'text-red-500' : 'text-slate-400'} size={20} aria-hidden="true" />
                  <input
                    className="min-w-0 flex-1 border-0 bg-transparent py-3 text-slate-800 outline-none placeholder:text-slate-400"
                    maxLength={200}
                    placeholder="Ej. Cita médica, vacaciones, asunto personal"
                    value={values.motivo}
                    required
                    aria-invalid={Boolean(errors.motivo)}
                    onChange={(event) => update('motivo', event.target.value)}
                  />
                </span>
                {errors.motivo ? (
                  <small className="font-semibold text-red-600" role="alert">{errors.motivo}</small>
                ) : null}
              </label>

              <label className="grid min-w-0 gap-2.5 lg:col-span-2">
                <span className="text-sm font-bold text-[#163f6b]">Observaciones (opcional)</span>
                <textarea
                  className={`min-h-28 w-full rounded-xl border bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200 ${errors.observaciones ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
                  maxLength={500}
                  placeholder="Notas internas sobre el permiso"
                  value={values.observaciones}
                  aria-invalid={Boolean(errors.observaciones)}
                  onChange={(event) => update('observaciones', event.target.value)}
                />
                {errors.observaciones ? (
                  <small className="font-semibold text-red-600" role="alert">{errors.observaciones}</small>
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
                {saving ? 'Guardando permiso…' : 'Guardar permiso'}
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
