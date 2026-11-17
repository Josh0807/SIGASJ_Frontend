import { useContext } from 'react'
import { SageIaContext } from './sageIaContextValue'

export const useSageIa = () => {
  const context = useContext(SageIaContext)
  if (!context) {
    throw new Error('useSageIa debe usarse dentro de SageIaProvider')
  }
  return context
}
