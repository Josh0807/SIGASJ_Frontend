import { Link, useLocation } from 'react-router-dom'
import { IconArrowRight } from '@tabler/icons-react'
import AdminNavIcon from '../../admin-panel/components/AdminNavIcon'
import AveriaStatusBadge from './AveriaStatusBadge'
import { averiasAdminDetailPath } from './averiasAdminPaths'
import { formatAveriaAdminDateTime } from './formatAveriaAdminDate'
import { esPendienteDeAtencion } from '../utils/averiaPendienteAtencion'
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
      className="gallery-admin__button group !inline-flex !min-h-12 !items-center !justify-center !gap-2 !rounded-2xl !border-0 !bg-gradient-to-r !from-blue-600 !to-sky-500 !px-6 !py-3 !font-extrabold !text-white !no-underline !shadow-[0_10px_22px_rgba(37,99,235,0.24)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!from-blue-700 hover:!to-sky-600 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.32)] focus-visible:!ring-4 focus-visible:!ring-blue-200"
      to={averiasAdminDetailPath(id)}
      state={{ listSearch: location.search }}
      onClick={() => onViewDetail?.(id)}
    >
      Ver detalle
      <IconArrowRight className="transition-transform duration-300 group-hover:translate-x-1" size={19} stroke={2.2} aria-hidden="true" />
    </Link>
  )

  return (
    <>
      <div className="table-responsive averias-admin__table averias-admin__table--listado overflow-x-auto">
        <table>
          <caption className="visually-hidden">Listado de averías</caption>
          <colgroup>
            <col className="averias-admin__col-codigo" />
            <col className="averias-admin__col-persona" />
            <col className="averias-admin__col-lugar" />
            <col className="averias-admin__col-seguimiento" />
            <col className="averias-admin__col-accion" />
          </colgroup>
          <thead className="visually-hidden">
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Reportante</th>
              <th scope="col">Ubicación</th>
              <th scope="col">Seguimiento</th>
              <th scope="col">Acción</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td colSpan={5}>
                  <article
                    className={`averias-admin__fila averias-admin__fila--${String(item.estado).toLowerCase().replace(/_/g, '-')}`}
                  >
                    <span className="averias-admin__fila-icono" aria-hidden="true">
                      <AdminNavIcon name="averias" />
                    </span>
                    <div className="averias-admin__fila-cuerpo">
                      <div className="averias-admin__fila-titulo">
                        <span className="averias-admin__codigo">
                          {item.codigoSeguimiento}
                        </span>
                        <span className="averias-admin__persona">
                          {item.nombreReportante}
                        </span>
                        <AveriaStatusBadge estado={item.estado} />
                      </div>
                      <p className="averias-admin__fila-sub">
                        <span className="averias-admin__fecha">
                          {formatAveriaAdminDateTime(item.fechaReporte)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="averias-admin__sector">
                          {item.sectorComunidad}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            item.fontanero ? undefined : 'averias-admin__muted'
                          }
                        >
                          {getFontaneroLabel(item.fontanero)}
                        </span>
                      </p>
                      <p className="averias-admin__direccion" title={item.ubicacion}>
                        {item.ubicacion}
                      </p>
                      <div className="averias-admin__fila-pie">
                        <span
                          className={
                            item.prioridad
                              ? `averias-admin__badge averias-admin__badge--prioridad is-${item.prioridad.toLowerCase()}`
                              : 'averias-admin__badge averias-admin__badge--vacio'
                          }
                        >
                          <span className="averias-admin__fila-etiqueta">Prioridad</span>
                          {getPrioridadLabel(item.prioridad)}
                        </span>
                        <span
                          className={
                            item.tipoAveria
                              ? 'averias-admin__badge averias-admin__badge--tipo'
                              : 'averias-admin__badge averias-admin__badge--vacio'
                          }
                        >
                          <span className="averias-admin__fila-etiqueta">Tipo</span>
                          {getTipoAveriaDetailLabel(item.tipoAveria)}
                        </span>
                        {esPendienteDeAtencion(String(item.estado)) &&
                        item.fontanero != null ? (
                          <span className="averias-admin__fila-aviso">
                            Atención no iniciada
                          </span>
                        ) : null}
                        <p className="averias-admin__detalle" title={item.descripcion}>
                          {item.descripcion}
                        </p>
                      </div>
                    </div>
                    <div className="averias-admin__fila-accion">
                      {detailAction(item.id)}
                    </div>
                  </article>
                </td>
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
            {esPendienteDeAtencion(String(item.estado)) && item.fontanero != null ? (
              <p className="averias-admin__estado-note">Atención no iniciada</p>
            ) : null}
            <dl className="averias-admin__card-meta averias-admin__card-meta--listado">
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
