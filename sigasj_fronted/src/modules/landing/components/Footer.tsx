import { IconArrowRight, IconClock, IconMapPin, IconShare } from '@tabler/icons-react'
import asadaLogo from '../../../assets/ASADA LOGO.jpeg'
import facebookLogo from '../../../assets/LogoFacebook.avif'
import whatsappLogo from '../../../assets/LogoWhatsApp.png'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="sigasj-footer relative isolate w-full min-w-0 overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#1763a5_0%,#07447f_42%,#032e61_100%)] text-white">
      <div className="sigasj-footer-wave sigasj-footer-wave--one" aria-hidden="true" />
      <div className="sigasj-footer-wave sigasj-footer-wave--two" aria-hidden="true" />
      <span className="sigasj-footer-drop sigasj-footer-drop--one" aria-hidden="true" />
      <span className="sigasj-footer-drop sigasj-footer-drop--two" aria-hidden="true" />
      <span className="sigasj-footer-drop sigasj-footer-drop--three" aria-hidden="true" />
      <div className="footer__content sigasj-footer-content relative z-10 mx-auto grid w-full max-w-[980px] grid-cols-[0.9fr_1.45fr_0.9fr] gap-7 px-6 py-8 max-[900px]:grid-cols-1 max-[900px]:gap-6 max-[640px]:px-5">
        <div className="sigasj-footer-brand flex flex-col items-center justify-center text-center">
          <img className="size-28 rounded-full border-4 border-white object-cover shadow-[0_10px_30px_rgba(0,0,0,0.2)]" src={asadaLogo} alt="Logo de la ASADA San Juan de Santa Cruz" />
          <strong className="mt-4 text-4xl font-extrabold leading-none tracking-wide">SIGASJ</strong>
          <p className="mb-0 mt-3 text-lg text-sky-100">ASADA San Juan de Santa Cruz</p>
        </div>

        <div className="sigasj-footer-contact border-x border-sky-300/25 px-14 max-[900px]:border-x-0 max-[900px]:border-y max-[900px]:px-0 max-[900px]:py-8">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-sky-300/20 text-sky-100"><IconMapPin size={32} stroke={2.3} aria-hidden="true" /></span>
            <h2 className="m-0 text-2xl font-extrabold text-white">Contacto y Horario</h2>
          </div>
          <address className="mt-5 grid gap-4 text-base not-italic text-sky-50">
            <span className="flex items-center gap-3"><IconMapPin className="shrink-0 text-sky-300" size={23} aria-hidden="true" /> San Juan de Santa Cruz, Guanacaste</span>
            <span className="flex items-center gap-3"><IconClock className="shrink-0 text-sky-300" size={23} aria-hidden="true" /> Horario: Lunes a sábado de 7:30 a.m. – 11:30 a.m.</span>
            <a className="sigasj-footer-contact-link mt-3 inline-flex min-h-12 items-center justify-center gap-6 rounded-full border-2 border-sky-300 px-7 text-base font-semibold text-white no-underline transition hover:-translate-y-1 hover:bg-sky-400/15" href="#contacto">Ver información de contacto <IconArrowRight size={20} aria-hidden="true" /></a>
          </address>
        </div>

        <div className="sigasj-footer-social">
          <div className="mb-5 flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-sky-300/20 text-sky-100"><IconShare size={32} aria-hidden="true" /></span>
            <h2 className="m-0 text-2xl font-extrabold text-white">Redes sociales</h2>
          </div>
          <a className="sigasj-footer-social-link flex items-center gap-4 text-lg text-white no-underline" href="https://www.facebook.com/share/14kJoKE9tLm/" target="_blank" rel="noopener noreferrer">
            <img className="size-12 rounded-full bg-white object-contain p-2" src={facebookLogo} alt="" aria-hidden="true" /> Facebook
          </a>
          <a className="sigasj-footer-social-link mt-4 flex items-center gap-4 text-lg text-white no-underline" href="https://wa.me/50685607584" target="_blank" rel="noopener noreferrer">
            <img className="size-12 rounded-full bg-white object-contain p-2" src={whatsappLogo} alt="" aria-hidden="true" /> WhatsApp
          </a>
        </div>
      </div>

      <div className="sigasj-footer-bottom relative z-10 border-t border-sky-300/60 px-5 py-6 text-center">
        <p className="m-0 text-sm text-sky-100">© {currentYear} ASADA San Juan de Santa Cruz. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default Footer
