import {
  IconBeach,
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconDeviceFloppy,
  IconHash,
  IconHistory,
  IconRefresh,
  IconUser,
} from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { useAuth } from '../auth/components/AuthContext'
import EstadoBadge from './EstadoBadge'
import { getColaboradoresOpciones } from './colaboradoresApi'
import { esNoAutenticado, esReintentable, nombreCompleto } from './colaboradorForm'
import { RRHH_TITLE } from './recursosHumanosPaths'
import RrhhSubnav from './RrhhSubnav'
import type {
  BalanceVacaciones,
  Colaborador,
  MovimientosVacacionesListado,
  MovimientoVacacionesFormValues,
} from './types'
import {
  MOVIMIENTOS_VACACIONES_PAGE_SIZE,
  getBalanceVacaciones,
  getMovimientosVacaciones,
  registrarMovimientoVacaciones,
} from './vacacionesApi'
import {
  EMPTY_MOVIMIENTO_VACACIONES_VALUES,
  TIPOS_MOVIMIENTO_VACACIONES,
  avisoMovimientoRegistrado,
  diasConSigno,
  formatearFechaMovimiento,
  tipoMovimientoLabel,
  toMovimientoVacacionesPayload,
  vacacionesErrorMessage,
  validateMovimientoVacaciones,
  type MovimientoVacacionesFormErrors,
} from './vacacionesForm'

type Carga = { clave: string; error: string | null; reintentable: boolean }

