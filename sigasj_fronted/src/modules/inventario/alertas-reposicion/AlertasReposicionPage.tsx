import { useEffect, useState } from 'react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconFilter,
  IconPackage,
  IconRefresh,
  IconShoppingCartPlus,
} from '@tabler/icons-react'
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
    const cancelScheduled = runAfterEffect(() => {
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
    })
    return () => {
      active = false
      cancelScheduled()
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
      setNotice('La alerta se marcó como resuelta.')
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
    <section
      className="material-tracking material-tracking--alertas"
      aria-labelledby="alertas-reposicion-title"
    >
      <header className="material-tracking__header material-tracking__header--fontanero">
        <div className="material-tracking__header-main">
          <span className="material-tracking__header-icon material-tracking__header-icon--alert" aria-hidden="true">
            <IconAlertTriangle size={28} stroke={2.2} />
          </span>
          <div className="material-tracking__header-copy">
            <p className="material-request__eyebrow">Inventario · Administración</p>
            <h1 id="alertas-reposicion-title">Alertas de reposición</h1>
            <p>
              Identifique los materiales que alcanzaron o quedaron por debajo de
              su stock mínimo.
            </p>
          </div>
        </div>
        <Link className="material-tracking__back-link" to={MATERIALES_PATH}>
          <IconArrowLeft size={18} aria-hidden="true" />
          Volver al catálogo
        </Link>
      </header>

      <div className="material-tracking__panel">
        <div className="material-tracking__filters material-tracking__filters--panel">
          <InventoryFormField
            label="Estado"
            icon={<IconFilter size={18} aria-hidden="true" />}
          >
            <select
              id="alerta-estado-filtro"
              value={estado}
              onChange={(event) =>
                changeEstado(event.target.value as EstadoAlertaReposicion | '')
              }
            >
              {ESTADOS_FILTRO.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </InventoryFormField>

          {!loading && !error ? (
            <span className="material-tracking__count material-tracking__count--alert" role="status">
              <IconAlertTriangle size={18} aria-hidden="true" />
              {total} {total === 1 ? 'alerta' : 'alertas'}
            </span>
          ) : null}
        </div>

        {notice ? (
          <div className="material-tracking__state material-tracking__state--notice" role="status">
            <p>
              {notice}
              {reposicionGeneradaId ? (
                <>
                  {' '}
                  <Link to={reposicionDetailPath(reposicionGeneradaId)}>
                    Ver reposición
                  </Link>
                </>
              ) : null}
            </p>
          </div>
        ) : null}

        {actionError ? (
          <div
            className="material-tracking__state material-tracking__state--error"
            role="alert"
          >
            {actionError}
          </div>
        ) : null}

        {loading ? (
          <div className="material-tracking__state" role="status">
            <span className="material-request__spinner" />
            Cargando alertas de reposición…
          </div>
        ) : null}

        {error ? (
          <div
            className="material-tracking__state material-tracking__state--error"
            role="alert"
          >
            <p>{error}</p>
            <button type="button" onClick={retry}>
              <IconRefresh size={18} aria-hidden="true" /> Reintentar
            </button>
          </div>
        ) : null}

        {!loading && !error && alertas.length === 0 ? (
          <div className="material-tracking__empty">
            <span className="material-tracking__empty-icon" aria-hidden="true">
              <IconPackage size={28} />
            </span>
            <h2>
              {estado
                ? 'No hay alertas con ese estado'
                : 'No hay alertas de reposición'}
            </h2>
            <p>
              {estado
                ? 'Pruebe con otro estado o consulte todos los registros.'
                : 'Cuando un material alcance su stock mínimo, la alerta aparecerá aquí.'}
            </p>
          </div>
        ) : null}

        {!loading && !error && alertas.length > 0 ? (
          <div className="material-tracking__table-wrap material-tracking__table-wrap--panel">
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
                  <th>
                    <span className="visually-hidden">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {alertas.map((alerta) => {
                  const accion = etiquetaAccionAlerta(String(alerta.estado))
                  const bajoMinimo = Number(alerta.stockActual) <= Number(alerta.stockMinimo)
                  return (
                    <tr key={alerta.id}>
                      <td data-label="Material">
                        <strong>{getAlertaMaterialNombre(alerta)}</strong>
                      </td>
                      <td data-label="Unidad">{getAlertaUnidadMedida(alerta)}</td>
                      <td data-label="Stock actual">
                        <span
                          className={
                            bajoMinimo
                              ? 'material-tracking__stock material-tracking__stock--low'
                              : 'material-tracking__stock'
                          }
                        >
                          {alerta.stockActual}
                        </span>
                      </td>
                      <td data-label="Stock mínimo">{alerta.stockMinimo}</td>
                      <td data-label="Fecha">
                        {formatAlertaFecha(alerta.fechaGeneracion)}
                      </td>
                      <td data-label="Estado">
                        <span
                          className="material-tracking__badge"
                          data-status={String(alerta.estado).toUpperCase()}
                        >
                          {formatAlertaEstado(String(alerta.estado))}
                        </span>
                      </td>
                      <td data-label="Responsable">
                        {getAlertaResponsable(alerta)}
                      </td>
                      <td data-label="Acciones" className="material-tracking__row-actions">
                        {accion ? (
                          <button
                            type="button"
                            className="material-tracking__action-btn"
                            disabled={managingId !== null || generatingId !== null}
                            onClick={() => requestEstadoChange(alerta)}
                          >
                            <IconAlertTriangle size={16} aria-hidden="true" />
                            {managingId === alerta.id ? 'Actualizando…' : accion}
                          </button>
                        ) : null}
                        {puedeGenerarReposicionDesdeAlerta(String(alerta.estado)) ? (
                          <button
                            type="button"
                            className="material-tracking__action-btn material-tracking__action-btn--primary"
                            disabled={managingId !== null || generatingId !== null}
                            onClick={() => requestGenerarReposicion(alerta)}
                          >
                            <IconShoppingCartPlus size={16} aria-hidden="true" />
                            {generatingId === alerta.id
                              ? 'Generando…'
                              : 'Generar reposición'}
                          </button>
                        ) : null}
                        {!accion &&
                        !puedeGenerarReposicionDesdeAlerta(String(alerta.estado)) ? (
                          <span>—</span>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {!loading && !error && totalPages > 1 ? (
          <nav
            className="material-tracking__pagination"
            aria-label="Paginación de alertas de reposición"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                setLoading(true)
                setPage((value) => value - 1)
              }}
            >
              Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {
                setLoading(true)
                setPage((value) => value + 1)
              }}
            >
              Siguiente
            </button>
          </nav>
        ) : null}
      </div>

      <ConfirmDialog
        isOpen={pendingAction !== null}
        title={
          pendingAction?.type === 'reposicion'
            ? 'Generar reposición'
            : 'Cambiar estado'
        }
        message={
          pendingAction?.type === 'estado'
            ? `¿Marcar como resuelta la alerta de ${getAlertaMaterialNombre(pendingAction.alerta)}? Confirme para aplicar el cambio o cancele para dejarlo igual.`
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
