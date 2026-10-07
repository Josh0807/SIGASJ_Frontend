import { Link, Navigate } from 'react-router-dom'
import { IconArrowLeft } from '@tabler/icons-react'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { ADMIN_BASE_PATH } from '../../../app/router/adminPaths'
import { useFontaneroAverias } from '../hooks/useFontaneroAverias'
import AveriaStatusBadge from '../admin/AveriaStatusBadge'
import { formatAveriaAdminDateTime } from '../admin/formatAveriaAdminDate'
import { esPendienteDeAtencion } from '../utils/averiaPendienteAtencion'
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

export type AveriasFontaneroListPageProps = {
  items?: AveriaFontaneroListItem[]
  loading?: boolean
  error?: string | null
  unauthorized?: boolean
  forbidden?: boolean
}

const AveriasFontaneroListPage = ({
  items: itemsProp,
  loading: loadingProp,
  error: errorProp,
  unauthorized: unauthorizedProp,
  forbidden: forbiddenProp,
}: AveriasFontaneroListPageProps) => {
  const remoteEnabled =
    itemsProp === undefined &&
    loadingProp === undefined &&
    errorProp === undefined &&
    unauthorizedProp === undefined &&
    forbiddenProp === undefined
  const remote = useFontaneroAverias({ enabled: remoteEnabled })

  if (unauthorizedProp ?? remote.unauthorized) {
    return <Navigate to={LOGIN_ROUTE_PATH} replace />
  }

  const items = itemsProp ?? remote.items
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
            <ul className="averias-admin__cards averias-fontanero__list">
              {items.map((item) => (
                <li className="averias-admin__card averias-fontanero__item" key={item.id}>
                  <header className="averias-fontanero__item-head">
                    <div className="averias-fontanero__item-identidad">
                      <span className="averias-admin__codigo">
                        {item.codigoSeguimiento}
                      </span>
                      <AveriaStatusBadge estado={item.estado} />
                      {esPendienteDeAtencion(String(item.estado)) ? (
                        <p className="averias-admin__estado-note averias-fontanero__nota">
                          {AVERIAS_FONTANERO_ATENCION_NO_INICIADA}
                        </p>
                      ) : null}
                    </div>
                    <Link
                      className="gallery-admin__button averias-fontanero__detail-link"
                      to={averiasFontaneroDetailPath(item.id)}
                    >
                      Ver detalle
                    </Link>
                  </header>
                  <dl className="averias-admin__card-meta averias-fontanero__meta">
                    <div>
                      <dt>Asignación</dt>
                      <dd>{formatAveriaAdminDateTime(item.fechaAsignacion)}</dd>
                    </div>
                    <div>
                      <dt>Sector</dt>
                      <dd>{item.sectorComunidad}</dd>
                    </div>
                    <div>
                      <dt>Prioridad</dt>
                      <dd>{getFontaneroPrioridadLabel(item.prioridad)}</dd>
                    </div>
                    <div>
                      <dt>Tipo</dt>
                      <dd>{getFontaneroTipoLabel(item.tipoAveria)}</dd>
                    </div>
                    <div className="averias-fontanero__meta-wide">
                      <dt>Ubicación</dt>
                      <dd>{item.ubicacion}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default AveriasFontaneroListPage
