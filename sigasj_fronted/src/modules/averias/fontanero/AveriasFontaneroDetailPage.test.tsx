import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatAveriaAdminDateTime } from '../admin/formatAveriaAdminDate'
import {
  AVERIA_UNASSIGNED_LABEL,
  AVERIA_UNAVAILABLE_LABEL,
  AVERIA_UNCLASSIFIED_LABEL,
} from '../admin/types'
import * as averiasFontaneroApi from '../services/averiasFontaneroApi'
import AveriasFontaneroDetailPage from './AveriasFontaneroDetailPage'
import AveriasFontaneroListPage from './AveriasFontaneroListPage'
import { FONTANERO_AVERIAS_PATH } from './averiasFontaneroPaths'
import { findFontaneroAveriaFixture } from './fixtures/averiasFontaneroDetail.fixture'
import {
  AVERIAS_FONTANERO_BACK_LABEL,
  AVERIAS_FONTANERO_DETAIL_ERROR,
  AVERIAS_FONTANERO_DETAIL_FORBIDDEN,
  AVERIAS_FONTANERO_DETAIL_LOADING_MESSAGE,
  AVERIAS_FONTANERO_DETAIL_NOT_FOUND,
  AVERIAS_FONTANERO_ATENCION_NO_INICIADA,
  AVERIAS_FONTANERO_CALIFICAR_GUARDAR,
  AVERIAS_FONTANERO_CALIFICAR_SUCCESS,
  AVERIAS_FONTANERO_LIST_EMPTY,
  AVERIAS_FONTANERO_INICIAR_FORBIDDEN,
  AVERIAS_FONTANERO_INICIAR_LABEL,
  AVERIAS_FONTANERO_INICIAR_SUCCESS,
  AVERIAS_FONTANERO_NO_ACTIONS,
  AVERIAS_FONTANERO_OBSERVACION_ERROR,
  AVERIAS_FONTANERO_OBSERVACION_FORBIDDEN,
  AVERIAS_FONTANERO_OBSERVACION_GUARDAR,
  AVERIAS_FONTANERO_OBSERVACION_SUCCESS,
  AVERIAS_FONTANERO_OBSERVACION_VACIA,
  AVERIAS_FONTANERO_OBSERVACIONES_LISTA_VACIA,
  AVERIAS_FONTANERO_OBSERVACIONES_TITULO,
  AVERIAS_FONTANERO_RESOLVER_CANCEL,
  AVERIAS_FONTANERO_RESOLVER_CONFIRM,
  AVERIAS_FONTANERO_RESOLVER_ERROR,
  AVERIAS_FONTANERO_RESOLVER_FORBIDDEN,
  AVERIAS_FONTANERO_RESOLVER_HINT,
  AVERIAS_FONTANERO_RESOLVER_LABEL,
  AVERIAS_FONTANERO_RESOLVER_SUCCESS,
  OBSERVACION_FINAL_VACIA,
} from './types'

