import { describe, expect, it } from 'vitest'
import {
  etiquetaAccionReposicion,
  formatReposicionEstado,
  formatReposicionOrigen,
  getReposicionCodigo,
  getReposicionProveedorNombre,
  normalizeReposicionesList,
  puedeConfirmarRecepcion,
  puedeRegistrarCompra,
  resumenMaterialesReposicion,
  siguienteEstadoReposicion,
} from './reposicionesUtils'
import type { ReposicionMaterial } from './types'

const reposicion: ReposicionMaterial = {
  id: 5,
  codigo: 'REP-0005',
  fechaGeneracion: '2026-09-15T10:00:00.000Z',
  origen: 'ALERTA_STOCK_MINIMO',
  estado: 'PENDIENTE',
  idAlertaReposicion: 2,
  idSolicitudMaterial: null,
  idUsuarioResponsable: 1,
  idProveedor: null,
  fechaCompra: null,
  observacion: null,
  proveedor: null,
  usuarioResponsable: { id: 1, nombre: 'Ana' },
  alertaReposicion: { id: 2 },
  solicitudMaterial: null,
  detalles: [
    {
      id: 1,
      idMaterial: 4,
      cantidad: 10,
      material: { id: 4, nombre: 'Tubo PVC', unidadMedida: 'Metro' },
    },
  ],
}

describe('reposicionesUtils', () => {
  it('normaliza respuestas paginadas y arreglos planos', () => {
    expect(normalizeReposicionesList({ data: [reposicion], total: 1, page: 1, limit: 10, totalPages: 1 })).toEqual([reposicion])
    expect(normalizeReposicionesList([reposicion])).toEqual([reposicion])
  })

  it('formatea estado, origen y código', () => {
    expect(formatReposicionEstado('EN_GESTION')).toBe('En gestión')
    expect(formatReposicionOrigen('SOLICITUD_APROBADA')).toBe('Solicitud aprobada')
    expect(getReposicionCodigo({ ...reposicion, codigo: null })).toBe('REP-5')
  })

  it('resume materiales y valida cuándo registrar compra', () => {
    expect(resumenMaterialesReposicion(reposicion.detalles)).toBe('Tubo PVC (10)')
    expect(puedeRegistrarCompra('PENDIENTE')).toBe(true)
    expect(puedeRegistrarCompra('COMPRA_REGISTRADA')).toBe(false)
    expect(puedeConfirmarRecepcion('PENDIENTE_RECEPCION')).toBe(true)
    expect(siguienteEstadoReposicion('PENDIENTE')).toBe('EN_GESTION')
    expect(etiquetaAccionReposicion('RECIBIDA')).toBe('Completar reposición')
    expect(getReposicionProveedorNombre({ ...reposicion, proveedor: null })).toBe('Sin definir')
  })
})
