import { setAuthSession } from '../modules/auth/utils/authStorage'

export const DEFAULT_TEST_TOKEN = 'token-de-prueba'

export const loginWithAdminSession = (
  token = DEFAULT_TEST_TOKEN,
  role = 'Administradora',
) => {
  setAuthSession({
    accessToken: token,
    user: {
      id: '1',
      role,
      name: 'Usuario',
      lastName: 'Prueba',
    },
  })
}

export const loginAsRole = (role: string, id = '1') => {
  setAuthSession({
    accessToken: `token-${role.toLowerCase()}`,
    user: { id, role },
  })
}
