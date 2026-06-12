import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Button, IconButton } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Add as AddIcon, List as ListIcon, Assessment as AssessmentIcon, AttachMoney as MoneyIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { DashboardData, Upgrade, SUPERVISOR_EMAILS, GERENTE_EMAILS, TipoUpgrade } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';
import MonthNavigator from '../components/MonthNavigator';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isSupervisor = user?.email ? SUPERVISOR_EMAILS.includes(user.email) : false;
  const isGerente = user?.email ? GERENTE_EMAILS.includes(user.email) : false;
  const isAdmin = isSupervisor || isGerente;
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [data, setData] = useState<DashboardData>({
    totalUpgrades: 0,
    upgradesPorOperador: {},
    upgradesPorMeioContato: {},
    upgradesPorTipo: {},
    upgradesPorAssinatura: {},
  });
  const [loading, setLoading] = useState(true);
  const [showComissao, setShowComissao] = useState(false);
  const [comissaoUsuario, setComissaoUsuario] = useState<{
    upgradesAtivos: number;
    upgradesReceptivos: number;
    valorComissao: number;
  }>({
    upgradesAtivos: 0,
    upgradesReceptivos: 0,
    valorComissao: 0
  });

  const calcularComissaoAtivos = (quantidade: number): number => {
    if (quantidade <= 49) return quantidade * 11;
    if (quantidade <= 59) return quantidade * 13;
    if (quantidade <= 69) return quantidade * 15;
    if (quantidade <= 79) return quantidade * 18;
    if (quantidade <= 89) return quantidade * 21;
    if (quantidade <= 99) return quantidade * 24;
    return quantidade * 28;
  };

  const calcularComissaoReceptivos = (quantidade: number): number => {
    return quantidade * 9;
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const startDate = startOfMonth(selectedMonth);
      const endDate = endOfMonth(selectedMonth);

      let q = query(
        collection(db, 'upgrades'),
        where('data', '>=', Timestamp.fromDate(startDate)),
        where('data', '<=', Timestamp.fromDate(endDate))
      );

      // Se não for admin, filtrar apenas os upgrades do operador
      if (!isAdmin && user?.email) {
        q = query(q, where('operadorId', '==', user.email));
      }

      const querySnapshot = await getDocs(q);
      const upgrades = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as unknown as Upgrade[];

      const dashboardData: DashboardData = {
        totalUpgrades: upgrades.length,
        upgradesPorOperador: {},
        upgradesPorMeioContato: {},
        upgradesPorTipo: {},
        upgradesPorAssinatura: {},
      };

      upgrades.forEach(upgrade => {
        // Contagem por operador
        if (upgrade.operadorNome) {
          dashboardData.upgradesPorOperador[upgrade.operadorNome] = (dashboardData.upgradesPorOperador[upgrade.operadorNome] || 0) + 1;
        }

        // Contagem por meio de contato
        if (upgrade.meioContato) {
          dashboardData.upgradesPorMeioContato[upgrade.meioContato] = (dashboardData.upgradesPorMeioContato[upgrade.meioContato] || 0) + 1;
        }

        // Contagem por tipo
        if (upgrade.tipoUpgrade) {
          dashboardData.upgradesPorTipo[upgrade.tipoUpgrade] = (dashboardData.upgradesPorTipo[upgrade.tipoUpgrade] || 0) + 1;
        }

        // Contagem por assinatura
        if (upgrade.assinatura) {
          dashboardData.upgradesPorAssinatura[upgrade.assinatura] = (dashboardData.upgradesPorAssinatura[upgrade.assinatura] || 0) + 1;
        }
      });

      // Calcular comissão do usuário (todos os usuários podem ter comissão)
      if (user?.email) {
        // Buscar apenas os upgrades do usuário logado para calcular sua comissão
        const qComissao = query(
          collection(db, 'upgrades'),
          where('data', '>=', Timestamp.fromDate(startDate)),
          where('data', '<=', Timestamp.fromDate(endDate)),
          where('operadorId', '==', user.email)
        );
        
        const querySnapshotComissao = await getDocs(qComissao);
        const upgradesUsuario = querySnapshotComissao.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as Upgrade[];

        let upgradesAtivos = 0;
        let upgradesReceptivos = 0;

        upgradesUsuario.forEach(upgrade => {
          if (upgrade.tipoUpgrade === TipoUpgrade.ATIVO) {
            upgradesAtivos++;
          } else if (upgrade.tipoUpgrade === TipoUpgrade.RECEPTIVO) {
            upgradesReceptivos++;
          }
        });

        const valorComissaoAtivos = calcularComissaoAtivos(upgradesAtivos);
        const valorComissaoReceptivos = calcularComissaoReceptivos(upgradesReceptivos);
        const valorTotalComissao = valorComissaoAtivos + valorComissaoReceptivos;

        setComissaoUsuario({
          upgradesAtivos,
          upgradesReceptivos,
          valorComissao: valorTotalComissao
        });
      }

      setData(dashboardData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  return (
    <Container maxWidth="xl">
      <Box className="py-6">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            Bem-vindo, {user?.name}!
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Novo Upgrade
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mb-4">
                  Registre um novo upgrade no sistema
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/upgrades"
                  startIcon={<AddIcon />}
                  fullWidth
                >
                  Criar Upgrade
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lista de Upgrades
                </Typography>
                <Typography variant="body2" color="text.secondary" className="mb-4">
                  Visualize e gerencie os upgrades existentes
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to="/upgrades"
                  startIcon={<ListIcon />}
                  fullWidth
                >
                  Ver Upgrades
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Card de Comissão para Todos os Usuários */}
          {user?.email && (
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MoneyIcon sx={{ mr: 1, fontSize: 28 }} />
                      <Typography variant="h6">
                        Sua Comissão do Mês
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => setShowComissao(!showComissao)}
                      sx={{ 
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      {showComissao ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </Box>
                  <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {showComissao ? formatCurrency(comissaoUsuario.valorComissao) : '••••••'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9, mb: 2 }}>
                    <Typography variant="body2">
                      Ativos: {comissaoUsuario.upgradesAtivos}
                    </Typography>
                    <Typography variant="body2">
                      Receptivos: {comissaoUsuario.upgradesReceptivos}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontStyle: 'italic' }}>
                    O valor pode variar de acordo com os upgrades avaliados e validados pela gerência.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {isSupervisor && (
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Logs do Sistema
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="mb-4">
                    Acompanhe todas as atividades do sistema
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    component={Link}
                    to="/logs"
                    startIcon={<AssessmentIcon />}
                    fullWidth
                  >
                    Ver Logs
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {isAdmin ? (
              <>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent sx={{ 
                      height: '300px',
                      display: 'flex', 
                      flexDirection: 'column'
                    }}>
                      <Box sx={{ mb: 3 }}>
                        <MonthNavigator 
                          selectedMonth={selectedMonth}
                          onMonthChange={setSelectedMonth}
                        />
                      </Box>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Total de Upgrades no Mês
                        </Typography>
                        <Typography variant="h3" color="primary">
                          {data.totalUpgrades}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent sx={{ height: '300px' }}>
                      <Typography variant="h6" gutterBottom>
                        Ranking mensal
                      </Typography>
                      <Box sx={{ 
                        mt: 2, 
                        height: 'calc(100% - 50px)', 
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                          width: '8px'
                        },
                        '&::-webkit-scrollbar-track': {
                          background: '#f1f1f1'
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#888',
                          borderRadius: '4px'
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          background: '#555'
                        }
                      }}>
                        {Object.entries(data.upgradesPorOperador)
                          .sort(([, a], [, b]) => b - a)
                          .map(([operador, quantidade], index) => (
                            <Box key={operador} sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              mb: 2,
                              p: 1.5,
                              bgcolor: 'rgba(0, 0, 0, 0.02)',
                              borderRadius: 1,
                              '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.04)'
                              }
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography sx={{ 
                                  minWidth: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 2,
                                  fontSize: '0.875rem'
                                }}>
                                  {index + 1}
                                </Typography>
                                <Typography>{operador}</Typography>
                              </Box>
                              <Typography fontWeight="bold" sx={{ 
                                bgcolor: 'primary.main',
                                color: 'white',
                                px: 2,
                                py: 0.5,
                                borderRadius: 1
                              }}>
                                {quantidade}
                              </Typography>
                            </Box>
                          ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <MonthNavigator 
                        selectedMonth={selectedMonth}
                        onMonthChange={setSelectedMonth}
                      />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      Seus Upgrades no Mês
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {data.totalUpgrades}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upgrades por Meio de Contato
                  </Typography>
                  {Object.entries(data.upgradesPorMeioContato).map(([meio, quantidade]) => (
                    <Box key={meio} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>
                        {meio === 'presencial' ? 'Presencial' :
                         meio === 'ligacao' ? 'Ligação' :
                         meio === 'whatsapp' ? 'WhatsApp' : meio}
                      </Typography>
                      <Typography fontWeight="bold">{quantidade}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upgrades por Tipo
                  </Typography>
                  {Object.entries(data.upgradesPorTipo).map(([tipo, quantidade]) => (
                    <Box key={tipo} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>
                        {tipo === 'ativo' ? 'Ativo' :
                         tipo === 'receptivo' ? 'Receptivo' : tipo}
                      </Typography>
                      <Typography fontWeight="bold">{quantidade}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upgrades por Assinatura
                  </Typography>
                  {Object.entries(data.upgradesPorAssinatura).map(([assinatura, quantidade]) => (
                    <Box key={assinatura} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>
                        {assinatura === 'digital' ? 'Digital' :
                         assinatura === 'fisica' ? 'Físico' : assinatura}
                      </Typography>
                      <Typography fontWeight="bold">{quantidade}</Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default DashboardPage; 