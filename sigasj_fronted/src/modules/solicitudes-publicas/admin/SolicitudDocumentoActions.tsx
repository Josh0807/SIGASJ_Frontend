import { IconDownload, IconEye, IconLoader2 } from '@tabler/icons-react'
import { useState } from 'react'
import { getSolicitudDocumentoAdmin, solicitudesAdminError } from './solicitudesAdminApi'
import type { SolicitudDocumentoAdmin } from './types'
import { useSolicitudesAdminSecurity } from './useSolicitudesAdminSecurity'

type Props = { solicitudId: number; document: SolicitudDocumentoAdmin }

export default function SolicitudDocumentoActions({ solicitudId, document }: Props) {
  const [action, setAction] = useState<'view' | 'download' | null>(null)
  const [error, setError] = useState('')
  const handleSecurityError = useSolicitudesAdminSecurity()

  const openDocument = async (mode: 'view' | 'download') => {
    // Se abre durante el clic. Si se espera al fetch, el navegador lo trata
    // como una ventana emergente no iniciada por el usuario.
    const previewWindow = mode === 'view' ? window.open('about:blank', '_blank') : null
    if (mode === 'view' && !previewWindow) {
      setError('El navegador bloqueó la vista previa. Habilita las ventanas emergentes o descarga el archivo.')
      return
    }
    if (previewWindow) {
      previewWindow.opener = null
      previewWindow.document.title = `Cargando ${document.nombreOriginal}…`
      previewWindow.document.body.innerHTML = '<p style="font-family:system-ui;padding:24px;color:#173f6e">Cargando documento…</p>'
    }

    setAction(mode)
    setError('')
    try {
      const blob = await getSolicitudDocumentoAdmin(solicitudId, document.id)
      const url = URL.createObjectURL(blob)
      if (mode === 'view') {
        previewWindow?.location.replace(url)
      } else {
        const anchor = window.document.createElement('a')
        anchor.href = url
        anchor.download = document.nombreOriginal
        anchor.click()
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (caught) {
      previewWindow?.close()
      if (!handleSecurityError(caught)) setError(solicitudesAdminError(caught, 'No fue posible consultar el documento.'))
    } finally {
      setAction(null)
    }
  }

  return (
    <div className="mt-3 grid gap-2">
      <div className="flex flex-wrap gap-2">
        <button className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-3 text-xs font-extrabold text-[#075fae] disabled:cursor-wait disabled:opacity-60" type="button" disabled={action !== null} onClick={() => void openDocument('view')}>
          {action === 'view' ? <IconLoader2 className="animate-spin" size={16} /> : <IconEye size={16} />} Visualizar
        </button>
        <button className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 disabled:cursor-wait disabled:opacity-60" type="button" disabled={action !== null} onClick={() => void openDocument('download')}>
          {action === 'download' ? <IconLoader2 className="animate-spin" size={16} /> : <IconDownload size={16} />} Descargar
        </button>
      </div>
      {error ? <p className="m-0 text-xs font-semibold leading-5 text-red-700" role="alert">{error}</p> : null}
    </div>
  )
}
