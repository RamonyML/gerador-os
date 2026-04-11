import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { initAnalytics } from './lib/firebase'
import { AuthProvider } from './contexts/AuthContext'
import { ColorModeProvider } from './contexts/ColorModeContext'
import { AppThemeProvider } from './components/AppThemeProvider'
import './index.css'
import App from './App.tsx'

dayjs.locale('pt-br')

void initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ColorModeProvider>
        <AppThemeProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <AuthProvider>
              <App />
            </AuthProvider>
          </LocalizationProvider>
        </AppThemeProvider>
      </ColorModeProvider>
    </BrowserRouter>
  </StrictMode>,
)
