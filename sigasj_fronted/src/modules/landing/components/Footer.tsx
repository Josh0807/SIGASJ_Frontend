import { anioEnAsada } from '../../../shared/utils/fechaAsada'
import { IconClock, IconMapPin } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'
import facebookLogo from '../../../assets/LogoFacebook.avif'
import whatsappLogo from '../../../assets/LogoWhatsApp.png'
import { usePublicContacto } from '../hooks/usePublicContacto'

const Footer = () => {
  const currentYear = anioEnAsada()
  const { contacto } = usePublicContacto()

  return (
    <footer
      data-ui="footer"
      className="public-footer w-full min-w-0 border-t border-white/10 bg-sigasj-footer text-white"
    >
      <div className="public-container grid grid-cols-3 gap-8 py-10 max-[900px]:grid-cols-1 max-[900px]:gap-8">
        <div>
          <div className="flex items-center gap-3">
            <img
              className="size-14 rounded-full border border-white/20 object-cover"
              src={asadaLogo}
              alt="Logo de la ASADA San Juan de Santa Cruz"
            />
            <div>
              <strong className="block font-sigasj-display text-xl font-bold">SIGASJ</strong>
              <span className="text-sm text-white/75">ASADA San Juan de Santa Cruz</span>
            </div>
          </div>
          <p className="mb-0 mt-4 text-sm leading-6 text-white/70">
            Plataforma institucional para consulta, trámites y atención a la comunidad.
          </p>
        </div>

        <div>
          <h2 className="m-0 font-sigasj-display text-base font-bold">Navegación</h2>
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

        <div>
          <h2 className="m-0 font-sigasj-display text-base font-bold">Contacto</h2>
          <address className="mt-4 grid gap-3 text-sm not-italic text-white/80">
            <span className="flex items-start gap-2">
              <IconMapPin className="mt-0.5 shrink-0" size={18} stroke={1.85} aria-hidden="true" />
              {contacto.direccion || 'San Juan de Santa Cruz, Guanacaste'}
            </span>
            <span className="flex items-start gap-2">
              <IconClock className="mt-0.5 shrink-0" size={18} stroke={1.85} aria-hidden="true" />
              {contacto.horarioAtencion || 'Lunes a sábado de 7:30 a.m. – 11:30 a.m.'}
            </span>
          </address>
          <div className="mt-5 flex flex-wrap gap-4">
            <a
              className="inline-flex items-center gap-2 text-sm text-white no-underline hover:opacity-90"
              href="https://www.facebook.com/share/14kJoKE9tLm/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img className="size-8 rounded-full bg-white object-contain p-1" src={facebookLogo} alt="" aria-hidden="true" />
              Facebook
            </a>
            <a
              className="inline-flex items-center gap-2 text-sm text-white no-underline hover:opacity-90"
              href="https://wa.me/50685607584"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img className="size-8 rounded-full bg-white object-contain p-1" src={whatsappLogo} alt="" aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 px-5 py-4 text-center">
        <p className="m-0 text-[13px] text-white/65">
          © {currentYear} ASADA San Juan de Santa Cruz. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer
