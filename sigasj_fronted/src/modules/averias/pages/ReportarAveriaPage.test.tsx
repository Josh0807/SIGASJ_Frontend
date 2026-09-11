import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import { clearAccessToken } from '../../auth/utils/authStorage'
import { mountAppRoutes } from '../../../test/render-app-routes'
import { setViewportWidth } from '../../../test/viewportHelpers'
import { REPORTAR_AVERIA_ROUTE_PATH } from '../../../app/router/routePaths'
import LandingPage from '../../landing/pages/LandingPage'
import ReportarAveriaPage from './ReportarAveriaPage'
import { PUBLIC_AVERIA_ADMIN_PAYLOAD_KEYS } from '../types/publicAveriaApi'
import {
  PUBLIC_AVERIA_NETWORK_ERROR,
  PUBLIC_AVERIA_SERVER_ERROR,
} from '../utils/parsePublicAveriaSubmitError'

const ADMIN_FIELDS = [
  'codigoSeguimiento',
  'fechaReporte',
  'horaReporte',
  'estado',
  'prioridad',
  'tipoAveria',
  'fontaneroAsignado',
  'fechaAsignacion',
  'fechaInicioAtencion',
  'fechaResolucion',
  'observacionesAtencion',
  'abonadoId',
  'userId',
]

const successBody = {
  message: 'Avería registrada correctamente.',
  data: {
    codigoSeguimiento: 'AV-2026-0001',
    fechaReporte: '2026-09-11T20:15:00.000Z',
    estado: 'Recibida',
  },
}

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 201 ? 'Created' : 'Error',
    json: async () => body,
    text: async () => JSON.stringify(body),
  }) as Response

const setFieldValue = (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const fillRequired = (container: HTMLElement) => {
  setFieldValue(container.querySelector('[name="nombreReportante"]') as HTMLInputElement, 'María Rodríguez')
  setFieldValue(container.querySelector('[name="telefonoReportante"]') as HTMLInputElement, '8888-8888')
  setFieldValue(
    container.querySelector('[name="ubicacion"]') as HTMLTextAreaElement,
    'Frente a la escuela, 50 m sur',
  )
  setFieldValue(container.querySelector('[name="sectorComunidad"]') as HTMLInputElement, 'San Juan')
  setFieldValue(
    container.querySelector('[name="descripcion"]') as HTMLTextAreaElement,
    'Se observa una fuga en la tubería.',
  )
}

const readPayload = (fetchMock: ReturnType<typeof vi.fn>) =>
  JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body)) as Record<string, unknown>

