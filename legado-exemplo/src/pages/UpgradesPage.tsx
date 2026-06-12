import React, { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Button,
  Dialog,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { SUPERVISOR_EMAILS, GERENTE_EMAILS } from '../types';
import UpgradeForm from '../components/UpgradeForm';
import UpgradeTable from '../components/UpgradeTable';
import UpgradeDashboard from '../components/UpgradeDashboard';
import AuditDashboard from '../components/AuditDashboard';

const UpgradesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const isSupervisor = user?.email ? SUPERVISOR_EMAILS.includes(user.email) : false;
  const isGerente = user?.email ? GERENTE_EMAILS.includes(user.email) : false;
  const hasAccess = isSupervisor || isGerente;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box className="py-6">
        <Box className="flex justify-between items-center mb-6">
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Lista de Upgrades" />
            {hasAccess && <Tab label="Dashboard" />}
            {hasAccess && <Tab label="Auditoria" />}
          </Tabs>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsFormOpen(true)}
          >
            Novo Upgrade
          </Button>
        </Box>

        {activeTab === 0 && <UpgradeTable />}
        {activeTab === 1 && hasAccess && <UpgradeDashboard />}
        {activeTab === 2 && hasAccess && <AuditDashboard />}

        <Dialog
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <UpgradeForm
            onSuccess={() => {
              setIsFormOpen(false);
              // Recarregar a tabela se necessário
            }}
          />
        </Dialog>
      </Box>
    </Container>
  );
};

export default UpgradesPage; 