const leerParams = (params: URLSearchParams) => {
  const colaboradorId = Number(params.get('colaboradorId'))
  const page = Number(params.get('page'))
  return {
    colaboradorId:
      Number.isInteger(colaboradorId) && colaboradorId > 0 ? colaboradorId : null,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

function TarjetaSaldo({
  label,
  dias,
  tono,
}: {
  label: string
  dias: number
  tono: 'azul' | 'ambar' | 'violeta' | 'verde'
}) {
  const tonos = {
    azul: 'border-sky-100 bg-sky-50/70 text-sky-900',
    ambar: 'border-amber-100 bg-amber-50/70 text-amber-900',
    violeta: 'border-violet-100 bg-violet-50/70 text-violet-900',
    verde: 'border-emerald-100 bg-emerald-50/80 text-emerald-900',
  }
  const mostrar = Number.isFinite(dias) ? dias : 0
  return (
    <div className={`grid min-w-0 gap-1 rounded-2xl border px-5 py-4 ${tonos[tono]}`}>
      <dt className="text-xs font-extrabold uppercase tracking-wider opacity-70">{label}</dt>
      <dd className="m-0 flex items-baseline gap-1.5">
        <span className="text-3xl font-black tabular-nums sm:text-4xl">{mostrar}</span>
        <span className="font-bold opacity-80">{Math.abs(mostrar) === 1 ? 'día' : 'días'}</span>
      </dd>
    </div>
  )
}

export default function VacacionesPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const { colaboradorId, page } = leerParams(searchParams)

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [balance, setBalance] = useState<BalanceVacaciones | null>(null)
  const [historial, setHistorial] = useState<MovimientosVacacionesListado | null>(null)
  const [cargaBalance, setCargaBalance] = useState<Carga>({ clave: '', error: null, reintentable: true })
  const [cargaHistorial, setCargaHistorial] = useState<Carga>({ clave: '', error: null, reintentable: true })
  const [recarga, setRecarga] = useState(0)
  const [aviso, setAviso] = useState<string | null>(null)

  const [values, setValues] = useState(EMPTY_MOVIMIENTO_VACACIONES_VALUES)
  const [errors, setErrors] = useState<MovimientoVacacionesFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  const actualizarParams = useCallback(
    (cambios: { colaboradorId?: number | null; page?: number }) => {
      setSearchParams(
        (actuales) => {
          const siguientes = new URLSearchParams(actuales)
          const base = leerParams(actuales)
          const resultado = { ...base, page: 1, ...cambios }
          if (resultado.colaboradorId) {
            siguientes.set('colaboradorId', String(resultado.colaboradorId))
          } else {
            siguientes.delete('colaboradorId')
          }
          if (resultado.page > 1) {
            siguientes.set('page', String(resultado.page))
          } else {
            siguientes.delete('page')
          }
          return siguientes
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  useEffect(() => {
    const controller = new AbortController()
    getColaboradoresOpciones(controller.signal)
      .then((respuesta) => {
        if (!controller.signal.aborted) setColaboradores(respuesta.data)
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted && esNoAutenticado(err)) salirPorSesion()
      })
    return () => controller.abort()
  }, [salirPorSesion])

  const claveBalance = `${colaboradorId}:${recarga}`
  const cargandoBalance = colaboradorId !== null && cargaBalance.clave !== claveBalance
  const errorBalance = cargandoBalance ? null : cargaBalance.error

  useEffect(() => {
    if (colaboradorId === null) return undefined
    const controller = new AbortController()
    getBalanceVacaciones(colaboradorId, controller.signal)
      .then((respuesta) => {
        if (controller.signal.aborted) return
        setBalance(respuesta)
        setCargaBalance({ clave: claveBalance, error: null, reintentable: true })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (esNoAutenticado(err)) {
          salirPorSesion()
          return
        }
        setCargaBalance({
          clave: claveBalance,
          error: vacacionesErrorMessage(err, 'No fue posible cargar el saldo de vacaciones.'),
          reintentable: esReintentable(err),
        })
      })
    return () => controller.abort()
  }, [claveBalance, colaboradorId, salirPorSesion])

  const claveHistorial = `${colaboradorId}:${page}:${recarga}`
  const cargandoHistorial = colaboradorId !== null && cargaHistorial.clave !== claveHistorial
  const errorHistorial = cargandoHistorial ? null : cargaHistorial.error

  useEffect(() => {
    if (colaboradorId === null) return undefined
    const controller = new AbortController()
    getMovimientosVacaciones(
      { colaboradorId: String(colaboradorId), tipo: '', fechaInicio: '', fechaFin: '', page },
      controller.signal,
    )
      .then((respuesta) => {
        if (controller.signal.aborted) return
        setHistorial(respuesta)
        setCargaHistorial({ clave: claveHistorial, error: null, reintentable: true })
        if (respuesta.totalPages > 0 && page > respuesta.totalPages) {
          actualizarParams({ colaboradorId, page: respuesta.totalPages })
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (esNoAutenticado(err)) {
          salirPorSesion()
          return
        }
        setCargaHistorial({
          clave: claveHistorial,
          error: vacacionesErrorMessage(err, 'No fue posible cargar el historial de vacaciones.'),
          reintentable: esReintentable(err),
        })
      })
    return () => controller.abort()
  }, [claveHistorial, colaboradorId, page, salirPorSesion, actualizarParams])

  const seleccionarColaborador = (valor: string) => {
    const id = Number(valor)
    setAviso(null)
    setSubmitError(null)
    setErrors({})
    setValues(EMPTY_MOVIMIENTO_VACACIONES_VALUES)
    actualizarParams({ colaboradorId: Number.isInteger(id) && id > 0 ? id : null, page: 1 })
  }

  const update = (name: keyof MovimientoVacacionesFormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setSubmitError(null)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current || colaboradorId === null) return
    const disponibles = balance && balance.colaboradorId === colaboradorId ? balance.diasDisponibles : null
    const nextErrors = validateMovimientoVacaciones(values, disponibles)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setSubmitError('Revise los campos señalados.')
      event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    submitting.current = true
    setSaving(true)
    setSubmitError(null)
    setAviso(null)
    try {
      const movimiento = await registrarMovimientoVacaciones(
        toMovimientoVacacionesPayload(colaboradorId, values),
      )
      setValues(EMPTY_MOVIMIENTO_VACACIONES_VALUES)
      setAviso(
        avisoMovimientoRegistrado(
          movimiento.tipo,
          movimiento.cantidadDias,
          movimiento.signoAjuste,
        ),
      )
      // El saldo lo recalcula el servidor: se vuelve a consultar en lugar de sumar en el cliente.
      setRecarga((n) => n + 1)
      if (page !== 1) actualizarParams({ colaboradorId, page: 1 })
    } catch (error) {
      if (esNoAutenticado(error)) {
        salirPorSesion()
        return
      }
      setSubmitError(
        vacacionesErrorMessage(error, 'No fue posible registrar el movimiento. Inténtelo nuevamente.'),
      )
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  const colaboradorSeleccionado =
    colaboradores.find((item) => item.id === colaboradorId) ?? null
  const balanceVisible = balance && balance.colaboradorId === colaboradorId ? balance : null
  const nombre = balanceVisible
    ? nombreCompleto(balanceVisible.colaborador)
    : colaboradorSeleccionado
      ? nombreCompleto(colaboradorSeleccionado)
      : colaboradorId
        ? `Colaborador #${colaboradorId}`
        : ''

  const movimientos = historial?.data ?? []
  const total = historial?.total ?? 0
  const totalPages = historial?.totalPages ?? 0
  const desde = total ? (page - 1) * MOVIMIENTOS_VACACIONES_PAGE_SIZE + 1 : 0
  const hasta = Math.min(page * MOVIMIENTOS_VACACIONES_PAGE_SIZE, total)

  return (
    <main className="grid w-full min-w-0 gap-5 sm:gap-6">
      <RrhhSubnav />
      <header className="rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_34px_rgba(30,90,156,0.08)] sm:rounded-3xl sm:p-8">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-blue-600">
          Administración · {RRHH_TITLE}
        </p>
        <h1 className="m-0 text-3xl font-black tracking-tight text-[#062e63] sm:text-4xl">
          Vacaciones del personal
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
          Consulte el saldo de vacaciones de cada colaborador y registre adquisiciones o disfrutes.
          El saldo lo calcula el sistema a partir del historial.
        </p>
      </header>

      <section
        className="grid gap-2 rounded-2xl border border-sky-100 bg-white p-5 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-6"
        aria-label="Selección de colaborador"
      >
        <label className="grid min-w-0 gap-2 lg:max-w-xl">
          <span className="text-sm font-bold text-[#163f6b]">Colaborador</span>
          <span className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
            <IconUser className="text-slate-400" size={20} aria-hidden="true" />
            <select
              className="w-0 min-w-0 flex-1 truncate border-0 bg-transparent py-3 text-slate-800 outline-none"
              value={colaboradorId ? String(colaboradorId) : ''}
              onChange={(event) => seleccionarColaborador(event.target.value)}
              aria-label="Seleccione un colaborador"
            >
              <option value="">Seleccione un colaborador</option>
              {colaboradores.map((colaborador) => (
                <option key={colaborador.id} value={String(colaborador.id)}>
                  {nombreCompleto(colaborador)} · {colaborador.cedula}
                </option>
              ))}
            </select>
          </span>
        </label>
      </section>

      {colaboradorId === null ? (
        <div className="grid place-items-center gap-3 rounded-2xl border border-sky-100 bg-white p-10 text-center shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl">
          <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
            <IconBeach size={28} aria-hidden="true" />
          </span>
          <h2 className="m-0 text-lg font-extrabold text-[#073b73]">Seleccione un colaborador</h2>
          <p className="m-0 max-w-md text-slate-500">
            Elija un colaborador para ver sus días adquiridos, disfrutados y disponibles, y para
            registrar nuevos movimientos.
          </p>
        </div>
      ) : (
        <>
          {aviso ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-semibold text-emerald-800" role="status">
              {aviso}
            </div>
          ) : null}

          <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
            <section
              className="grid gap-5 rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-8"
              aria-label="Saldo de vacaciones"
              aria-busy={cargandoBalance}
            >
              {cargandoBalance && !balanceVisible ? (
                <div className="grid gap-4" role="status">
                  <span className="sr-only">Cargando saldo de vacaciones…</span>
                  {[0, 1, 2].map((fila) => (
                    <div key={fila} className="h-14 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" aria-hidden="true" />
                  ))}
                </div>
              ) : errorBalance ? (
                <div className="grid place-items-center gap-4 text-center" role="alert">
                  <p className="m-0 font-semibold text-red-700">{errorBalance}</p>
                  {cargaBalance.reintentable ? (
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 font-bold text-blue-800 transition hover:bg-blue-50"
                      onClick={() => setRecarga((n) => n + 1)}
                    >
                      <IconRefresh size={18} aria-hidden="true" />
                      Reintentar
                    </button>
                  ) : null}
                </div>
              ) : balanceVisible ? (
                <>
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-[0_10px_22px_rgba(37,99,235,0.28)]">
                      <IconBeach size={28} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.12em] text-blue-600">
                        Saldo de vacaciones
                      </p>
                      <h2 className="m-0 break-words text-2xl font-black tracking-tight text-[#062e63] sm:text-3xl">
                        {nombre}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-slate-500">
                        <span className="font-semibold">{balanceVisible.colaborador.cargo}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-sm">{balanceVisible.colaborador.cedula}</span>
                        <EstadoBadge activo={balanceVisible.colaborador.activo} />
                      </div>
                    </div>
                  </div>
                  <dl className={`m-0 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${cargandoBalance ? 'opacity-60' : ''}`}>
                    <TarjetaSaldo label="Adquiridas" dias={balanceVisible.diasAcumulados} tono="azul" />
                    <TarjetaSaldo label="Disfrutadas" dias={balanceVisible.diasDisfrutados} tono="ambar" />
                    <TarjetaSaldo
                      label="Ajustes netos"
                      dias={balanceVisible.diasAjusteNeto ?? 0}
                      tono="violeta"
                    />
                    <TarjetaSaldo label="Disponibles" dias={balanceVisible.diasDisponibles} tono="verde" />
                  </dl>
                  <p className="m-0 text-sm text-slate-500">
                    {balanceVisible.totalMovimientos === 0
                      ? 'Aún no hay movimientos registrados para este colaborador.'
                      : `Calculado a partir de ${balanceVisible.totalMovimientos} movimiento${balanceVisible.totalMovimientos === 1 ? '' : 's'}.`}
                  </p>
                </>
              ) : null}
            </section>

            <section
              className="rounded-2xl border border-sky-100 bg-white px-5 py-6 shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl sm:p-8"
              aria-label="Registrar movimiento de vacaciones"
            >
              <h2 className="m-0 text-lg font-extrabold text-[#073b73]">Registrar movimiento</h2>
              <p className="mb-5 mt-1 text-sm text-slate-500">
                Disfrutes y ajustes que resten no pueden superar el saldo disponible. El ajuste exige motivo.
              </p>
              {submitError ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">
                  {submitError}
                </div>
              ) : null}
              <form className="grid gap-5" noValidate onSubmit={submit} aria-busy={saving} aria-label="Formulario de movimiento de vacaciones">
                <fieldset className="m-0 grid gap-2 border-0 p-0">
                  <legend className="mb-2 text-sm font-bold text-[#163f6b]">
                    Tipo <span className="text-red-600">*</span>
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {TIPOS_MOVIMIENTO_VACACIONES.map((tipo) => {
                      const activo = values.tipo === tipo.value
                      return (
                        <label
                          key={tipo.value}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                            activo
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : errors.tipo
                                ? 'border-red-400 bg-white'
                                : 'border-slate-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="tipo"
                            className="mt-1 accent-blue-600"
                            value={tipo.value}
                            checked={activo}
                            aria-invalid={Boolean(errors.tipo)}
                            onChange={() => {
                              update('tipo', tipo.value)
                              if (tipo.value !== 'AJUSTE') update('signoAjuste', '')
                            }}
                          />
                          <span className="grid gap-0.5">
                            <span className="font-extrabold text-[#073b73]">{tipo.label}</span>
                            <span className="text-xs text-slate-500">{tipo.descripcion}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                  {errors.tipo ? (
                    <small className="font-semibold text-red-600" role="alert">{errors.tipo}</small>
                  ) : null}
                </fieldset>

                {values.tipo === 'AJUSTE' ? (
                  <fieldset className="m-0 grid gap-2 border-0 p-0">
                    <legend className="mb-2 text-sm font-bold text-[#163f6b]">
                      Efecto del ajuste <span className="text-red-600">*</span>
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(
                        [
                          { value: '1' as const, label: 'Suma días' },
                          { value: '-1' as const, label: 'Resta días' },
                        ] as const
                      ).map((opcion) => (
                        <label
                          key={opcion.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                            values.signoAjuste === opcion.value
                              ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200'
                              : errors.signoAjuste
                                ? 'border-red-400 bg-white'
                                : 'border-slate-200 bg-white hover:border-violet-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="signoAjuste"
                            className="accent-violet-600"
                            value={opcion.value}
                            checked={values.signoAjuste === opcion.value}
                            onChange={() => update('signoAjuste', opcion.value)}
                          />
                          <span className="font-extrabold text-[#073b73]">{opcion.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.signoAjuste ? (
                      <small className="font-semibold text-red-600" role="alert">
                        {errors.signoAjuste}
                      </small>
                    ) : null}
                  </fieldset>
                ) : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid min-w-0 gap-2">
                    <span className="text-sm font-bold text-[#163f6b]">
                      Días <span className="text-red-600">*</span>
                    </span>
                    <span className={`flex min-h-12 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 ${errors.cantidadDias ? 'border-red-400' : 'border-slate-200 focus-within:border-blue-500'}`}>
                      <IconHash className={errors.cantidadDias ? 'text-red-500' : 'text-slate-400'} size={20} aria-hidden="true" />
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        step={1}
                        className="min-w-0 flex-1 border-0 bg-transparent py-3 text-slate-800 outline-none placeholder:text-slate-400"
                        placeholder="Ej. 3"
                        value={values.cantidadDias}
                        required
                        aria-label="Cantidad de días"
                        aria-invalid={Boolean(errors.cantidadDias)}
                        onChange={(event) => update('cantidadDias', event.target.value)}
                      />
                    </span>
                    {errors.cantidadDias ? (
                      <small className="font-semibold text-red-600" role="alert">{errors.cantidadDias}</small>
                    ) : null}
                  </label>

                  <label className="grid min-w-0 gap-2">
                    <span className="text-sm font-bold text-[#163f6b]">
                      Fecha <span className="text-red-600">*</span>
                    </span>
                    <span className={`flex min-h-12 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:ring-2 focus-within:ring-blue-200 ${errors.fecha ? 'border-red-400' : 'border-slate-200 focus-within:border-blue-500'}`}>
                      <IconCalendarEvent className={errors.fecha ? 'text-red-500' : 'text-slate-400'} size={20} aria-hidden="true" />
                      <input
                        type="date"
                        className="min-w-0 flex-1 border-0 bg-transparent py-3 text-slate-800 outline-none"
                        value={values.fecha}
                        required
                        aria-label="Fecha del movimiento"
                        aria-invalid={Boolean(errors.fecha)}
                        onChange={(event) => update('fecha', event.target.value)}
                      />
                    </span>
                    {errors.fecha ? (
                      <small className="font-semibold text-red-600" role="alert">{errors.fecha}</small>
                    ) : null}
                  </label>
                </div>

                <label className="grid min-w-0 gap-2">
                  <span className="text-sm font-bold text-[#163f6b]">
                    {values.tipo === 'AJUSTE' ? (
                      <>
                        Motivo <span className="text-red-600">*</span>
                      </>
                    ) : (
                      'Observaciones (opcional)'
                    )}
                  </span>
                  <textarea
                    className={`min-h-24 w-full rounded-xl border bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200 ${errors.observaciones ? 'border-red-400' : 'border-slate-200 focus:border-blue-500'}`}
                    maxLength={500}
                    placeholder={
                      values.tipo === 'AJUSTE'
                        ? 'Motivo del ajuste administrativo'
                        : 'Ej. Vacaciones de fin de año'
                    }
                    value={values.observaciones}
                    aria-invalid={Boolean(errors.observaciones)}
                    onChange={(event) => update('observaciones', event.target.value)}
                  />
                  {errors.observaciones ? (
                    <small className="font-semibold text-red-600" role="alert">{errors.observaciones}</small>
                  ) : null}
                </label>

                <button
                  type="submit"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-blue-500 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-6 py-3 font-extrabold text-white shadow-[0_11px_26px_rgba(37,99,235,0.3)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none motion-reduce:transform-none"
                  disabled={saving}
                >
                  <IconDeviceFloppy size={20} aria-hidden="true" />
                  {saving ? 'Guardando movimiento…' : 'Guardar movimiento'}
                </button>
              </form>
            </section>
          </div>

          <section
            className="min-w-0 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl"
            aria-label="Historial de movimientos de vacaciones"
            aria-busy={cargandoHistorial}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <IconHistory className="text-blue-600" size={22} aria-hidden="true" />
              <h2 className="m-0 text-lg font-extrabold text-[#073b73]">Historial de movimientos</h2>
            </div>

            {cargandoHistorial && !historial ? (
              <div className="grid gap-3 p-6" role="status">
                <span className="sr-only">Cargando historial…</span>
                {[0, 1, 2].map((fila) => (
                  <div key={fila} className="h-14 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" aria-hidden="true" />
                ))}
              </div>
            ) : errorHistorial ? (
              <div className="grid place-items-center gap-4 p-10 text-center" role="alert">
                <p className="m-0 font-semibold text-red-700">{errorHistorial}</p>
                {cargaHistorial.reintentable ? (
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 font-bold text-blue-800 transition hover:bg-blue-50"
                    onClick={() => setRecarga((n) => n + 1)}
                  >
                    <IconRefresh size={18} aria-hidden="true" />
                    Reintentar
                  </button>
                ) : null}
              </div>
            ) : movimientos.length === 0 ? (
              <div className="grid place-items-center gap-3 p-10 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                  <IconHistory size={28} aria-hidden="true" />
                </span>
                <h2 className="m-0 text-lg font-extrabold text-[#073b73]">Sin movimientos</h2>
                <p className="m-0 max-w-md text-slate-500">
                  Registre el primer movimiento de vacaciones de {nombre || 'este colaborador'} con el
                  formulario de arriba.
                </p>
              </div>
            ) : (
              <table className={`w-full border-collapse text-left transition-opacity ${cargandoHistorial ? 'opacity-60' : ''}`}>
                <thead className="hidden bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-500 md:table-header-group">
                  <tr>
                    <th scope="col" className="px-6 py-4">Fecha</th>
                    <th scope="col" className="px-6 py-4">Tipo</th>
                    <th scope="col" className="px-6 py-4 text-right">Días</th>
                    <th scope="col" className="px-6 py-4">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="block divide-y divide-slate-100 md:table-row-group">
                  {movimientos.map((movimiento) => {
                    const disfrutado = movimiento.tipo === 'DISFRUTADO'
                    return (
                      <tr key={movimiento.id} className="grid gap-2 px-5 py-4 transition hover:bg-sky-50/50 md:table-row md:p-0">
                        <td className="flex items-center justify-between gap-3 md:table-cell md:px-6 md:py-4">
                          <span className="text-xs font-bold uppercase text-slate-400 md:hidden">Fecha</span>
                          <span className="font-semibold tabular-nums text-slate-700">{formatearFechaMovimiento(movimiento.fecha)}</span>
                        </td>
                        <td className="flex items-center justify-between gap-3 md:table-cell md:px-6 md:py-4">
                          <span className="text-xs font-bold uppercase text-slate-400 md:hidden">Tipo</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${
                              disfrutado
                                ? 'bg-amber-50 text-amber-800 ring-amber-200'
                                : 'bg-sky-50 text-sky-800 ring-sky-200'
                            }`}
                          >
                            {tipoMovimientoLabel(movimiento.tipo)}
                          </span>
                        </td>
                        <td className="flex items-center justify-between gap-3 md:table-cell md:px-6 md:py-4 md:text-right">
                          <span className="text-xs font-bold uppercase text-slate-400 md:hidden">Días</span>
                          <span className={`font-black tabular-nums ${disfrutado ? 'text-amber-700' : 'text-emerald-700'}`}>
                            {diasConSigno(movimiento)}
                          </span>
                        </td>
                        <td className="flex items-start justify-between gap-3 md:table-cell md:px-6 md:py-4">
                          <span className="text-xs font-bold uppercase text-slate-400 md:hidden">Observaciones</span>
                          <span className="min-w-0 break-words text-right text-slate-600 md:text-left">
                            {movimiento.observaciones ?? '—'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}

            {!errorHistorial && total > 0 ? (
              <nav
                className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:px-6"
                aria-label="Paginación del historial"
              >
                <p className="m-0">
                  Mostrando {desde}–{hasta} de {total} movimiento{total === 1 ? '' : 's'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rrhh-touch-target inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => actualizarParams({ colaboradorId, page: page - 1 })}
                    disabled={page <= 1 || cargandoHistorial}
                  >
                    <IconChevronLeft size={17} aria-hidden="true" />
                    Anterior
                  </button>
                  <span className="px-2 font-semibold text-slate-600">
                    Página {page} de {Math.max(totalPages, 1)}
                  </span>
                  <button
                    type="button"
                    className="rrhh-touch-target inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => actualizarParams({ colaboradorId, page: page + 1 })}
                    disabled={page >= totalPages || cargandoHistorial}
                  >
                    Siguiente
                    <IconChevronRight size={17} aria-hidden="true" />
                  </button>
                </div>
              </nav>
            ) : null}
          </section>
        </>
      )}
    </main>
  )
}
