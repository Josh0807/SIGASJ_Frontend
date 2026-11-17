import {
  IconAdjustmentsHorizontal,
  IconBeach,
  IconChevronLeft,
  IconChevronRight,
  IconDeviceFloppy,
  IconHash,
  IconHistory,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconUser,
} from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../app/router/routePaths'
import { ADMIN_COPY } from '../../shared/admin/adminCopy'
import {
  AdminShell,
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from '../../shared/ui'
import { useAuth } from '../auth/components/AuthContext'
import FechaFeriadoPicker from '../solicitudes-ausencia/FechaFeriadoPicker'
import { esFeriadoCostaRica } from '../solicitudes-ausencia/feriadosCostaRica'
import { getColaboradoresOpciones } from './colaboradoresApi'
import { esNoAutenticado, esReintentable, nombreCompleto } from './colaboradorForm'
import RrhhSubnav from './RrhhSubnav'
import VacacionesSaldoPanel from './VacacionesSaldoPanel'
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
  claseDiasMovimiento,
  diasConSigno,
  formatearFechaMovimiento,
  tipoMovimientoLabel,
  tonoBadgeMovimiento,
  toMovimientoVacacionesPayload,
  vacacionesErrorMessage,
  validateMovimientoVacaciones,
  type MovimientoVacacionesFormErrors,
} from './vacacionesForm'

const iconoTipoMovimiento = {
  ACUMULADO: IconPlus,
  DISFRUTADO: IconMinus,
  AJUSTE: IconAdjustmentsHorizontal,
} as const

const labelClass = 'text-[0.78rem] font-bold text-sigasj-ink'
const fieldShell =
  'flex min-h-11 items-center gap-2.5 rounded-xl border border-sigasj-border bg-white px-3.5 transition focus-within:border-sigasj-primary focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--color-sigasj-primary)_22%,transparent)]'
const fieldShellError =
  'flex min-h-11 items-center gap-2.5 rounded-xl border border-red-400 bg-white px-3.5 transition focus-within:ring-2 focus-within:ring-red-200'
