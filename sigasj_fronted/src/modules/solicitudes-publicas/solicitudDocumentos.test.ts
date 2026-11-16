import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  referenciasDocumentosCargados,
  subirDocumentoSolicitud,
  type DocumentoSolicitudAdjunto,
} from './solicitudDocumentos'

describe('solicitudDocumentos', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('sube con los campos exactos del contrato backend', async () => {
    const response = { id: 9, tokenReclamo: 'token-9', nombreOriginal: 'cedula.pdf', tamanio: 10, tipoArchivo: 'application/pdf' }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(response), { status: 201, headers: { 'Content-Type': 'application/json' } }),
    )
    const archivo = new File(['%PDF-1.4'], 'cedula.pdf', { type: 'application/pdf' })

    await expect(subirDocumentoSolicitud(archivo, 'identificacion')).resolves.toEqual(response)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/solicitudes\/documentos$/)
    const body = fetchMock.mock.calls[0][1]?.body as FormData
    expect(body.get('archivo')).toBe(archivo)
    expect(body.get('tipoDocumento')).toBe('identificacion')
  })

  it('solo genera referencias para cargas completas y exitosas', () => {
    const archivo = new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    const base = { archivo, tipoDocumento: 'identificacion' as const, nombreOriginal: archivo.name, tamanio: archivo.size, tipoArchivo: archivo.type }
    const documentos: DocumentoSolicitudAdjunto[] = [
      { ...base, localId: 'ok', estado: 'cargado', id: 1, tokenReclamo: 'token-1' },
      { ...base, localId: 'error', estado: 'error', id: 2, tokenReclamo: 'token-2' },
      { ...base, localId: 'uploading', estado: 'subiendo' },
    ]
    expect(referenciasDocumentosCargados(documentos)).toEqual([{ id: 1, tokenReclamo: 'token-1' }])
  })
})
