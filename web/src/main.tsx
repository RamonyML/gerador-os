import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { initAnalytics } from './lib/firebase'
import { AuthProvider } from './contexts/AuthContext'
import { ColorModeProvider } from './contexts/ColorModeContext'
import { AppThemeProvider } from './components/AppThemeProvider'
import './index.css'
import App from './App.tsx'

void initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ColorModeProvider>
        <AppThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AppThemeProvider>
      </ColorModeProvider>
    </BrowserRouter>
  </StrictMode>,
)
