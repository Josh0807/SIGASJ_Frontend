import { IconArrowLeft, IconAt, IconDeviceFloppy, IconId, IconUser, IconUsers } from '@tabler/icons-react'
import { useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminShell, Button, Card, PageHeader } from '../../shared/ui'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { useAuth } from '../auth/components/AuthContext'
import { asociadoBackendFieldErrors, asociadoSubmitError, toRegistrarAsociadoPayload, validateAsociado, type AsociadoFormErrors } from './asociadoForm'
import { registrarAsociado } from './asociadosApi'
import { ASOCIADOS_PATH } from './asociadosPaths'
import type { AsociadoFormValues } from './types'
import AsociadoFeedback from './AsociadoFeedback'

const EMPTY_VALUES: AsociadoFormValues = { nombre: '', apellidos: '', cedula: '', correoElectronico: '' }
type FieldName = keyof AsociadoFormValues
const fields: Array<{ name: FieldName; label: string; placeholder: string; maxLength: number; type?: 'email'; autoComplete: string; icon: typeof IconUser }> = [
  { name: 'nombre', label: 'Nombre', placeholder: 'Ej. Juan', maxLength: 100, autoComplete: 'given-name', icon: IconUser },
  { name: 'apellidos', label: 'Apellidos', placeholder: 'Ej. Pérez Rodríguez', maxLength: 100, autoComplete: 'family-name', icon: IconUsers },
  { name: 'cedula', label: 'Cédula', placeholder: 'Ej. 1-1234-0567', maxLength: 30, autoComplete: 'off', icon: IconId },
  { name: 'correoElectronico', label: 'Correo electrónico', placeholder: 'nombre@ejemplo.com', maxLength: 150, type: 'email', autoComplete: 'email', icon: IconAt },
]

export default function RegistrarAsociadoPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [values, setValues] = useState(EMPTY_VALUES)
  const [errors, setErrors] = useState<AsociadoFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)

  const update = (name: FieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitError(null)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = validateAsociado(values)
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
      await registrarAsociado(toRegistrarAsociadoPayload(values))
      navigate(ASOCIADOS_PATH, { replace: true, state: { success: 'Asociado registrado correctamente.' } })
    } catch (error) {
      if (error instanceof Error && /HTTP 401/.test(error.message)) {
        logout()
        navigate(LOGIN_ROUTE_PATH, { replace: true })
        return
      }
      setErrors(asociadoBackendFieldErrors(error))
      setSubmitError(asociadoSubmitError(error))
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <AdminShell
      className="gap-5 sm:gap-6"
      aria-labelledby="registrar-asociado-title"
    >
      <PageHeader
        id="registrar-asociado-title"
        eyebrow="Administración · Asociados"
        title="Registrar asociado"
        description="Ingrese la información personal y de contacto del nuevo asociado."
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
      <div className="flex items-start gap-3 border-b border-slate-100 pb-6 sm:gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eaf6ff] text-[#1e5a9c] sm:size-12"><IconUser size={25} aria-hidden="true" /></span><div className="min-w-0"><h2 className="text-lg font-extrabold leading-tight tracking-tight text-[#073b73] sm:text-xl">Información del asociado</h2><p className="mt-2 text-sm leading-6 text-slate-500">Todos los campos marcados con <span className="font-bold text-red-600">*</span> son obligatorios.</p></div></div>
      <div className="grid gap-x-7 gap-y-6 lg:grid-cols-2 lg:gap-y-7">
        {fields.map(({ name, label, icon: Icon, ...input }) => {
          const errorId = `${name}-error`
          return <label className="grid min-w-0 gap-2.5" key={name}>
            <span className="text-sm font-bold text-[#163f6b]">{label} <span className="text-red-600" aria-hidden="true">*</span><span className="sr-only"> (obligatorio)</span></span>
            <span className={`flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 sm:px-5 ${errors[name] ? 'border-red-400 focus-within:border-red-500' : 'border-slate-200 focus-within:border-[#1e5a9c]'}`}>
              <Icon className={errors[name] ? 'text-red-500' : 'text-slate-400'} size={20} aria-hidden="true" />
              <input className="min-w-0 flex-1 border-0 bg-transparent py-3 text-slate-800 outline-none placeholder:text-slate-400" {...input} value={values[name]} required aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? errorId : undefined} onChange={(event) => update(name, event.target.value)} />
            </span>
            {errors[name] ? <small className="font-semibold text-red-600" id={errorId} role="alert">{errors[name]}</small> : null}
          </label>
        })}
      </div>
      <div className="mt-1 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:gap-4 lg:pt-7">
        <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto" disabled={saving} loading={saving} leftIcon={<IconDeviceFloppy size={20} aria-hidden="true" />}>{saving ? 'Guardando asociado…' : 'Guardar asociado'}</Button>
        <Button to={ASOCIADOS_PATH} variant="secondary" size="lg" className="w-full sm:w-auto" leftIcon={<IconArrowLeft size={19} aria-hidden="true" />}>Cancelar</Button>
      </div>
        </form>
      </Card>
    </AdminShell>
  )
}
