import type { ReactNode } from 'react'
import type { ActividadFontaneroRegistrada } from '../types/actividadFontaneroApi'
import { listDatosEspecificosDetalle } from '../utils/formatDatosEspecificosDetalle'
import { formatActividadEstado } from '../utils/formatActividadEstado'
import { formatActividadFecha } from '../utils/formatActividadFecha'

type DetalleActividadProps = {
  actividad: ActividadFontaneroRegistrada | null
  loading?: boolean
  error?: string | null
  showFontanero?: boolean
  onBack?: () => void
  backLabel?: string
  actions?: ReactNode
}

const documentoUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path
  const apiBase = import.meta.env?.VITE_API_URL ?? 'http://localhost:3000/api/v1'
  try {
    return new URL(path.replace(/^\/+/, ''), `${new URL(apiBase).origin}/`).toString()
  } catch {
    return path
  }
}

const revisionLabel = (actividad: ActividadFontaneroRegistrada) =>
  actividad.estadoRevision === 'REVISADA' || actividad.estado === 'REVISADA'
    ? 'Revisada'
    : 'Pendiente'

const DetalleActividad = ({
  actividad,
  loading = false,
  error = null,
  showFontanero = false,
  onBack,
  backLabel = 'Volver',
  actions,
}: DetalleActividadProps) => {
  const datos = listDatosEspecificosDetalle(actividad?.datosEspecificos)

  if (loading) {
    return <div className="detalle-actividad__state" role="status" aria-busy="true">Cargando detalle…</div>
  }

  if (error || !actividad) {
    return (
      <div className="detalle-actividad__state detalle-actividad__state--error" role="alert">
        <p>{error || 'No se encontró la actividad solicitada.'}</p>
        {onBack ? <button type="button" onClick={onBack}>{backLabel}</button> : null}
      </div>
    )
  }

  const revisada = revisionLabel(actividad) === 'Revisada'

  return (
    <article className="detalle-actividad actividades-fontanero-historial-detalle__panel" aria-labelledby="detalle-actividad-title">
      <header className="detalle-actividad__header">
        <div>
          <span className="detalle-actividad__eyebrow">Actividad #{actividad.id}</span>
          <h2 id="detalle-actividad-title">{actividad.titulo}</h2>
          <p>{actividad.tipoActividadNombre || 'Sin tipo definido'}</p>
        </div>
        <div className="detalle-actividad__badges">
          <span data-estado={actividad.estado}>{formatActividadEstado(actividad.estado)}</span>
          <span className={revisada ? 'is-reviewed' : 'is-pending'}>{revisionLabel(actividad)}</span>
        </div>
      </header>

      <section className="detalle-actividad__section">
        <h3>Información general</h3>
        <dl className="detalle-actividad__grid">
          <div><dt>Tipo</dt><dd>{actividad.tipoActividadNombre || '—'}</dd></div>
          <div><dt>Fecha</dt><dd>{formatActividadFecha(actividad.fechaActividad)}</dd></div>
          {showFontanero ? <div><dt>Fontanero</dt><dd>{actividad.fontaneroNombre || actividad.fontaneroId || 'Sin identificar'}</dd></div> : null}
          <div><dt>Estado operativo</dt><dd>{formatActividadEstado(actividad.estado)}</dd></div>
          <div><dt>Estado de revisión</dt><dd>{revisionLabel(actividad)}</dd></div>
          {actividad.fechaRegistro || actividad.createdAt ? <div><dt>Fecha de registro</dt><dd>{new Date(actividad.fechaRegistro || actividad.createdAt).toLocaleString('es-CR')}</dd></div> : null}
          {revisada && actividad.fechaRevision ? <div><dt>Fecha de revisión</dt><dd>{new Date(actividad.fechaRevision).toLocaleString('es-CR')}</dd></div> : null}
          {revisada && actividad.revisadoPorId ? <div><dt>Revisada por</dt><dd>{actividad.revisadoPorId}</dd></div> : null}
        </dl>
      </section>

      {actividad.descripcion || actividad.ubicacion ? <section className="detalle-actividad__section"><h3>Datos de la actividad</h3><dl className="detalle-actividad__grid">{actividad.descripcion ? <div><dt>Descripción</dt><dd>{actividad.descripcion}</dd></div> : null}{actividad.ubicacion ? <div><dt>Ubicación</dt><dd>{actividad.ubicacion}</dd></div> : null}</dl></section> : null}

      {datos.length ? <section className="detalle-actividad__section"><h3>Datos específicos</h3><dl className="detalle-actividad__grid">{datos.map((dato) => <div key={dato.label}><dt>{dato.label}</dt><dd>{dato.value}</dd></div>)}</dl></section> : null}

      <section className="detalle-actividad__section"><h3>Observaciones</h3><p>{actividad.observaciones || 'Sin observaciones.'}</p></section>

      {actividad.observacionCorreccion ? <section className="detalle-actividad__section detalle-actividad__correction" role="note"><h3>Corrección solicitada</h3><p>{actividad.observacionCorreccion}</p></section> : null}

      <section className="detalle-actividad__section"><h3>Documentos adjuntos</h3>{actividad.documentos?.length ? <ul className="detalle-actividad__documents">{actividad.documentos.map((documento) => <li key={documento.id}><div><strong>{documento.nombreOriginal}</strong><small>{Math.max(1, Math.ceil(documento.tamanio / 1024))} KB</small></div><a href={documentoUrl(documento.rutaReferenciaArchivo)} target="_blank" rel="noreferrer">Ver documento</a></li>)}</ul> : <p>Sin documentos adjuntos.</p>}</section>

      {onBack || actions ? <footer className="detalle-actividad__actions">{onBack ? <button type="button" onClick={onBack}>{backLabel}</button> : null}{actions}</footer> : null}
    </article>
  )
}

export default DetalleActividad
