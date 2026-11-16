import { IconArrowLeft, IconAt, IconDeviceFloppy, IconId, IconRefresh, IconUser, IconUsers } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AdminShell, Button, Card, PageHeader } from '../../shared/ui'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { useAuth } from '../auth/components/AuthContext'
import {
  asociadoBackendFieldErrors,
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
      setErrors({ ...asociadoBackendFieldErrors(error), ...(parsed.cedula ? { cedula: parsed.cedula } : {}) })
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  if (loading) return <div className="grid gap-4 rounded-3xl border border-[#d7e5f1] bg-white p-8" role="status"><p className="font-bold text-blue-800">Cargando información del asociado…</p>{[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />)}</div>
  if (loadError || !values || !asociado) {
    return (
      <AdminShell className="gap-5 sm:gap-6">
        <Card as="section" padded className="grid place-items-center gap-4 text-center" role="alert">
          <p className="m-0 font-semibold text-red-800">
            {loadError ?? 'Asociado no encontrado.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {idValido ? (
              <Button
                type="button"
                variant="secondary"
                leftIcon={<IconRefresh size={18} aria-hidden="true" />}
                onClick={() => {
                  setLoading(true)
                  setLoadError(null)
                  setReload((value) => value + 1)
                }}
              >
                Reintentar
              </Button>
            ) : null}
            <Button
              to={ASOCIADOS_PATH}
              variant="secondary"
              leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
            >
              Volver al listado
            </Button>
          </div>
        </Card>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      className="gap-5 sm:gap-6"
      aria-labelledby="editar-asociado-title"
    >
      <PageHeader
        id="editar-asociado-title"
        eyebrow="Administración · Asociados"
        title="Editar asociado"
        description="Actualice la información personal y de contacto. El estado no se modifica desde este formulario."
      />
      {submitError ? (
        <AsociadoFeedback variant="error">{submitError}</AsociadoFeedback>
      ) : null}
      <Card as="section" padded className="!p-5 sm:!p-6 lg:!p-8">
        <form
          className="grid w-full gap-7 lg:gap-8"
          noValidate
          onSubmit={submit}
          aria-busy={saving}
        >
      <div className="flex items-start gap-3 border-b border-slate-100 pb-6 sm:gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eaf6ff] text-[#1e5a9c] sm:size-12"><IconUser size={25} /></span><div><h2 className="text-lg font-extrabold text-[#073b73] sm:text-xl">Información del asociado</h2><p className="mt-2 text-sm leading-6 text-slate-500">Edite únicamente los datos que desea actualizar. Todos los campos son obligatorios.</p></div></div>
      <div className="grid gap-x-7 gap-y-6 lg:grid-cols-2 lg:gap-y-7">{fields.map(({ name, label, icon: Icon, ...input }) => { const errorId = `${name}-error`; return <label className="grid min-w-0 gap-2.5" key={name}><span className="text-sm font-bold text-[#163f6b]">{label} <span className="text-red-600">*</span></span><span className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5 ${errors[name] ? 'border-red-400' : 'border-slate-200 focus-within:border-[#1e5a9c]'}`}><Icon className={errors[name] ? 'text-red-500' : 'text-slate-400'} size={20} /><input className="min-w-0 flex-1 border-0 bg-transparent py-3 text-slate-800 outline-none placeholder:text-slate-400" {...input} value={values[name]} required aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? errorId : undefined} onChange={(event) => update(name, event.target.value)} /></span>{errors[name] ? <small id={errorId} className="font-semibold text-red-600" role="alert">{errors[name]}</small> : null}</label> })}</div>
      <div className="mt-1 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:gap-4"><Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto" disabled={saving} loading={saving} leftIcon={<IconDeviceFloppy size={20} aria-hidden="true" />}>{saving ? 'Guardando cambios…' : 'Guardar cambios'}</Button><Button to={volverA} variant="secondary" size="lg" className="w-full sm:w-auto" leftIcon={<IconArrowLeft size={19} aria-hidden="true" />}>Cancelar</Button></div>
        </form>
      </Card>
    </AdminShell>
  )
}
