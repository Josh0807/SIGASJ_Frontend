/** PK real de Averia: int identity. Rechaza NaN, decimales y texto. */
export function parseAveriaAdminId(
  value: string | number | null | undefined,
): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : null
  }

  const trimmed = value.trim()
  if (!/^\d+$/.test(trimmed)) {
    return null
  }

  const id = Number(trimmed)
  return Number.isInteger(id) && id > 0 ? id : null
}
