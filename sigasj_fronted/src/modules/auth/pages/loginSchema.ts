import { z } from 'zod'

/** Contrato cliente alineado con LoginDto del backend (`email` + `password`). */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo es obligatorio.')
    .email('Ingresa un correo válido.'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria.')
    .refine((value) => /\S/.test(value), {
      message: 'La contraseña es obligatoria.',
    }),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export type LoginFieldErrors = Partial<Record<keyof LoginFormValues, string>>

export const validateLoginForm = (
  values: LoginFormValues,
): { success: true; data: LoginFormValues } | { success: false; errors: LoginFieldErrors } => {
  const result = loginSchema.safeParse(values)
  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: LoginFieldErrors = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0]
    if ((key === 'email' || key === 'password') && !errors[key]) {
      errors[key] = issue.message
    }
  }
  return { success: false, errors }
}
