import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Upgrade, SUPERVISOR_EMAILS, GERENTE_EMAILS } from '../types';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import MonthNavigator from './MonthNavigator';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const UpgradeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [operadorLimit, setOperadorLimit] = useState<number | 'all'>(3);
  const [selectedOperadorDia, setSelectedOperadorDia] = useState<string>('todos');

  const isSupervisor = user?.email ? SUPERVISOR_EMAILS.includes(user.email) : false;
  const isGerente = user?.email ? GERENTE_EMAILS.includes(user.email) : false;
  const hasAccess = isSupervisor || isGerente;

  const loadUpgrades = useCallback(async () => {
    if (!hasAccess) {
      return;
    }

    try {
      setLoading(true);
      const startDate = startOfMonth(selectedMonth);
      const endDate = endOfMonth(selectedMonth);

      const q = query(
        collection(db, 'upgrades'),
        where('data', '>=', Timestamp.fromDate(startDate)),
        where('data', '<=', Timestamp.fromDate(endDate))
      );

      const querySnapshot = await getDocs(q);
      const upgradesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as unknown as Upgrade;
      });

      setUpgrades(upgradesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [hasAccess, selectedMonth]);

  useEffect(() => {
    loadUpgrades();
  }, [loadUpgrades]);

  const getUpgradesPorOperador = () => {
    const upgradesPorOperador: Record<string, number> = {};
    upgrades.forEach(upgrade => {
      const operador = upgrade.operadorNome || 'Não informado';
      upgradesPorOperador[operador] = (upgradesPorOperador[operador] || 0) + 1;
    });

    // Converter para array e ordenar por quantidade (decrescente)
    let data = Object.entries(upgradesPorOperador)
      .map(([operador, quantidade]) => ({
        name: operador,
        value: quantidade,
      }))
      .sort((a, b) => b.value - a.value);

    // Aplicar limite se não for 'all'
    if (operadorLimit !== 'all') {
      data = data.slice(0, operadorLimit);
    }

    return data;
  };

  const getUpgradesPorMeioContato = () => {
    const upgradesPorMeioContato: Record<string, number> = {};
    upgrades.forEach(upgrade => {
      const meioContato = upgrade.meioContato || 'Não informado';
      upgradesPorMeioContato[meioContato] = (upgradesPorMeioContato[meioContato] || 0) + 1;
    });
    return Object.entries(upgradesPorMeioContato).map(([meioContato, quantidade]) => ({
      name: meioContato === 'presencial' ? 'Presencial' :
            meioContato === 'ligacao' ? 'Ligação' :
            meioContato === 'whatsapp' ? 'WhatsApp' : meioContato,
      value: quantidade,
    }));
  };

  const getUpgradesPorTipo = () => {
    const upgradesPorTipo: Record<string, number> = {};
    upgrades.forEach(upgrade => {
      const tipo = upgrade.tipoUpgrade || 'Não informado';
      upgradesPorTipo[tipo] = (upgradesPorTipo[tipo] || 0) + 1;
    });
    return Object.entries(upgradesPorTipo).map(([tipo, quantidade]) => ({
      name: tipo === 'ativo' ? 'Ativo' :
            tipo === 'receptivo' ? 'Receptivo' : tipo,
      value: quantidade,
    }));
  };

  const getUpgradesPorAssinatura = () => {
    const upgradesPorAssinatura: Record<string, number> = {};
    upgrades.forEach(upgrade => {
      const assinatura = upgrade.assinatura || 'Não informado';
      upgradesPorAssinatura[assinatura] = (upgradesPorAssinatura[assinatura] || 0) + 1;
    });
    return Object.entries(upgradesPorAssinatura).map(([assinatura, quantidade]) => ({
      name: assinatura === 'digital' ? 'Digital' :
            assinatura === 'fisica' ? 'Físico' : assinatura,
      value: quantidade,
    }));
  };

  const getUpgradesPorDia = () => {
    const upgradesPorDia: Record<string, number> = {};
    
    // Filtrar upgrades por operador se necessário
    const upgradesFiltrados = selectedOperadorDia === 'todos' 
      ? upgrades 
      : upgrades.filter(upgrade => upgrade.operadorId === selectedOperadorDia);
    
    upgradesFiltrados.forEach(upgrade => {
      if (upgrade.data) {
        const data = format(upgrade.data.toDate(), 'dd/MM', { locale: ptBR });
        upgradesPorDia[data] = (upgradesPorDia[data] || 0) + 1;
      }
    });

    return Object.entries(upgradesPorDia)
      .map(([data, quantidade]) => ({ data, quantidade }))
      .sort((a, b) => {
        const [diaA] = a.data.split('/');
        const [diaB] = b.data.split('/');
        return parseInt(diaA) - parseInt(diaB);
      });
  };

  const getOperadoresList = () => {
    const operadoresSet = new Set<string>();
    const operadoresMap = new Map<string, string>();
    
    upgrades.forEach(upgrade => {
      if (upgrade.operadorId && upgrade.operadorNome) {
        operadoresSet.add(upgrade.operadorId);
        operadoresMap.set(upgrade.operadorId, upgrade.operadorNome);
      }
    });

    return Array.from(operadoresSet).map(id => ({
      id,
      nome: operadoresMap.get(id) || id
    }));
  };

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </Box>
    );
  }

  return (
    <Box>
      <Box className="mb-4" sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <MonthNavigator 
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />

        <FormControl style={{ minWidth: 150 }}>
          <InputLabel>Exibir Operadores</InputLabel>
          <Select
            value={operadorLimit}
            onChange={(e) => setOperadorLimit(e.target.value as number | 'all')}
            label="Exibir Operadores"
          >
            <MenuItem value={3}>Principais 3</MenuItem>
            <MenuItem value={5}>Principais 5</MenuItem>
            <MenuItem value={10}>Principais 10</MenuItem>
            <MenuItem value={15}>Principais 15</MenuItem>
            <MenuItem value="all">Todos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">
              Upgrades por Operador {operadorLimit !== 'all' ? `(${operadorLimit} Principais)` : ''}
            </Typography>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={getUpgradesPorOperador()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper className="p-4">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Upgrades por Dia
              </Typography>
              <FormControl style={{ minWidth: 200 }}>
                <InputLabel>Filtrar por Operador</InputLabel>
                <Select
                  value={selectedOperadorDia}
                  onChange={(e) => setSelectedOperadorDia(e.target.value)}
                  label="Filtrar por Operador"
                >
                  <MenuItem value="todos">Todos os Operadores</MenuItem>
                  {getOperadoresList().map((operador) => (
                    <MenuItem key={operador.id} value={operador.id}>
                      {operador.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getUpgradesPorDia()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#00C49F" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">
              Upgrades por Meio de Contato
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getUpgradesPorMeioContato()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {getUpgradesPorMeioContato().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">
              Upgrades por Tipo
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getUpgradesPorTipo()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {getUpgradesPorTipo().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">
              Upgrades por Assinatura
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getUpgradesPorAssinatura()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {getUpgradesPorAssinatura().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UpgradeDashboard; 