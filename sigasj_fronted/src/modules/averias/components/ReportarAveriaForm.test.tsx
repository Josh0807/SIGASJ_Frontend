import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as consultaCedulaApi from '../services/consultaCedulaApi'
import ReportarAveriaForm from './ReportarAveriaForm'

const setInputValue = (input: HTMLInputElement, value: string) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('ReportarAveriaForm: cédula primero y nombre autocompletado', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const render = async () => {
    await act(async () => {
      root.render(<ReportarAveriaForm />)
    })
  }

  const campo = (name: string) =>
    container.querySelector<HTMLInputElement>(`input[name="${name}"]`)!

  it('muestra la cédula antes que el nombre', async () => {
    await render()
    const nombres = [...container.querySelectorAll('input')].map((i) => i.name)
    expect(nombres.indexOf('identificacionReportante')).toBeGreaterThanOrEqual(0)
    expect(nombres.indexOf('identificacionReportante')).toBeLessThan(
      nombres.indexOf('nombreReportante'),
    )
  })

  it('consulta sola al completar la cédula y carga el nombre', async () => {
    const spy = vi.spyOn(consultaCedulaApi, 'consultarPersonaPorCedula').mockResolvedValue({
      encontrada: true,
      identificacion: '112340567',
      nombre: 'MARIA RODRIGUEZ SOLANO',
      tipoIdentificacion: 'Física',
    })
    await render()

    await act(async () => {
      setInputValue(campo('identificacionReportante'), '1-1234-0567')
    })
    expect(spy).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(700)
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(campo('nombreReportante').value).toBe('MARIA RODRIGUEZ SOLANO')
    expect(container.textContent).toContain('Nombre encontrado')
  })

  it('no consulta con una cédula incompleta ni repite la consulta de la misma cédula', async () => {
    const spy = vi.spyOn(consultaCedulaApi, 'consultarPersonaPorCedula').mockResolvedValue({
      encontrada: false,
      identificacion: '112340567',
      nombre: null,
      tipoIdentificacion: null,
    })
    await render()

    await act(async () => {
      setInputValue(campo('identificacionReportante'), '1-1234')
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(spy).not.toHaveBeenCalled()

    await act(async () => {
      setInputValue(campo('identificacionReportante'), '1-1234-0567')
      await vi.advanceTimersByTimeAsync(700)
    })
    expect(spy).toHaveBeenCalledTimes(1)
    expect(container.textContent).toContain('No hay un nombre público para esa cédula')

    // Al salir del campo con la misma cédula no se vuelve a consultar.
    await act(async () => {
      campo('identificacionReportante').dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('el nombre sigue siendo editable cuando no se encuentra la cédula', async () => {
    vi.spyOn(consultaCedulaApi, 'consultarPersonaPorCedula').mockResolvedValue({
      encontrada: false,
      identificacion: '112340567',
      nombre: null,
      tipoIdentificacion: null,
    })
    await render()
    await act(async () => {
      setInputValue(campo('identificacionReportante'), '112340567')
      await vi.advanceTimersByTimeAsync(700)
    })
    await act(async () => {
      setInputValue(campo('nombreReportante'), 'Nombre escrito a mano')
    })
    expect(campo('nombreReportante').value).toBe('Nombre escrito a mano')
  })
})
