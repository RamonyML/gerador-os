import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardData, Upgrade } from '../types';
import { format, startOfDay, endOfDay } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    totalUpgrades: 0,
    upgradesPorOperador: {},
    upgradesPorMeioContato: {},
    upgradesPorTipo: {},
    upgradesPorAssinatura: {},
  });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'supervisor') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const start = startOfDay(startDate);
      const end = endOfDay(endDate);

      const q = query(
        collection(db, 'upgrades'),
        where('data', '>=', Timestamp.fromDate(start)),
        where('data', '<=', Timestamp.fromDate(end))
      );

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

      setData(dashboardData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => navigate('/')}
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Filtrar por Período</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Inicial</label>
              <input
                type="date"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Final</label>
              <input
                type="date"
                value={format(endDate, 'yyyy-MM-dd')}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Total de Upgrades</h2>
          <p className="text-4xl font-bold text-primary-600">{data.totalUpgrades}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Upgrades por Operador</h2>
          <div className="space-y-2">
            {Object.entries(data.upgradesPorOperador).map(([operador, quantidade]) => (
              <div key={operador} className="flex justify-between items-center">
                <span className="text-gray-700">{operador}</span>
                <span className="font-semibold">{quantidade}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Upgrades por Meio de Contato</h2>
          <div className="space-y-2">
            {Object.entries(data.upgradesPorMeioContato).map(([meio, quantidade]) => (
              <div key={meio} className="flex justify-between items-center">
                <span className="text-gray-700">
                  {meio === 'presencial' ? 'Presencial' :
                   meio === 'ligacao' ? 'Ligação' :
                   meio === 'whatsapp' ? 'WhatsApp' : meio}
                </span>
                <span className="font-semibold">{quantidade}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Upgrades por Tipo</h2>
          <div className="space-y-2">
            {Object.entries(data.upgradesPorTipo).map(([tipo, quantidade]) => (
              <div key={tipo} className="flex justify-between items-center">
                <span className="text-gray-700">
                  {tipo === 'ativo' ? 'Ativo' :
                   tipo === 'receptivo' ? 'Receptivo' : tipo}
                </span>
                <span className="font-semibold">{quantidade}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Upgrades por Assinatura</h2>
          <div className="space-y-2">
            {Object.entries(data.upgradesPorAssinatura).map(([assinatura, quantidade]) => (
              <div key={assinatura} className="flex justify-between items-center">
                <span className="text-gray-700">
                  {assinatura === 'digital' ? 'Digital' :
                   assinatura === 'fisica' ? 'Físico' : assinatura}
                </span>
                <span className="font-semibold">{quantidade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 