describe('AveriasFontaneroDetailPage', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    vi.spyOn(averiasFontaneroApi, 'getFontaneroAveria').mockImplementation(
      async (id) => {
        const found = findFontaneroAveriaFixture(id)
        if (!found) {
          throw new Error('HTTP 404: No se encontró la avería solicitada.')
        }
        return found
      },
    )
    vi.spyOn(averiasFontaneroApi, 'resolverFontaneroAveria')
    vi.spyOn(averiasFontaneroApi, 'createFontaneroObservacion')
    vi.spyOn(averiasFontaneroApi, 'iniciarFontaneroAtencion')
    vi.spyOn(averiasFontaneroApi, 'patchFontaneroAveriaPrioridad')
    vi.spyOn(averiasFontaneroApi, 'patchFontaneroAveriaClasificacion')
    vi.spyOn(averiasFontaneroApi, 'getFontaneroAverias').mockResolvedValue({
      data: [],
    })
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    vi.restoreAllMocks()
  })

  const renderAt = async (
    path: string,
    pageProps: Parameters<typeof AveriasFontaneroDetailPage>[0] = {},
  ) => {
    await act(async () => {
      root.render(
        <MemoryRouter key={path} initialEntries={[path]}>
          <Routes>
            <Route
              path={FONTANERO_AVERIAS_PATH}
              element={<AveriasFontaneroListPage />}
            />
            <Route
              path={`${FONTANERO_AVERIAS_PATH}/:id`}
              element={<AveriasFontaneroDetailPage {...pageProps} />}
            />
          </Routes>
        </MemoryRouter>,
      )
    })
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
    })
  }

  it('muestra ubicación, descripción, estado y datos necesarios del reportante', async () => {
    await renderAt(`${FONTANERO_AVERIAS_PATH}/25`)
    const assigned = findFontaneroAveriaFixture(25)!
    expect(container.querySelector('h1')?.textContent).toBe('Avería asignada')
    expect(container.textContent).toContain(assigned.codigoSeguimiento)
    expect(container.textContent).toContain('Asignada')
    expect(container.textContent).toContain(assigned.sectorComunidad)
    expect(container.textContent).toContain(assigned.ubicacion)
    expect(container.textContent).toContain(assigned.descripcion)
    expect(container.textContent).toContain(assigned.nombreReportante)
    expect(container.textContent).toContain(assigned.telefonoReportante)
    expect(container.textContent).toContain('Tubería dañada')
    expect(container.textContent).toContain('Alta')
    expect(container.textContent).toContain(
      formatAveriaAdminDateTime(assigned.fechaReporte),
    )
    expect(container.textContent).toContain(
      formatAveriaAdminDateTime(assigned.fechaAsignacion),
    )
    expect(container.textContent).toContain(AVERIA_UNAVAILABLE_LABEL)
    expect(container.textContent).toContain(AVERIAS_FONTANERO_OBSERVACIONES_TITULO)
    expect(container.textContent).toContain(
      AVERIAS_FONTANERO_OBSERVACIONES_LISTA_VACIA,
    )
    expect(container.textContent).toContain(AVERIAS_FONTANERO_INICIAR_LABEL)
    expect(container.textContent).toContain(AVERIAS_FONTANERO_ATENCION_NO_INICIADA)
    expect(container.textContent).not.toContain(AVERIAS_FONTANERO_NO_ACTIONS)
    expect(container.textContent).not.toContain('1-2345-6789')
    expect(container.textContent).not.toContain('juan.perez@example.com')
    expect(container.textContent).not.toContain('Abonado')
    expect(container.querySelector('#averia-fontanero-prioridad')).not.toBeNull()
    expect(container.querySelector('#averia-fontanero-clasificacion')).not.toBeNull()
    expect(container.querySelector('#averia-gestion-prioridad')).toBeNull()
    expect(container.querySelector('textarea[name="observacion"]')).toBeTruthy()
    expect(container.querySelector('textarea[name="observacionFinal"]')).toBeNull()
    expect(
      container.querySelector(`a[href="${FONTANERO_AVERIAS_PATH}"]`)?.textContent,
    ).toContain(AVERIAS_FONTANERO_BACK_LABEL)
  })

  it('el Fontanero califica prioridad y tipo contra el Backend', async () => {
    const assigned = findFontaneroAveriaFixture(25)!
    vi.mocked(averiasFontaneroApi.patchFontaneroAveriaPrioridad).mockResolvedValueOnce(
      { ...assigned, prioridad: 'MEDIA' },
    )
    vi.mocked(averiasFontaneroApi.patchFontaneroAveriaClasificacion).mockResolvedValueOnce(
      { ...assigned, prioridad: 'MEDIA', tipoAveria: 'TUBO_MADRE' },
    )

    await renderAt(`${FONTANERO_AVERIAS_PATH}/25`)
    const prioridad = container.querySelector(
      '#averia-fontanero-prioridad',
    ) as HTMLSelectElement
    const tipo = container.querySelector(
      '#averia-fontanero-clasificacion',
    ) as HTMLSelectElement
    await act(async () => {
      prioridad.value = 'MEDIA'
      prioridad.dispatchEvent(new Event('change', { bubbles: true }))
      tipo.value = 'TUBO_MADRE'
      tipo.dispatchEvent(new Event('change', { bubbles: true }))
    })
    const guardar = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes(AVERIAS_FONTANERO_CALIFICAR_GUARDAR),
    )
    await act(async () => {
      guardar?.click()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(averiasFontaneroApi.patchFontaneroAveriaPrioridad).toHaveBeenCalledWith(
      25,
      'MEDIA',
    )
    expect(averiasFontaneroApi.patchFontaneroAveriaClasificacion).toHaveBeenCalledWith(
      25,
      'TUBO_MADRE',
    )
    expect(container.textContent).toContain(AVERIAS_FONTANERO_CALIFICAR_SUCCESS)
  })

  it('no muestra calificación en una avería resuelta', async () => {
    await renderAt(`${FONTANERO_AVERIAS_PATH}/28`)
    expect(container.querySelector('#averia-fontanero-prioridad')).toBeNull()
    expect(container.querySelector('#averia-fontanero-clasificacion')).toBeNull()
  })

  it('maneja tipo, prioridad, fechas y observaciones pendientes sin undefined', async () => {
    await renderAt(`${FONTANERO_AVERIAS_PATH}/26`)
    expect(container.textContent).toContain(AVERIA_UNCLASSIFIED_LABEL)
    expect(container.textContent).toContain(AVERIA_UNASSIGNED_LABEL)
    expect(container.textContent).toContain(AVERIA_UNAVAILABLE_LABEL)
    expect(container.textContent).toContain(
      AVERIAS_FONTANERO_OBSERVACIONES_LISTA_VACIA,
    )
    expect(container.textContent).not.toContain('null')
    expect(container.textContent).not.toContain('undefined')
    expect(container.textContent).not.toContain('[object Object]')
  })

  it('muestra observaciones existentes y fechas de atención', async () => {
    await renderAt(`${FONTANERO_AVERIAS_PATH}/27`)
    const inProgress = findFontaneroAveriaFixture(27)!
    const existente = inProgress.observaciones![0]
    expect(container.textContent).toContain('En atención')
    expect(container.textContent).toContain(AVERIAS_FONTANERO_OBSERVACIONES_TITULO)
    expect(container.textContent).toContain(existente.observacion)
    expect(container.textContent).toContain(existente.autor.nombre)
    expect(container.textContent).toContain(
      formatAveriaAdminDateTime(existente.fechaCreacion),
    )
    expect(container.textContent).toContain(
      formatAveriaAdminDateTime(inProgress.fechaInicioAtencion),
    )
    expect(container.textContent).toContain(AVERIAS_FONTANERO_RESOLVER_LABEL)
    expect(container.textContent).toContain(AVERIAS_FONTANERO_OBSERVACION_GUARDAR)
  })

  it('distingue Asignada, Pendiente de atención y En atención en el listado', async () => {
    const asignada = findFontaneroAveriaFixture(25)!
    const enAtencion = findFontaneroAveriaFixture(27)!
    const pendiente = findFontaneroAveriaFixture(29)!
    vi.mocked(averiasFontaneroApi.getFontaneroAverias).mockResolvedValue({
      data: [asignada, pendiente, enAtencion].map((item) => ({
        id: item.id,
        codigoSeguimiento: item.codigoSeguimiento,
        fechaAsignacion: item.fechaAsignacion,
        estado: item.estado,
        sectorComunidad: item.sectorComunidad,
        ubicacion: item.ubicacion,
        descripcion: item.descripcion,
        tipoAveria: item.tipoAveria,
        prioridad: item.prioridad,
        fechaInicioAtencion: item.fechaInicioAtencion,
      })),
    })
    await renderAt(FONTANERO_AVERIAS_PATH)
    expect(container.textContent).toContain('Asignada')
    expect(container.textContent).toContain('Pendiente de atención')
    expect(container.textContent).toContain('En atención')
    expect(container.textContent).toContain(asignada.codigoSeguimiento)
    expect(container.textContent).toContain(pendiente.codigoSeguimiento)
    expect(container.textContent).toContain(enAtencion.codigoSeguimiento)
    expect(container.textContent).toContain(AVERIAS_FONTANERO_ATENCION_NO_INICIADA)
    expect(container.textContent).not.toContain('Fuera de horario')
    expect(
      container.querySelector(`a[href="${FONTANERO_AVERIAS_PATH}/29"]`),
    ).toBeTruthy()
  })

  it('muestra vacío cuando no hay averías operativas', async () => {
    await renderAt(FONTANERO_AVERIAS_PATH)
    expect(container.textContent).toContain(AVERIAS_FONTANERO_LIST_EMPTY)
    expect(container.textContent).not.toContain(
      'todavía no está disponible en esta versión',
    )
  })

  it('explica al Fontanero una avería pendiente de atención por horario', async () => {
    await renderAt(`${FONTANERO_AVERIAS_PATH}/29`)
    expect(container.textContent).toContain('Pendiente de atención')
    expect(container.textContent).toContain(
      'La avería se encuentra asignada, pero todavía no puede iniciarse la atención debido al horario laboral.',
    )
    expect(container.textContent).toContain(AVERIAS_FONTANERO_ATENCION_NO_INICIADA)
    expect(container.textContent).toContain(AVERIAS_FONTANERO_INICIAR_LABEL)
    expect(container.textContent).not.toContain('Fuera de horario')
    const iniciar = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes(AVERIAS_FONTANERO_INICIAR_LABEL),
    ) as HTMLButtonElement
    expect(iniciar.disabled).toBe(false)
  })

  it('muestra el rechazo de horario al intentar iniciar la atención', async () => {
    vi.mocked(averiasFontaneroApi.iniciarFontaneroAtencion).mockRejectedValueOnce(
      new Error(
        'HTTP 400: La atención no puede iniciarse en este momento porque se encuentra fuera del horario laboral establecido.',
      ),
    )
    await renderAt(`${FONTANERO_AVERIAS_PATH}/29`)
    const iniciar = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes(AVERIAS_FONTANERO_INICIAR_LABEL),
    )
    await act(async () => {
      iniciar?.click()
    })
    expect(averiasFontaneroApi.iniciarFontaneroAtencion).toHaveBeenCalledWith(29)
    expect(container.textContent).toContain(
      'La atención no puede iniciarse en este momento porque se encuentra fuera del horario laboral establecido.',
    )
    expect(container.textContent).toContain('Pendiente de atención')
    expect(container.textContent).not.toContain(AVERIAS_FONTANERO_INICIAR_SUCCESS)
    expect(container.textContent).not.toContain('TypeORM')
  })

  it('oculta errores técnicos si el Backend rechaza el inicio', async () => {
    vi.mocked(averiasFontaneroApi.iniciarFontaneroAtencion).mockRejectedValueOnce(
      new Error('HTTP 500: QueryFailedError TypeORM SQL Server'),
    )
    await renderAt(`${FONTANERO_AVERIAS_PATH}/25`)
    const iniciar = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes(AVERIAS_FONTANERO_INICIAR_LABEL),
    )
    await act(async () => {
      iniciar?.click()
    })
    expect(container.textContent).toContain(
      'No fue posible iniciar la atención. Intente nuevamente.',
    )
    expect(container.textContent).not.toContain('TypeORM')
    expect(container.textContent).not.toContain('SQL Server')
  })

  it('actualiza el detalle cuando el Backend acepta iniciar la atención', async () => {
    vi.mocked(averiasFontaneroApi.iniciarFontaneroAtencion).mockResolvedValueOnce({
      ...findFontaneroAveriaFixture(29)!,
      estado: 'EN_ATENCION',
      fechaInicioAtencion: '2026-09-19T14:00:00.000Z',
    })
    await renderAt(`${FONTANERO_AVERIAS_PATH}/29`)
    const iniciar = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes(AVERIAS_FONTANERO_INICIAR_LABEL),
    )
    await act(async () => {
      iniciar?.click()
    })
    expect(container.textContent).toContain(AVERIAS_FONTANERO_INICIAR_SUCCESS)
    expect(container.textContent).toContain('En atención')
    expect(container.textContent).toContain(AVERIAS_FONTANERO_RESOLVER_LABEL)
    expect(container.textContent).not.toContain(AVERIAS_FONTANERO_INICIAR_LABEL)
  })

  it('muestra el error de autorización al iniciar atención', async () => {
    vi.mocked(averiasFontaneroApi.iniciarFontaneroAtencion).mockRejectedValueOnce(
      new Error('HTTP 403: Acceso denegado'),
    )
    await renderAt(`${FONTANERO_AVERIAS_PATH}/25`)
    const iniciar = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes(AVERIAS_FONTANERO_INICIAR_LABEL),
    )
    await act(async () => {
      iniciar?.click()
    })
    expect(container.textContent).toContain(AVERIAS_FONTANERO_INICIAR_FORBIDDEN)
    expect(container.textContent).toContain('Asignada')
  })

  it('avería resuelta no ofrece transiciones', async () => {
    await renderAt(`${FONTANERO_AVERIAS_PATH}/28`)
    expect(container.textContent).toContain('Resuelta')
    expect(container.textContent).toContain(AVERIAS_FONTANERO_NO_ACTIONS)
    expect(container.textContent).not.toContain(AVERIAS_FONTANERO_RESOLVER_LABEL)
    expect(container.textContent).not.toContain(AVERIAS_FONTANERO_OBSERVACION_GUARDAR)
    expect(container.textContent).toContain('Tramo reemplazado y presión normal.')
    expect(container.textContent).toContain('Fontanero A')
    expect(container.querySelector('button[type="submit"]')).toBeNull()
  })

  it('ID inválido no llama al API y muestra no encontrada', async () => {
    await renderAt(`${FONTANERO_AVERIAS_PATH}/abc`)
    expect(averiasFontaneroApi.getFontaneroAveria).not.toHaveBeenCalled()
    expect(container.textContent).toContain(AVERIAS_FONTANERO_DETAIL_NOT_FOUND)
    expect(container.querySelector(`a[href="${FONTANERO_AVERIAS_PATH}"]`)).toBeTruthy()
  })

  it('avería inexistente muestra 404 comprensible', async () => {
    await renderAt(`${FONTANERO_AVERIAS_PATH}/999`)
    expect(container.textContent).toContain(AVERIAS_FONTANERO_DETAIL_NOT_FOUND)
    expect(container.textContent).not.toContain('TypeORM')
    expect(container.textContent).not.toContain('SQL Server')
  })

  it('403 de avería ajena no revela datos del reporte', async () => {
    vi.spyOn(averiasFontaneroApi, 'getFontaneroAveria').mockRejectedValue(
      new Error('HTTP 403: No tiene autorización para consultar esta avería.'),
    )
    await renderAt(`${FONTANERO_AVERIAS_PATH}/25`)
    expect(container.textContent).toContain(AVERIAS_FONTANERO_DETAIL_FORBIDDEN)
    expect(container.textContent).not.toContain('AV-2026-0025')
    expect(container.textContent).not.toContain('Juan Pérez')
    expect(container.textContent).not.toContain('8888-2222')
  })

  it('error inesperado permite reintentar', async () => {
    vi.spyOn(averiasFontaneroApi, 'getFontaneroAveria').mockRejectedValue(
      new Error('HTTP 500: boom'),
    )
    await renderAt(`${FONTANERO_AVERIAS_PATH}/25`)
    expect(container.textContent).toContain(AVERIAS_FONTANERO_DETAIL_ERROR)
    expect(container.textContent).not.toContain('boom')
    expect(container.querySelector('button')?.textContent).toContain(
      'Intentar nuevamente',
    )
  })

  it('muestra el estado de carga', async () => {
    await renderAt(`${FONTANERO_AVERIAS_PATH}/25`, { loading: true })
    expect(container.textContent).toContain(AVERIAS_FONTANERO_DETAIL_LOADING_MESSAGE)
    expect(container.textContent).not.toContain('AV-2026-0025')
  })

  const openResolver = async () => {
    const trigger = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes(AVERIAS_FONTANERO_RESOLVER_LABEL),
    )
    expect(trigger).toBeTruthy()
    await act(async () => {
      trigger?.click()
    })
  }

  it('solicita observación final y no llama al API si está vacía o solo tiene espacios', async () => {
    await renderAt(`${FONTANERO_AVERIAS_PATH}/27`)
    await openResolver()
    expect(container.textContent).toContain(AVERIAS_FONTANERO_RESOLVER_HINT)

    const confirm = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes(AVERIAS_FONTANERO_RESOLVER_CONFIRM),
    )
    await act(async () => {
      confirm?.click()
    })
    expect(container.textContent).toContain(OBSERVACION_FINAL_VACIA)
    expect(averiasFontaneroApi.resolverFontaneroAveria).not.toHaveBeenCalled()

    const textarea = container.querySelector(
      'textarea[name="observacionFinal"]',
    ) as HTMLTextAreaElement
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value',
    )?.set
    await act(async () => {
      nativeSetter?.call(textarea, '     ')
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await act(async () => {
      confirm?.click()
    })
    expect(averiasFontaneroApi.resolverFontaneroAveria).not.toHaveBeenCalled()
  })

  it('cancelar cierra el formulario sin cambios', async () => {
    await renderAt(`${FONTANERO_AVERIAS_PATH}/27`)
    await openResolver()
    const cancel = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes(AVERIAS_FONTANERO_RESOLVER_CANCEL),
    )
    await act(async () => {
      cancel?.click()
    })
    expect(container.querySelector('textarea[name="observacionFinal"]')).toBeNull()
    expect(averiasFontaneroApi.resolverFontaneroAveria).not.toHaveBeenCalled()
    expect(container.textContent).toContain('En atención')
  })

  it('confirma la resolución, actualiza el detalle y evita envíos duplicados', async () => {
    let resolveRequest: ((value: unknown) => void) | undefined
    vi.mocked(averiasFontaneroApi.resolverFontaneroAveria).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        }) as Promise<never>,
    )
    await renderAt(`${FONTANERO_AVERIAS_PATH}/27`)
    await openResolver()
    const textarea = container.querySelector(
      'textarea[name="observacionFinal"]',
    ) as HTMLTextAreaElement
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set
      setter?.call(textarea, 'Se reparó la fuga y se verificó la presión.')
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })
    const confirm = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes(AVERIAS_FONTANERO_RESOLVER_CONFIRM),
    ) as HTMLButtonElement

    await act(async () => {
      confirm.click()
      confirm.click()
    })
    expect(averiasFontaneroApi.resolverFontaneroAveria).toHaveBeenCalledTimes(1)
    expect(confirm.disabled).toBe(true)

    await act(async () => {
      resolveRequest?.({
        message: AVERIAS_FONTANERO_RESOLVER_SUCCESS,
        data: {
          ...findFontaneroAveriaFixture(27)!,
          estado: 'RESUELTA',
          fechaResolucion: '2026-09-19T18:00:00.000Z',
          observaciones: [
            {
              id: 12,
              observacion: 'Se reparó la fuga y se verificó la presión.',
              fechaCreacion: '2026-09-19T18:00:00.000Z',
              autor: { id: 7, nombre: 'Fontanero A' },
            },
          ],
        },
      })
    })

    expect(container.textContent).toContain(AVERIAS_FONTANERO_RESOLVER_SUCCESS)
    expect(container.textContent).toContain('Resuelta')
    expect(container.textContent).toContain('Se reparó la fuga y se verificó la presión.')
    expect(container.textContent).toContain('Observación final')
    expect(container.textContent).not.toContain(AVERIAS_FONTANERO_RESOLVER_LABEL)
    expect(JSON.stringify(vi.mocked(averiasFontaneroApi.resolverFontaneroAveria).mock.calls[0])).not.toMatch(
      /fontaneroId|"estado"|fechaResolucion/,
    )
  })

  const setTextareaValue = async (selector: string, text: string) => {
    const textarea = container.querySelector(selector) as HTMLTextAreaElement
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      )?.set
      setter?.call(textarea, text)
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })
  }

  const fillObservationAndConfirm = async (text: string) => {
    await setTextareaValue('textarea[name="observacionFinal"]', text)
    const confirm = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes(AVERIAS_FONTANERO_RESOLVER_CONFIRM),
    ) as HTMLButtonElement
    await act(async () => {
      confirm.click()
    })
  }

  const submitNuevaObservacion = async (text?: string) => {
    if (text !== undefined) {
      await setTextareaValue('textarea[name="observacion"]', text)
    }
    const save = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes(AVERIAS_FONTANERO_OBSERVACION_GUARDAR),
    ) as HTMLButtonElement
    await act(async () => {
      save.click()
    })
    return save
  }

  it('muestra el error de autorización y no cierra la avería', async () => {
    vi.mocked(averiasFontaneroApi.resolverFontaneroAveria).mockRejectedValueOnce(
      new Error('HTTP 403: No tiene autorización para resolver esta avería.'),
    )
    await renderAt(`${FONTANERO_AVERIAS_PATH}/27`)
    await openResolver()
    await fillObservationAndConfirm('Se reparó la fuga.')
    expect(container.textContent).toContain(AVERIAS_FONTANERO_RESOLVER_FORBIDDEN)
    expect(container.textContent).toContain('En atención')
    expect(container.textContent).not.toContain(AVERIAS_FONTANERO_RESOLVER_SUCCESS)
  })

  it('muestra un error genérico ante fallos de conexión', async () => {
    vi.mocked(averiasFontaneroApi.resolverFontaneroAveria).mockRejectedValueOnce(
      new Error('Failed to fetch'),
    )
    await renderAt(`${FONTANERO_AVERIAS_PATH}/27`)
    await openResolver()
    await fillObservationAndConfirm('Se reparó la fuga.')
    expect(container.textContent).toContain(AVERIAS_FONTANERO_RESOLVER_ERROR)
    expect(container.textContent).not.toContain('Failed to fetch')
    expect(container.textContent).toContain('En atención')
  })

  it('rechaza observaciones vacías o solo espacios sin llamar al API', async () => {
    await renderAt(`${FONTANERO_AVERIAS_PATH}/27`)
    await submitNuevaObservacion()
    expect(container.textContent).toContain(AVERIAS_FONTANERO_OBSERVACION_VACIA)
    expect(averiasFontaneroApi.createFontaneroObservacion).not.toHaveBeenCalled()

    await submitNuevaObservacion('     ')
    expect(averiasFontaneroApi.createFontaneroObservacion).not.toHaveBeenCalled()
  })

  it('registra una observación, la agrega a la lista y conserva las anteriores', async () => {
    let resolveRequest: ((value: unknown) => void) | undefined
    vi.mocked(averiasFontaneroApi.createFontaneroObservacion).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        }) as Promise<never>,
    )
    await renderAt(`${FONTANERO_AVERIAS_PATH}/27`)
    await setTextareaValue(
      'textarea[name="observacion"]',
      'Se identificó una fuga cerca del medidor.',
    )
    const save = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent?.includes(AVERIAS_FONTANERO_OBSERVACION_GUARDAR),
    ) as HTMLButtonElement
    await act(async () => {
      save.click()
      save.click()
    })
    expect(averiasFontaneroApi.createFontaneroObservacion).toHaveBeenCalledTimes(1)
    expect(save.disabled).toBe(true)
    expect(
      JSON.stringify(
        vi.mocked(averiasFontaneroApi.createFontaneroObservacion).mock.calls[0],
      ),
    ).not.toMatch(/fontaneroId|fechaCreacion|"nombre"/)

    await act(async () => {
      resolveRequest?.({
        message: AVERIAS_FONTANERO_OBSERVACION_SUCCESS,
        data: {
          id: 31,
          observacion: 'Se identificó una fuga cerca del medidor.',
          fechaCreacion: '2026-09-19T18:10:00.000Z',
          autor: { id: 7, nombre: 'Fontanero A' },
        },
      })
    })

    expect(container.textContent).toContain(AVERIAS_FONTANERO_OBSERVACION_SUCCESS)
    expect(container.textContent).toContain('Se está reemplazando el tramo afectado.')
    expect(container.textContent).toContain(
      'Se identificó una fuga cerca del medidor.',
    )
    expect(
      (container.querySelector('textarea[name="observacion"]') as HTMLTextAreaElement)
        .value,
    ).toBe('')
  })

  it('mantiene el texto escrito cuando el registro falla', async () => {
    vi.mocked(averiasFontaneroApi.createFontaneroObservacion).mockRejectedValueOnce(
      new Error('Failed to fetch'),
    )
    await renderAt(`${FONTANERO_AVERIAS_PATH}/25`)
    await submitNuevaObservacion('Texto que no debe perderse.')
    expect(container.textContent).toContain(AVERIAS_FONTANERO_OBSERVACION_ERROR)
    expect(container.textContent).not.toContain('Failed to fetch')
    expect(
      (container.querySelector('textarea[name="observacion"]') as HTMLTextAreaElement)
        .value,
    ).toBe('Texto que no debe perderse.')
  })

  it('muestra el error de autorización al registrar observaciones', async () => {
    vi.mocked(averiasFontaneroApi.createFontaneroObservacion).mockRejectedValueOnce(
      new Error('HTTP 403: Acceso denegado'),
    )
    await renderAt(`${FONTANERO_AVERIAS_PATH}/25`)
    await submitNuevaObservacion('Intento sobre avería ajena.')
    expect(container.textContent).toContain(AVERIAS_FONTANERO_OBSERVACION_FORBIDDEN)
    expect(
      (container.querySelector('textarea[name="observacion"]') as HTMLTextAreaElement)
        .value,
    ).toBe('Intento sobre avería ajena.')
  })
})
