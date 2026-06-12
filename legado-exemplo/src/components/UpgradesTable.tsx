import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Upgrade, User, MeioContato, TipoAssinatura, TipoUpgrade } from '../types';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CSVLink } from 'react-csv';
import useUser from '../hooks/useUser';
import InputMask from 'react-input-mask';
import toast from 'react-hot-toast';
import useLogger from '../hooks/useLogger';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface FormData extends Omit<Upgrade, 'id'> {
  tipoUpgrade: TipoUpgrade;
  observacao?: string;
}

const initialFormState: FormData = {
  meioContato: MeioContato.WHATSAPP,
  assinatura: TipoAssinatura.DIGITAL,
  tipoUpgrade: TipoUpgrade.ATIVO,
  data: Timestamp.fromDate(new Date()),
  cliente: '',
  numeroContato: '',
  operadorId: '',
  operadorNome: '',
  criadoEm: Timestamp.fromDate(new Date()),
  ultimaAtualizacao: Timestamp.fromDate(new Date())
};

interface UpgradesTableProps {
  onLogout: () => Promise<void>;
}

const UpgradesTable: React.FC<UpgradesTableProps> = ({ onLogout }) => {
  const { user, loading: userLoading } = useUser();
  const { logAction } = useLogger();
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Upgrade>>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterOperador, setFilterOperador] = useState('');
  const [filterCliente, setFilterCliente] = useState('');
  const [filterMeioContato, setFilterMeioContato] = useState<MeioContato | ''>('');
  const [filterTipoUpgrade, setFilterTipoUpgrade] = useState<TipoUpgrade | ''>('');
  const navigate = useNavigate();

  const loadUpgrades = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      let q = query(collection(db, 'upgrades'), orderBy('data', 'desc'));

      if (filterDate) {
        const startOfDay = new Date(filterDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filterDate);
        endOfDay.setHours(23, 59, 59, 999);
        q = query(q, where('data', '>=', Timestamp.fromDate(startOfDay)), where('data', '<=', Timestamp.fromDate(endOfDay)));
      }

      if (filterOperador) {
        q = query(q, where('operadorId', '==', filterOperador));
      }

      if (filterCliente) {
        q = query(q, where('cliente', '==', filterCliente));
      }

      if (filterMeioContato) {
        q = query(q, where('meioContato', '==', filterMeioContato));
      }

      if (filterTipoUpgrade) {
        q = query(q, where('tipoUpgrade', '==', filterTipoUpgrade));
      }

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

      setUpgrades(upgradesData);
    } catch (error) {
      console.error('Erro ao carregar upgrades:', error);
      toast.error('Erro ao carregar upgrades');
    } finally {
      setLoading(false);
    }
  }, [user, filterDate, filterOperador, filterCliente, filterMeioContato, filterTipoUpgrade]);

  useEffect(() => {
    if (!userLoading) {
      loadUpgrades();
    }
  }, [userLoading, loadUpgrades]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newUpgrade = {
        ...formData,
        operadorId: user?.email || '',
        operadorNome: user?.name || '',
        data: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'upgrades'), newUpgrade);
      await logAction({
        action: 'create',
        details: newUpgrade,
        targetId: docRef.id,
        targetCollection: 'upgrades'
      });
      
      toast.success('Upgrade registrado com sucesso!');
      setFormData(initialFormState);
      loadUpgrades();
    } catch (error) {
      console.error('Erro ao registrar upgrade:', error);
      toast.error('Erro ao registrar upgrade');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (window.confirm('Tem certeza que deseja excluir este upgrade?')) {
      try {
        await deleteDoc(doc(db, 'upgrades', id));
        await logAction({
          action: 'delete',
          targetCollection: 'upgrades',
          targetId: id,
        });
        toast.success('Upgrade excluído com sucesso!');
        loadUpgrades();
      } catch (error) {
        console.error('Erro ao excluir upgrade:', error);
        toast.error('Erro ao excluir upgrade');
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    
    setSubmitting(true);

    try {
      const upgradeRef = doc(db, 'upgrades', editingId);
      const oldData = (await getDoc(upgradeRef)).data();
      
      await updateDoc(upgradeRef, {
        ...formData,
        dataEdicao: serverTimestamp(),
      });

      await logAction({
        action: 'update',
        details: {
          old: oldData,
          new: formData,
        },
        targetId: editingId,
        targetCollection: 'upgrades'
      });

      toast.success('Upgrade atualizado com sucesso!');
      setFormData(initialFormState);
      setEditingId(null);
      loadUpgrades();
    } catch (error) {
      console.error('Erro ao atualizar upgrade:', error);
      toast.error('Erro ao atualizar upgrade');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  };

  const getMeioContatoLabel = (meioContato: MeioContato | undefined) => {
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

  const getAssinaturaLabel = (assinatura: TipoAssinatura | undefined) => {
    switch (assinatura) {
      case 'digital':
        return 'Digital';
      case 'fisica':
        return 'Físico';
      default:
        return '';
    }
  };

  const getTipoUpgradeLabel = (tipo: TipoUpgrade | undefined) => {
    switch (tipo) {
      case 'ativo':
        return 'Ativo';
      case 'receptivo':
        return 'Receptivo';
      default:
        return '';
    }
  };

  const handleExportToExcel = () => {
    const filteredData = getFilteredUpgrades().map(upgrade => ({
      'Data': formatDate(upgrade.data?.toDate()),
      'Cliente': upgrade.cliente || '',
      'Meio de Contato': getMeioContatoLabel(upgrade.meioContato),
      'Número de Contato': upgrade.numeroContato || '',
      'Assinatura': getAssinaturaLabel(upgrade.assinatura),
      'Tipo': getTipoUpgradeLabel(upgrade.tipoUpgrade),
      'Operador': upgrade.operadorNome || '',
      'Observações': upgrade.observacao || '',
    }));

    return filteredData;
  };

  const getFilteredUpgrades = () => {
    return upgrades.filter(upgrade => {
      if (upgrade.data && filterDate) {
        const upgradeDate = format(upgrade.data.toDate(), 'yyyy-MM-dd');
        const filterDateStr = format(filterDate, 'yyyy-MM-dd');
        if (upgradeDate !== filterDateStr) return false;
      }
      if (filterMeioContato && upgrade.meioContato !== filterMeioContato) {
        return false;
      }
      if (filterTipoUpgrade && upgrade.tipoUpgrade !== filterTipoUpgrade) {
        return false;
      }
    return true;
  });
  };

  const filteredUpgrades = getFilteredUpgrades();

  const totalPages = Math.ceil(filteredUpgrades.length / itemsPerPage);
  const paginatedUpgrades = filteredUpgrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const csvData = handleExportToExcel();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {editingId ? 'Editar Upgrade' : 'Novo Upgrade'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Sair
          </button>
          {user?.role === 'supervisor' && (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Dashboard
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <form onSubmit={editingId ? handleEdit : handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data</label>
              <DatePicker
                selected={formData.data?.toDate()}
                onChange={(date: Date | null) => date && setFormData({ ...formData, data: Timestamp.fromDate(date) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                dateFormat="dd/MM/yyyy"
                locale={ptBR}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cliente</label>
              <input
                type="text"
                value={formData.cliente || ''}
                onChange={e => setFormData({ ...formData, cliente: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
                maxLength={100}
                placeholder="Nome completo do cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Meio de Contato</label>
              <select
                value={formData.meioContato || ''}
                onChange={e => setFormData({ ...formData, meioContato: e.target.value as MeioContato })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="presencial">Presencial</option>
                <option value="ligacao">Ligação</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Contato</label>
              <InputMask
                mask="(99) 99999-9999"
                value={formData.numeroContato || ''}
                onChange={e => setFormData({ ...formData, numeroContato: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Assinatura</label>
              <select
                value={formData.assinatura || ''}
                onChange={e => setFormData({ ...formData, assinatura: e.target.value as TipoAssinatura })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="digital">Digital</option>
                <option value="fisica">Físico</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo</label>
              <select
                value={formData.tipoUpgrade || ''}
                onChange={e => setFormData({ ...formData, tipoUpgrade: e.target.value as TipoUpgrade })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="ativo">Ativo</option>
                <option value="receptivo">Receptivo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Observação</label>
            <textarea
              value={formData.observacao || ''}
              onChange={e => setFormData({ ...formData, observacao: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              rows={4}
              placeholder="Observações adicionais"
            />
          </div>

          <div className="flex justify-end space-x-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData(initialFormState);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {submitting ? 'Salvando...' : editingId ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Buscar</label>
              <input
                type="text"
                value={filterCliente}
                onChange={e => setFilterCliente(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Buscar por cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Filtrar por Data</label>
              <DatePicker
                selected={filterDate}
                onChange={(date: Date | null) => setFilterDate(date)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                dateFormat="dd/MM/yyyy"
                locale={ptBR}
                isClearable
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Filtrar por Operador</label>
              <select
                value={filterOperador}
                onChange={e => setFilterOperador(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Todos</option>
                {user && user.role === 'supervisor' && (
                  <option value={user.uid}>{user.name}</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Filtrar por Meio de Contato</label>
              <select
                value={filterMeioContato}
                onChange={e => setFilterMeioContato(e.target.value as MeioContato | '')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Todos</option>
                <option value="presencial">Presencial</option>
                <option value="ligacao">Ligação</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Filtrar por Tipo de Upgrade</label>
              <select
                value={filterTipoUpgrade}
                onChange={e => setFilterTipoUpgrade(e.target.value as TipoUpgrade | '')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Todos</option>
                <option value="ativo">Ativo</option>
                <option value="receptivo">Receptivo</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredUpgrades.length} {filteredUpgrades.length === 1 ? 'registro encontrado' : 'registros encontrados'}
            </p>
            <CSVLink
              data={csvData}
              filename={`upgrades-${format(new Date(), 'dd-MM-yyyy')}.csv`}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Exportar CSV
            </CSVLink>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meio de Contato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assinatura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operador</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUpgrades.map((upgrade) => (
                  <tr key={upgrade.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {upgrade.data ? formatDate(upgrade.data.toDate()) : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{upgrade.cliente}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getMeioContatoLabel(upgrade.meioContato)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{upgrade.numeroContato}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getAssinaturaLabel(upgrade.assinatura)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getTipoUpgradeLabel(upgrade.tipoUpgrade)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{upgrade.operadorNome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          if (upgrade.id) {
                          setEditingId(upgrade.id);
                          setFormData(upgrade);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="text-primary-600 hover:text-primary-900 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(upgrade.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> até{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredUpgrades.length)}
                  </span>{' '}
                  de <span className="font-medium">{filteredUpgrades.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradesTable; 