import {
  IconClipboardList,
  IconFileSearch,
  IconReceipt,
  IconTool,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  RECEIPT_QUERY_ROUTE_PATH,
  REPORTAR_AVERIA_ROUTE_PATH,
  REQUEST_TRACKING_ROUTE_PATH,
} from '../../../app/router/routePaths'
import Card from '../../../shared/ui/Card'
import SectionHeader from '../../../shared/ui/SectionHeader'

type QuickAccessItem = {
  id: string
  title: string
  description: string
  href: string
  icon: ReactNode
  external?: boolean
}

const items: QuickAccessItem[] = [
  {
    id: 'recibo',
    title: 'Consultar recibo',
    description: 'Revise la información de su recibo de agua en línea.',
    href: RECEIPT_QUERY_ROUTE_PATH,
    icon: <IconReceipt size={20} stroke={1.85} aria-hidden="true" />,
  },
  {
    id: 'solicitud',
    title: 'Solicitar un servicio',
    description: 'Inicie trámites y formularios oficiales de la ASADA.',
    href: '#solicitudes-servicio',
    icon: <IconClipboardList size={20} stroke={1.85} aria-hidden="true" />,
  },
  {
    id: 'averia',
    title: 'Reportar una avería',
    description: 'Informe fugas, daños u otras fallas del servicio.',
    href: REPORTAR_AVERIA_ROUTE_PATH,
    icon: <IconTool size={20} stroke={1.85} aria-hidden="true" />,
  },
  {
    id: 'seguimiento',
    title: 'Dar seguimiento',
    description: 'Consulte el avance de su solicitud con el código recibido.',
    href: REQUEST_TRACKING_ROUTE_PATH,
    icon: <IconFileSearch size={20} stroke={1.85} aria-hidden="true" />,
  },
]

const QuickAccessSection = () => (
  <section
    id="accesos-rapidos"
    className="public-section public-section--canvas"
    aria-labelledby="accesos-rapidos-title"
  >
    <div className="public-container">
      <SectionHeader
        id="accesos-rapidos-title"
        title="¿Qué necesita hacer hoy?"
        description="Accesos directos a los trámites y consultas más frecuentes de la comunidad."
      />

      <ul className="mt-8 m-0 grid list-none grid-cols-4 gap-4 p-0 max-[1024px]:grid-cols-2 max-[520px]:grid-cols-1">
        {items.map((item) => {
          const isHash = item.href.startsWith('#')
          const content = (
            <>
              <span className="grid size-11 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary">
                {item.icon}
              </span>
              <h3 className="mb-0 mt-4 font-sigasj-display text-lg font-bold text-sigasj-text">
                {item.title}
              </h3>
              <p className="mb-0 mt-2 flex-1 text-sm leading-6 text-sigasj-muted">
                {item.description}
              </p>
              <span className="mt-4 text-sm font-semibold text-sigasj-primary">
                Ir ahora
              </span>
            </>
          )

          return (
            <li key={item.id} className="min-w-0">
              <Card interactive className="h-full p-5">
                {isHash ? (
                  <a
                    href={item.href}
                    className="flex h-full min-h-[11rem] flex-col text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sigasj-primary"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    to={item.href}
                    className="flex h-full min-h-[11rem] flex-col text-inherit no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sigasj-primary"
                  >
                    {content}
                  </Link>
                )}
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  </section>
)

export default QuickAccessSection
