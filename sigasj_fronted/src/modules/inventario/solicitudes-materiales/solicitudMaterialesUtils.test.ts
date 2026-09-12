import { describe, expect, it } from 'vitest'
import {
  hasSolicitudMaterialesErrors,
  getSolicitudAveriaReference,
  getSolicitudMaterialesCount,
  normalizeSolicitudesMaterialesList,
  toSolicitudMaterialesPayload,
  validateSolicitudMateriales,
} from './solicitudMaterialesUtils'
import type { SolicitudMaterialFormRow } from './types'

const row = (overrides: Partial<SolicitudMaterialFormRow> = {}): SolicitudMaterialFormRow => ({
  key: 'row-1',
  materialId: '8',
  cantidad: '3',
  observacion: '',
  ...overrides,
})

describe('solicitud de materiales', () => {
  it('construye el contrato del backend sin incluir identidad del fontanero', () => {
    const payload = toSolicitudMaterialesPayload(
      [row({ observacion: 'Para la reparación' })],
      'Fuga principal ',
      14,
    )

    expect(payload).toEqual({
      idAveria: 14,
      motivo: 'Fuga principal',
      materiales: [{ idMaterial: 8, cantidad: 3, observacion: 'Para la reparación' }],
    })
    expect(payload).not.toHaveProperty('fontaneroId')
    expect(payload).not.toHaveProperty('idFontanero')
  })

  it.each(['', '0', '-2', '1.5'])(
    'rechaza la cantidad inválida %j',
    (cantidad) => {
      const errors = validateSolicitudMateriales([row({ cantidad })], '')
      expect(errors.rows['row-1']?.cantidad).toBeTruthy()
      expect(hasSolicitudMaterialesErrors(errors)).toBe(true)
    },
  )

  it('detecta materiales duplicados antes del envío', () => {
    const errors = validateSolicitudMateriales(
      [row(), row({ key: 'row-2', cantidad: '5' })],
      '',
    )
    expect(errors.rows['row-2']?.materialId).toMatch(/ya fue agregado/i)
  })

  it('acepta varios materiales distintos con cantidades enteras positivas', () => {
    const errors = validateSolicitudMateriales(
      [row(), row({ key: 'row-2', materialId: '9', cantidad: '1' })],
      'Mantenimiento',
    )
    expect(hasSolicitudMaterialesErrors(errors)).toBe(false)
  })

  it('normaliza respuestas paginadas y obtiene los datos del resumen', () => {
    const request = {
      id: 10,
      codigo: 'SOL-0010',
      fechaSolicitud: '2026-08-22T12:00:00.000Z',
      estado: 'PENDIENTE',
      idFontanero: 7,
      idAveria: 42,
      observacion: null,
      cantidadMateriales: 3,
      averia: { codigo: 'AV-2026-0042' },
    }
    expect(normalizeSolicitudesMaterialesList({ data: [request] })).toEqual([request])
    expect(getSolicitudMaterialesCount(request)).toBe(3)
    expect(getSolicitudAveriaReference(request)).toBe('AV-2026-0042')
  })

  it('representa solicitudes sin avería', () => {
    const request = {
      id: 9,
      codigo: 'SOL-0009',
      fechaSolicitud: '2026-08-20',
      estado: 'APROBADA',
      idFontanero: 7,
      idAveria: null,
      observacion: null,
      detalles: [],
    }
    expect(getSolicitudAveriaReference(request)).toBe('—')
    expect(getSolicitudMaterialesCount(request)).toBe(0)
  })
})
