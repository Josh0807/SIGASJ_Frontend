import { useEffect, useState } from 'react'
import { IconAlertTriangle, IconArrowLeft, IconFilter, IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import { InventoryFormField } from '../InventoryFormField'
import { MATERIALES_PATH, reposicionDetailPath } from '../inventarioPaths'
import {
  generarReposicionDesdeAlertaAdmin,
  getAlertasReposicionAdmin,
  patchAlertaReposicionEstado,
} from './alertasReposicionApi'
import {
  alertaReposicionErrorMessage,
  etiquetaAccionAlerta,
  formatAlertaEstado,
  formatAlertaFecha,
  getAlertaMaterialNombre,
  getAlertaResponsable,
  getAlertaUnidadMedida,
  getHttpErrorStatus,
  normalizeAlertasReposicionList,
  puedeGenerarReposicionDesdeAlerta,
  siguienteEstadoAlerta,
} from './alertasReposicionUtils'
import type { AlertaReposicion, EstadoAlertaReposicion } from './types'

const ESTADOS_FILTRO: { value: EstadoAlertaReposicion | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_GESTION', label: 'En gestión' },
  { value: 'RESUELTA', label: 'Resuelta' },
]

export default function AlertasReposicionPage() {
  const [alertas, setAlertas] = useState<AlertaReposicion[]>([])
  const [estado, setEstado] = useState<EstadoAlertaReposicion | ''>('PENDIENTE')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [managingId, setManagingId] = useState<number | null>(null)
  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [reposicionGeneradaId, setReposicionGeneradaId] = useState<number | null>(null)
  const [pendingAction, setPendingAction] = useState<
    | { type: 'estado'; alerta: AlertaReposicion; siguiente: EstadoAlertaReposicion }
    | { type: 'reposicion'; alerta: AlertaReposicion }
    | null
  >(null)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    setLoading(true)
    void getAlertasReposicionAdmin({
      ...(estado ? { estado } : {}),
      page,
      limit: 10,
    })
      .then((response) => {
        if (!active) return
        const items = normalizeAlertasReposicionList(response)
        setAlertas(items)
        setTotal(Array.isArray(response) ? items.length : response.total ?? items.length)
        setTotalPages(Array.isArray(response) ? 1 : Math.max(response.totalPages ?? 1, 1))
        setError('')
      })
      .catch((requestError) => {
        if (!active) return
        if (getHttpErrorStatus(requestError) === 401) {
          navigate('/login', { replace: true })
          return
        }
        setError(alertaReposicionErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [estado, navigate, page, reloadKey])

  const retry = () => {
    setError('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  const changeEstado = (value: EstadoAlertaReposicion | '') => {
    setEstado(value)
    setPage(1)
    setNotice('')
    setActionError('')
    setReposicionGeneradaId(null)
  }

  const requestEstadoChange = (alerta: AlertaReposicion) => {
    const siguiente = siguienteEstadoAlerta(String(alerta.estado))
    if (!siguiente || managingId !== null || generatingId !== null) return
    setPendingAction({ type: 'estado', alerta, siguiente })
  }

  const applyEstadoChange = async (
    alerta: AlertaReposicion,
    siguiente: EstadoAlertaReposicion,
  ) => {
    setManagingId(alerta.id)
    setActionError('')
    setNotice('')
    try {
      await patchAlertaReposicionEstado(alerta.id, siguiente)
      setNotice(
        siguiente === 'EN_GESTION'
          ? 'La alerta quedó en gestión.'
          : 'La alerta se marcó como resuelta.',
      )
      setReloadKey((value) => value + 1)
    } catch (requestError) {
      if (getHttpErrorStatus(requestError) === 401) {
        navigate('/login', { replace: true })
        return
      }
      setActionError(alertaReposicionErrorMessage(requestError, 'actualizar'))
    } finally {
      setManagingId(null)
    }
  }

  const requestGenerarReposicion = (alerta: AlertaReposicion) => {
    if (generatingId !== null || managingId !== null) return
    setPendingAction({ type: 'reposicion', alerta })
  }

  const applyGenerarReposicion = async (alerta: AlertaReposicion) => {
    setGeneratingId(alerta.id)
    setActionError('')
    setNotice('')
    setReposicionGeneradaId(null)
    try {
      const reposicion = await generarReposicionDesdeAlertaAdmin(alerta.id)
      const id = Number(reposicion.id)
      setReposicionGeneradaId(Number.isInteger(id) && id > 0 ? id : null)
      setNotice('Se generó la reposición desde la alerta.')
    } catch (requestError) {
      if (getHttpErrorStatus(requestError) === 401) {
        navigate('/login', { replace: true })
        return
      }
      setActionError(alertaReposicionErrorMessage(requestError, 'generar'))
    } finally {
      setGeneratingId(null)
    }
  }

  const confirmPendingAction = () => {
    const pending = pendingAction
    setPendingAction(null)
    if (!pending) return
    if (pending.type === 'estado') {
      void applyEstadoChange(pending.alerta, pending.siguiente)
      return
    }
    void applyGenerarReposicion(pending.alerta)
  }

  return (
    <section className="material-tracking" aria-labelledby="alertas-reposicion-title">
      <header className="material-tracking__header">
        <div>
          <p className="material-request__eyebrow">Inventario · Administración</p>
          <h1 id="alertas-reposicion-title">Alertas de reposición</h1>
          <p>Identifique los materiales que alcanzaron o quedaron por debajo de su stock mínimo.</p>
        </div>
        <Link className="material-tracking__detail-link group !inline-flex !items-center !gap-2.5 !rounded-2xl !border !border-blue-200 !bg-white !px-5 !py-3 !font-extrabold !text-blue-700 !shadow-[0_8px_20px_rgba(37,99,235,0.12)] !transition-all !duration-300 !ease-out hover:!-translate-y-1 hover:!border-blue-400 hover:!bg-blue-50 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.2)] active:!translate-y-0 active:!scale-[0.97] motion-reduce:!transform-none motion-reduce:!transition-none" to={MATERIALES_PATH}><IconArrowLeft className="!transition-transform !duration-300 group-hover:!-translate-x-1 motion-reduce:!transform-none" size={19} aria-hidden="true" />Volver al catálogo</Link>
      </header>

      <div className="material-tracking__filters !flex !items-end !justify-between !gap-6 !overflow-hidden !rounded-3xl !border-blue-100 !bg-linear-to-r !from-white !via-blue-50/40 !to-sky-50/70 !p-6 !shadow-[0_12px_32px_rgba(30,90,156,0.09)] [&>label]:!w-full [&>label]:!max-w-2xl [&>label]:!justify-items-start [&>label]:!text-left [&>label>span:first-child]:!ml-1 [&>label>span:first-child]:!w-auto [&>label>span:first-child]:!justify-self-start [&>label>span:first-child]:!text-left [&_.provider-admin__control]:!w-full [&_.provider-admin__control]:!rounded-2xl [&_.provider-admin__control]:!border [&_.provider-admin__control]:!border-blue-100 [&_.provider-admin__control]:!bg-white [&_.provider-admin__control]:!shadow-[0_7px_18px_rgba(37,99,235,0.08)] [&_.provider-admin__control]:!transition-all [&_.provider-admin__control]:!duration-300 hover:[&_.provider-admin__control]:!border-blue-300 hover:[&_.provider-admin__control]:!shadow-[0_10px_24px_rgba(37,99,235,0.14)] focus-within:[&_.provider-admin__control]:!border-blue-400 focus-within:[&_.provider-admin__control]:!ring-4 focus-within:[&_.provider-admin__control]:!ring-blue-100 max-[700px]:!flex-col max-[700px]:!items-stretch">
        <InventoryFormField label="Estado" icon={<IconFilter size={20} aria-hidden="true" />}>
        <select
          id="alerta-estado-filtro"
          value={estado}
          onChange={(event) => changeEstado(event.target.value as EstadoAlertaReposicion | '')}
        >
          {ESTADOS_FILTRO.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>
        </InventoryFormField>
        {!loading && !error ? (
          <span className="!m-0 !inline-flex !min-h-12 !shrink-0 !items-center !gap-2.5 !rounded-2xl !border !border-amber-200 !bg-linear-to-r !from-amber-50 !to-orange-50 !px-5 !py-3 !font-extrabold !text-amber-700 !shadow-[0_7px_18px_rgba(217,119,6,0.12)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!shadow-[0_11px_24px_rgba(217,119,6,0.18)] motion-reduce:!transform-none motion-reduce:!transition-none" role="status"><IconAlertTriangle size={19} aria-hidden="true" />{total} {total === 1 ? 'alerta' : 'alertas'}</span>
        ) : null}
      </div>

      {notice ? (
        <div className="material-tracking__state" role="status">
          {notice}
          {reposicionGeneradaId ? (
            <> <Link to={reposicionDetailPath(reposicionGeneradaId)}>Ver reposición</Link></>
          ) : null}
        </div>
      ) : null}
      {actionError ? (
        <div className="material-tracking__state material-tracking__state--error" role="alert">
          {actionError}
        </div>
      ) : null}

      {loading ? (
        <div className="material-tracking__state" role="status">
          <span className="material-request__spinner" />Cargando alertas de reposición…
        </div>
      ) : null}
      {error ? (
        <div className="material-tracking__state material-tracking__state--error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={retry}>
            <IconRefresh size={18} aria-hidden="true" /> Reintentar
          </button>
        </div>
      ) : null}
      {!loading && !error && alertas.length === 0 ? (
        <div className="material-tracking__empty">
          <h2>{estado ? 'No hay alertas con ese estado' : 'No hay alertas de reposición'}</h2>
          <p>
            {estado
              ? 'Pruebe con otro estado o consulte todos los registros.'
              : 'Cuando un material alcance su stock mínimo, la alerta aparecerá aquí.'}
          </p>
        </div>
      ) : null}

      {!loading && !error && alertas.length > 0 ? (
        <div className="material-tracking__table-wrap">
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Unidad</th>
                <th>Stock actual</th>
                <th>Stock mínimo</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th><span className="visually-hidden">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((alerta) => {
                const accion = etiquetaAccionAlerta(String(alerta.estado))
                return (
                  <tr key={alerta.id}>
                    <td data-label="Material"><strong>{getAlertaMaterialNombre(alerta)}</strong></td>
                    <td data-label="Unidad">{getAlertaUnidadMedida(alerta)}</td>
                    <td data-label="Stock actual">{alerta.stockActual}</td>
                    <td data-label="Stock mínimo">{alerta.stockMinimo}</td>
                    <td data-label="Fecha">{formatAlertaFecha(alerta.fechaGeneracion)}</td>
                    <td data-label="Estado">
                      <span className="material-tracking__badge" data-status={String(alerta.estado).toUpperCase()}>
                        {formatAlertaEstado(String(alerta.estado))}
                      </span>
                    </td>
                    <td data-label="Responsable">{getAlertaResponsable(alerta)}</td>
                    <td data-label="Acciones">
                      {accion ? (
                        <button
                          type="button"
                          className="material-tracking__detail-link"
                          disabled={managingId !== null || generatingId !== null}
                          onClick={() => requestEstadoChange(alerta)}
                        >
                          <IconAlertTriangle size={18} aria-hidden="true" /> {managingId === alerta.id ? 'Actualizando…' : accion}
                        </button>
                      ) : null}
                      {puedeGenerarReposicionDesdeAlerta(String(alerta.estado)) ? (
                        <button
                          type="button"
                          className="material-tracking__detail-link"
                          disabled={managingId !== null || generatingId !== null}
                          onClick={() => requestGenerarReposicion(alerta)}
                        >
                          {generatingId === alerta.id ? 'Generando…' : 'Generar reposición'}
                        </button>
                      ) : null}
                      {!accion && !puedeGenerarReposicionDesdeAlerta(String(alerta.estado)) ? <span>—</span> : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && !error && totalPages > 1 ? (
        <nav className="material-tracking__pagination" aria-label="Paginación de alertas de reposición">
          <button type="button" disabled={page <= 1} onClick={() => { setLoading(true); setPage((value) => value - 1) }}>Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => { setLoading(true); setPage((value) => value + 1) }}>Siguiente</button>
        </nav>
      ) : null}

      <ConfirmDialog
        isOpen={pendingAction !== null}
        title={pendingAction?.type === 'reposicion' ? 'Generar reposición' : 'Cambiar estado'}
        message={
          pendingAction?.type === 'estado'
            ? pendingAction.siguiente === 'EN_GESTION'
              ? `¿Poner en gestión la alerta de ${getAlertaMaterialNombre(pendingAction.alerta)}? Confirme para aplicar el cambio o cancele para dejarlo igual.`
              : `¿Marcar como resuelta la alerta de ${getAlertaMaterialNombre(pendingAction.alerta)}? Confirme para aplicar el cambio o cancele para dejarlo igual.`
            : pendingAction?.type === 'reposicion'
              ? `¿Generar una reposición para ${getAlertaMaterialNombre(pendingAction.alerta)}? No se modificarán las existencias.`
              : ''
        }
        confirmLabel="Aceptar"
        cancelLabel="Cancelar"
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
      />
    </section>
  )
}
