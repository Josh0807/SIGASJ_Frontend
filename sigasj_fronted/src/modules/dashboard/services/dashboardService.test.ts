import { afterEach, describe, expect, it, vi } from 'vitest'
import * as asociadosApi from '../../asociados/asociadosApi'
import * as alertasApi from '../../inventario/alertas-reposicion/alertasReposicionApi'
import {
  getAbonadosSummaryMetric,
  getAlertasReposicionSummaryMetric,
} from './dashboardService'

describe('getAbonadosSummaryMetric', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('usa el total de asociados activos del padrón', async () => {
    const getAsociados = vi.spyOn(asociadosApi, 'getAsociados').mockResolvedValue({
      data: [],
      total: 7,
      page: 1,
      limit: 10,
      totalPages: 1,
    })

    await expect(getAbonadosSummaryMetric()).resolves.toEqual({
      key: 'abonadosActivos',
      value: 7,
    })
    expect(getAsociados).toHaveBeenCalledWith({
      search: '',
      estado: 'activos',
      page: 1,
    })
  })

  it('devuelve null si falla la consulta del padrón', async () => {
    vi.spyOn(asociadosApi, 'getAsociados').mockRejectedValue(new Error('HTTP 403'))
    await expect(getAbonadosSummaryMetric()).resolves.toEqual({
      key: 'abonadosActivos',
      value: null,
    })
  })
})

describe('getAlertasReposicionSummaryMetric', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('usa el total de alertas PENDIENTE del inventario', async () => {
    const getAlertas = vi
      .spyOn(alertasApi, 'getAlertasReposicionAdmin')
      .mockResolvedValue({
        data: [],
        total: 4,
        page: 1,
        limit: 1,
        totalPages: 4,
      })

    await expect(getAlertasReposicionSummaryMetric()).resolves.toEqual({
      key: 'alertasReposicionPendientes',
      value: 4,
    })
    expect(getAlertas).toHaveBeenCalledWith({
      estado: 'PENDIENTE',
      page: 1,
      limit: 1,
    })
  })

  it('devuelve null si falla la consulta de alertas', async () => {
    vi.spyOn(alertasApi, 'getAlertasReposicionAdmin').mockRejectedValue(
      new Error('HTTP 403'),
    )
    await expect(getAlertasReposicionSummaryMetric()).resolves.toEqual({
      key: 'alertasReposicionPendientes',
      value: null,
    })
  })
})
