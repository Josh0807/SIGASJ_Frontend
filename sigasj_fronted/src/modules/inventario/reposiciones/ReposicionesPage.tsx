import { useEffect, useState } from 'react'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import { IconArrowLeft, IconBox, IconEye, IconFilter, IconRefresh } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  PageHeader,
} from '../../../shared/ui'
import { InventoryFormField } from '../InventoryFormField'
import { MATERIALES_PATH, reposicionDetailPath } from '../inventarioPaths'
import { getReposicionesAdmin } from './reposicionesApi'
import {
  formatReposicionEstado,
  formatReposicionFecha,
  formatReposicionOrigen,
  getHttpErrorStatus,
  getReposicionCodigo,
  getReposicionProveedorNombre,
  getReposicionResponsable,
  normalizeReposicionesList,
  reposicionErrorMessage,
  resumenMaterialesReposicion,
} from './reposicionesUtils'
import type { EstadoReposicion, OrigenReposicion, ReposicionMaterial } from './types'

const ESTADOS_FILTRO: { value: EstadoReposicion | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_GESTION', label: 'En gestión' },
  { value: 'COMPRA_REGISTRADA', label: 'Compra registrada' },
  { value: 'PENDIENTE_RECEPCION', label: 'Pendiente de recepción' },
  { value: 'RECIBIDA', label: 'Recibida' },
  { value: 'COMPLETADA', label: 'Completada' },
]

const ORIGENES_FILTRO: { value: OrigenReposicion | ''; label: string }[] = [
  { value: '', label: 'Todos los orígenes' },
  { value: 'ALERTA_STOCK_MINIMO', label: 'Stock mínimo' },
  { value: 'SOLICITUD_APROBADA', label: 'Solicitud aprobada' },
  { value: 'ADMINISTRATIVA', label: 'Administrativa' },
]

export default function ReposicionesPage() {
  const [reposiciones, setReposiciones] = useState<ReposicionMaterial[]>([])
  const [estado, setEstado] = useState<EstadoReposicion | ''>('')
  const [origen, setOrigen] = useState<OrigenReposicion | ''>('')
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
      ...(estado ? { estado } : {}),
      ...(origen ? { origen } : {}),
      page,
      limit: 10,
    })
      .then((response) => {
        if (!active) return
        const items = normalizeReposicionesList(response)
        setReposiciones(items)
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
  }, [estado, origen, navigate, page, reloadKey])

  const retry = () => {
    setError('')
    setLoading(true)
    setReloadKey((value) => value + 1)
  }

  const changeEstado = (value: EstadoReposicion | '') => {
    setEstado(value)
    setPage(1)
  }

  const changeOrigen = (value: OrigenReposicion | '') => {
    setOrigen(value)
    setPage(1)
  }

  const filtered = Boolean(estado || origen)

  return (
    <section
      className="inv-reposiciones"
      style={{ display: 'grid', gap: 14 }}
      aria-labelledby="reposiciones-title"
    >
      <PageHeader
        eyebrow="Inventario · Administración"
        title={<span id="reposiciones-title">Reposiciones de materiales</span>}
        description="Consulte y gestione las reposiciones generadas por alertas, solicitudes o acciones administrativas."
        actions={
          <Button
            to={MATERIALES_PATH}
            variant="secondary"
            leftIcon={<IconArrowLeft size={18} aria-hidden="true" />}
          >
            Volver al catálogo
          </Button>
        }
      />

      <section className="inv-panel" aria-label="Filtros de reposiciones">
        <div className="inv-filters inv-filters--wrap">
        <InventoryFormField label="Estado" icon={<IconFilter size={20} aria-hidden="true" />}>
        <select
          id="reposicion-estado-filtro"
          value={estado}
          onChange={(event) => changeEstado(event.target.value as EstadoReposicion | '')}
        >
          {ESTADOS_FILTRO.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>
        </InventoryFormField>
        <InventoryFormField label="Origen" icon={<IconBox size={20} aria-hidden="true" />}>
        <select
          id="reposicion-origen-filtro"
          value={origen}
          onChange={(event) => changeOrigen(event.target.value as OrigenReposicion | '')}
        >
          {ORIGENES_FILTRO.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>
        </InventoryFormField>
        {!loading && !error ? (
          <Badge tone="success" role="status">
            {total} {total === 1 ? 'reposición' : 'reposiciones'}
          </Badge>
        ) : null}
        </div>
      </section>

      {loading ? (
        <div className="inv-state" role="status">
          Cargando reposiciones…
        </div>
      ) : null}
      {error ? (
        <Alert tone="danger" title="No se pudieron cargar las reposiciones">
          <p className="m-0 mb-3">{error}</p>
          <Button
            size="sm"
            onClick={retry}
            leftIcon={<IconRefresh size={16} aria-hidden="true" />}
          >
            {ADMIN_COPY.retry}
          </Button>
        </Alert>
      ) : null}
      {!loading && !error && reposiciones.length === 0 ? (
        <EmptyState
          icon={<IconBox size={30} aria-hidden="true" />}
          title={
            filtered
              ? 'No hay reposiciones con esos filtros'
              : 'No hay reposiciones registradas'
          }
          description={
            filtered
              ? 'Pruebe con otros filtros o consulte todos los registros.'
              : 'Cuando se genere una reposición, aparecerá en este listado.'
          }
        />
      ) : null}

      {!loading && !error && reposiciones.length > 0 ? (
        <section className="inv-panel" aria-label="Listado de reposiciones">
          <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha</th>
                <th>Origen</th>
                <th>Proveedor</th>
                <th>Materiales</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th><span className="visually-hidden">Detalle</span></th>
              </tr>
            </thead>
            <tbody>
              {reposiciones.map((reposicion) => (
                <tr key={reposicion.id}>
                  <td data-label="Código"><strong>{getReposicionCodigo(reposicion)}</strong></td>
                  <td data-label="Fecha">{formatReposicionFecha(reposicion.fechaGeneracion)}</td>
                  <td data-label="Origen">{formatReposicionOrigen(String(reposicion.origen))}</td>
                  <td data-label="Proveedor">{getReposicionProveedorNombre(reposicion)}</td>
                  <td data-label="Materiales">{resumenMaterialesReposicion(reposicion.detalles ?? [])}</td>
                  <td data-label="Estado">
                    <span className="inv-badge inv-badge--low">
                      {formatReposicionEstado(String(reposicion.estado))}
                    </span>
                  </td>
                  <td data-label="Responsable">{getReposicionResponsable(reposicion)}</td>
                  <td data-label="Detalle">
                    <Button
                      className="inv-row-action"
                      size="sm"
                      to={reposicionDetailPath(reposicion.id)}
                      leftIcon={<IconEye size={16} aria-hidden="true" />}
                    >
                      Ver detalle
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
        <nav className="inv-pagination" aria-label="Paginación de reposiciones">
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