const inputClass =
  'min-w-0 flex-1 border-0 bg-transparent py-2.5 text-[0.95rem] text-sigasj-ink outline-none placeholder:text-sigasj-muted'

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
        if (controller.signal.aborted) return
        // Activos primero para no confundir homónimos inactivos (p. ej. seeds duplicados).
        const ordenados = [...respuesta.data].sort((a, b) => {
          if (a.activo === b.activo) {
            return nombreCompleto(a).localeCompare(nombreCompleto(b), 'es')
          }
          return a.activo ? -1 : 1
        })
        setColaboradores(ordenados)
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
    <AdminShell className="gap-5 sm:gap-6" aria-labelledby="vacaciones-rrhh-title">
      <RrhhSubnav />

      <PageHeader
        id="vacaciones-rrhh-title"
        eyebrow="Administración · Vacaciones"
        title={
          <span className="inline-flex items-center gap-2">
            <IconBeach size={22} aria-hidden="true" />
            Vacaciones del personal
          </span>
        }
        description="Consulte el saldo y registre adquisiciones, disfrutes o ajustes. El saldo se calcula desde el historial."
      />

      <Card
        as="section"
        padded
        className="!p-3.5"
        aria-label="Selección de colaborador"
      >
        <label className="grid min-w-0 gap-1.5 lg:max-w-xl">
          <span className={labelClass}>Colaborador</span>
          <span className={fieldShell}>
            <IconUser className="text-sigasj-muted" size={18} aria-hidden="true" />
            <select
              className="w-0 min-w-0 flex-1 truncate border-0 bg-transparent py-2.5 text-[0.95rem] text-sigasj-ink outline-none"
              value={colaboradorId ? String(colaboradorId) : ''}
              onChange={(event) => seleccionarColaborador(event.target.value)}
              aria-label="Seleccione un colaborador"
            >
              <option value="">Seleccione un colaborador</option>
              {colaboradores.map((colaborador) => (
                <option key={colaborador.id} value={String(colaborador.id)}>
                  {nombreCompleto(colaborador)} · {colaborador.cedula}
                  {colaborador.activo ? '' : ' (Inactivo)'}
                </option>
              ))}
            </select>
          </span>
        </label>
      </Card>

      {colaboradorId === null ? (
        <EmptyState
          icon={<IconBeach size={32} aria-hidden="true" />}
          title="Seleccione un colaborador"
          description="Elija un colaborador para ver sus días adquiridos, disfrutados y disponibles, y para registrar nuevos movimientos."
        />
      ) : (
        <>
          {aviso ? <Alert tone="success">{aviso}</Alert> : null}

          {colaboradorSeleccionado && !colaboradorSeleccionado.activo ? (
            <Alert tone="warning">
              Este colaborador está marcado como inactivo. Si ve saldo en cero, revise si existe
              otro registro activo con el mismo nombre (p. ej. el vinculado al usuario Fontanero).
            </Alert>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-stretch">
            <Card
              as="section"
              padded
              className="!flex !h-full !flex-col !p-5 sm:!p-6"
              aria-label="Saldo de vacaciones"
              aria-busy={cargandoBalance}
            >
              {cargandoBalance && !balanceVisible ? (
                <div className="grid gap-3" role="status">
                  <span className="sr-only">Cargando saldo de vacaciones…</span>
                  {[0, 1, 2].map((fila) => (
                    <div
                      key={fila}
                      className="h-14 animate-pulse rounded-xl bg-sigasj-surface-soft motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  ))}
                </div>
              ) : errorBalance ? (
                <div className="grid place-items-center gap-3 py-6 text-center" role="alert">
                  <p className="m-0 font-semibold text-sigasj-error">{errorBalance}</p>
                  {cargaBalance.reintentable ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      leftIcon={<IconRefresh size={16} aria-hidden="true" />}
                      onClick={() => setRecarga((n) => n + 1)}
                    >
                      {ADMIN_COPY.retry}
                    </Button>
                  ) : null}
                </div>
              ) : balanceVisible ? (
                <div className="min-h-0 flex-1">
                  <VacacionesSaldoPanel balance={balanceVisible} cargando={cargandoBalance} />
                </div>
              ) : null}
            </Card>

            <Card
              as="section"
              padded
              className="!flex !h-full !flex-col !p-5 sm:!p-6"
              aria-label="Registrar movimiento de vacaciones"
            >
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[color:var(--asada-navy,#1e5a9c)] text-white shadow-[0_8px_16px_rgba(30,90,156,0.22)]">
                  <IconPlus size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="m-0 text-[1.05rem] font-extrabold tracking-tight text-sigasj-ink">
                    Registrar movimiento
                  </h2>
                  <p className="mb-0 mt-1 text-sm leading-5 text-sigasj-muted">
                    Disfrutes y ajustes que resten no pueden superar el saldo. Los feriados van
                    en ámbar.
                  </p>
                </div>
              </div>
              {submitError ? (
                <Alert tone="danger" className="mb-4">
                  {submitError}
                </Alert>
              ) : null}
              <form
                className="grid flex-1 gap-4"
                noValidate
                onSubmit={submit}
                aria-busy={saving}
                aria-label="Formulario de movimiento de vacaciones"
              >
                <fieldset className="m-0 grid gap-2 border-0 p-0">
                  <legend className={`mb-1 ${labelClass}`}>
                    Tipo <span className="text-sigasj-error">*</span>
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {TIPOS_MOVIMIENTO_VACACIONES.map((tipo) => {
                      const activo = values.tipo === tipo.value
                      const Icono = iconoTipoMovimiento[tipo.value]
                      const tonoActivo =
                        tipo.value === 'DISFRUTADO'
                          ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                          : tipo.value === 'AJUSTE'
                            ? 'border-sigasj-primary bg-[color-mix(in_srgb,var(--color-sigasj-primary)_10%,white)] ring-2 ring-[color-mix(in_srgb,var(--color-sigasj-primary)_22%,transparent)]'
                            : 'border-sky-400 bg-sky-50 ring-2 ring-sky-200'
                      const iconoActivo =
                        tipo.value === 'DISFRUTADO'
                          ? 'bg-amber-500 text-white'
                          : tipo.value === 'AJUSTE'
                            ? 'bg-sigasj-primary text-white'
                            : 'bg-sky-600 text-white'
                      return (
                        <label
                          key={tipo.value}
                          title={tipo.descripcion}
                          className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 transition duration-150 ${
                            activo
                              ? tonoActivo
                              : errors.tipo
                                ? 'border-red-400 bg-white'
                                : 'border-sigasj-border bg-white hover:border-sigasj-primary/45'
                          }`}
                        >
                          <input
                            type="radio"
                            name="tipo"
                            className="sr-only"
                            value={tipo.value}
                            checked={activo}
                            aria-invalid={Boolean(errors.tipo)}
                            onChange={() => {
                              update('tipo', tipo.value)
                              if (tipo.value !== 'AJUSTE') update('signoAjuste', '')
                              if (
                                tipo.value === 'DISFRUTADO' &&
                                values.fecha &&
                                esFeriadoCostaRica(values.fecha)
                              ) {
                                update('fecha', '')
                              }
                            }}
                          />
                          <span
                            className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${
                              activo ? iconoActivo : 'bg-sigasj-surface-soft text-sigasj-primary'
                            }`}
                            aria-hidden="true"
                          >
                            <Icono size={16} />
                          </span>
                          <span className="grid min-w-0 gap-0.5">
                            <span className="text-sm font-extrabold text-sigasj-ink">
                              {tipo.label}
                            </span>
                            <span className="text-[0.72rem] font-semibold leading-4 text-sigasj-muted">
                              {tipo.resumen}
                            </span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                  {errors.tipo ? (
                    <small className="font-semibold text-sigasj-error" role="alert">
                      {errors.tipo}
                    </small>
                  ) : null}
                </fieldset>

                {values.tipo === 'AJUSTE' ? (
                  <fieldset className="m-0 grid gap-2 border-0 p-0">
                    <legend className={`mb-1 ${labelClass}`}>
                      Efecto del ajuste <span className="text-sigasj-error">*</span>
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(
                        [
                          { value: '1' as const, label: 'Suma días', Icono: IconPlus },
                          { value: '-1' as const, label: 'Resta días', Icono: IconMinus },
                        ] as const
                      ).map(({ value, label, Icono }) => (
                        <label
                          key={value}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition duration-150 ${
                            values.signoAjuste === value
                              ? 'border-sigasj-primary bg-[color-mix(in_srgb,var(--color-sigasj-primary)_10%,white)] ring-2 ring-[color-mix(in_srgb,var(--color-sigasj-primary)_22%,transparent)]'
                              : errors.signoAjuste
                                ? 'border-red-400 bg-white'
                                : 'border-sigasj-border bg-white hover:border-sigasj-primary/45'
                          }`}
                        >
                          <input
                            type="radio"
                            name="signoAjuste"
                            className="sr-only"
                            value={value}
                            checked={values.signoAjuste === value}
                            onChange={() => update('signoAjuste', value)}
                          />
                          <Icono size={16} className="text-sigasj-primary" aria-hidden="true" />
                          <span className="text-sm font-extrabold text-sigasj-ink">{label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.signoAjuste ? (
                      <small className="font-semibold text-sigasj-error" role="alert">
                        {errors.signoAjuste}
                      </small>
                    ) : null}
                  </fieldset>
                ) : null}

                <div className="grid gap-3.5">
                  <div className="grid gap-3.5 sm:grid-cols-2 sm:items-start">
                    <label className="grid min-w-0 gap-1.5 self-start">
                      <span className={labelClass}>
                        Días <span className="text-sigasj-error">*</span>
                      </span>
                      <span className={errors.cantidadDias ? fieldShellError : fieldShell}>
                        <IconHash
                          className={
                            errors.cantidadDias ? 'text-sigasj-error' : 'text-sigasj-muted'
                          }
                          size={18}
                          aria-hidden="true"
                        />
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          step={1}
                          className={inputClass}
                          placeholder="Ej. 3"
                          value={values.cantidadDias}
                          required
                          aria-label="Cantidad de días"
                          aria-invalid={Boolean(errors.cantidadDias)}
                          onChange={(event) => update('cantidadDias', event.target.value)}
                        />
                      </span>
                    </label>

                    <FechaFeriadoPicker
                      label="Fecha"
                      value={values.fecha}
                      required
                      compacto
                      sinMensajes
                      error={errors.fecha}
                      bloquearFeriados={values.tipo === 'DISFRUTADO'}
                      onChange={(iso) => update('fecha', iso)}
                    />
                  </div>

                  {errors.cantidadDias ? (
                    <small className="font-semibold text-sigasj-error" role="alert">
                      {errors.cantidadDias}
                    </small>
                  ) : null}
                  {errors.fecha ? (
                    <small className="font-semibold text-sigasj-error" role="alert">
                      {errors.fecha}
                    </small>
                  ) : values.fecha &&
                    esFeriadoCostaRica(values.fecha) &&
                    values.tipo !== 'DISFRUTADO' ? (
                    <p className="m-0 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm font-semibold leading-5 text-amber-950">
                      Feriado seleccionado. Si el colaborador laboró ese día, regístrelo como{' '}
                      <span className="font-extrabold">Ajuste (+)</span> — suma al saldo (ajuste
                      neto).
                    </p>
                  ) : (
                    <small className="font-semibold text-sigasj-muted">
                      {values.tipo === 'DISFRUTADO'
                        ? 'Feriados en ámbar: no se pueden disfrutar. Si laboró, use Ajuste (+).'
                        : values.tipo === 'AJUSTE'
                          ? 'Feriado laborado = Ajuste (+) (ajuste neto al saldo).'
                          : 'Los feriados nacionales aparecen en ámbar en el calendario.'}
                    </small>
                  )}
                </div>

                <label className="grid min-w-0 gap-1.5">
                  <span className={labelClass}>
                    {values.tipo === 'AJUSTE' ? (
                      <>
                        Motivo <span className="text-sigasj-error">*</span>
                      </>
                    ) : (
                      'Observaciones (opcional)'
                    )}
                  </span>
                  <textarea
                    className={`min-h-[5.5rem] w-full rounded-xl border bg-white px-3.5 py-2.5 text-[0.95rem] text-sigasj-ink outline-none transition placeholder:text-sigasj-muted focus:border-sigasj-primary focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-sigasj-primary)_22%,transparent)] ${
                      errors.observaciones ? 'border-red-400' : 'border-sigasj-border'
                    }`}
                    maxLength={500}
                    placeholder={
                      values.tipo === 'AJUSTE'
                        ? values.fecha && esFeriadoCostaRica(values.fecha)
                          ? 'Ej. Ajuste por feriado laborado (ajuste neto)'
                          : 'Motivo del ajuste administrativo'
                        : 'Ej. Vacaciones de fin de año'
                    }
                    value={values.observaciones}
                    aria-invalid={Boolean(errors.observaciones)}
                    onChange={(event) => update('observaciones', event.target.value)}
                  />
                  {errors.observaciones ? (
                    <small className="font-semibold text-sigasj-error" role="alert">
                      {errors.observaciones}
                    </small>
                  ) : null}
                </label>

                <div className="mt-auto pt-1">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    loading={saving}
                    leftIcon={<IconDeviceFloppy size={18} aria-hidden="true" />}
                  >
                    {saving ? 'Guardando movimiento…' : 'Guardar movimiento'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <Card
            as="section"
            className="min-w-0 overflow-hidden !p-0"
            aria-label="Historial de movimientos de vacaciones"
            aria-busy={cargandoHistorial}
          >
            <div className="flex items-center gap-2.5 border-b border-sigasj-border px-4 py-3.5 sm:px-5">
              <span className="grid size-8 place-items-center rounded-xl bg-sigasj-surface-soft text-sigasj-primary">
                <IconHistory size={18} aria-hidden="true" />
              </span>
              <h2 className="m-0 text-[1.05rem] font-extrabold tracking-tight text-sigasj-ink">
                Historial de movimientos
              </h2>
              {total > 0 ? (
                <Badge tone="info" className="ml-auto">
                  {total} movimiento{total === 1 ? '' : 's'}
                </Badge>
              ) : null}
            </div>

            {cargandoHistorial && !historial ? (
              <div className="grid gap-3 p-5" role="status">
                <span className="sr-only">Cargando historial…</span>
                {[0, 1, 2].map((fila) => (
                  <div
                    key={fila}
                    className="h-12 animate-pulse rounded-xl bg-sigasj-surface-soft motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ))}
              </div>
            ) : errorHistorial ? (
              <div className="grid place-items-center gap-3 p-8 text-center" role="alert">
                <p className="m-0 font-semibold text-sigasj-error">{errorHistorial}</p>
                {cargaHistorial.reintentable ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<IconRefresh size={16} aria-hidden="true" />}
                    onClick={() => setRecarga((n) => n + 1)}
                  >
                    {ADMIN_COPY.retry}
                  </Button>
                ) : null}
              </div>
            ) : movimientos.length === 0 ? (
              <EmptyState
                className="border-0 bg-transparent shadow-none"
                icon={<IconHistory size={28} aria-hidden="true" />}
                title="Sin movimientos"
                description={`Registre el primer movimiento de vacaciones de ${nombre || 'este colaborador'} con el formulario de arriba.`}
              />
            ) : (
              <table
                className={`w-full border-collapse text-left transition-opacity ${cargandoHistorial ? 'opacity-60' : ''}`}
              >
                <thead className="hidden bg-[color-mix(in_srgb,var(--color-sigasj-ice)_70%,white)] text-[0.68rem] font-bold uppercase tracking-[0.08em] text-sigasj-muted md:table-header-group">
                  <tr>
                    <th scope="col" className="px-5 py-3">
                      Fecha
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Tipo
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Periodo
                    </th>
                    <th scope="col" className="px-5 py-3 text-right">
                      Días
                    </th>
                    <th scope="col" className="px-5 py-3">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="block divide-y divide-sigasj-border md:table-row-group">
                  {movimientos.map((movimiento) => (
                    <tr
                      key={movimiento.id}
                      className="grid gap-2 px-4 py-3.5 transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-sigasj-ice)_55%,white)] md:table-row md:p-0"
                    >
                      <td className="flex items-center justify-between gap-3 md:table-cell md:px-5 md:py-3.5">
                        <span className="text-[0.68rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted md:hidden">
                          Fecha
                        </span>
                        <span className="font-semibold tabular-nums text-sigasj-ink">
                          {formatearFechaMovimiento(movimiento.fecha)}
                        </span>
                      </td>
                      <td className="flex items-center justify-between gap-3 md:table-cell md:px-5 md:py-3.5">
                        <span className="text-[0.68rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted md:hidden">
                          Tipo
                        </span>
                        <Badge
                          tone={tonoBadgeMovimiento(movimiento.tipo)}
                          className={
                            movimiento.tipo === 'ACUMULADO'
                              ? 'bg-sky-50 text-sky-800'
                              : movimiento.tipo === 'DISFRUTADO'
                                ? 'bg-amber-50 text-amber-800'
                                : undefined
                          }
                        >
                          {tipoMovimientoLabel(movimiento.tipo)}
                        </Badge>
                      </td>
                      <td className="flex items-center justify-between gap-3 md:table-cell md:px-5 md:py-3.5">
                        <span className="text-[0.68rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted md:hidden">
                          Periodo
                        </span>
                        <span className="font-semibold tabular-nums text-sigasj-ink">
                          {movimiento.periodoId ?? '—'}
                        </span>
                      </td>
                      <td className="flex items-center justify-between gap-3 md:table-cell md:px-5 md:py-3.5 md:text-right">
                        <span className="text-[0.68rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted md:hidden">
                          Días
                        </span>
                        <span
                          className={`text-base font-extrabold tabular-nums ${claseDiasMovimiento(movimiento)}`}
                        >
                          {diasConSigno(movimiento)}
                        </span>
                      </td>
                      <td className="flex items-start justify-between gap-3 md:table-cell md:px-5 md:py-3.5">
                        <span className="text-[0.68rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted md:hidden">
                          Observaciones
                        </span>
                        <span className="min-w-0 break-words text-right text-sm font-medium leading-5 text-sigasj-muted md:text-left">
                          {movimiento.observaciones ?? '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!errorHistorial && total > 0 ? (
              <nav
                className="flex flex-col items-center justify-between gap-3 border-t border-sigasj-border px-4 py-3.5 text-sm text-sigasj-muted sm:flex-row sm:px-5"
                aria-label="Paginación del historial"
              >
                <p className="m-0 font-semibold">
                  Mostrando {desde}–{hasta} de {total} movimiento{total === 1 ? '' : 's'}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<IconChevronLeft size={16} aria-hidden="true" />}
                    onClick={() => actualizarParams({ colaboradorId, page: page - 1 })}
                    disabled={page <= 1 || cargandoHistorial}
                  >
                    Anterior
                  </Button>
                  <span className="px-1.5 font-semibold text-sigasj-ink">
                    {page} / {Math.max(totalPages, 1)}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    rightIcon={<IconChevronRight size={16} aria-hidden="true" />}
                    onClick={() => actualizarParams({ colaboradorId, page: page + 1 })}
                    disabled={page >= totalPages || cargandoHistorial}
                  >
                    Siguiente
                  </Button>
                </div>
              </nav>
            ) : null}
          </Card>
        </>
      )}
    </AdminShell>
  )
}
