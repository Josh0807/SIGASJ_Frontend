import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconTrash, IconX } from '@tabler/icons-react'
import type { DocumentoActividadRegistrado } from '../types/actividadFontaneroApi'
import {
  esEvidenciaImagen,
  evidenciaActividadPublicUrl,
} from '../utils/evidenciaActividadUrl'
import { crearMiniaturaEvidencia } from '../utils/evidenciaMiniatura'

const FotoMiniatura = ({
  src,
  disabled,
  onOpen,
}: {
  src: string
  disabled?: boolean
  onOpen: () => void
}) => {
  const [thumb, setThumb] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let created: string | null = null

    crearMiniaturaEvidencia(src)
      .then((url) => {
        if (!active) {
          URL.revokeObjectURL(url)
          return
        }
        created = url
        setThumb(url)
      })
      .catch(() => {
        if (active) {
          setThumb(src)
        }
      })

    return () => {
      active = false
      if (created) {
        URL.revokeObjectURL(created)
      }
    }
  }, [src])

  return (
    <button
      type="button"
      className="detalle-actividad__photo-trigger"
      onClick={onOpen}
      disabled={disabled}
    >
      {thumb ? (
        <img src={thumb} alt="" decoding="async" />
      ) : (
        <span className="detalle-actividad__photo-skeleton" aria-hidden="true" />
      )}
    </button>
  )
}

type EvidenciaFotoGaleriaProps = {
  documentos: DocumentoActividadRegistrado[]
  actividadId: number
  canDelete?: boolean
  disabled?: boolean
  emptyLabel?: string
  onDelete?: (documento: DocumentoActividadRegistrado) => void
}

const EvidenciaFotoGaleria = ({
  documentos,
  actividadId,
  canDelete = false,
  disabled = false,
  emptyLabel = 'Sin fotos adjuntas.',
  onDelete,
}: EvidenciaFotoGaleriaProps) => {
  const [selected, setSelected] = useState<DocumentoActividadRegistrado | null>(
    null,
  )

  useEffect(() => {
    if (!selected) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelected(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected])

  if (!documentos.length) {
    return <p>{emptyLabel}</p>
  }

  const selectedUrl = selected
    ? evidenciaActividadPublicUrl(selected.rutaReferenciaArchivo, actividadId)
    : ''

  return (
    <>
      <ul className="detalle-actividad__gallery">
        {documentos.map((documento) => {
          const href = evidenciaActividadPublicUrl(
            documento.rutaReferenciaArchivo,
            actividadId || documento.actividadId,
          )

          if (!esEvidenciaImagen(documento)) {
            return (
              <li key={documento.id} className="detalle-actividad__document">
                <div>
                  <strong>{documento.nombreOriginal}</strong>
                  <small>
                    {Math.max(1, Math.ceil(documento.tamanio / 1024))} KB
                  </small>
                </div>
              </li>
            )
          }

          return (
            <li key={documento.id} className="detalle-actividad__photo">
              <FotoMiniatura
                src={href}
                disabled={disabled}
                onOpen={() => setSelected(documento)}
              />
            </li>
          )
        })}
      </ul>

      {selected
        ? createPortal(
            <div
              className="evidencia-foto-visor"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setSelected(null)
                }
              }}
            >
              <div
                className="evidencia-foto-visor__dialog"
                role="dialog"
                aria-modal="true"
                aria-label="Foto de evidencia"
              >
                <button
                  type="button"
                  className="evidencia-foto-visor__close"
                  onClick={() => setSelected(null)}
                  aria-label="Cerrar"
                >
                  <IconX size={20} aria-hidden="true" />
                </button>
                <img
                  className="evidencia-foto-visor__image"
                  src={selectedUrl}
                  alt=""
                  decoding="async"
                />
                {canDelete && onDelete ? (
                  <button
                    type="button"
                    className="confirm-dialog__button confirm-dialog__button--danger evidencia-foto-visor__delete"
                    disabled={disabled}
                    onClick={() => {
                      onDelete(selected)
                      setSelected(null)
                    }}
                  >
                    <IconTrash size={18} aria-hidden="true" />
                    Borrar imagen
                  </button>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

export default EvidenciaFotoGaleria
