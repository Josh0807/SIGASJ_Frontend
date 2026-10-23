import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Helpers de prueba y archivos de test no participan en Fast Refresh de Vite.
    files: [
      '**/test/**/*.{ts,tsx}',
      '**/*.{test,spec}.{ts,tsx}',
      '**/adminPanelTestHelpers.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Rutas, contexto de auth y configs de landing exportan helpers además de componentes.
    files: [
      'src/app/router/**/*.{ts,tsx}',
      'src/modules/auth/components/AuthContext.tsx',
      'src/modules/landing/config/**/*.{ts,tsx}',
      'src/modules/recibos/components/ReceiptDetails.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
