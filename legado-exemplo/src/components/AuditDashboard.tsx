import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Upgrade, SUPERVISOR_EMAILS, GERENTE_EMAILS } from '../types';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import MonthNavigator from './MonthNavigator';



const AuditDashboard: React.FC = () => {
  const { user } = useAuth();
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

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
        where('criadoEm', '>=', Timestamp.fromDate(startDate)),
        where('criadoEm', '<=', Timestamp.fromDate(endDate))
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

  const getRegistrosForaDoHorario = () => {
    const registrosForaHorario = upgrades.filter(upgrade => {
      if (!upgrade.criadoEm) return false;
      
      const horaRegistro = upgrade.criadoEm.toDate().getHours();
      // Considera fora do horário de trabalho: antes das 8h ou depois das 22h
      return horaRegistro < 8 || horaRegistro >= 22;
    });

    return registrosForaHorario.length;
  };

  const getRegistrosForaHorarioDetalhado = () => {
    return upgrades
      .filter(upgrade => {
        if (!upgrade.criadoEm) return false;
        
        const horaRegistro = upgrade.criadoEm.toDate().getHours();
        return horaRegistro < 8 || horaRegistro >= 22;
      })
      .map(upgrade => ({
        cliente: upgrade.cliente,
        operador: upgrade.createdBy || upgrade.operadorNome || 'Não informado',
        dataRegistro: upgrade.criadoEm ? format(upgrade.criadoEm.toDate(), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Sem data',
        horaRegistro: upgrade.criadoEm ? upgrade.criadoEm.toDate().getHours() : 0,
        dataUpgrade: upgrade.data ? format(upgrade.data.toDate(), 'dd/MM/yyyy', { locale: ptBR }) : 'Sem data'
      }))
      .sort((a, b) => b.horaRegistro - a.horaRegistro); // Ordenar por hora (mais tarde primeiro)
  };

  const getRegistrosEditados = () => {
    return upgrades.filter(upgrade => {
      if (!upgrade.criadoEm || !upgrade.ultimaAtualizacao) return false;
      return upgrade.criadoEm.toMillis() !== upgrade.ultimaAtualizacao.toMillis();
    }).length;
  };

  const getTempoMedioRegistro = () => {
    const tempos = upgrades
      .filter(upgrade => upgrade.data && upgrade.criadoEm)
      .map(upgrade => {
        const diffMs = upgrade.criadoEm!.toMillis() - upgrade.data!.toMillis();
        return Math.abs(diffMs / (1000 * 60 * 60)); // em horas
      });

    if (tempos.length === 0) return 0;
    return tempos.reduce((acc, tempo) => acc + tempo, 0) / tempos.length;
  };

  const getRegistrosPorDia = () => {
    const registrosPorDia: Record<string, number> = {};
    
    upgrades.forEach(upgrade => {
      if (upgrade.criadoEm) {
        const data = format(upgrade.criadoEm.toDate(), 'dd/MM', { locale: ptBR });
        registrosPorDia[data] = (registrosPorDia[data] || 0) + 1;
      }
    });

    return Object.entries(registrosPorDia)
      .map(([data, quantidade]) => ({ data, quantidade }))
      .sort((a, b) => {
        const [diaA] = a.data.split('/');
        const [diaB] = b.data.split('/');
        return parseInt(diaA) - parseInt(diaB);
      });
  };



  const getRegistrosPorHora = () => {
    const registrosPorHora: Record<number, number> = {};
    
    upgrades.forEach(upgrade => {
      if (upgrade.criadoEm) {
        const hora = upgrade.criadoEm.toDate().getHours();
        registrosPorHora[hora] = (registrosPorHora[hora] || 0) + 1;
      }
    });

    return Array.from({ length: 24 }, (_, i) => ({
      hora: `${i.toString().padStart(2, '0')}h`,
      quantidade: registrosPorHora[i] || 0
    }));
  };

  if (!hasAccess) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          Você não tem permissão para acessar o dashboard de auditoria.
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </Box>
    );
  }

  const totalRegistros = upgrades.length;
  const registrosForaHorario = getRegistrosForaDoHorario();
  const registrosEditados = getRegistrosEditados();
  const tempoMedio = getTempoMedioRegistro();

  return (
    <Box>
      <Box className="mb-4">
        <MonthNavigator 
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </Box>

      {/* Cards de Resumo */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-4 text-center">
            <Typography variant="h4" color="primary">
              {totalRegistros}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total de Registros
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-4 text-center">
            <Typography variant="h4" color="warning.main">
              {registrosForaHorario}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Fora do Horário
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-4 text-center">
            <Typography variant="h4" color="info.main">
              {registrosEditados}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Registros Editados
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper className="p-4 text-center">
            <Typography variant="h4" color="success.main">
              {tempoMedio.toFixed(1)}h
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Tempo Médio para Registro
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">
              Registros por Dia
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getRegistrosPorDia()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#8884d8" name="Registros" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">
              Registros por Hora do Dia
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getRegistrosPorHora()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#00C49F" name="Registros" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper className="p-4">
            <Typography variant="h6" className="mb-4">
              Registros Fora do Horário de Trabalho
            </Typography>
            {getRegistrosForaHorarioDetalhado().length > 0 ? (
              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Cliente</strong></TableCell>
                      <TableCell><strong>Operador</strong></TableCell>
                      <TableCell><strong>Data do Registro</strong></TableCell>
                      <TableCell><strong>Data do Upgrade</strong></TableCell>
                      <TableCell><strong>Hora</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getRegistrosForaHorarioDetalhado().map((registro, index) => (
                      <TableRow key={index} sx={{ 
                        backgroundColor: registro.horaRegistro >= 22 || registro.horaRegistro < 6 ? '#fff3cd' : '#f8d7da' 
                      }}>
                        <TableCell>{registro.cliente}</TableCell>
                        <TableCell>{registro.operador}</TableCell>
                        <TableCell>{registro.dataRegistro}</TableCell>
                        <TableCell>{registro.dataUpgrade}</TableCell>
                        <TableCell>
                          <Chip 
                            label={`${registro.horaRegistro}h`}
                            color={registro.horaRegistro >= 22 || registro.horaRegistro < 6 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Nenhum registro foi feito fora do horário de trabalho (8h-22h).
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Alertas */}
      {registrosForaHorario > 0 && (
        <Box mt={3}>
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>{registrosForaHorario}</strong> registros foram feitos fora do horário de trabalho (8h-22h).
              Considere verificar se são registros legítimos.
            </Typography>
          </Alert>
        </Box>
      )}

      {tempoMedio > 24 && (
        <Box mt={2}>
          <Alert severity="info">
            <Typography variant="body2">
              O tempo médio para registro é de <strong>{tempoMedio.toFixed(1)} horas</strong>.
              Considere implementar medidas para reduzir este tempo.
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default AuditDashboard; 