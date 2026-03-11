import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DeadStartups from './DeadStartups.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DeadStartups />
  </StrictMode>,
)
