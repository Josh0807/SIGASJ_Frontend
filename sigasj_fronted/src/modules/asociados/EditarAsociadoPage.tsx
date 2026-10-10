import { IconArrowLeft, IconAt, IconDeviceFloppy, IconId, IconRefresh, IconUser, IconUsers } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { useAuth } from '../auth/components/AuthContext'
import {
  asociadoConsultaError,
  asociadoToFormValues,
  asociadoUpdateError,
  esNoAutenticado,
  toActualizarAsociadoPayload,
  validateAsociado,
  type AsociadoFormErrors,
} from './asociadoForm'
import { actualizarAsociado, getAsociado } from './asociadosApi'
import { ASOCIADOS_PATH, asociadoDetailPath } from './asociadosPaths'
import type { Asociado, AsociadoFormValues } from './types'
import AsociadoFeedback from './AsociadoFeedback'

type FieldName = keyof AsociadoFormValues
const fields: Array<{ name: FieldName; label: string; placeholder: string; maxLength: number; type?: 'email'; autoComplete: string; icon: typeof IconUser }> = [
  { name: 'nombre', label: 'Nombre', placeholder: 'Ej. Carlos Alberto', maxLength: 100, autoComplete: 'given-name', icon: IconUser },
  { name: 'apellidos', label: 'Apellidos', placeholder: 'Ej. Pérez Gómez', maxLength: 100, autoComplete: 'family-name', icon: IconUsers },
  { name: 'cedula', label: 'Cédula', placeholder: 'Ej. 1-1234-0567', maxLength: 30, autoComplete: 'off', icon: IconId },
  { name: 'correoElectronico', label: 'Correo electrónico', placeholder: 'nombre@ejemplo.com', maxLength: 150, type: 'email', autoComplete: 'email', icon: IconAt },
]

export default function EditarAsociadoPage() {
  const { id } = useParams()
  const asociadoId = Number(id)
  const idValido = Number.isInteger(asociadoId) && asociadoId > 0
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const volverA = (location.state as { from?: string } | null)?.from ?? asociadoDetailPath(asociadoId)
  const [asociado, setAsociado] = useState<Asociado | null>(null)
  const [values, setValues] = useState<AsociadoFormValues | null>(null)
  const [errors, setErrors] = useState<AsociadoFormErrors>({})
  const [loadError, setLoadError] = useState<string | null>(idValido ? null : 'El identificador del asociado no es válido.')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(idValido)
  const [saving, setSaving] = useState(false)
  const [reload, setReload] = useState(0)
  const submitting = useRef(false)

  const leaveForLogin = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  useEffect(() => {
    if (!idValido) return undefined
    const controller = new AbortController()
    getAsociado(asociadoId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setAsociado(data)
        setValues(asociadoToFormValues(data))
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        if (esNoAutenticado(error)) return leaveForLogin()
        setLoadError(asociadoConsultaError(error, 'No fue posible cargar el asociado.'))
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [asociadoId, idValido, leaveForLogin, reload])

  const update = (name: FieldName, value: string) => {
    setValues((current) => current ? { ...current, [name]: value } : current)
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitError(null)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!values || !asociado || submitting.current) return
    const nextErrors = validateAsociado(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setSubmitError('Revise los campos señalados.')
      event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    const payload = toActualizarAsociadoPayload(values, asociadoToFormValues(asociado))
    if (!Object.keys(payload).length) {
      setSubmitError('Realice al menos un cambio antes de guardar.')
      return
    }
    submitting.current = true
    setSaving(true)
    setSubmitError(null)
    try {
      await actualizarAsociado(asociadoId, payload)
      navigate(asociadoDetailPath(asociadoId), { replace: true, state: { from: volverA, success: 'Asociado actualizado correctamente.' } })
    } catch (error) {
      if (esNoAutenticado(error)) return leaveForLogin()
      const parsed = asociadoUpdateError(error)
      setSubmitError(parsed.message)
      if (parsed.cedula) setErrors((current) => ({ ...current, cedula: parsed.cedula }))
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  if (loading) return <div className="grid gap-4 rounded-3xl border border-sky-100 bg-white p-8" role="status"><p className="font-bold text-blue-800">Cargando información del asociado…</p>{[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />)}</div>
  if (loadError || !values || !asociado) return <div className="grid place-items-center gap-4 rounded-3xl border border-red-200 bg-red-50 p-8 text-center" role="alert"><p className="font-semibold text-red-800">{loadError ?? 'Asociado no encontrado.'}</p><div className="flex flex-wrap justify-center gap-3">{idValido ? <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 font-bold text-blue-800" onClick={() => { setLoading(true); setLoadError(null); setReload((value) => value + 1) }}><IconRefresh size={18} />Reintentar</button> : null}<Link className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 font-bold text-slate-700 no-underline" to={ASOCIADOS_PATH}><IconArrowLeft size={18} />Volver al listado</Link></div></div>

  return <main className="grid w-full gap-5 sm:gap-6">
    <header className="rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8"><p className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">Administración · Asociados</p><h1 className="m-0 text-3xl font-black tracking-tight text-[#062e63] sm:text-4xl">Editar asociado</h1><p className="mt-3 max-w-3xl text-base leading-7 text-slate-500 sm:text-lg">Actualice la información personal y de contacto. El estado no se modifica desde este formulario.</p></header>
    {submitError ? <AsociadoFeedback variant="error">{submitError}</AsociadoFeedback> : null}
    <form className="grid w-full gap-7 rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-8 lg:gap-8 lg:p-10" noValidate onSubmit={submit} aria-busy={saving}>
      <div className="flex items-start gap-3 border-b border-slate-100 pb-6 sm:gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700 sm:size-12"><IconUser size={25} /></span><div><h2 className="text-lg font-extrabold text-[#073b73] sm:text-xl">Información del asociado</h2><p className="mt-2 text-sm leading-6 text-slate-500">Edite únicamente los datos que desea actualizar. Todos los campos son obligatorios.</p></div></div>
      <div className="grid gap-x-7 gap-y-6 lg:grid-cols-2 lg:gap-y-7">{fields.map(({ name, label, icon: Icon, ...input }) => { const errorId = `${name}-error`; return <label className="grid min-w-0 gap-2.5" key={name}><span className="text-sm font-bold text-[#163f6b]">{label} <span className="text-red-600">*</span></span><span className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5 ${errors[name] ? 'border-red-400' : 'border-slate-200 focus-within:border-blue-500'}`}><Icon className={errors[name] ? 'text-red-500' : 'text-slate-400'} size={20} /><input className="min-w-0 flex-1 border-0 bg-transparent py-3 text-slate-800 outline-none placeholder:text-slate-400" {...input} value={values[name]} required aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? errorId : undefined} onChange={(event) => update(name, event.target.value)} /></span>{errors[name] ? <small id={errorId} className="font-semibold text-red-600" role="alert">{errors[name]}</small> : null}</label> })}</div>
      <div className="mt-1 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:gap-4"><button type="submit" disabled={saving} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-500 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-7 py-3.5 font-extrabold text-white shadow-[0_11px_26px_rgba(37,99,235,0.3)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none sm:w-auto"><IconDeviceFloppy size={20} />{saving ? 'Guardando cambios…' : 'Guardar cambios'}</button><Link to={volverA} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-6 py-3.5 font-extrabold text-blue-900 no-underline shadow-sm transition hover:bg-blue-50 hover:no-underline sm:w-auto"><IconArrowLeft size={19} />Cancelar</Link></div>
    </form>
  </main>
}
