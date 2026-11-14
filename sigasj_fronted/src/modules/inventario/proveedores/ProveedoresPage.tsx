import { useEffect, useRef, useState } from 'react'
import { IconPackage, IconPlus, IconRefresh } from '@tabler/icons-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/components/AuthContext'
import {
  InternalAdminRoleName,
  normalizeInternalRole,
} from '../../auth/utils/internalRoles'
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  MetricPill,
  PageHeader,
} from '../../../shared/ui'
import {
  MATERIALES_PATH,
  PROVEEDOR_NEW_PATH,
  proveedorEditPath,
} from '../inventarioPaths'
import ProveedorStateAction from './ProveedorStateAction'
import { updateProveedorEstado } from './proveedoresApi'
import { proveedorError } from './proveedorUtils'
import type { Proveedor } from './types'
import { useProveedores } from './useProveedores'

const PAGE_SIZE = 10

export default function ProveedoresPage() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const canManage =
    normalizeInternalRole(user?.role) === InternalAdminRoleName.Administradora
  const [searchInput, setSearchInput] = useState('')
  const [nombre, setNombre] = useState('')
  const [activo, setActivo] = useState('')
  const [page, setPage] = useState(1)
  const [changingId, setChangingId] = useState<number | null>(null)
  const routeSuccess = (location.state as { success?: string } | null)?.success
  const [feedback, setFeedback] = useState<{
    kind: 'success' | 'error'
    text: string
  } | null>(() =>
    routeSuccess ? { kind: 'success', text: routeSuccess } : null,
  )
  const latestSearch = useRef('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const value = searchInput.trim()
      if (value !== latestSearch.current) {
        latestSearch.current = value
        setNombre(value)
        setPage(1)
      }
    }, 400)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (routeSuccess) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, navigate, routeSuccess])

  const { result, loading, error, refetch } = useProveedores({
    nombre: nombre || undefined,
    activo: activo === '' ? undefined : activo === 'true',
    page,
    limit: PAGE_SIZE,
  })
  const filtered = Boolean(searchInput.trim() || activo)
  const from = result.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, result.total)

  async function changeState(proveedor: Proveedor, nextActivo: boolean) {
    if (!canManage || changingId !== null) return
    setChangingId(proveedor.id)
    setFeedback(null)
    try {
      await updateProveedorEstado(proveedor.id, nextActivo)
      setFeedback({
        kind: 'success',
        text: `El proveedor «${proveedor.nombre}» fue ${nextActivo ? 'activado' : 'desactivado'} correctamente.`,
      })
      refetch()
    } catch (caught) {
      const message = proveedorError(caught)
      setFeedback({ kind: 'error', text: message })
      if (/HTTP 401/.test(caught instanceof Error ? caught.message : '')) logout()
      if (/HTTP 404/.test(caught instanceof Error ? caught.message : '')) refetch()
    } finally {
      setChangingId(null)
    }
  }

  const clearFilters = () => {
    setSearchInput('')
    latestSearch.current = ''
    setNombre('')
    setActivo('')
    setPage(1)
  }

  return (
    <main className="inv-proveedores" style={{ display: 'grid', gap: 14 }}>
      <PageHeader
        title="Proveedores de materiales"
        description="Registre y mantenga actualizados los datos de contacto de sus proveedores."
        actions={
          <>
            <MetricPill
              label="proveedores"
              value={result.total}
              role="status"
            />
            <Button
              to={MATERIALES_PATH}
              variant="secondary"
              leftIcon={<IconPackage size={18} aria-hidden="true" />}
            >
              Materiales
            </Button>
            {canManage ? (
              <Button
                to={PROVEEDOR_NEW_PATH}
                leftIcon={<IconPlus size={18} aria-hidden="true" />}
              >
                Nuevo proveedor
              </Button>
            ) : null}
          </>
        }
      />

      <section className="inv-panel" aria-label="Búsqueda y filtros">
        <div className="inv-filters">
          <label>
            Buscar por nombre
            <input
              type="search"
              value={searchInput}
              maxLength={150}
              placeholder="Ej. Ferretería Central"
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </label>
          <label>
            Estado
            <select
              value={activo}
              onChange={(event) => {
                setActivo(event.target.value)
                setPage(1)
              }}
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </label>
          <Button
            type="button"
            variant="secondary"
            onClick={clearFilters}
            disabled={!filtered}
            leftIcon={<IconRefresh size={18} aria-hidden="true" />}
          >
            Limpiar filtros
          </Button>
        </div>
      </section>

      {feedback ? (
        <Alert tone={feedback.kind === 'error' ? 'danger' : 'success'}>
          {feedback.text}
        </Alert>
      ) : null}

      {loading ? (
        <div className="inv-state" role="status">
          Cargando proveedores…
        </div>
      ) : null}

      {!loading && error ? (
        <Alert tone="danger" title="No se pudieron cargar los proveedores">
          <p className="m-0 mb-3">{error}</p>
          <Button size="sm" onClick={refetch}>
            Reintentar
          </Button>
        </Alert>
      ) : null}

      {!loading && !error && result.data.length === 0 ? (
        <EmptyState
          icon={<IconPackage size={30} aria-hidden="true" />}
          title={filtered ? 'No hay coincidencias' : 'Aún no hay proveedores'}
          description={
            filtered
              ? 'Pruebe con otro nombre o limpie los filtros.'
              : 'Los proveedores registrados aparecerán aquí.'
          }
          actions={
            !filtered && canManage ? (
              <Button
                to={PROVEEDOR_NEW_PATH}
                leftIcon={<IconPlus size={18} aria-hidden="true" />}
              >
                Nuevo proveedor
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {!loading && !error && result.data.length > 0 ? (
        <ProveedorTable
          proveedores={result.data}
          canManage={canManage}
          changingId={changingId}
          from={from}
          to={to}
          total={result.total}
          onStateChange={changeState}
        />
      ) : null}

      {!loading && !error && result.totalPages > 1 ? (
        <nav className="inv-pagination" aria-label="Paginación de proveedores">
          <button
            type="button"
            className="inv-btn inv-btn--secondary"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Anterior
          </button>
          <span>
            Página {page} de {result.totalPages}
          </span>
          <button
            type="button"
            className="inv-btn inv-btn--secondary"
            disabled={page >= result.totalPages}
            onClick={() =>
              setPage((value) => Math.min(result.totalPages, value + 1))
            }
          >
            Siguiente
          </button>
        </nav>
      ) : null}
    </main>
  )
}

function ProveedorTable({
  proveedores,
  canManage,
  changingId,
  from,
  to,
  total,
  onStateChange,
}: {
  proveedores: Proveedor[]
  canManage: boolean
  changingId: number | null
  from: number
  to: number
  total: number
  onStateChange: (proveedor: Proveedor, activo: boolean) => Promise<void>
}) {
  return (
    <section className="inv-panel" aria-label="Listado de proveedores">
      <div className="inv-panel__heading">
        <div>
          <h2>Directorio de proveedores</h2>
          <p>
            Mostrando {from}–{to} de {total}
          </p>
        </div>
      </div>
      <div className="inv-table-wrap">
        <table className="inv-table">
          <caption className="visually-hidden">Listado de proveedores</caption>
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Identificación</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Contacto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((item) => (
              <tr key={item.id}>
                <td data-label="Proveedor">
                  <strong>{item.nombre}</strong>
                  {item.razonSocial ? (
                    <small
                      style={{
                        display: 'block',
                        color: 'var(--inv-muted)',
                        fontWeight: 500,
                      }}
                    >
                      {item.razonSocial}
                    </small>
                  ) : null}
                </td>
                <td data-label="Identificación">
                  {item.identificacion || 'No indicada'}
                </td>
                <td data-label="Teléfono">{item.telefono || 'No indicado'}</td>
                <td data-label="Correo">
                  {item.correo ? (
                    <a href={`mailto:${item.correo}`}>{item.correo}</a>
                  ) : (
                    'No indicado'
                  )}
                </td>
                <td data-label="Contacto">
                  {item.personaContacto || 'No indicado'}
                </td>
                <td data-label="Estado">
                  <Badge tone={item.activo ? 'success' : 'neutral'}>
                    {item.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td data-label="Acciones">
                  <div className="inv-row-actions">
                    {canManage ? (
                      <>
                        <Button
                          className="inv-row-action"
                          size="sm"
                          to={proveedorEditPath(item.id)}
                          state={{ proveedor: item }}
                        >
                          Editar
                        </Button>
                        <ProveedorStateAction
                          proveedor={item}
                          disabled={changingId !== null}
                          onChange={onStateChange}
                        />
                      </>
                    ) : (
                      <span style={{ color: 'var(--inv-muted)' }}>
                        Solo lectura
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
