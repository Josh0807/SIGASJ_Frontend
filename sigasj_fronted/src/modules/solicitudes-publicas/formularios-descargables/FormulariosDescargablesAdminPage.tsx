import {
  IconFileDescription,
  IconPencil,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ADMIN_COPY } from '../../../shared/admin/adminCopy'
import {
  AdminShell,
  Alert,
  Badge,
  Button,
  EmptyState,
  PageHeader,
} from '../../../shared/ui'
import { formatearFechaHoraAsada } from '../../../shared/utils/fechaAsada'
import { SOLICITUDES_ADMIN_PATH } from '../admin/solicitudesAdminPaths'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import FormularioDescargableCreateDialog from './FormularioDescargableCreateDialog'
import FormularioDescargableEditPage from './FormularioDescargableEditPage'
import FormularioDescargableEstadoAction from './FormularioDescargableEstadoAction'
import {
  createFormularioDescargable,
  listFormulariosDescargablesAdmin,
  replaceFormularioDescargableArchivo,
  setFormularioDescargableEstado,
  toFormulariosDescargablesAdminError,
  updateFormularioDescargable,
} from './formulariosDescargablesApi'
import type {
  CreateFormularioDescargableInput,
  FormularioDescargableAdmin,
  UpdateFormularioDescargableInput,
} from './types'

type DialogMode =
  | { type: 'create' }
  | { type: 'edit'; formulario: FormularioDescargableAdmin }
  | null

