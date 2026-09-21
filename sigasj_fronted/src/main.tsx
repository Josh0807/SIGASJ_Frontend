import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './modules/dashboard/styles/vision-ui.css'
import './shared/styles/forms.css'
import './shared/styles/tailwind.css'
import App from './app/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
