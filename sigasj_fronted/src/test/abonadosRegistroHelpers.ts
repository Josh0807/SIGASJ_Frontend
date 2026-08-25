import { act } from 'react'
import type { AbonadoRegistroFormValues } from '../modules/abonados/admin/types'

export const REGISTRO_DEMO_VALUES: AbonadoRegistroFormValues = {
  origen: 'manual',
  idSolicitud: '',
  nombre: 'María',
  apellidos: 'Rodríguez Mora',
  cedula: '1-2345-6789',
  telefono: '8888-1234',
  correo: 'maria.rodriguez@correo.cr',
  direccion: 'San Juan, Desamparados',
  servicio: {
    nis: 'NIS-2026-001',
    medidor: 'MED-45821',
    sector: 'Sector Centro',
    tarifa: 'Residencial',
    numeroPlano: 'PL-1024',
  },
}

export const setInputValue = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set

  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

export const setSelectValue = (select: HTMLSelectElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    'value',
  )?.set

  setter?.call(select, value)
  select.dispatchEvent(new Event('input', { bubbles: true }))
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

export const fillRegistroForm = async (
  container: HTMLElement,
  values: AbonadoRegistroFormValues = REGISTRO_DEMO_VALUES,
) => {
  if (values.origen === 'solicitud') {
    const solicitudRadio = container.querySelector<HTMLInputElement>(
      'input[type="radio"][name="origen"]:not(:checked)',
    )

    await act(async () => {
      solicitudRadio?.click()
    })

    if (values.idSolicitud) {
      const select = container.querySelector<HTMLSelectElement>('select')
      if (select) {
        await act(async () => {
          setSelectValue(select, values.idSolicitud)
        })
      }
    }
  }

  const inputs = container.querySelectorAll<HTMLInputElement>(
    '.gallery-admin__form input:not([type="radio"])',
  )

  const manualValues = [
    values.nombre,
    values.apellidos,
    values.cedula,
    values.telefono,
    values.correo,
    values.direccion,
    values.servicio.nis,
    values.servicio.medidor,
    values.servicio.sector,
    values.servicio.tarifa,
    values.servicio.numeroPlano,
  ]

  await act(async () => {
    inputs.forEach((input, index) => {
      setInputValue(input, manualValues[index] ?? '')
    })
  })
}

export const submitRegistroForm = async (container: HTMLElement) => {
  const form = container.querySelector('form') as HTMLFormElement

  await act(async () => {
    form.requestSubmit()
  })
}
