import { IconAlertCircle, IconArrowRight, IconInfoCircle } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { usePublicAnnouncements } from '../../comunicados/hooks/usePublicAnnouncements'
import { ANNOUNCEMENTS_HREF } from '../config/landingAnchors'

/**
 * Franja informativa post-Hero. Usa comunicados reales del Backend:
 * prioriza urgentes; si no hay, el más reciente.
 */
const InstitutionalNoticeSection = () => {
  const { status, announcements } = usePublicAnnouncements(true)

  if (status === 'loading' || status === 'error' || announcements.length === 0) {
    return null
  }

  const featured =
    announcements.find((item) => item.urgent) ?? announcements[0]

  if (!featured?.title?.trim()) {
    return null
  }

  const summary =
    featured.summary?.trim() ||
    featured.content?.trim() ||
    'Consulte el comunicado completo en la sección de comunicados.'

  const isUrgent = Boolean(featured.urgent)
  const detailHref = featured.moreHref?.trim() || ANNOUNCEMENTS_HREF
  const isInternalHash = detailHref.startsWith('#')
  const isInternalPath = detailHref.startsWith('/')

  return (
    <section
      id="aviso-institucional"
      className="border-y border-sigasj-border bg-white"
      aria-labelledby="aviso-institucional-title"
    >
      <div className="public-container flex flex-wrap items-start gap-4 py-4 max-[640px]:gap-3">
        <span
          className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-[10px] bg-sigasj-surface text-sigasj-primary"
          aria-hidden="true"
        >
          {isUrgent ? (
            <IconAlertCircle size={20} stroke={1.85} />
          ) : (
            <IconInfoCircle size={20} stroke={1.85} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.12em] text-sigasj-primary">
            {isUrgent ? 'Aviso importante' : 'Aviso institucional'}
          </p>
          <h2
            id="aviso-institucional-title"
            className="mt-1 font-sigasj-display text-base font-bold leading-snug text-sigasj-text max-[640px]:text-[15px]"
          >
            {featured.title.trim()}
          </h2>
          <p className="mb-0 mt-1 line-clamp-2 text-sm leading-6 text-sigasj-muted">
            {summary}
          </p>
        </div>

        {isInternalPath ? (
          <Link
            to={detailHref}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold text-sigasj-primary no-underline transition-colors duration-150 hover:bg-sigasj-surface"
          >
            Ver detalle
            <IconArrowRight size={18} stroke={1.9} aria-hidden="true" />
          </Link>
        ) : (
          <a
            href={isInternalHash ? detailHref : detailHref}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold text-sigasj-primary no-underline transition-colors duration-150 hover:bg-sigasj-surface"
            {...(!isInternalHash
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
          >
            Ver comunicados
            <IconArrowRight size={18} stroke={1.9} aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  )
}

export default InstitutionalNoticeSection
