import { IconDownload, IconEye, IconLoader2 } from '@tabler/icons-react'
import { useState } from 'react'
import { getSolicitudDocumentoAdmin, solicitudesAdminError } from './solicitudesAdminApi'
import type { SolicitudDocumentoAdmin } from './types'
import { useSolicitudesAdminSecurity } from './useSolicitudesAdminSecurity'

type Props = { solicitudId: number; document: SolicitudDocumentoAdmin }

const secondaryBtn =
  'inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[color:var(--asada-line,#d7e5f1)] bg-white px-3.5 text-sm font-extrabold text-[color:var(--asada-navy,#1e5a9c)] shadow-[0_4px_12px_rgba(30,90,156,0.08)] transition hover:-translate-y-0.5 hover:border-[#bfe3fa] hover:bg-[color:var(--asada-ice,#eaf6ff)] disabled:cursor-wait disabled:opacity-60 min-[761px]:w-auto'

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
      previewWindow.document.body.innerHTML =
        '<p style="font-family:system-ui;padding:24px;color:#173f6e">Cargando documento…</p>'
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
      if (!handleSecurityError(caught)) {
        setError(solicitudesAdminError(caught, 'No fue posible consultar el documento.'))
      }
    } finally {
      setAction(null)
    }
  }

  return (
    <div className="mt-3 grid gap-2">
      <div className="flex flex-col gap-2 min-[761px]:flex-row min-[761px]:flex-wrap">
        <button
          className={secondaryBtn}
          type="button"
          disabled={action !== null}
          onClick={() => void openDocument('view')}
        >
          {action === 'view' ? (
            <IconLoader2 className="animate-spin" size={17} />
          ) : (
            <IconEye size={17} />
          )}
          Ver documento
        </button>
        <button
          className={secondaryBtn}
          type="button"
          disabled={action !== null}
          aria-label="Descargar documento"
          onClick={() => void openDocument('download')}
        >
          {action === 'download' ? (
            <IconLoader2 className="animate-spin" size={17} />
          ) : (
            <IconDownload size={17} />
          )}
          Descargar
        </button>
      </div>
      {error ? (
        <p className="m-0 text-xs font-semibold leading-5 text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
