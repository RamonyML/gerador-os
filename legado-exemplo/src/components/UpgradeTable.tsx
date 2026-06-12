import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TableSortLabel,
  Typography,
  DialogActions,
  DialogContentText,
  Checkbox,
  Tooltip,
  Grid,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, GetApp as DownloadIcon, Refresh as RefreshIcon, Visibility as VisibilityIcon, Flag as FlagIcon, History as HistoryIcon, Tv as TvIcon } from '@mui/icons-material';
import { collection, query, where, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Upgrade, MeioContato, TipoAssinatura, TipoUpgrade, GERENTE_EMAILS, SUPERVISOR_EMAILS } from '../types';
import { format, startOfMonth as dateStartOfMonth, endOfMonth as dateEndOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import UpgradeForm from './UpgradeForm';
import * as XLSX from 'xlsx';
import useLogger from '../hooks/useLogger';
import { debounce } from 'lodash';
import MonthNavigator from './MonthNavigator';

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Upgrade | 'actions' | 'select';
  label: string;
  sortable: boolean;
}

interface ExcelUpgradeRow {
  'Data do Upgrade': string;
  'Cliente': string;
  'Meio de Contato': string;
  'Numero': string;
  'Assinatura': string;
  'Tipo': string;
  'Operador': string;
  'Observacoes': string;
  'Roku': string;
  'Registrado em': string;
  'Registrado por': string;
  'Ultima edicao': string;
  'Editado por': string;
}

const headCells: HeadCell[] = [
  { id: 'select', label: '', sortable: false },
  { id: 'data', label: 'Data do Upgrade', sortable: true },
  { id: 'duplicado', label: '', sortable: false },
  { id: 'cliente', label: 'Cliente', sortable: true },
  { id: 'meioContato', label: 'Meio de Contato', sortable: true },
  { id: 'numeroContato', label: 'Numero', sortable: true },
  { id: 'assinatura', label: 'Assinatura', sortable: true },
  { id: 'tipoUpgrade', label: 'Tipo', sortable: true },
  { id: 'operadorNome', label: 'Operador', sortable: true },
  { id: 'actions', label: 'Ações', sortable: false },
];

