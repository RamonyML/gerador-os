import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Upgrade, TipoUpgrade, MeioContato, TipoAssinatura } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
import { gerarRelatorioComissoesPDF } from '../utils/pdfUtils';
import { useAuth } from '../contexts/AuthContext';

interface ComissaoOperador {
  operadorId: string;
  operadorNome: string;
  upgradesAtivos: number;
  upgradesReceptivos: number;
  valorComissaoAtivos: number;
  valorComissaoReceptivos: number;
  valorTotalComissao: number;
}

const ComissoesPage: React.FC = () => {
  const { user } = useAuth();
  const [comissoes, setComissoes] = useState<ComissaoOperador[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'todos' | 'ativos' | 'receptivos'>('todos');

  // Função para calcular comissão baseada na quantidade de upgrades ativos
  const calcularComissaoAtivos = (quantidade: number): number => {
    if (quantidade <= 49) return quantidade * 11;
    if (quantidade <= 59) return quantidade * 13;
    if (quantidade <= 69) return quantidade * 15;
    if (quantidade <= 79) return quantidade * 18;
    if (quantidade <= 89) return quantidade * 21;
    if (quantidade <= 99) return quantidade * 24;
    return quantidade * 28; // 100 ou mais
  };

  // Função para calcular comissão de upgrades receptivos (R$ 9,00 cada)
  const calcularComissaoReceptivos = (quantidade: number): number => {
    return quantidade * 9;
  };

  const loadComissoes = useCallback(async () => {
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
        const data = doc.data() as any;
        return {
          id: doc.id,
          data: data?.data?.toDate?.() || data?.data || Timestamp.fromDate(new Date()),
          cliente: data?.cliente ?? '',
          meioContato: data?.meioContato ?? MeioContato.WHATSAPP,
          numeroContato: data?.numeroContato ?? '',
          assinatura: data?.assinatura ?? TipoAssinatura.DIGITAL,
          tipoUpgrade: data?.tipoUpgrade ?? TipoUpgrade.ATIVO,
          observacao: data?.observacao ?? '',
          operadorId: data?.operadorId ?? '',
          operadorNome: data?.operadorNome ?? '',
          duplicado: data?.duplicado ?? false,
          criadoEm: data?.criadoEm ?? Timestamp.fromDate(new Date()),
          ultimaAtualizacao: data?.ultimaAtualizacao ?? Timestamp.fromDate(new Date()),
        } as Upgrade;
      });

      // Agrupar upgrades por operador
      const operadoresMap = new Map<string, ComissaoOperador>();

      upgradesData.forEach(upgrade => {
        const operadorId = upgrade.operadorId;
        const operadorNome = upgrade.operadorNome;

        if (!operadoresMap.has(operadorId)) {
          operadoresMap.set(operadorId, {
            operadorId,
            operadorNome,
            upgradesAtivos: 0,
            upgradesReceptivos: 0,
            valorComissaoAtivos: 0,
            valorComissaoReceptivos: 0,
            valorTotalComissao: 0
          });
        }

        const operador = operadoresMap.get(operadorId)!;

        if (upgrade.tipoUpgrade === TipoUpgrade.ATIVO) {
          operador.upgradesAtivos++;
        } else if (upgrade.tipoUpgrade === TipoUpgrade.RECEPTIVO) {
          operador.upgradesReceptivos++;
        }
      });

      // Calcular comissões
      operadoresMap.forEach(operador => {
        operador.valorComissaoAtivos = calcularComissaoAtivos(operador.upgradesAtivos);
        operador.valorComissaoReceptivos = calcularComissaoReceptivos(operador.upgradesReceptivos);
        operador.valorTotalComissao = operador.valorComissaoAtivos + operador.valorComissaoReceptivos;
      });

      // Ordenar por valor total de comissão (decrescente)
      const comissoesArray = Array.from(operadoresMap.values())
        .sort((a, b) => b.valorTotalComissao - a.valorTotalComissao);

      setComissoes(comissoesArray);
    } catch (error) {
      console.error('Erro ao carregar comissões:', error);
      toast.error('Erro ao carregar dados de comissões');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadComissoes();
  }, [loadComissoes]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getComissoesFiltradas = () => {
    switch (viewMode) {
      case 'ativos':
        return comissoes.filter(c => c.upgradesAtivos > 0);
      case 'receptivos':
        return comissoes.filter(c => c.upgradesReceptivos > 0);
      default:
        return comissoes;
    }
  };

  const comissoesFiltradas = getComissoesFiltradas();

  const handleExportarRelatorio = async () => {
    try {
      setExportingPDF(true);
      
      const totalComissoes = comissoesFiltradas.reduce((sum, c) => sum + c.valorTotalComissao, 0);
      const mediaComissoes = comissoesFiltradas.length > 0 ? totalComissoes / comissoesFiltradas.length : 0;
      const mesAno = selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      await gerarRelatorioComissoesPDF({
        comissoes: comissoesFiltradas,
        mesAno,
        totalComissoes,
        totalOperadores: comissoesFiltradas.length,
        mediaComissoes,
        emailOperador: user?.email || undefined
      });

      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório. Tente novamente.');
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Comissões - {selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportarRelatorio}
          disabled={exportingPDF || comissoesFiltradas.length === 0}
          sx={{ minWidth: 160 }}
        >
          {exportingPDF ? (
            <>
              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
              Gerando...
            </>
          ) : (
            'Exportar PDF'
          )}
        </Button>
      </Box>

      {/* Controles */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Mês</InputLabel>
            <Select
              value={selectedMonth.toISOString().slice(0, 7)}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-');
                const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
                setSelectedMonth(newDate);
              }}
              label="Mês"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                return (
                  <MenuItem key={i} value={date.toISOString().slice(0, 7)}>
                    {date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Visualização</InputLabel>
            <Select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              label="Visualização"
            >
              <MenuItem value="todos">Todos os Upgrades</MenuItem>
              <MenuItem value="ativos">Apenas Ativos</MenuItem>
              <MenuItem value="receptivos">Apenas Receptivos</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Operadores
              </Typography>
              <Typography variant="h4">
                {comissoesFiltradas.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Comissões
              </Typography>
              <Typography variant="h4">
                {formatCurrency(comissoesFiltradas.reduce((sum, c) => sum + c.valorTotalComissao, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Média por Operador
              </Typography>
              <Typography variant="h4">
                {comissoesFiltradas.length > 0 
                  ? formatCurrency(comissoesFiltradas.reduce((sum, c) => sum + c.valorTotalComissao, 0) / comissoesFiltradas.length)
                  : formatCurrency(0)
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabela de Comissões */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Posição</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Operador</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                Upgrades Ativos
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                Upgrades Receptivos
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                Comissão Ativos
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                Comissão Receptivos
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comissoesFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="info">
                    Nenhum upgrade encontrado para o período selecionado.
                  </Alert>
                </TableCell>
              </TableRow>
            ) : (
              comissoesFiltradas.map((comissao, index) => (
                <TableRow key={comissao.operadorId} hover>
                  <TableCell>
                    <Chip 
                      label={`${index + 1}º`} 
                      color={index < 3 ? 'primary' : 'default'}
                      variant={index < 3 ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {comissao.operadorNome}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {comissao.operadorId}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6" color="primary">
                      {comissao.upgradesAtivos}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6" color="info.main">
                      {comissao.upgradesReceptivos}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" color="primary">
                      {formatCurrency(comissao.valorComissaoAtivos)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" color="info.main">
                      {formatCurrency(comissao.valorComissaoReceptivos)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      {formatCurrency(comissao.valorTotalComissao)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Informações sobre as Regras */}
      <Box sx={{ mt: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Regras de Comissão:
          </Typography>
          <Typography variant="body2">
            • <strong>Upgrades Ativos:</strong> Valor variável conforme quantidade (R$ 11,00 a R$ 28,00 por upgrade)
          </Typography>
          <Typography variant="body2">
            • <strong>Upgrades Receptivos:</strong> Valor fixo de R$ 9,00 por upgrade
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default ComissoesPage; 