import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ReceiptSearchForm from './components/ReceiptSearchForm'
import ReceiptQueryPage from './pages/ReceiptQueryPage'
import PublicReceiptNavbar from './components/PublicReceiptNavbar'
import ReceiptDetails, { formatCurrency, formatDate } from './components/ReceiptDetails'
import NoPendingReceipts from './components/NoPendingReceipts'
import * as receiptsApi from './services/receiptsApi'
import LandingPage from '../landing/pages/LandingPage'

vi.mock('./services/receiptsApi', async () => {
  const actual = await vi.importActual<typeof receiptsApi>('./services/receiptsApi')
  return {
    ...actual,
    consultarRecibo: vi.fn(),
  }
})

describe('Consulta Pública de Recibos SIGASJ', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Formateadores (formatCurrency y formatDate)', () => {
    it('formatea montos numéricos a colones costarricenses (₡)', () => {
      const formatted = formatCurrency(12500)
      expect(formatted).toMatch(/12\s?500/)
      expect(formatted).toContain('₡')
    })

    it('maneja valores indefinidos o 0 adecuadamente', () => {
      expect(formatCurrency(0)).toContain('₡')
      expect(formatCurrency(undefined)).toBe('₡0')
    })

    it('formatea fechas de YYYY-MM-DD a DD/MM/YYYY', () => {
      expect(formatDate('2026-08-01')).toBe('01/08/2026')
      expect(formatDate('2026-08-20T00:00:00.000Z')).toBe('20/08/2026')
    })
  })

  describe('Formulario de Búsqueda (ReceiptSearchForm)', () => {
    it('renderiza la estructura básica con label, input y botón de consulta', () => {
      const markup = renderToStaticMarkup(<ReceiptSearchForm onSearch={() => {}} />)

      expect(markup).toContain('Número de paja')
      expect(markup).toContain('type="number"')
      expect(markup).toContain('Coloca tu número de paja aquí')
      expect(markup).toContain('Consultar')
    })

    it('muestra estado de carga deshabilitado cuando loading === true', () => {
      const markup = renderToStaticMarkup(<ReceiptSearchForm onSearch={() => {}} loading={true} />)

      expect(markup).toContain('Consultando recibo...')
      expect(markup).toContain('disabled=""')
    })
  })

  describe('Navbar Público de Recibos (PublicReceiptNavbar)', () => {
    it('renderiza el logo oficial de la ASADA, el texto SIGASJ San Juan y el botón Inicio', () => {
      const markup = renderToStaticMarkup(
        <MemoryRouter>
          <PublicReceiptNavbar />
        </MemoryRouter>,
      )

      expect(markup).toContain('Logo oficial de la ASADA')
      expect(markup).toContain('SIGASJ')
      expect(markup).toContain('San Juan')
      expect(markup).toContain('Inicio')
      expect(markup).toContain('href="/"')
    })
  })

  describe('Componente de Detalle de Recibo (ReceiptDetails)', () => {
    it('muestra el nombre del abonado, número de paja, fechas y total a pagar', () => {
      const mockData = {
        numeroPaja: 250,
        abonado: 'Juan Pérez',
        tieneRecibosPendientes: true,
        recibos: [
          {
            fechaEmision: '2026-08-01',
            fechaVencimiento: '2026-08-20',
            total: 12500,
          },
        ],
      }

      const markup = renderToStaticMarkup(<ReceiptDetails data={mockData} />)

      expect(markup).toContain('Juan Pérez')
      expect(markup).toContain('250')
      expect(markup).toContain('01/08/2026')
      expect(markup).toContain('20/08/2026')
      expect(markup).toContain('TOTAL A PAGAR')
    })

    it('muestra la insignia Recibo #1 y Recibo #2 cuando hay múltiples recibos', () => {
      const mockData = {
        numeroPaja: 250,
        abonado: 'Juan Pérez',
        tieneRecibosPendientes: true,
        recibos: [
          { fechaEmision: '2026-07-01', fechaVencimiento: '2026-07-20', total: 10000 },
          { fechaEmision: '2026-08-01', fechaVencimiento: '2026-08-20', total: 12500 },
        ],
      }

      const markup = renderToStaticMarkup(<ReceiptDetails data={mockData} />)

      expect(markup).toContain('Recibo #1')
      expect(markup).toContain('Recibo #2')
    })
  })

  describe('Componente Sin Recibos Pendientes (NoPendingReceipts)', () => {
    it('muestra claramente el mensaje de sin recibos pendientes', () => {
      const mockData = {
        numeroPaja: 130,
        abonado: 'Maria Rodriguez',
        tieneRecibosPendientes: false,
        recibos: [],
      }

      const markup = renderToStaticMarkup(<NoPendingReceipts data={mockData} />)

      expect(markup).toContain('No posee recibos pendientes.')
      expect(markup).toContain('Maria Rodriguez')
      expect(markup).toContain('130')
    })
  })

  describe('Página Pública de Consulta (ReceiptQueryPage)', () => {
    it('renderiza título, formulario y botones de acción pública', () => {
      const markup = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/consulta-recibo']}>
          <Routes>
            <Route path="/consulta-recibo" element={<ReceiptQueryPage />} />
          </Routes>
        </MemoryRouter>,
      )

      expect(markup).toContain('Consulta de recibo')
      expect(markup).toContain('Consultar otra paja')
      expect(markup).toContain('Volver al inicio')
    })
  })

  describe('Integración con Landing Page', () => {
    it('renderiza la sección de recibos conectada al formulario y no incluye el panel de admin', () => {
      const markup = renderToStaticMarkup(
        <MemoryRouter initialEntries={['/']}>
          <LandingPage />
        </MemoryRouter>,
      )

      expect(markup).toContain('Consulta tu recibo')
      expect(markup).toContain('receipt-payment__button')
      expect(markup).not.toContain('admin-sidebar')
      expect(markup).not.toContain('admin-header')
    })
  })
})

