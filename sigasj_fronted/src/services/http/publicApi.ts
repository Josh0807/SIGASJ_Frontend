import { fetchWithAuth } from './httpClient'

export async function fetchPublicApi<T>(paths: string[]): Promise<T> {
  let lastError: Error | null = null

  for (const path of paths) {
    try {
      return await fetchWithAuth<T>(path)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }
  }

  throw lastError ?? new Error('No fue posible consultar el servicio.')
}

export function appendFormValue(
  form: FormData,
  key: string,
  value: string | number | boolean | null | undefined,
) {
  if (value === undefined || value === null) {
    return
  }

  form.append(key, String(value))
}
