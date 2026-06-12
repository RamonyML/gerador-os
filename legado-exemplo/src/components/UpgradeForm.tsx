import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  SelectChangeEvent,
  Tabs,
  Tab,
} from '@mui/material';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  collection, 
  serverTimestamp, 
  Timestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Upgrade, MeioContato, TipoAssinatura, TipoUpgrade } from '../types';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import useLogger from '../hooks/useLogger';
import InputMask from 'react-input-mask';
import { format, subMonths, startOfMonth } from 'date-fns';

interface UpgradeFormProps {
  upgradeId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
  initialData?: Partial<Upgrade>;
  defaultTab?: 'upgrade' | 'roku';
}

const UpgradeForm: React.FC<UpgradeFormProps> = ({ upgradeId: propUpgradeId, onSuccess, onCancel, readOnly = false, initialData, defaultTab = 'upgrade' }) => {
  const { upgradeId: urlUpgradeId } = useParams<{ upgradeId: string }>();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logAction } = useLogger();
  const [activeTab, setActiveTab] = useState<'upgrade' | 'roku'>(initialData?.isRoku ? 'roku' : defaultTab);
  
  const initialFormState: Partial<Upgrade> = {
    data: initialData?.data || Timestamp.fromDate(new Date()),
    cliente: initialData?.cliente || '',
    meioContato: initialData?.meioContato,
    numeroContato: initialData?.numeroContato || '',
    assinatura: initialData?.assinatura,
    tipoUpgrade: initialData?.tipoUpgrade || (initialData?.isRoku ? TipoUpgrade.ATIVO : undefined),
    observacao: initialData?.observacao || '',
    operadorId: initialData?.operadorId || user?.email || '',
    operadorNome: initialData?.operadorNome || user?.name || '',
    duplicado: initialData?.duplicado || false,
    isRoku: initialData?.isRoku || false,
    criadoEm: initialData?.criadoEm || Timestamp.fromDate(new Date()),
    ultimaAtualizacao: initialData?.ultimaAtualizacao || Timestamp.fromDate(new Date())
  };
  const [formData, setFormData] = useState<Partial<Upgrade>>(initialFormState);

  const effectiveUpgradeId = propUpgradeId || urlUpgradeId;

  const loadUpgrade = useCallback(async () => {
    if (!effectiveUpgradeId) return;
    try {
      setLoading(true);
      const docRef = doc(db, 'upgrades', effectiveUpgradeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        const isRoku = data?.isRoku ?? false;
        setFormData({
          ...data,
          id: effectiveUpgradeId,
          data: data?.data ?? Timestamp.fromDate(new Date()),
          cliente: data?.cliente ?? '',
          meioContato: data?.meioContato ?? undefined,
          numeroContato: data?.numeroContato ?? '',
          assinatura: data?.assinatura ?? undefined,
          tipoUpgrade: data?.tipoUpgrade ?? undefined,
          observacao: data?.observacao ?? '',
          operadorId: data?.operadorId ?? '',
          operadorNome: data?.operadorNome ?? '',
          duplicado: data?.duplicado ?? false,
          isRoku: isRoku,
          criadoEm: data?.criadoEm ?? Timestamp.fromDate(new Date()),
          ultimaAtualizacao: data?.ultimaAtualizacao ?? Timestamp.fromDate(new Date()),
        });
        // Atualiza a aba se for Roku
        if (isRoku) {
          setActiveTab('roku');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar upgrade:', error);
      toast.error('Erro ao carregar upgrade');
    } finally {
      setLoading(false);
    }
  }, [effectiveUpgradeId]);

  useEffect(() => {
    loadUpgrade();
  }, [loadUpgrade]);

  const checkDuplicateUpgrade = async (clienteName: string, isRoku: boolean): Promise<boolean> => {
    try {
      // Calcula a data de 10 meses atrás
      const tenMonthsAgo = subMonths(new Date(), 10);
      
      // Cria a query para buscar upgrades do mesmo cliente nos últimos 10 meses
      const upgradesRef = collection(db, 'upgrades');
      const q = query(
        upgradesRef,
        where('cliente', '==', clienteName.toUpperCase())
      );

      const querySnapshot = await getDocs(q);
      
      // Filtra os documentos para excluir o upgrade atual em caso de edição
      // verifica se a data está dentro dos últimos 10 meses
      // e verifica se é do mesmo tipo (Roku ou Upgrade)
      const duplicates = querySnapshot.docs.filter(doc => {
        if (effectiveUpgradeId && doc.id === effectiveUpgradeId) return false;
        const data = doc.data() as any;
        if (!data?.data) return false;
        const upgradeDate = data.data.toDate();
        if (upgradeDate < tenMonthsAgo) return false;
        
        // Verifica se é do mesmo tipo (Roku ou Upgrade)
        const docIsRoku = data?.isRoku === true;
        return docIsRoku === isRoku;
      });

      return duplicates.length > 0;
    } catch (error) {
      console.error('Erro ao verificar duplicidade:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação dos campos obrigatórios
    if (!formData.data) {
      toast.error('A data é obrigatória');
      return;
    }
    if (!formData.cliente?.trim()) {
      toast.error('O nome do cliente é obrigatório');
      return;
    }
    if (!formData.meioContato) {
      toast.error('O meio de contato é obrigatório');
      return;
    }
    if (formData.meioContato !== 'presencial' && !formData.numeroContato?.trim()) {
      toast.error('O número de contato é obrigatório');
      return;
    }
    // Assinatura só é obrigatória se não for Roku
    if (!formData.isRoku && !formData.assinatura) {
      toast.error('O tipo de assinatura é obrigatório');
      return;
    }
    if (!formData.tipoUpgrade) {
      toast.error('O tipo de upgrade é obrigatório');
      return;
    }

    try {
      setLoading(true);

      // Verifica duplicidade (considerando se é Roku ou Upgrade)
      const isRoku = activeTab === 'roku';
      const isDuplicate = await checkDuplicateUpgrade(formData.cliente!, isRoku);
      
      if (isDuplicate) {
        const shouldProceed = window.confirm(
          `Um ${isRoku ? 'registro de Roku' : 'upgrade'} já foi registrado para o cliente ${formData.cliente} dentro dos últimos 10 meses. Deseja mesmo seguir com o registro?`
        );
        
        if (!shouldProceed) {
          setLoading(false);
          return;
        }
      }

      const now = new Date();
      
      // Prepara os dados do upgrade, removendo campos undefined
      const upgradeData: any = {
        cliente: formData.cliente,
        meioContato: formData.meioContato,
        numeroContato: formData.numeroContato || '',
        observacao: formData.observacao || '',
        duplicado: isDuplicate,
        isRoku: isRoku,
        tipoUpgrade: isRoku ? TipoUpgrade.ATIVO : formData.tipoUpgrade,
        data: formData.data || Timestamp.fromDate(now),
        ultimaAtualizacao: Timestamp.fromDate(now),
        updatedBy: user?.email || ''
      };
      
      // Adiciona assinatura apenas se não for Roku e se existir
      if (!isRoku && formData.assinatura) {
        upgradeData.assinatura = formData.assinatura;
      }

      if (effectiveUpgradeId) {
        const docRef = doc(db, 'upgrades', effectiveUpgradeId);
        const currentData = (await getDoc(docRef)).data();
        
        await updateDoc(docRef, {
          ...upgradeData,
          operadorId: (currentData as any)?.operadorId ?? '',
          operadorNome: (currentData as any)?.operadorNome ?? '',
        });

        await logAction({
          action: 'update',
          targetCollection: 'upgrades',
          targetId: effectiveUpgradeId,
          details: upgradeData,
        });
        toast.success('Upgrade atualizado com sucesso!');
      } else {
        const docRef = await addDoc(collection(db, 'upgrades'), {
          ...upgradeData,
          criadoEm: Timestamp.fromDate(now),
          createdBy: user?.email || '',
          operadorId: user?.email || '',
          operadorNome: user?.name || '',
        });
        await logAction({
          action: 'create',
          targetCollection: 'upgrades',
          targetId: docRef.id,
          details: upgradeData,
        });
        toast.success('Upgrade registrado com sucesso!');
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/upgrades');
      }
    } catch (error) {
      console.error('Erro ao salvar upgrade:', error);
      toast.error('Erro ao salvar upgrade');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        data: Timestamp.fromDate(date)
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'meioContato':
        setFormData({ 
          ...formData, 
          meioContato: value as MeioContato,
          // Limpa o número de contato se for presencial
          numeroContato: value === 'presencial' ? '' : formData.numeroContato
        });
        break;
      case 'assinatura':
        setFormData({ ...formData, assinatura: value as TipoAssinatura });
        break;
      case 'tipoUpgrade':
        setFormData({ ...formData, tipoUpgrade: value as TipoUpgrade });
        break;
      default:
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Converte para caixa alta apenas campos de texto, exceto número de contato
    const upperValue = name === 'numeroContato' ? value : value.toUpperCase();
    setFormData({ ...formData, [name]: upperValue });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'upgrade' | 'roku') => {
    setActiveTab(newValue);
    // Atualiza o tipoUpgrade automaticamente quando muda para Roku
    if (newValue === 'roku') {
      setFormData({ ...formData, tipoUpgrade: TipoUpgrade.ATIVO, isRoku: true });
    } else {
      setFormData({ ...formData, isRoku: false });
    }
  };

  return (
    <Paper className="p-6">
      <Typography variant="h6" className="mb-4">
        {effectiveUpgradeId ? 'Editar Registro' : 'Novo Registro'}
      </Typography>

      {!effectiveUpgradeId && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="tabs de registro">
            <Tab label="Upgrade" value="upgrade" />
            <Tab label="Roku TV" value="roku" />
          </Tabs>
        </Box>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <DatePicker
              selected={formData.data ? (formData.data as any).toDate() : null}
              onChange={handleDateChange}
              locale={ptBR}
              dateFormat="dd/MM/yyyy"
              className="w-full p-2 border rounded"
              placeholderText="Selecione a data"
              maxDate={new Date()}
              required
              disabled={readOnly}
            />
          </div>

          <TextField
            label="Cliente"
            name="cliente"
            value={formData.cliente || ''}
            onChange={handleInputChange}
            required
            fullWidth
            error={!formData.cliente?.trim()}
            helperText={!formData.cliente?.trim() ? "Campo obrigatório" : ""}
            disabled={readOnly}
          />

          <FormControl fullWidth required error={!formData.meioContato}>
            <InputLabel>Meio de Contato</InputLabel>
            <Select
              name="meioContato"
              value={formData.meioContato || ''}
              onChange={handleSelectChange}
              label="Meio de Contato"
              required
              disabled={readOnly}
            >
              <MenuItem value="presencial">Presencial</MenuItem>
              <MenuItem value="ligacao">Ligação</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
            </Select>
          </FormControl>

          <InputMask
            mask="(99) 9 9999 9999"
            value={formData.numeroContato || ''}
            onChange={(e) => handleInputChange(e)}
            required={formData.meioContato !== 'presencial'}
            disabled={readOnly || formData.meioContato === 'presencial'}
          >
            {(inputProps: any) => (
              <TextField
                {...inputProps}
                label="Número de Contato"
                name="numeroContato"
                required={formData.meioContato !== 'presencial'}
                fullWidth
                placeholder="(00) 0 0000 0000"
                error={formData.meioContato !== 'presencial' && !formData.numeroContato?.trim()}
                helperText={
                  formData.meioContato === 'presencial' 
                    ? "Não necessário para contato presencial" 
                    : !formData.numeroContato?.trim() 
                      ? "Campo obrigatório" 
                      : ""
                }
              />
            )}
          </InputMask>

          {!formData.isRoku && (
            <FormControl fullWidth required error={!formData.assinatura}>
              <InputLabel>Assinatura</InputLabel>
              <Select
                name="assinatura"
                value={formData.assinatura || ''}
                onChange={handleSelectChange}
                label="Assinatura"
                required
                disabled={readOnly}
              >
                <MenuItem value="digital">Digital</MenuItem>
                <MenuItem value="fisica">Físico</MenuItem>
              </Select>
            </FormControl>
          )}

          {!formData.isRoku ? (
            <FormControl fullWidth required error={!formData.tipoUpgrade}>
              <InputLabel>Tipo</InputLabel>
              <Select
                name="tipoUpgrade"
                value={formData.tipoUpgrade || ''}
                onChange={handleSelectChange}
                label="Tipo"
                required
                disabled={readOnly}
              >
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="receptivo">Receptivo</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                name="tipoUpgrade"
                value="ativo"
                label="Tipo"
                disabled
              >
                <MenuItem value="ativo">Ativo</MenuItem>
              </Select>
            </FormControl>
          )}

          <TextField
            label="Observação"
            name="observacao"
            value={formData.observacao || ''}
            onChange={handleInputChange}
            multiline
            rows={4}
            fullWidth
            disabled={readOnly}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          {!readOnly && onCancel && (
            <Button
              variant="outlined"
              color="inherit"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          )}
          {!readOnly && (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : effectiveUpgradeId ? 'Atualizar' : 'Registrar'}
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default UpgradeForm; 