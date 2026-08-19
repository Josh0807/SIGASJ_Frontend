import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import * as useDashboardMetricsModule from './hooks/useDashboardMetrics'
import { AuthProvider } from '../auth/components/AuthContext'
import { setAuthSession } from '../auth/utils/authStorage'

describe('AdminDashboard - Pruebas Integrales', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setAuthSession({
      accessToken: 'token-admin',
      user: { id: '1', role: 'Administradora' },
    })
  })

  const renderDashboard = () =>
    renderToStaticMarkup(
      <MemoryRouter>
        <AuthProvider>
          <AdminDashboard />
        </AuthProvider>
      </MemoryRouter>,
    )

  it('1. Carga la pantalla inicial con el título h1 "Dashboard administrativo"', () => {
    const markup = renderDashboard()
    expect(markup).toContain('Dashboard administrativo')
    expect(markup).toContain('<h1 id="admin-dashboard-title">Dashboard administrativo</h1>')
  })

  it('2. Verifica el mensaje de bienvenida y el indicador de estado del sistema', () => {
    const markup = renderDashboard()
    expect(markup).toContain('¡Bienvenido al sistema administrativo de ASADA San Juan!')
    expect(markup).toContain('Sistema Operativo')
    expect(markup).toContain('¡ASADA San Juan!')
  })

  it('3. Muestra los indicadores generales con datos numéricos y sus enlaces a módulos correspondientes', () => {
    const markup = renderDashboard()
    expect(markup).toContain('Indicadores generales')
    expect(markup).toContain('Abonados activos')
    expect(markup).toContain('1,248')
    expect(markup).toContain('Lecturas pendientes')
    expect(markup).toContain('34')
    expect(markup).toContain('Averías reportadas')
    expect(markup).toContain('3')
    expect(markup).toContain('Solicitudes en trámite')
    expect(markup).toContain('8')

    // Verificar correspondencia con los módulos
    expect(markup).toContain('href="/admin/abonados"')
    expect(markup).toContain('href="/admin/lecturas"')
    expect(markup).toContain('href="/admin/averias"')
    expect(markup).toContain('href="/admin/solicitudes"')
  })

  it('4. Renderiza los widgets operativos en tiempo real (Ciclo de lecturas, Averías recientes y Bitácora)', () => {
    const markup = renderDashboard()
    expect(markup).toContain('Operaciones en tiempo real')
    expect(markup).toContain('Ciclo de Lecturas')
    expect(markup).toContain('Averías Recientes')
    expect(markup).toContain('Bitácora de Actividad')
    expect(markup).toContain('href="/admin/lecturas"')
    expect(markup).toContain('href="/admin/averias"')
    expect(markup).toContain('href="/admin/reportes"')
  })

  it('5. Renderiza correctamente el estado de carga (Skeleton UI) cuando los datos están cargando', () => {
    vi.spyOn(useDashboardMetricsModule, 'useDashboardMetrics').mockReturnValue({
      metrics: {},
      isLoading: true,
      isError: false,
      refetch: async () => {},
    })

    const markup = renderDashboard()
    expect(markup).toContain('indicator-card--loading')
    expect(markup).toContain('aria-busy="true"')
    expect(markup).toContain('indicator-card__skeleton')
    expect(markup).toContain('Cargando...')
  })

  it('6. Maneja correctamente los errores sin bloquear el dashboard completo y permite reintentar', () => {
    vi.spyOn(useDashboardMetricsModule, 'useDashboardMetrics').mockReturnValue({
      metrics: { abonadosActivos: null, lecturasPendientes: null },
      isLoading: false,
      isError: true,
      refetch: async () => {},
    })

    const markup = renderDashboard()
    expect(markup).toContain('No se pudieron actualizar algunos indicadores del servidor.')
    expect(markup).toContain('Reintentar')
    expect(markup).toContain('N/D')
    // El dashboard no se bloqueó y sigue mostrando el resto del contenido
    expect(markup).toContain('Operaciones en tiempo real')
  })

  it('7. Diferencia correctamente una métrica en cero (0) de un dato no disponible (null)', () => {
    vi.spyOn(useDashboardMetricsModule, 'useDashboardMetrics').mockReturnValue({
      metrics: {
        abonadosActivos: 0, // Cero real
        lecturasPendientes: null, // No disponible
        averiasReportadas: 0,
        solicitudesEnTramite: null,
      },
      isLoading: false,
      isError: false,
      refetch: async () => {},
    })

    const markup = renderDashboard()
    expect(markup).toContain('0')
    expect(markup).toContain('N/D')
  })

  it('8. Audita la consola para asegurar que no ocurran errores ni advertencias durante la renderización', () => {
    const errors: unknown[] = []
    const warnings: unknown[] = []
    const originalError = console.error
    const originalWarn = console.warn
    console.error = (...args: unknown[]) => {
      errors.push(args)
    }
    console.warn = (...args: unknown[]) => {
      warnings.push(args)
    }

    try {
      const markup = renderDashboard()
      expect(markup).toContain('Dashboard administrativo')
      expect(errors).toEqual([])
      expect(warnings).toEqual([])
    } finally {
      console.error = originalError
      console.warn = originalWarn
    }
  })

  it('Fontanero no ve el acceso a Gestión de Abonados en el dashboard', () => {
    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero' },
    })

    const markup = renderDashboard()

    expect(markup).toContain('href="/admin/averias"')
    expect(markup).not.toContain('href="/admin/abonados"')
    expect(markup).not.toContain('Abonados activos')
  })
})
