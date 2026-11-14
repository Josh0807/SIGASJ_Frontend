import { act } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import {
  clearAccessToken,
  clearAuthSession,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
  setAuthSession,
} from '../utils/authStorage'
import { AuthProvider } from '../components/AuthContext'
import { resolvePostLoginAdminPath } from '../utils/adminNavigation'
import LoginPage from './LoginPage'

const setControlledInputValue = (element: HTMLInputElement, value: string) => {
  const prototype = Object.getPrototypeOf(element) as HTMLInputElement
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value)
  element.dispatchEvent(new Event('input', { bubbles: true }))
}

const mountLoginPage = async () => {
  const router = createMemoryRouter(
    [
      {
        path: LOGIN_ROUTE_PATH,
        element: (
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        ),
      },
      {
        path: '/admin/dashboard',
        element: <p>Panel</p>,
      },
    ],
    { initialEntries: [LOGIN_ROUTE_PATH] },
  )

  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  await act(async () => {
    root.render(<RouterProvider router={router} />)
  })

  return {
    container,
    router,
    cleanup: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('LoginPage', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    clearAccessToken()
    document.body.innerHTML = ''
  })

  it('muestra una sola vez un mensaje comprensible cuando la sesiÃ³n expirÃ³', async () => {
    clearAuthSession('expired')

    const firstView = await mountLoginPage()
    try {
      expect(firstView.container.textContent).toContain(
        'Tu sesiÃ³n expirÃ³. Inicia sesiÃ³n nuevamente para continuar.',
      )
      expect(firstView.router.state.location.pathname).toBe(LOGIN_ROUTE_PATH)
    } finally {
      await firstView.cleanup()
    }

    const secondView = await mountLoginPage()
    try {
      expect(secondView.container.textContent).not.toContain('Tu sesiÃ³n expirÃ³')
      expect(secondView.container.querySelector('.auth-page__form')).not.toBeNull()
    } finally {
      await secondView.cleanup()
    }
  })

  it.each([
    { storedRole: 'Secretaria', backendRole: 'SECRETARIA' },
    { storedRole: 'Fontanero', backendRole: 'FONTANERO' },
  ] as const)(
    'redirige desde /login la sesiÃ³n activa del rol $storedRole sin crear un ciclo',
    async ({ storedRole, backendRole }) => {
      setAuthSession({
        accessToken: `token-${storedRole.toLowerCase()}`,
        user: { id: '2', role: storedRole, name: 'Usuario interno' },
      })
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({
            id: '2',
            email: 'usuario@asadasanjuan.cr',
            role: backendRole,
            name: 'Usuario interno',
          }),
        }),
      )

      const view = await mountLoginPage()
      try {
        await act(async () => {
          await Promise.resolve()
        })

        expect(view.router.state.location.pathname).toBe('/admin/dashboard')
        expect(view.router.state.location.pathname).not.toBe(LOGIN_ROUTE_PATH)
        expect(view.container.querySelector('.auth-page__form')).toBeNull()
      } finally {
        await view.cleanup()
      }
    },
  )

  it('no mantiene en /login a un usuario interno que ya tiene sesiÃ³n', async () => {
    setAuthSession({
      accessToken: 'token-activo',
      user: {
        id: '1',
        email: 'admin@asadasanjuan.cr',
        role: 'Administradora',
        name: 'Admin',
      },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: '1',
          email: 'admin@asadasanjuan.cr',
          role: 'ADMINISTRADORA',
          name: 'Admin',
        }),
      }),
    )

    const view = await mountLoginPage()
    try {
      await act(async () => {
        await Promise.resolve()
      })

      expect(view.router.state.location.pathname).toBe('/admin/dashboard')
      expect(view.container.querySelector('.auth-page__form')).toBeNull()
    } finally {
      await view.cleanup()
    }
  })

  it('renderiza la ruta pública con identidad, campos y botón submit', async () => {
    const view = await mountLoginPage()
    try {
      expect(view.container.querySelector('.auth-page')).not.toBeNull()
      expect(view.container.querySelector('.auth-page__brand')).not.toBeNull()
      expect(view.container.textContent).toContain('Iniciar sesión')
      expect(view.container.querySelector('#login-email')).not.toBeNull()
      expect(view.container.querySelector('#login-password')).not.toBeNull()
      expect(
        (view.container.querySelector('#login-password') as HTMLInputElement).type,
      ).toBe('password')
      expect(
        (view.container.querySelector('.auth-page__submit') as HTMLButtonElement)
          .type,
      ).toBe('submit')
      expect(view.container.innerHTML).not.toContain('href="#"')
      expect(view.container.innerHTML).not.toContain('admin-layout')
    } finally {
      await view.cleanup()
    }
  })

  it('valida formulario vacío sin enviar request', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const view = await mountLoginPage()

    try {
      const form = view.container.querySelector(
        '.auth-page__form',
      ) as HTMLFormElement
      await act(async () => {
        form.requestSubmit()
      })

      expect(fetchMock).not.toHaveBeenCalled()
      expect(view.container.textContent).toContain('El correo es obligatorio.')
      expect(view.container.textContent).toContain(
        'La contraseña es obligatoria.',
      )
    } finally {
      await view.cleanup()
    }
  })

  it('valida correo inválido sin enviar request', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const view = await mountLoginPage()

    try {
      const email = view.container.querySelector(
        '#login-email',
      ) as HTMLInputElement
      const password = view.container.querySelector(
        '#login-password',
      ) as HTMLInputElement
      const form = view.container.querySelector(
        '.auth-page__form',
      ) as HTMLFormElement

      await act(async () => {
        setControlledInputValue(email, 'correo-invalido')
        setControlledInputValue(password, 'Password123!')
        form.requestSubmit()
      })

      expect(fetchMock).not.toHaveBeenCalled()
      expect(view.container.textContent).toContain('Ingresa un correo válido.')
    } finally {
      await view.cleanup()
    }
  })

  it('alterna mostrar/ocultar contraseña sin cambiar el valor', async () => {
    const view = await mountLoginPage()

    try {
      const password = view.container.querySelector(
        '#login-password',
      ) as HTMLInputElement
      const toggle = view.container.querySelector(
        '.auth-page__password-toggle',
      ) as HTMLButtonElement

      await act(async () => {
        setControlledInputValue(password, 'Secreto123!')
      })

      expect(password.type).toBe('password')
      expect(password.value).toBe('Secreto123!')

      await act(async () => {
        toggle.click()
      })
      expect(password.type).toBe('text')
      expect(password.value).toBe('Secreto123!')
      expect(toggle.getAttribute('aria-label')).toBe('Ocultar contraseña')

      await act(async () => {
        toggle.click()
      })
      expect(password.type).toBe('password')
      expect(password.value).toBe('Secreto123!')
      expect(toggle.getAttribute('aria-label')).toBe('Mostrar contraseña')
    } finally {
      await view.cleanup()
    }
  })

  it('envía una sola request, muestra loading y evita doble submit', async () => {
    let resolveFetch: ((value: Response) => void) | undefined
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const view = await mountLoginPage()

    try {
      const email = view.container.querySelector(
        '#login-email',
      ) as HTMLInputElement
      const password = view.container.querySelector(
        '#login-password',
      ) as HTMLInputElement
      const form = view.container.querySelector(
        '.auth-page__form',
      ) as HTMLFormElement
      const submit = view.container.querySelector(
        '.auth-page__submit',
      ) as HTMLButtonElement

      await act(async () => {
        setControlledInputValue(email, 'admin@asadasanjuan.cr')
        setControlledInputValue(password, 'Password123!')
        form.requestSubmit()
      })

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(submit.disabled).toBe(true)
      expect(submit.textContent).toContain('Iniciando sesión')
      expect(email.value).toBe('admin@asadasanjuan.cr')
      expect(password.value).toBe('Password123!')

      await act(async () => {
        form.requestSubmit()
        submit.click()
      })
      expect(fetchMock).toHaveBeenCalledTimes(1)

      const [, options] = fetchMock.mock.calls[0] as [string, RequestInit]
      expect(options.method).toBe('POST')
      expect(String(fetchMock.mock.calls[0][0])).toContain('/auth/login')
      expect(JSON.parse(String(options.body))).toEqual({
        email: 'admin@asadasanjuan.cr',
        password: 'Password123!',
      })

      await act(async () => {
        resolveFetch?.({
          ok: true,
          status: 200,
          json: async () => ({
            accessToken: 'token-login-test',
            user: {
              id: '1',
              email: 'admin@asadasanjuan.cr',
              role: 'Administradora',
              name: 'Admin',
            },
          }),
        } as Response)
        await Promise.resolve()
      })

      expect(isAuthenticated()).toBe(true)
      expect(view.router.state.location.pathname).toBe('/admin/dashboard')
    } finally {
      await view.cleanup()
    }
  })

  it('muestra error amigable ante credenciales inválidas y conserva el correo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () =>
          JSON.stringify({ message: 'Credenciales inválidas', statusCode: 401 }),
      }),
    )

    const view = await mountLoginPage()

    try {
      const email = view.container.querySelector(
        '#login-email',
      ) as HTMLInputElement
      const password = view.container.querySelector(
        '#login-password',
      ) as HTMLInputElement
      const form = view.container.querySelector(
        '.auth-page__form',
      ) as HTMLFormElement
      const submit = view.container.querySelector(
        '.auth-page__submit',
      ) as HTMLButtonElement

      await act(async () => {
        setControlledInputValue(email, 'admin@asadasanjuan.cr')
        setControlledInputValue(password, 'WrongPass1!')
        form.requestSubmit()
        await Promise.resolve()
      })

      expect(view.container.textContent).toContain(
        'Las credenciales ingresadas no son correctas.',
      )
      expect(view.container.textContent).not.toContain('ZodError')
      expect(view.container.textContent).not.toContain('AxiosError')
      expect(email.value).toBe('admin@asadasanjuan.cr')
      expect(submit.disabled).toBe(false)
      expect(isAuthenticated()).toBe(false)
    } finally {
      await view.cleanup()
    }
  })

  it('muestra error de red y rehabilita el botón', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )

    const view = await mountLoginPage()

    try {
      const email = view.container.querySelector(
        '#login-email',
      ) as HTMLInputElement
      const password = view.container.querySelector(
        '#login-password',
      ) as HTMLInputElement
      const form = view.container.querySelector(
        '.auth-page__form',
      ) as HTMLFormElement
      const submit = view.container.querySelector(
        '.auth-page__submit',
      ) as HTMLButtonElement

      await act(async () => {
        setControlledInputValue(email, 'admin@asadasanjuan.cr')
        setControlledInputValue(password, 'Password123!')
        form.requestSubmit()
        await Promise.resolve()
      })

      expect(view.container.textContent).toMatch(
        /No fue posible conectar con el servidor|No fue posible iniciar sesión/,
      )
      expect(submit.disabled).toBe(false)
    } finally {
      await view.cleanup()
    }
  })

  it('permite enviar con Enter desde el formulario', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        accessToken: 'token-enter',
        user: {
          id: '2',
          email: 'admin@asadasanjuan.cr',
          role: 'Administradora',
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const view = await mountLoginPage()

    try {
      const email = view.container.querySelector(
        '#login-email',
      ) as HTMLInputElement
      const password = view.container.querySelector(
        '#login-password',
      ) as HTMLInputElement
      const form = view.container.querySelector(
        '.auth-page__form',
      ) as HTMLFormElement

      await act(async () => {
        setControlledInputValue(email, 'admin@asadasanjuan.cr')
        setControlledInputValue(password, 'Password123!')
        form.dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true }),
        )
        await Promise.resolve()
      })

      expect(fetchMock).toHaveBeenCalledTimes(1)
    } finally {
      await view.cleanup()
    }
  })

  it('usuario inactivo: sin sesión, sin redirect y mensaje autorizado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () =>
          JSON.stringify({
            message: 'El usuario se encuentra inactivo.',
            statusCode: 401,
          }),
      }),
    )

    const view = await mountLoginPage()
    try {
      const email = view.container.querySelector(
        '#login-email',
      ) as HTMLInputElement
      const password = view.container.querySelector(
        '#login-password',
      ) as HTMLInputElement
      const form = view.container.querySelector(
        '.auth-page__form',
      ) as HTMLFormElement

      await act(async () => {
        setControlledInputValue(email, 'inactivo@asadasanjuan.cr')
        setControlledInputValue(password, 'Password123!')
        form.requestSubmit()
        await Promise.resolve()
      })

      expect(view.container.textContent).toContain(
        'El usuario se encuentra inactivo.',
      )
      expect(isAuthenticated()).toBe(false)
      expect(view.router.state.location.pathname).toBe(LOGIN_ROUTE_PATH)
    } finally {
      await view.cleanup()
    }
  })

  it('error 500: mensaje general, sin sesión ni redirect', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'boom',
      }),
    )

    const view = await mountLoginPage()
    try {
      const email = view.container.querySelector(
        '#login-email',
      ) as HTMLInputElement
      const password = view.container.querySelector(
        '#login-password',
      ) as HTMLInputElement
      const form = view.container.querySelector(
        '.auth-page__form',
      ) as HTMLFormElement
      const submit = view.container.querySelector(
        '.auth-page__submit',
      ) as HTMLButtonElement

      await act(async () => {
        setControlledInputValue(email, 'admin@asadasanjuan.cr')
        setControlledInputValue(password, 'Password123!')
        form.requestSubmit()
        await Promise.resolve()
      })

      expect(view.container.textContent).toContain(
        'No fue posible iniciar sesión. Inténtalo nuevamente.',
      )
      expect(submit.disabled).toBe(false)
      expect(isAuthenticated()).toBe(false)
      expect(view.router.state.location.pathname).toBe(LOGIN_ROUTE_PATH)
    } finally {
      await view.cleanup()
    }
  })

  it.each([
    {
      role: 'ADMINISTRADORA',
      email: 'admin@asadasanjuan.cr',
      expectedRole: 'Administradora',
    },
    {
      role: 'SECRETARIA',
      email: 'secretaria@asadasanjuan.cr',
      expectedRole: 'Secretaria',
    },
    {
      role: 'FONTANERO',
      email: 'fontanero@asadasanjuan.cr',
      expectedRole: 'Fontanero',
    },
  ] as const)(
    'login exitoso con rol Backend $role crea sesión y redirige al home del rol',
    async ({ role, email, expectedRole }) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({
            accessToken: `token-${role}`,
            user: { id: 10, email, role, name: 'Usuario' },
          }),
        }),
      )

      const expectedPath = resolvePostLoginAdminPath({
        id: '10',
        email,
        role: expectedRole,
        name: 'Usuario',
      })

      const view = await mountLoginPage()
      try {
        const emailInput = view.container.querySelector(
          '#login-email',
        ) as HTMLInputElement
        const passwordInput = view.container.querySelector(
          '#login-password',
        ) as HTMLInputElement
        const form = view.container.querySelector(
          '.auth-page__form',
        ) as HTMLFormElement

        await act(async () => {
          setControlledInputValue(emailInput, email)
          setControlledInputValue(passwordInput, 'Password123!')
          form.requestSubmit()
          await Promise.resolve()
        })

        expect(isAuthenticated()).toBe(true)
        expect(getAccessToken()).toBe(`token-${role}`)
        expect(getAuthUser()?.role).toBe(expectedRole)
        expect(localStorage.getItem('sigasj_auth_user') ?? '').not.toMatch(
          /password/i,
        )
        expect(localStorage.getItem('sigasj_access_token') ?? '').not.toMatch(
          /password/i,
        )
        expect(view.router.state.location.pathname).toBe(expectedPath)
        expect(view.router.state.location.pathname).not.toContain('token=')
      } finally {
        await view.cleanup()
      }
    },
  )
})
