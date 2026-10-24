import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registrarServicioExistente, toServicioExistentePayload } from './servicioExistenteApi'
import type { ServicioExistenteFormValues } from './types'

const values: ServicioExistenteFormValues = {
  tipoServicio: 'Agua potable',
  nis: ' 12345 ',
  propietarioInmueble: ' Ana Mora ',
  nombreSolicitante: ' Ana Mora ',
  identificacionSolicitante: ' 1-1111-1111 ',
  correoElectronico: ' ana@example.com ',
  telefono: ' 8888-8888 ',
  naturalezaInmueble: 'Inscrito',
  calidadTitular: 'Propietario',
  folioReal: ' 1-123 ',
  planoCatastrado: '',
  planoAgrimensura: '',
  provincia: ' Alajuela ',
  canton: ' San Ramón ',
  distrito: ' San Lorenzo ',
  direccionExacta: ' 100 m norte ',
  motivo: 'Otro',
  otroMotivo: ' Venta del inmueble ',
  tramitePorRealizar: ' Certificación para compraventa ',
  medioNotificacionPrincipal: 'Correo electrónico',
  medioNotificacionSecundario: 'Teléfono',
  firma: 'data:image/png;base64,firma',
  documentos: [
    { localId: '1', tipoDocumento: 'identificacion', nombreOriginal: 'id.pdf', tamanio: 100, tipoArchivo: 'application/pdf', estado: 'cargado', id: 7, tokenReclamo: 'token-7' },
    { localId: '2', tipoDocumento: 'poder', nombreOriginal: 'poder.pdf', tamanio: 100, tipoArchivo: 'application/pdf', estado: 'error' },
  ],
}

describe('toServicioExistentePayload', () => {
  beforeEach(() => vi.restoreAllMocks())
  it('limpia texto, incluye otroMotivo y solo referencia adjuntos cargados', () => {
    const payload = toServicioExistentePayload(values)
    expect(payload.nis).toBe('12345')
    expect(payload.otroMotivo).toBe('Venta del inmueble')
    expect(payload.documentos).toEqual([{ id: 7, tokenReclamo: 'token-7' }])
    expect(payload).not.toHaveProperty('estado')
    expect(payload).not.toHaveProperty('codigoSeguimiento')
  })

  it('no envía otroMotivo cuando el motivo no es Otro', () => {
    const payload = toServicioExistentePayload({ ...values, motivo: 'Trámite bancario' })
    expect(payload).not.toHaveProperty('otroMotivo')
  })

  it('envía el payload completo al endpoint público oficial', async () => {
    const response = {
      id: 15,
      codigoSeguimiento: 'SOL-2026-SERV01',
      estado: 'PENDIENTE',
      fechaIngreso: '2026-10-23T21:40:00.000Z',
      tipoSolicitud: { nombre: 'Constancia de Servicio Existente', slug: 'servicio-existente' },
      detalleConstanciaServicio: { nis: '12345' },
    }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(registrarServicioExistente(values)).resolves.toEqual(response)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/solicitudes\/servicio-existente$/)
    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(options.method).toBe('POST')
    expect(JSON.parse(String(options.body))).toEqual(toServicioExistentePayload(values))
  })
})
