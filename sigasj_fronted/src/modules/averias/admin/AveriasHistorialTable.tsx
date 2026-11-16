import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { IconEye } from '@tabler/icons-react'
import AveriaStatusBadge from './AveriaStatusBadge'
import { AVERIAS_ADMIN_HISTORIAL_PATH, averiasAdminDetailPath } from './averiasAdminPaths'
import { formatAveriaAdminDateTimeOrUnavailable } from './formatAveriaAdminDate'
import {
  AVERIA_UNAVAILABLE_LABEL,
  getFontaneroLabel,
  getHistorialPrioridadLabel,
  getTipoAveriaDetailLabel,
  type AveriaHistorialItem,
} from './types'

type AveriasHistorialTableProps = {
  items: AveriaHistorialItem[]
  footer?: ReactNode
}

const AveriasHistorialTable = ({ items, footer }: AveriasHistorialTableProps) => {
  const location = useLocation()
  const listState = {
    listSearch: location.search,
    listBase: AVERIAS_ADMIN_HISTORIAL_PATH,
  }

  const detailAction = (id: number) => (
    <Link
      className="averias-admin__ver-btn inline-flex min-h-10 items-center gap-2 rounded-2xl border border-[#c5daf0] bg-white px-3.5 text-sm font-bold text-[#1e5a9c] no-underline transition hover:border-[#1e5a9c] hover:bg-[#f3f9fd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e5a9c]"
      to={averiasAdminDetailPath(id)}
      state={listState}
    >
      <IconEye size={16} aria-hidden="true" />
      Ver detalle
    </Link>
  )

  const resolucion = (item: AveriaHistorialItem) =>
    formatAveriaAdminDateTimeOrUnavailable(
      item.fechaResolucion,
      AVERIA_UNAVAILABLE_LABEL,
    )

  const prioridadClass = (prioridad: string | null) => {
    if (!prioridad) {
      return 'averias-admin__muted'
    }
    return `averias-admin__badge averias-admin__badge--prioridad averias-admin__badge--flat is-${prioridad.toLowerCase()}`
  }

  return (
    <div className="averias-admin__list-card averias-admin__list-card--historial min-w-0 overflow-hidden rounded-3xl border border-[#d7e5f1] bg-white shadow-[0_4px_14px_rgba(30,90,156,0.05)]">
      <div className="table-responsive averias-admin__table averias-admin__historial-table overflow-x-auto">
        <table>
          <caption className="visually-hidden">Historial de averías</caption>
          <thead>
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Fecha de reporte</th>
              <th scope="col">Sector</th>
              <th scope="col">Estado</th>
              <th scope="col">Tipo</th>
              <th scope="col">Prioridad</th>
              <th scope="col">Fontanero</th>
              <th scope="col">Resolución</th>
              <th scope="col">Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link
                    to={averiasAdminDetailPath(item.id)}
                    state={listState}
                    className="averias-admin__codigo averias-admin__codigo-link no-underline"
                  >
                    {item.codigoSeguimiento}
                  </Link>
                </td>
                <td>
                  {formatAveriaAdminDateTimeOrUnavailable(
                    item.fechaReporte,
                    AVERIA_UNAVAILABLE_LABEL,
                  )}
                </td>
                <td className="font-semibold text-[#1a2f42]">{item.sectorComunidad}</td>
                <td>
                  <AveriaStatusBadge estado={item.estado} variant="flat" />
                </td>
                <td>
                  <span className={item.tipoAveria ? undefined : 'averias-admin__muted'}>
                    {getTipoAveriaDetailLabel(item.tipoAveria)}
                  </span>
                </td>
                <td>
                  <span className={prioridadClass(item.prioridad)}>
                    {getHistorialPrioridadLabel(item.prioridad)}
                  </span>
                </td>
                <td>
                  <span className={item.fontanero ? undefined : 'averias-admin__muted'}>
                    {getFontaneroLabel(item.fontanero)}
                  </span>
                </td>
                <td>
                  <span className={item.fechaResolucion ? undefined : 'averias-admin__muted'}>
                    {resolucion(item)}
                  </span>
                </td>
                <td>{detailAction(item.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="averias-admin__cards averias-admin__historial-cards">
        {items.map((item) => (
          <li className="averias-admin__card" key={`card-${item.id}`}>
            <header className="averias-admin__card-head">
              <Link
                to={averiasAdminDetailPath(item.id)}
                state={listState}
                className="averias-admin__codigo averias-admin__codigo-link no-underline"
              >
                {item.codigoSeguimiento}
              </Link>
              <AveriaStatusBadge estado={item.estado} variant="flat" />
            </header>
            <dl className="averias-admin__card-meta">
              <div>
                <dt>Fecha de reporte</dt>
                <dd>
                  {formatAveriaAdminDateTimeOrUnavailable(
                    item.fechaReporte,
                    AVERIA_UNAVAILABLE_LABEL,
                  )}
                </dd>
              </div>
              <div>
                <dt>Sector</dt>
                <dd>{item.sectorComunidad}</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{getTipoAveriaDetailLabel(item.tipoAveria)}</dd>
              </div>
              <div>
                <dt>Prioridad</dt>
                <dd>{getHistorialPrioridadLabel(item.prioridad)}</dd>
              </div>
              <div>
                <dt>Fontanero</dt>
                <dd>{getFontaneroLabel(item.fontanero)}</dd>
              </div>
              <div>
                <dt>Resolución</dt>
                <dd>{resolucion(item)}</dd>
              </div>
            </dl>
            {detailAction(item.id)}
          </li>
        ))}
      </ul>

      {footer ? <div className="averias-admin__list-footer">{footer}</div> : null}
    </div>
  )
}

export default AveriasHistorialTable
