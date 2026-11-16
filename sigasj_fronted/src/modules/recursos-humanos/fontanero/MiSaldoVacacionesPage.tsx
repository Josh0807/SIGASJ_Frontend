import { IconRefresh } from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import {
  AdminShell,
  Alert,
  Button,
  Card,
  PageHeader,
} from '../../../shared/ui'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import { useAuth } from '../../auth/components/AuthContext'
import { FONTANERO_SOLICITAR_VACACIONES_PATH } from '../../solicitudes-ausencia/solicitudesAusenciaPaths'
import { esNoAutenticado, esReintentable } from '../colaboradorForm'
import { FONTANERO_MI_SALDO_TITLE } from '../recursosHumanosPaths'
import type { BalanceVacaciones } from '../types'
import VacacionesSaldoPanel from '../VacacionesSaldoPanel'
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
    <AdminShell className="gap-5 sm:gap-6" aria-labelledby="mi-saldo-vacaciones-title">
      <PageHeader
        id="mi-saldo-vacaciones-title"
        eyebrow="Fontanero · Vacaciones"
        title={FONTANERO_MI_SALDO_TITLE}
        description={
          <>
            Consulta de solo lectura.{' '}
            <Link
              to={FONTANERO_SOLICITAR_VACACIONES_PATH}
              className="font-bold text-sigasj-primary underline-offset-2 hover:underline"
            >
              Solicitar vacaciones
            </Link>
          </>
        }
      />

      <Card
        as="section"
        padded
        className="!p-5 sm:!p-6"
        aria-busy={cargando}
        aria-label="Saldo de vacaciones"
      >
        {cargando && !balance ? (
          <div className="grid gap-3" role="status">
            <span className="sr-only">Cargando saldo…</span>
            {[0, 1, 2].map((fila) => (
              <div
                key={fila}
                className="h-14 animate-pulse rounded-xl bg-sigasj-surface-soft motion-reduce:animate-none"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : error ? (
          <div className="grid gap-3">
            <Alert tone="danger">{error}</Alert>
            {reintentable ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="justify-self-start"
                leftIcon={<IconRefresh size={16} aria-hidden="true" />}
                onClick={() => setRecarga((n) => n + 1)}
              >
                {ADMIN_COPY.retry}
              </Button>
            ) : null}
          </div>
        ) : balance ? (
          <VacacionesSaldoPanel
            balance={balance}
            eyebrow="Su saldo"
            cargando={cargando}
            compacto
          />
        ) : null}
      </Card>
    </AdminShell>
  )
}
