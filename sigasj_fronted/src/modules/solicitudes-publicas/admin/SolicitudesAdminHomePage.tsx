import { useEffect, useState } from 'react'
import {
  IconArrowRight,
  IconClipboardList,
  IconDownload,
  IconFiles,
  type Icon,
} from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { AdminShell, PageHeader } from '../../../shared/ui'
import { getSolicitudesAdmin } from './solicitudesAdminApi'
import {
  FORMULARIOS_DESCARGABLES_ADMIN_PATH,
  FORMULARIOS_OFICIALES_ADMIN_PATH,
  SOLICITUDES_ADMIN_TRAMITES_PATH,
} from './solicitudesAdminPaths'

type SecondarySection = {
  title: string
  description: string
  action: string
  path: string
  icon: Icon
}

const secondarySections: SecondarySection[] = [
  {
    title: 'Formularios oficiales',
    description: 'PDF vigente de cada trámite digital.',
    action: 'Administrar oficiales',
    path: FORMULARIOS_OFICIALES_ADMIN_PATH,
    icon: IconFiles,
  },
  {
    title: 'Formularios descargables',
    description: 'Documentos extras para Otros formularios.',
    action: 'Gestionar descargas',
    path: FORMULARIOS_DESCARGABLES_ADMIN_PATH,
    icon: IconDownload,
  },
]

const ESTADOS_EN_TRAMITE = ['PENDIENTE', 'EN_REVISION'] as const

const SolicitudesAdminHomePage = () => {
  const [tramitesAbiertos, setTramitesAbiertos] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const results = await Promise.all(
          ESTADOS_EN_TRAMITE.map((estado) =>
            getSolicitudesAdmin({ search: '', estado, tipo: '', page: 1 }),
          ),
        )
        if (cancelled) return
        setTramitesAbiertos(
          results.reduce((sum, item) => sum + (item.total ?? 0), 0),
        )
      } catch {
        if (!cancelled) setTramitesAbiertos(null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const metricLabel =
    tramitesAbiertos === null
      ? 'Bandeja operativa'
      : tramitesAbiertos === 1
        ? '1 solicitud abierta'
        : `${tramitesAbiertos} solicitudes abiertas`

  return (
    <AdminShell
      className="solicitudes-admin-home gap-7"
      aria-labelledby="solicitudes-admin-home-title"
    >
      <PageHeader
        id="solicitudes-admin-home-title"
        title="Solicitudes"
        description="Trámites, formularios oficiales y documentos descargables del sitio."
      />

      <section
        aria-labelledby="solicitudes-secciones-title"
        className="grid gap-5"
      >
        <h2 className="sr-only" id="solicitudes-secciones-title">
          Secciones de administración
        </h2>

        <Link
          className="landing-lift-card group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-[13px] border border-sigasj-border bg-white p-7 text-inherit no-underline shadow-[0_4px_14px_rgba(30,90,156,0.05)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sigasj-primary/40 motion-reduce:transform-none motion-reduce:transition-none max-[640px]:min-h-0 max-[640px]:p-6"
          to={SOLICITUDES_ADMIN_TRAMITES_PATH}
        >
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-[42%] bg-[linear-gradient(120deg,transparent_0%,color-mix(in_srgb,var(--asada-ice,#eaf6ff)_72%,transparent)_100%)] max-[680px]:hidden"
            aria-hidden="true"
          />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-[color:var(--asada-ice,#eaf6ff)] text-[color:var(--asada-navy,#1e5a9c)]">
              <IconClipboardList size={28} stroke={1.9} aria-hidden="true" />
            </span>
            <span className="rounded-full border border-[color:var(--asada-line,#d7e5f1)] bg-white/90 px-3.5 py-1.5 text-sm font-bold text-[color:var(--asada-ink,#123f70)]">
              {metricLabel}
            </span>
          </div>
          <div className="relative mt-8 max-w-2xl">
            <h3 className="m-0 text-[clamp(1.55rem,2.4vw,2rem)] font-black tracking-[-0.03em] text-[color:var(--asada-ink,#123f70)]">
              Trámites digitales
            </h3>
            <p className="mb-0 mt-3 text-base leading-7 text-[color:var(--asada-muted,#5b7390)]">
              Revise solicitudes, abra el detalle y actualice el estado de cada
              trámite.
            </p>
          </div>
          <span className="landing-lift-button landing-lift-button--solid relative mt-8 inline-flex min-h-11 w-fit items-center gap-2 rounded-[10px] bg-sigasj-primary px-5 font-semibold text-white shadow-[0_8px_18px_rgba(30,90,156,0.22)]">
            Gestionar solicitudes
            <IconArrowRight size={18} aria-hidden="true" />
          </span>
        </Link>

        <div className="grid grid-cols-2 gap-5 max-[680px]:grid-cols-1">
          {secondarySections.map(
            ({ title, description, action, path, icon: SectionIcon }) => (
              <Link
                className="landing-lift-card group flex min-h-[180px] flex-col rounded-[13px] border border-sigasj-border bg-white p-6 text-inherit no-underline shadow-[0_4px_14px_rgba(30,90,156,0.05)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sigasj-primary/40 motion-reduce:transform-none motion-reduce:transition-none"
                key={path}
                to={path}
              >
                <span className="grid size-12 place-items-center rounded-xl bg-[color:var(--asada-ice,#eaf6ff)] text-[color:var(--asada-navy,#1e5a9c)]">
                  <SectionIcon size={24} stroke={1.9} aria-hidden="true" />
                </span>
                <h3 className="mb-0 mt-5 text-[1.2rem] font-black tracking-[-0.025em] text-[color:var(--asada-ink,#123f70)]">
                  {title}
                </h3>
                <p className="mb-5 mt-2 flex-1 text-sm leading-6 text-[color:var(--asada-muted,#5b7390)]">
                  {description}
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-sigasj-primary">
                  {action}
                  <IconArrowRight
                    className="transition-transform duration-350 group-hover:translate-x-1 motion-reduce:transform-none"
                    size={16}
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ),
          )}
        </div>
      </section>
    </AdminShell>
  )
}

export default SolicitudesAdminHomePage