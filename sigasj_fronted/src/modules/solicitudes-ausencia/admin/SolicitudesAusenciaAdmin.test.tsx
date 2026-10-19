import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/publicRoutes'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import { setAuthSession, clearAccessToken } from '../../auth/utils/authStorage'
import * as ausenciaApi from '../solicitudesAusenciaApi'
import { SOLICITUDES_AUSENCIA_ADMIN_PATH } from '../solicitudesAusenciaPaths'
import type { SolicitudAusencia, SolicitudesAusenciaListado } from '../types'

const PATH = SOLICITUDES_AUSENCIA_ADMIN_PATH

const flushAsync = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

const colaborador = {
  id: 7,
  nombre: 'Ana',
  apellidos: 'Solís',
  cedula: '1-2222-3333',
  cargo: 'Fontanero',
}

const base = (
  overrides: Partial<SolicitudAusencia> & Pick<SolicitudAusencia, 'id' | 'tipo' | 'estado'>,
): SolicitudAusencia => ({
  colaboradorId: colaborador.id,
  colaborador,
  fechaInicio: '2026-11-01',
  fechaFin: '2026-11-02',
  motivo: 'Trámite personal',
  jotformSubmissionId: 'sub-1',
  reviewedAt: null,
  reviewedByUsuarioId: null,
  motivoRechazo: null,
  registroGeneradoId: null,
  registroGeneradoTipo: null,
  createdAt: '2026-10-01T12:00:00.000Z',
  updatedAt: '2026-10-01T12:00:00.000Z',
  ...overrides,
})

const listado = (data: SolicitudAusencia[]): SolicitudesAusenciaListado => ({
  data,
  total: data.length,
  page: 1,
  limit: 10,
  totalPages: data.length ? 1 : 0,
})

const fixture = [
  base({ id: 1, tipo: 'PERMISO', estado: 'PENDIENTE', motivo: 'Cita médica' }),
  base({
    id: 2,
    tipo: 'VACACIONES',
    estado: 'APROBADA',
    motivo: 'Descanso anual',
    fechaInicio: '2026-12-01',
    fechaFin: '2026-12-05',
    reviewedAt: '2026-10-02T10:00:00.000Z',
    registroGeneradoId: 99,
    registroGeneradoTipo: 'MOVIMIENTO_VACACIONES',
  }),
  base({
    id: 3,
    tipo: 'PERMISO',
    estado: 'RECHAZADA',
    motivo: 'Sin cobertura',
    motivoRechazo: 'Falta personal',
    reviewedAt: '2026-10-03T09:00:00.000Z',
  }),
]

