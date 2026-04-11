import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { RequireAuth } from './components/RequireAuth'
import { RequireTemplateManager } from './components/RequireTemplateManager'
import { AdminOsTemplatesPage } from './pages/AdminOsTemplatesPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { OsGeneratorPage } from './pages/OsGeneratorPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/gerar-os" element={<OsGeneratorPage />} />
        <Route
          path="/admin/modelos-os"
          element={
            <RequireTemplateManager>
              <AdminOsTemplatesPage />
            </RequireTemplateManager>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
