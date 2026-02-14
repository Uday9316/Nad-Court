import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Nad Court v3.0 - Build: 2026-02-14-0755
console.log('Nad Court v3.0 loaded - Build: 2026-02-14-0755')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
