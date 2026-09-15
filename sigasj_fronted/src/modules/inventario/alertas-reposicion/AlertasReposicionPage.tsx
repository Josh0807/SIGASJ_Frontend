import { useEffect, useState } from 'react'
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { MATERIALES_PATH } from '../inventarioPaths'
import { getAlertasReposicionAdmin, patchAlertaReposicionEstado } from './alertasReposicionApi'
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
  }

  const gestionar = async (alerta: AlertaReposicion) => {
    const siguiente = siguienteEstadoAlerta(String(alerta.estado))
    if (!siguiente || managingId !== null) return

    const confirmado = window.confirm(
      siguiente === 'EN_GESTION'
        ? `¿Poner en gestión la alerta de ${getAlertaMaterialNombre(alerta)}?`
        : `¿Marcar como resuelta la alerta de ${getAlertaMaterialNombre(alerta)}?`,
    )
    if (!confirmado) return

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

  return (
    <section className="material-tracking" aria-labelledby="alertas-reposicion-title">
      <header className="material-tracking__header">
        <div>
          <p className="material-request__eyebrow">Inventario · Administración</p>
          <h1 id="alertas-reposicion-title">Alertas de reposición</h1>
          <p>Identifique los materiales que alcanzaron o quedaron por debajo de su stock mínimo.</p>
        </div>
        <Link className="material-tracking__detail-link" to={MATERIALES_PATH}>Volver al catálogo</Link>
      </header>

      <div className="material-tracking__filters">
        <label htmlFor="alerta-estado-filtro">Estado</label>
        <select
          id="alerta-estado-filtro"
          value={estado}
          onChange={(event) => changeEstado(event.target.value as EstadoAlertaReposicion | '')}
        >
          {ESTADOS_FILTRO.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>
        {!loading && !error ? (
          <span role="status">{total} {total === 1 ? 'alerta' : 'alertas'}</span>
        ) : null}
      </div>

      {notice ? <div className="material-tracking__state" role="status">{notice}</div> : null}
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
                <th><span className="visually-hidden">Acción</span></th>
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
                    <td data-label="Acción">
                      {accion ? (
                        <button
                          type="button"
                          className="material-tracking__detail-link"
                          disabled={managingId !== null}
                          onClick={() => void gestionar(alerta)}
                        >
                          <IconAlertTriangle size={18} aria-hidden="true" /> {managingId === alerta.id ? 'Actualizando…' : accion}
                        </button>
                      ) : (
                        <span>—</span>
                      )}
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
    </section>
  )
}
