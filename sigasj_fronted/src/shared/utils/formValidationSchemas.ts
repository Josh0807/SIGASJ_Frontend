import { z } from 'zod'

export const requiredText = (fieldLabel: string) =>
  z.string().trim().min(1, `Ingresa ${fieldLabel}.`)

export const emailField = z
  .string()
  .trim()
  .min(1, 'Ingresa el correo electrónico.')
  .email('Ingresa un correo electrónico válido.')

export const numericField = (fieldLabel: string) =>
  z
    .string()
    .trim()
    .min(1, `Ingresa ${fieldLabel}.`)
    .regex(/^\d+(?:[.,]\d+)?$/, `${fieldLabel.charAt(0).toUpperCase()}${fieldLabel.slice(1)} debe contener únicamente números.`)

export const requiredSelection = (fieldLabel: string) =>
  z.string().trim().min(1, `Selecciona ${fieldLabel}.`)

export type FormValidationErrors = Record<string, string>

export const zodIssuesToFieldErrors = (
  issues: readonly { path: PropertyKey[]; message: string }[],
): FormValidationErrors => {
  const errors: FormValidationErrors = {}
  for (const issue of issues) {
    const field = issue.path.map(String).join('.')
    if (field && !errors[field]) errors[field] = issue.message
  }
  return errors
}
