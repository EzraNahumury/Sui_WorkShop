import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from './components/providers'
import { App } from './app'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
