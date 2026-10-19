import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/routePaths'
import { useAuth } from '../../auth/components/AuthContext'
import {
  InternalAdminRoleName,
  userHasAllowedRole,
} from '../../auth/utils/adminNavigation'

/** PBI 6.5.7 — cola de solicitudes solo ADMINISTRADORA (API 6.5.4). */
export default function SolicitudesAusenciaAdminGate({
  children,
}: {
  children: ReactNode
}) {
  const { user } = useAuth()
  if (!userHasAllowedRole(user, [InternalAdminRoleName.Administradora])) {
    return <Navigate to={UNAUTHORIZED_ROUTE_PATH} replace />
  }
  return children
}
