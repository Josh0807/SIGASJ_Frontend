import type { AveriaFontaneroListItem } from './types'

const ESTADO_ORDEN = ['EN_ATENCION', 'ASIGNADA', 'PENDIENTE', 'PENDIENTE_ATENCION']
const PRIORIDAD_ORDEN = ['ALTA', 'MEDIA', 'BAJA']

const indice = (orden: readonly string[], valor: string) => {
  const posicion = orden.indexOf(valor.trim().toUpperCase())
  return posicion === -1 ? orden.length : posicion
}

export function ordenColaFontanero(
  items: AveriaFontaneroListItem[],
): AveriaFontaneroListItem[] {
  return [...items].sort((izquierda, derecha) => {
    const porEstado =
      indice(ESTADO_ORDEN, String(izquierda.estado)) -
      indice(ESTADO_ORDEN, String(derecha.estado))
    if (porEstado !== 0) {
      return porEstado
    }
    return (
      indice(PRIORIDAD_ORDEN, izquierda.prioridad) -
      indice(PRIORIDAD_ORDEN, derecha.prioridad)
    )
  })
}

export type GrupoColaFontanero = {
  id: 'EN_ATENCION' | 'ASIGNADA' | 'PENDIENTE'
  titulo: string
  items: AveriaFontaneroListItem[]
}

export function agruparColaFontanero(
  items: AveriaFontaneroListItem[],
): GrupoColaFontanero[] {
  const ordenados = ordenColaFontanero(items)
  const grupos: GrupoColaFontanero[] = [
    {
      id: 'EN_ATENCION',
      titulo: 'En atención',
      items: ordenados.filter((item) => String(item.estado) === 'EN_ATENCION'),
    },
    {
      id: 'ASIGNADA',
      titulo: 'Asignadas',
      items: ordenados.filter((item) => String(item.estado) === 'ASIGNADA'),
    },
    {
      id: 'PENDIENTE',
      titulo: 'Pendientes de atención',
      items: ordenados.filter((item) => {
        const estado = String(item.estado)
        return estado === 'PENDIENTE' || estado === 'PENDIENTE_ATENCION'
      }),
    },
  ]
  return grupos.filter((grupo) => grupo.items.length > 0)
}