const FormulariosDescargablesAdminPage = () => {
  const [items, setItems] = useState<FormularioDescargableAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogMode>(null)
  const [submitting, setSubmitting] = useState(false)
  const [estadoBusyId, setEstadoBusyId] = useState<number | null>(null)
  const submittingRef = useRef(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await listFormulariosDescargablesAdmin())
    } catch (caught) {
      setError(toFormulariosDescargablesAdminError(caught))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => runAfterEffect(() => {
    void load()
  }), [load])

  const upsertItem = (updated: FormularioDescargableAdmin) => {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === updated.id)
      if (index < 0) return [updated, ...current]
      const next = [...current]
      next[index] = updated
      return next
    })
  }

  const runMutation = async (
    action: () => Promise<FormularioDescargableAdmin>,
    successMessage: string,
    closeDialog = true,
  ) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await action()
      upsertItem(updated)
      if (closeDialog) setDialog(null)
      setSuccess(successMessage)
    } catch (caught) {
      setError(toFormulariosDescargablesAdminError(caught))
      if (String(caught).includes('HTTP 404')) {
        void load()
      }
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const handleCreate = async (input: CreateFormularioDescargableInput) => {
    await runMutation(
      () => createFormularioDescargable(input),
      'Formulario registrado correctamente.',
    )
  }

  const handleEdit = async (input: UpdateFormularioDescargableInput) => {
    if (dialog?.type !== 'edit') return
    const id = dialog.formulario.id
    await runMutation(
      () => updateFormularioDescargable(id, input),
      'Información actualizada correctamente.',
    )
  }

  const handleReplace = async (file: File) => {
    if (dialog?.type !== 'edit') return
    const id = dialog.formulario.id
    await runMutation(
      () => replaceFormularioDescargableArchivo(id, file),
      'Documento reemplazado correctamente.',
      false,
    )
  }

  if (dialog?.type === 'edit') {
    const editing =
      items.find((item) => item.id === dialog.formulario.id) ?? dialog.formulario
    return (
      <FormularioDescargableEditPage
        formulario={editing}
        submitting={submitting}
        error={error}
        success={success}
        onDismissSuccess={() => setSuccess(null)}
        onBack={() => {
          if (!submitting) {
            setDialog(null)
            setError(null)
          }
        }}
        onSave={handleEdit}
        onReplacePdf={handleReplace}
      />
    )
  }

  const handleEstado = async (
    formulario: FormularioDescargableAdmin,
    activo: boolean,
  ) => {
    if (estadoBusyId !== null || submittingRef.current) return
    setEstadoBusyId(formulario.id)
    setError(null)
    setSuccess(null)
    try {
      const updated = await setFormularioDescargableEstado(
        formulario.id,
        activo,
      )
      upsertItem(updated)
      setSuccess(
        activo
          ? 'Formulario activado correctamente.'
          : 'Formulario inactivado. Sigue disponible en este listado.',
      )
    } catch (caught) {
      setError(toFormulariosDescargablesAdminError(caught))
      if (String(caught).includes('HTTP 404')) {
        void load()
      }
    } finally {
      setEstadoBusyId(null)
    }
  }

  return (
    <AdminShell
      className="gap-6"
      aria-labelledby="formularios-descargables-title"
    >
      <PageHeader
        id="formularios-descargables-title"
        eyebrow="Gestión de solicitudes · Formularios"
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            <IconFileDescription size={22} aria-hidden="true" />
            Formularios descargables
            {!loading ? (
              <Badge tone="info">
                {items.length} {items.length === 1 ? 'formulario' : 'formularios'}
              </Badge>
            ) : null}
          </span>
        }
        description="Administre los formularios adicionales disponibles para descarga (Card 7 · Otros formularios). Inactivar no elimina el registro."
        actions={
          <>
            <Button to={SOLICITUDES_ADMIN_PATH} variant="ghost">
              Volver a solicitudes
            </Button>
            <Button
              type="button"
              variant="secondary"
              leftIcon={<IconRefresh size={17} aria-hidden="true" />}
              disabled={loading}
              onClick={() => void load()}
            >
              Actualizar
            </Button>
            <Button
              type="button"
              variant="primary"
              leftIcon={<IconPlus size={17} aria-hidden="true" />}
              onClick={() => {
                setSuccess(null)
                setDialog({ type: 'create' })
              }}
            >
              Agregar formulario
            </Button>
          </>
        }
      />

      {success ? <Alert tone="success">{success}</Alert> : null}

      {error ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Alert tone="danger">{error}</Alert>
          <Button type="button" variant="secondary" onClick={() => void load()}>
            {ADMIN_COPY.retry}
          </Button>
        </div>
      ) : null}

      {loading ? (
        <Alert tone="info">{ADMIN_COPY.loading('formularios descargables')}</Alert>
      ) : items.length === 0 ? (
        <EmptyState
          title={ADMIN_COPY.empty('formularios descargables')}
          actions={
            <Button
              type="button"
              variant="primary"
              leftIcon={<IconPlus size={17} aria-hidden="true" />}
              onClick={() => setDialog({ type: 'create' })}
            >
              Agregar formulario
            </Button>
          }
        />
      ) : (
          <section
            className="grid grid-cols-2 gap-5 max-[820px]:grid-cols-1"
            aria-label="Listado de formularios descargables"
          >
            {items.map((item) => (
              <article
                className="flex min-w-0 flex-col rounded-[20px] border border-sky-100 bg-white p-6 shadow-[0_10px_28px_rgba(39,112,166,0.1)]"
                key={item.id}
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sky-100 text-[#1476cf]">
                    <IconFileDescription size={27} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="m-0 text-xl font-extrabold leading-tight text-[#073b79]">
                      {item.nombre}
                    </h2>
                    <Badge
                      tone={item.activo ? 'success' : 'neutral'}
                      className="mt-3"
                    >
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>

                <p className="mb-0 mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                  {item.descripcion?.trim()
                    ? item.descripcion
                    : 'Sin descripción.'}
                </p>

                <dl className="mt-5 grid gap-3 text-sm">
                  <div>
                    <dt className="font-bold text-[#607a98]">Archivo</dt>
                    <dd className="m-0 mt-1 break-all font-semibold text-[#173f6e]">
                      {item.nombreArchivoOriginal}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-[#607a98]">
                      Fecha de publicación
                    </dt>
                    <dd className="m-0 mt-1 font-semibold text-[#173f6e]">
                      {item.fechaPublicacion
                        ? formatearFechaHoraAsada(item.fechaPublicacion)
                        : 'No publicada'}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={<IconPencil size={16} aria-hidden="true" />}
                    disabled={submitting || estadoBusyId !== null}
                    onClick={() => {
                      setSuccess(null)
                      setDialog({ type: 'edit', formulario: item })
                    }}
                  >
                    {ADMIN_COPY.edit}
                  </Button>
                  <FormularioDescargableEstadoAction
                    formulario={item}
                    disabled={
                      submitting ||
                      estadoBusyId === item.id ||
                      estadoBusyId !== null
                    }
                    onChange={handleEstado}
                  />
                </div>
              </article>
            ))}
          </section>
        )}

      {dialog?.type === 'create' ? (
        <FormularioDescargableCreateDialog
          submitting={submitting}
          onCancel={() => {
            if (!submitting) setDialog(null)
          }}
          onSave={handleCreate}
        />
      ) : null}
    </AdminShell>
  )
}

export default FormulariosDescargablesAdminPage
