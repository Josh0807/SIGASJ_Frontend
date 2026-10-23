import { IconBeach, IconRefresh } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import { useNavigate } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { useAuth } from '../../auth/components/AuthContext'
import { esNoAutenticado, esReintentable, nombreCompleto } from '../colaboradorForm'
import {
  FONTANERO_MI_SALDO_TITLE,
} from '../recursosHumanosPaths'
import type { BalanceVacaciones } from '../types'
import { getBalanceVacacionesPropio } from '../vacacionesApi'
import { vacacionesErrorMessage } from '../vacacionesForm'

export default function MiSaldoVacacionesPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [balance, setBalance] = useState<BalanceVacaciones | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reintentable, setReintentable] = useState(true)
  const [recarga, setRecarga] = useState(0)
  const [cargando, setCargando] = useState(true)

  const salirPorSesion = useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])

  useEffect(() => {
    const controller = new AbortController()
    const cancelScheduled = runAfterEffect(() => {
    setCargando(true)
    getBalanceVacacionesPropio(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setBalance(data)
        setError(null)
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        if (esNoAutenticado(err)) {
          salirPorSesion()
          return
        }
        setBalance(null)
        setError(
          vacacionesErrorMessage(
            err,
            'No fue posible consultar su saldo de vacaciones.',
          ),
        )
        setReintentable(esReintentable(err))
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false)
      })
    })
    return () => {
      cancelScheduled()
      controller.abort()
    }
  }, [recarga, salirPorSesion])

  return (
    <div className="admin-surface-page">
      <header className="grid gap-2">
        <h1 className="m-0 text-3xl font-black tracking-tight text-[#062e63]">
          {FONTANERO_MI_SALDO_TITLE}
        </h1>
        <p className="m-0 text-slate-500">
          Consulta de solo lectura. Para solicitar vacaciones use el formulario de ausencia.
        </p>
      </header>

      <section className="admin-surface-card" aria-busy={cargando}>
        {cargando && !balance ? (
          <p className="m-0 text-slate-500" role="status">
            Cargando saldo…
          </p>
        ) : error ? (
          <div className="grid gap-4 text-center" role="alert">
            <p className="m-0 font-semibold text-red-700">{error}</p>
            {reintentable ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 font-bold text-blue-800"
                onClick={() => setRecarga((n) => n + 1)}
              >
                <IconRefresh size={18} aria-hidden="true" />
                Reintentar
              </button>
            ) : null}
          </div>
        ) : balance ? (
          <>
            <div className="flex items-start gap-4">
              <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white">
                <IconBeach size={28} aria-hidden="true" />
              </span>
              <div>
                <p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-blue-600">
                  Su saldo
                </p>
                <h2 className="m-0 text-2xl font-black text-[#062e63]">
                  {nombreCompleto(balance.colaborador)}
                </h2>
                <p className="mb-0 mt-1 text-slate-500">{balance.colaborador.cargo}</p>
              </div>
            </div>
            <dl className="m-0 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-5 py-4">
                <dt className="text-xs font-extrabold uppercase text-sky-900/70">Adquiridas</dt>
                <dd className="m-0 text-3xl font-black text-sky-900">
                  {balance.diasAcumulados}
                </dd>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-5 py-4">
                <dt className="text-xs font-extrabold uppercase text-amber-900/70">Disfrutadas</dt>
                <dd className="m-0 text-3xl font-black text-amber-900">
                  {balance.diasDisfrutados}
                </dd>
              </div>
              <div className="rounded-2xl border border-violet-100 bg-violet-50/70 px-5 py-4">
                <dt className="text-xs font-extrabold uppercase text-violet-900/70">Ajustes netos</dt>
                <dd className="m-0 text-3xl font-black text-violet-900">
                  {balance.diasAjusteNeto ?? 0}
                </dd>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-5 py-4">
                <dt className="text-xs font-extrabold uppercase text-emerald-900/70">Disponibles</dt>
                <dd className="m-0 text-3xl font-black text-emerald-900">
                  {balance.diasDisponibles}
                </dd>
              </div>
            </dl>
          </>
        ) : null}
      </section>
    </div>
  )
}