describe('PBI 6.5.7 — Cola admin RRHH solicitudes', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
    vi.spyOn(ausenciaApi, 'getSolicitudesAusencia').mockResolvedValue(listado(fixture))
    vi.spyOn(ausenciaApi, 'getSolicitudAusencia').mockImplementation(async (id) => {
      const found = fixture.find((s) => s.id === id)
      if (!found) throw new Error('HTTP 404: No existe')
      return { ...found }
    })
    vi.spyOn(ausenciaApi, 'aprobarSolicitudAusencia').mockImplementation(async (id) => {
      const found = fixture.find((s) => s.id === id)
      if (!found) throw new Error('HTTP 404: No existe')
      return {
        ...found,
        estado: 'APROBADA',
        registroGeneradoId: 55,
        registroGeneradoTipo: found.tipo === 'VACACIONES' ? 'MOVIMIENTO_VACACIONES' : 'PERMISO',
        reviewedAt: '2026-10-19T12:00:00.000Z',
      }
    })
    vi.spyOn(ausenciaApi, 'rechazarSolicitudAusencia').mockImplementation(
      async (id, motivo) => {
        const found = fixture.find((s) => s.id === id)
        if (!found) throw new Error('HTTP 404: No existe')
        return {
          ...found,
          estado: 'RECHAZADA',
          motivoRechazo: motivo ?? null,
          reviewedAt: '2026-10-19T12:00:00.000Z',
        }
      },
    )
  })

  it('subnav RRHH muestra Solicitudes solo para Administradora', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes('/admin/lecturas')
    await flushAsync()
    try {
      const link = Array.from(app.container.querySelectorAll('a')).find(
        (a) => a.textContent?.trim() === 'Solicitudes',
      )
      expect(link?.getAttribute('href')).toBe(PATH)
    } finally {
      await app.cleanup()
    }

    loginAsRole('Secretaria')
    const sec = await mountAppRoutes('/admin/lecturas')
    await flushAsync()
    try {
      const labels = Array.from(sec.container.querySelectorAll('a')).map((a) =>
        a.textContent?.trim(),
      )
      expect(labels).not.toContain('Solicitudes')
    } finally {
      await sec.cleanup()
    }
  })

  it('Administradora abre la cola y ve campos de revisión', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes(PATH)
    await flushAsync()
    try {
      expect(app.currentPath()).toBe(PATH)
      const html = app.container.innerHTML
      expect(html).toContain('Solicitudes')
      expect(html).toContain('Ana Solís')
      expect(html).toContain('Permiso')
      expect(html).toContain('Vacaciones')
      expect(html).toContain('Pendiente')
      expect(html).toContain('Aprobada')
      expect(html).toContain('Rechazada')
      expect(html).toContain('Cita médica')
      expect(html).toContain('Descanso anual')
      expect(ausenciaApi.getSolicitudesAusencia).toHaveBeenCalled()
      const args = vi.mocked(ausenciaApi.getSolicitudesAusencia).mock.calls[0][0]
      expect(args).toMatchObject({ page: 1 })
    } finally {
      await app.cleanup()
    }
  })

  it('filtro por estado llama al backend (no solo local)', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes(PATH)
    await flushAsync()
    try {
      const select = app.container.querySelector(
        'select',
      ) as HTMLSelectElement | null
      expect(select).toBeTruthy()
      await act(async () => {
        select!.value = 'PENDIENTE'
        select!.dispatchEvent(new Event('change', { bubbles: true }))
      })
      await flushAsync()
      const calls = vi.mocked(ausenciaApi.getSolicitudesAusencia).mock.calls
      expect(calls.some((c) => c[0].estado === 'PENDIENTE')).toBe(true)

      await act(async () => {
        select!.value = 'APROBADA'
        select!.dispatchEvent(new Event('change', { bubbles: true }))
      })
      await flushAsync()
      expect(
        vi.mocked(ausenciaApi.getSolicitudesAusencia).mock.calls.some(
          (c) => c[0].estado === 'APROBADA',
        ),
      ).toBe(true)

      await act(async () => {
        select!.value = 'RECHAZADA'
        select!.dispatchEvent(new Event('change', { bubbles: true }))
      })
      await flushAsync()
      expect(
        vi.mocked(ausenciaApi.getSolicitudesAusencia).mock.calls.some(
          (c) => c[0].estado === 'RECHAZADA',
        ),
      ).toBe(true)

      await act(async () => {
        select!.value = ''
        select!.dispatchEvent(new Event('change', { bubbles: true }))
      })
      await flushAsync()
      expect(
        vi.mocked(ausenciaApi.getSolicitudesAusencia).mock.calls.some(
          (c) => !c[0].estado,
        ),
      ).toBe(true)
    } finally {
      await app.cleanup()
    }
  })

  it('listado vacío sin filtro / con filtro', async () => {
    vi.spyOn(ausenciaApi, 'getSolicitudesAusencia').mockResolvedValue(listado([]))
    loginAsRole('Administradora')
    const app = await mountAppRoutes(PATH)
    await flushAsync()
    try {
      expect(app.container.innerHTML).toContain('No hay solicitudes registradas.')
    } finally {
      await app.cleanup()
    }

    const appFiltro = await mountAppRoutes(`${PATH}?estado=PENDIENTE`)
    await flushAsync()
    try {
      expect(appFiltro.container.innerHTML).toContain(
        'No se encontraron solicitudes con el estado seleccionado.',
      )
    } finally {
      await appFiltro.cleanup()
    }
  })

  it('error de listado muestra mensaje amigable', async () => {
    vi.spyOn(ausenciaApi, 'getSolicitudesAusencia').mockRejectedValue(
      new Error('HTTP 500: boom'),
    )
    loginAsRole('Administradora')
    const app = await mountAppRoutes(PATH)
    await flushAsync()
    try {
      expect(app.container.innerHTML).toContain(
        'No fue posible cargar las solicitudes. Intente nuevamente.',
      )
      expect(app.container.innerHTML).not.toContain('TypeORM')
    } finally {
      await app.cleanup()
    }
  })

  it('sin sesión redirige al login', async () => {
    const app = await mountAppRoutes(PATH)
    try {
      expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
    } finally {
      await app.cleanup()
    }
  })

  it('Fontanero no accede a la cola admin', async () => {
    loginAsRole('Fontanero')
    const app = await mountAppRoutes(PATH)
    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(ausenciaApi.getSolicitudesAusencia).not.toHaveBeenCalled()
    } finally {
      await app.cleanup()
    }
  })

  it('Secretaria no accede a la cola admin', async () => {
    loginAsRole('Secretaria')
    const app = await mountAppRoutes(PATH)
    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(ausenciaApi.getSolicitudesAusencia).not.toHaveBeenCalled()
    } finally {
      await app.cleanup()
    }
  })

  it('detalle pendiente muestra Aprobar/Rechazar; aprobada/rechazada no', async () => {
    loginAsRole('Administradora')
    const pend = await mountAppRoutes(`${PATH}/1`)
    await flushAsync()
    try {
      expect(pend.container.innerHTML).toContain('Aprobar')
      expect(pend.container.innerHTML).toContain('Rechazar')
      expect(pend.container.innerHTML).toContain('Ana Solís')
      expect(pend.container.innerHTML).toContain('Cita médica')
    } finally {
      await pend.cleanup()
    }

    const apr = await mountAppRoutes(`${PATH}/2`)
    await flushAsync()
    try {
      expect(apr.container.innerHTML).toContain('Aprobada')
      expect(apr.container.textContent).not.toMatch(/\bAprobar\b/)
      expect(apr.container.textContent).not.toMatch(/\bRechazar\b/)
    } finally {
      await apr.cleanup()
    }

    const rej = await mountAppRoutes(`${PATH}/3`)
    await flushAsync()
    try {
      expect(rej.container.innerHTML).toContain('Rechazada')
      expect(rej.container.textContent).not.toMatch(/\bAprobar\b/)
      expect(rej.container.textContent).not.toMatch(/\bRechazar\b/)
    } finally {
      await rej.cleanup()
    }
  })

  it('aprobar PERMISO consume API y refleja APROBADA', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    loginAsRole('Administradora')
    const app = await mountAppRoutes(`${PATH}/1`)
    await flushAsync()
    try {
      const btn = Array.from(app.container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Aprobar'),
      )
      expect(btn).toBeTruthy()
      await act(async () => {
        btn!.click()
      })
      await flushAsync()
      expect(ausenciaApi.aprobarSolicitudAusencia).toHaveBeenCalledWith(1)
      expect(app.container.innerHTML).toContain('Solicitud aprobada')
      expect(app.container.innerHTML).toContain('Aprobada')
      expect(app.container.textContent).not.toMatch(/\bAprobar\b/)
    } finally {
      await app.cleanup()
    }
  })

  it('aprobar VACACIONES consume API y refleja APROBADA', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const vacPend = base({
      id: 20,
      tipo: 'VACACIONES',
      estado: 'PENDIENTE',
      motivo: 'Vacaciones familiares',
      saldoVacaciones: {
        diasAcumulados: 14,
        diasDisfrutados: 2,
        diasDisponibles: 12,
      },
    })
    vi.spyOn(ausenciaApi, 'getSolicitudAusencia').mockResolvedValue(vacPend)
    vi.spyOn(ausenciaApi, 'aprobarSolicitudAusencia').mockResolvedValue({
      ...vacPend,
      estado: 'APROBADA',
      registroGeneradoId: 77,
      registroGeneradoTipo: 'MOVIMIENTO_VACACIONES',
    })
    loginAsRole('Administradora')
    const app = await mountAppRoutes(`${PATH}/20`)
    await flushAsync()
    try {
      const btn = Array.from(app.container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Aprobar'),
      )
      await act(async () => {
        btn!.click()
      })
      await flushAsync()
      expect(window.confirm).toHaveBeenCalled()
      const confirmMsg = String(vi.mocked(window.confirm).mock.calls[0][0])
      expect(confirmMsg).toMatch(/disfrute/i)
      expect(ausenciaApi.aprobarSolicitudAusencia).toHaveBeenCalledWith(20)
      expect(app.container.innerHTML).toContain('movimiento de vacaciones')
      expect(app.container.innerHTML).toContain('Aprobada')
    } finally {
      await app.cleanup()
    }
  })

  it('rechazo con comentario opcional', async () => {
    loginAsRole('Administradora')
    const app = await mountAppRoutes(`${PATH}/1`)
    await flushAsync()
    try {
      const rechazar = Array.from(app.container.querySelectorAll('button')).find(
        (b) => b.textContent?.trim() === 'Rechazar',
      )
      await act(async () => {
        rechazar!.click()
      })
      expect(app.container.innerHTML).toContain('Comentario (opcional)')
      const textarea = app.container.querySelector('textarea')
      expect(textarea).toBeTruthy()
      await act(async () => {
        const proto = Object.getOwnPropertyDescriptor(
          HTMLTextAreaElement.prototype,
          'value',
        )?.set
        proto?.call(textarea!, 'Sin cobertura')
        textarea!.dispatchEvent(new Event('input', { bubbles: true }))
      })
      const confirmar = Array.from(app.container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Confirmar rechazo'),
      )
      await act(async () => {
        confirmar!.click()
      })
      await flushAsync()
      expect(ausenciaApi.rechazarSolicitudAusencia).toHaveBeenCalledWith(
        1,
        'Sin cobertura',
      )
      expect(app.container.innerHTML).toContain('Solicitud rechazada')
      expect(app.container.innerHTML).toContain('Rechazada')
    } finally {
      await app.cleanup()
    }
  })

  it('error de saldo insuficiente no marca aprobada', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(ausenciaApi, 'aprobarSolicitudAusencia').mockRejectedValue(
      new Error('HTTP 400: Saldo de vacaciones insuficiente'),
    )
    loginAsRole('Administradora')
    const app = await mountAppRoutes(`${PATH}/1`)
    await flushAsync()
    try {
      const btn = Array.from(app.container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Aprobar'),
      )
      await act(async () => {
        btn!.click()
      })
      await flushAsync()
      expect(app.container.innerHTML).toContain(
        'no cuenta con saldo suficiente de vacaciones',
      )
      expect(app.container.innerHTML).toContain('Pendiente')
      expect(app.container.innerHTML).toContain('Aprobar')
    } finally {
      await app.cleanup()
    }
  })

  it('conflicto 409 muestra mensaje y refresca', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(ausenciaApi, 'aprobarSolicitudAusencia').mockRejectedValue(
      new Error('HTTP 409: Ya procesada'),
    )
    const getSpy = vi.mocked(ausenciaApi.getSolicitudAusencia)
    loginAsRole('Administradora')
    const app = await mountAppRoutes(`${PATH}/1`)
    await flushAsync()
    const callsAntes = getSpy.mock.calls.length
    try {
      const btn = Array.from(app.container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Aprobar'),
      )
      await act(async () => {
        btn!.click()
      })
      await flushAsync()
      expect(app.container.innerHTML).toContain('Esta solicitud ya fue procesada.')
      expect(getSpy.mock.calls.length).toBeGreaterThan(callsAntes)
    } finally {
      await app.cleanup()
    }
  })

  it('detalle 404 muestra mensaje comprensible', async () => {
    vi.spyOn(ausenciaApi, 'getSolicitudAusencia').mockRejectedValue(
      new Error('HTTP 404: No existe'),
    )
    loginAsRole('Administradora')
    const app = await mountAppRoutes(`${PATH}/999`)
    await flushAsync()
    try {
      expect(app.container.innerHTML).toContain('No se encontró la solicitud.')
    } finally {
      await app.cleanup()
    }
  })

  it('otro rol autenticado sin permiso queda denegado', async () => {
    setAuthSession({
      accessToken: 'token-x',
      user: { id: '9', role: 'Abonado' },
    })
    const app = await mountAppRoutes(PATH)
    try {
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    } finally {
      await app.cleanup()
    }
  })
})
