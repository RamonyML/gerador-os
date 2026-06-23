import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { initAnalytics } from './lib/firebase'
import { AuthProvider } from './contexts/AuthContext'
import { ChatProvider } from './contexts/ChatContext'
import { ColorModeProvider } from './contexts/ColorModeContext'
import { SidebarTextureProvider } from './contexts/SidebarTextureContext'
import { FontProvider } from './contexts/FontContext'
import { AppThemeProvider } from './components/AppThemeProvider'
import './index.css'
import App from './App.tsx'

dayjs.locale('pt-br')

void initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ColorModeProvider>
        <SidebarTextureProvider>
          <FontProvider>
            <AppThemeProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                <AuthProvider>
                  <ChatProvider>
                    <App />
                  </ChatProvider>
                </AuthProvider>
              </LocalizationProvider>
            </AppThemeProvider>
          </FontProvider>
        </SidebarTextureProvider>
      </ColorModeProvider>
    </BrowserRouter>
  </StrictMode>,
)
