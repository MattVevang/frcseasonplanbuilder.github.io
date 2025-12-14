import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

// Get base path from Vite's base config (for GitHub Pages project sites)
// This will be '/' for custom domains or organization sites
const basename = import.meta.env.BASE_URL

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          duration: 4000,
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
