import { IconDroplet, IconEye, IconFileDescription } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import asadaPhoto from '../../../assets/FOTOASADA.webp'
import SectionHeader from '../../../shared/ui/SectionHeader'
import Card from '../../../shared/ui/Card'

const IdentityIcon = ({ children }: { children: ReactNode }) => (
  <span
    className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-sigasj-surface-soft text-sigasj-primary"
    aria-hidden="true"
  >
    {children}
  </span>
)

const AboutSection = () => (
  <section
    id="sobre-nosotros"
    className="public-section public-section--surface"
    aria-labelledby="sobre-nosotros-title"
  >
    <div className="public-container">
      <SectionHeader
        id="sobre-nosotros-title"
        eyebrow="Nuestra identidad"
        title="Sobre la ASADA"
        description="Somos la asociación administradora del acueducto de San Juan de Santa Cruz. Nuestro compromiso es un servicio de agua potable cercano, transparente y sostenible para la comunidad."
      />

      <div className="mt-8 grid grid-cols-2 gap-6 max-[900px]:grid-cols-1">
        <figure className="m-0 overflow-hidden rounded-[18px] border border-sigasj-border aspect-[4/3] max-[900px]:aspect-[16/10]">
          <img
            className="h-full w-full object-cover"
            src={asadaPhoto}
            alt="Instalaciones de la ASADA San Juan"
            loading="lazy"
            decoding="async"
          />
        </figure>

        <div className="grid gap-4 content-start">
          <Card className="p-5">
            <div className="flex items-start gap-4">
              <IdentityIcon>
                <IconEye size={20} stroke={1.85} />
              </IdentityIcon>
              <div>
                <h3 className="m-0 font-sigasj-display text-xl font-bold text-sigasj-text">
                  Visión
                </h3>
                <p className="mb-0 mt-2 text-sm leading-6 text-sigasj-muted">
                  Ser una ASADA líder y reconocida por la excelencia en la gestión
                  del agua, la protección del recurso hídrico, la innovación, la
                  transparencia y el compromiso con el desarrollo sostenible de la
                  comunidad y las futuras generaciones.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-4">
              <IdentityIcon>
                <IconDroplet size={20} stroke={1.85} />
              </IdentityIcon>
              <div>
                <h3 className="m-0 font-sigasj-display text-xl font-bold text-sigasj-text">
                  Misión
                </h3>
                <p className="mb-0 mt-2 text-sm leading-6 text-sigasj-muted">
                  Brindar un servicio de agua potable de calidad a la comunidad de
                  San Juan de Santa Cruz, administrando el recurso hídrico de manera
                  eficiente, transparente y sostenible, promoviendo su uso
                  responsable y contribuyendo al bienestar de todos los usuarios.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <details className="group mt-6 overflow-hidden rounded-[13px] border border-sigasj-border bg-sigasj-canvas open:bg-sigasj-surface">
        <summary className="flex min-h-[72px] cursor-pointer list-none items-center gap-4 px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sigasj-primary [&::-webkit-details-marker]:hidden">
          <IdentityIcon>
            <IconFileDescription size={20} stroke={1.85} />
          </IdentityIcon>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <strong className="font-sigasj-display text-lg font-bold text-sigasj-text">
              Reseña histórica
            </strong>
            <small className="text-sm text-sigasj-muted">
              Conozca el origen y la evolución de nuestra ASADA
            </small>
          </span>
        </summary>
        <div className="border-t border-sigasj-border px-5 py-5 text-sm leading-7 text-sigasj-muted">
          <p className="m-0 whitespace-pre-line">{`La Asociación Administradora del Sistema de Acueducto y Alcantarillado Sanitario (ASADA) de San Juan de Santa Cruz, Guanacaste, tiene sus orígenes en el año 2003, cuando el 24 de septiembre, un grupo de 53 vecinos fundadores se reunió en el salón comunal con el propósito de constituir una organización encargada de administrar, operar y proteger el sistema de abastecimiento de agua potable de la comunidad.

El acueducto que abastece a la comunidad había sido construido en 1977, respondiendo a las necesidades de la población de aquella época. Con el paso de los años, el crecimiento poblacional y el aumento en la demanda del servicio hicieron necesaria una administración comunal organizada que garantizara el acceso al agua potable y el mantenimiento de la infraestructura.

Desde su creación, la ASADA San Juan ha trabajado en el mejoramiento continuo del servicio, velando por la conservación de las fuentes de agua, el mantenimiento de la red de distribución y la promoción del uso responsable del recurso hídrico. Gracias al esfuerzo conjunto de sus juntas directivas, personal administrativo, fontaneros y usuarios, la asociación se ha consolidado como una organización comprometida con el bienestar y el desarrollo de la comunidad.

En la actualidad, la ASADA continúa enfrentando el reto de modernizar y ampliar su infraestructura para responder al crecimiento de la población y garantizar un servicio de agua potable eficiente, seguro y sostenible para las generaciones presentes y futuras.`}</p>
        </div>
      </details>
    </div>
  </section>
)

export default AboutSection
