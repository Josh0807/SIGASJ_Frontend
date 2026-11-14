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

  it('2. Verifica el encabezado compacto del dashboard y el saludo', () => {
    const markup = renderDashboard()
    expect(markup).toContain('Panel operativo')
    expect(markup).toContain('Resumen del estado del acueducto según su rol')
    expect(markup).toContain('Control del día')
    expect(markup).toContain('Refresque las cifras')
    expect(markup).toMatch(/Buenos d[ií]as|Buenas tardes|Buenas noches/)
    expect(markup).not.toContain('alt="Gotín"')
    expect(markup).not.toContain('Sistema Operativo')
    expect(markup).not.toContain('Red en línea')
  })

  it('3. Muestra los indicadores generales con datos numéricos y sus enlaces a módulos correspondientes', () => {
    vi.spyOn(useDashboardMetricsModule, 'useDashboardMetrics').mockReturnValue({
      metrics: {
        abonadosActivos: 12,
        alertasReposicionPendientes: 3,
        averiasReportadas: 2,
        solicitudesEnTramite: 1,
      },
      isLoading: false,
      isError: false,
      refetch: async () => {},
    })

    const markup = renderDashboard()
    expect(markup).toContain('Indicadores principales')
    expect(markup).toContain('Asociados activos')
    expect(markup).toContain('12')
    expect(markup).not.toContain('1,248')
    expect(markup).not.toContain('Recursos Humanos')
    expect(markup).not.toContain('Pendientes de lectura')
    expect(markup).toContain('Averías reportadas')
    expect(markup).toContain('2')
    expect(markup).toContain('Solicitudes en trámite')
    expect(markup).toContain('1')
    expect(markup).toContain('Alertas de reposición')
    expect(markup).toContain('3')

    // Verificar correspondencia con los módulos
    expect(markup).toContain('href="/admin/abonados"')
    expect(markup).toContain('href="/admin/inventario/alertas-reposicion"')
    expect(markup).toContain('href="/admin/averias"')
    expect(markup).toContain('href="/admin/solicitudes"')
  })

  it('4. Renderiza los widgets operativos en tiempo real (Averías recientes y Bitácora)', () => {
    const markup = renderDashboard()
    expect(markup).toContain('Operación en vivo')
    expect(markup).toContain('Lo más reciente del acueducto')
    expect(markup).not.toContain('Ciclo de Lecturas')
    expect(markup).toContain('Averías recientes')
    expect(markup).toContain('Actividad reciente')
    expect(markup).toContain('href="/admin/averias"')
    expect(markup).toMatch(/href="\/admin\/actividades(-fontanero)?"/)
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
      metrics: { abonadosActivos: null, alertasReposicionPendientes: null },
      isLoading: false,
      isError: true,
      refetch: async () => {},
    })

    const markup = renderDashboard()
    expect(markup).toContain('No se pudieron actualizar algunos indicadores del servidor.')
    expect(markup).toContain('Reintentar')
    expect(markup).toContain('N/D')
    // El dashboard no se bloqueó y sigue mostrando el resto del contenido
    expect(markup).toContain('Operación en vivo')
  })

  it('7. Diferencia correctamente una métrica en cero (0) de un dato no disponible (null)', () => {
    vi.spyOn(useDashboardMetricsModule, 'useDashboardMetrics').mockReturnValue({
      metrics: {
        abonadosActivos: 0, // Cero real
        alertasReposicionPendientes: null, // No disponible
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

  it('Fontanero no ve el acceso a Gestión de asociados en el dashboard', () => {
    setAuthSession({
      accessToken: 'token-fontanero',
      user: { id: '3', role: 'Fontanero' },
    })

    const markup = renderDashboard()

    expect(markup).not.toContain('href="/admin/averias"')
    expect(markup).not.toContain('href="/admin/abonados"')
    expect(markup).not.toContain('Asociados activos')
    expect(markup).not.toContain('Alertas de reposición')
    expect(markup).not.toContain('href="/admin/inventario/alertas-reposicion"')
    expect(markup).not.toContain('Solicitudes en trámite')
    expect(markup).not.toContain('href="/admin/solicitudes"')
    expect(markup).not.toContain(
      'No se pudieron actualizar algunos indicadores del servidor.',
    )
  })
})
