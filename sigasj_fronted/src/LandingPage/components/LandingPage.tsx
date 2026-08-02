import Header from './Header'
import Footer from './Footer'

const sections = [
  { id: 'sobre-nosotros', title: 'Sobre nosotros' },
  { id: 'comunicados', title: 'Comunicados' },
  { id: 'reporte-averias', title: 'Reporte de averías' },
  { id: 'proyectos', title: 'Proyectos' },
  { id: 'contacto', title: 'Contacto' },
]

const LandingPage = () => (
  <>
    <Header />
    <main>
      <section id="inicio" className="hero" aria-labelledby="hero-title">
        <p className="hero__eyebrow">ASADA San Juan de Santa Cruz</p>
        <h1 id="hero-title">Gestión de agua al servicio de nuestra comunidad</h1>
        <p>Información, proyectos y atención en un mismo lugar.</p>
      </section>

      {sections.map(({ id, title }) => (
        <section className="landing-section" id={id} key={id} aria-labelledby={`${id}-title`}>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>Próximamente encontrarás aquí la información de esta sección.</p>
        </section>
      ))}
    </main>
    <Footer />
  </>
)

export default LandingPage
