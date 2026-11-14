import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './shared/styles/asada-tokens.css'
import './shared/styles/forms.css'
import './shared/styles/public-design.css'
import './shared/styles/tailwind.css'
/* Chrome admin después de Tailwind (paleta ASADA). */
import './shared/styles/admin-surfaces.css'
import './modules/dashboard/styles/vision-ui.css'
import './modules/dashboard/styles/admin-dashboard.css'
import App from './app/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
