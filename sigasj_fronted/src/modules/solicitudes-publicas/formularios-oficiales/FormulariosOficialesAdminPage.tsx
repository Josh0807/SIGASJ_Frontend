import { IconFileDescription, IconRefresh, IconUpload } from '@tabler/icons-react'
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
import { runAfterEffect } from '../../../shared/utils/yieldToEffect'
import { formatearFechaHoraAsada } from '../../../shared/utils/fechaAsada'
import { SOLICITUDES_ADMIN_PATH } from '../admin/solicitudesAdminPaths'
import FormularioOficialUploadDialog from './FormularioOficialUploadDialog'
import { getFormulariosOficialesAdmin, uploadFormularioOficial } from './formulariosOficialesApi'
import type { FormularioOficial } from './types'

const toAdminError = (error: unknown) => {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('HTTP 401')) return 'Tu sesión expiró. Inicia sesión nuevamente.'
  if (message.includes('HTTP 403')) return 'No tienes permisos para administrar formularios oficiales.'
  return ADMIN_COPY.loadError('los formularios oficiales')
}

const FormulariosOficialesAdminPage = () => {
  const [items, setItems] = useState<FormularioOficial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selected, setSelected] = useState<FormularioOficial | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await getFormulariosOficialesAdmin())
    } catch (caught) {
      setError(toAdminError(caught))
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => runAfterEffect(() => { void load() }), [load])

  const save = async (file: File) => {
    if (!selected || submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const updated = await uploadFormularioOficial(selected.tipoSolicitudId, file)
      setItems((current) =>
        current.map((item) =>
          item.tipoSolicitudId === updated.tipoSolicitudId ? updated : item,
        ),
      )
      setSelected(null)
      setSuccess('El PDF oficial se guardó correctamente.')
    } catch (caught) {
      setError(toAdminError(caught))
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <AdminShell className="gap-6" aria-labelledby="formularios-oficiales-title">
      <PageHeader
        id="formularios-oficiales-title"
        eyebrow="Gestión de solicitudes · Formularios"
        title={
          <span className="inline-flex flex-wrap items-center gap-2">
            <IconFileDescription size={22} aria-hidden="true" />
            Formularios oficiales
            {!loading ? (
              <Badge tone="info">
                {items.length} {items.length === 1 ? 'formulario' : 'formularios'}
              </Badge>
            ) : null}
          </span>
        }
        description="Administre el PDF vigente de cada uno de los seis trámites oficiales."
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
        <Alert tone="info">{ADMIN_COPY.loading('formularios oficiales')}</Alert>
      ) : items.length === 0 ? (
        <EmptyState title={ADMIN_COPY.loadError('el catálogo de formularios oficiales')} />
      ) : (
        <section
          className="grid grid-cols-2 gap-5 max-[820px]:grid-cols-1"
          aria-label="Catálogo de formularios oficiales"
        >
          {items.map((item) => (
            <article
              className="flex min-w-0 flex-col rounded-[20px] border border-sky-100 bg-white p-6 shadow-[0_10px_28px_rgba(39,112,166,0.1)]"
              key={item.tipoSolicitudId}
            >
              <div className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sky-100 text-[#1476cf]">
                  <IconFileDescription size={27} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="m-0 text-xl font-extrabold leading-tight text-[#073b79]">
                    {item.nombre}
                  </h2>
                  <Badge tone={item.tienePdf ? 'success' : 'warning'} className="mt-3">
                    {item.tienePdf ? 'PDF cargado' : 'Sin PDF'}
                  </Badge>
                </div>
              </div>
              <dl className="mt-5 grid gap-3 text-sm">
                <div>
                  <dt className="font-bold text-[#607a98]">Archivo vigente</dt>
                  <dd className="m-0 mt-1 break-all font-semibold text-[#173f6e]">
                    {item.nombreArchivo ?? 'No disponible'}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-[#607a98]">Última actualización</dt>
                  <dd className="m-0 mt-1 font-semibold text-[#173f6e]">
                    {item.fechaActualizacion
                      ? formatearFechaHoraAsada(item.fechaActualizacion)
                      : 'Sin cargas registradas'}
                  </dd>
                </div>
              </dl>
              <Button
                type="button"
                variant="primary"
                className="mt-6"
                leftIcon={<IconUpload size={17} aria-hidden="true" />}
                onClick={() => {
                  setSuccess(null)
                  setSelected(item)
                }}
              >
                {item.tienePdf ? 'Reemplazar PDF' : 'Subir PDF'}
              </Button>
            </article>
          ))}
        </section>
      )}

      {selected ? (
        <FormularioOficialUploadDialog
          formulario={selected}
          submitting={submitting}
          onCancel={() => {
            if (!submitting) setSelected(null)
          }}
          onSave={save}
        />
      ) : null}
    </AdminShell>
  )
}

export default FormulariosOficialesAdminPage