import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { IconPlus, IconRefresh, IconSearch } from '@tabler/icons-react'
import { ADMIN_COPY } from '../../shared/admin/adminCopy'
import {
  AdminFilterField,
  AdminFilters,
  AdminListItem,
  AdminShell,
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  adminFilterControlClassName,
} from '../../shared/ui'
import {
  USUARIO_ASSIGNABLE_ROLES,
  USUARIO_ROLE_LABELS,
  type CreateUsuarioPayload,
  type UpdateUsuarioPayload,
  type UsuarioAdmin,
  type UsuarioRoleValue,
} from './types'
import {
  createUsuarioAdmin,
  getUsuariosAdmin,
  updateUsuarioAdmin,
} from './usuariosApi'

type FormMode = 'create' | 'edit'

type FormState = {
  nombre: string
  correo: string
  password: string
  rol: UsuarioRoleValue
  activo: boolean
}

const EMPTY_FORM: FormState = {
  nombre: '',
  correo: '',
  password: '',
  rol: 'FONTANERO',
  activo: true,
}

function roleLabel(rol: string): string {
  return USUARIO_ROLE_LABELS[rol as UsuarioRoleValue] ?? rol
}

function parseError(caught: unknown, fallback: string): string {
  if (!(caught instanceof Error)) return fallback
  const message = caught.message
  if (message.includes('401')) {
    return 'La sesión no es válida. Cierre sesión e inicie de nuevo.'
  }
  if (message.includes('403')) {
    return 'No tiene permisos de Super Admin para gestionar usuarios.'
  }
  const detail = message.replace(/^HTTP \d+:\s*/i, '').trim()
  return detail || fallback
}

export default function UsuariosAdminPage() {
  const [rows, setRows] = useState<UsuarioAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getUsuariosAdmin()
      setRows(Array.isArray(response.data) ? response.data : [])
    } catch (caught) {
      setError(parseError(caught, ADMIN_COPY.loadError('los usuarios')))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => {
      const haystack = `${row.nombre} ${row.correo} ${roleLabel(row.rol)}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [rows, search])

  const openCreate = () => {
    setFormMode('create')
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
    setSuccess(null)
    setError(null)
  }

  const openEdit = (usuario: UsuarioAdmin) => {
    setFormMode('edit')
    setEditingId(usuario.id)
    setForm({
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '',
      rol: (USUARIO_ASSIGNABLE_ROLES.includes(usuario.rol as UsuarioRoleValue)
        ? usuario.rol
        : 'FONTANERO') as UsuarioRoleValue,
      activo: usuario.activo,
    })
    setFormOpen(true)
    setSuccess(null)
    setError(null)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      if (formMode === 'create') {
        const payload: CreateUsuarioPayload = {
          nombre: form.nombre.trim(),
          correo: form.correo.trim().toLowerCase(),
          password: form.password,
          rol: form.rol,
          activo: form.activo,
        }
        await createUsuarioAdmin(payload)
        setSuccess('Usuario creado correctamente.')
      } else if (editingId != null) {
        const payload: UpdateUsuarioPayload = {
          nombre: form.nombre.trim(),
          rol: form.rol,
          activo: form.activo,
        }
        if (form.password.trim()) {
          payload.password = form.password
        }
        await updateUsuarioAdmin(editingId, payload)
        setSuccess('Usuario actualizado correctamente.')
      }
      closeForm()
      await load()
    } catch (caught) {
      setError(
        parseError(
          caught,
          ADMIN_COPY.actionError(
            formMode === 'create' ? 'crear' : 'actualizar',
            'el usuario',
          ),
        ),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminShell aria-labelledby="usuarios-admin-title">
      <PageHeader
        id="usuarios-admin-title"
        title="Gestión de usuarios"
        description="Alta y edición de cuentas del sistema. Solo Super Admin."
        actions={
          <Button
            type="button"
            leftIcon={<IconPlus size={17} aria-hidden="true" />}
            onClick={openCreate}
          >
            Nuevo usuario
          </Button>
        }
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}
      {success ? <Alert tone="success">{success}</Alert> : null}

      <AdminFilters
        aria-label="Buscar usuarios"
        summary={
          <span>
            <strong className="text-sigasj-ink">{filtered.length}</strong>{' '}
            {filtered.length === 1 ? 'usuario' : 'usuarios'}
          </span>
        }
      >
        <AdminFilterField label="Buscar">
          <span className="relative block">
            <IconSearch
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sigasj-muted"
              size={17}
              aria-hidden="true"
            />
            <input
              type="search"
              className={`${adminFilterControlClassName} pl-9`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nombre, correo o rol…"
            />
          </span>
        </AdminFilterField>
        <Button
          type="button"
          variant="secondary"
          leftIcon={<IconRefresh size={17} aria-hidden="true" />}
          onClick={() => void load()}
        >
          Actualizar
        </Button>
      </AdminFilters>

      {formOpen ? (
        <Card as="section" padded className="min-w-0" aria-label="Formulario de usuario">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => void handleSubmit(e)}>
            <h2 className="m-0 sm:col-span-2 font-['Times_New_Roman',Times,serif] text-xl text-sigasj-ink">
              {formMode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
            </h2>

            <label className="grid gap-1.5">
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted">
                Nombre
              </span>
              <input
                required
                maxLength={150}
                className={adminFilterControlClassName}
                value={form.nombre}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, nombre: event.target.value }))
                }
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted">
                Correo
              </span>
              <input
                required
                type="email"
                maxLength={150}
                disabled={formMode === 'edit'}
                className={adminFilterControlClassName}
                value={form.correo}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, correo: event.target.value }))
                }
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted">
                {formMode === 'create' ? 'Contraseña' : 'Nueva contraseña (opcional)'}
              </span>
              <input
                required={formMode === 'create'}
                type="password"
                minLength={6}
                autoComplete="new-password"
                className={adminFilterControlClassName}
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-sigasj-muted">
                Rol
              </span>
              <select
                className={adminFilterControlClassName}
                value={form.rol}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    rol: event.target.value as UsuarioRoleValue,
                  }))
                }
              >
                {USUARIO_ASSIGNABLE_ROLES.map((rol) => (
                  <option key={rol} value={rol}>
                    {USUARIO_ROLE_LABELS[rol]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, activo: event.target.checked }))
                }
              />
              <span className="text-sm font-semibold text-sigasj-ink">Usuario activo</span>
            </label>

            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? 'Guardando…'
                  : formMode === 'create'
                    ? 'Crear usuario'
                    : 'Guardar cambios'}
              </Button>
              <Button type="button" variant="secondary" onClick={closeForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {loading ? (
        <Alert tone="info">{ADMIN_COPY.loading('usuarios')}</Alert>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={ADMIN_COPY.emptyFiltered('usuarios')}
          actions={
            <Button type="button" variant="secondary" onClick={() => void load()}>
              {ADMIN_COPY.retry}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((usuario) => (
            <AdminListItem
              key={usuario.id}
              title={usuario.nombre}
              description={usuario.correo}
              badges={
                <>
                  <Badge>{roleLabel(usuario.rol)}</Badge>
                  <Badge tone={usuario.activo ? 'success' : 'neutral'}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </>
              }
              actions={
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => openEdit(usuario)}
                >
                  Editar
                </Button>
              }
            />
          ))}
        </div>
      )}
    </AdminShell>
  )
}
