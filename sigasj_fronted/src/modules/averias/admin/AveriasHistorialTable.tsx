import { Link, useLocation } from 'react-router-dom'
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
}

const AveriasHistorialTable = ({ items }: AveriasHistorialTableProps) => {
  const location = useLocation()

  const detailAction = (id: number) => (
    <Link
      className="gallery-admin__button"
      to={averiasAdminDetailPath(id)}
      state={{
        listSearch: location.search,
        listBase: AVERIAS_ADMIN_HISTORIAL_PATH,
      }}
    >
      Ver detalle
    </Link>
  )

  const resolucion = (item: AveriaHistorialItem) =>
    formatAveriaAdminDateTimeOrUnavailable(
      item.fechaResolucion,
      AVERIA_UNAVAILABLE_LABEL,
    )

  return (
    <>
      <div className="table-responsive averias-admin__table overflow-x-auto">
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
                  <span className="averias-admin__codigo">{item.codigoSeguimiento}</span>
                </td>
                <td>
                  {formatAveriaAdminDateTimeOrUnavailable(
                    item.fechaReporte,
                    AVERIA_UNAVAILABLE_LABEL,
                  )}
                </td>
                <td>{item.sectorComunidad}</td>
                <td>
                  <AveriaStatusBadge estado={item.estado} />
                </td>
                <td>
                  <span className={item.tipoAveria ? undefined : 'averias-admin__muted'}>
                    {getTipoAveriaDetailLabel(item.tipoAveria)}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      item.prioridad
                        ? `averias-admin__badge averias-admin__badge--prioridad is-${item.prioridad.toLowerCase()}`
                        : 'averias-admin__muted'
                    }
                  >
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

      <ul className="averias-admin__cards">
        {items.map((item) => (
          <li className="averias-admin__card" key={`card-${item.id}`}>
            <header className="averias-admin__card-head">
              <span className="averias-admin__codigo">{item.codigoSeguimiento}</span>
              <AveriaStatusBadge estado={item.estado} />
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
    </>
  )
}

export default AveriasHistorialTable
