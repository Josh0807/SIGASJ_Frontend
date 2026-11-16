import { anioEnAsada } from '../../../shared/utils/fechaAsada'
import { IconClock, IconMapPin } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'
import { usePublicContacto } from '../hooks/usePublicContacto'

/** Facebook Blue oficial (#1877F2) + “f” blanca. */
const FacebookBrandIcon = () => (
  <svg viewBox="0 0 24 24" className="size-full" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path
      fill="#FFFFFF"
      d="M13.32 19.2v-6.36h2.14l.32-2.48h-2.46V8.78c0-.72.2-1.2 1.24-1.2h1.32V5.36c-.23-.03-1.02-.1-1.94-.1-1.92 0-3.24 1.17-3.24 3.32v1.86H8.5v2.48h2.2V19.2h2.62Z"
    />
  </svg>
)

/** WhatsApp Green oficial (#25D366) + glifo blanco (proporción estándar). */
const WhatsAppBrandIcon = () => (
  <svg viewBox="0 0 24 24" className="size-full" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="12" fill="#25D366" />
    <path
      fill="#FFFFFF"
      transform="translate(2.1 2.1) scale(0.825)"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"
    />
  </svg>
)

const socialLinkClassName =
  'group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-3.5 text-sm font-semibold text-white no-underline transition duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

const Footer = () => {
  const currentYear = anioEnAsada()
  const { contacto } = usePublicContacto()

  return (
    <footer
      data-ui="footer"
      className="public-footer w-full min-w-0 border-t border-white/10 bg-sigasj-footer text-white"
    >
      <div className="public-container grid grid-cols-3 gap-8 py-10 max-[900px]:grid-cols-1 max-[900px]:gap-8">
        <div data-aos="fade-up">
          <div className="flex items-center gap-3">
            <img
              className="size-14 rounded-full border border-white/20 object-cover"
              src={asadaLogo}
              alt="Logo de la ASADA San Juan de Santa Cruz"
            />
            <div>
              <strong className="public-card-title block text-white" style={{ fontSize: '1.25rem' }}>SIGASJ</strong>
              <span className="public-card-text text-white/75">ASADA San Juan de Santa Cruz</span>
            </div>
          </div>
          <p className="mb-0 mt-4 text-sm leading-6 text-white/70">
            Plataforma institucional para consulta, trámites y atención a la comunidad.
          </p>
        </div>

        <div data-aos="fade-up" data-aos-delay="80">
          <h2 className="public-card-title text-white">Navegación</h2>
          <ul className="mt-4 m-0 grid list-none gap-2 p-0 text-sm">
            <li><a className="text-white/80 no-underline hover:text-white" href="#accesos-rapidos">Accesos rápidos</a></li>
            <li><a className="text-white/80 no-underline hover:text-white" href="#solicitudes-servicio">Solicitudes</a></li>
            <li><a className="text-white/80 no-underline hover:text-white" href="#comunicados">Comunicados</a></li>
            <li><a className="text-white/80 no-underline hover:text-white" href="#transparencia">Transparencia</a></li>
            <li><a className="text-white/80 no-underline hover:text-white" href="#contacto">Contacto</a></li>
            <li>
              <Link className="text-white/80 no-underline hover:text-white" to="/login">
                Acceso administrativo
              </Link>
            </li>
          </ul>
        </div>

        <div data-aos="fade-up" data-aos-delay="140">
          <h2 className="public-card-title text-white">Contacto</h2>
          <address className="mt-4 grid gap-3 text-sm not-italic text-white/80">
            <span className="flex min-w-0 items-start gap-2">
              <IconMapPin className="mt-0.5 shrink-0" size={18} stroke={1.85} aria-hidden="true" />
              <span className="min-w-0 break-words">
                {contacto.direccion || 'San Juan de Santa Cruz, Guanacaste'}
              </span>
            </span>
            <span className="flex min-w-0 items-start gap-2">
              <IconClock className="mt-0.5 shrink-0" size={18} stroke={1.85} aria-hidden="true" />
              <span className="min-w-0 break-words">
                {contacto.horarioAtencion || 'Lunes a sábado de 7:30 a.m. – 11:30 a.m.'}
              </span>
            </span>
          </address>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              className={socialLinkClassName}
              href="https://www.facebook.com/share/14kJoKE9tLm/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook de la ASADA San Juan (se abre en una pestaña nueva)"
            >
              <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.25)]">
                <FacebookBrandIcon />
              </span>
              Facebook
            </a>
            <a
              className={socialLinkClassName}
              href="https://wa.me/50685607584"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp de la ASADA San Juan (se abre en una pestaña nueva)"
            >
              <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.25)]">
                <WhatsAppBrandIcon />
              </span>
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 px-5 py-4 text-center" data-aos="fade-up" data-aos-delay="60">
        <p className="public-caption m-0 text-white/65">
          © {currentYear} ASADA San Juan de Santa Cruz. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer
