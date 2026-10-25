import {
  IconCircleCheckFilled,
  IconFileDescription,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { formatearFechaHoraAsada } from '../../../shared/utils/fechaAsada'
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import FormularioDescargableCreateDialog from './FormularioDescargableCreateDialog'
import FormularioDescargableEditDialog from './FormularioDescargableEditDialog'
import FormularioDescargableEstadoAction from './FormularioDescargableEstadoAction'
import FormularioDescargableReplaceDialog from './FormularioDescargableReplaceDialog'
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
  | { type: 'replace'; formulario: FormularioDescargableAdmin }
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
    if (dialog?.type !== 'replace') return
    const id = dialog.formulario.id
    await runMutation(
      () => replaceFormularioDescargableArchivo(id, file),
      'Documento reemplazado correctamente.',
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
    <main className="admin-content-modern min-w-0">
      <div className="mx-auto grid w-full max-w-[1180px] gap-6">
        <header className="flex min-h-[220px] flex-wrap items-center justify-between gap-6 rounded-[24px] border border-sky-100 bg-white p-8 shadow-[0_12px_32px_rgba(39,112,166,0.08)] max-[640px]:min-h-0 max-[640px]:p-6">
          <div className="min-w-0">
            <p className="m-0 text-sm font-extrabold uppercase tracking-[0.1em] text-blue-600">
              Gestión de solicitudes · Formularios
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <h1 className="m-0 text-[clamp(2rem,4vw,2.8rem)] font-black leading-none tracking-[-0.035em] text-[#062e63]">
                Formularios descargables
              </h1>
              {!loading ? (
                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-700">
                  {items.length}{' '}
                  {items.length === 1 ? 'formulario' : 'formularios'}
                </span>
              ) : null}
            </div>
            <p className="mb-0 mt-6 max-w-3xl text-lg leading-7 text-slate-500">
              Administre los formularios adicionales disponibles para descarga
              (Card 7 · Otros formularios). Inactivar no elimina el registro.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex min-h-[52px] cursor-pointer items-center gap-2 rounded-2xl border border-blue-200 bg-white px-6 font-extrabold text-[#0b65b5] shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
              type="button"
              disabled={loading}
              onClick={() => void load()}
            >
              <IconRefresh size={19} aria-hidden="true" /> Actualizar
            </button>
            <button
              className="inline-flex min-h-[52px] cursor-pointer items-center gap-2 rounded-2xl !border-0 bg-gradient-to-r from-[#0872d3] to-[#3298dc] px-6 font-extrabold text-white shadow-md transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
              type="button"
              onClick={() => {
                setSuccess(null)
                setDialog({ type: 'create' })
              }}
            >
              <IconPlus size={19} aria-hidden="true" /> Agregar formulario
            </button>
          </div>
        </header>

        {success ? (
          <div
            className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 px-5 py-4 shadow-[0_12px_30px_rgba(5,150,105,0.12)]"
            role="status"
          >
            <span
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-600 shadow-inner"
              aria-hidden="true"
            >
              <IconCircleCheckFilled size={27} />
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-base font-extrabold text-emerald-950">
                Operación exitosa
              </strong>
              <span className="mt-0.5 block text-sm font-medium text-emerald-800">
                {success}
              </span>
            </div>
            <button
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-emerald-700 transition hover:bg-emerald-100"
              type="button"
              aria-label="Cerrar notificación"
              onClick={() => setSuccess(null)}
            >
              <IconX size={19} aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {error ? (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            role="alert"
          >
            <p className="m-0 font-semibold text-red-800">{error}</p>
            <button
              className="min-h-10 cursor-pointer rounded-xl border border-red-300 bg-white px-4 font-bold text-red-800"
              type="button"
              onClick={() => void load()}
            >
              Reintentar
            </button>
          </div>
        ) : null}

        {loading ? (
          <p
            className="rounded-2xl bg-white p-8 text-center font-semibold text-[#607a98] shadow-sm"
            role="status"
          >
            Cargando formularios descargables…
          </p>
        ) : items.length === 0 ? (
          <div
            className="rounded-2xl bg-white p-8 text-center shadow-sm"
            role="status"
          >
            <p className="m-0 font-semibold text-[#607a98]">
              Aún no hay formularios descargables registrados.
            </p>
            <button
              className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl !border-0 bg-gradient-to-r from-[#0872d3] to-[#3298dc] px-6 font-extrabold text-white"
              type="button"
              onClick={() => setDialog({ type: 'create' })}
            >
              <IconPlus size={18} aria-hidden="true" /> Agregar formulario
            </button>
          </div>
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
                    <span
                      className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${
                        item.activo
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </span>
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
                  <button
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 text-sm font-extrabold text-[#0b65b5]"
                    type="button"
                    disabled={submitting || estadoBusyId !== null}
                    onClick={() => {
                      setSuccess(null)
                      setDialog({ type: 'edit', formulario: item })
                    }}
                  >
                    <IconPencil size={17} aria-hidden="true" /> Editar
                  </button>
                  <button
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 text-sm font-extrabold text-[#0b65b5]"
                    type="button"
                    disabled={submitting || estadoBusyId !== null}
                    onClick={() => {
                      setSuccess(null)
                      setDialog({ type: 'replace', formulario: item })
                    }}
                  >
                    <IconUpload size={17} aria-hidden="true" /> Reemplazar PDF
                  </button>
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
      </div>

      {dialog?.type === 'create' ? (
        <FormularioDescargableCreateDialog
          submitting={submitting}
          onCancel={() => {
            if (!submitting) setDialog(null)
          }}
          onSave={handleCreate}
        />
      ) : null}
      {dialog?.type === 'edit' ? (
        <FormularioDescargableEditDialog
          formulario={dialog.formulario}
          submitting={submitting}
          onCancel={() => {
            if (!submitting) setDialog(null)
          }}
          onSave={handleEdit}
        />
      ) : null}
      {dialog?.type === 'replace' ? (
        <FormularioDescargableReplaceDialog
          formulario={dialog.formulario}
          submitting={submitting}
          onCancel={() => {
            if (!submitting) setDialog(null)
          }}
          onSave={handleReplace}
        />
      ) : null}
    </main>
  )
}

export default FormulariosDescargablesAdminPage
