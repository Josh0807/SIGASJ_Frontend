import { Link, Navigate } from 'react-router-dom'
import { IconArrowLeft } from '@tabler/icons-react'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { ADMIN_BASE_PATH } from '../../../app/router/adminPaths'
import AdminNavIcon from '../../admin-panel/components/AdminNavIcon'
import { useFontaneroAverias } from '../hooks/useFontaneroAverias'
import AveriaStatusBadge from '../admin/AveriaStatusBadge'
import { formatAveriaAdminDateTime } from '../admin/formatAveriaAdminDate'
import { agruparColaFontanero } from './colaFontanero'
import {
  MENSAJE_PENDIENTE_HORARIO_FONTANERO,
  esPendienteDeAtencion,
  mostrarAvisoHorarioFontanero,
} from '../utils/averiaPendienteAtencion'
import {
  FONTANERO_AVERIAS_TITLE,
  averiasFontaneroDetailPath,
} from './averiasFontaneroPaths'
import {
  getFontaneroPrioridadLabel,
  getFontaneroTipoLabel,
} from './fontaneroAveriaPresentation'
import {
  AVERIAS_FONTANERO_ATENCION_NO_INICIADA,
  AVERIAS_FONTANERO_DETAIL_FORBIDDEN,
  AVERIAS_FONTANERO_LIST_EMPTY,
  AVERIAS_FONTANERO_LIST_ERROR,
  AVERIAS_FONTANERO_LIST_LOADING,
  type AveriaFontaneroListItem,
} from './types'

const prioridadTono = (prioridad: string | null | undefined): string => {
  const valor = prioridad?.trim().toUpperCase()
  if (valor === 'ALTA') return 'alta'
  if (valor === 'MEDIA') return 'media'
  if (valor === 'BAJA') return 'baja'
  return 'sin'
}

export type AveriasFontaneroListPageProps = {
  items?: AveriaFontaneroListItem[]
  dentroDeHorario?: boolean
  loading?: boolean
  error?: string | null
  unauthorized?: boolean
  forbidden?: boolean
}

