import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { IconEye, IconUser } from '@tabler/icons-react'
import AveriaPrioridadBadge from './AveriaPrioridadBadge'
import AveriaStatusBadge from './AveriaStatusBadge'
import { averiasAdminDetailPath } from './averiasAdminPaths'
import { formatAveriaAdminDateTime } from './formatAveriaAdminDate'
import { esPendienteDeAtencion } from '../utils/averiaPendienteAtencion'
import {
  AVERIA_UNASSIGNED_LABEL,
  getFontaneroLabel,
  getTipoAveriaDetailLabel,
  type AveriaListItem,
} from './types'

type AveriasAdminTableProps = {
  items: AveriaListItem[]
  onViewDetail?: (id: number) => void
  footer?: ReactNode
}

const cell =
  'averias-admin__cell flex items-center justify-between gap-3 xl:table-cell'
const mobileLabel =
  'shrink-0 text-[0.68rem] font-bold uppercase tracking-[0.04em] text-slate-500 xl:hidden'

const AveriasAdminTable = ({ items, onViewDetail, footer }: AveriasAdminTableProps) => {
  const location = useLocation()
  const listState = { listSearch: location.search }

  return (
    <div className="averias-admin__list-card min-w-0 overflow-hidden rounded-3xl border border-[#d7e5f1] bg-white shadow-[0_4px_14px_rgba(30,90,156,0.05)]">
      <div className="averias-admin__list-scroll min-w-0 overflow-x-auto">
        <table className="averias-admin__list-table w-full border-collapse text-left">
          <caption className="sr-only">Listado de averías</caption>
          <thead className="averias-admin__list-head hidden border-b border-[#d7e5f1] bg-[#f3f8fd] text-[0.7rem] font-bold uppercase tracking-[0.07em] text-[#3d5a73] xl:table-header-group">
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Reportante</th>
              <th scope="col">Ubicación</th>
              <th scope="col">Tipo</th>
              <th scope="col">Estado</th>
              <th scope="col">Prioridad</th>
              <th scope="col" className="text-right">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="block xl:table-row-group">
            {items.map((item) => {
              const pendienteSinInicio =
                esPendienteDeAtencion(String(item.estado)) &&
                item.fontanero != null
              const fontaneroLabel = getFontaneroLabel(item.fontanero)
              const sinAsignar = fontaneroLabel === AVERIA_UNASSIGNED_LABEL
              const detailPath = averiasAdminDetailPath(item.id)

              return (
                <tr
                  key={item.id}
                  className="averias-admin__list-row grid gap-2 px-3.5 py-3.5 transition hover:bg-[#f7fbfe] xl:table-row xl:p-0"
                >
                  <td className={cell}>
                    <span className={mobileLabel}>Código</span>
                    <Link
                      to={detailPath}
                      state={listState}
                      className="averias-admin__codigo-link"
                      onClick={() => onViewDetail?.(item.id)}
                    >
                      {item.codigoSeguimiento}
                    </Link>
                  </td>
                  <td className={cell}>
                    <span className={mobileLabel}>Reportante</span>
                    <span className="averias-admin__stack min-w-0 text-right xl:text-left">
                      <span className="averias-admin__primary">
                        {item.nombreReportante}
                      </span>
                      <span className="averias-admin__secondary">
                        {formatAveriaAdminDateTime(item.fechaReporte)}
                      </span>
                    </span>
                  </td>
                  <td className={`${cell} averias-admin__cell--ubicacion`}>
                    <span className={mobileLabel}>Ubicación</span>
                    <span className="averias-admin__stack min-w-0 text-right xl:text-left">
                      <span className="averias-admin__primary">
                        {item.sectorComunidad}
                      </span>
                      <span
                        className="averias-admin__secondary truncate"
                        title={item.ubicacion}
                      >
                        {item.ubicacion}
                      </span>
                    </span>
                  </td>
                  <td className={cell}>
                    <span className={mobileLabel}>Tipo</span>
                    <span className="averias-admin__stack min-w-0 text-right xl:text-left">
                      <span className="averias-admin__primary">
                        {getTipoAveriaDetailLabel(item.tipoAveria)}
                      </span>
                      <span
                        className={`averias-admin__assignee ${
                          sinAsignar ? 'is-empty' : ''
                        }`}
                      >
                        <IconUser size={13} stroke={2} aria-hidden="true" />
                        <span className="truncate">
                          {sinAsignar ? 'Sin asignar' : fontaneroLabel}
                        </span>
                      </span>
                      {pendienteSinInicio ? (
                        <span className="averias-admin__warn-chip">
                          Atención no iniciada
                        </span>
                      ) : null}
                    </span>
                  </td>
                  <td className={cell}>
                    <span className={mobileLabel}>Estado</span>
                    <AveriaStatusBadge estado={item.estado} variant="flat" />
                  </td>
                  <td className={cell}>
                    <span className={mobileLabel}>Prioridad</span>
                    <AveriaPrioridadBadge prioridad={item.prioridad} />
                  </td>
                  <td className={`${cell} averias-admin__cell--action`}>
                    <span className={mobileLabel}>Acción</span>
                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                      <Link
                        className="averias-admin__ver-btn"
                        to={detailPath}
                        state={listState}
                        onClick={() => onViewDetail?.(item.id)}
                      >
                        <IconEye size={16} aria-hidden="true" />
                        Ver detalle
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {footer ? <div className="averias-admin__list-footer">{footer}</div> : null}
    </div>
  )
}

export default AveriasAdminTable
