import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OSPage from './pages/OSPage';
import LogViewer from './components/LogViewer';
import UpgradesPage from './pages/UpgradesPage';
import UserManagementPage from './pages/UserManagementPage';
import PrivateRoute from './components/PrivateRoute';
import GerenteRoute from './components/GerenteRoute';
import Navbar from './components/Navbar';
import './styles/global.css';
import { NavbarThemeProvider, useNavbarTheme } from './contexts/NavbarThemeContext';
import { getTheme } from './theme';
import FeedbackAltplanPage from './pages/FeedbackAltplanPage';
import QuestionnaireManagementPage from './pages/QuestionnaireManagementPage';
import QuestionnaireListPage from './pages/QuestionnaireListPage';
import QuestionnaireResponsesPage from './pages/QuestionnaireResponsesPage';
import ComissoesPage from './pages/ComissoesPage';

function AppContent() {
  const { theme } = useNavbarTheme();
  const muiTheme = useTheme();
  React.useEffect(() => {
    document.body.style.background = muiTheme.palette.background.default;
  }, [muiTheme.palette.background.default]);
  return (
    <ThemeProvider theme={getTheme(theme)}>
      <Router>
        <AuthProvider>
          <Toaster position="top-right" />
          <div className="app-container">
            <Navbar />
            <div className="content">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/os" element={<PrivateRoute><OSPage /></PrivateRoute>} />
                <Route path="/logs" element={<PrivateRoute><LogViewer /></PrivateRoute>} />
                <Route path="/upgrades" element={<PrivateRoute><UpgradesPage /></PrivateRoute>} />
                <Route path="/users" element={<GerenteRoute><UserManagementPage /></GerenteRoute>} />
                <Route path="/feedback-altplan" element={<PrivateRoute><FeedbackAltplanPage /></PrivateRoute>} />
                <Route path="/questionarios" element={<QuestionnaireListPage />} />
                <Route path="/gerente/questionarios" element={<GerenteRoute><QuestionnaireManagementPage /></GerenteRoute>} />
                <Route path="/gerente/questionarios/respostas" element={<GerenteRoute><QuestionnaireResponsesPage /></GerenteRoute>} />
                <Route path="/gerente/comissoes" element={<GerenteRoute><ComissoesPage /></GerenteRoute>} />
              </Routes>
            </div>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <NavbarThemeProvider>
      <AppContent />
    </NavbarThemeProvider>
  );
}

export default App; 