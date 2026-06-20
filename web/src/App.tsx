import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { RequireAuth } from './components/RequireAuth'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { OsGeneratorPage } from './pages/OsGeneratorPage'
import { SupportHomePage } from './pages/SupportHomePage'
import { AlteracaoPlanoHubPage } from './pages/AlteracaoPlanoHubPage'
import { MudancaEnderecoHubPage } from './pages/MudancaEnderecoHubPage'
import { ManutencaoHubPage } from './pages/ManutencaoHubPage'
import { MidiaTvHubPage } from './pages/MidiaTvHubPage'
import { SenhaRedeHubPage } from './pages/SenhaRedeHubPage'
import { WifiExtendHubPage } from './pages/WifiExtendHubPage'
import { TermosDocumentosHubPage } from './pages/TermosDocumentosHubPage'
import { FeedbackHubPage } from './pages/FeedbackHubPage'
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
import { CoberturaPage } from './pages/CoberturaPage'
import { ModelosOsPage } from './pages/ModelosOsPage'
import { CadastroHomePage } from './pages/CadastroHomePage'
import { InstGratisHubPage } from './pages/InstGratisHubPage'
import { InstTaxaHubPage } from './pages/InstTaxaHubPage'
import { RequireCadastro } from './components/RequireCadastro'
import { CadastroMidiaTvHubPage } from './pages/CadastroMidiaTvHubPage'
import { RequireAgenda } from './components/RequireAgenda'
import { RequireUpgrades } from './components/RequireUpgrades'
import { InstalacaoHomePage } from './pages/InstalacaoHomePage'
import { EncerramentosInstHubPage } from './pages/EncerramentosInstHubPage'
import { RequireInstalacao } from './components/RequireInstalacao'
import { HistoricoPage } from './pages/HistoricoPage'
import { MkTestesPage } from './pages/MkTestesPage'
import { RequireDev } from './components/RequireDev'
import { ValidacaoPage } from './pages/ValidacaoPage'
import { ValidacaoDetalhe } from './pages/ValidacaoDetalhe'
import { ValidacaoNovaPage } from './pages/ValidacaoNovaPage'
import { RequireValidacao } from './components/RequireValidacao'

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
          path="/suporte/manutencao"
          element={
            <RequireSupport>
              <ManutencaoHubPage />
            </RequireSupport>
          }
        />
        <Route
          path="/suporte/midia-tv"
          element={
            <RequireSupport>
              <MidiaTvHubPage />
            </RequireSupport>
          }
        />
        <Route
          path="/suporte/senha-rede"
          element={
            <RequireSupport>
              <SenhaRedeHubPage />
            </RequireSupport>
          }
        />
        <Route
          path="/suporte/wifi-extend"
          element={
            <RequireSupport>
              <WifiExtendHubPage />
            </RequireSupport>
          }
        />
        <Route
          path="/suporte/termos-documentos"
          element={
            <RequireSupport>
              <TermosDocumentosHubPage />
            </RequireSupport>
          }
        />
        <Route
          path="/suporte/feedback"
          element={
            <RequireSupport>
              <FeedbackHubPage />
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
        <Route
          path="/cadastro"
          element={
            <RequireCadastro>
              <CadastroHomePage />
            </RequireCadastro>
          }
        />
        <Route
          path="/cadastro/instalacao-gratis"
          element={
            <RequireCadastro>
              <InstGratisHubPage />
            </RequireCadastro>
          }
        />
        <Route
          path="/cadastro/instalacao-taxa"
          element={
            <RequireCadastro>
              <InstTaxaHubPage />
            </RequireCadastro>
          }
        />
        <Route
          path="/cadastro/midia-tv"
          element={
            <RequireCadastro>
              <CadastroMidiaTvHubPage />
            </RequireCadastro>
          }
        />
        <Route
          path="/instalacao"
          element={
            <RequireInstalacao>
              <InstalacaoHomePage />
            </RequireInstalacao>
          }
        />
        <Route
          path="/instalacao/encerramentos"
          element={
            <RequireInstalacao>
              <EncerramentosInstHubPage />
            </RequireInstalacao>
          }
        />
        <Route path="/gerar-os" element={<OsGeneratorPage />} />
        <Route
          path="/suporte/modelos-os"
          element={
            <RequireSupport>
              <ModelosOsPage />
            </RequireSupport>
          }
        />
        <Route path="/cobertura" element={<CoberturaPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/escala" element={<EscalaPage />} />
        <Route
          path="/upgrades"
          element={
            <RequireUpgrades>
              <UpgradesHubPage />
            </RequireUpgrades>
          }
        />
        <Route path="/chamados" element={<HelpdeskPage />} />
        <Route path="/chamados/:ticketId" element={<HelpdeskTicketPage />} />
        <Route
          path="/agenda"
          element={
            <RequireAgenda>
              <AgendaPage />
            </RequireAgenda>
          }
        />
        <Route
          path="/condominios"
          element={
            <RequireCondominios>
              <CondominiosPage />
            </RequireCondominios>
          }
        />
        <Route path="/historico" element={<HistoricoPage />} />
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
          path="/validacao"
          element={
            <RequireValidacao>
              <ValidacaoPage />
            </RequireValidacao>
          }
        />
        <Route
          path="/validacao/nova"
          element={
            <RequireValidacao>
              <ValidacaoNovaPage />
            </RequireValidacao>
          }
        />
        <Route
          path="/validacao/:id"
          element={
            <RequireValidacao>
              <ValidacaoDetalhe />
            </RequireValidacao>
          }
        />
        <Route
          path="/dev/mk"
          element={
            <RequireDev>
              <MkTestesPage />
            </RequireDev>
          }
        />
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
