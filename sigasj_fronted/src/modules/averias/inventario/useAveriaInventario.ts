import { useCallback, useEffect, useState } from 'react'
import { getHttpErrorStatus } from '../../actividades-fontanero/utils/httpErrorStatus'
import { getSalidasPorAveria } from '../../inventario/salidas/salidasApi'
import type { SalidaAveria } from '../../inventario/salidas/types'
import { getMisSolicitudesMateriales, getSolicitudesMaterialesAdmin } from '../../inventario/solicitudes-materiales/solicitudesMaterialesApi'
import {
  normalizeSolicitudesMaterialesList,
} from '../../inventario/solicitudes-materiales/solicitudMaterialesUtils'
import type { SolicitudMaterialesListItem } from '../../inventario/solicitudes-materiales/types'

const ADMIN_SOLICITUD_ESTADOS = ['PENDIENTE', 'APROBADA', 'RECHAZADA'] as const

export type AveriaInventarioVariant = 'fontanero' | 'admin'

type UseAveriaInventarioOptions = {
  averiaId: number
  variant: AveriaInventarioVariant
  includeSolicitudes: boolean
  enabled?: boolean
  onUnauthorized?: () => void
}

const solicitudesErrorMessage = (status: number | null, variant: AveriaInventarioVariant) => {
  if (status === 403) {
    return variant === 'admin'
      ? 'No tiene permiso para consultar solicitudes de materiales.'
      : 'No tiene permiso para consultar las solicitudes de esta avería.'
  }
  if (status === 404) {
    return 'No se encontraron solicitudes de materiales para esta avería.'
  }
  return 'No fue posible cargar las solicitudes de materiales. Intente nuevamente.'
}

const salidasErrorMessage = (status: number | null) => {
  if (status === 403) {
    return 'No tiene permiso para consultar las salidas de esta avería.'
  }
  if (status === 404) {
    return 'No se encontró la avería solicitada.'
  }
  return 'No fue posible cargar las salidas de inventario. Intente nuevamente.'
}

const mergeAdminSolicitudes = (
  pages: SolicitudMaterialesListItem[][],
): SolicitudMaterialesListItem[] => {
  const byId = new Map<number, SolicitudMaterialesListItem>()
  pages.flat().forEach((item) => {
    if (!byId.has(item.id)) {
      byId.set(item.id, item)
    }
  })
  return [...byId.values()].sort((left, right) => {
    const leftTime = Date.parse(left.fechaSolicitud) || 0
    const rightTime = Date.parse(right.fechaSolicitud) || 0
    return rightTime - leftTime || right.id - left.id
  })
}

const loadSolicitudes = async (
  averiaId: number,
  variant: AveriaInventarioVariant,
): Promise<SolicitudMaterialesListItem[]> => {
  if (variant === 'fontanero') {
    const response = await getMisSolicitudesMateriales({ idAveria: averiaId })
    return normalizeSolicitudesMaterialesList(response).filter(
      (item) => item.idAveria === averiaId,
    )
  }

  const pages = await Promise.all(
    ADMIN_SOLICITUD_ESTADOS.map((estado) =>
      getSolicitudesMaterialesAdmin({
        estado,
        idAveria: averiaId,
        page: 1,
        limit: 100,
      }).then((response) =>
        normalizeSolicitudesMaterialesList(response).filter(
          (item) => item.idAveria === averiaId,
        ),
      ),
    ),
  )
  return mergeAdminSolicitudes(pages)
}

export function useAveriaInventario({
  averiaId,
  variant,
  includeSolicitudes,
  enabled = true,
  onUnauthorized,
}: UseAveriaInventarioOptions) {
  const [solicitudes, setSolicitudes] = useState<SolicitudMaterialesListItem[]>([])
  const [salidas, setSalidas] = useState<SalidaAveria[]>([])
  const [solicitudesLoading, setSolicitudesLoading] = useState(false)
  const [salidasLoading, setSalidasLoading] = useState(false)
  const [solicitudesError, setSolicitudesError] = useState<string | null>(null)
  const [salidasError, setSalidasError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  const refetch = useCallback(() => setReload((value) => value + 1), [])

  useEffect(() => {
    if (!enabled || !Number.isInteger(averiaId) || averiaId <= 0) {
      return
    }

    let cancelled = false

    // La consulta cambia de estado antes de iniciar la sincronización remota.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSalidasLoading(true)
    setSalidasError(null)
    getSalidasPorAveria(averiaId)
      .then((data) => {
        if (!cancelled) {
          setSalidas(Array.isArray(data) ? data : [])
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }
        const status = getHttpErrorStatus(error)
        if (status === 401) {
          onUnauthorized?.()
        }
        setSalidas([])
        setSalidasError(salidasErrorMessage(status))
      })
      .finally(() => {
        if (!cancelled) {
          setSalidasLoading(false)
        }
      })

    if (!includeSolicitudes) {
      setSolicitudes([])
      setSolicitudesError(null)
      setSolicitudesLoading(false)
      return () => {
        cancelled = true
      }
    }

    setSolicitudesLoading(true)
    setSolicitudesError(null)
    loadSolicitudes(averiaId, variant)
      .then((items) => {
        if (!cancelled) {
          setSolicitudes(items)
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }
        const status = getHttpErrorStatus(error)
        if (status === 401) {
          onUnauthorized?.()
        }
        setSolicitudes([])
        setSolicitudesError(solicitudesErrorMessage(status, variant))
      })
      .finally(() => {
        if (!cancelled) {
          setSolicitudesLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [averiaId, enabled, includeSolicitudes, onUnauthorized, reload, variant])

  return {
    solicitudes,
    salidas,
    solicitudesLoading,
    salidasLoading,
    solicitudesError,
    salidasError,
    refetch,
  }
}
