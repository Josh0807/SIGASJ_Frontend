import { Link, useLocation } from 'react-router-dom'
import AveriaStatusBadge from './AveriaStatusBadge'
import { averiasAdminDetailPath } from './averiasAdminPaths'
import { formatAveriaAdminDateTime } from './formatAveriaAdminDate'
import {
  getFontaneroLabel,
  getPrioridadLabel,
  getTipoAveriaDetailLabel,
  type AveriaListItem,
} from './types'

type AveriasAdminTableProps = {
  items: AveriaListItem[]
  onViewDetail?: (id: number) => void
}

const AveriasAdminTable = ({ items, onViewDetail }: AveriasAdminTableProps) => {
  const location = useLocation()
  const detailAction = (id: number) => (
    <Link
      className="gallery-admin__button"
      to={averiasAdminDetailPath(id)}
      state={{ listSearch: location.search }}
      onClick={() => onViewDetail?.(id)}
    >
      Ver detalle
    </Link>
  )

  return (
    <>
      <div className="table-responsive averias-admin__table">
        <table>
          <caption className="visually-hidden">Listado de averías</caption>
          <thead>
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Fecha</th>
              <th scope="col">Reportante</th>
              <th scope="col">Sector</th>
              <th scope="col">Ubicación</th>
              <th scope="col">Descripción</th>
              <th scope="col">Estado</th>
              <th scope="col">Prioridad</th>
              <th scope="col">Tipo</th>
              <th scope="col">Fontanero</th>
              <th scope="col">Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="averias-admin__codigo">
                    {item.codigoSeguimiento}
                  </span>
                </td>
                <td>{formatAveriaAdminDateTime(item.fechaReporte)}</td>
                <td>{item.nombreReportante}</td>
                <td>{item.sectorComunidad}</td>
                <td>
                  <span className="averias-admin__clamp" title={item.ubicacion}>
                    {item.ubicacion}
                  </span>
                </td>
                <td>
                  <span className="averias-admin__clamp" title={item.descripcion}>
                    {item.descripcion}
                  </span>
                </td>
                <td>
                  <AveriaStatusBadge estado={item.estado} />
                </td>
                <td>
                  <span
                    className={
                      item.prioridad
                        ? `averias-admin__badge averias-admin__badge--prioridad is-${item.prioridad.toLowerCase()}`
                        : 'averias-admin__muted'
                    }
                  >
                    {getPrioridadLabel(item.prioridad)}
                  </span>
                </td>
                <td>
                  <span className={item.tipoAveria ? undefined : 'averias-admin__muted'}>
                    {getTipoAveriaDetailLabel(item.tipoAveria)}
                  </span>
                </td>
                <td>
                  <span className={item.fontanero ? undefined : 'averias-admin__muted'}>
                    {getFontaneroLabel(item.fontanero)}
                  </span>
                </td>
                <td>{detailAction(item.id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="averias-admin__cards">
        {items.map((item) => (
          <li className="averias-admin__card" key={`card-${item.id}`}>
            <header className="averias-admin__card-head">
              <span className="averias-admin__codigo">{item.codigoSeguimiento}</span>
              <AveriaStatusBadge estado={item.estado} />
            </header>
            <dl className="averias-admin__card-meta">
              <div>
                <dt>Fecha</dt>
                <dd>{formatAveriaAdminDateTime(item.fechaReporte)}</dd>
              </div>
              <div>
                <dt>Reportante</dt>
                <dd>{item.nombreReportante}</dd>
              </div>
              <div>
                <dt>Sector</dt>
                <dd>{item.sectorComunidad}</dd>
              </div>
              <div>
                <dt>Ubicación</dt>
                <dd>
                  <span className="averias-admin__clamp" title={item.ubicacion}>
                    {item.ubicacion}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Descripción</dt>
                <dd>
                  <span className="averias-admin__clamp" title={item.descripcion}>
                    {item.descripcion}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Prioridad</dt>
                <dd>{getPrioridadLabel(item.prioridad)}</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{getTipoAveriaDetailLabel(item.tipoAveria)}</dd>
              </div>
              <div>
                <dt>Fontanero</dt>
                <dd>{getFontaneroLabel(item.fontanero)}</dd>
              </div>
            </dl>
            {detailAction(item.id)}
          </li>
        ))}
      </ul>
    </>
  )
}

export default AveriasAdminTable
