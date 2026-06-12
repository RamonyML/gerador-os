import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { RequireAuth } from './components/RequireAuth'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { OsGeneratorPage } from './pages/OsGeneratorPage'
import { SupportHomePage } from './pages/SupportHomePage'
import { AlteracaoPlanoHubPage } from './pages/AlteracaoPlanoHubPage'
import { MudancaEnderecoHubPage } from './pages/MudancaEnderecoHubPage'
import { SupportDemandPage } from './pages/SupportDemandPage'
import { RequireSupport } from './components/RequireSupport'
import { RequireUserManager } from './components/RequireUserManager'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { SobrePage } from './pages/SobrePage'
import { UpgradesHubPage } from './pages/UpgradesHubPage'
import { UpgradesCommissionsPage } from './pages/UpgradesCommissionsPage'
import { RequireUpgradeCommissions } from './components/RequireUpgradeCommissions'
import { EscalaPage } from './pages/EscalaPage'
import { AvisosPage } from './pages/AvisosPage'
import { HelpdeskPage } from './pages/HelpdeskPage'
import { HelpdeskTicketPage } from './pages/HelpdeskTicketPage'
import { CondominiosPage } from './pages/CondominiosPage'
import { RequireCondominios } from './components/RequireCondominios'
import { AgendaPage } from './pages/AgendaPage'
import { ProfilePage } from './pages/ProfilePage'

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
        <Route
          path="/suporte"
          element={
            <RequireSupport>
              <SupportHomePage />
            </RequireSupport>
          }
        />
        <Route
          path="/suporte/alteracao-plano"
          element={
            <RequireSupport>
              <AlteracaoPlanoHubPage />
            </RequireSupport>
          }
        />
        <Route
          path="/suporte/mudanca-endereco"
          element={
            <RequireSupport>
              <MudancaEnderecoHubPage />
            </RequireSupport>
          }
        />
        <Route
          path="/suporte/demanda/:demandId"
          element={
            <RequireSupport>
              <SupportDemandPage />
            </RequireSupport>
          }
        />
        <Route path="/gerar-os" element={<OsGeneratorPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/escala" element={<EscalaPage />} />
        <Route path="/upgrades" element={<UpgradesHubPage />} />
        <Route path="/chamados" element={<HelpdeskPage />} />
        <Route path="/chamados/:ticketId" element={<HelpdeskTicketPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route
          path="/condominios"
          element={
            <RequireCondominios>
              <CondominiosPage />
            </RequireCondominios>
          }
        />
        <Route path="/avisos" element={<AvisosPage />} />
        <Route
          path="/upgrades/comissoes"
          element={
            <RequireUpgradeCommissions>
              <UpgradesCommissionsPage />
            </RequireUpgradeCommissions>
          }
        />
        <Route path="/sobre" element={<SobrePage />} />
        <Route
          path="/admin/usuarios"
          element={
            <RequireUserManager>
              <AdminUsersPage />
            </RequireUserManager>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
