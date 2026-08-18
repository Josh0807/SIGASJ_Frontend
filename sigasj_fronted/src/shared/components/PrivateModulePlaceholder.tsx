import type { PrivateModulePlaceholderProps } from '../props'

export type { PrivateModulePlaceholderProps }

const PrivateModulePlaceholder = ({
  title,
  description = 'Este módulo administrativo estará disponible próximamente.',
}: PrivateModulePlaceholderProps) => (
  <main className="private-module-placeholder" aria-labelledby="private-module-title">
    <div className="private-module-placeholder__card">
      <p className="private-module-placeholder__eyebrow">Módulo privado</p>
      <h1 id="private-module-title">{title}</h1>
      <p>{description}</p>
    </div>
  </main>
)

export default PrivateModulePlaceholder
