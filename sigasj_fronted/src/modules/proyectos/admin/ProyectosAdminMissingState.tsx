import type { ReactNode } from 'react'
import { PROYECTO_NOT_FOUND_ERROR } from './proyectoSubmitError'

type ProyectosAdminMissingStateProps = {
  children: ReactNode
}

const ProyectosAdminMissingState = ({
  children,
}: ProyectosAdminMissingStateProps) => (
  <div className="gallery-admin__empty" role="alert">
    <h2>{PROYECTO_NOT_FOUND_ERROR}</h2>
    {children}
  </div>
)

export default ProyectosAdminMissingState
