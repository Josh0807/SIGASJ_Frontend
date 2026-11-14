import { useEffect, useState } from 'react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import {
  IconArrowLeft,
  IconPackage,
  IconRefresh,
  IconTruckDelivery,
} from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Button,
  EmptyState,
  MetricPill,
  PageHeader,
} from '../../../shared/ui'
import { MATERIALES_PATH, REPOSICIONES_PATH, recepcionDetailPath } from '../inventarioPaths'
import { getReposicionesAdmin } from '../reposiciones/reposicionesApi'
import {
  formatReposicionEstado,
  formatReposicionFecha,
  getHttpErrorStatus,
  getReposicionCodigo,
  getReposicionProveedorNombre,
  normalizeReposicionesList,
  reposicionErrorMessage,
  resumenMaterialesReposicion,
} from '../reposiciones/reposicionesUtils'
import type { ReposicionMaterial } from '../reposiciones/types'

export default function RecepcionesPage() {
  const [reposiciones, setReposiciones] = useState<ReposicionMaterial[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    const cancelScheduled = runAfterEffect(() => {
      setLoading(true)
      void getReposicionesAdmin({
        estado: 'PENDIENTE_RECEPCION',
        page,
        limit: 10,
      })
        .then((response) => {
          if (!active) return
          const items = normalizeReposicionesList(response)
          setReposiciones(items)
          setTotal(
            Array.isArray(response) ? items.length : (response.total ?? items.length),
          )
          setTotalPages(
            Array.isArray(response)
              ? 1
              : Math.max(response.totalPages ?? 1, 1),
          )
          setError('')
        })
        .catch((requestError) => {
          if (!active) return
          if (getHttpErrorStatus(requestError) === 401) {
            navigate('/login', { replace: true })
            return
          }
          setError(reposicionErrorMessage(requestError))
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    })
    return () => {
      active = false
      cancelScheduled()
    }
  }, [navigate, page, reloadKey])

  const retry = () => {
    setError('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  const from = total === 0 ? 0 : (page - 1) * 10 + 1
  const to = Math.min(page * 10, total)

  return (
    <section
      className="inv-recepciones"
      style={{ display: 'grid', gap: 14 }}
      aria-labelledby="recepciones-title"
    >
      <PageHeader
        title={<span id="recepciones-title">Recepción de materiales</span>}
        description="Confirme la entrega física en bodega de las compras pendientes."
        actions={
          <>
            <Button
              to={REPOSICIONES_PATH}
              variant="secondary"
              leftIcon={<IconPackage size={18} aria-hidden="true" />}
            >
              Reposiciones
            </Button>
            <Button
              to={MATERIALES_PATH}
              variant="secondary"
              leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
            >
              Volver al catálogo
            </Button>
          </>
        }
      />

      {!loading && !error ? (
        <div className="inv-status-bar" role="status">
          <div className="inv-status-bar__main">
            <span className="inv-status-bar__icon">
              <IconTruckDelivery size={20} aria-hidden="true" />
            </span>
            <div className="inv-status-bar__copy">
              <p className="inv-status-bar__title">Recepciones por confirmar</p>
              <p className="inv-status-bar__hint">
                Compras pendientes de entrega en bodega
              </p>
            </div>
          </div>
          <div className="inv-status-bar__aside">
            <MetricPill
              label={total === 1 ? 'compra' : 'compras'}
              value={total}
              tone={total === 0 ? 'quiet' : 'primary'}
            />
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="inv-state" role="status">
          Cargando compras pendientes…
        </div>
      ) : null}

      {error ? (
        <Alert
          tone="danger"
          title="No se pudieron cargar las recepciones"
          icon={<IconRefresh size={18} aria-hidden="true" />}
        >
          <p className="m-0 mb-3">{error}</p>
          <Button
            size="sm"
            onClick={retry}
            leftIcon={<IconRefresh size={16} aria-hidden="true" />}
          >
            Reintentar
          </Button>
        </Alert>
      ) : null}

      {!loading && !error && reposiciones.length === 0 ? (
        <EmptyState
          icon={<IconTruckDelivery size={30} aria-hidden="true" />}
          title="No hay recepciones pendientes"
          description="Cuando una reposición quede en espera de entrega, aparecerá aquí para confirmarla."
          actions={
            <Button to={REPOSICIONES_PATH} variant="secondary">
              Ver reposiciones
            </Button>
          }
        />
      ) : null}

      {!loading && !error && reposiciones.length > 0 ? (
        <section className="inv-panel" aria-label="Listado de recepciones">
          <div className="inv-panel__heading">
            <div>
              <h2>Compras pendientes</h2>
              <p>
                Mostrando {from}–{to} de {total}
              </p>
            </div>
          </div>
          <div className="inv-table-wrap">
            <table className="inv-table">
              <caption className="visually-hidden">
                Compras pendientes de recepción
              </caption>
              <thead>
                <tr>
                  <th>Reposición</th>
                  <th>Proveedor</th>
                  <th>Fecha de compra</th>
                  <th>Materiales</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {reposiciones.map((reposicion) => (
                  <tr key={reposicion.id}>
                    <td data-label="Reposición">
                      <strong>{getReposicionCodigo(reposicion)}</strong>
                    </td>
                    <td data-label="Proveedor">
                      {getReposicionProveedorNombre(reposicion)}
                    </td>
                    <td data-label="Fecha de compra">
                      {formatReposicionFecha(reposicion.fechaCompra)}
                    </td>
                    <td data-label="Materiales">
                      {resumenMaterialesReposicion(reposicion.detalles ?? [])}
                    </td>
                    <td data-label="Estado">
                      <span className="inv-badge inv-badge--low">
                        {formatReposicionEstado(String(reposicion.estado))}
                      </span>
                    </td>
                    <td data-label="Acción">
                      <Button
                        className="inv-row-action"
                        size="sm"
                        to={recepcionDetailPath(reposicion.id)}
                      >
                        Registrar recepción
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!loading && !error && totalPages > 1 ? (
        <nav className="inv-pagination" aria-label="Paginación de recepciones">
          <button
            type="button"
            className="inv-btn inv-btn--secondary"
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
            className="inv-btn inv-btn--secondary"
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
    </section>
  )
}