const AveriasFontaneroListPage = ({
  items: itemsProp,
  dentroDeHorario: dentroDeHorarioProp,
  loading: loadingProp,
  error: errorProp,
  unauthorized: unauthorizedProp,
  forbidden: forbiddenProp,
}: AveriasFontaneroListPageProps) => {
  const remoteEnabled =
    itemsProp === undefined &&
    dentroDeHorarioProp === undefined &&
    loadingProp === undefined &&
    errorProp === undefined &&
    unauthorizedProp === undefined &&
    forbiddenProp === undefined
  const remote = useFontaneroAverias({ enabled: remoteEnabled })

  if (unauthorizedProp ?? remote.unauthorized) {
    return <Navigate to={LOGIN_ROUTE_PATH} replace />
  }

  const items = itemsProp ?? remote.items
  const dentroDeHorario = dentroDeHorarioProp ?? remote.dentroDeHorario
  const grupos = agruparColaFontanero(items)
  const loading = loadingProp ?? remote.loading
  const error = errorProp === undefined ? remote.error : errorProp
  const forbidden = forbiddenProp ?? remote.forbidden

  return (
    <main className="gallery-admin averias-admin averias-fontanero w-full min-w-0">
      <div className="gallery-admin__shell sigasj-stack !gap-8 font-sans">
        <header className="gallery-admin__header !flex !min-h-[220px] !items-center !rounded-[26px] !border-sky-100 !bg-white !p-8 !shadow-[0_14px_38px_rgba(30,90,156,0.08)]">
          <div>
            <p className="gallery-admin__eyebrow !mb-4 !text-sm !font-extrabold !uppercase !tracking-[0.12em] !text-blue-600">Atención de campo</p>
            <h1 className="!m-0 !text-[clamp(1.75rem,3vw,2.25rem)] !font-black !leading-tight !tracking-[-0.025em] !text-[#062e63]">{FONTANERO_AVERIAS_TITLE}</h1>
          </div>
          <Link className="group !inline-flex !min-h-12 !items-center !justify-center !gap-2 !rounded-2xl !border !border-blue-200 !bg-white !px-5 !font-extrabold !text-blue-700 !no-underline !shadow-[0_8px_20px_rgba(37,99,235,0.13)] !transition-all !duration-300 !ease-out hover:!-translate-y-1 hover:!scale-[1.02] hover:!border-blue-400 hover:!bg-blue-50 hover:!text-blue-800 hover:!shadow-[0_14px_28px_rgba(37,99,235,0.22)] active:!translate-y-0 active:!scale-[0.97] focus-visible:!outline-2 focus-visible:!outline-offset-4 focus-visible:!outline-blue-600 motion-reduce:!transform-none motion-reduce:!transition-none" to={`${ADMIN_BASE_PATH}/dashboard`}>
            <IconArrowLeft className="!transition-transform !duration-300 group-hover:!-translate-x-1.5 motion-reduce:!transform-none" size={19} aria-hidden="true" />
            Volver al dashboard
          </Link>
        </header>
        <section
          className="averias-admin__section !rounded-[26px] !border-sky-100 !bg-white !p-8 !shadow-[0_14px_38px_rgba(30,90,156,0.08)]"
          aria-labelledby="averias-fontanero-list-heading"
        >
          <h2 className="!m-0 !border-b !border-slate-100 !pb-5 !text-xl !font-extrabold !tracking-[-0.015em] !text-[#062e63]" id="averias-fontanero-list-heading">Averías asignadas</h2>
          {forbidden ? (
            <p className="gallery-admin__empty" role="alert">
              {AVERIAS_FONTANERO_DETAIL_FORBIDDEN}
            </p>
          ) : loading && items.length === 0 ? (
            <p className="gallery-admin__empty" role="status" aria-busy="true">
              {AVERIAS_FONTANERO_LIST_LOADING}
            </p>
          ) : error ? (
            <div className="gallery-admin__empty" role="alert">
              <p>{error || AVERIAS_FONTANERO_LIST_ERROR}</p>
              <button
                className="gallery-admin__button"
                type="button"
                onClick={remote.refetch}
              >
                Intentar nuevamente
              </button>
            </div>
          ) : items.length === 0 ? (
            <p className="gallery-admin__empty !mt-5 !min-h-[120px] !rounded-[22px] !border !border-dashed !border-blue-200 !bg-linear-to-br !from-blue-50 !to-sky-50 !text-lg !font-normal !text-slate-500 !shadow-inner" role="status">
              {AVERIAS_FONTANERO_LIST_EMPTY}
            </p>
          ) : (
            <div className="averias-fontanero__grupos">
              {grupos.map((grupo) => (
                <section key={grupo.id} aria-labelledby={`averias-fontanero-grupo-${grupo.id}`}>
                  <h3 id={`averias-fontanero-grupo-${grupo.id}`}>{grupo.titulo}</h3>
                  <ul className="averias-fontanero__tarjetas">
                    {grupo.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          className={`averias-fontanero__tarjeta averias-fontanero__tarjeta--${prioridadTono(item.prioridad)}`}
                          to={averiasFontaneroDetailPath(item.id)}
                          aria-label={`Ver detalle de la avería ${item.codigoSeguimiento}`}
                        >
                          <span className="averias-fontanero__tarjeta-icono" aria-hidden="true">
                            <AdminNavIcon name="averias" />
                          </span>
                          <div className="averias-fontanero__tarjeta-contenido">
                            <div className="averias-fontanero__tarjeta-titulo">
                              <h4>{item.codigoSeguimiento}</h4>
                              <AveriaStatusBadge estado={item.estado} />
                            </div>
                            <p className="averias-fontanero__tarjeta-sub">
                              <span>Asignada el {formatAveriaAdminDateTime(item.fechaAsignacion)}</span>
                              <span aria-hidden="true">·</span>
                              <strong>{item.sectorComunidad}</strong>
                            </p>
                            <p className="averias-fontanero__tarjeta-ubicacion" title={item.ubicacion}>
                              {item.ubicacion}
                            </p>
                            <ul className="averias-fontanero__tarjeta-datos">
                              <li>
                                <span>Prioridad</span>
                                {getFontaneroPrioridadLabel(item.prioridad)}
                              </li>
                              <li>
                                <span>Tipo</span>
                                {getFontaneroTipoLabel(item.tipoAveria)}
                              </li>
                              {mostrarAvisoHorarioFontanero(String(item.estado), dentroDeHorario) ? (
                                <li className="averias-fontanero__tarjeta-nota">
                                  {MENSAJE_PENDIENTE_HORARIO_FONTANERO}
                                </li>
                              ) : esPendienteDeAtencion(String(item.estado)) ? (
                                <li className="averias-fontanero__tarjeta-nota">
                                  {AVERIAS_FONTANERO_ATENCION_NO_INICIADA}
                                </li>
                              ) : null}
                            </ul>
                          </div>
                          <span className="averias-fontanero__tarjeta-flecha" aria-hidden="true">
                            Ver detalle
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  </section>
                ))}
              </div>
            )}
        </section>
      </div>
    </main>
  )
}

export default AveriasFontaneroListPage