describe('Pantalla pública Reportar avería', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('abre /reportar-averia sin sesión y sin redirigir a login', async () => {
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      expect(app.currentPath()).toBe('/reportar-averia')
      expect(app.container.innerHTML).toContain('Formulario público de reporte de averías')
      expect(app.container.innerHTML).toContain('Reportar una avería')
      expect(app.container.innerHTML).not.toContain('admin-layout')
      expect(app.container.innerHTML).not.toContain('auth-page')
      expect(app.currentPath()).not.toBe('/login')
    } finally {
      await app.cleanup()
    }
  })

  it('navega desde la Landing con el botón Reportar avería', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )

    expect(markup).toContain('href="/reportar-averia"')
    expect(markup).toContain('Reportar avería')
  })

  it('muestra los campos públicos y no incluye campos administrativos ni fotos', async () => {
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      const html = app.container.innerHTML
      expect(html).toContain('name="nombreReportante"')
      expect(html).toContain('name="identificacionReportante"')
      expect(html).toContain('name="telefonoReportante"')
      expect(html).toContain('name="correoReportante"')
      expect(html).toContain('name="ubicacion"')
      expect(html).toContain('name="sectorComunidad"')
      expect(html).toContain('name="descripcion"')
      expect(html).toContain('Opcional')
      expect(html).toContain('type="tel"')
      expect(html).toContain('type="email"')
      expect(html).not.toContain('type="file"')

      for (const name of ADMIN_FIELDS) {
        expect(app.container.querySelector(`[name="${name}"]`)).toBeNull()
      }
    } finally {
      await app.cleanup()
    }
  })

  it('muestra errores inline en vacíos obligatorios y no llama al Backend', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        form.requestSubmit()
      })

      const alerts = [...app.container.querySelectorAll('[role="alert"]')].map((node) => node.textContent)
      expect(alerts).toContain('Ingrese su nombre completo.')
      expect(alerts).toContain('Ingrese un número telefónico de contacto.')
      expect(alerts).toContain('Indique la ubicación de la avería.')
      expect(alerts).toContain('Indique el sector o comunidad.')
      expect(alerts).toContain('Describa el problema reportado.')
      expect(alerts.join(' ')).not.toContain('correo electrónico válido')
      expect(fetchMock).not.toHaveBeenCalled()
    } finally {
      await app.cleanup()
    }
  })

  it('trata espacios como vacíos en campos obligatorios', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        setFieldValue(app.container.querySelector('[name="nombreReportante"]') as HTMLInputElement, '   ')
        setFieldValue(app.container.querySelector('[name="telefonoReportante"]') as HTMLInputElement, '   ')
        setFieldValue(app.container.querySelector('[name="ubicacion"]') as HTMLTextAreaElement, '   ')
        setFieldValue(app.container.querySelector('[name="sectorComunidad"]') as HTMLInputElement, '   ')
        setFieldValue(app.container.querySelector('[name="descripcion"]') as HTMLTextAreaElement, '   ')
        form.requestSubmit()
      })

      expect(fetchMock).not.toHaveBeenCalled()
      expect(app.container.innerHTML).toContain('Ingrese su nombre completo.')
    } finally {
      await app.cleanup()
    }
  })

  it('rechaza correo inválido sin enviar request', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        fillRequired(app.container)
        setFieldValue(
          app.container.querySelector('[name="correoReportante"]') as HTMLInputElement,
          'correo-invalido',
        )
        form.requestSubmit()
      })

      expect(app.container.innerHTML).toContain('Ingrese un correo electrónico válido.')
      expect(fetchMock).not.toHaveBeenCalled()
    } finally {
      await app.cleanup()
    }
  })

  it('envía POST público sin JWT y omite opcionales vacíos y campos administrativos', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, successBody))
    vi.stubGlobal('fetch', fetchMock)
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        fillRequired(app.container)
        form.requestSubmit()
      })

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
      const headers = options.headers as Record<string, string>
      const body = readPayload(fetchMock)

      expect(url).toMatch(/\/api\/v1\/public\/averias$/)
      expect(options.method).toBe('POST')
      expect(headers['Content-Type']).toBe('application/json')
      expect(headers.Authorization).toBeUndefined()
      expect(body).toEqual({
        nombreReportante: 'María Rodríguez',
        telefonoReportante: '8888-8888',
        ubicacion: 'Frente a la escuela, 50 m sur',
        sectorComunidad: 'San Juan',
        descripcion: 'Se observa una fuga en la tubería.',
      })
      expect(body).not.toHaveProperty('identificacionReportante')
      expect(body).not.toHaveProperty('correoReportante')
      for (const key of PUBLIC_AVERIA_ADMIN_PAYLOAD_KEYS) {
        expect(body).not.toHaveProperty(key)
      }
    } finally {
      await app.cleanup()
    }
  })

  it('muestra loading, evita doble submit y conserva valores mientras el POST está pendiente', async () => {
    let resolveFetch: ((value: Response) => void) | undefined
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      const form = app.container.querySelector('form') as HTMLFormElement
      const submit = app.container.querySelector('button[type="submit"]') as HTMLButtonElement

      await act(async () => {
        fillRequired(app.container)
        submit.click()
        submit.click()
        form.requestSubmit()
      })

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(submit.disabled).toBe(true)
      expect(submit.textContent).toContain('Enviando reporte...')
      expect(form.getAttribute('aria-busy')).toBe('true')
      expect(app.container.innerHTML).not.toContain('AV-2026-0001')
      expect((app.container.querySelector('[name="nombreReportante"]') as HTMLInputElement).value).toBe(
        'María Rodríguez',
      )

      await act(async () => {
        resolveFetch?.(jsonResponse(201, successBody))
      })
      expect(fetchMock).toHaveBeenCalledTimes(1)
    } finally {
      await app.cleanup()
    }
  })

  it('un Enter adicional durante el envío no dispara un segundo POST', async () => {
    let resolveFetch: ((value: Response) => void) | undefined
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        fillRequired(app.container)
        form.requestSubmit()
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        form.requestSubmit()
      })

      expect(fetchMock).toHaveBeenCalledTimes(1)

      await act(async () => {
        resolveFetch?.(jsonResponse(201, successBody))
      })
      expect(fetchMock).toHaveBeenCalledTimes(1)
    } finally {
      await app.cleanup()
    }
  })

  it('incluye identificación y correo en el payload solo cuando tienen valor', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, successBody))
    vi.stubGlobal('fetch', fetchMock)
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        fillRequired(app.container)
        setFieldValue(
          app.container.querySelector('[name="identificacionReportante"]') as HTMLInputElement,
          '1-2345-6789',
        )
        setFieldValue(
          app.container.querySelector('[name="correoReportante"]') as HTMLInputElement,
          'prueba.averia.e2e@example.com',
        )
        form.requestSubmit()
      })

      const body = readPayload(fetchMock)
      expect(body.identificacionReportante).toBe('1-2345-6789')
      expect(body.correoReportante).toBe('prueba.averia.e2e@example.com')
      for (const key of PUBLIC_AVERIA_ADMIN_PAYLOAD_KEYS) {
        expect(body).not.toHaveProperty(key)
      }
    } finally {
      await app.cleanup()
    }
  })

  it('muestra el código del Backend y limpia el formulario solo después del éxito', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, successBody))
    vi.stubGlobal('fetch', fetchMock)
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        fillRequired(app.container)
        form.requestSubmit()
      })

      expect(app.container.innerHTML).toContain('Avería registrada correctamente.')
      expect(app.container.innerHTML).toContain('AV-2026-0001')
      expect(app.container.innerHTML).toContain('Conserve este código para identificar su reporte.')
      expect(app.container.innerHTML).not.toContain('SMS')
      expect((app.container.querySelector('[name="nombreReportante"]') as HTMLInputElement).value).toBe('')
      expect((app.container.querySelector('[name="telefonoReportante"]') as HTMLInputElement).value).toBe('')
      expect((app.container.querySelector('[name="descripcion"]') as HTMLTextAreaElement).value).toBe('')
      expect(app.container.querySelector('.public-averia-form__code')?.textContent).toBe('AV-2026-0001')
    } finally {
      await app.cleanup()
    }
  })

  it('mapea 400 a campos, conserva valores y no muestra código', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(400, {
        statusCode: 400,
        message: ['El correo electrónico no es válido'],
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        fillRequired(app.container)
        setFieldValue(
          app.container.querySelector('[name="correoReportante"]') as HTMLInputElement,
          'maria@example.com',
        )
        form.requestSubmit()
      })

      expect(app.container.innerHTML).toContain('El correo electrónico no es válido')
      expect(app.container.innerHTML).not.toContain('AV-2026-0001')
      expect((app.container.querySelector('[name="nombreReportante"]') as HTMLInputElement).value).toBe(
        'María Rodríguez',
      )
      expect((app.container.querySelector('[name="correoReportante"]') as HTMLInputElement).value).toBe(
        'maria@example.com',
      )
    } finally {
      await app.cleanup()
    }
  })

  it('muestra error de conexión y permite reintentar hasta el éxito', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse(201, successBody))
    vi.stubGlobal('fetch', fetchMock)
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        fillRequired(app.container)
        form.requestSubmit()
      })

      expect(app.container.innerHTML).toContain(PUBLIC_AVERIA_NETWORK_ERROR)
      expect(app.container.innerHTML).not.toContain('AV-2026-0001')
      expect((app.container.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(false)
      expect((app.container.querySelector('[name="nombreReportante"]') as HTMLInputElement).value).toBe(
        'María Rodríguez',
      )

      await act(async () => {
        form.requestSubmit()
      })

      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(app.container.innerHTML).toContain('AV-2026-0001')
      expect((app.container.querySelector('[name="nombreReportante"]') as HTMLInputElement).value).toBe('')
    } finally {
      await app.cleanup()
    }
  })

  it('oculta detalles técnicos de un 500 y conserva el formulario', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(500, {
        statusCode: 500,
        message: 'QueryFailedError TypeORM SQL Exception stack INSERT INTO Averia',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        fillRequired(app.container)
        form.requestSubmit()
      })

      expect(app.container.innerHTML).toContain(PUBLIC_AVERIA_SERVER_ERROR)
      expect(app.container.innerHTML).not.toContain('QueryFailedError')
      expect(app.container.innerHTML).not.toContain('TypeORM')
      expect(app.container.innerHTML).not.toContain('INSERT INTO')
      expect(app.container.innerHTML).not.toContain('AV-2026-0001')
      expect((app.container.querySelector('[name="descripcion"]') as HTMLTextAreaElement).value).toContain(
        'fuga',
      )
      expect((app.container.querySelector('button[type="submit"]') as HTMLButtonElement).disabled).toBe(false)
    } finally {
      await app.cleanup()
    }
  })

  it('permite completar el formulario con teclado y mantiene el botón accesible', async () => {
    const app = await mountAppRoutes(REPORTAR_AVERIA_ROUTE_PATH)

    try {
      const controls = [
        ...app.container.querySelectorAll('input, textarea, button[type="submit"]'),
      ] as HTMLElement[]
      expect(controls.length).toBeGreaterThanOrEqual(8)
      expect(controls.every((node) => node.tabIndex >= 0)).toBe(true)

      const submit = app.container.querySelector('button[type="submit"]') as HTMLButtonElement
      expect(submit.textContent).toContain('Enviar reporte')
      submit.focus()
      expect(document.activeElement).toBe(submit)
      expect(app.container.querySelectorAll('label[for]').length).toBeGreaterThanOrEqual(7)
    } finally {
      await app.cleanup()
    }
  })

  it('usa una columna en móvil y dos columnas de datos cortos en desktop', () => {
    const desktop = renderToStaticMarkup(
      <MemoryRouter>
        <ReportarAveriaPage />
      </MemoryRouter>,
    )
    expect(desktop).toContain('public-averia-form__grid--pair')
    expect(desktop).toContain('public-averia-form__submit')

    setViewportWidth(390)
    expect(window.innerWidth).toBe(390)
    setViewportWidth(1280)
    expect(window.innerWidth).toBe(1280)
  })
})