const UpgradeTable: React.FC = () => {
  const { user } = useAuth();
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingUpgrade, setEditingUpgrade] = useState<Upgrade | null>(null);
  const [viewingUpgrade, setViewingUpgrade] = useState<Upgrade | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [filterMeioContato, setFilterMeioContato] = useState<MeioContato | ''>('');
  const [filterTipoUpgrade, setFilterTipoUpgrade] = useState<TipoUpgrade | ''>('');
  const [filterOperador, setFilterOperador] = useState<string>('');
  const [operadores, setOperadores] = useState<{id: string, nome: string}[]>([]);
  const { logAction } = useLogger();
  const [orderBy, setOrderBy] = useState<keyof Upgrade>('data');
  const [order, setOrder] = useState<Order>('desc');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [upgradeToDelete, setUpgradeToDelete] = useState<Upgrade | null>(null);
  const [selectedUpgrades, setSelectedUpgrades] = useState<string[]>([]);
  const [deleteMultipleConfirmOpen, setDeleteMultipleConfirmOpen] = useState(false);
  const [allRowsOption, setAllRowsOption] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUpgrades, setFilteredUpgrades] = useState<Upgrade[]>([]);

  const isGerente = user?.email && GERENTE_EMAILS.includes(user.email);
  const isSupervisor = user?.email && SUPERVISOR_EMAILS.includes(user.email);
  const isAdmin = isGerente || isSupervisor;

  const handleRequestSort = (property: keyof Upgrade) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const loadOperadores = useCallback(async () => {
    try {
      const operadoresSet = new Set<string>();
      const operadoresMap = new Map<string, string>();
      
      upgrades.forEach(upgrade => {
        if (upgrade.operadorId && upgrade.operadorNome) {
          operadoresSet.add(upgrade.operadorId);
          operadoresMap.set(upgrade.operadorId, upgrade.operadorNome);
        }
      });

      const operadoresList = Array.from(operadoresSet).map(id => ({
        id,
        nome: operadoresMap.get(id) || id
      }));

      setOperadores(operadoresList);
    } catch (error) {
      console.error('Erro ao carregar operadores:', error);
    }
  }, [upgrades]);

  const loadUpgrades = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = dateStartOfMonth(selectedMonth);
      const endDate = dateEndOfMonth(selectedMonth);

      let q = query(
        collection(db, 'upgrades'),
        where('data', '>=', Timestamp.fromDate(startDate)),
        where('data', '<=', Timestamp.fromDate(endDate))
      );

      // Se não for gerente ou supervisor, filtrar apenas os upgrades do operador
      if (!isAdmin && user?.email) {
        q = query(q, where('operadorId', '==', user.email));
      }

      const querySnapshot = await getDocs(q);
      let upgradesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Upgrade[];

      // Ordenação local
      upgradesData = upgradesData.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];

        if (!aValue || !bValue) return 0;

        if (orderBy === 'data') {
          return order === 'asc' 
            ? (a.data as Timestamp).toMillis() - (b.data as Timestamp).toMillis()
            : (b.data as Timestamp).toMillis() - (a.data as Timestamp).toMillis();
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return order === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return 0;
      });

      // Aplicar filtros localmente
      if (filterMeioContato) {
        upgradesData = upgradesData.filter(upgrade => upgrade.meioContato === filterMeioContato);
      }

      if (filterTipoUpgrade) {
        upgradesData = upgradesData.filter(upgrade => upgrade.tipoUpgrade === filterTipoUpgrade);
      }

      if (filterOperador) {
        upgradesData = upgradesData.filter(upgrade => upgrade.operadorId === filterOperador);
      }

      setUpgrades(upgradesData);
    } catch (error) {
      console.error('Erro ao carregar upgrades:', error);
      toast.error('Erro ao carregar upgrades');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, filterMeioContato, filterTipoUpgrade, filterOperador, orderBy, order, isAdmin, user?.email]);

  useEffect(() => {
    loadUpgrades();
  }, [loadUpgrades]);

  useEffect(() => {
    loadOperadores();
  }, [loadOperadores]);

  const handleEdit = (upgrade: Upgrade) => {
    if (isAdmin || upgrade.operadorId === user?.email) {
      setEditingUpgrade(upgrade);
    } else {
      toast.error('Você não tem permissão para editar este upgrade');
    }
  };

  const handleDeleteClick = (upgrade: Upgrade) => {
    if (isAdmin || upgrade.operadorId === user?.email) {
      setUpgradeToDelete(upgrade);
      setDeleteConfirmOpen(true);
    } else {
      toast.error('Você não tem permissão para excluir este upgrade');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!upgradeToDelete?.id) return;
    
    try {
      await deleteDoc(doc(db, 'upgrades', upgradeToDelete.id));
      await logAction({
        action: 'delete',
        targetCollection: 'upgrades',
        targetId: upgradeToDelete.id,
      });
      toast.success('Upgrade excluído com sucesso!');
      loadUpgrades();
    } catch (error) {
      console.error('Erro ao excluir upgrade:', error);
      toast.error('Erro ao excluir upgrade');
    } finally {
      setDeleteConfirmOpen(false);
      setUpgradeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setUpgradeToDelete(null);
  };

  // Função para remover formatação do telefone (apenas números)
  const removePhoneFormatting = (phone: string): string => {
    if (!phone) return '';
    return phone.replace(/\D/g, ''); // Remove tudo que não é dígito
  };

  const handleExportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    const filteredData = upgrades
      .map((upgrade): ExcelUpgradeRow => ({
        'Data do Upgrade': upgrade.data ? format(upgrade.data.toDate(), 'dd/MM/yyyy') : 'Sem data',
        'Cliente': upgrade.cliente || '',
        'Meio de Contato': getMeioContatoLabel(upgrade.meioContato),
        'Numero': removePhoneFormatting(upgrade.numeroContato || ''),
        'Assinatura': getAssinaturaLabel(upgrade.assinatura),
        'Tipo': getTipoUpgradeLabel(upgrade.tipoUpgrade),
        'Operador': upgrade.operadorNome || '',
        'Observacoes': upgrade.observacao || '',
        'Roku': upgrade.isRoku ? 'Sim' : 'Não',
        'Registrado em': upgrade.criadoEm ? format(upgrade.criadoEm.toDate(), 'dd/MM/yyyy HH:mm') : 'Sem data',
        'Registrado por': upgrade.createdBy || upgrade.operadorNome || '',
        'Ultima edicao': upgrade.ultimaAtualizacao ? format(upgrade.ultimaAtualizacao.toDate(), 'dd/MM/yyyy HH:mm') : 'Sem data',
        'Editado por': upgrade.updatedBy || upgrade.operadorNome || '',
      }));

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Upgrades');
    
    let fileName = 'upgrades';
    fileName += `_${format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}`;
    if (filterOperador) {
      const operador = operadores.find(op => op.id === filterOperador);
      if (operador) fileName += `_${operador.nome}`;
    }
    fileName += '.xlsx';

    XLSX.writeFile(workbook, fileName);
  };



  const getMeioContatoLabel = (meioContato: MeioContato | undefined): string => {
    switch (meioContato) {
      case 'presencial':
        return 'Presencial';
      case 'ligacao':
        return 'Ligação';
      case 'whatsapp':
        return 'WhatsApp';
      default:
        return '';
    }
  };

  const getAssinaturaLabel = (assinatura: TipoAssinatura | undefined): string => {
    switch (assinatura) {
      case 'digital':
        return 'Digital';
      case 'fisica':
        return 'Físico';
      default:
        return '';
    }
  };

  const getTipoUpgradeLabel = (tipo: TipoUpgrade | undefined): string => {
    switch (tipo) {
      case 'ativo':
        return 'Ativo';
      case 'receptivo':
        return 'Receptivo';
      default:
        return '';
    }
  };





  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const upgradesList = searchTerm.length >= 2 ? filteredUpgrades : upgrades;
      const newSelected = upgradesList
        .filter(upgrade => upgrade.id && (isAdmin || upgrade.operadorId === user?.email))
        .map(upgrade => upgrade.id)
        .filter((id): id is string => id !== undefined);
      setSelectedUpgrades(newSelected);
      return;
    }
    setSelectedUpgrades([]);
  };

  const handleSelectClick = (id: string | undefined) => {
    if (!id) return;
    
    const selectedIndex = selectedUpgrades.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selectedUpgrades, id];
    } else {
      newSelected = [
        ...selectedUpgrades.slice(0, selectedIndex),
        ...selectedUpgrades.slice(selectedIndex + 1)
      ];
    }

    setSelectedUpgrades(newSelected);
  };

  const handleDeleteMultipleClick = () => {
    setDeleteMultipleConfirmOpen(true);
  };

  const handleDeleteMultipleConfirm = async () => {
    try {
      setLoading(true);
      for (const id of selectedUpgrades) {
        await deleteDoc(doc(db, 'upgrades', id));
        logAction({
          action: 'delete',
          targetCollection: 'upgrades',
          targetId: id
        });
      }
      toast.success('Upgrades excluídos com sucesso');
      setSelectedUpgrades([]);
      loadUpgrades();
    } catch (error) {
      console.error('Erro ao excluir upgrades:', error);
      toast.error('Erro ao excluir upgrades');
    } finally {
      setDeleteMultipleConfirmOpen(false);
      setLoading(false);
    }
  };

  const handleDeleteMultipleCancel = () => {
    setDeleteMultipleConfirmOpen(false);
  };

  const handleRefresh = useCallback(() => {
    loadUpgrades();
  }, [loadUpgrades]);

  // Atualização automática quando um upgrade é editado
  useEffect(() => {
    if (!editingUpgrade) {
      handleRefresh();
    }
  }, [editingUpgrade, handleRefresh]);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '-1') {
      setAllRowsOption(true);
      setRowsPerPage(upgrades.length);
    } else {
      setAllRowsOption(false);
      setRowsPerPage(parseInt(value, 10));
    }
    setPage(0);
  };

  // Função para filtrar upgrades baseado no termo de busca
  const filterUpgradesBySearchTerm = useCallback((upgrades: Upgrade[], term: string) => {
    if (!term || term.length < 2) return upgrades;
    
    const searchTermLower = term.toLowerCase();
    return upgrades.filter(upgrade => 
      upgrade.cliente?.toLowerCase().includes(searchTermLower)
    );
  }, []);

  // Efeito para atualizar os upgrades filtrados quando o termo de busca ou os upgrades mudam
  useEffect(() => {
    const filtered = filterUpgradesBySearchTerm(upgrades, searchTerm);
    setFilteredUpgrades(filtered);
  }, [upgrades, searchTerm, filterUpgradesBySearchTerm]);

  // Handler para mudança no campo de busca com debounce
  const handleSearchChange = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, 300);

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Buscar cliente"
          variant="outlined"
          size="small"
          onChange={handleSearchChange}
          sx={{ width: '100%' }}
          placeholder="Digite para buscar..."
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <MonthNavigator 
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />

          {!isAdmin && (
            <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
              Você está visualizando apenas seus próprios upgrades
            </Typography>
          )}

          {isAdmin && (
            <FormControl style={{ minWidth: 200 }}>
              <InputLabel>Operador</InputLabel>
              <Select
                value={filterOperador}
                onChange={(e) => setFilterOperador(e.target.value)}
                label="Operador"
              >
                <MenuItem value="">Todos</MenuItem>
                {operadores.map(operador => (
                  <MenuItem key={operador.id} value={operador.id}>{operador.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl style={{ minWidth: 150 }}>
            <InputLabel>Meio de Contato</InputLabel>
            <Select
              value={filterMeioContato}
              onChange={(e) => setFilterMeioContato(e.target.value as MeioContato | '')}
              label="Meio de Contato"
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.values(MeioContato).map(meio => (
                <MenuItem key={meio} value={meio}>{getMeioContatoLabel(meio)}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl style={{ minWidth: 150 }}>
            <InputLabel>Tipo de Upgrade</InputLabel>
            <Select
              value={filterTipoUpgrade}
              onChange={(e) => setFilterTipoUpgrade(e.target.value as TipoUpgrade | '')}
              label="Tipo de Upgrade"
            >
              <MenuItem value="">Todos</MenuItem>
              {Object.values(TipoUpgrade).map(tipo => (
                <MenuItem key={tipo} value={tipo}>{getTipoUpgradeLabel(tipo)}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Atualizar lista">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            onClick={handleExportToExcel}
            startIcon={<DownloadIcon />}
          >
            Exportar para Excel
          </Button>

          {selectedUpgrades.length > 0 && (
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteMultipleClick}
              disabled={loading}
            >
              Excluir Selecionados ({selectedUpgrades.length})
            </Button>
          )}
        </Box>
      </Box>

      <Dialog 
        open={!!editingUpgrade} 
        onClose={() => setEditingUpgrade(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Editar Upgrade
        </DialogTitle>
        <DialogContent>
          <UpgradeForm
            upgradeId={editingUpgrade?.id}
            onSuccess={() => {
              setEditingUpgrade(null);
              loadUpgrades();
            }}
            onCancel={() => setEditingUpgrade(null)}
          />
        </DialogContent>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selectedUpgrades.length > 0 && selectedUpgrades.length < (searchTerm.length >= 2 ? filteredUpgrades.length : upgrades.length)}
                  checked={(searchTerm.length >= 2 ? filteredUpgrades.length : upgrades.length) > 0 && selectedUpgrades.length === (searchTerm.length >= 2 ? filteredUpgrades.length : upgrades.length)}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              {headCells.map((headCell) => (
                headCell.id !== 'select' && (
                  <TableCell
                    key={headCell.id}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id as keyof Upgrade)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                )
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(searchTerm.length >= 2 ? filteredUpgrades : upgrades)
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((upgrade) => {
                const isSelected = upgrade.id ? selectedUpgrades.indexOf(upgrade.id) !== -1 : false;
                const canModify = isAdmin || upgrade.operadorId === user?.email;

                return (
                  <TableRow key={upgrade.id}>
                    <TableCell padding="checkbox">
                      {canModify && upgrade.id && (
                        <Checkbox
                          color="primary"
                          checked={isSelected}
                          onChange={() => handleSelectClick(upgrade.id)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {upgrade.data ? format(upgrade.data.toDate(), 'dd/MM/yyyy', { locale: ptBR }) : ''}
                    </TableCell>
                    <TableCell padding="none" style={{ width: '80px' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        {upgrade.duplicado && (
                          <Tooltip title="Registro de upgrade duplicado" arrow>
                            <FlagIcon sx={{ color: 'warning.main' }} />
                          </Tooltip>
                        )}
                        {upgrade.isRoku && (
                          <Tooltip title="Venda de Roku TV" arrow>
                            <TvIcon sx={{ color: '#9c27b0' }} />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{upgrade.cliente}</TableCell>
                    <TableCell>{getMeioContatoLabel(upgrade.meioContato)}</TableCell>
                    <TableCell>{upgrade.numeroContato}</TableCell>
                    <TableCell>{upgrade.isRoku ? '-' : getAssinaturaLabel(upgrade.assinatura)}</TableCell>
                    <TableCell>{getTipoUpgradeLabel(upgrade.tipoUpgrade)}</TableCell>
                    <TableCell>{upgrade.operadorNome}</TableCell>
                    <TableCell>
                      <Tooltip title="Visualizar">
                        <IconButton
                          onClick={() => setViewingUpgrade(upgrade)}
                          color="primary"
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          onClick={() => handleEdit(upgrade)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Histórico de Auditoria">
                        <IconButton
                          onClick={() => setViewingUpgrade(upgrade)}
                          color="info"
                          size="small"
                        >
                          <HistoryIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          onClick={() => handleDeleteClick(upgrade)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100, 200, { label: 'Todos', value: -1 }]}
        component="div"
        count={searchTerm.length >= 2 ? filteredUpgrades.length : upgrades.length}
        rowsPerPage={allRowsOption ? (searchTerm.length >= 2 ? filteredUpgrades.length : upgrades.length) : rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Registros por página"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Você está prestes a excluir o registro do cliente{' '}
            <strong>{upgradeToDelete?.cliente}</strong>.
            <br /><br />
            Esta ação não poderá ser revertida. Deseja continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteMultipleConfirmOpen}
        onClose={handleDeleteMultipleCancel}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir os {selectedUpgrades.length} upgrades selecionados? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteMultipleCancel}>Cancelar</Button>
          <Button onClick={handleDeleteMultipleConfirm} color="error" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!viewingUpgrade}
        onClose={() => setViewingUpgrade(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalhes do Upgrade
        </DialogTitle>
        <DialogContent>
          <UpgradeForm
            upgradeId={viewingUpgrade?.id}
            onSuccess={() => setViewingUpgrade(null)}
            onCancel={() => setViewingUpgrade(null)}
            readOnly
          />
          
          {/* Informações de Auditoria */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
              Informações de Auditoria
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Registrado em:</strong>
                </Typography>
                <Typography variant="body1">
                  {viewingUpgrade?.criadoEm ? format(viewingUpgrade.criadoEm.toDate(), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Não informado'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Registrado por:</strong>
                </Typography>
                <Typography variant="body1">
                  {viewingUpgrade?.createdBy || viewingUpgrade?.operadorNome || 'Não informado'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Última edição:</strong>
                </Typography>
                <Typography variant="body1">
                  {viewingUpgrade?.ultimaAtualizacao ? format(viewingUpgrade.ultimaAtualizacao.toDate(), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Não informado'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Editado por:</strong>
                </Typography>
                <Typography variant="body1">
                  {viewingUpgrade?.updatedBy || viewingUpgrade?.operadorNome || 'Não informado'}
                </Typography>
              </Grid>
              {viewingUpgrade?.criadoEm && viewingUpgrade?.ultimaAtualizacao && 
               viewingUpgrade.criadoEm.toMillis() !== viewingUpgrade.ultimaAtualizacao.toMillis() && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Este registro foi editado após sua criação inicial.
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setViewingUpgrade(null)} 
            color="error"
            variant="contained"
          >
            Fechar
          </Button>
          <Button
            onClick={() => {
              handleEdit(viewingUpgrade!);
              setViewingUpgrade(null);
            }}
            color="primary"
            variant="contained"
            sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
          >
            Editar
          </Button>
          <Button
            onClick={() => {
              loadUpgrades();
              setViewingUpgrade(null);
            }}
            color="success"
            variant="contained"
          >
            Atualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UpgradeTable; 