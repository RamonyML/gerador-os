import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from '@mui/material';
import { collection, query, orderBy, limit, getDocs, startAfter, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Log } from '../types';

const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadLogs = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      let q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'));

      if (!reset && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      q = query(q, limit(rowsPerPage));

      const querySnapshot = await getDocs(q);
      const newLogs = querySnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          timestamp: data?.timestamp ?? Timestamp.fromDate(new Date()),
          userEmail: data?.userEmail || '',
          userName: data?.userName || '',
          action: data?.action || '',
          targetCollection: data?.targetCollection,
          targetId: data?.targetId,
          details: data?.details,
        };
      }) as Log[];

      setLogs(prevLogs => reset ? newLogs : [...prevLogs, ...newLogs]);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast.error('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  }, [lastDoc, rowsPerPage]);

  useEffect(() => {
    if (!user || user.role !== 'supervisor') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    loadLogs(true);
  }, [loadLogs]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    if (newPage * rowsPerPage >= logs.length) {
      loadLogs();
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
    loadLogs(true);
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    return format(timestamp.toDate(), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-green-600';
      case 'update':
        return 'text-blue-600';
      case 'delete':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatAction = (action: string) => {
    switch (action) {
      case 'create':
        return 'Criação';
      case 'update':
        return 'Atualização';
      case 'delete':
        return 'Exclusão';
      default:
        return action;
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Logs do Sistema</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Voltar para Dashboard
        </button>
      </div>

      <Paper className="overflow-hidden">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data/Hora</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Ação</TableCell>
                <TableCell>Detalhes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log) => (
                <TableRow key={log.id} className="hover:bg-gray-50">
                  <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                  <TableCell>
                    <div>{log.userName}</div>
                    <div className="text-sm text-gray-500">{log.userEmail}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                      {formatAction(log.action)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-lg overflow-hidden text-ellipsis">
                      {log.targetCollection && (
                        <span className="font-medium">
                          Coleção: {log.targetCollection}
                          {log.targetId && ` | ID: ${log.targetId}`}
                        </span>
                      )}
                      {log.details && (
                        <pre className="mt-1 text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={logs.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>
    </div>
  );
};

export default LogViewer; 