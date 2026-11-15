import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { IconEye } from '@tabler/icons-react'
import AveriaPrioridadBadge from './AveriaPrioridadBadge'
import AveriaStatusBadge from './AveriaStatusBadge'
import { averiasAdminDetailPath } from './averiasAdminPaths'
import { formatAveriaAdminDateTime } from './formatAveriaAdminDate'
import { esPendienteDeAtencion } from '../utils/averiaPendienteAtencion'
import {
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
  'flex items-center justify-between gap-3 xl:table-cell xl:px-6 xl:py-4'
const mobileLabel =
  'text-xs font-bold uppercase text-slate-500 xl:hidden'

const AveriasAdminTable = ({ items, onViewDetail, footer }: AveriasAdminTableProps) => {
  const location = useLocation()

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[#d7e5f1] bg-white shadow-[0_12px_30px_rgba(30,90,156,0.07)] sm:rounded-3xl">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Listado de averías</caption>
        <thead className="hidden border-b border-[#d7e5f1] bg-[#f3f8fd] text-[0.7rem] font-bold uppercase tracking-[0.08em] text-slate-500 xl:table-header-group">
          <tr>
            <th scope="col" className="px-6 py-4">
              Código
            </th>
            <th scope="col" className="px-6 py-4">
              Reportante
            </th>
            <th scope="col" className="px-6 py-4">
              Ubicación
            </th>
            <th scope="col" className="px-6 py-4">
              Seguimiento
            </th>
            <th scope="col" className="px-6 py-4">
              Estado
            </th>
            <th scope="col" className="px-6 py-4">
              Prioridad
            </th>
            <th scope="col" className="px-6 py-4 text-right">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="block divide-y divide-slate-100 xl:table-row-group">
          {items.map((item) => {
            const pendienteSinInicio =
              esPendienteDeAtencion(String(item.estado)) &&
              item.fontanero != null

            return (
              <tr
                key={item.id}
                className="grid gap-2 px-5 py-4 transition hover:bg-sky-50/50 xl:table-row xl:p-0"
              >
                <td className={cell}>
                  <span className={mobileLabel}>Código</span>
                  <span className="font-mono text-sm font-bold text-[#1e5a9c]">
                    {item.codigoSeguimiento}
                  </span>
                </td>
                <td className={cell}>
                  <span className={mobileLabel}>Reportante</span>
                  <span className="min-w-0 text-right xl:text-left">
                    <span className="block text-sm font-extrabold text-[#1e5a9c]">
                      {item.nombreReportante}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {formatAveriaAdminDateTime(item.fechaReporte)}
                    </span>
                  </span>
                </td>
                <td className={cell}>
                  <span className={mobileLabel}>Ubicación</span>
                  <span className="min-w-0 text-right xl:text-left">
                    <span className="block text-sm font-semibold text-[#1a2f42]">
                      {item.sectorComunidad}
                    </span>
                    <span
                      className="block truncate text-xs text-slate-500"
                      title={item.ubicacion}
                    >
                      {item.ubicacion}
                    </span>
                  </span>
                </td>
                <td className={cell}>
                  <span className={mobileLabel}>Seguimiento</span>
                  <span className="min-w-0 text-right xl:text-left">
                    <span className="block text-sm font-semibold text-[#1a2f42]">
                      {getTipoAveriaDetailLabel(item.tipoAveria)}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {getFontaneroLabel(item.fontanero)}
                      {pendienteSinInicio ? ' · Atención no iniciada' : ''}
                    </span>
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
                <td className="pt-2 xl:table-cell xl:px-6 xl:py-4">
                  <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                    <Link
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d7e5f1] bg-white px-4 py-2 text-sm font-bold text-[#1e5a9c] no-underline transition-colors hover:border-[#1e5a9c] hover:bg-[#eaf6ff] hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e5a9c] motion-reduce:transition-none"
                      to={averiasAdminDetailPath(item.id)}
                      state={{ listSearch: location.search }}
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
      {footer}
    </div>
  )
}

export default AveriasAdminTable
