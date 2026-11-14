import { ZONA_HORARIA_ASADA } from '../../../shared/utils/fechaAsada'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/components/AuthContext'
import {
  InternalAdminRoleName,
  normalizeInternalRole,
} from '../../auth/utils/internalRoles'
import { IconEdit, IconPlus, IconRefresh } from '@tabler/icons-react'
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  PageHeader,
} from '../../../shared/ui'
import {
  CATEGORIA_NEW_PATH,
  categoriaEditPath,
  MATERIALES_PATH,
} from '../inventarioPaths'
import CategoriaStateAction from './CategoriaStateAction'
import { updateCategoriaEstado } from './categoriasApi'
import { categoriaError } from './categoriaUtils'
import type { Categoria } from './types'
import { useCategorias } from './useCategorias'

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeZone: ZONA_HORARIA_ASADA,
  }).format(new Date(value))

export default function CategoriasPage() {
  const { user, logout } = useAuth()
  const canManage =
    normalizeInternalRole(user?.role) === InternalAdminRoleName.Administradora
  const [input, setInput] = useState('')
  const [nombre, setNombre] = useState('')
  const [activo, setActivo] = useState('')
  const [page, setPage] = useState(1)
  const [changing, setChanging] = useState<number | null>(null)
  const [message, setMessage] = useState<{
    error: boolean
    text: string
  } | null>(null)
  const applied = useRef('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const value = input.trim()
      if (value !== applied.current) {
        applied.current = value
        setNombre(value)
        setPage(1)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [input])

  const { result, loading, error, refetch } = useCategorias({
    nombre: nombre || undefined,
    activo: activo === '' ? undefined : activo === 'true',
    page,
    limit: 20,
  })

  const filtered = Boolean(input.trim() || activo)
  const from = result.total === 0 ? 0 : (page - 1) * 20 + 1
  const to = Math.min(page * 20, result.total)

  const changeState = async (categoria: Categoria, next: boolean) => {
    if (changing !== null) return
    setChanging(categoria.id)
    setMessage(null)
    try {
      await updateCategoriaEstado(categoria.id, next)
      setMessage({
        error: false,
        text: `Categoría ${next ? 'reactivada' : 'desactivada'} correctamente.`,
      })
      refetch()
    } catch (caught) {
      const parsed = categoriaError(caught)
      setMessage({ error: true, text: parsed.message })
      if (parsed.status === 404) refetch()
      if (parsed.status === 401) logout()
    } finally {
      setChanging(null)
    }
  }

  const clearFilters = () => {
    setInput('')
    applied.current = ''
    setNombre('')
    setActivo('')
    setPage(1)
  }

  return (
    <main
      className="inv-categorias"
      style={{ display: 'grid', gap: 14 }}
    >
      <PageHeader
        title="Categorías de materiales"
        description="Consulte y mantenga las categorías utilizadas en la bodega."
        actions={
          <>
            <Badge tone="success" role="status">
              {result.total} categorías
            </Badge>
            <Button to={MATERIALES_PATH} variant="secondary">
              Materiales
            </Button>
            {canManage ? (
              <Button
                to={CATEGORIA_NEW_PATH}
                leftIcon={<IconPlus size={18} aria-hidden="true" />}
              >
                Nueva categoría
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
              value={input}
              maxLength={100}
              placeholder="Ej. Tubería"
              onChange={(event) => setInput(event.target.value)}
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

      {message ? (
        <Alert tone={message.error ? 'danger' : 'success'}>{message.text}</Alert>
      ) : null}

      {loading ? (
        <div className="inv-state" role="status">
          Cargando categorías…
        </div>
      ) : null}

      {!loading && error ? (
        <Alert tone="danger" title="No se pudieron cargar las categorías">
          <p className="m-0 mb-3">{error}</p>
          <Button size="sm" onClick={refetch}>
            Reintentar
          </Button>
        </Alert>
      ) : null}

      {!loading && !error && !result.data.length ? (
        <EmptyState
          title="No se encontraron categorías"
          description="Pruebe otros filtros o registre una nueva categoría."
          actions={
            canManage ? (
              <Button
                to={CATEGORIA_NEW_PATH}
                leftIcon={<IconPlus size={18} aria-hidden="true" />}
              >
                Nueva categoría
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {!loading && !error && result.data.length > 0 ? (
        <section className="inv-panel" aria-label="Listado de categorías">
          <div className="inv-panel__heading">
            <div>
              <h2>Catálogo de categorías</h2>
              <p>
                Mostrando {from}–{to} de {result.total}
              </p>
            </div>
          </div>
          <div className="inv-table-wrap">
            <table className="inv-table">
              <caption className="visually-hidden">
                Categorías de materiales
              </caption>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th>Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Nombre">
                      <strong>{item.nombre}</strong>
                    </td>
                    <td data-label="Descripción">
                      {item.descripcion || 'Sin descripción'}
                    </td>
                    <td data-label="Vencimiento">
                      {item.requiereFechaVencimiento ? (
                        <span className="inv-badge inv-badge--low">Sí</span>
                      ) : (
                        <span style={{ color: 'var(--inv-muted)' }}>No</span>
                      )}
                    </td>
                    <td data-label="Estado">
                      <span
                        className={
                          item.activo
                            ? 'inv-badge inv-badge--ok'
                            : 'inv-badge inv-badge--inactive'
                        }
                      >
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td data-label="Creación">{formatDate(item.createdAt)}</td>
                    <td data-label="Acciones">
                      <div className="inv-row-actions">
                        {canManage ? (
                          <>
                            <Button
                              className="inv-row-action"
                              size="sm"
                              to={categoriaEditPath(item.id)}
                              leftIcon={<IconEdit size={16} aria-hidden="true" />}
                            >
                              Editar
                            </Button>
                            <CategoriaStateAction
                              categoria={item}
                              disabled={changing !== null}
                              onChange={changeState}
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
      ) : null}

      {!loading && !error && result.totalPages > 0 ? (
        <nav className="inv-pagination" aria-label="Paginación de categorías">
          <button
            type="button"
            className="inv-btn inv-btn--secondary"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
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
            onClick={() => setPage((value) => value + 1)}
          >
            Siguiente
          </button>
        </nav>
      ) : null}
    </main>
  )
}
