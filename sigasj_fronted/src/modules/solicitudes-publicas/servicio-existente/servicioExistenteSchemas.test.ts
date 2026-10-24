import { describe, expect, it } from 'vitest'
import {
  servicioDocumentosFirmaSchema,
  servicioMotivoSchema,
  servicioNotificacionesSchema,
  servicioSolicitanteSchema,
} from './servicioExistenteSchemas'
import { MEDIOS_NOTIFICACION, MOTIVOS, TIPOS_SERVICIO } from './types'

describe('validaciones de servicio existente', () => {
  const solicitante = {
    tipoServicio: 'Agua potable',
    nis: '123',
    propietarioInmueble: 'Ana Mora',
    nombreSolicitante: 'Ana Mora',
    identificacionSolicitante: '1-1111-1111',
    correoElectronico: 'ana@example.com',
    telefono: '8888-8888',
  }

  it.each(TIPOS_SERVICIO)('acepta el tipo de servicio %s', (tipoServicio) => {
    expect(servicioSolicitanteSchema.safeParse({ ...solicitante, tipoServicio }).success).toBe(true)
  })

  it.each(MOTIVOS)('acepta el motivo oficial %s', (motivo) => {
    const result = servicioMotivoSchema.safeParse({
      motivo,
      otroMotivo: motivo === 'Otro' ? 'Venta del inmueble' : '',
      tramitePorRealizar: 'Gestión institucional',
    })
    expect(result.success).toBe(true)
  })

  it('exige especificar el motivo al seleccionar Otro', () => {
    const result = servicioMotivoSchema.safeParse({ motivo: 'Otro', otroMotivo: ' ', tramitePorRealizar: 'Venta' })
    expect(result.success).toBe(false)
  })

  it('acepta todos los datos del motivo Otro cuando están completos', () => {
    const result = servicioMotivoSchema.safeParse({ motivo: 'Otro', otroMotivo: 'Venta del inmueble', tramitePorRealizar: 'Certificación para compraventa' })
    expect(result.success).toBe(true)
  })

  it('impide repetir el medio de notificación', () => {
    const result = servicioNotificacionesSchema.safeParse({ medioNotificacionPrincipal: 'Teléfono', medioNotificacionSecundario: 'Teléfono' })
    expect(result.success).toBe(false)
  })

  it.each(MEDIOS_NOTIFICACION)('acepta %s como medio principal', (medio) => {
    const secundario = MEDIOS_NOTIFICACION.find((item) => item !== medio) ?? ''
    expect(servicioNotificacionesSchema.safeParse({ medioNotificacionPrincipal: medio, medioNotificacionSecundario: secundario }).success).toBe(true)
  })

  it('exige identificación, firma y poder al representante legal', () => {
    const empty = servicioDocumentosFirmaSchema.safeParse({ documentos: [], calidadTitular: 'Representante legal', firma: '' })
    expect(empty.success).toBe(false)

    const identificationOnly = servicioDocumentosFirmaSchema.safeParse({
      documentos: [{ tipoDocumento: 'identificacion', estado: 'cargado', id: 1, tokenReclamo: 'token' }],
      calidadTitular: 'Representante legal',
      firma: 'data:image/png;base64,firma',
    })
    expect(identificationOnly.success).toBe(false)

    const complete = servicioDocumentosFirmaSchema.safeParse({
      documentos: [
        { tipoDocumento: 'identificacion', estado: 'cargado', id: 1, tokenReclamo: 'token-1' },
        { tipoDocumento: 'poder', estado: 'cargado', id: 2, tokenReclamo: 'token-2' },
      ],
      calidadTitular: 'Representante legal',
      firma: 'data:image/png;base64,firma',
    })
    expect(complete.success).toBe(true)
  })
})
