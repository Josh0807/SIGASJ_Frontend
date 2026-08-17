import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export type RouteLocation = {
  pathname: string
  state: unknown
}

type LocationProbeProps = {
  onLocation: (location: RouteLocation) => void
}

export const LocationProbe = ({ onLocation }: LocationProbeProps) => {
  const location = useLocation()

  useEffect(() => {
    onLocation({ pathname: location.pathname, state: location.state })
  }, [location, onLocation])

  return null
}
