type ProjectsPreviewProps = {
  id?: string
  title?: string
}

const ProjectsPreview = ({
  id = 'proyectos',
  title = 'Proyectos destacados',
}: ProjectsPreviewProps) => (
  <section
    className="landing-section projects-preview"
    id={id}
    aria-labelledby={`${id}-title`}
  >
    <div className="projects-preview__content">
      <p className="projects-preview__eyebrow">Proyectos</p>
      <h2 id={`${id}-title`}>{title}</h2>
      <p>
        Próximamente encontrarás aquí un resumen de los proyectos futuros y obras
        destacadas de la ASADA San Juan de Santa Cruz.
      </p>
    </div>
  </section>
)

export default ProjectsPreview
