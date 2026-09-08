import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAuthSession } from '../auth/utils/authStorage'
import { mountAppRoutes } from '../../test/render-app-routes'
import { ACTIVIDADES_FONTANERO_PATHS } from './actividadesFontaneroPaths'
import * as actividadesApi from './services/actividadesFontaneroApi'
import { respuestaTiposActividad } from './test/tiposActividadFixture'

const login = () => setAuthSession({
  accessToken: 'jwt-fontanero',
  user: { id: '12', role: 'Fontanero', name: 'Carlos' },
})

const registrada = {
  id: 81, tipoActividadId: 6, tipoActividadNombre: 'Incapacidad o vacaciones',
  fechaActividad: '2026-09-07', titulo: 'Incapacidad médica', descripcion: null,
  ubicacion: null, observaciones: null, estado: 'REPORTADA', observacionCorreccion: null,
  documentos: [{ id: 9, actividadId: 81, nombreOriginal: 'incapacidad.pdf', tipoArchivo: 'application/pdf', rutaReferenciaArchivo: '/documentos/9', tamanio: 2048, fechaCarga: '2026-09-07T12:00:00Z' }],
  createdAt: '2026-09-07T12:00:00Z', updatedAt: '2026-09-07T12:00:00Z',
}

const setValue = (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const selectFiles = (input: HTMLInputElement, files: File[]) => {
  Object.defineProperty(input, 'files', { configurable: true, value: files })
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

describe('Backlog 7.4 — pruebas funcionales frontend de formularios y documentos', () => {
  beforeEach(() => {
    login()
    vi.restoreAllMocks()
    vi.spyOn(actividadesApi, 'getTiposActividadFontanero').mockResolvedValue(respuestaTiposActividad)
    vi.spyOn(actividadesApi, 'registrarActividad').mockResolvedValue(registrada)
  })

  it.each([
    ['CONTROL_FUGAS', 'ubicacionFuga'],
    ['TOMA_PRESION', 'presionMedida'],
    ['VISITA_CAMPO', 'resultadoVisita'],
    ['CONTROL_CLOROS', 'cantidadCloro'],
    ['CONTROL_OPERATIVO', 'caudal'],
    ['INCAPACIDAD_VACACIONES', 'documentos'],
  ])('muestra únicamente el campo específico de %s', async (codigo, expectedField) => {
    const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.registrarTipo(codigo))
    try {
      const specificFields = ['ubicacionFuga', 'presionMedida', 'resultadoVisita', 'cantidadCloro', 'caudal', 'documentos']
      expect(app.container.querySelector(`#${expectedField}`)).not.toBeNull()
      for (const field of specificFields.filter((item) => item !== expectedField)) {
        expect(app.container.querySelector(`#${field}`)).toBeNull()
      }
    } finally { await app.cleanup() }
  })

  it('muestra nombre y tamaño del documento y permite quitarlo', async () => {
    const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.registrarTipo('INCAPACIDAD_VACACIONES'))
    try {
      const input = app.container.querySelector('#documentos') as HTMLInputElement
      await act(async () => selectFiles(input, [new File([new Uint8Array(1536)], 'incapacidad.pdf', { type: 'application/pdf' })]))
      expect(app.container.textContent).toContain('incapacidad.pdf')
      expect(app.container.textContent).toContain('1.5 KB')
      await act(async () => (app.container.querySelector('.documento-uploader__remove') as HTMLButtonElement).click())
      expect(app.container.textContent).not.toContain('incapacidad.pdf')
    } finally { await app.cleanup() }
  })

  it('rechaza formatos no permitidos y más de cinco documentos', async () => {
    const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.registrarTipo('INCAPACIDAD_VACACIONES'))
    try {
      const input = app.container.querySelector('#documentos') as HTMLInputElement
      await act(async () => selectFiles(input, [new File(['doc'], 'reporte.docx', { type: 'application/octet-stream' })]))
      expect(app.container.textContent).toContain('PDF, JPG, JPEG o PNG')
      const oversized = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'grande.pdf', { type: 'application/pdf' })
      await act(async () => selectFiles(input, [oversized]))
      expect(app.container.textContent).toContain('supera el tamaño máximo de 10 MB')
      const files = Array.from({ length: 6 }, (_, index) => new File(['pdf'], `${index}.pdf`, { type: 'application/pdf', lastModified: index }))
      await act(async () => selectFiles(input, files))
      expect(app.container.textContent).toContain('máximo de 5 documentos')
      expect(app.container.querySelectorAll('.documento-uploader__file')).toHaveLength(5)
    } finally { await app.cleanup() }
  })

  it('no exige documentos en actividades que no corresponden', async () => {
    const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.registrarTipo('CONTROL_FUGAS'))
    try {
      expect(app.container.querySelector('#documentos')).toBeNull()
      expect(app.container.textContent).not.toContain('Debe adjuntar al menos un documento')
    } finally { await app.cleanup() }
  })

  it('conserva datos y documento tras error atómico y acepta el reenvío corregido', async () => {
    vi.mocked(actividadesApi.registrarActividad).mockRejectedValueOnce(new Error('HTTP 400: ["La fecha no es válida"]')).mockResolvedValueOnce(registrada)
    const app = await mountAppRoutes(ACTIVIDADES_FONTANERO_PATHS.registrarTipo('INCAPACIDAD_VACACIONES'))
    try {
      const fecha = app.container.querySelector('#fechaActividad') as HTMLInputElement
      const titulo = app.container.querySelector('#titulo') as HTMLInputElement
      const input = app.container.querySelector('#documentos') as HTMLInputElement
      const form = app.container.querySelector('form') as HTMLFormElement
      await act(async () => {
        setValue(fecha, '2026-09-07')
        setValue(titulo, 'Incapacidad médica')
        selectFiles(input, [new File(['pdf'], 'incapacidad.pdf', { type: 'application/pdf' })])
      })
      await act(async () => form.requestSubmit())
      expect((app.container.querySelector('#titulo') as HTMLInputElement).value).toBe('Incapacidad médica')
      expect(app.container.textContent).toContain('incapacidad.pdf')
      expect(app.container.textContent).toContain('fecha')
      await act(async () => form.requestSubmit())
      expect(actividadesApi.registrarActividad).toHaveBeenCalledTimes(2)
      expect(app.container.querySelector('[data-testid="actividad-registro-exito"]')).not.toBeNull()
    } finally { await app.cleanup() }
  })
})
