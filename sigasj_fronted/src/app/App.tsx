import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../modules/auth/components/AuthContext'
import AppRoutes from './router/AppRoutes'
import ErrorBoundary from '../shared/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
